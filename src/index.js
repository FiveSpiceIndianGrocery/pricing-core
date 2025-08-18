export { 
  calculatePrice, 
  calculatePriceWithMargin,
  calculateCostPlusPrice,
  calculateKeystonePrice,
  calculateKeystonePlusPrice,
  calculateFixedAmountPrice,
  calculateMarkupOnCostPrice
} from "./core/calculator.js";
export { rounders, resolveRounder, createCurrencyStepRounder } from "./rounding/index.js";
export * from "./currency.js";

// Small convenience: percent → bps helper (kept separate from base)
export const pctToBps = (pctNumber) => {
  if (typeof pctNumber !== "number" || !isFinite(pctNumber)) {
    throw new Error("pctToBps expects a finite number.");
  }
  return Math.round(pctNumber * 100); // 30 -> 3000
};
