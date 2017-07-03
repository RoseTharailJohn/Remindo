// popup.js
// js to register event for the popup ui elements
// Search the bookmarks when entering the search keyword.
$(function() {
	// on click listener for the set alarm button
  $('#alarmBtn').click(function() {
  	 // fetch the alarm time info
     var alarmTime =  parseInt($('input[type="radio"]:checked').val());
     // fetch the current tab url
     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
     	  var activeTab = tabs[0];
        // alert(tabUrl);
        // Send a message to the background about the click event
      	// chrome.runtime.sendMessage({"message": "RemindoBookmarkMe", "url": tabUrl, "alarmTime": val});
        
        // check if it has already been bookmarked
        var isAlreadyBookmarked = false;
        chrome.bookmarks.search({'url': activeTab.url}, function(bookmarksFound){
              if(bookmarksFound.length>0) {
                isAlreadyBookmarked = true;
              }
        });

        if(!isAlreadyBookmarked) {
        // bookmark the page
          chrome.bookmarks.getChildren('0', function(children) {
            for (var i = 0; i < children.length; i++) {
              var bookmark = children[i];
              // console.log(bookmark.title);
              if (bookmark.title == 'Bookmarks bar') {
                var bookmarksBar = bookmark;
                chrome.bookmarks.getChildren(bookmarksBar.id, function(children) {
                  var foundRemindoBookmarksFolder = false;
                  for (var j = 0; j < children.length; j++) {
                    var bookmarksBarChild = children[j];
                    if(bookmarksBarChild.title == 'Remindo bookmarks') {
                      console.log("Found remindo bookmarks to bookmark in!")
                      chrome.bookmarks.create(
                        {
                          'parentId': bookmarksBarChild.id/*Remindo bookmarks folder.id*/,
                          'title': activeTab.title,
                          'url': activeTab.url
                        },
                        function(newBookmark) {
                          console.log("Bookmarked the url: " + newBookmark.title + ", " + newBookmark.url);
                        });
                      break;
                    }
                  }
                });
                break;
              }
            }
          });
        }
        // set the reminder
        // setReminder(tabUrl, alarmTime);
        if(alarmTime!=0) {
          chrome.alarms.create("Remindo: "+activeTab.url +"Remindo: "+alarmTime, 
            {
              //'delayInMinutes': alarmTime
              'delayInMinutes': 0.1
            });
        }

        // store the alarm info
        // store url, delay

        // close the pop up
        // display a notification and close
        window.close();
    });
  });
});