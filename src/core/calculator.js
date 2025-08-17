import { divCeil } from "./math.js";
import { resolveRounder } from "../rounding/index.js";

/**
 * Base pricing calculator.
 *
 * Inputs:
 *  - costUnits: bigint | number  (in smallest monetary units; e.g., cents)
 *  - marginBps: number | bigint  (desired gross margin in basis points; 30% => 3000)
 *  - rounding:  string | (priceUnits: bigint) => bigint
 *
 * Output:
 *  - price in smallest monetary units as bigint
 *
 * Notes:
 *  - Formula (margin on selling price): price = cost / (1 - margin)
 *  - Implemented as: ceil(cost * 10000 / (10000 - marginBps)) to protect margin
 *  - All arithmetic is integer BigInt to avoid floating-point issues.
 */
export function calculatePrice(costUnits, marginBps, rounding = "identity") {
  // normalize inputs to BigInt
  let cost = typeof costUnits === "bigint" ? costUnits : BigInt(costUnits);
  let mBps = typeof marginBps === "bigint" ? marginBps : BigInt(Math.round(marginBps));

  if (mBps < 0n || mBps >= 10000n) {
    throw new Error("marginBps must be between 0 and 9999 (i.e., < 100%).");
  }
  if (cost < 0n) {
    // choose your policy; here we disallow negative cost
    throw new Error("costUnits cannot be negative.");
  }

  const ONE = 10000n;                 // 100.00% in basis points
  const denom = ONE - mBps;           // (1 - m)
  const numerator = cost * ONE;       // cost * 10000

  // Math-stage rounding: ceil to avoid undercharging
  let priceUnits = divCeil(numerator, denom);

  // Cosmetic / pricing-rule rounding
  const rounder = resolveRounder(rounding);
  priceUnits = rounder(priceUnits);

  return priceUnits;
}
