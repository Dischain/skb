'use strict';

var app = require('express')();
var bodyParser  = require('body-parser');

let userRoutTest = require('./app/routes/users.js'),
    categoryRoutTest = require('./app/routes/category.js'),
    articleRout = require('./app/routes/article.js');

let port = 3000; //TEST

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', categoryRoutTest);
app.use('/', articleRout);

app.use(function(req, res, next) {
  res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

app.listen(port, () => console.log('server listening'));
//module.exports = app;