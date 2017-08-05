'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;
const UserModel = require('../db').models.UserModel;

const categories = require('./category.js');

const util = require('./util');

function getArticle(path) {
  console.log('getting article for: ' + path)
  return ArticleModel.findOne({ path: path})
    .then((article) => {
      console.log(article);
      return article;
    })
}

/*
 * Create an article by specified path to parent category
 * and links `em together. 
 *
 * Example:
 *  createByPath({
 *    name: 'some title',
 *    body: 'some text here',
 *    path: 'root/parent/'
 *    tags: ['tag1', 'tag2']
 *  });
 *
 * @param {Object}
 * @return {Promise}
 * @public
 */
function createByPath(articleData) {
  console.log(articleData)
  let ownerName = util.getOwnerName(articleData.path);
  console.log('ownerName: ' + ownerName);
  return UserModel.findOne({ username: ownerName })
    .then((user) => {
      if(!articleData._createdBy) {
        articleData._createdBy = user._id;
      }
      console.log('owner: ');
      console.log(user);
      return Promise.resolve();
    })
    .then(() => {
      return CategoryModel.findOne( {path: articleData.path })
        .then((parent) => {
          console.log('parent path: ' + articleData.path)
          if (!parent) {
            console.log('no parent by path ' + articleData.path)
            throw new Error('Incorrect path');
          } else if (parent.articlesNames.indexOf(articleData.name) != -1) {
            console.log('article with this name exists')
            throw new Error('Article with such a name already exists there');
          }
          // how to catch error here!?
          let article = new ArticleModel({
            name: articleData.name,
            body: articleData.body,
            path: parent.path + articleData.name + '/',
            tags: articleData.tags,

            _parent: parent._id,
            _createdBy: articleData._createdBy
          });
          parent._articles.push(article);
          parent.articlesNames.push(article.name);
          console.log('article saving at db')
          console.log(article);
          return article.save().then(() => parent.save());
        });
    });
}

function deleteArticle(path) {
  const parentPath = util.getCategoryParentPath(path);
  const articleName = util.getArticleNameByPath(path);

  return CategoryModel.findOne({ path: parentPath })
    .then((parent) => {
      let index = parent.articlesNames.indexOf(articleName);
      let filterArticles = function(name, i) { return i != index; };
      //let filterArticles = function(name, i) { return name != articleName; };
      
      parent.articlesNames = parent.articlesNames.filter(filterArticles);
      console.log('article name: ' + articleName)
      console.log('index: ' + index)
      console.log('after filtering: ' + parent.articlesNames)
      console.log('initial: ' + parent.articlesNames.filter(filterArticles))
      parent._articles = parent._articles.filter(filterArticles);

      return parent.save();
    })
    .then(() => ArticleModel.remove({ path: path }) )
}

function rename(path, newName) {
  const parentPath = util.getCategoryParentPath(path);
  const oldName = util.getArticleNameByPath(path);

  return CategoryModel.findOne({ path: parentPath })
    .then((parent) => {
      let index = parent.articlesNames.indexOf(oldName);
      parent.articlesNames = parent.articlesNames.map((articleName, i) => {
        if (i === index)
          articleName = newName;
        return articleName;
      });

      return parent.save();
    })
    .then(() => ArticleModel.findOne({ path: path }) )
    .then((article) => {
      article.path = util.replaceArticleNameAtPath(article.path, newName);
      article.name = newName;
      return article.save();
    });
}

function updateBody(path, body) {
  return ArticleModel.findOne({ path: path })
    .then((article) => {
      article.body = body;
      
      return article.save();
    });
}

function removeTag(path, removebleTags) {
  return ArticleModel.findOne({ path: path })
    .then((article) => {
      article.tags = article.tags.filter((tag) => {
        return !removebleTags.contains(tag);
      });

      return article.save();
    });
}

function addTag(path, newTags) {
  return ArticleModel.findOne({ path: path })
    .then((article) => {
      article.tags = article.tags.concat(newTags);

      return article.save();
    })
}

function attachArticle(articlePath, to) {
  return ArticleModel.findOne({ path: articlePath })
    .then((article) => {
      article.path = to;

      return createByPath(article);
    })
    .then(()=> updateAttachedArticle(articlePath, to))
}

function updateAttachedArticle(from, to) {
  let newOwnerName = util.getOwnerName(to);
  let newOwner;

  return UserModel.findOne({ username: newOwnerName })
    .then((user) => { newOwner = user; })
    .then(() => ArticleModel.findOne({ path: from }))
    .then((initialArticle) => {
      initialArticle._usersAttached.push(newOwner);
      return initialArticle.save();
    });
}

function findAll() {
  return ArticleModel.find({});
}

module.exports = {
  getArticle: getArticle,
  createByPath: createByPath,
  rename: rename,
  deleteArticle: deleteArticle,
  updateBody: updateBody,
  removeTag: removeTag,
  addTag: addTag,
  attachArticle: attachArticle,
  updateAttachedArticle: updateAttachedArticle,
  findAll: findAll
};