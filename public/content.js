const script = document.createElement("script");
script.src = chrome.runtime.getURL("injector.js");
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  const { type, payload } = event.data;

  if (!chrome.storage || !chrome.storage.local) {
    console.warn("chrome.storage.local not available!");
  }

  switch (type) {
    case "UNSIGNED_TX":
      console.log("[UNSIGNED_TX]:", payload);

      try {
        const json = JSON.stringify(payload);
        chrome.storage.local.set({ latestUnsignedTx: JSON.parse(json) }, () => {
          console.log("Unsigned TX saved to storage");
        });
      } catch (err) {
        console.error("Failed to serialize payload:", err, payload);
      }

      chrome.runtime.sendMessage({ type, payload });
      break;

    case "SIGNED_TX_RAW":
      console.log("[SIGNED_TX_RAW]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "WALLET_CONNECTED":
      console.log("[WALLET_CONNECTED]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_CONNECT":
      console.log("[CALLED_CONNECT]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_DISCONNECT":
      console.log("[CALLED_DISCONNECT]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_SIGN_ALL_TRANSACTIONS":
      console.log("[CALLED_SIGN_ALL_TRANSACTIONS]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_SIGN_AND_SEND_TRANSACTION":
      console.log("[CALLED_SIGN_AND_SEND_TRANSACTION]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_SIGN_AND_SEND_ALL_TRANSACTIONS":
      console.log("[CALLED_SIGN_AND_SEND_ALL_TRANSACTIONS]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_SIGN_MESSAGE":
      console.log("[CALLED_SIGN_MESSAGE]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    case "CALLED_REQUEST":
      console.log("[CALLED_REQUEST]:", payload);
      chrome.runtime.sendMessage({ type, payload });
      break;

    default:
      console.log("[UNKNOWN MESSAGE TYPE]:", type, payload);
      break;
  }
});
