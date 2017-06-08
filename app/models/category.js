'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;

/*
 * Create a category by specified path to parent category
 * and links `em together.
 *
 * Example usage with minimum required data:
 * 		create({
 *			name: 'somename',
 *			path: 'parentpath'
 * 		})
 *
 * @param {Object}
 * @return {Promise}
 * @public
 */
exports.createByPath = function(catData) {
	return CategoryModel.findOne( {path: catData.path })
		.then((parent) => {
			if (!parent) {
				throw new Error('Incorrect path');
			} else if (parent.childrenNames.indexOf(catData.name) != -1) {
				throw new Error('Category with such a name already exists there');
			} 

			let category = new CategoryModel({
				name: catData.name,
				description: catData.description,

				path: parent.path + catData.name + '/',

				_parent: parent._id,

				domainKnowledge: catData.domainKnowledge
			});
			parent._children.push(category);
			parent.childrenNames.push(category.name);
			return category.save().then(() => parent.save());
		})
}

/*
 * Delete specified category and all it subcategories.
 *
 * @param {String} path
 * @return {Promise}
 * @public
 */
exports.deleteSubcategories = function(rootPath) {
	let pathWithRemovedLastSlash = rootPath.slice(0, rootPath.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let childName = pathWithRemovedLastSlash.slice(index + 1);
	let parentpath = pathWithRemovedLastSlash.slice(0, index + 1);

	return CategoryModel.findOne({ path: parentpath })
		.populate('_children')
		.then((parent) => {

			let filterChildrenIds = (child) => {
				return child.name != childName;
			}

			let filterChildrenNames = (child) => {
				return child != childName;
			}

			parent._children = parent._children.filter(filterChildrenIds);
			parent.childrenNames = parent.childrenNames.filter(filterChildrenNames);
			return parent.save();
		})
		.then(() => CategoryModel.find({ path: { $regex: '\^' + rootPath } }) )
		.then((categories) => {
			return categories.reduce((initial, category) => {
				
				return initial.then(() => {
					
					return category._articles.reduce((initial, articleId) => {
						return initial.then(() => ArticleModel.remove({ _id: articleId }))
					}, Promise.resolve())
					.then(() => CategoryModel.remove({ _id: category._id }))
				})
			}, Promise.resolve())
		})
}

/*
 * Get all categories and articles, nested to specified path
 *
 * @param {String} path
 * @return {Promise}
 * @public
 */
exports.getSubctategories = function(path) {
	return CategoryModel.findOne({ path: path })
		.populate('_children')
		.populate('_articles')
		.then((category) => {
			let subcategories = { categoies: [], articles: [] };

			subcategories.categoies = category._children.map((child) => {
				return {
					name: child.name,
					path: child.path
				};
			});

			subcategories.articles = category._articles.map((article) => {
				return {
					title: article.title,
					body: article.body
				};
			});

			return subcategories;
		})
}

exports.renameCategory = function(path, name) {
	return CategoryModel.findOne({ path: path })
		.populate('_parent')
		.populate('_articles')
		.then((category) => {
			// Find index of renamemable category from it parent children array
			// and rename it
			let index = category._parent.childrenNames.indexOf(category.name);
			category._parent.childrenNames[index] = name;

			return category._parent.save();
		})
}

exports.findAll = function() {
	return CategoryModel.find({});
}