'use strict';

var Router = require('koa-router');
var _ = require('lodash');
var co = require('co');
var slug = require('slug');

var router = new Router();
var Category = require('../models/category');
var Forum = require('../models/forum');
var User = require('../models/user');
var Topic = require('../models/topic');

router.get('list', '/admin/categories', function * (next) {
  var categories = yield co(function * () {
    return yield Category.find().populate('forum').exec();
  });

  yield this.render('categories/list', {
    categories
  });
});

router.get('new', '/admin/categories/new', function * (next) {
  var categories = yield co(function * () {
    return yield Category
      .find()
      .sort('position')
      .populate('moderators')
      .exec();
  });
  var moderators = yield co(function * () {
    return yield User
      .find({
        role: 'moderator'
      })
      .sort('username')
      .exec();
  });
  var noneModerators = moderators.length === 0 ? true : false;

  var accessArray = Category.accessEnum();
  var access = [];
  for (let a of accessArray) {
    access.push({
      name: a,
      selected: true
    });
  }

  var forums = yield co(function * () {
    return yield Forum.find().exec();
  });

  var category = {
    isVisible: true,
    position: categories.length + 1,
    moderators: moderators,
    access: access,
    noneModerators: noneModerators,
    forums
  };

  yield this.render('categories/new', {
    category
  });
});

router.post('/admin/categories/new', function * (next) {
  var ctx = this;
  var form = this.request.body;
  form.slug = slug(form.title, {
    lower: true
  });
  // unique slug
  var countSLug = yield co(function * () {
    return yield Category.count({
      slug: form.slug
    }).exec();
  });
  if (countSLug) {
    form.slug += Math.floor((Math.random() * 1000) + 1);
  }

  yield co(function * () {
    try {
      var category = new Category(form);
      yield category.save();
      var forum = yield Forum.findOne(category.forum).exec();

      // Forum.categories index
      yield forum.update({
        $push: {
          'categories': category.id
        }
      }, {
        safe: true,
        upsert: true
      }).exec();

      ctx.setFlash('success', 'Новая категория успешно создана.');
      ctx.redirect(router.url('list'));
    } catch (e) {
      ctx.setFlash('danger', ctx.getErrors(e));
      ctx.redirect(router.url('new'));
    }
  });
});

router.get('show', '/forums/:forumSlug/:categorySlug', function * (next) {
  var ctx = this;

  var forum = yield co(function * () {
    try {
      let forum = yield Forum.findOne({
        slug: ctx.params.forumSlug,
        isVisible: true
      }).exec();

      if (!forum) return ctx.throw(404);
      return forum;
    } catch (e) {
      return ctx.throw(404);
    }
  });

  var category = yield co(function * () {
    try {
      let category = yield Category.findOne({
        slug: ctx.params.categorySlug,
        isVisible: true
      }).populate('moderators').exec();
      if (!category) return ctx.throw(404);
      return category;
    } catch (e) {
      return ctx.throw(404);
    }
  });

  var topics = yield co(function * () {
    return yield Topic.find({category: category.id, isVisible: true}).exec();
  });

  yield this.render('categories/show', {
    category,
    topics
  });
});

router.get('edit', '/admin/categories/:id/edit', function * (next) {
  var category = this.category.toObject();

  var moderators = yield co(function * () {
    return yield User
      .find({
        role: 'moderator'
      })
      .sort('username')
      .exec();
  });

  // access
  var access = [];
  var accessArray = Category.accessEnum();
  for (let a of accessArray) {
    if (category.access.indexOf(a) !== -1) {
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
  category.access = access;

  // moderators
  category.noneModerators = moderators.length === 0 ? true : false;
  var selectedModerators = [];
  if (!category.noneModerators && category.moderators.length > 0) {
    for (let m of moderators) {
      var index = _.findIndex(category.moderators, function (chr) {
        return JSON.stringify(chr) === JSON.stringify(m.id);
      });

      if (index !== -1) {
        selectedModerators.push({
          id: m.id,
          username: m.username,
          selected: true
        });
      } else {
        selectedModerators.push({
          id: m.id,
          username: m.username,
          selected: false
        });
      }
    }

    category.moderators = selectedModerators;
  } else {
    category.moderators = moderators;
  }
  category.id = encodeURIComponent(category._id);

  // forums select
  var selectedForumId = category.forum;
  var forums = yield co(function * () {
    return yield Forum.find().sort('title').exec();
  });
  var selectForums = [];
  for (let f of forums) {
    if (f._id.equals(selectedForumId)) {
      selectForums.push({
        id: f.id,
        title: f.title,
        selected: true
      });
    } else {
      selectForums.push({
        id: f.id,
        title: f.title,
        selected: false
      });
    }
  }
  category.forums = selectForums;

  yield this.render('categories/edit', {
    category: category
  });
});

router.put('/admin/categories/:id/edit', function * (next) {
  var ctx = this;

  var updatedCategory = {};
  var forumId = ctx.category.forum;
  var form = this.request.body;

  if (ctx.category.title !== form.title) {
    updatedCategory.title = form.title;
  }
  if (ctx.category.slug !== form.slug) {
    updatedCategory.slug = form.slug;
  }


  updatedCategory.description = form.description;
  updatedCategory.position = form.position;
  updatedCategory.isVisible = form.isVisible;
  updatedCategory.access = form.access || [];
  updatedCategory.moderators = form.moderators || [];
  updatedCategory.forum = form.forum;
  updatedCategory.backgroundColor = form.backgroundColor;

  yield co(function * () {
    try {
      yield ctx.category.update(updatedCategory, {
        upsert: true
      }).exec();

      // Forum.categories index
      if (JSON.stringify(forumId) !== JSON.stringify(form.forum)) {
        yield Forum
          .findByIdAndUpdate(forumId, {
            $pullAll: {
              'categories': [ctx.category._id]
            }
          }, {
            safe: true,
            upsert: true
          })
          .exec();

        yield Forum
          .findByIdAndUpdate(form.forum, {
            $push: {
              'categories': ctx.category._id
            }
          }, {
            safe: true,
            upsert: true
          })
          .exec();
      }

      ctx.setFlash('success', 'Категория успешно обновлена.');
      ctx.redirect(router.url('list'));
    } catch (e) {
      ctx.setFlash('danger', ctx.getErrors(e));
      ctx.redirect(router.url('edit', ctx.category.id));
    }
  });
});

router.delete('delete', '/admin/categories/:id', function * (next) {
  var ctx = this;
  var id = ctx.category._id;
  yield co(function * () {
    try {
      yield ctx.category.remove();

      // Forum.categories. index
      yield Forum
        .findByIdAndUpdate(ctx.category.forum, {
          $pullAll: {
            'categories': [id]
          }
        }, {
          safe: true,
          upsert: true
        })
        .exec();

      ctx.setFlash('success', 'Категория успешно удалена.');
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
      var category = yield Category.findById(ctx.params.id).exec();
      if (!category) ctx.throw(404);
      ctx.category = category;
    } catch (e) {
      return ctx.throw(404);
    }
  });
  yield next;
});

module.exports = router;