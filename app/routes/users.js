'use strict';

const express = require('express'),
    passport = require('passport');

const router  = express.Router();

const Users = require('../models/user.js');

//TODO: handle auth
router.get('/:username', (req, res) => {
  Users.getUserEntry({ username: req.params.username })
    .then((user) => { console.log(user); res.json(user) })
    .catch((err) => {
      res.status(412).json({msg: error.message});
    });
});

// Login
//curl -H "Content-Type: application/json" -X POST -d '{"password": "sanoman11", "username": "dischain0"}' 'localhost:3000/login'
router.post('/login', passport.authenticate('local', { 
  successRedirect: '/', 
  failureRedirect: '/login'
  //failureFlash: true
}));

// Register via username and password
// curl -H "Content-Type: application/json" -X POST -d '{"username": "dischain0", "password": "sanoman11", "email": "sano@yandex.ru"}' 'localhost:3000/register'
// curl 'localhost:3000/dischain1/'
router.post('/register', function(req, res) {

  var credentials = {
    'username': req.body.username, 
    'password': req.body.password,
    'email': req.body.email
    };
  console.log(credentials)
  // Валидация формы должна быть на клиенте
  // Check if the username already exists for non-social account
  Users.findOne({ username: { $regex: new RegExp('^' + credentials.username + '$', 'i')}, socialId: null })
  .then((user) => {
    console.log('user: ' + user)
    if(user){
      res.send({ message: 'Username already exists' });
      res.redirect('/register');
      res.end();
    } else {
      Users.create(credentials)
      then(() => {
        console.log('user created')
        //req.flash({ message: 'Your account has been created. Please log in' });
        res.redirect('/');
        res.end();
      })
      .catch((err) => {
        res.status(409);
        res.json({ msg: error.message });
        res.end();
      });
    }
  });
});

// Logout
router.get('/logout', function(req, res) {
  console.log('logout')
  req.logout();

  req.session = null;

  res.redirect('/');
  //res.end();
});

module.exports = router;