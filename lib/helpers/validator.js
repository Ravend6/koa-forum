'use strict';

exports.isEmail = function (email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

exports.getErrors = function (err) {
  var messages = 'Ошибка валидации. ';
  for (let e in err.errors) {
    messages += err.errors[e].message + ' ';
  }
  return messages;
};