'use strict';

var $ = require('jquery');

$(function() {
  $('.close-btn').bind('click', closeOpenModal);
  $('.splash-modal').bind('click', openModal);

  function closeOpenModal(e) {
    e.preventDefault();
    $('.splash-overlay:visible').hide();
  }

  function openModal(e) {
    e.preventDefault();
    closeOpenModal(e);

    /* jshint validthis:true */
    $($(this).data('target')).show();
  }
});
