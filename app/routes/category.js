'use strict';

const express = require('express'),
      
      Categories = require('../models/category.js'),
      util = require('./rout_util.js'),

      router  = express.Router();

// Get subcategories
router.get(/cat/, (req, res) => {
  const path = util.getPathToCategory(req.url);
  let responseData = {};

  
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
    .then(subcategories => { 
      res.status(200);
      res.json(responseData);
    })
    .catch(error => {
      res.status(404).json({msg: 'page not found'});
    });
});

// Create category
router.post(/cat/, (req, res) => {

  const name = util.sanitizeName(req.body.name),
        path = util.getPathToCategory(req.url);
  
  Categories.createByPath({ name, path })
    .then(() => { res.status(201); res.end(); })
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

// Update category name
router.put(/cat/, (req, res) => {
  const newName = util.sanitizeName(req.body.newName),
        path = util.getPathToCategory(req.url);

  Categories.renameCategory(path, newName)
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {
      res.status(409);
      res.json({ msg: error.message });
    });
});

// Delete category recursively
router.delete(/cat/, (req, res) => {
  const path = util.getPathToCategory(req.url);

  Categories.deleteCategory(path)
    .then(() => { res.status(200); res.end() })
    .catch((error) => {
      res.status(404);
      res.json({ msg: error.message });
    });
});

// Attach category recursively from path to another path
router.put(/attach/, (req, res) => {
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