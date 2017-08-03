'use strict';

const express = require('express'),
      
      Articles = require('../models/article.js'),
      util = require('./rout_util.js'),

      router  = express.Router();

router.get(/article/, (req, res) => {
  const path = util.getPathToCategory(req.url);

  
});