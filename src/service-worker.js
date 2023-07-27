import { executeScript } from '$lib/add-script.ts';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log(JSON.stringify(tabId),JSON.stringify(changeInfo),JSON.stringify(tab));
  console.log(changeInfo?.status, tab?.url);
  if (changeInfo.status == "complete" && tab.url?.startsWith("https://letterboxd.com")) {
    executeScript(tabId);
  }
})