import axios from "axios";
import trustedLists from "./trustedLists.json";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

function checkAgainstLists(transactionData) {
  console.log("Transaction data:", transactionData);
  if (!Array.isArray(transactionData)) {
    console.error("Transaction data is not an array.");
    return {
      trustedPrograms: [],
      untrustedPrograms: [],
      trustedAddresses: [],
      flaggedAddresses: [],
    };
  }

  const findings = {
    trustedPrograms: [],
    untrustedPrograms: [],
    trustedAddresses: [],
    flaggedAddresses: [],
  };

  transactionData.forEach((item) => {
    if (item.programPublicKey) {
      if (trustedLists.program && trustedLists.program[item.programPublicKey]) {
        findings.trustedPrograms.push({
          programId: item.programPublicKey,
          description: trustedLists.program[item.programPublicKey],
        });
      } else {
        findings.untrustedPrograms.push({
          programId: item.programPublicKey,
          description: "Unknown or unverified program",
        });
      }
    }

    if (item.sender) {
      if (trustedLists.address && trustedLists.address[item.sender]) {
        findings.trustedAddresses.push({
          address: item.sender,
          description: trustedLists.address[item.sender],
        });
      }
      if (trustedLists.hackers && trustedLists.hackers[item.sender]) {
        findings.flaggedAddresses.push({
          address: item.sender,
          description: trustedLists.hackers[item.sender],
        });
      }
    }

    if (item.receiver) {
      if (trustedLists.address && trustedLists.address[item.receiver]) {
        findings.trustedAddresses.push({
          address: item.receiver,
          description: trustedLists.address[item.receiver],
        });
      }
      if (trustedLists.hacker && trustedLists.hacker[item.receiver]) {
        findings.flaggedAddresses.push({
          address: item.receiver,
          description: trustedLists.hacker[item.receiver],
        });
      }
    }
  });

  return findings;
}

export async function explainTransactionWithClaude(transactionData) {
  const listFindings = checkAgainstLists(transactionData);

  let findingsMessage = "Additional information from our security checks:\n";

  if (listFindings.trustedPrograms.length > 0) {
    findingsMessage +=
      "- The transaction interacts with these trusted programs: " +
      listFindings.trustedPrograms
        .map((p) => `${p.description} (${p.programId})`)
        .join(", ") +
      "\n";
  } else {
    findingsMessage +=
      "- No known trusted programs detected in this transaction.\n";
  }

  if (listFindings.untrustedPrograms.length > 0) {
    findingsMessage +=
      "⚠️ WARNING: The transaction interacts with these untrusted programs: " +
      listFindings.untrustedPrograms
        .map((p) => `${p.description} (${p.programId})`)
        .join(", ") +
      "\n";
  }

  if (listFindings.trustedAddresses.length > 0) {
    findingsMessage +=
      "- The transaction interacts with these trusted addresses: " +
      listFindings.trustedAddresses
        .map((a) => `${a.description} (${a.address})`)
        .join(", ") +
      "\n";
  }

  if (listFindings.flaggedAddresses.length > 0) {
    findingsMessage +=
      "⚠️ WARNING: The transaction interacts with these flagged addresses: " +
      listFindings.flaggedAddresses
        .map((a) => `${a.description} (${a.address})`)
        .join(", ") +
      "\n";
  } else {
    findingsMessage += "- No flagged addresses detected in this transaction.\n";
  }

  console.log(findingsMessage);

  const prompt = `You are a Solana security assistant. Analyze the unsigned transaction below and return your answer in JSON format ONLY.

  Your response MUST follow this exact format:
  {
    "safetyLevel": "safe" | "not_safe",
    "summary": "Short, user-friendly summary of what the transaction is doing.",
    "reasoning": "Explain clearly why this transaction is marked as safe or not_safe, especially if any programs are unrecognized."
  }
  
  Do not add anything else beyond the JSON object.
  
  ---
  
  Transaction data (contains the Solana programs/contracts being called):
  ${JSON.stringify(transactionData, null, 2)}
  
  Trusted match results (tells you which programs are verified and which are not):
  ${findingsMessage}
  
  Rules:
  - If all programs are matched from the trusted list, mark as "safe".
  - If even one program is not matched (unknown/unverified), mark as "not_safe".
  - In the summary, clearly describe any transfers, swaps, or staking operations.
  - In the reasoning, be concise but specific — mention unknown programs and their possible risk.
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Unexpected response from Groq:", response.data);
      return "No explanation received.";
    }
  } catch (err) {
    if (err.response) {
      console.error("Claude API error response:", err.response.data);
      return `Error: ${
        err.response.data.message || "Failed to get explanation"
      }`;
    } else {
      console.error("Claude API error:", err.message);
      return `Error: ${err.message}`;
    }
  }
}
