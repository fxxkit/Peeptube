console.log('Here is background scripts');


chrome.webNavigation.onHistoryStateUpdated.addListener(function(e){
		var historyStateURL = e.url;
        console.log(e.url);
        
        var delayMsgPassHandler = _.bind(delayMsgPassing);
        _.delay(delayMsgPassHandler,3000,historyStateURL);            
    }, 
    {url: [{hostSuffix: 'www.youtube.com'}]}
);

function delayMsgPassing(url){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {url: url}, function(response) {
		  console.log('sending msg to content scripts via chrome.tabs');
		});
	});
}
