// Listen the background script msg
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log('receive msg from background scripts');
	console.log(msg);
	if(msg.url.indexOf('www.youtube.com/results') != -1){
		init('search_results');		
	}
	else if(msg.url == 'http://www.youtube.com/'){
		init('main_page');		
	} 
});


function init(page){
	// Append the content modal

	var o_peepTube = new peepTube();
	// initialize the content modal
	o_peepTube.initModal();

	// Append preview buttons
	o_peepTube.appendBtn(page);

	// Add "load modal" button event 
	$('.peepButton').on('click',function(){		
		var clickedBtn = this;
		o_peepTube.renderModal(clickedBtn);
	});
}

// peepTube Class
function peepTube(){
	var peepTubeComponent = this;
	// Public methods	
	peepTubeComponent.appendBtn = function(page){
		//var resultUrl = $('.yt-lockup').find('a').attr('href');
		$('.yt-lockup').each(function(idx,e){
			var currentDOM = e;
			var resultUrl = $(currentDOM).find('a').attr('href');
			if (resultUrl.indexOf('/watch?v=') != -1){
				switch(page){
					case 'search_results':
						$(currentDOM).before( "<button class='peepButton peepBtn-results glyphicon glyphicon-eye-open btn btn-default'></button>" );
						break;
					case 'main_page':
						$(currentDOM).before( "<button class='peepButton peepBtn-main glyphicon glyphicon-eye-open btn btn-default'></button>" );
						break;	
				}
			}
		});
	};

	peepTubeComponent.initModal = function(){
		$('#content').before("<div id='peepContainer'></div>");
		$('#content').before("<button id='peepShrinkBtn' class='glyphicon glyphicon-import btn btn-default'></button>");

	};

	peepTubeComponent.renderModal = function(clickedBtn){
		$('body').css({"overflow":'hidden'});
		var previewUrl = $(clickedBtn).next().eq(0).find('a').attr('href');
		console.log(previewUrl);
		var iframeObj = iframeObjGenerator(previewUrl);
		initDefaultView(); // initialize the container css for modal
		$('#peepContainer').fadeIn(function(){
			$('#peepContainer').append("<button type='button' id='peepClose-btn' class='close' aria-hidden='true'>&times;</button>")
								.append(iframeObj);		
		});	
		$('#peepShrinkBtn').fadeIn();
	};

	peepTubeComponent.closeModal = function(){
		$('body').css({"overflow":'auto'});
		$('#peepContainer').fadeOut(function(){
			$('#peepContainer').empty();			
		});
		$('#peepShrinkBtn').fadeOut();
	};

	peepTubeComponent.shinkPeepView = function(){
		initShrinkView(); // initialize the container css for shink view
		$('#peepContainer').find('iframe').attr({width:'360px', height: '200px'})
						.css({top: '20px', left: '0px', 'position': 'absolute', 'z-index': '1000'});
		$('body').css({"overflow":'auto'});
		$('#peepShrinkBtn').fadeOut();

	};

	peepTubeComponent.dragPeepView = function(xPosition, yPosition){
		$('#peepContainer').css({'right': yPosition});
	};

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
	var initDefaultView = function(){
		// destroy the drag event handler & initialize the container position
		$('.shrinkContainerView').draggable('destroy');
		$('#peepContainer').css({'top': '0px', 'left': '0px'});		

		// change class
		$('#peepContainer').empty().removeClass('shrinkContainerView').addClass('defaultContainerView');
		// content modal close event (close the modal)
		$('#peepContainer').on('click',function(){
			if($(this).hasClass('defaultContainerView')){
				peepTubeComponent.closeModal();
			}		
		});

		// Add "shrink peep" button event
		$('#peepShrinkBtn').on('click',function(){
			peepTubeComponent.shinkPeepView();
		});	
	};
	var initShrinkView = function(){
		$('#peepContainer').removeClass('defaultContainerView').addClass('shrinkContainerView');
		
		// Add "close btn" event
		$('#peepClose-btn').bind('click',function(){
			peepTubeComponent.closeModal();
		});	
		
		// Add "shrink peep" dragable event & setting the container position
		$('.shrinkContainerView').draggable();
		$('#peepContainer').css({'right': '20px', 'bottom': '0px', 'top': '', 'left': ''});		
	};
}
