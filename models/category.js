'use strict';

var mongoose = require('mongoose');
var slug = require('slug');
var co = require('co');

var Schema = mongoose.Schema;

var accessEnum = ['member', 'moderator', 'admin'];

var schema = new Schema({
  title: {
    type: String,
    required: "Поле `{PATH}` должно быть заполнено.",
    minlength: [1, "Минимальная длина `{PATH}` должна быть {MINLENGTH} символов."],
  },
  slug: {
    type: String,
  },
  description: {
    type: String
  },
  position: {
    type: Number,
    default: 1,
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: '#ff80ff'
  },
  access: {
    type: [{
      type: String,
      enum: accessEnum
    }],
    default: accessEnum,
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  forum: {type: Schema.Types.ObjectId, ref: 'Forum', required: "Поле `{PATH}` должно быть выбрано."},
});

schema.statics.accessEnum = function () {
  return accessEnum;
};

schema.pre('update', function (next) {
  this.options.runValidators = true;
  next();
});


var Category = module.exports = mongoose.model('Category', schema);

Category.schema.path('title').validate(function (value, next) {
  Category.count({
    title: value
  }, function (err, count) {
    if (err) {
      return next(err);
    }
    next(!count);
  });
}, 'Поле `заглавие` должно бить уникальным.');

Category.schema.path('slug').validate(function (value, next) {
  Category.count({
    slug: value
  }, function (err, count) {
    if (err) {
      return next(err);
    }
    next(!count);
  });
}, 'Поле `slug` должно бить уникальным.');
