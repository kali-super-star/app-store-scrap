let scraping = 0;
let appData = [];
let counter = 0;
let interval;

const logTextArea = document.getElementById("log");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const downloadButton = document.getElementById("downloadButton");
const clearButton = document.getElementById("clearButton");
const searchTermInput = document.getElementById("searchTerm");
const countElement = document.getElementById("count");

chrome.runtime.connect({ name: "popup" });

startButton.addEventListener("click", function () {
  if(scraping === 0)
  {
    const searchTerm = searchTermInput.value.trim();
    if (searchTerm !== "") {
        scraping = 1;
        chrome.runtime.sendMessage({ action: "startScraping", searchTerm });
        logTextArea.value = (new Date()).toLocaleDateString('en-US') + ', ' + (new Date()).toLocaleTimeString('en-US') + " Loaded Search Term '" + searchTerm +"'\n" + logTextArea.value;
        updateUI(0);
        interval = setInterval(() => {
          counter++;
          showTime(counter);
        }, 1000);
    }
  } else if(scraping === 1) {
    const searchTerm = searchTermInput.value.trim();
    if (searchTerm !== "") {
        scraping = 2;
        chrome.runtime.sendMessage({ action: "pauseScraping", searchTerm });
        logTextArea.value = (new Date()).toLocaleDateString('en-US') + ', ' + (new Date()).toLocaleTimeString('en-US') + " Pause Search '" + searchTerm +"'\n" + logTextArea.value;
        updateUI(1);
        clearInterval(interval);
    }
  } else if (scraping === 2) {
    const searchTerm = searchTermInput.value.trim();
    if (searchTerm !== "") {
        scraping = 1;
        chrome.runtime.sendMessage({ action: "resumeScraping", searchTerm });
        logTextArea.value = (new Date()).toLocaleDateString('en-US') + ', ' + (new Date()).toLocaleTimeString('en-US') + " Resume Search '" + searchTerm +"'\n" + logTextArea.value;
        updateUI(0);
        interval = setInterval(() => {
          counter++;
          showTime(counter);
        }, 1000);
    }
  }
});

stopButton.addEventListener("click", function () {
    scraping = 0;
    chrome.runtime.sendMessage({ action: "stopScraping" });
    updateUI(2);
    clearInterval(interval);
});

function convertToCSV(array) {
  const header = Object.keys(array[0]).join(","); // Get the header row
  const rows = array.map(obj => Object.values(obj).join('","')); // Get the data rows
  return `${header}\n${rows.join('"\n"').replace('"').slice(0, -1)}`; // Combine the header and data rows
}

function downloadCSV(csv, filename) {
  const csvData = new Blob([csv], { type: "text/csv" }); // Create a Blob with the CSV data
  const csvUrl = URL.createObjectURL(csvData); // Create a URL for the Blob
  const link = document.createElement("a"); // Create a link element
  link.href = csvUrl; // Set the link's URL
  link.download = filename; // Set the download attribute with the desired filename
  link.click(); // Simulate a click on the link to trigger the download
}

downloadButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({action: 'getCSV'});
});

clearButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({ action: "clearCSV" });
});

function updateUI(scrapingInProgress) {
  switch (scrapingInProgress) {
    case 0:
      startButton.textContent = "Pause Scraping";
      downloadButton.disabled = true;
      searchTermInput.disabled = true;
      clearButton.disabled = true;
      break;
    case 1:
      startButton.textContent = "Resume Scraping";
      downloadButton.disabled = true;
      searchTermInput.disabled = true;
      clearButton.disabled = true;
      break;
    case 2:
      startButton.textContent = "Start Scraping";
      downloadButton.disabled = false;
      searchTermInput.disabled = false;
      clearButton.disabled = false;
      break;
    default:
      break;
  }
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "sendLog") {
    logTextArea.value = (new Date()).toLocaleDateString('en-US') + ', ' + (new Date()).toLocaleTimeString('en-US') + " Loaded app " + request.data.name + "\n" + logTextArea.value;
    countElement.textContent = request.count;
  } else if (request.action === "sendCSV") {
    const csv = convertToCSV(request.data);
    downloadCSV(csv, "app_data.csv");
  } else if (request.action === "sendHistory") {
    countElement.textContent = request.data.length;
    searchTermInput.value = request.searchTerm;
  }
});

function showTime(counter) {
  let seconds = 0;
  let minutes = 0;
  let hours = 0;
  seconds = counter % 60;
  minutes = (( counter - seconds ) / 60 ) % 60;
  hours = ( counter - seconds - minutes * 60 ) / 3600;
  const formattedTime = `${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
  document.getElementById('timer').textContent = formattedTime;
}