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

/*exports.renameCategory = function(path, newName) {
	let newPath = exports.replaceNameAtPath(path, newName);
	return CategoryModel.findOne({ path: path })
		.populate('_parent')
		.then((category) => {
			let index = category._parent.childrenNames.indexOf(category.name);
			category._parent.childrenNames[index] = newName;

			category.name = newName;
			category.path = newPath;
			
			return category.save()
				.then(() => { console.log('saving parent'); category._parent.save(); }) 
				.then(() => exports.fixPathToChildren(path, newPath));
		});
}*/

// Note: you can not rename root category, `cause you can`t change usernam
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
			console.log('saving initial category with new name and path ...')
			return category.save()
		})
		.then(() => { 
			console.log('\nstarts working wit parent')
			return CategoryModel.findOne({ path: parentPath })
		})
		//.populate('childrenNames')
		.then((parent) => {
			let index = parent.childrenNames.indexOf(oldName);
			parent.childrenNames[index] = newName;
			console.log('parent childName: '); console.log(parent.childrenNames); console.log('')
			//console.log('full parent: '); console.log(parent);
			return parent.save();
			//return CategoryModel.update({ _id: parent._id }, { })
		})
		.then(() => {
			console.log('replacing old name: ' + path);
			console.log('with path: ' + newPath);
			return exports.fixPathToChildren(path, newPath);
		})
}

/*
 * Repalaces path to specified category with new source
 *
 * Example:
 *	if oldPath to /mongo/ is 'user1/programming/databases/mongo'
 *  end newPath is 'user2/cs/db/mongo' then the new path to it and all subcategories 
 *  should be 'user2/cs/db/mongo'
 *
 * @private
 */
exports.fixPathToChildren = function(oldPath, newPath) {
	console.log('starting to fix pathes')
	return CategoryModel.find({ path: { $regex: '\^' + oldPath } })
		.then((categories) => {
			/*console.log('all cats:'); console.log(categories)
			return categories.reduce((initial, category) => {
				console.log('category path: ' + category.path)
				console.log('old path: ' + oldPath);
				console.log('new path: ' + newPath);
				category.path.replace(new RegExp('^' + oldPath), newPath);
				return initial.then(() =>  { 
					console.log('fixing path, new obj is:') 
					console.log(category)
					category.save(); 
				});
			}, Promise.resolve());*/
			let promises = categories.map((category) => {
				console.log('category path: ' + category.path)
				console.log('old path: ' + oldPath);
				console.log('new path: ' + newPath);
				console.log('new path: ' + newPath);
				category.path = category.path.replace(new RegExp('^' + oldPath), newPath);
				console.log('new category path: ');
				console.log(category.path)
				console.log('fixing path, new obj is:') 
				console.log(category)
				return category.save(); 
			});
			return Promise.all(promises);
		});
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
	let pathWithRemovedLastSlash = path.slice(0, path.length - 1);
	let index = pathWithRemovedLastSlash.lastIndexOf('/');

	let newPath = pathWithRemovedLastSlash.slice(0, index + 1) + name + '/';

	return newPath;
}

exports.findAll = function() {
	return CategoryModel.find({});
}