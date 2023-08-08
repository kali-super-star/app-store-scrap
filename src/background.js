let appList = [];
let appDetailsList = [];
let scrapping = false;
let number = 0;
let searchTerm = '';
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "startScraping") {
    scrapping = true;
    searchTerm = request.searchTerm;
    appList = [];
    number = 0;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if(tabs[0])
        chrome.tabs.sendMessage(tabs[0].id, { action: "redirectHome" });
    });
  } else if (request.action === "readySearch") {
    if(scrapping)
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if(tabs[0])
          chrome.tabs.sendMessage(tabs[0].id, { action: "startScraping", searchTerm });
      });
  } else if (request.action === "stopScraping") {
    scrapping = false;
  } else if (request.action === "resumeScraping") {
    scrapping = true;
    if(appList[number] && scrapping)
    {
      redirectDetailUrl();
    }
  } else if (request.action === "pauseScraping") {
    scrapping = false;
  } else if (request.action === "sendAppList") {
    appList = request.data;
    if(appList[number] && scrapping)
    {
      redirectDetailUrl();
    }
  } else if (request.action === "sendItemDetail") {
    // If the object does not exist, add it to the array
    if(scrapping) 
    {
      await chrome.storage.local.get(["appData"]).then((result) => {
        appDetailsList = result.appData ? result.appData : [];
      });
      const exists = appDetailsList.some(item => item.id === request.data.id);
      if (!exists) {
        appDetailsList.push(request.data);
        appList = appList.concat(request.similarApps);
        chrome.runtime.sendMessage({ action: 'sendLog', data: request.data, count: appDetailsList.length });
      }
      await chrome.storage.local.set({appData: appDetailsList});
      number = number + 1;
      redirectDetailUrl();
    }
  } else if (request.action === "readyReadDetail") {
    getItemDetail();
  } else if (request.action === "clearCSV") {
    appDetailsList = [];
    await chrome.storage.local.set({appData: appDetailsList});
  } else if (request.action === "getCSV") {
    await chrome.storage.local.get(["appData"]).then((result) => {
      appDetailsList = result.appData ? result.appData : [];
    });
    chrome.runtime.sendMessage({action: 'sendCSV', data: appDetailsList});
  }
});

chrome.runtime.onConnect.addListener(async function(port) {
  if (port.name === "popup") {
      await chrome.storage.local.get(["appData"]).then((result) => {
        appDetailsList = result.appData ? result.appData : [];
      });
      chrome.runtime.sendMessage({action: "sendHistory", data: appDetailsList, searchTerm});
      port.onDisconnect.addListener(function() {
         scrapping = false;
      });
  }
});

function redirectDetailUrl() {
  if(appList[number] && appList.length > number ) {
    chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
      if(tabs[0])
      {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getItemDetail", url: appList[number].storeUrl });
      }
    });
  }
}

function getItemDetail() { 
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    if(tabs[0])
    {
      chrome.tabs.sendMessage(tabs[0].id, { action: "sendItemsDetail", data: appList[number]});
    }
  });
}