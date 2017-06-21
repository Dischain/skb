'use strict';

const express = require('express');
const router  = express.Router();

const Categories = require('../models/category.js');

//TODO: Add status codes

// Get subcategories
router.get('/cat/:categorypath', (req, res) => {
  Categories.getSubcategories(req.params.path)
    .then(subcategories => res.json(subcategories))
    .catch(error => {
      res.status(412).json({msg: error.message});
    });
});

// Create category
router.post('/cat/:categorypath', (req, res) => {
  let name = req.body.name;
  let path = req.params.parentPath;

  Categories.createByPath({ name, path })
    .then(() => res.status(/**/))
    .catch((error) => {

    });
});

// Update category name
router.put('/cat/:categorypath', (req, res) => {
  let path = req.params.path;
  let newName = req.body.newName;

  Categories.renameCategory(path, newName)
    .then(() => res.status(/**/))
    .catch((error) => {

    });
});

// Delete category recursively
router.delete('/cat/:categorypath', (req, res) => {
  let path = req.params.path;

  Categories.deleteCategory(path, newName)
    .then(() => res.status(/**/))
    .catch((error) => {

    });
});

// Attach category from path to another path
router.put('/cat', (req, res) => {
  let from = req.body.from;
  let to = req.body.to;

  Categories.attachCategoryRecursively(from, to)
    .then(() => res.status(/**/))
    .catch((error) => {

    });
});

module.exports = router;