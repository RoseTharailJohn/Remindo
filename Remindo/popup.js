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
              if (bookmark.title == 'Bookmarks bar') {
                var bookmarksBar = bookmark;
                chrome.bookmarks.getChildren(bookmarksBar.id, function(children) {
                  var foundRemindoBookmarksFolder = false;
                  for (var j = 0; j < children.length; j++) {
                    var bookmarksBarChild = children[j];
                    if(bookmarksBarChild.title == 'Remindo bookmarks') {
                      chrome.bookmarks.create(
                        {
                          'parentId': bookmarksBarChild.id/*Remindo bookmarks folder.id*/,
                          'title': activeTab.title,
                          'url': activeTab.url
                        },
                        function(newBookmark) {
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
        if(alarmTime!=0) {
          chrome.alarms.create("Remindo: "+activeTab.url +"Remindo: "+alarmTime, 
            {
              //'delayInMinutes': alarmTime
              'delayInMinutes': 0.3
            });
        } else if(alarmTime==0) {
            chrome.storage.local.get(null, function(items) {
            var allKeys = Object.keys(items);
            var remindoUrls;
            // alert("Allkeys" + allKeys);
            if(allKeys.length!=0) {
              remindoUrls = items["Remindo"];
              // alert(remindoUrls[0]);
              if(remindoUrls) {
                remindoUrls.push(activeTab.url);
              } else {
                remindoUrls = [];
              }
            } else {
              items["Remindo"] = [activeTab.url];
            }
            // store along with the list of previous urls to be reminded about
            chrome.storage.local.set(items);
          });
        }

        // store the alarm info
        // store url, delay

        // display a notification and close the pop up
        chrome.notifications.create("Remindo successful", {
            type: 'basic',
            iconUrl: 'alarm.png',
            title: 'Remindo: Tab bookmarked and reminder is set!',
            priority: 0,
            requireInteraction: false,
            message: activeTab.url
          }, function(notificationId) {
            
        });
        window.close();
    });
  });
});