'use strict';

var Router = require('koa-router');
var _ = require('lodash');
var co = require('co');
var slug = require('slug');

var router = new Router();
var Forum = require('../models/forum');
var User = require('../models/user');
var Category = require('../models/category');
// var policy = require('../middleware/policy');

router.get('list', '/admin/forums', function * (next) {
  var ctx = this;
  var forums = yield co(function * () {
    return yield Forum.find().exec();
  });

  yield this.render('forums/list', {forums});
});

router.get('index', '/forums', function * (next) {
  var ctx = this;
  yield co(function * () {
    try {
      var forums = yield Forum
        .find({
          isVisible: true
        })
        .sort('position')
        .populate('categories')
        .exec();

      forums = yield User.populate(forums, {path: 'categories.moderators'});

      yield ctx.render('forums/index', {
        forums
      });
    } catch (e) {
      console.log(e);
      ctx.throw(500);
    }
  });
});

router.get('new', '/admin/forums/new', function * (next) {
  var forums = yield co(function * () {
    return yield Forum
      .find()
      .sort('position')
      .populate('moderators')
      .exec();
  });

  var accessArray = Forum.accessEnum();
  var access = [];
  for (let a of accessArray) {
    access.push({
      name: a,
      selected: true
    });
  }

  var forum = {
    isVisible: true,
    position: forums.length + 1,
    access: access,
  };
  yield this.render('forums/new', {
    forum
  });
});

router.post('/admin/forums/new', function * (next) {
  var ctx = this;
  var form = this.request.body;
  form.slug = slug(form.title, {
    lower: true
  });
  // unique slug
  var countSLug = yield co(function * () {
    return yield Forum.count({
      slug: form.slug
    }).exec();
  });
  if (countSLug) {
    form.slug += Math.floor((Math.random() * 1000) + 1);
  }

  yield co(function * () {
    try {
      var forum = new Forum(form);
      yield forum.save();
      ctx.setFlash('success', 'Новый форум успешно создан.');
      ctx.redirect(router.url('list'));
    } catch (e) {
      ctx.setFlash('danger', ctx.getErrors(e));
      ctx.redirect(router.url('new'));
    }
  });
});

router.get('edit', '/admin/forums/:id/edit', function * (next) {
  var forum = this.forum.toObject();

  // access
  var access = [];
  var accessArray = Forum.accessEnum();
  for (let a of accessArray) {
    if (forum.access.indexOf(a) !== -1) {
      access.push({
        name: a,
        selected: true
      });
    } else {
      access.push({
        name: a,
        selected: false
      });

    }
  }
  forum.access = access;

  forum.id = encodeURIComponent(forum._id);

  yield this.render('forums/edit', {
    forum: forum
  });
});

router.put('/admin/forums/:id/edit', function * (next) {
  var ctx = this;

  var updatedForum = {};
  var form = this.request.body;
  if (ctx.forum.title !== form.title) {
    updatedForum.title = form.title;
  }
  if (ctx.forum.slug !== form.slug) {
    updatedForum.slug = form.slug;
  }
  updatedForum.description = form.description;
  updatedForum.position = form.position;
  updatedForum.isVisible = form.isVisible;
  updatedForum.access = form.access || [];

  yield co(function * () {
    try {
      yield ctx.forum.update(updatedForum, {
        upsert: true
      }).exec();
      ctx.setFlash('success', 'Форум успешно обновлен.');
      ctx.redirect(router.url('index'));
    } catch (e) {
      ctx.setFlash('danger', ctx.getErrors(e));
      ctx.redirect(router.url('edit', ctx.forum.id));
    }
  });
});

router.get('show', '/forums/:slug', function * (next) {
  var ctx = this;

  yield co(function * () {
    try {
      var forum = yield Forum.findOne({
        slug: ctx.params.slug
      }).populate('categories').exec();
      if (!forum) return ctx.throw(404);
      forum = yield User.populate(forum, {path: 'categories.moderators'});
      yield ctx.render('forums/show', {
        forum: forum
      });
    } catch (e) {
      return ctx.throw(404);
    }
  });
});

router.delete('delete', '/admin/forums/:id', function * (next) {
  var ctx = this;
  yield co(function * () {
    try {
      yield ctx.forum.remove();
      ctx.setFlash('success', 'Форум успешно удален.');
      ctx.redirect(router.url('list'));
    } catch (e) {
      ctx.throw(500);
    }
  });
});

router.param('id', function * (id, next) {
  var ctx = this;
  yield co(function * () {
    try {
      var forum = yield Forum.findById(ctx.params.id).exec();
      if (!forum) ctx.throw(404);
      ctx.forum = forum;
    } catch (e) {
      return ctx.throw(404);
    }
  });
  yield next;
});

module.exports = router;