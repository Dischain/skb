'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;
const UserModel = require('../db').models.UserModel;

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
	let ownerName = util.getOwnerName(articleData.path);
	return UserModel.findOne({ username: ownerName })
		.then((user) => {
			if(!articleData._createdBy) {
				articleData._createdBy = user._id;
			}

			return Promise.resolve();
		})
		.then(() => {
			return CategoryModel.findOne( {path: articleData.path })
				.then((parent) => {
					if (!parent) {
						throw new Error('Incorrect path');
					} else if (parent.articlesNames.indexOf(articleData.name) != -1) {
						throw new Error('Article with such a name already exists there');
					}
					let article = new ArticleModel({
						name: articleData.name,
						body: articleData.body,
						path: parent.path + articleData.name,
						tags: articleData.tags,

						_parent: parent._id,
						_createdBy: articleData._createdBy
					});
					parent._articles.push(article);
					parent.articlesNames.push(article.name);
					return article.save().then(() => parent.save());
				});
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

exports.updateBody = function(path, body) {
	return ArticleModel.findOne({ path: path })
		.then((article) => {
			article.body = body;
			
			return article.save();
		});
}

exports.removeTag = function(path, removebleTag) {
	return ArticleModel.findOne({ path: path })
		.then((article) => {
			article.tags = article.tags.filter((tag) => {
				return tag != removebleTag;
			});

			return article.save();
		});
}

exports.addTag = function(path, newTag) {
	return ArticleModel.findOne({ path: path })
		.then((article) => {
			article.tags.push(newTag);

			return article.save();
		})
}

exports.attachArticle = function(articlePath, to) {
	return ArticleModel.findOne({ path: articlePath })
		.then((article) => {
			article.path = to;

			return exports.createByPath(article);
		})
}

exports.updateAttachedArticles = function(from, to) {
	let newOwnerName = util.getOwnerName(to);
	let newOwner;

	return UserModel.findOne({ username: newOwnerName })
		.then((user) => { newOwner = user; })
		.then(() => CategoryModel.getSubcategories(from))
		.then((subcategories) => {
			let initialArticles subcategories.articles.map((article) => {
				return ArticleModel.findOne({ path: article.path })
					.then((initialArticle) => {
						initialArticle._atachedBy.push(newOwner)

						return initialArticle.save();
					});
			});

			return Promise.all(initialArticles);
		});
}

exports.findAll = function() {
	return ArticleModel.find({});
}