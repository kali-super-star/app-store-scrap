async function scrapeAppDetails(searchTerm) {
    const searchButton = document.querySelector('button[aria-label="Search"]');
    await searchButton.click();
    setTimeout(select, 2000, searchTerm);
}
async function select(searchTerm) {
    const searchInput = document.querySelector('input[aria-label="Search Google Play"]');
    searchInput.setAttribute('value', searchTerm);
    location.assign('https://play.google.com/store/search?q=' + searchTerm + '&c=apps');
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "startScraping") {
        scrapeAppDetails(request.searchTerm);
    } else if (request.action === "redirectHome") {
        location.assign('https://play.google.com/store/games?device=windows');
    }
});

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", finishLoading());
  } else {
    // `DOMContentLoaded` has already fired
    finishLoading();
}
function finishLoading() {
    if(location.pathname === '/store/games')
        chrome.runtime.sendMessage({action: "readySearch"});
}