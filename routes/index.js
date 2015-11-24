'use strict';

var Router = require('koa-router');
var router = new Router();
var authMdw = require('../middleware/auth');
var co = require('co');
var User = require('../models/user');
var policy = require('../middleware/policy');

router.get('index', '/', function * (next) {
  yield this.render('index');
});

router.get('admin', '/admin', function * (next) {
  yield this.render('admin');
});

router.get('todo', '/todo', function * (next) {
  yield this.render('todo');
});


router.get('profile', '/profile', authMdw.loggedIn(), function * (next) {
  yield this.render('profile', {
    user: this.req.user
  });
});



module.exports = router;

