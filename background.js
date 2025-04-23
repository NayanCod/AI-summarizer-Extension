chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed and ready to use.");
  chrome.storage.sync.get(["geminiApiKey"], (data) => {
    if (!data.geminiApiKey) {
      console.log(
        "Gemini API key not set. Please set it in the extension options."
      );
      chrome.tabs.create({ url: "options.html" });
    }
  });
  chrome.storage.sync.set({"theme": "dark"});
});
