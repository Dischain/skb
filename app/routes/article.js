'use strict';

const express = require('express'),
      
      Articles = require('../models/article.js'),
      Users = require('../models/user.js'),
      util = require('./rout_util.js'),      
      cache = require('../cache'),

      router  = express.Router();


router.get(/article/, (req, res) => {
  const path = util.getPathToArticle(req.url);

  cache.getValue(path)
    .then((val) => {
      if (val) {
        res.status(200);
        res.json({ article: article});
        res.end();
      } else {
        Articles.getArticle(path)
          .then((article) => {
            if (article) {
              
              cache.storeValue(path, article);
              res.status(200);
              res.json({ article: article});
              res.end();
            } else {
              res.status(404);              
              res.end();
            }
          })
          .cath((err) => {
            res.status(409);
            res.json({ msg: error.message });
            res.end();
          });
      }
    })

  /*Articles.getArticle(path)
    .then((article) => {
      res.status(200);
      res.json({ article: article});
      res.end();
    })*/
});

// curl -H "Content-Type: application/json" -X POST -d '{"name": "test w article", "body": "some interesting body"}' 'localhost:3000/article/u2/Programming'
// curl 'localhost:3000/cat/u2/Programming'
// curl 'localhost:3000/article/u2/Programming/test+w+article'
router.post(/article/, [Users.isAuthenticated, (req, res) => {
  const body = req.body.body,
        name = util.sanitizeName(req.body.name),
        tags = req.body.tags || [],

        path = util.getPathToArticle(req.url);

  Articles.createByPath({name, body, path, tags})
    .then(() => {
      res.status(201);
      res.end();
    })
    .catch((err) => {
      res.status(409);
      res.json({ msg: error.message });
      res.end();
    });
}]);

// curl -X DELETE 'localhost:3000/article/u2/Programming/test+w+article'
router.delete(/article/, (req, res) => {
  const path = util.getPathToArticle(req.url);

  Articles.deleteArticle(path)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(404);
      res.json({ msg: error.message });
    });
});

// curl -H "Content-Type: application/json" -X PUT -d '{"newName": "article", "newBody": "dasda body"}' 'localhost:3000/article/u2/Programming/test1+article'
router.put(/article/, (req, res) => {
  const path = util.getPathToArticle(req.url),
        newName = util.sanitizeName(req.body.newName),
        newBody = req.body.newBody,
        newTags = req.body.newTags,
        removableTags = req.body.removableTags;

  let updataArticleDataPromises = [];

  if (newName) {
    updataArticleDataPromises.push(Articles.rename(path, newName));
  }

  if (newBody) {
    updataArticleDataPromises.push(Articles.updateBody(path, newBody));
  }

  if (newTags) {
    updataArticleDataPromises.push(Articles.addTags(path, newTags));
  }

  if (removableTags) {
    updataArticleDataPromises.push(Articles.removeTags(path, removableTags));
  }

  Promise.all(updataArticleDataPromises)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(404);
      res.json({ msg: error.message });
    });
});

router.put(/attach_article/, (req, res) => {
  const from = req.body.from,
        to = req.body.to;

  Articles.attachArticle(from, to)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

router.put(/attach_category/, (req, res) => {
  const from = req.body.from,
        to = req.body.to;

  Categories.attachCategoryRecursively(from, to)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

module.exports = router;