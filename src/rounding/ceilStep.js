// Round UP to the next multiple of `stepUnits` (e.g., 5 -> next nickel if units = cents)
export default function ceilStep(stepUnits = 5n) {
  if (typeof stepUnits === "number") stepUnits = BigInt(stepUnits);
  return function round(priceUnits /* bigint */) {
    const r = priceUnits % stepUnits;
    return r === 0n ? priceUnits : priceUnits + (stepUnits - r);
  };
}

// Currency-aware step rounding functions
export const ceilStepUSD = ceilStep(5n);  // Nickels for USD
export const ceilStepEUR = ceilStep(5n);  // 5 centimes for EUR
export const ceilStepJPY = ceilStep(1n);  // 1 yen for JPY (no decimals)
export const ceilStepINR = ceilStep(5n);  // 5 paise for INR
