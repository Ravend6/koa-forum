'use strict';

var _ = require('lodash');
var co = require('co');
var passport = require('koa-passport');
var SteamStrategy = require('passport-steam').Strategy;
var User = require('../../models/user');
var config = require('../../config');
var setNotify = require('../helpers/notify');
// var validator = require('../helpers/validator');

var init = function (req, identifier, profile, callback) {
  process.nextTick(function () {
    if (req.user) {
      User.findOne({
        'steam.openId': identifier
      }, function (err, data) {
        if (err) {
          return callback(err);
        }
        if (data) {
          req.flash = setNotify('danger', 'Такой steam аккаунт уже занят.');
          return callback(null, false);
        }
        // var user = new User();
        // user.token = User.createToken(req, user._id);
        // user.username = profile.username;
        // user.ip = req.ip;
        // user.steam.openId = identifier;
        // user.steam.id = profile.id;
        req.user.update({
          'steam.id': profile.id,
          'steam.openId': identifier
        }, function (err) {
          if (err) {
            throw err;
          }
          req.flash = setNotify('success', 'Вы успешно подключили steam аккаунт.');
          return callback(null, req.user);
        });

      });
    }
  });
};

passport.use(new SteamStrategy(config.steam, init));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = {
  login: passport.authenticate('steam', {
    scope: ['email']
  }),
  callback: passport.authenticate('steam', {
    successRedirect: '/profile',
    failureRedirect: '/profile'
  }),
  connect: passport.authorize('steam', {
    scope: ['email']
  }),
  connectCallback: passport.authorize('steam', {
    successRedirect: '/profile',
    failureRedirect: '/profile'
  }),
  disconnect: function () {
    return function * (next) {
      var ctx = this;
      yield co(function * () {
        try {
          yield ctx.req.user.update({
            steam: {}
          }).exec();
        } catch (e) {
          return ctx.throw(500, e);
        }
      });
      ctx.setFlash('success', 'Вы успешно отключили steam аккаунт.');
      ctx.redirect('/profile');
    };
  }
};