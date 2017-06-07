'use strict';

const UserModel = require('../db').models.UserModel;
const CategoryModel = require('../db').models.CategoryModel;

/*
 * Creates user by specified data fields
 *
 * Example:
 *	create({
 *		username: 'some_name',
 *		password: 'pas',
 *		email: 'mail@ya.ru',
 *		socialId: '111',
 *		avatar: '...'
 *	}).then(() => { do_soeth(); });
 */
exports.create = function(userData) {
	let user = new UserModel(userData);
	
	let dafaultRootCategory = new CategoryModel({ 
		name: '/',
		path: user.username + '/',
		_parent: null
	})

	user._root = dafaultRootCategory;

	return user.save().then(() => dafaultRootCategory.save() );
}

/*
 * Finds user by specified data fields
 *
 * Example:
 * 		findOne({ name: 'somename' }).then(() => { do_soeth(); });
 */
exports.findOne = function(data) {
	return UserModel.findOne(data);
}

exports.findAll = function() {
	return UserModel.find({});
}