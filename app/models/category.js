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
			return /*Promise.resolve()*/parent.save(); //am i need to save it explicitly?
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

exports.findAll = function() {
	return CategoryModel.find({});
}