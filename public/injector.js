(function () {
  const waitForSolana = setInterval(() => {
    if (
      window.solana &&
      window.solana.signTransaction &&
      window.solana.connect
    ) {
      clearInterval(waitForSolana);

      console.log("window.solana available. Hooking methods...");

      const originalConnect = window.solana.connect;
      const originalDisconnect = window.solana.disconnect;
      const originalSignTransaction = window.solana.signTransaction;
      const originalSignAllTransactions = window.solana.signAllTransactions;
      const originalSignAndSendTransaction =
        window.solana.signAndSendTransaction;
      const originalSignAndSendAllTransactions =
        window.solana.signAndSendAllTransactions;
      const originalSignMessage = window.solana.signMessage;
      const originalRequest = window.solana.request;

      window.solana.connect = async function (opts) {
        const res = await originalConnect.call(this, opts);
        window.postMessage(
          { type: "CALLED_CONNECT", payload: res?.publicKey?.toString() },
          "*"
        );
        return res;
      };

      window.solana.disconnect = async function () {
        const res = await originalDisconnect.call(this);
        window.postMessage({ type: "CALLED_DISCONNECT", payload: true }, "*");
        return res;
      };

      window.solana.signTransaction = async function (tx) {
        try {
          console.log("📦 Posting UNSIGNED_TX");

          window.postMessage({ type: "UNSIGNED_TX", payload: tx }, "*");

          const signedTx = await originalSignTransaction.call(this, tx);
          console.log("📦 Posting SIGNED_TX_RAW");
          window.postMessage({ type: "SIGNED_TX_RAW", payload: signedTx }, "*");

          return signedTx;
        } catch (error) {
          console.error("Error in signTransaction:", error);
        }
      };

      window.solana.signAllTransactions = async function (txs) {
        const signed = await originalSignAllTransactions.call(this, txs);
        window.postMessage(
          { type: "CALLED_SIGN_ALL_TRANSACTIONS", payload: signed.length },
          "*"
        );
        return signed;
      };

      window.solana.signAndSendTransaction = async function (tx, opts = {}) {
        const res = await originalSignAndSendTransaction.call(this, tx, opts);
        try {
          const raw = tx.serialize().toString("base64");
          window.postMessage(
            { type: "CALLED_SIGN_AND_SEND_TRANSACTION", payload: raw },
            "*"
          );
        } catch (e) {
          console.error("serialize error:", e);
        }
        return res;
      };

      window.solana.signAndSendAllTransactions = async function (
        txs,
        opts = {}
      ) {
        const res = await originalSignAndSendAllTransactions.call(
          this,
          txs,
          opts
        );
        window.postMessage(
          {
            type: "CALLED_SIGN_AND_SEND_ALL_TRANSACTIONS",
            payload: txs.length,
          },
          "*"
        );
        return res;
      };

      window.solana.signMessage = async function (msg, encoding = "utf8") {
        const res = await originalSignMessage.call(this, msg, encoding);
        window.postMessage(
          { type: "CALLED_SIGN_MESSAGE", payload: { message: msg, encoding } },
          "*"
        );
        return res;
      };

      window.solana.request = async function ({ method, params }) {
        const res = await originalRequest.call(this, { method, params });
        window.postMessage(
          { type: "CALLED_REQUEST", payload: { method, params, result: res } },
          "*"
        );
        return res;
      };

      console.log("✅ Phantom hooks attached for all major methods");
    }
  }, 500);
})();
