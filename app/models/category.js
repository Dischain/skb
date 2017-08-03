'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;
const articles = require('./article.js');

const util = require('./util');

/*
 * Create a category by specified path to parent category
 * and links `em together.
 *
 * Example usage with minimum required data:
 *    create({
 *      name: 'somename',
 *      path: 'parentpath'
 *    })
 *
 * @param {Object}
 * @return {Promise}
 * @public
 */
function createByPath(catData) {
  if (catData.name.indexOf('/') != -1)
    throw new new Error('Category name can not contain "/"');
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

        //childrenNames: catData.childrenNames,
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
function deleteCategory(rootPath) {
  let categoryName = util.getCategoryNameByPath(rootPath);
  let parentpath = util.getCategoryParentPath(rootPath);

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
function getSubcategories(path) {
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
          body: article.body,
          tags: article.tags,

          ownerPath: article.path
        };
      });

      return subcategories;
    })
}

// Note: you can not rename root category, `cause you can`t change username.
function renameCategory(path, newName) {
  let newPath = util.replaceCategoryNameAtPath(path, newName);
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
      return fixPathToChildren(path, newPath);
    });
}

/*
 * Attach all subcategories and articles to specified folder.
 * This method not recursive, so it works only on one level down.
 *
 * Example:
 *  attachCategory('u2/Programming/dbs/redis/', 'u2/cs/db/')
 *  should create new category with path 'u2/cs/db/redis/'
 */
function attachCategory(from, to) {
  let pathToReplace = util.getCategoryParentPath(from);
  let attachableCategoryName = util.getCategoryNameByPath(from);
  return createByPath({ name: attachableCategoryName, path: to })
    .then(() => {
      return getSubcategories(from)
        .then((subcategories) => {
          let subcategories_copy = subcategories.categories.map((category) => {
            category.path = to + attachableCategoryName + '/';
            return createByPath(category);
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

function attachCategoryRecursively(from, to) {
  let pathToReplace = util.getCategoryParentPath(from);
  let attachableCategoryName = util.getCategoryNameByPath(from);

  return createByPath({ name: attachableCategoryName, path: to })
    .then(() => { 
      return CategoryModel.findOne({ path: from })
        .populate('_children')
        .then((parent) => {
          let subcategories_copy = parent._children.map((category) => {
            let oldPath = category.path;
            category.path = to + attachableCategoryName + '/';
            category._children = []; 
            category._articles = []; 
            category.childrenNames = [];
            
            return attachCategoryRecursively(from + category.name + '/',
                category.path);
          });

          return Promise.all(subcategories_copy);
        })
    })
    .then(() => {
      return getSubcategories(from)
        .then((subcategories) => {
          let articles_copy = subcategories.articles.map((article) => {
            let ownerArticlePath = article.ownerPath;
            article.path = to + attachableCategoryName + '/';
            return articles.createByPath(article)
              .then(() => articles.updateAttachedArticle(ownerArticlePath, to));
          });

          return Promise.all(articles_copy);
        });
    })
}

/*
 * Repalaces path to specified category and article with new source
 *
 * Example:
 *  if oldPath to /mongo/ is 'user1/programming/databases/mongo'
 *  end newPath is 'user2/cs/db/mongo' then the new path to it and all subcategories 
 *  should be 'user2/cs/db/mongo'
 *
 * @private
 */
function fixPathToChildren(oldPath, newPath) {
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
 * Count total subcategories at specified category
 */
function getSubcategoriesNum(path) {
  return CategoryModel.find({ path: { $regex: '\^' + path } })
    .then((categories) => categories.length);
}

/*
 * Count total articles attached at category
 */
function getTotalUsersAttached(path) {
  return ArticleModel.find({ path: { $regex: '\^' + path } })
    .then((articles) => {
      return articles.reduce((initial, article) => {
        return initial += article._usersAttached.length;
      }, 0);
    });
}

/*
 * Count total articles at category
 */
function getArticlesNum(path) {
  return ArticleModel.find({ path: { $regex: '\^' + path } })
    .then((articles) => { 
      console.log('articles.length ' + articles.length);
      return articles.length;
    });
}

function findAll() {
  return CategoryModel.find({});
}

module.exports = {
  createByPath: createByPath,
  getSubcategories: getSubcategories,
  deleteCategory: deleteCategory,
  renameCategory: renameCategory,
  
  // NOTE: Probably should be deprecated
  attachCategory: attachCategory,
  
  attachCategoryRecursively: attachCategoryRecursively,
  getSubcategoriesNum: getSubcategoriesNum,
  getTotalUsersAttached: getTotalUsersAttached,
  getArticlesNum: getArticlesNum,
  findAll: findAll
}