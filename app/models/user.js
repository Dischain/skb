'use strict';

const UserModel = require('../db').models.UserModel;
const CategoryModel = require('../db').models.CategoryModel;
const Categories = require('./category.js');

/*
 * Creates user by specified data fields
 *
 * Example:
 *  create({
 *    username: 'some_name',
 *    password: 'pas',
 *    email: 'mail@ya.ru',
 *    socialId: '111',
 *    avatar: '...'
 *  }).then(() => { do_soeth(); });
 */
exports.create = function(userData, cb) {
  let user = new UserModel(userData);
  
  let dafaultRootCategory = new CategoryModel({ 
    name: '/',
    path: user.username + '/',
    _parent: null
  })

  user._root = dafaultRootCategory;

  return user.save()
    .then(() => dafaultRootCategory.save() )
    //.then(() => cb())
}

/*
 * Finds user by specified data fields
 *
 * Example:
 *    findOne({ name: 'somename' }).then(() => { do_soeth(); });
 */
exports.findOne = function(data) {
  return UserModel.findOne(data);
}

/*
 * Returns user entry with user data and handy statistics
 */
exports.getUserEntry = function(data) {
  let tempUser;

  return exports.findOne(data)
    .populate('_root')
    .then((user) => {
      tempUser = user;

      return Categories.getSubcategories(user._root.path)
        .then((subcategories) => {
          let result = {};
          result.user = tempUser;
          result.subcats = subcategories;

          return result;
        });
    })
    /*.then((result) => {
      let statistics_p = result.subcats.categories.map((cat) => {
        return Categories.countSubcategories(cat.path);
      })
    })*/
}

exports.findAll = function() {
  return UserModel.find({});
}