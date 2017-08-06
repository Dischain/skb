'use strict';

const redis = require('redis'),
      config = require('../config');

const expiration = config.cache.expiration,
      port = config.redis.port,
      host = config.redis.host;

let cache = redis.createClient(port, host);

//Добавить логгирование
cache.on('error', (err) => console.log(err));

function storeValue(key, value) {
  console.log('storing val: ' + key);
  return getValue((result) => {
    if (!result) {
      // разве не асинхронная?
      // setex(key, value);
      return setex(key, value);
    } else {
      // cache.del(key);
      // cache.setex(key, expiration, value)
      return del(key);
    }
    // если cache.setex все таки синхронная
    //return Promise.resolve();
  })
}

function getValue(key) {
  console.log('getting val: ' + key);
  return new Promise((resolve, reject) => {
    cache.get(key, (err, result) => {
      if (err) {
        reject(err);
      }
      
      resolve(result);
    });
  });
}

function setex(key, val) {
  return new Promise((resolve, reject) => {
    cache.setex(key, expiration, val, (err, response) => {
      if (err) reject(err);
      resolve(response);
    })
  });
}

function del(key) {
  return new Promise((resolve, reject) => {
    cache.del(key, (err, response) => {
      if (err) reject(err);
      resolve(response);
    })
  });
}

module.exports = {
  storeValue: storeValue,
  getValue: getValue
};