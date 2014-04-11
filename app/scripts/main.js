$(document).ready(onReady);


function onReady() {
	events();
}

function events() {
	$('.nav').find('li').click(function(e){
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
	});
}