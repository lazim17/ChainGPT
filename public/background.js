let latestTx = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received:", message.type);

  switch (message.type) {
    case "UNSIGNED_TX":
      latestTx = message.payload;

      chrome.storage.local.set({ latestUnsignedTx: message.payload }, () => {
        console.log("Transaction saved to storage");
      });

      try {
        chrome.runtime.sendMessage(message);
      } catch (e) {
        console.log("Popup not open to receive message");
      }
      break;

    case "GET_LATEST_TX":
      console.log("call recieved");
      sendResponse(latestTx);
      break;

    case "WALLET_CONNECTED":
      console.log("Wallet connected:", message.payload);
      break;
  }

  return true;
});
