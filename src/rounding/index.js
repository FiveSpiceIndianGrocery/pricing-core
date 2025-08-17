import identity from "./identity.js";
import ceilStep, { ceilStepUSD, ceilStepEUR, ceilStepJPY, ceilStepINR } from "./ceilStep.js";
import charm99 from "./charm99.js";

// Registry for pluggable rounding styles.
// Add new styles here without touching the base calculator.
export const rounders = {
  // Basic strategies
  identity,            // keep as-is (nearest unit)
  ceilStep5: ceilStep(5n),   // round up to next multiple of 5 units (e.g., nickels)
  ceilStep10: ceilStep(10n), // e.g., dimes
  
  // Currency-specific strategies
  ceilStepUSD,         // USD: round up to next nickel (5¢)
  ceilStepEUR,         // EUR: round up to next 5 centimes
  ceilStepJPY,         // JPY: round up to next yen (no decimals)
  ceilStepINR,         // INR: round up to next 5 paise
  
  // Psychological pricing
  charm99,             // force .99 ending (assumes 1 unit = cent)
};

// Resolve a rounder by key (string) or accept a custom function.
export function resolveRounder(rounding) {
  if (typeof rounding === "function") return rounding;
  const r = rounders[rounding];
  if (!r) throw new Error(`Unknown rounding style: ${rounding}`);
  return r;
}

// Helper to create currency-specific step rounders
export function createCurrencyStepRounder(currency = 'USD') {
  const currencyMap = {
    USD: ceilStepUSD,
    EUR: ceilStepEUR,
    JPY: ceilStepJPY,
    INR: ceilStepINR
  };
  
  return currencyMap[currency] || ceilStep(5n);
}
