'use strict';

const express = require('express');
const router  = express.Router();

const Categories = require('../models/category.js');

const util = require('./rout_util.js');


// Get subcategories
router.get(/cat/, (req, res) => {
  let path = util.getPathToCategory(req.url),
      responseData = {};

  console.log('get cat by path: ' + util.getPathToCategory(req.url))
  Categories.getSubcategories(path)
    .then((subcategories) => {
      responseData.subcategories = subcategories;
    })
    .then(() => Categories.getSubcategoriesNum(path) )
    .then((subcategoriesNum) => {
      responseData.subcategoriesNum = subcategoriesNum;
    })
    .then(() => Categories.getTotalUsersAttached(path) )
    .then((articlesAttachedNum) => {
      responseData.articlesAttachedNum = articlesAttachedNum;
    })
    .then(() => Categories.getArticlesNum(path) )
    .then((articlesNum) => {
      responseData.articlesNum = articlesNum;
    })
    .then(subcategories => res.json(responseData))
    .catch(error => {
      res.status(404).json({msg: 'page not found'});
    });
});

// Create category
router.post(/cat/, (req, res) => {

  let name = util.sanitizePath(req.body.name);
  let path = util.getPathToCategory(req.url);
  console.log('path: ' + path);
  Categories.createByPath({ name, path })
    .then(() => { res.status(201); res.end(); })
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

// Update category name
router.put(/cat/, (req, res) => {
  let newName = util.sanitizePath(req.body.newName);
  let path = util.getPathToCategory(req.url);
  console.log('path: ' + path)
  console.log('newname: ' + newName)
  Categories.renameCategory(path, newName)
    .then(() => res.status(200))
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

// Delete category recursively
router.delete(/cat/, (req, res) => {
  let path = util.getPathToCategory(req.url);

  Categories.deleteCategory(path)
    .then(() => res.status(200))
    .catch((error) => {
      res.status(404);
      res.json({ msg: error.message });
    });
});

// Attach category recursively from path to another path
router.put(/attach/, (req, res) => {
  let from = req.body.from;
  let to = req.body.to;
  console.log('start attaching from ' + from
    + ' to ' + to)
  Categories.attachCategoryRecursively(from, to)
    .then(() => res.status(200))
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

module.exports = router;