function events() {
	'use strict';
	$('.nav').find('li').click(function(){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
}


function onReady() {
	'use strict';
	events();
}



$(document).ready(onReady);