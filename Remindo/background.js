// background.js
// execute this when extension is installed for the first time
chrome.runtime.onInstalled.addListener(function (details) {
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
              foundRemindoBookmarksFolder = true;
              break;
            }
          }
          if(foundRemindoBookmarksFolder!=true) {
            // create a Remindo specific bookmarks folder, if it does not exist already
            chrome.bookmarks.create({'parentId': bookmarksBar.id/*bookmarkBar.id*/,
              'title': 'Remindo bookmarks'},
              function(newFolder) {
                console.log("Added Remindo bookmarks folder: " + newFolder.title);
            });
          }
        });
        break;
      }
    }
  });
});


// on chrome start up fire notifications for pages that have to be reminded on start up
chrome.runtime.onStartup.addListener(function () {
  // this is used to check for bookmarks with on start up alarm times and open those urls
  chrome.storage.local.get(null, function(items) {
    var allKeys = Object.keys(items);
    var remindoUrls;
    // alert("Allkeys" + allKeys);
    if(allKeys.length!=0) {
      remindoUrls = items["Remindo"];
      alert(remindoUrls[0]);
      if(remindoUrls && remindoUrls.length>0) {
        for(var i=0;i<remindoUrls.length;i++) {
          // open a new tab for each of these urls
          chrome.tabs.create({"url": remindoUrls[i]});          
        }
        // finally send a notification that these were opened
        chrome.notifications.create(alarm.name, {
          type: 'basic',
          iconUrl: 'alarm.png',
          title: 'Remindo: You asked me to remind you of something.',
          priority: 1,
          requireInteraction: false,
          message: 'I have opened them for you in your current Google Chrome window!'
        }, function(notificationId) {});
        items["Remindo"] = [];
        // clear the urls from storage after their tabs have been open
        chrome.storage.local.set(items);
      }
    }
  });
});

// catch an alarm from the Remindo and send a notification when it is time
chrome.alarms.onAlarm.addListener(function(alarm) {
  if(alarm.name.startsWith("Remindo: ")) {
    var alarmDetails = alarm.name.split("Remindo: ");
    var bookmarkedUrl = alarmDetails[1];
    var alarmTime = alarmDetails[2];
    chrome.notifications.create(alarm.name, {
          type: 'basic',
          iconUrl: 'alarm.png',
          title: 'Remindo: Don\'t forget to checkout',
          priority: 1,
          requireInteraction: true,
          message: bookmarkedUrl,
          buttons: [{
            title: "Read now",
            iconUrl: "arrow.png"
          },
          {
            title: "Delete bookmark",
            iconUrl: "delete.png"
          }]
       }, function(notificationId) {});
  }
});

/* Respond to the user's clicking of the open url button */
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  var notificationIdDet = notificationId.split("Remindo: ");
  var urlToOpen = notificationIdDet[1];
  if(urlToOpen) {
    if(buttonIndex==0) { // if you want to read the url page
      if (notificationId.startsWith("Remindo: ")) {
        chrome.windows.getCurrent(function(currentWindow) {
          if (currentWindow != null) {
            chrome.tabs.query({'url':url, currentWindow: true}, function(tabs) {
              var isOpenFlag = false;
              for (var i=tabs.length-1; i>=0; i--) {
                if (tabs[i].url === urlToOpen) {
                  //tab is open in the window somewhere
                  isOpenFlag = true;
                  chrome.tabs.update(tabs[i].id, {active: true}); //focus it
                  break;
                }
              }
              if (!isOpenFlag) { //it didn't find the tab, so open a new tab with the url
                chrome.tabs.create({
                  'url': urlToOpen
                });
              }
            });
          } else { // there is no chrome running, so we should open a new window
            chrome.windows.create({
              'url': urlToOpen,
              'focused': true
            });
          }
        }); 
      }
    } else { // if you want to delete the bookmark
      chrome.bookmarks.search({'url': urlToOpen}, function(bookmarksFound) {
        if(bookmarksFound.length>0) {
          for(var i=0;i<bookmarksFound.length;i++) {
            chrome.bookmarks.remove(bookmarksFound[i].id);
          }
        }
      });
    }
  }
  // clear the notification
  chrome.notifications.clear(notificationId);
});