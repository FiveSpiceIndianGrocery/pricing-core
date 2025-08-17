#!/usr/bin/env node

/**
 * Comprehensive examples for the Pricing Engine
 * Demonstrates currency-agnostic pricing calculations with currency-codes package integration
 */

import { 
  calculatePrice, 
  pctToBps, 
  rounders, 
  createCurrencyStepRounder,
  toSmallestUnit,
  fromSmallestUnit,
  formatPrice,
  CURRENCIES,
  createCurrency,
  getCurrenciesByDecimalPlaces,
  getCurrenciesByRegion,
  getCurrencyByNumber,
  getCurrenciesByCountry,
  getISOPublishDate,
  getCurrencyDetails
} from './src/index.js';

console.log('🚀 Pricing Engine Examples - Powered by currency-codes Package\n');

// Example 1: Basic USD pricing
console.log('=== Example 1: Basic USD Pricing ===');
const usdCost = toSmallestUnit(2.50, 'USD');  // $2.50 → 250 cents
const usdMargin = pctToBps(30);                // 30% → 3000 bps

const usdPrice = calculatePrice(usdCost, usdMargin, 'ceilStepUSD');
console.log(`Cost: ${formatPrice(2.50, 'USD')}`);
console.log(`Margin: 30%`);
console.log(`Price (rounded to nickels): ${formatPrice(usdPrice, 'USD', true)}`);
console.log();

// Example 2: EUR pricing with different rounding
console.log('=== Example 2: EUR Pricing ===');
const eurCost = toSmallestUnit(5.75, 'EUR');  // €5.75 → 575 centimes
const eurMargin = pctToBps(25);                // 25% → 2500 bps

const eurPriceIdentity = calculatePrice(eurCost, eurMargin, 'identity');
const eurPriceCharm = calculatePrice(eurCost, eurMargin, 'charm99');

console.log(`Cost: ${formatPrice(5.75, 'EUR')}`);
console.log(`Margin: 25%`);
console.log(`Price (no rounding): ${formatPrice(eurPriceIdentity, 'EUR', true)}`);
console.log(`Price (.99 ending): ${formatPrice(eurPriceCharm, 'EUR', true)}`);
console.log();

// Example 3: JPY pricing (no decimals)
console.log('=== Example 3: JPY Pricing (No Decimals) ===');
const jpyCost = toSmallestUnit(1000, 'JPY');  // ¥1000 → 1000 yen
const jpyMargin = pctToBps(40);                // 40% → 4000 bps

const jpyPrice = calculatePrice(jpyCost, jpyMargin, 'ceilStepJPY');

console.log(`Cost: ${formatPrice(1000, 'JPY')}`);
console.log(`Margin: 40%`);
console.log(`Price (rounded to yen): ${formatPrice(jpyPrice, 'JPY', true)}`);
console.log();

// Example 4: Custom currency (crypto)
console.log('=== Example 4: Custom Currency (Crypto) ===');
const btc = createCurrency('BTC', '₿', 8);  // Bitcoin with 8 decimal places
const btcCost = toSmallestUnit(0.001, btc);  // 0.001 BTC → 100000 satoshis
const btcMargin = pctToBps(15);               // 15% → 1500 bps

const btcPrice = calculatePrice(btcCost, btcMargin, 'identity');

console.log(`Cost: ${formatPrice(0.001, btc)}`);
console.log(`Margin: 15%`);
console.log(`Price: ${formatPrice(btcPrice, btc, true)}`);
console.log();

// Example 5: Batch pricing with different currencies
console.log('=== Example 5: Batch Pricing ===');
const products = [
  { name: 'Widget A', cost: 10.99, currency: 'USD', margin: 35 },
  { name: 'Widget B', cost: 15.50, currency: 'EUR', margin: 30 },
  { name: 'Widget C', cost: 2000, currency: 'JPY', margin: 25 },
  { name: 'Widget D', cost: 500, currency: 'INR', margin: 40 },
  { name: 'Widget E', cost: 25.75, currency: 'GBP', margin: 45 },
  { name: 'Widget F', cost: 150, currency: 'CNY', margin: 20 }
];

console.log('Product Pricing Summary:');
console.log('-'.repeat(70));
console.log('Product'.padEnd(12) + 'Cost'.padEnd(20) + 'Margin'.padEnd(8) + 'Price');
console.log('-'.repeat(70));

products.forEach(product => {
  const costUnits = toSmallestUnit(product.cost, product.currency);
  const marginBps = pctToBps(product.margin);
  const price = calculatePrice(costUnits, marginBps, 'identity');
  
  console.log(
    product.name.padEnd(12) +
    formatPrice(product.cost, product.currency).padEnd(20) +
    `${product.margin}%`.padEnd(8) +
    formatPrice(price, product.currency, true)
  );
});
console.log();

// Example 6: Custom rounding strategies
console.log('=== Example 6: Custom Rounding ===');
const customCost = toSmallestUnit(7.25, 'USD');
const customMargin = pctToBps(20);

// Custom rounder: round to nearest quarter (25¢)
const roundToQuarter = (units) => {
  const quarter = 25n;
  const remainder = units % quarter;
  if (remainder === 0n) return units;
  
  const halfQuarter = quarter / 2n;
  if (remainder >= halfQuarter) {
    return units + (quarter - remainder);
  } else {
    return units - remainder;
  }
};

const customPrice = calculatePrice(customCost, customMargin, roundToQuarter);
console.log(`Cost: ${formatPrice(7.25, 'USD')}`);
console.log(`Margin: 20%`);
console.log(`Price (rounded to quarters): ${formatPrice(customPrice, 'USD', true)}`);
console.log();

// Example 7: Currency analysis and statistics
console.log('=== Example 7: Currency Analysis ===');
console.log(`📊 Total supported currencies: ${Object.keys(CURRENCIES).length}`);
console.log(`📅 ISO 4217 data publish date: ${getISOPublishDate()}`);

const decimalPlacesStats = {};
Object.values(CURRENCIES).forEach(config => {
  const places = config.decimalPlaces;
  decimalPlacesStats[places] = (decimalPlacesStats[places] || 0) + 1;
});

console.log('\n🔢 Currencies by decimal places:');
Object.entries(decimalPlacesStats).forEach(([places, count]) => {
  console.log(`  ${places} decimal places: ${count} currencies`);
});

console.log('\nCurrencies with 0 decimal places (like JPY, KRW):');
const zeroDecimalCurrencies = getCurrenciesByDecimalPlaces(0);
console.log(`  ${zeroDecimalCurrencies.slice(0, 10).join(', ')}${zeroDecimalCurrencies.length > 10 ? '...' : ''}`);

console.log('\nCurrencies with 3 decimal places (like BHD, KWD):');
const threeDecimalCurrencies = getCurrenciesByDecimalPlaces(3);
console.log(`  ${threeDecimalCurrencies.join(', ')}`);

// Example 8: Regional currency examples
console.log('\n=== Example 8: Regional Currency Examples ===');
const regions = getCurrenciesByRegion();
Object.entries(regions).forEach(([region, currencies]) => {
  if (currencies.length > 0) {
    const sampleCurrency = currencies[0];
    const sampleCost = toSmallestUnit(100, sampleCurrency);
    const sampleMargin = pctToBps(25);
    const samplePrice = calculatePrice(sampleCost, sampleMargin, 'identity');
    
    console.log(`${region}: ${sampleCurrency} - ${formatPrice(100, sampleCurrency)} → ${formatPrice(samplePrice, sampleCurrency, true)} (25% margin)`);
  }
});

// Example 9: New currency-codes integration features
console.log('\n=== Example 9: Currency-Codes Integration ===');

// Get currency by ISO number
const usdByNumber = getCurrencyByNumber(840);
console.log(`Currency with ISO number 840: ${usdByNumber ? usdByNumber.code : 'Not found'}`);

// Get currencies by country
const colombiaCurrencies = getCurrenciesByCountry('colombia');
console.log(`Currencies used in Colombia: ${colombiaCurrencies.map(c => c.code).join(', ')}`);

// Get detailed currency information
const eurDetails = getCurrencyDetails('EUR');
if (eurDetails) {
  console.log(`EUR details: ${eurDetails.currency} used in ${eurDetails.countries.length} countries`);
  console.log(`  Countries: ${eurDetails.countries.slice(0, 5).join(', ')}${eurDetails.countries.length > 5 ? '...' : ''}`);
}

// Example 10: Available rounding strategies
console.log('\n=== Example 10: Available Rounding Strategies ===');
console.log('Built-in rounding strategies:');
Object.keys(rounders).forEach(strategy => {
  console.log(`  - ${strategy}`);
});

console.log('\n✅ Examples completed!');
console.log('\nTo run the interactive CLI: npm run cli');
console.log('To run automated tests: npm test');
console.log(`\n🌍 This pricing engine now supports ${Object.keys(CURRENCIES).length} currencies via the currency-codes package!`);
console.log(`📦 Powered by: https://www.npmjs.com/package/currency-codes`);
