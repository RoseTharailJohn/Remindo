// content.js
/*chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      // This line is new!
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);*/

/*// Register a message listener from the alarm setter button
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if( request.message === "RemindoBookmarkMe" ) {
     	var url = request.url;
    	var alarmTime = request.alarmTime;
    	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    		var activeTab = tabs[0];
    		chrome.tabs.sendMessage(activeTab.id, {"message": "testAlert", "url":url, "alarmTime":alarmTime});
  		});
      }
    }
  );*/