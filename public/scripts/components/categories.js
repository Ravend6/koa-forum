(function () {
  'use strict';

  $('#categories-access').multiselect({
    nonSelectedText: 'Выберите доступ',
    allSelectedText: 'Доступно всем'
  });

  $('#categories-moderators').multiselect({
    nonSelectedText: 'Выберите модераторов',
    allSelectedText: 'Выбраны все модераторы'
  });

}());