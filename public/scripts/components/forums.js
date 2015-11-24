(function () {
  'use strict';

  $('#forums-access').multiselect({
    nonSelectedText: 'Выберите доступ',
    allSelectedText: 'Доступно всем'
  });

  $('.collapse.in').click(function () {
    console.log('click');
  });

  // свернуть и развернуть форумы
  $('.forums-fade').click(function () {
    var id = $(this).data("id");
    if ($(this).attr('src') === '/images/forums/fade/out.png') {
      $(this).attr('src', '/images/forums/fade/in.png');
    } else {
      $(this).attr('src', '/images/forums/fade/out.png');
    }
    // $('#' + id).slideToggle('fast');
    $('#' + id).fadeToggle(400);
  });

}());