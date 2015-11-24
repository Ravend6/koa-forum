(function () {
  'use strict';

  $('.users-delete').on('click', function (e) {
    e.preventDefault();
    $.ajax({
      url: '/api/v1/users/' + $(this).data('id'),
      method: 'post',
      data: {
        _method: 'delete',
        _csrf: $(this).data('csrf')
      },
    }).done(function (data, status, req) {
      console.log(data);
    }).fail(function (err) {
      console.log(err);
    });
  });

  $('#load-token').on('click', function (e) {
    var token = $(this).data('token');
    $.ajax({
      url: '/api/v1/todos/token',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).done(function (data) {
      $('#token').text(data.data.token);
    });
  });

  // generate profile avatars
  $('.avatar').nameBadge({

    // boder options
    border: {
      color: '#ddd',
      width: 3
    },

    // an array of background colors.
    colors: [
      '#a3a948', '#edb92e', '#f85931', '#ce1836', '#009989',
      'rgb(206, 160, 229)', 'rgb(78, 137, 218)', 'rgb(149, 101, 209)',
      'rgb(68, 199, 207)', 'rgb(45, 140, 97)', 'rgb(90, 193, 105)',
      'rgb(126, 150, 179)', 'rgb(119, 119, 119)', 'rgb(178, 158, 140)'
    ],

    // text color
    text: '#fff',

    // avatar size
    size: 72,

    // avatar margin
    margin: 5,

    // disable middle name
    middlename: true,

    // force uppercase
    uppercase: false

  });




  // var socket = io('http://localhost:3000/users');

  // socket.on('connect', function () {
  //   console.log('connected users');
  // });

  // socket.on('disconnect', function () {
  //   console.log('disconnected');
  // });

  // socket.emit('ok', {
  //   message: 'OK'
  // });

  // socket.on('new', function (data) {
  //   console.log('new users', data);
  // });
}());