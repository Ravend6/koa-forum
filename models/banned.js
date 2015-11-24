'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  timeStart: {
    type: Date,
    default: Date.now,
  },
  timeEnd: {
    type: Date
  },
});

var Banned = module.exports = mongoose.model('Banned', schema);