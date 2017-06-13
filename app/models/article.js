'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;

const util = require('../util');

/*
 * Create an article by specified path to parent category
 * and links `em together. 
 *
 * Example:
 *	createByPath({
 *		name: 'some title',
 *	 	body: 'some text here',
 *		path: 'root/parent/'
 *		tags: ['tag1', 'tag2']
 *	});
 *
 * @param {Object}
 * @return {Promise}
 * @public
 */
exports.createByPath = function(articleData) {
	return CategoryModel.findOne( {path: articleData.path })
		.then((parent) => {
			if (!parent) {
				throw new Error('Incorrect path');
			} else if (parent.articlesNames.indexOf(articleData.name) != -1) {
				throw new Error('Category with such a name already exists there');
			}
			let article = new ArticleModel({
				name: articleData.name,
				body: articleData.body,

				path: parent.path + articleData.name,

				tags: articleData.tags,

				_parent: parent._id
			});
			parent._articles.push(article);
			parent.articlesNames.push(article.name);
			return article.save().then(() => parent.save());
		});
}

exports.delete = function(path) {
	const parentPath = util.getCategoryParentPath(path);
	const articleName = util.getArticleNameByPath(path);

	return CategoryModel.findOne({ path: parentPath })
		.then((parent) => {
			let index = parent.articlesNames.indexOf(articleName);
			let filterArticles = function(articleName, i) { return i != index; };
			
			parent.articlesNames = parent.articlesNames.filter(filterArticles);
			parent._articles = parent._articles.filter(filterArticles);

			return parent.save();
		})
		.then(() => ArticleModel.remove({ path: path }) )
}

exports.rename = function(path, newName) {
	const parentPath = util.getCategoryParentPath(path);
	const oldName = util.getArticleNameByPath(path);

	return CategoryModel.findOne({ path: parentPath })
		.then((parent) => {
			let index = parent.articlesNames.indexOf(oldName);
			parent.articlesNames = parent.articlesNames.map((articleName, i) => {
				if (i === index)
					articleName = newName;
				return articleName;
			});

			return parent.save();
		})
		.then(() => ArticleModel.findOne({ path: path }) )
		.then((article) => {
			article.path = util.replaceArticleNameAtPath(article.path, newName);
			article.name = newName;
			return article.save();
		});
}

exports.findAll = function() {
	return ArticleModel.find({});
}