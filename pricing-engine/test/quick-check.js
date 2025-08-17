import { calculatePrice, pctToBps, rounders } from "../src/index.js";

console.log("🧪 Running Quick Check Tests...\n");

// 1 unit = cent; 250 = $2.50
const cost = 250n;

// 30% margin = 3000 bps
const marginBps = pctToBps(30);

console.log("Testing with cost: $2.50 (250 cents), margin: 30%\n");

// identity (no cosmetic rounding)
const pIdentity = calculatePrice(cost, marginBps, "identity");
console.log("identity:", pIdentity.toString(), "cents = $", (Number(pIdentity) / 100).toFixed(2));

// Using ceilStep5 (nickel)
const pNickel = calculatePrice(cost, marginBps, "ceilStep5");
console.log("ceilStep5:", pNickel.toString(), "cents = $", (Number(pNickel) / 100).toFixed(2));

// .99 ending
const pCharm = calculatePrice(cost, marginBps, "charm99");
console.log("charm99:", pCharm.toString(), "cents = $", (Number(pCharm) / 100).toFixed(2));

// Custom rounder (e.g., last digit 9 in cents)
const lastDigit9 = (units) => {
  const last = units % 10n;
  const target = units - last + 9n;
  return target >= units ? target : target + 10n;
};
const pCustom = calculatePrice(cost, marginBps, lastDigit9);
console.log("custom lastDigit9:", pCustom.toString(), "cents = $", (Number(pCustom) / 100).toFixed(2));

console.log("\n✅ Quick check tests completed!");
