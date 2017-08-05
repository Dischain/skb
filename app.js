'use strict';

const app = require('express')(),
      bodyParser  = require('body-parser'),
      passport = require('./app/auth');

const userRoutTest = require('./app/routes/users.js'),
      categoryRoutTest = require('./app/routes/category.js'),
      articleRout = require('./app/routes/article.js');      

let port = 3000; //TEST

process.on('error', console.log)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', categoryRoutTest);
app.use('/', articleRout);
app.use('/', userRoutTest);

app.use(function(req, res, next) {
  res.status(404).sendFile(process.cwd() + '/app/views/404.htm');
});

app.listen(port, () => console.log('server listening'));
//module.exports = app;

// register
// curl -H "Content-Type: application/json" -X POST -d '{"username": "dischain1", "password": "sanoman11", "email": "sano@yandex.ru"}' 'localhost:3000/register'
// login
// curl -H "Content-Type: application/json" -X POST -d '{"password": "sanoman11", "username": "dischain0"}' 'localhost:3000/login'
// create article
// curl -H "Content-Type: application/json" -X POST -d '{"name": "test d article", "body": "some interesting body"}' 'localhost:3000/article/dischain0/'