chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getItemDetail") {
        location.assign(request.url);
    } else if (request.action === "sendItemsDetail") {
        getItemDetail(request.data);
    }
});
function getItemDetail(data) {
    const developerInfo = document.querySelector('div[id="developer-contacts"]').querySelectorAll('a.Si6A0c.RrSxVb');
    const itemDetail = {
        ...data,
        website: '',
        email: '',
        address: '',
        privacyPolicy: '',
        numberOfReviews: '',
        reviewRating: '',
        rateLevel: '',
        updatedOn: '',
        downLoads: '',
        note: '',
    };
    for(let i = 0; i < developerInfo.length; i++)
    {
        let title = developerInfo[i].querySelector('div.xFVDSb').textContent;
        let value = developerInfo[i].querySelector('div.pSEeg').textContent
        switch (title) {
            case 'Website':
                itemDetail.website = value;
                break;
        
            case 'Email':
                itemDetail.email = value;
                break;
                
            case 'Address':
                itemDetail.address = value;
                break;
                
            case 'Privacy policy':
                itemDetail.privacyPolicy = value;
                break;

            default:
                break;
        }
    }
    const rating = document.querySelector('div[itemprop="starRating"]');
    itemDetail.reviewRating = rating ? rating.querySelector('div[class="TT9eCd"]').textContent : '';
    itemDetail.numberOfReviews = rating ? rating.parentElement.nextElementSibling.textContent : '';
    const download = document.querySelectorAll('div[class="wVqUob"]');
    for (let i = 0; i < download.length; i++)
    {
        if(download[i].children[1])
            if(download[i].children[1].textContent === "Downloads")
                itemDetail.downLoads = download[i].children[0].textContent;
    }

    const contenRating = document.querySelector('span[itemprop="contentRating"]');
    itemDetail.rateLevel = contenRating ? contenRating.textContent : '';

    const updateOn = document.querySelector('div[class="xg1aie"]');
    itemDetail.updatedOn = updateOn ? updateOn.textContent : '';

    const note = document.querySelector('div[class="ulKokd"]');
    itemDetail.note = note ? note.textContent : '';

    const appList = document.querySelectorAll('a[class="Si6A0c nT2RTe"]');
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
    chrome.runtime.sendMessage({action:'sendItemDetail', data: itemDetail, similarApps: list});
}
if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", finishLoading());
  } else {
    // `DOMContentLoaded` has already fired
    finishLoading();
}
function finishLoading() {
    if(location.pathname === '/store/apps/details')
        chrome.runtime.sendMessage({action: "readyReadDetail"});
}