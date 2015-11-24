'use strict';


// var i18n = require('i18n');



class Config {

  constructor(env) {
    this.siteName = 'Zarnica';
    // this.domen = '89.252.49.108';
    this.domen = 'localhost';
    this.ips = [
      '::1',
      '::ffff:127.0.0.1',
      '::ffff:89.252.49.108', // Ravend
      '::ffff:46.30.160.216', // Олег
      '::ffff:195.162.91.70'  // Олег
    ];

    if (env !== 'production') {
      this.port = 3000;
      this.mongoUri = 'mongodb://localhost:27017/koa-zarnica';
      // this.mongoUser = '';
      // this.mongoPassword = '';
      this.secret = '635N0jt0trQAE2X22dwLGGq/ulm/lMK80uZaJBjG3Gk=';
    } else {
      this.port = 80;
      this.mongoUri = process.env.NODE_MONGO_URI;
      // this.mongoUser = process.env.NODE_MONGO_USER;
      // this.mongoPassword = process.env.NODE_MONGO_PASSWORD;
      this.secret = process.env.NODE_SECRET;
    }

    // this.mongoDatabase = 'koa-zarnica';

    this.cookieMaxAge = 30 * 24 * 3600 * 1000;

    this.local = {
      usernameField: 'email',
      passReqToCallback: true
    };

    this.facebook = {
      clientID: '136662053360360',
      clientSecret: 'e27d4ec7017cdcd8dfc97bf52d54a26c',
      callbackURL: `http://${this.domen}:${this.port}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'displayName', 'picture.type(large)'],
      passReqToCallback: true
    };

    this.vkontakte = {
      clientID: '5142901',
      clientSecret: 'iIB40Q0F4IMxZzTMLSZp',
      callbackURL: `http://${this.domen}:${this.port}/auth/vkontakte/callback`,
      // profileFields: ['id', 'emails', 'displayName', 'picture.type(large)'],
      passReqToCallback: true
    };

    this.google = {
      clientID: '463931604371-g3tpfua4ttehg80ovdi5crfavjkm1rip.apps.googleusercontent.com',
      clientSecret: 'RCKjjQWUCSx8MrP2MK5zkse3',
      callbackURL: `http://${this.domen}:${this.port}/auth/google/callback`,
      // profileFields: ['id', 'emails', 'displayName', 'picture.type(large)'],
      passReqToCallback: true
    };

    this.steam = {
      returnURL: `http://${this.domen}:${this.port}/auth/steam/callback`,
      realm: `http://${this.domen}:${this.port}/`,
      apiKey: 'CABDA4D4328586990D6F9A8302F2058B',
      passReqToCallback: true
    };

    this.uploadDir = 'public\\uploads';
    this.uploadPostThumbnailDir = this.uploadDir + '\\posts\\thumbnails';
  }

  // hbs(app) {
  //   i18n.configure({
  //     locales: ['en', 'de', 'ru'],
  //     defaultLocale: 'ru',
  //     directory: __dirname + '/locales',
  //     cookie: 'locale',
  //   });

  //   app.engine('hbs', hbs.express4({
  //     partialsDir: __dirname + '/views/_partials',
  //     defaultLayout: "views/layouts/main",
  //     layoutsDir: "views/layouts",
  //     i18n: i18n,
  //     onCompile: function (exhbs, source, filename) {
  //       var options;
  //       if (filename && filename.indexOf('partials') > -1) {
  //         options = { preventIndent: true };
  //       }
  //       return exhbs.handlebars.compile(source, options);
  //     }
  //   }));
  //   app.use(i18n.init);
  //   hbsHelpers(hbs);

  // }

}

module.exports = new Config(process.env.NODE_ENV);
