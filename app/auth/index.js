'use strict';

const passport = require('passport'),

    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user.js');

let init = function() {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({_id: id})
      .then((user) => done(err, user));
  });

  passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i')}, socialId: null })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        user.validatePassword(password)
          .then((isMatch) => {
            console.log(isMatch)
            isMatch ? 
              done(null, user) : 
              done(null, false, { message: 'Incorrect username or password'})
          })
          .catch(err => done(err))
      })
      .catch(err => done(err))
  }));

  return passport;
}

module.exports = init();