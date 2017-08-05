'use strict';

const express = require('express'),
      
      Articles = require('../models/article.js'),
      Users = require('../models/user.js'),
      util = require('./rout_util.js'),

      router  = express.Router();


router.get(/article/, (req, res) => {
  console.log('ggg')
  const path = util.getPathToArticle(req.url);

  Articles.getArticle(path)
    .then((article) => {
      res.status(200);
      res.json({ article: article});
      res.end();
    })
});

// curl -H "Content-Type: application/json" -X POST -d '{"name": "test w article", "body": "some interesting body"}' 'localhost:3000/article/u2/Programming'
// curl 'localhost:3000/cat/u2/Programming'
// curl 'localhost:3000/article/u2/Programming/test+w+article'
router.post(/article/, [Users.isAuthenticated, (req, res) => {
  console.log('starting posting article')
  const body = req.body.body,
        name = util.sanitizeName(req.body.name),
        tags = req.body.tags || [],

        path = util.getPathToArticle(req.url);

  Articles.createByPath({name, body, path, tags})
    .then(() => {
      console.log('article posted')
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
        newBody = req.body.newBody;

  let updataArticleDataPromises = [];

  if (newName) {
    updataArticleDataPromises.push(Articles.rename(path, newName));
  }

  if (newBody) {
    updataArticleDataPromises.push(Articles.updateBody(path, newBody));
  }

  Promise.all(updataArticleDataPromises)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(404);
      res.json({ msg: error.message });
    });
});


module.exports = router;