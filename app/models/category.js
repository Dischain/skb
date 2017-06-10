'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;
const articles = require('./article.js');

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

				childrenNames: catData.childrenNames,
				articleNames: catData.articleNames,				

				domainKnowledge: catData.domainKnowledge
			});
			parent._children.push(category);
			parent.childrenNames.push(category.name);
			return category.save().then(() => parent.save());
		});
}

/*
 * Delete specified category and all it subcategories recursively.
 *
 * @param {String} path
 * @return {Promise}
 * @public
 */
exports.deleteCategory = function(rootPath) {
	let categoryName = exports.getCategoryNameByPath(rootPath);
	let parentpath = exports.getParentPath(rootPath);

	return CategoryModel.findOne({ path: parentpath })
		.populate('_children')
		.then((parent) => {

			let filterChildrenIds = (child) => {
				return child.name != categoryName;
			}

			let filterChildrenNames = (child) => {
				return child != categoryName;
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
 * Get all categories and articles, nested to specified path not recursively.
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
			let subcategories = { categories: [], articles: [] };

			subcategories.categories = category._children.map((child) => {
				return {
					name: child.name,
					path: child.path
				};
			});

			subcategories.articles = category._articles.map((article) => {
				return {
					name: article.name,
					body: article.body
				};
			});

			return subcategories;
		})
}

// Note: you can not rename root category, `cause you can`t change username.
exports.renameCategory = function(path, newName) {
	let newPath = exports.replaceNameAtPath(path, newName);
	let parentPath, oldName;
	return CategoryModel.findOne({ path: path })
		.populate('_parent')
		.then((category) => {
			oldName = category.name;
			parentPath = category._parent.path;

			category.name = newName;
			category.path = newPath;
			return category.save()
		})
		.then(() => { 
			return CategoryModel.findOne({ path: parentPath })
		})
		.then((parent) => {
			let index = parent.childrenNames.indexOf(oldName);
			parent.childrenNames = parent.childrenNames.map((item, i) => {
				if (i === index)
					item = newName;
				return item;
			})
			return parent.save();
		})
		.then(() => {
			return exports.fixPathToChildren(path, newPath);
		});
}

/*
 * Attach all subcategories and articles to specified folder.
 * This method not recursive, so it works only on one level down.
 *
 * Example:
 * 	attachCategory('u2/Programming/dbs/redis/', 'u2/cs/db/')
 * 	should create new category with path 'u2/cs/db/redis/'
 */
exports.attachCategory = function(from, to) {
	let pathToReplace = exports.getParentPath(from);
	let attachableCategoryName = exports.getCategoryNameByPath(from);
	console.log(attachableCategoryName)
	return exports.createByPath({ name: attachableCategoryName, path: to })
		.then(() => {
			return exports.getSubctategories(from)
				.then((subcategories) => {
					let subcategories_copy = subcategories.categories.map((category) => {
						category.path = to + attachableCategoryName + '/';
						return exports.createByPath(to, category);
					});

					let articles_copy = subcategories.articles.map((article) => {
						article.path = to + attachableCategoryName + '/';
						return articles.createByPath(article);
					});

					return Promise.all(subcategories_copy)
						.then(() => Promise.all(articles_copy));
				});
		});
}

/*
 * Repalaces path to specified category and article with new source
 *
 * Example:
 *	if oldPath to /mongo/ is 'user1/programming/databases/mongo'
 *  end newPath is 'user2/cs/db/mongo' then the new path to it and all subcategories 
 *  should be 'user2/cs/db/mongo'
 *
 * @private
 */
exports.fixPathToChildren = function(oldPath, newPath) {
	return CategoryModel.find({ path: { $regex: '\^' + oldPath } })
		.then((categories) => {
			let categoryPromises = categories.map((category) => {
				category.path = category.path.replace(new RegExp('^' + oldPath), newPath);
				return category.save(); 
			});
			return Promise.all(categoryPromises);
		})
		.then(() => ArticleModel.find({ path: { $regex: '\^' + oldPath } }) )
		.then((articles) => {
			let articlePromises = articles.map((article) => {
				article.path = article.path.replace(new RegExp('^' + oldPath), newPath);
				return article.save();
			});
			return Promise.all(articlePromises);
		})
}

/*
 * Replaces the current name of category in the path to it with new name
 *
 * Example:
 *	if path to category is 'path/category/oldname/'
 *	end new name of category is 'some_new_name'
 *	then it returns 'path/category/some_new_name/'
 */
exports.replaceNameAtPath = function(path, name) {
	let newPath = exports.getParentPath(path) + name + '/';

	return newPath;
}

/*
 * Returns path which should be replaced in oreder to remove category
 *
 * Example:
 *	path = 'user1/programming/databases/mongodb/'
 *  getPathToReplace(path) // -> outputs 'user1/programming/databases/''
 */
exports.getParentPath = function(path) {
	let pathWithRemovedLastSlash = path.slice(0, path.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let parentPath = pathWithRemovedLastSlash.slice(0, index + 1);

	return parentPath;
}

exports.getCategoryNameByPath = function(path) {
	let pathWithRemovedLastSlash = path.slice(0, path.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let categoryName = pathWithRemovedLastSlash.slice(index + 1);

	return categoryName;
}

exports.findAll = function() {
	return CategoryModel.find({});
}