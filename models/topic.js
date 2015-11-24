'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: 'Поле `заглавие` должно быть заполнено.',
    minlength: [5, 'Минимальная длина `заглавия` {MINLENGTH} символов.'],
    maxlength: [60, 'Максимальная длина `заглавия` {MAXLENGTH} символов.'],
  },
  body: {
    type: String,
    required: 'Поле `сообщение` должно быть заполнено.',
    minlength: [5, 'Минимальная длина `сообщения` {MINLENGTH} символов.'],
  },
  slug: {
    type: String,
  },
  file: {
    type: String,
  },
  isVisible: {
    type: Boolean
  },
  isSticky: {
    type: Boolean
  },
  isClosed: {
    type: Boolean
  },
  views: {
    type: Number,
    default: 1
  },
  answer: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
});

var Topic = module.exports = mongoose.model('Topic', schema);