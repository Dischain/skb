'use strict';

const Mongoose = require('mongoose');

const config = require('../config');

var dbURI = "mongodb://" + 
            encodeURIComponent(config.db.username) + ":" + 
            encodeURIComponent(config.db.password) + "@" + 
            config.db.host + ":" + 
            config.db.port + "/" + 
            config.db.name;

Mongoose.connect(dbURI);

Mongoose.connection.on('error', function(err) {
  if(err) throw err;
});

Mongoose.Promise = global.Promise;

module.exports = {  
  models: {
    UserModel: require('./schemas/user.js'),
    CategoryModel: require('./schemas/category.js'),
    ArticleModel: require('./schemas/article.js')
  }
};