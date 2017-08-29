'use strict';

const CategoryModel = require('../db').models.CategoryModel;
const ArticleModel = require('../db').models.ArticleModel;
const UserModel = require('../db').models.UserModel;

const categories = require('./category.js');

const util = require('./util');

function getArticle(path) {

  return ArticleModel.findOne({ path: path})
    .then((article) => {
      return article;
    });
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
  let ownerName = util.getOwnerName(articleData.path);

  return UserModel.findOne({ username: ownerName })
    .then((user) => {
      if(!articleData._createdBy) {
        articleData._createdBy = user._id;
      }

      return Promise.resolve();
    })
    .then(() => {
      return CategoryModel.findOne( {path: articleData.path })
        .then((parent) => {
          if (!parent) {
            throw new Error('Incorrect path');
          } else if (parent.articlesNames.indexOf(articleData.name) != -1) {
            throw new Error('Article with such a name already exists there');
          }

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
      
      parent.articlesNames = parent.articlesNames.filter(filterArticles);
      parent._articles = parent._articles.filter(filterArticles);

      return parent.save();
    })
    .then(() => ArticleModel.remove({ path: path }) );
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

function removeTags(path, removebleTags) {
  return ArticleModel.findOne({ path: path })
    .then((article) => {
      article.tags = article.tags.filter((tag) => {
        return !removebleTags.contains(tag);
      });

      return article.save();
    });
}

function addTags(path, newTags) {
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
  removeTags: removeTags,
  addTags: addTags,
  attachArticle: attachArticle,
  updateAttachedArticle: updateAttachedArticle,
  findAll: findAll
};