$(function(){
	var o_peepTube = new peepTube();
	// initialize the content modal
	console.log('initialize the modal')
	o_peepTube.initModal();
	var currentURL = '';

	// Listen the background script msg
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
		console.log('receive msg from background scripts');
		//prevent duplicate button append
		if(currentURL != msg.url){
			if(msg.url.indexOf('www.youtube.com/results') != -1){
				console.log('add btn on search result page');
				o_peepTube.appendBtn('search_results');
			}
			else if (msg.url.indexOf('www.youtube.com/watch') != -1){
				console.log('add btn on watch video page')
				o_peepTube.appendBtn('watch_video',msg.url);
			}
			else if(msg.url == 'http://www.youtube.com/' || msg.url == 'https://www.youtube.com/'){
				console.log('add btn on watch main page')
				o_peepTube.appendBtn('main_page');
			} 
			
			// Add "load modal" button event 
			$('.peepButton').on('click',function(){		
				var clickedBtn = this;
				o_peepTube.renderModal(clickedBtn);
			});			
		}
		currentURL = msg.url;
		init_peepStoryboard(currentURL);
	});	
});

// peepTube Class
function peepTube(){
	var peepTubeComponent = this;
	// Public methods	
	peepTubeComponent.appendBtn = function(page,url){
    	url = typeof url !== 'undefined' ? url : '';

		if (page == 'watch_video'){
			initYTShrink(url);
		}		
		else{
			//Add peep button
			$('.yt-lockup').each(function(idx,e){
				var currentDOM = e;
				var resultUrl = $(currentDOM).find('a').attr('href');
				//prevent duplicate button append (again)
				if(!$(currentDOM).prev().hasClass('peepButton')){
					if (resultUrl.indexOf('/watch?v=') != -1){
						$(currentDOM).wrap('<div class="peepRow"></div>');
						switch(page){
							case 'search_results':
								$(currentDOM).before( "<button class='peepButton peepBtn-results glyphicon glyphicon-eye-open btn btn-default'></button>" );
								break;
							case 'main_page':
								$(currentDOM).before( "<button class='peepButton peepBtn-main glyphicon glyphicon-eye-open btn btn-default'></button>" );
								break;
						}
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
		$('#peepContainer').append("<button id='peepClose-btn' class='glyphicon glyphicon-remove'></button>");
		// Add "close btn" event
		$('#peepClose-btn').on('click',function(){
				peepTubeComponent.closeModal();
			});
		//Create "redirect btn"
		$('#peepContainer').append("<button id='peepRedirect-btn' class='glyphicon glyphicon-plus'></button>");			
		$('#peepRedirect-btn').on('click',function(event){
				//peepTubeComponent.redirectPage();
				event.stopPropagation(); // prevent click #peepContainer to close modal
				peepTubeComponent.peepMode();
			});
		$('#content').before("<button id='peepShrinkBtn' class='glyphicon glyphicon-import btn btn-default'></button>");
	};

	peepTubeComponent.renderModal = function(clickedBtn){
		$('body').css({"overflow":'hidden'});
		var previewUrl = $(clickedBtn).next().eq(0).find('a').attr('href');
		var splitToken = '/watch?v=';
		var embedVideoID = previewUrl.split(splitToken)[1].replace('&list','?list');

		//console.log(previewUrl);
		var iframeObj = iframeObjGenerator(embedVideoID);
		initDefaultView(); // initialize the container css for modal
		$('#peepContainer').fadeIn(function(){
			$('#peepContainer').append(iframeObj);
		});	
		$('#peepShrinkBtn').fadeIn();
	};

	peepTubeComponent.peepMode = function(){
		$('body').css({"overflow":'hidden'});

		// Setting iframe position
		var topOffset = $(document).scrollTop() + 20; // add 20px top offset		
		var contentAreaWidth = $('body').width(); // Get content area width
		var baseWidth = 560.0;
		var baseHeight = 315.0;
		var ratio = (contentAreaWidth/baseWidth) * 0.65;
		var realWidth = baseWidth * ratio;
		var realHeight = baseHeight * ratio;		

		// destroy the drag event handler & initialize the container position
		$('.shrinkContainerView').draggable('destroy');
		$('#peepContainer').css({'top': '0px', 'left': '0px'})
						.find('iframe').attr({width: realWidth, height: realHeight})
										.css({top: topOffset, position:'absolute', right: '15%',left: ''});		

		// change class
		$('#peepContainer').removeClass('shrinkContainerView').addClass('defaultContainerView');
		
		// Show shrinkBtn					
		$('#peepShrinkBtn').fadeIn();
		// Add "shrink peep" button event
		$('#peepShrinkBtn').on('click',function(){
			peepTubeComponent.shinkPeepView();
		});		
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

	// no use anymore
	peepTubeComponent.redirectPage = function(){
		var videoID = $('#YTplayer').attr('src').split('/v/')[1].split('?')[0];
		peepTubeComponent.closeModal();
 		console.log(videoID);		
		window.location = 'http://www.youtube.com/watch?v=' + videoID;
	};

	// Private methods
	var iframeObjGenerator = function(embedVideoID, startTime){
    	startTime = typeof startTime !== 'undefined' ? startTime : 0;

		// Setting iframe position
		var topOffset = $(document).scrollTop() + 20; // add 20px top offset		
		var contentAreaWidth = $('body').width(); // Get content area width
		var baseWidth = 560.0;
		var baseHeight = 315.0;
		var ratio = (contentAreaWidth/baseWidth) * 0.65;
		var realWidth = baseWidth * ratio;
		var realHeight = baseHeight * ratio;

		var iframeObj = '<iframe id="YTplayer" width="' + realWidth + '" height="'+ realHeight + '" \
						style="top:' + topOffset + 'px; position: absolute; right: 15%;" \
						src="//www.youtube.com/v/' + embedVideoID + '?version=3&autoplay=1&start='+ startTime +'" frameborder="0" enablejsapi="1"></iframe>';
		//console.log(iframeObj);
		return iframeObj;
	};
	var initDefaultView = function(){
		// destroy the drag event handler & initialize the container position
		$('.shrinkContainerView').draggable('destroy');
		$('#peepContainer').css({'top': '0px', 'left': '0px'});		

		// change class
		$('#peepContainer').removeClass('shrinkContainerView').addClass('defaultContainerView')
							.find('iframe').remove();
		
		// Add "shrink peep" button event
		$('#peepShrinkBtn').on('click',function(){
			peepTubeComponent.shinkPeepView();
		});	
	};
	var initShrinkView = function(){
		$('#peepContainer').removeClass('defaultContainerView').addClass('shrinkContainerView');

		// Add "shrink peep" dragable event & setting the container position
		$('.shrinkContainerView').draggable();
		$('#peepContainer').css({'right': '20px', 'bottom': '0px', 'top': '', 'left': ''});		
	};

	//Pause the youtube video & render shrinked window start with pause time
	var initYTShrink = function(url){

		var videoID = url.split('v=')[1]; // Get the video ID
		console.log(videoID);
		//console.log(ytplayer);

		// video player is AS3 or AS2
		if($('#movie_player').is('embed')){
			var ytplayer = document.getElementById('movie_player');
			$('#watch7-user-header').append( "<button id='shrinkMovie-btn' class='glyphicon glyphicon-import btn btn-default'></button>" );
			$('#shrinkMovie-btn').on('click',function(){
				ytplayer.pauseVideo(); // Pause the video
				var pauseTime = ytplayer.getCurrentTime(); // Get the pause time
				pauseTime = Math.floor(pauseTime);
				console.log(ytplayer.getCurrentTime());

				var iframeObj = iframeObjGenerator(videoID, pauseTime);

				// Render the shrinked modal
				initShrinkView();
				$('#peepContainer').fadeIn(function(){
					$(this).find('iframe').remove();
					$(this).append(iframeObj).find('iframe').attr({width:'360px', height: '200px'})
						.css({top: '20px', left: '0px', 'position': 'absolute', 'z-index': '1000'});	
				});	
			});			
		}
		// video player is html5
		else{
			$('#watch7-user-header').append( "<button id='shrinkMovie-btn' class='glyphicon glyphicon-import btn btn-default'></button>" );
			$('#shrinkMovie-btn').on('click',function(){
				var ytplayer = $('#movie_player');
				var pauseTime = 0;
				if($(ytplayer).hasClass('playing-mode')){
					$(ytplayer).find('.ytp-button-pause').click(); // pause the video if playing
				}	
				var currentTime_tmp = $(ytplayer).find('.ytp-time-current').html();
				pauseTime = parseInt(currentTime_tmp.split(':')[0])*60 + parseInt(currentTime_tmp.split(':')[1])				
				console.log(pauseTime);
				
				var iframeObj = iframeObjGenerator(videoID,pauseTime);

				// Render the shrinked modal
				initShrinkView();
				$('#peepContainer').fadeIn(function(){
					$(this).find('iframe').remove();
					$(this).append(iframeObj).find('iframe').attr({width:'360px', height: '200px'})
						.css({top: '20px', left: '0px', 'position': 'absolute', 'z-index': '1000'});	
				});	
			});			
		}
	};
};

// Initialize function for peepStoryboard
function init_peepStoryboard(currentWebPage){
	// Create peepStoryboard Object
	var o_storyboard = new peepStoryboard();
	o_storyboard.currentWebPage = currentWebPage;
	// Storyboard for suggestion videos
	if(currentWebPage.indexOf('www.youtube.com/watch') != -1){
		o_storyboard.suggestionVideo = true;
		addListner_peepStoryboard('related-list-item', o_storyboard);
	}
	// Storyboard for main page & searching results
	else{
		o_storyboard.suggestionVideo = false;
		addListner_peepStoryboard('yt-lockup', o_storyboard);
	}
}

function addListner_peepStoryboard(targetClassName, o_storyboard){
	var prev_videoURL = NaN;
	$('.' + targetClassName).on('mouseover',function(){
		var $currentDOM = $(this);
		var videoURL = $currentDOM.find('a').attr('href');
		o_storyboard.$targetDOM = $currentDOM;

		// Doing ajax only when the mouseovering video is different than before		
		if(prev_videoURL != videoURL){
			o_storyboard.getInfo(videoURL);
		}
		prev_videoURL = videoURL;
	});

	// Playing storyboard frames
	$('.' + targetClassName).on('mousemove',function(e){
		o_storyboard.play(e);
	})

	// Stop playing storyboard when mouseout
	$('.' + targetClassName).on('mouseout',function(){
		var $currentDOM = $(this);
		o_storyboard.$targetDOM = $currentDOM;
		o_storyboard.end();
	});	
}

// peepStoryboard Class
function peepStoryboard(){
	var stbComponent = this;
	stbComponent.imgs = [];
	stbComponent.currentWebPage = NaN; // the current web url => to identify the rowWidth, init as NaN
	stbComponent.suggestionVideo = false; // Set as "true" if the current page has suggestion videos
	stbComponent.$targetDOM = NaN; // the mouseover ".yt-lockup" , init as NaN
	stbComponent.ajaxStatus = false; // set as true if doing ajax

	// Current DOM infomation, init as NaN
	var rowWidth = NaN;
	var thumbnailWidth = NaN;
	var thumbnailHeight = NaN;
	
	// Storyboard CSS, init as NaN
	var backgroundWidth = NaN;
	var backgroundHeight = NaN;
	var backgroundSize = NaN;
	var backgroundPosition = [];
	/*
	@ Get storyboard imgs (by ajax) & current DOM information (rowWidth, thumbnailWidth, etc.)
	*/
	stbComponent.getInfo = function(url){
		stbComponent.ajaxStatus = true;
		//Get storyboard imgs via ajax
		$.get(url,function(data){
			//console.log(data);
			var videoID = url.split('watch?v=')[1];			
			// If can't extract "sigh" => the video has no storyboard frames
			try{
				var sigh = data.split('storyboard_spec')[1].split(',')[0].split('|')[3].split('#M$M#')[1].replace(/"/g,'');
				// So far, fix the img number as 5
				for(i=0; i < 5; i++){
					stbComponent.imgs[i] = "//i1.ytimg.com/sb/" + videoID + "/storyboard3_L2/M" + i + ".jpg?sigh=" + sigh;
				}
				// Remove the unavailable img url
				for(i=0; i< 5; i++){
					$.ajax({
						url: stbComponent.imgs[i],
						type: 'HEAD',
						error: function(){
							var index = stbComponent.imgs.indexOf(this.url.split(':')[1]);
							if (index > -1)
 				    			stbComponent.imgs.splice(index, 1);
						}
					});
				}
			}
			catch(err){
				stbComponent.imgs = [];
			}
			
			// Ajax complete, set status as false
			stbComponent.ajaxStatus = false;
		});

		// Identify the available mouse playing area
		if(stbComponent.currentWebPage.indexOf('www.youtube.com/results') != -1)
			rowWidth = stbComponent.$targetDOM.width() - stbComponent.$targetDOM.prev().width();
		else
			rowWidth = stbComponent.$targetDOM.width();

		// Get the thumbnail size
		thumbnailWidth = stbComponent.$targetDOM.find('.yt-thumb-default').width();
		if(stbComponent.suggestionVideo == false)
			thumbnailHeight = stbComponent.$targetDOM.find('.yt-thumb-clip > img').height();
		else
			thumbnailHeight = stbComponent.$targetDOM.height();


		// Storyboard background CSS
		backgroundWidth = thumbnailWidth*5;
		backgroundHeight = thumbnailHeight*5;
		backgroundSize = backgroundWidth + 'px ' + backgroundHeight + 'px';
		for(i=0; i < 25; i++){
			var x_position = -((i%5)*thumbnailWidth);
			var y_position = -(parseInt(i/5)*thumbnailHeight);
			backgroundPosition[i] = x_position + 'px ' + y_position + 'px';
		}
	};

	/*
	@ Start playing storyboard frames
	@ Parameters: mouseEventObj => mouseover event object
				  rowWidth => The width of detectable row area(".yt-lockup" - "peepButton" )
	*/
	stbComponent.play = function(mouseEventObj){
		if((stbComponent.$targetDOM.prev().hasClass('peepButton') || stbComponent.suggestionVideo == true)
			&& stbComponent.imgs.length > 0 && stbComponent.ajaxStatus == false) {
			var mouseOffsetX = mouseEventObj.offsetX;
			var leftRatio = (mouseOffsetX*stbComponent.imgs.length)/rowWidth;
			var storyboardImg = stbComponent.imgs[Math.floor(leftRatio)];
			var positionIdx = Math.floor((leftRatio - Math.floor(leftRatio))*25);

			// Setting thumbnail CSS to show storyboard
			stbComponent.$targetDOM.find('.yt-thumb-default')
				.css({
					'width' : thumbnailWidth + 'px',
					'height': thumbnailHeight + 'px',
					'margin': '0px 1px',
					'background-size' : backgroundSize,
					'background-image': 'url(' + storyboardImg + ')',
					'background-position': backgroundPosition[positionIdx]
				});
			//Hide the original thumbnail image
			stbComponent.$targetDOM.find('.yt-thumb-clip').addClass('visibility-hidden');
		}
	};

	/*
	@ Set the css as the defult of Youtube (hide storyboard & show thumbnail)
	@ Trigger: mouseout on ".yt-lockup"
	*/
	stbComponent.end = function(){
		stbComponent.$targetDOM.find('.yt-thumb-clip').removeClass('visibility-hidden');
	}
}
