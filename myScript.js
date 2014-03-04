// Listen the background script msg
/*
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log('receive msg from background scripts');
	console.log(msg);
	if(msg.url.indexOf('www.youtube.com/results') != -1){
		init('search_results');		
	}
	else if (msg.url.indexOf('http://www.youtube.com/watch') != -1){
		init('watch_video');
	}
	else if(msg.url == 'http://www.youtube.com/'){
		init('main_page');		
	} 
});*/

$(function(){
	var o_peepTube = new peepTube();
	// initialize the content modal
	console.log('initialize the modal')
	o_peepTube.initModal();

	// Listen the background script msg
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
		console.log('receive msg from background scripts');
		console.log(msg);
		if(msg.url.indexOf('www.youtube.com/results') != -1){
			o_peepTube.appendBtn('search_results');
		}
		else if (msg.url.indexOf('http://www.youtube.com/watch') != -1){
			o_peepTube.appendBtn('watch_video');
		}
		else if(msg.url == 'http://www.youtube.com/'){
			o_peepTube.appendBtn('main_page');
		} 
		
		// Add "load modal" button event 
		$('.peepButton').on('click',function(){		
			var clickedBtn = this;
			o_peepTube.renderModal(clickedBtn);
		});
	});
});

function init(page){
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
		if (page == 'watch_video'){
			initYTShrink();
		}		
		else{
			//Add peep button
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
		}		
	};

	peepTubeComponent.initModal = function(){
		// Create "poopContainer"
		$('#content').before("<div id='peepContainer'></div>");
		// Add "close modal" event
		$('#peepContainer').on('click',function(){
			if($(this).hasClass('defaultContainerView')){
				peepTubeComponent.closeModal();
			}		
		});
		//Create "close btn"		
		$('#peepContainer').append("<button type='button' id='peepClose-btn' class='close' aria-hidden='true'>&times;</button>");
		// Add "close btn" event
		$('#peepClose-btn').on('click',function(){
				peepTubeComponent.closeModal();
			}); 		
		$('#content').before("<button id='peepShrinkBtn' class='glyphicon glyphicon-import btn btn-default'></button>");
	};

	peepTubeComponent.renderModal = function(clickedBtn){
		$('body').css({"overflow":'hidden'});
		var previewUrl = $(clickedBtn).next().eq(0).find('a').attr('href');
		var splitToken = '/watch?v=';
		var embedVideoID = previewUrl.split(splitToken)[1].replace('&list','?list');

		console.log(previewUrl);
		var iframeObj = iframeObjGenerator(embedVideoID);
		initDefaultView(); // initialize the container css for modal
		$('#peepContainer').fadeIn(function(){
			$('#peepContainer').append(iframeObj);
		});	
		$('#peepShrinkBtn').fadeIn();
	};

	peepTubeComponent.closeModal = function(){
		$('body').css({"overflow":'auto'});
		$('#peepContainer').fadeOut(function(){
			$('#peepContainer').find('iframe').remove();			
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
	var iframeObjGenerator = function(embedVideoID, startTime){
    	startTime = typeof startTime !== 'undefined' ? startTime : 0;

		// Setting iframe position
		var topOffset = $(document).scrollTop() + 20; // add 20px top offset		
		var contentAreaWidth = $('#content').width(); // Get content area width
		var baseWidth = 560.0;
		var baseHeight = 315.0;
		var ratio = (contentAreaWidth/baseWidth) * 0.8;
		var realWidth = baseWidth * ratio;
		var realHeight = baseHeight * ratio;

		var iframeObj = '<iframe id="YTplayer" width="' + realWidth + '" height="'+ realHeight + '" \
						style="top:' + topOffset + 'px; position: absolute; right: 15%;" \
						src="//www.youtube.com/embed/' + embedVideoID + '?enablejsapi=1&autoplay=1&start='+ startTime +'" frameborder="0"></iframe>';
		console.log(iframeObj);
		return iframeObj;
	};
	var initDefaultView = function(){
		// destroy the drag event handler & initialize the container position
		$('.shrinkContainerView').draggable('destroy');
		$('#peepContainer').css({'top': '0px', 'left': '0px'});		

		// change class
		$('#peepContainer').removeClass('shrinkContainerView').addClass('defaultContainerView')
							.find('iframe').remove();
		
		// Add "close btn" event
		/*
		$('#peepContainer').on('click',function(){
			if($(this).hasClass('defaultContainerView')){
				peepTubeComponent.closeModal();
			}		
		});*/

		// Add "shrink peep" button event
		$('#peepShrinkBtn').on('click',function(){
			peepTubeComponent.shinkPeepView();
		});	
	};
	var initShrinkView = function(){
		$('#peepContainer').removeClass('defaultContainerView').addClass('shrinkContainerView');
		/*
		// Add "close btn" event	
		$('#peepClose-btn').on('click',function(){
			peepTubeComponent.closeModal();
		});*/
		
		// Add "shrink peep" dragable event & setting the container position
		$('.shrinkContainerView').draggable();
		$('#peepContainer').css({'right': '20px', 'bottom': '0px', 'top': '', 'left': ''});		
	};

	//Pause the youtube video & render shrinked window start with pause time
	var initYTShrink = function(){
		$('#watch7-user-header').append( "<button id='shrinkMovie-btn' class=' glyphicon glyphicon-import btn btn-default'></button>" );

		console.log('Testing YT API!!');
		var ytplayer = document.getElementById("movie_player");
		$('#shrinkMovie-btn').on('click',function(){
			ytplayer.pauseVideo(); // Pause the video
			var pauseTime = ytplayer.getCurrentTime(); // Get the pause time
			pauseTime = Math.floor(pauseTime);
			var videoID = ytplayer.getVideoUrl().split('&v=')[1]; // Getting the video ID

			console.log(ytplayer.getCurrentTime());
			console.log(videoID);

			var iframeObj = iframeObjGenerator(videoID, pauseTime);

			// Render the shrinked modal
			initShrinkView();
			$('#peepContainer').fadeIn(function(){
				//$(this).find('iframe').remove();
				$(this).append(iframeObj).find('iframe').attr({width:'360px', height: '200px'})
					.css({top: '20px', left: '0px', 'position': 'absolute', 'z-index': '1000'});
				
				// Add "close btn" event
				/*
				$('#peepClose-btn').on('click',function(){
					peepTubeComponent.closeModal();
				});*/ 	
			});	
		});
	};
};