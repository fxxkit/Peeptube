function events() {
	'use strict';

	$('.nav').find('li').click(function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});

	// use $nav to control $target
	var navs = $('.nav-wrap').find('nav');
	var target = $('.shot-wrap');
	navs.click(function(){
		var index = navs.index($(this)); // which one is clicked

		navs.removeClass('selected');
		$(this).addClass('selected');
		target.addClass('hide');
		target.eq(index).removeClass('hide');
	});


	// handle arrow event
	var arrow = $('.arrow');
	var max = navs.length;
	var ith;
	arrow.click(function(){

		var current = navs.index( $('nav.selected') );

		if( $(this).hasClass('arrow-left') ){ // -

			ith = current == 0 ? -1 : current - 1;

		}else if( $(this).hasClass('arrow-right') ){ // +

			ith = current == max ? -1 : current + 1;
		}else {
			return false;
		}
		if(ith >= 0){
			navs.eq(ith).click();	
		}
	});
}


function onReady() {
	'use strict';
	events();
}



$(document).ready(onReady);