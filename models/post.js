'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  body: {
    type: String,
    required: 'Поле `сообщение` должно быть заполнено.',
    minlength: [5, 'Минимальная длина `сообщения` {MINLENGTH} символов.'],
  },
  file: {
    type: String,
  },
  isVisible: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
});

var Post = module.exports = mongoose.model('Post', schema);