'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config');
var jwt = require('jwt-simple');

var validator = require('../lib/helpers/validator');

var accountStatusEnum = ['active', 'deleted', 'banned'];
var roleEnum = ['member', 'moderator', 'admin'];
var backgroundColorEnum = [
  '#a3a948', '#edb92e', '#f85931', '#ce1836', '#009989',
  'rgb(206, 160, 229)', 'rgb(78, 137, 218)', 'rgb(149, 101, 209)',
  'rgb(68, 199, 207)', 'rgb(45, 140, 97)', 'rgb(90, 193, 105)',
  'rgb(126, 150, 179)', 'rgb(119, 119, 119)', 'rgb(178, 158, 140)'
];

function initRandBackgroundColor(backgroundColorEnum) {
  var randNum = parseInt(Math.random() * (backgroundColorEnum.length));
  return backgroundColorEnum[randNum];
}


var Schema = mongoose.Schema;

var schema = new Schema({
  // unique
  username: {
    type: String,
    required: 'Поле `имя пользователя` должно быть заполнено.',
    minlength: [2, 'Минимальная длина `имени пользователя` {MINLENGTH} символа.'],
    maxlength: [30, 'Максимальная длина `имени пользователя` {MAXLENGTH} символов.'],
  },
  token: String,
  local: {
    // unique
    email: {
      type: String,
      required: 'Поле `{PATH}` должно быть заполнено.',
    },
    password: {
      type: String,
      // select: false
      required: 'Поле `пароль` должно быть заполнено.',
      minlength: [4, 'Минимальная длина пароля {MINLENGTH} символа.']
    }
  },
  avatar: {
    type: String
  },
  accountStatus: {
    type: String,
    enum: accountStatusEnum,
    required: 'Пожалуйста, выбeрите статус аккаунта пользователя.',
    default: 'active'
  },
  backgroundColor: {
    type: String,
    default: initRandBackgroundColor(backgroundColorEnum)
  },
  caption: {
    type: String,
    minlength: [1, 'Минимальная длина `подписи` {MINLENGTH} символ.'],
    maxlength: [50, 'Максимальная длина `подписи` {MAXLENGTH} символов.'],
  },
  status: {
    type: String,
    minlength: [1, 'Минимальная длина `статуса` {MINLENGTH} символ.'],
    maxlength: [50, 'Максимальная длина `статуса` {MAXLENGTH} символов.'],
  },
  karma: {
    type: Number,
    default: 100
  },
  ip: {
    type: String
  },
  // facebook: {
  //   id: String,
  //   token: String,
  //   email: String
  // },
  // vkontakte: {
  //   id: String,
  //   token: String,
  //   email: String
  // },
  // google: {
  //   id: String,
  //   token: String,
  //   email: String
  // },
  steam: {
    id: String,
    openId: String,
  },
  role: {
    type: String,
    enum: roleEnum,
    default: 'member',
    required: 'Пожалуйста, выбeрите роль пользователя.',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // posts : [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});


schema.methods.toJSON = function () {
  var user = this.toObject();
  if (user.local) {
    delete user.local.password;
  }
  return user;
};

schema.statics.toJSON = function (usersArray) {
  var result = [];
  for (let user of usersArray) {
    if (user.local) {
      delete user.local.password;
    }
    result.push(user);
  }
  return result;
};

schema.statics.createToken = function (req, userId) {
  return jwt.encode({
    iss: req.hostname,
    sub: userId
  }, config.secret);
};

schema.methods.hashPassword = function (password) {
  return encryptPassword(password);
};

schema.methods.verifyPassword = function (password) {
  return this.local.password === encryptPassword(password);
};

function encryptPassword(password) {
  let hmac = crypto.createHmac('sha1', config.secret);
  return hmac.update(password).digest('hex');
}

var User = module.exports = mongoose.model('User', schema);

// Validation
User.schema.path('local.email').validate(function (value) {
  return validator.isEmail(value);
}, 'Поле `email` должно быть валидным.');

User.schema.path('local.email').validate(function (value, next) {
  var User = mongoose.model('User');
  User.find({
    'local.email': value.toLowerCase()
  }, function (err, user) {
    next(err || user.length === 0);
  });
}, 'Такой `email` уже занято.');

User.schema.path('username').validate(function (value, next) {
  var User = mongoose.model('User');
  User.find({
    'username': {
      $regex: new RegExp(value, 'i')
    }
  }, function (err, user) {
    next(err || user.length === 0);
  });
}, 'Такое `имя пользователя` уже занято.');