'use strict';

const UserModel = require('../db').models.UserModel;
const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;

/*Users*/
exports.deleteAllUsers = function() {
  return UserModel.remove({});
}

/*Categories*/
exports.deleteAllCategories = function() {
  return CategoryModel.remove({});
}

exports.deleteAllArticles = function() {
  return ArticleModel.remove({});
}

/*
 * Replaces the current name of category in the path to it with new name
 *
 * Example:
 *	if path to category is 'path/category/oldname/'
 *	end new name of category is 'some_new_name'
 *	then it returns 'path/category/some_new_name/'
 */
exports.replaceCategoryNameAtPath = function(path, name) {
	let newPath = exports.getCategoryParentPath(path) + name + '/';

	return newPath;
}

exports.replaceArticleNameAtPath = function(path, name) {
	console.log('exports.getArticleParentPath(path): ' + 
		exports.getArticleParentPath(path));
	let newPath = exports.getArticleParentPath(path) + name;
	return newPath;
}

/*
 * Returns path which should be replaced in oreder to remove category
 *
 * Example:
 *	path = 'user1/programming/databases/mongodb/'
 *  getPathToReplace(path) // -> outputs 'user1/programming/databases/''
 */
exports.getCategoryParentPath = function(path) {
	let pathWithRemovedLastSlash = path.slice(0, path.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let parentPath = pathWithRemovedLastSlash.slice(0, index + 1);

	return parentPath;
}

exports.getArticleParentPath = function(path) {
	let index = path.lastIndexOf('/');
	let articlePath = path.slice(0, index + 1);

	return articlePath;
}

exports.getCategoryNameByPath = function(path) {
	let pathWithRemovedLastSlash = path.slice(0, path.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let categoryName = pathWithRemovedLastSlash.slice(index + 1);

	return categoryName;
}

exports.getArticleNameByPath = function(path) {
	let index = path.lastIndexOf('/');
	let articleName = path.slice(index + 1);

	return articleName;
}

exports.getOwnerName = function(path) {
	let index = path.indexOf('/');
	let ownerName = path.slice(0, index);

	return ownerName;
}