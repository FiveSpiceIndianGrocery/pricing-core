#!/usr/bin/env node

/**
 * Comprehensive examples demonstrating all markup strategies
 * Run with: npm run examples
 */

import { 
  calculatePrice, 
  calculatePriceWithMargin,
  calculateCostPlusPrice,
  calculateKeystonePrice,
  calculateKeystonePlusPrice,
  calculateFixedAmountPrice,
  calculateMarkupOnCostPrice,
  pctToBps, 
  toSmallestUnit, 
  formatPrice,
  createCurrency
} from './src/index.js';

console.log('🚀 PricingCore - Advanced Markup Strategies Examples\n');

// Example 1: Different Markup Strategies Comparison
console.log('📊 MARKUP STRATEGIES COMPARISON');
console.log('================================');

const cost = toSmallestUnit(10.00, 'USD');  // $10.00 cost
const margin30 = pctToBps(30);               // 30% margin
const markup25 = pctToBps(25);               // 25% markup

console.log(`Base Cost: ${formatPrice(cost, 'USD', true)}`);
console.log('');

// 1. Margin on selling price (original strategy)
const marginPrice = calculatePrice(cost, margin30, 'margin', 'ceilStepUSD');
console.log(`1. Margin Strategy (30% margin on selling price):`);
console.log(`   Formula: price = cost / (1 - 0.30) = $10.00 / 0.70`);
console.log(`   Price: ${formatPrice(marginPrice, 'USD', true)}`);
console.log(`   Margin: ${formatPrice(marginPrice - cost, 'USD', true)}`);
console.log(`   Margin %: ${((Number(marginPrice - cost) / Number(marginPrice)) * 100).toFixed(1)}%`);
console.log('');

// 2. Cost-plus markup
const costPlusPrice = calculatePrice(cost, markup25, 'costPlus', 'ceilStepUSD');
console.log(`2. Cost-Plus Strategy (25% markup on cost):`);
console.log(`   Formula: price = cost * (1 + 0.25) = $10.00 * 1.25`);
console.log(`   Price: ${formatPrice(costPlusPrice, 'USD', true)}`);
console.log(`   Markup: ${formatPrice(costPlusPrice - cost, 'USD', true)}`);
console.log(`   Markup %: ${((Number(costPlusPrice - cost) / Number(cost)) * 100).toFixed(1)}%`);
console.log('');

// 3. Keystone markup (double the cost)
const keystonePrice = calculatePrice(cost, 0, 'keystone', 'ceilStepUSD');
console.log(`3. Keystone Strategy (double the cost):`);
console.log(`   Formula: price = cost * 2 = $10.00 * 2`);
console.log(`   Price: ${formatPrice(keystonePrice, 'USD', true)}`);
console.log(`   Markup: ${formatPrice(keystonePrice - cost, 'USD', true)}`);
console.log(`   Markup %: ${((Number(keystonePrice - cost) / Number(cost)) * 100).toFixed(1)}%`);
console.log('');

// 4. Keystone plus additional markup
const keystonePlusPrice = calculatePrice(cost, markup25, 'keystonePlus', 'ceilStepUSD');
console.log(`4. Keystone Plus Strategy (double + 25%):`);
console.log(`   Formula: price = cost * 2 * (1 + 0.25) = $10.00 * 2 * 1.25`);
console.log(`   Price: ${formatPrice(keystonePlusPrice, 'USD', true)}`);
console.log(`   Markup: ${formatPrice(keystonePlusPrice - cost, 'USD', true)}`);
console.log(`   Markup %: ${((Number(keystonePlusPrice - cost) / Number(cost)) * 100).toFixed(1)}%`);
console.log('');

// 5. Fixed amount markup
const fixedAmount = toSmallestUnit(5.00, 'USD');  // $5.00 fixed markup
const fixedAmountPrice = calculatePrice(cost, fixedAmount, 'fixedAmount', 'ceilStepUSD');
console.log(`5. Fixed Amount Strategy ($5.00 markup):`);
console.log(`   Formula: price = cost + $5.00 = $10.00 + $5.00`);
console.log(`   Price: ${formatPrice(fixedAmountPrice, 'USD', true)}`);
console.log(`   Markup: ${formatPrice(fixedAmountPrice - cost, 'USD', true)}`);
console.log(`   Markup %: ${((Number(fixedAmountPrice - cost) / Number(cost)) * 100).toFixed(1)}%`);
console.log('');

// 6. Markup on cost (same as cost-plus, different perspective)
const markupOnCostPrice = calculatePrice(cost, markup25, 'markupOnCost', 'ceilStepUSD');
console.log(`6. Markup on Cost Strategy (25% markup on cost):`);
console.log(`   Formula: price = cost * (1 + 0.25) = $10.00 * 1.25`);
console.log(`   Price: ${formatPrice(markupOnCostPrice, 'USD', true)}`);
console.log(`   Markup: ${formatPrice(markupOnCostPrice - cost, 'USD', true)}`);
console.log(`   Markup %: ${((Number(markupOnCostPrice - cost) / Number(cost)) * 100).toFixed(1)}%`);
console.log('');

console.log('📈 STRATEGY COMPARISON SUMMARY');
console.log('===============================');
const strategies = [
  { name: 'Margin (30%)', price: marginPrice, formula: 'cost / (1 - 0.30)' },
  { name: 'Cost-Plus (25%)', price: costPlusPrice, formula: 'cost * (1 + 0.25)' },
  { name: 'Keystone', price: keystonePrice, formula: 'cost * 2' },
  { name: 'Keystone+ (25%)', price: keystonePlusPrice, formula: 'cost * 2 * (1 + 0.25)' },
  { name: 'Fixed Amount ($5)', price: fixedAmountPrice, formula: 'cost + $5.00' },
  { name: 'Markup on Cost (25%)', price: markupOnCostPrice, formula: 'cost * (1 + 0.25)' }
];

strategies.forEach((strategy, index) => {
  const markup = Number(strategy.price - cost);
  const markupPercent = (markup / Number(cost)) * 100;
  const marginPercent = (markup / Number(strategy.price)) * 100;
  
  console.log(`${index + 1}. ${strategy.name}:`);
  console.log(`   Price: ${formatPrice(strategy.price, 'USD', true)}`);
  console.log(`   Markup: ${formatPrice(markup, 'USD', true)} (${markupPercent.toFixed(1)}% on cost)`);
  console.log(`   Margin: ${marginPercent.toFixed(1)}% on selling price`);
  console.log(`   Formula: ${strategy.formula}`);
  console.log('');
});

// Example 2: Multi-Currency Markup Examples
console.log('🌍 MULTI-CURRENCY MARKUP EXAMPLES');
console.log('==================================');

const products = [
  { name: 'Premium Coffee', cost: 8.99, currency: 'USD', margin: 40, strategy: 'margin' },
  { name: 'Artisan Bread', cost: 6.50, currency: 'EUR', markup: 35, strategy: 'costPlus' },
  { name: 'Sushi Set', cost: 2500, currency: 'JPY', strategy: 'keystone' },
  { name: 'Designer Bag', cost: 150.00, currency: 'GBP', markup: 50, strategy: 'keystonePlus' },
  { name: 'Street Food', cost: 45.00, currency: 'INR', fixedAmount: 15.00, strategy: 'fixedAmount' }
];

products.forEach(product => {
  let price;
  let description;
  
  switch (product.strategy) {
    case 'margin':
      price = calculatePrice(
        toSmallestUnit(product.cost, product.currency), 
        pctToBps(product.margin), 
        'margin'
      );
      description = `${product.margin}% margin on selling price`;
      break;
      
    case 'costPlus':
      price = calculatePrice(
        toSmallestUnit(product.cost, product.currency), 
        pctToBps(product.markup), 
        'costPlus'
      );
      description = `${product.markup}% markup on cost`;
      break;
      
    case 'keystone':
      price = calculatePrice(
        toSmallestUnit(product.cost, product.currency), 
        0, 
        'keystone'
      );
      description = 'keystone pricing (double cost)';
      break;
      
    case 'keystonePlus':
      price = calculatePrice(
        toSmallestUnit(product.cost, product.currency), 
        pctToBps(product.markup), 
        'keystonePlus'
      );
      description = `keystone plus ${product.markup}% markup`;
      break;
      
    case 'fixedAmount':
      price = calculatePrice(
        toSmallestUnit(product.cost, product.currency), 
        toSmallestUnit(product.fixedAmount, product.currency), 
        'fixedAmount'
      );
      description = `fixed ${formatPrice(toSmallestUnit(product.fixedAmount, product.currency), product.currency, true)} markup`;
      break;
  }
  
  console.log(`${product.name} (${product.currency}):`);
  console.log(`  Cost: ${formatPrice(toSmallestUnit(product.cost, product.currency), product.currency, true)}`);
  console.log(`  Strategy: ${description}`);
  console.log(`  Price: ${formatPrice(price, product.currency, true)}`);
  console.log('');
});

// Example 3: Business Use Cases
console.log('💼 BUSINESS USE CASES');
console.log('=====================');

// Retail clothing store
console.log('👕 RETAIL CLOTHING STORE');
const tshirtCost = toSmallestUnit(15.00, 'USD');
const tshirtPrice = calculatePrice(tshirtCost, pctToBps(60), 'margin', 'charm99');
console.log(`T-shirt cost: ${formatPrice(tshirtCost, 'USD', true)}`);
console.log(`T-shirt price (60% margin + .99 ending): ${formatPrice(tshirtPrice, 'USD', true)}`);
console.log('');

// Restaurant pricing
console.log('🍽️ RESTAURANT PRICING');
const pastaCost = toSmallestUnit(4.50, 'USD');
const pastaPrice = calculatePrice(pastaCost, pctToBps(300), 'costPlus', 'ceilStepUSD');
console.log(`Pasta cost: ${formatPrice(pastaCost, 'USD', true)}`);
console.log(`Pasta price (300% markup on cost): ${formatPrice(pastaPrice, 'USD', true)}`);
console.log('');

// Electronics store
console.log('📱 ELECTRONICS STORE');
const phoneCost = toSmallestUnit(400.00, 'USD');
const phonePrice = calculatePrice(phoneCost, 0, 'keystone', 'identity');
console.log(`Phone cost: ${formatPrice(phoneCost, 'USD', true)}`);
console.log(`Phone price (keystone): ${formatPrice(phonePrice, 'USD', true)}`);
console.log('');

// Luxury goods
console.log('💎 LUXURY GOODS');
const watchCost = toSmallestUnit(2000.00, 'USD');
const watchPrice = calculatePrice(watchCost, pctToBps(100), 'keystonePlus', 'identity');
console.log(`Watch cost: ${formatPrice(watchCost, 'USD', true)}`);
console.log(`Watch price (keystone + 100% markup): ${formatPrice(watchPrice, 'USD', true)}`);
console.log('');

// Example 4: Advanced Scenarios
console.log('🔬 ADVANCED SCENARIOS');
console.log('======================');

// Dynamic pricing based on cost ranges
console.log('📊 DYNAMIC PRICING BY COST RANGE');
const costRanges = [
  { min: 0, max: 10, strategy: 'margin', value: 50 },      // 50% margin for low-cost items
  { min: 10, max: 50, strategy: 'margin', value: 40 },     // 40% margin for medium-cost items
  { min: 50, max: 200, strategy: 'margin', value: 35 },    // 35% margin for high-cost items
  { min: 200, max: Infinity, strategy: 'keystone', value: 0 } // keystone for luxury items
];

const testCosts = [5.00, 25.00, 100.00, 500.00];
testCosts.forEach(cost => {
  const range = costRanges.find(r => cost >= r.min && cost < r.max);
  const price = calculatePrice(
    toSmallestUnit(cost, 'USD'), 
    pctToBps(range.value), 
    range.strategy, 
    'ceilStepUSD'
  );
  
  console.log(`Cost: $${cost.toFixed(2)} → Strategy: ${range.strategy} (${range.value}%) → Price: ${formatPrice(price, 'USD', true)}`);
});
console.log('');

// Seasonal pricing adjustments
console.log('🌤️ SEASONAL PRICING ADJUSTMENTS');
const baseCost = toSmallestUnit(20.00, 'USD');
const seasonalMarkups = [
  { season: 'Off-Season', markup: 20, strategy: 'costPlus' },
  { season: 'Regular', markup: 35, strategy: 'costPlus' },
  { season: 'Peak', markup: 60, strategy: 'costPlus' }
];

seasonalMarkups.forEach(season => {
  const price = calculatePrice(baseCost, pctToBps(season.markup), season.strategy, 'ceilStepUSD');
  console.log(`${season.season}: ${formatPrice(price, 'USD', true)} (${season.markup}% markup)`);
});
console.log('');

// Example 5: Function-Specific Examples
console.log('🔧 FUNCTION-SPECIFIC EXAMPLES');
console.log('==============================');

const baseCostExample = toSmallestUnit(25.00, 'USD');

console.log('Using individual functions:');
console.log(`Base cost: ${formatPrice(baseCostExample, 'USD', true)}`);
console.log(`Margin pricing (30%): ${formatPrice(calculatePriceWithMargin(baseCostExample, pctToBps(30)), 'USD', true)}`);
console.log(`Cost-plus (40%): ${formatPrice(calculateCostPlusPrice(baseCostExample, pctToBps(40)), 'USD', true)}`);
console.log(`Keystone: ${formatPrice(calculateKeystonePrice(baseCostExample), 'USD', true)}`);
console.log(`Keystone+ (25%): ${formatPrice(calculateKeystonePlusPrice(baseCostExample, pctToBps(25)), 'USD', true)}`);
console.log(`Fixed amount ($10): ${formatPrice(calculateFixedAmountPrice(baseCostExample, toSmallestUnit(10.00, 'USD')), 'USD', true)}`);
console.log(`Markup on cost (50%): ${formatPrice(calculateMarkupOnCostPrice(baseCostExample, pctToBps(50)), 'USD', true)}`);
console.log('');

console.log('✅ All examples completed successfully!');
console.log('\n💡 Key Takeaways:');
console.log('• Margin strategy: Best for maintaining consistent profit margins');
console.log('• Cost-plus: Simple and predictable markup');
console.log('• Keystone: Traditional retail markup (2x cost)');
console.log('• Fixed amount: Good for low-cost items or minimum pricing');
console.log('• All strategies support the same rounding options');
console.log('• Use the strategy that best fits your business model and pricing goals');
