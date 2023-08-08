function getItemsList () {
    const appList = document.querySelectorAll('a[class="Si6A0c Gy4nib"]');
    const list = [];
    for(let i=0; i<appList.length; i++)
    {
        const app = appList[i];
        const appName = app.querySelector('span.DdYX5').textContent;
        const storeUrl = app.getAttribute('href');
        const appId = storeUrl.split('?id=')[1];
        const appDetail = {
            id: appId,
            name: appName,
            storeUrl: storeUrl
        }
        list.push(appDetail);
    }
    chrome.runtime.sendMessage({ action: "sendAppList", data: list});
}

if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", finishLoading());
  } else {
    // `DOMContentLoaded` has already fired
    finishLoading();
}
function finishLoading() {
    if(location.pathname === '/store/search')
        getItemsList();
}