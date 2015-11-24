'use strict';

var Router = require('koa-router');
var _ = require('lodash');
var co = require('co');
var slug = require('slug');
var nl2br  = require('nl2br');

var router = new Router();
var Category = require('../models/category');
var Forum = require('../models/forum');
var User = require('../models/user');
var Topic = require('../models/topic');

router.get('list', '/admin/topics', function * (next) {
  yield this.render('topics/list');
});

router.get('new', '/admin/topics/new', function * (next) {
  try {
    var categories = yield co(function * () {
      return yield Category.find().exec();
    });
    var topic = {
      categories,
      isVisible: true
    };
    yield this.render('topics/new', {
      topic
    });
  } catch (e) {
    this.throw(500);
  }
});

router.post('/admin/topics/new', function * (next) {
  var ctx = this;

  try {
    var form = this.request.body;
    form.slug = slug(form.title, {
      lower: true
    });

    var countSLug = yield co(function * () {
      return yield Topic.count({
        slug: form.slug
      }).exec();
    });
    if (countSLug) {
      form.slug += Math.floor((Math.random() * 1000) + 1);
    }

    form.author = ctx.req.user.id;
    form.isVisible = form.isVisible ? true : false;
    form.isSticky = form.isSticky ? true : false;
    form.isClosed = form.isClosed ? true : false;
    form.body = nl2br(form.body, false);

    var topic = new Topic(form);
    yield co(function * () {
      return yield topic.save();
    });

    ctx.setFlash('success', 'Новая тема успешно создана.');
    ctx.redirect(router.url('list'));

  } catch (e) {
    ctx.setFlash('danger', ctx.getErrors(e));
    ctx.redirect(router.url('new'));
  }
});

module.exports = router;