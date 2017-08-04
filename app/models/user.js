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
function create(userData) {
  console.log('start creating user')
  console.log(userData)
  let user = new UserModel(userData);
  
  var dafaultRootCategory = new CategoryModel({ 
    name: '/',
    path: user.username + '/',
    _parent: null
  })

  user._root = dafaultRootCategory;
  console.log(user)
  return user.save()
    //.then(() => console.log('user created'))
    .then(() => dafaultRootCategory.save() )
    .catch(console.log)
    //.then(() => console.log('user created'))
}

/*
 * Finds user by specified data fields
 *
 * Example:
 *    findOne({ name: 'somename' }).then(() => { do_soeth(); });
 */
function findOne(data) {
  return UserModel.findOne(data);
}

/*
 * Returns user entry with user data and handy statistics
 */
function getUserEntry(data) {
  let tempUser;

  return findOne(data)
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

function findAll() {
  return UserModel.find({});
}

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
    next();
  }else{
    res.redirect('/');
  }
}

module.exports = {
  findAll: findAll,
  isAuthenticated: isAuthenticated,
  getUserEntry: getUserEntry,
  findOne: findOne,
  create: create
}