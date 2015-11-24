'use strict';

var passport = require('koa-passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/user');
var config = require('../../config');
var setNotify = require('../helpers/notify');
var validator = require('../helpers/validator');

var register = function (req, email, password, cb) {

  User.findOne({
    'local.email': email
  }, function (err, data) {
    if (err) {
      cb(err);
    }

    var user = new User();
    user.username = req.body.username;
    user.token = User.createToken(req, user._id);
    user.ip = req.ip;

    user.local.email = email;
    user.local.password = password;
    // user.local.password = user.hashPassword(password);
    user.save(function (err) {
      if (err) {
        req.flash = setNotify('danger', validator.getErrors(err));
        return cb(null, false);
      }
      user.update({
        'local.password': user.hashPassword(password)
      }, function (err) {
        if (err) {
          req.flash = setNotify('danger', validator.getErrors(err));
          return cb(null, false);
        }
        req.flash = setNotify('success', 'Вы успешно зарегистрировались.');
        return cb(null, user);
      });
    });

  });
};

var login = function (req, email, password, cb) {
  User.findOne({
    'local.email': email
  }, function (err, user) {
    if (err) {
      cb(err);
    }
    if (!user || !user.verifyPassword(password)) {
      req.flash = setNotify('danger', 'Неверный логин или пароль.');
      return cb(null, false);
    }
    req.flash = setNotify('success', 'Вы успешно вошли.');
    return cb(null, user);
  });
};

passport.use('local-register', new LocalStrategy(config.local, register));
passport.use('local-login', new LocalStrategy(config.local, login));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = {
  register: passport.authenticate('local-register', {
    successRedirect: '/',
    failureRedirect: '/register'
  }),
  connect: passport.authenticate('local-register', {
    successRedirect: '/profile',
    failureRedirect: '/auth/connect/local'
  }),
  login: passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login'
  }),
  disconnect: function (req, res, next) {

    var user = req.user;
    user.local = undefined;
    // user.local.email = undefined;
    // user.local.password = undefined;
    user.save(function (err, data) {
      if (err) {
        throw err;
      }
      if (!data.local.email && !data.facebook.id) {
        data.remove(function (err, deletedUser) {
          if (err) {
            throw err;
          }
          req.session.destroy();
        });
      }
    });
    next();
  }
};