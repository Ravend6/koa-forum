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
  access: {
    type: [{
      type: String,
      enum: accessEnum
    }],
    default: accessEnum,
  },
  categories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
});

schema.statics.accessEnum = function () {
  return accessEnum;
};

// Math.floor((Math.random() * 1000) + 1);
// schema.pre('save', function (next) {
//   var ctx = this;
//   if (!ctx.slug) {
//     ctx.slug = slug(ctx.title, {
//       lower: true
//     });
//   }
//   next();
// });

schema.pre('update', function (next) {
  this.options.runValidators = true;
  next();
});

// schema.methods.toSlug = function (title) {
//   var todo = this.toObject();
//   if (todo.updatedAt) {
//     delete todo.done;
//   }
//   return slug(title, {
//     lower: true
//   });
// };

// schema.methods.toJSON = function () {
//   var todo = this.toObject();
//   if (todo.updatedAt) {
//     delete todo.done;
//   }
//   return todo;
// };

// schema.statics.toJSON = function (todoArray) {
//   var result = [];
//   for (let todo of todoArray) {
//     if (todo.updatedAt) {
//       delete todo.done;
//     }
//     result.push(todo);
//   }
//   return result;
// };


var Forum = module.exports = mongoose.model('Forum', schema);

Forum.schema.path('title').validate(function (value, next) {
  Forum.count({
    title: value
  }, function (err, count) {
    if (err) {
      return next(err);
    }
    next(!count);
  });
}, 'Поле `заглавие` должно бить уникальным.');

Forum.schema.path('slug').validate(function (value, next) {
  Forum.count({
    slug: value
  }, function (err, count) {
    if (err) {
      return next(err);
    }
    next(!count);
  });
}, 'Поле `slug` должно бить уникальным.');
