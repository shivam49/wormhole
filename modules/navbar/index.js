'use strict';

var $ = require('jquery');

$(function () {
  $('.show-login-overlay').click(function (e) {
    e.preventDefault();
    $('.top-login-overlay').fadeToggle();
  });

	$('img.svg2').each(function () {
		var $img = $(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');

		$.get(imgURL, function (data) {
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			// Add replaced image's ID to the new SVG
			if (typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if (typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass + ' replaced-svg');
			}
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			// Replace image with new SVG
			$img.replaceWith($svg);
		});
  });
  
  // Temporary function to display the search dropdown
  $('#masonry-search').on('click', function(){
    $('.search_results').fadeToggle();
    console.log('hovered hater');
  });

  // Timeline dropdown
  $('.dropdown-menu').on('click', function(){
    // Toggle on menu click
    $('.dropdown').fadeToggle();
   
    // Hide on mouseout
    $('.dropdown').mouseleave(function() {
      $('.dropdown').fadeOut();
    });
  });
  
  // Toggle the chat hater
  $('#chat-toggle').on('click', function(){
    $('.chat-window').fadeToggle();
  });
});

