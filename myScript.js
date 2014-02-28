$(document).ready(function(){
	console.log('You are in Youtube (document ready)');
	//alert("Hello dreamdu123111!");	
	init();
	console.log(chrome.webNavigation);
});


function init(){
	var o_peepTube = new peepTube();
	// Append the content modal
	$('#content').before("<div id='peepContainer'></div>");

	// Append preview buttons
	$( ".yt-lockup" ).before( "<button class='peepButton glyphicon glyphicon-eye-open btn btn-default'></button>" );

	// Add button event action (load the modal)
	$('.peepButton').on('click',function(){		
		var clickedBtn = this;
		o_peepTube.renderModal(clickedBtn);
	});

	// content modal close event (close the modal)
	$('#peepContainer').click(function(){
		o_peepTube.closeModal(this);
	});	
}

// peepTube Class
function peepTube(){
	var peepTubeComponent = this;
	// Public methods
	peepTubeComponent.renderModal = function(clickedBtn){
		$('body').css({"overflow":'hidden'});
		var previewUrl = $(clickedBtn).next().eq(0).find('a').attr('href');
		//console.log(previewUrl);
		var iframeObj = iframeObjGenerator(previewUrl);
										  
		$('#peepContainer').fadeIn(function(){
			$(this).empty().append(iframeObj);
		});		
	};

	peepTubeComponent.closeModal = function(modalDOM){
		$('body').css({"overflow":'auto'});
		$(modalDOM).empty().fadeOut();
	}
	// Private methods
	var iframeObjGenerator = function(previewUrl){
		/* ===== previewUrl variable types ======
		/watch?v=8PSvDdL2BPs 	
			<iframe width="560" height="315" src="//www.youtube.com/embed/3viG5ahiX1Q" frameborder="0" allowfullscreen></iframe>
		/watch?v=ivm6BkDmxRg&list=PL1BDC0510CF0F2E3D
			<iframe width="560" height="315" src="//www.youtube.com/embed/ivm6BkDmxRg?list=PL1BDC0510CF0F2E3D" frameborder="0" allowfullscreen></iframe> 
		/channel/UCrnX9veC-z_AErUn8D0GCkA
		## do not show button
		*/		
		if(previewUrl.indexOf('/channel/') != -1){
			console.log('This is channel url');
			return false;
		}
		else{
			// Get embed video url
			var splitToken = '/watch?v=';
			var embedVideoID = previewUrl.split(splitToken)[1].replace('&list','?list');
			console.log(embedVideoID);

			// Setting iframe position
			var topOffset = $(document).scrollTop() + 20; // add 20px top offset		
			
			var contentAreaWidth = $('#content').width(); // Get content area width

			var baseWidth = 560.0;
			var baseHeight = 315.0;
			var ratio = (contentAreaWidth/baseWidth) * 0.8;
			var realWidth = baseWidth * ratio;
			var realHeight = baseHeight * ratio;

			var iframeObj = '<iframe width="' + realWidth + '" height="'+ realHeight + '" \
							style="top:' + topOffset + 'px; position: absolute; left: 15%;" \
							src="//www.youtube.com/embed/' + embedVideoID + '" frameborder="0"></iframe>';
			return iframeObj;
		}
	};
}
