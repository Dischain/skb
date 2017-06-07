'use strict';

const CategoryModel = require('../db').models.CategoryModel;

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
			if (parent.childrenNames.indexOf(catData.name) != -1) {
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

exports.findAll = function() {
	return CategoryModel.find({});
}