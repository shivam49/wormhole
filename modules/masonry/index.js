'use strict';

var $        = require('jquery');
var freewall = require('freewall');

$(function() {
  var wall = new freewall("#freewall");
  wall.reset({
    selector:  '.brick',
    animate:   true,
    delay:     0,
    gutterY:   '.0',
    gutterX:   '.0',
    cellH:     'auto',
    onResize:  function() {
      wall.fitWidth();
    }
  });
  wall.fitWidth();
});
