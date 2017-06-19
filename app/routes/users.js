'use strict';

const express = require('express');
const router  = express.Router();

const Users = require('../models/user.js');

//TODO: handle auth
router.get('/:username', (req, res) => {
  Users.findOne({ username: req.params.username })
    .then((user) => res.json(user))
    .catch((err) => {
      res.status(412).json({msg: error.message});
    });
});

module.exports = router;