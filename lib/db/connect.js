'use strict';

var chalk = require('chalk');
var mongoose = require('mongoose');
var config = require('../../config');
// var debug = require('debug')('server:db');

function connect() {
  mongoose.connect(config.mongoUri);
  var db = mongoose.connection;
  // db.on('error', console.error.bind(console, 'Connection error:'));
  db.on('error', err => {
    console.error('Connection error:', err.message);
    db.close();
  });

  db.once('open', function (callback) {
    console.log(chalk.cyan.bold(`Success connect for MongoDB`));
  });

  return db;
}

module.exports = connect;