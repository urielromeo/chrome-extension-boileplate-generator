let url = `chrome-extension://${chrome.runtime.id}/create_extension.html`;
chrome.tabs.create({ url });    
window.close();