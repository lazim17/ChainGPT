import { useState, useEffect } from "react";
import "./App.css";
import { analyzeTransaction } from "./utils/unsignedtxparser";
import { explainTransactionWithClaude } from "./utils/claude";

function App() {
  const [transactionResults, setTransactionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [explanation, setExplanation] = useState(""); // Raw JSON string from Claude
  const [explaining, setExplaining] = useState(false);
  const [parsedExplanation, setParsedExplanation] = useState(null); // Parsed Claude response
  const [showTransactionDetails, setShowTransactionDetails] = useState(false); // For toggling transaction details visibility

  useEffect(() => {
    setLoading(true);

    chrome.runtime.sendMessage({ type: "GET_LATEST_TX" }, async (response) => {
      if (response) {
        setTransactionData(response);

        const analyzedtx = analyzeTransaction(response);
        setTransactionResults(analyzedtx);
        setLoading(false);

        setExplaining(true);
        explainTransactionWithClaude(analyzedtx)
          .then((result) => {
            setExplanation(result);
            try {
              setParsedExplanation(JSON.parse(result));
            } catch {
              setParsedExplanation(null);
            }
          })
          .catch((error) => {
            setExplanation("Error explaining the transaction.");
            setParsedExplanation(null);
            console.error("Error explaining transaction:", error);
          })
          .finally(() => {
            setExplaining(false);
          });
      } else {
        setLoading(false);
      }
    });

    const handleMessage = async (message) => {
      if (message.type === "UNSIGNED_TX") {
        const tx = message.payload;
        setTransactionData(tx);
        const analyzedtx = analyzeTransaction(tx);
        setTransactionResults(analyzedtx);

        setExplaining(true);
        explainTransactionWithClaude(analyzedtx)
          .then((result) => {
            setExplanation(result);
            try {
              setParsedExplanation(JSON.parse(result));
            } catch {
              setParsedExplanation(null);
            }
          })
          .catch((error) => {
            setExplanation("Error explaining the transaction.");
            setParsedExplanation(null);
            console.error("Error explaining transaction:", error);
          })
          .finally(() => {
            setExplaining(false);
          });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const downloadTransaction = () => {
    if (!transactionData) return;

    const blob = new Blob([JSON.stringify(transactionData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transaction_data.json";
    link.click();
  };

  const renderSafetyBanner = () => {
    if (!parsedExplanation) return null;
    const isSafe = parsedExplanation.safetyLevel === "safe";
    return (
      <div
        style={{
          backgroundColor: isSafe ? "#d1f7d6" : "#ffd6d6",
          color: isSafe ? "#0b8c2d" : "#b00020",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontWeight: "bold",
        }}
      >
        {isSafe
          ? "✅ This transaction looks SAFE to sign."
          : "⚠️ This transaction may be UNSAFE. Please review."}
      </div>
    );
  };

  const toggleTransactionDetails = () => {
    setShowTransactionDetails(!showTransactionDetails);
  };

  return (
    <>
      <h1>Solana Transaction Analyzer</h1>

      <div>
        <h2>Transaction Results</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <button onClick={toggleTransactionDetails}>
              {showTransactionDetails
                ? "👁️ Hide Transaction Details"
                : "👁️ Show Transaction Details"}
            </button>
            {showTransactionDetails && (
              <pre>{JSON.stringify(transactionResults, null, 2)}</pre>
            )}
          </>
        )}
      </div>

      <div>
        <h2>AI Explanation</h2>
        {explaining ? (
          <p>Explaining transaction with Claude...</p>
        ) : parsedExplanation ? (
          <>
            {renderSafetyBanner()}
            <p>
              <strong>Summary:</strong> {parsedExplanation.summary}
            </p>
            <p>
              <strong>Reason:</strong> {parsedExplanation.reasoning}
            </p>
          </>
        ) : explanation ? (
          <pre>{explanation}</pre>
        ) : (
          <p>No explanation available yet.</p>
        )}
      </div>

      {transactionData && (
        <div>
          <button onClick={downloadTransaction}>
            Download Transaction Data
          </button>
        </div>
      )}
    </>
  );
}

export default App;
