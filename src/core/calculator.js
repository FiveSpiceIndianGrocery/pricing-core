import { divCeil } from "./math.js";
import { resolveRounder } from "../rounding/index.js";

/**
 * Base pricing calculator with support for multiple markup strategies.
 *
 * Inputs:
 *  - costUnits: bigint | number  (in smallest monetary units; e.g., cents)
 *  - markupValue: number | bigint  (markup amount based on strategy)
 *  - strategy: string (markup strategy to use)
 *  - rounding:  string | (priceUnits: bigint) => bigint
 *
 * Output:
 *  - price in smallest monetary units as bigint
 *
 * Supported Strategies:
 *  - 'margin': margin on selling price (price = cost / (1 - margin))
 *  - 'costPlus': fixed percentage added to cost (price = cost * (1 + markup))
 *  - 'keystone': double the cost (price = cost * 2)
 *  - 'keystonePlus': keystone plus additional percentage (price = cost * 2 * (1 + markup))
 *  - 'fixedAmount': fixed amount added to cost (price = cost + markup)
 *  - 'targetMargin': target margin on cost (price = cost / (1 - margin))
 *  - 'markupOnCost': percentage markup on cost (price = cost * (1 + markup))
 */
export function calculatePrice(costUnits, markupValue, strategy = "margin", rounding = "identity") {
  // normalize inputs to BigInt
  let cost = typeof costUnits === "bigint" ? costUnits : BigInt(costUnits);
  let markup = typeof markupValue === "bigint" ? markupValue : BigInt(Math.round(markupValue));

  if (cost < 0n) {
    throw new Error("costUnits cannot be negative.");
  }

  let priceUnits;

  switch (strategy) {
    case "margin":
      // Margin on selling price: price = cost / (1 - margin)
      if (markup < 0n || markup >= 10000n) {
        throw new Error("marginBps must be between 0 and 9999 (i.e., < 100%).");
      }
      const ONE = 10000n;
      const denom = ONE - markup;
      const numerator = cost * ONE;
      priceUnits = divCeil(numerator, denom);
      break;

    case "costPlus":
      // Fixed percentage added to cost: price = cost * (1 + markup)
      if (markup < 0n) {
        throw new Error("costPlus markup cannot be negative.");
      }
      const markupMultiplier = 10000n + markup;
      priceUnits = (cost * markupMultiplier) / 10000n;
      break;

    case "keystone":
      // Double the cost: price = cost * 2
      priceUnits = cost * 2n;
      break;

    case "keystonePlus":
      // Keystone plus additional percentage: price = cost * 2 * (1 + markup)
      if (markup < 0n) {
        throw new Error("keystonePlus markup cannot be negative.");
      }
      const keystoneMarkup = 10000n + markup;
      priceUnits = (cost * 2n * keystoneMarkup) / 10000n;
      break;

    case "fixedAmount":
      // Fixed amount added to cost: price = cost + markup
      if (markup < 0n) {
        throw new Error("fixedAmount markup cannot be negative.");
      }
      priceUnits = cost + markup;
      break;

    case "targetMargin":
      // Target margin on cost: price = cost / (1 - margin)
      if (markup < 0n || markup >= 10000n) {
        throw new Error("targetMargin must be between 0 and 9999 (i.e., < 100%).");
      }
      const targetDenom = 10000n - markup;
      const targetNumerator = cost * 10000n;
      priceUnits = divCeil(targetNumerator, targetDenom);
      break;

    case "markupOnCost":
      // Percentage markup on cost: price = cost * (1 + markup)
      if (markup < 0n) {
        throw new Error("markupOnCost cannot be negative.");
      }
      const costMarkupMultiplier = 10000n + markup;
      priceUnits = (cost * costMarkupMultiplier) / 10000n;
      break;

    default:
      throw new Error(`Unknown markup strategy: ${strategy}. Supported strategies: margin, costPlus, keystone, keystonePlus, fixedAmount, targetMargin, markupOnCost`);
  }

  // Cosmetic / pricing-rule rounding
  const rounder = resolveRounder(rounding);
  priceUnits = rounder(priceUnits);

  return priceUnits;
}

/**
 * Legacy function for backward compatibility - uses margin strategy
 * @deprecated Use calculatePrice(cost, markup, 'margin', rounding) instead
 */
export function calculatePriceWithMargin(costUnits, marginBps, rounding = "identity") {
  return calculatePrice(costUnits, marginBps, "margin", rounding);
}

/**
 * Calculate price using cost-plus markup strategy
 * @param {bigint|number} costUnits - Cost in smallest currency units
 * @param {bigint|number} markupBps - Markup in basis points (e.g., 2500 for 25%)
 * @param {string|function} rounding - Rounding strategy
 * @returns {bigint} - Price in smallest currency units
 */
export function calculateCostPlusPrice(costUnits, markupBps, rounding = "identity") {
  return calculatePrice(costUnits, markupBps, "costPlus", rounding);
}

/**
 * Calculate price using keystone markup (double the cost)
 * @param {bigint|number} costUnits - Cost in smallest currency units
 * @param {string|function} rounding - Rounding strategy
 * @returns {bigint} - Price in smallest currency units
 */
export function calculateKeystonePrice(costUnits, rounding = "identity") {
  return calculatePrice(costUnits, 0, "keystone", rounding);
}

/**
 * Calculate price using keystone plus additional markup
 * @param {bigint|number} costUnits - Cost in smallest currency units
 * @param {bigint|number} additionalMarkupBps - Additional markup in basis points
 * @param {string|function} rounding - Rounding strategy
 * @returns {bigint} - Price in smallest currency units
 */
export function calculateKeystonePlusPrice(costUnits, additionalMarkupBps, rounding = "identity") {
  return calculatePrice(costUnits, additionalMarkupBps, "keystonePlus", rounding);
}

/**
 * Calculate price by adding a fixed amount to cost
 * @param {bigint|number} costUnits - Cost in smallest currency units
 * @param {bigint|number} fixedAmount - Fixed amount to add in smallest currency units
 * @param {string|function} rounding - Rounding strategy
 * @returns {bigint} - Price in smallest currency units
 */
export function calculateFixedAmountPrice(costUnits, fixedAmount, rounding = "identity") {
  return calculatePrice(costUnits, fixedAmount, "fixedAmount", rounding);
}

/**
 * Calculate price using markup on cost percentage
 * @param {bigint|number} costUnits - Cost in smallest currency units
 * @param {bigint|number} markupBps - Markup percentage in basis points
 * @param {string|function} rounding - Rounding strategy
 * @returns {bigint} - Price in smallest currency units
 */
export function calculateMarkupOnCostPrice(costUnits, markupBps, rounding = "identity") {
  return calculatePrice(costUnits, markupBps, "markupOnCost", rounding);
}
