'use strict';

const express = require('express');
const router  = express.Router();

const Categories = require('../models/category.js');

const util = require('./rout_util.js');

//TODO: Add status codes

// Get subcategories
router.get(/cat/, (req, res) => {
  console.log('get cat by path: ' + util.getPathToCategory(req.url))
  Categories.getSubcategories(util.getPathToCategory(req.url))
    .then(subcategories => res.json(subcategories))
    .catch(error => {
      res.status(404).json({msg: 'page not found'});
    });
});

// Create category
router.post(/cat/, (req, res) => {

  let name = req.body.name;
  let path = util.getPathToCategory(req.url);
  Categories.createByPath({ name, path })
    .then(() => { res.status(200); res.end(); })
    .catch((error) => {

    });
});

// Update category name
router.put(/cat/, (req, res) => {
  let newName = req.body.newName;
  let path = util.getPathToCategory(req.url);
  console.log('path: ' + path)
  console.log('newname: ' + newName)
  Categories.renameCategory(path, newName)
    .then(() => res.status(200))
    .catch((error) => {
      res.json({ msg: error.message });
    });
});

// Delete category recursively
router.delete(/cat/, (req, res) => {
  let path = util.getPathToCategory(req.url);

  Categories.deleteCategory(path)
    .then(() => res.status(200))
    .catch((error) => {

    });
});

// Attach category from path to another path
router.put('/cat/attach', (req, res) => {
  let from = req.body.from;
  let to = req.body.to;

  Categories.attachCategoryRecursively(from, to)
    .then(() => res.status(/**/))
    .catch((error) => {

    });
});

module.exports = router;