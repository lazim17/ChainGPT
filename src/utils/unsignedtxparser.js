import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";

function publicKeyFromBNJson(bnJson) {
  const bn = new BN(0);
  bn.words = bnJson.words;
  bn.length = bnJson.length;
  bn.negative = bnJson.negative;
  bn.red = bnJson.red;
  return new PublicKey(bn);
}

function decodeLamports(bytes) {
  const lamportsHex = bytes
    .reverse()
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return parseInt(lamportsHex, 16);
}

function resolveAccountIndex(tx, index) {
  if (index < tx.message.staticAccountKeys.length) {
    const accountKey = tx.message.staticAccountKeys[index];
    return publicKeyFromBNJson(accountKey._bn);
  }
  throw new Error(`Account index ${index} could not be resolved.`);
}

// Main function to analyze the entire transaction
function analyzeTransaction(tx) {
  const results = [];

  // Extract program public keys from the transaction
  const programIdIndexes = new Set();
  tx.message.compiledInstructions.forEach((ix) => {
    programIdIndexes.add(ix.programIdIndex);
  });

  programIdIndexes.forEach((programIdIndex) => {
    const publicKey = tx.message.staticAccountKeys[programIdIndex];

    if (publicKey && publicKey._bn) {
      const programPublicKey = publicKeyFromBNJson(publicKey._bn);
      const programBase58 = programPublicKey.toBase58();
      if (programBase58 !== SystemProgram.programId.toBase58()) {
        results.push({ programIdIndex, programPublicKey: programBase58 });
      }

      if (programBase58 === SystemProgram.programId.toBase58()) {
        const relatedInstructions = tx.message.compiledInstructions.filter(
          (ix) => ix.programIdIndex === programIdIndex
        );
        relatedInstructions.forEach((ix) => {
          try {
            const [senderIndex, receiverIndex] = ix.accountKeyIndexes;
            const sender = resolveAccountIndex(tx, senderIndex);
            const receiver = resolveAccountIndex(tx, receiverIndex);

            const lamportBytes = Object.values(ix.data).slice(4, 12);
            const lamports = decodeLamports(lamportBytes);
            const sol = lamports / 1_000_000_000;

            results.push({
              programIdIndex,
              programPublicKey: programBase58,
              instruction: "System Program",
              sender: sender.toBase58(),
              receiver: receiver.toBase58(),
              lamports,
              sol,
            });
          } catch (err) {
            results.push({ error: err.message });
          }
        });
      }
    }
  });

  return results;
}

export { analyzeTransaction };
