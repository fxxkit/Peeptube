console.log('Here is background scripts');
//onReferenceFragmentUpdated
//onHistoryStateUpdated

chrome.webNavigation.onHistoryStateUpdated.addListener(function(e){
		var historyStateURL = e.url;
        console.log(e.url);
        //var exeScript = _.bind(chrome.tabs.executeScript, chrome.tabs);
        //_.delay(exeScript, 2000, null, {file: "myScript.js"});

        var delayMsgPassHandler = _.bind(delayMsgPassing);
        _.delay(delayMsgPassHandler,2000,historyStateURL);
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
