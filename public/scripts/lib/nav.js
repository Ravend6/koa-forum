(function () {
  'use strict';

  var location = window.location.pathname;
  var a = $('.nav li a[href="' + location + '"]');
  if (!a.text()) {
    a = $('.nav li a[href="' + location.slice(0, location.length - 1) + '"]');
  }
  if (location === a.attr('href') || location === a.attr('href') + '/') {
    a.parent().addClass('active');
  }
  // console.log($('.nav li a[href="' + location + '"]').attr('href'));
  // $('.nav li a').on('click', function() {
  //   $(this).parent().parent().find('.active').removeClass('active');
  //   $(this).parent().addClass('active');
  // });
}());