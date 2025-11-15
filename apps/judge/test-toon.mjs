import { encode, decode } from "@toon-format/toon";

const data = {
  score: 4.2,
  decision: "acceptable",
  reason: "Clear and helpful.",
};

const toon = encode(data);
console.log("Encoded TOON:");
console.log(toon);
console.log("\nDecoded:");
console.log(JSON.stringify(decode(toon), null, 2));

