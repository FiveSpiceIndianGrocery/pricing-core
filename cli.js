#!/usr/bin/env node

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
} from "./src/index.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function displayMenu() {
  console.log("\n" + "=".repeat(60));
  console.log("🧮 PRICING ENGINE CLI TESTING ENVIRONMENT");
  console.log("=".repeat(60));
  console.log("Available options:");
  console.log("1. Single calculation     - Test individual cost/margin/currency");
  console.log("2. View rounding strategies - See all available rounders");
  console.log("3. View currencies        - See supported currencies");
  console.log("4. Currency statistics    - View currency analysis");
  console.log("5. Advanced currency      - ISO numbers, countries, details");
  console.log("6. Batch test             - Test multiple scenarios");
  console.log("7. Custom rounding        - Test your own rounding logic");
  console.log("8. Custom currency        - Create and test custom currency");
  console.log("9. Exit                   - Quit the program");
  console.log("=".repeat(60));
}

function displayCurrencies() {
  console.log("\n🌍 Supported Currencies:");
  console.log(`Total: ${Object.keys(CURRENCIES).length} currencies from ISO 4217 standard`);
  console.log("-".repeat(80));
  console.log("Code".padEnd(8) + "Symbol".padEnd(12) + "Decimals".padEnd(10) + "Example".padEnd(20) + "Region");
  console.log("-".repeat(80));
  
  // Get regional grouping
  const regions = getCurrenciesByRegion();
  const regionMap = {};
  Object.entries(regions).forEach(([region, currencies]) => {
    currencies.forEach(code => {
      regionMap[code] = region;
    });
  });
  
  // Show first 20 currencies as a sample
  const sampleCurrencies = Object.entries(CURRENCIES).slice(0, 20);
  sampleCurrencies.forEach(([code, config]) => {
    const example = formatPrice(100, config);
    const region = regionMap[code] || 'Other';
    console.log(
      code.padEnd(8) + 
      config.symbol.padEnd(12) + 
      config.decimalPlaces.toString().padEnd(10) + 
      example.padEnd(20) + 
      region
    );
  });
  
  if (Object.keys(CURRENCIES).length > 20) {
    console.log(`... and ${Object.keys(CURRENCIES).length - 20} more currencies`);
    console.log("\n💡 Use the examples command to see all currencies by category");
  }
}

function displayRounders() {
  console.log("\n🎯 Available Rounding Strategies:");
  console.log("-".repeat(50));
  
  Object.entries(rounders).forEach(([key, rounder]) => {
    console.log(`  ${key.padEnd(15)}: ${rounder.name || 'function'}`);
  });
  
  console.log("\n💡 Custom rounding functions are also supported!");
}

async function singleCalculation() {
  console.log("\n--- Single Price Calculation ---");
  
  // Get currency
  const currencyInput = await question("Enter currency code (e.g., USD, EUR, JPY) or press Enter for USD: ");
  let currency = currencyInput.trim() || 'USD';
  
  if (!CURRENCIES[currency]) {
    console.log(`❌ Unsupported currency: ${currency}. Using USD instead.`);
    currency = 'USD';
  }
  
  const config = CURRENCIES[currency];
  console.log(`Using currency: ${config.code} (${config.symbol})`);
  
  // Get cost
  const costInput = await question(`Enter cost in ${config.code} (e.g., ${config.smallestUnit === 0.01 ? '2.50' : '1000'}): `);
  const cost = parseFloat(costInput);
  
  if (isNaN(cost) || cost < 0) {
    console.log("❌ Invalid cost. Please enter a valid positive number.");
    return;
  }
  
  // Get margin
  const marginInput = await question("Enter margin percentage (e.g., 30 for 30%): ");
  const margin = parseFloat(marginInput);
  
  if (isNaN(margin) || margin < 0 || margin >= 100) {
    console.log("❌ Invalid margin. Please enter a number between 0 and 99.99.");
    return;
  }
  
  const marginBps = pctToBps(margin);
  const costUnits = toSmallestUnit(cost, currency);
  
  console.log(`\nCost: ${formatPrice(cost, currency)}`);
  console.log(`Margin: ${margin}% (${marginBps} basis points)`);
  console.log(`Cost in smallest units: ${costUnits.toString()}`);
  
  // Test all rounding strategies
  console.log("\nResults with different rounding strategies:");
  console.log("-".repeat(60));
  
  Object.entries(rounders).forEach(([key, rounder]) => {
    try {
      const price = calculatePrice(costUnits, marginBps, 'margin', key);
      const formattedPrice = formatPrice(price, currency, true);
      console.log(`${key.padEnd(15)}: ${formattedPrice}`);
    } catch (error) {
      console.log(`${key.padEnd(15)}: ❌ Error - ${error.message}`);
    }
  });
  
  // Test custom rounding
  try {
    const customRounder = (units) => {
      const last = units % 10n;
      const target = units - last + 9n;
      return target >= units ? target : target + 10n;
    };
    const price = calculatePrice(costUnits, marginBps, 'margin', customRounder);
    const formattedPrice = formatPrice(price, currency, true);
    console.log(`custom         : ${formattedPrice} (last digit 9)`);
  } catch (error) {
    console.log(`custom         : ❌ Error - ${error.message}`);
  }
}

async function batchTest() {
  console.log("\n--- Batch Test Scenarios ---");
  
  const scenarios = [
    { cost: 100, margin: 20, currency: 'USD', name: "Low cost, low margin (USD)" },
    { cost: 500, margin: 40, currency: 'EUR', name: "Medium cost, medium margin (EUR)" },
    { cost: 1000, margin: 60, currency: 'JPY', name: "High cost, high margin (JPY)" },
    { cost: 99, margin: 25, currency: 'USD', name: "Near-dollar cost (USD)" },
    { cost: 250, margin: 30, currency: 'INR', name: "Quarter-dollar cost (INR)" }
  ];
  
  console.log("Testing multiple scenarios...\n");
  
  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Cost: ${formatPrice(scenario.cost, scenario.currency)}, Margin: ${scenario.margin}%`);
    
    const marginBps = pctToBps(scenario.margin);
    const costUnits = toSmallestUnit(scenario.cost, scenario.currency);
    
    try {
      const identityPrice = calculatePrice(costUnits, marginBps, "margin", "identity");
      const charmPrice = calculatePrice(costUnits, marginBps, "margin", "charm99");
      
      console.log(`  Identity: ${formatPrice(identityPrice, scenario.currency, true)}`);
      console.log(`  Charm99:  ${formatPrice(charmPrice, scenario.currency, true)}`);
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    console.log();
  });
}

async function customRounding() {
  console.log("\n--- Custom Rounding Function ---");
  console.log("Enter a JavaScript expression that takes 'units' as BigInt parameter");
  console.log("Example: units => units + (10n - (units % 10n))");
  
  const customCode = await question("Custom rounding function: ");
  
  try {
    // Create a safe function context
    const customRounder = new Function('units', `return (${customCode})(units);`);
    
    // Test with a simple example
    const testCost = 250;
    const testCurrency = 'USD';
    const testMargin = pctToBps(30);
    
    console.log(`\nTesting with cost: ${formatPrice(testCost, testCurrency)}, margin: 30%`);
    
    const costUnits = toSmallestUnit(testCost, testCurrency);
    const price = calculatePrice(costUnits, testMargin, 'margin', customRounder);
    console.log(`Result: ${formatPrice(price, testCurrency, true)}`);
    
    // Test the function directly
    const testUnits = 358n;
    const rounded = customRounder(testUnits);
    console.log(`Direct test: ${testUnits} → ${rounded} (${formatPrice(rounded, testCurrency, true)})`);
    
  } catch (error) {
    console.log(`❌ Error in custom function: ${error.message}`);
  }
}

async function currencyStatistics() {
  console.log("\n--- Currency Statistics and Analysis ===\n");
  
  console.log(`📊 Total supported currencies: ${Object.keys(CURRENCIES).length}`);
  console.log(`📅 ISO 4217 data publish date: ${getISOPublishDate()}`);
  
  // Decimal places statistics
  const decimalPlacesStats = {};
  Object.values(CURRENCIES).forEach(config => {
    const places = config.decimalPlaces;
    decimalPlacesStats[places] = (decimalPlacesStats[places] || 0) + 1;
  });
  
  console.log("\n🔢 Currencies by decimal places:");
  Object.entries(decimalPlacesStats).forEach(([places, count]) => {
    console.log(`  ${places} decimal places: ${count} currencies`);
  });
  
  // Regional statistics
  const regions = getCurrenciesByRegion();
  console.log("\n🌍 Regional distribution:");
  Object.entries(regions).forEach(([region, currencies]) => {
    console.log(`  ${region}: ${currencies.length} currencies`);
  });
  
  // Sample currencies by decimal places
  console.log("\n💡 Sample currencies with 0 decimal places:");
  const zeroDecimalCurrencies = getCurrenciesByDecimalPlaces(0);
  console.log(`  ${zeroDecimalCurrencies.slice(0, 10).join(', ')}${zeroDecimalCurrencies.length > 10 ? '...' : ''}`);
  
  console.log("\n💡 Sample currencies with 3 decimal places:");
  const threeDecimalCurrencies = getCurrenciesByDecimalPlaces(3);
  console.log(`  ${threeDecimalCurrencies.join(', ')}`);
  
  // Special currencies
  const specialCurrencies = ['XDR', 'XAU', 'XAG', 'XPT', 'XPD', 'XTS', 'XXX'];
  console.log("\n⭐ Special currencies:");
  specialCurrencies.forEach(code => {
    if (CURRENCIES[code]) {
      const config = CURRENCIES[code];
      console.log(`  ${code} (${config.symbol}): ${config.decimalPlaces} decimal places`);
    }
  });
}

async function advancedCurrency() {
  console.log("\n--- Advanced Currency Features ===\n");
  
  console.log("🔍 Available advanced features:");
  console.log("1. Find currency by ISO number");
  console.log("2. Find currencies by country");
  console.log("3. Get detailed currency information");
  console.log("4. Back to main menu");
  
  const choice = await question("\nSelect an option (1-4): ");
  
  switch (choice.trim()) {
    case '1':
      await findCurrencyByNumber();
      break;
    case '2':
      await findCurrenciesByCountry();
      break;
    case '3':
      await getDetailedCurrencyInfo();
      break;
    case '4':
      return;
    default:
      console.log("❌ Invalid option. Please select 1-4.");
  }
}

async function findCurrencyByNumber() {
  console.log("\n--- Find Currency by ISO Number ===\n");
  
  const numberInput = await question("Enter ISO 4217 currency number (e.g., 840 for USD): ");
  const number = parseInt(numberInput);
  
  if (isNaN(number)) {
    console.log("❌ Invalid number. Please enter a valid integer.");
    return;
  }
  
  const currency = getCurrencyByNumber(number);
  if (currency) {
    console.log(`✅ Found currency: ${currency.code} (${currency.symbol})`);
    console.log(`   Name: ${currency.currency}`);
    console.log(`   Decimal places: ${currency.decimalPlaces}`);
    console.log(`   Smallest unit: ${currency.smallestUnit}`);
    console.log(`   ISO number: ${currency.number}`);
  } else {
    console.log(`❌ No currency found with ISO number ${number}`);
  }
}

async function findCurrenciesByCountry() {
  console.log("\n--- Find Currencies by Country ===\n");
  
  const country = await question("Enter country name (e.g., colombia, france): ");
  
  const currencies = getCurrenciesByCountry(country);
  if (currencies.length > 0) {
    console.log(`✅ Found ${currencies.length} currency(ies) for ${country}:`);
    currencies.forEach((currency, index) => {
      console.log(`   ${index + 1}. ${currency.code} (${currency.symbol}) - ${currency.currency}`);
      console.log(`      Decimal places: ${currency.decimalPlaces}, ISO number: ${currency.number}`);
    });
  } else {
    console.log(`❌ No currencies found for country: ${country}`);
  }
}

async function getDetailedCurrencyInfo() {
  console.log("\n--- Get Detailed Currency Information ===\n");
  
  const code = await question("Enter currency code (e.g., EUR, USD): ").toUpperCase();
  
  const details = getCurrencyDetails(code);
  if (details) {
    console.log(`✅ Detailed information for ${code}:`);
    console.log(`   Code: ${details.code}`);
    console.log(`   Symbol: ${details.symbol}`);
    console.log(`   Name: ${details.currency}`);
    console.log(`   ISO number: ${details.number}`);
    console.log(`   Decimal places: ${details.digits}`);
    console.log(`   Smallest unit: ${details.smallestUnit}`);
    console.log(`   Countries: ${details.countries.join(', ')}`);
  } else {
    console.log(`❌ Currency not found: ${code}`);
  }
}

async function customCurrency() {
  console.log("\n--- Custom Currency Creation ---");
  
  const code = await question("Enter currency code (e.g., BTC, ETH): ");
  const symbol = await question("Enter currency symbol (e.g., ₿, Ξ): ");
  const decimalsInput = await question("Enter number of decimal places (e.g., 8 for Bitcoin): ");
  const decimals = parseInt(decimalsInput);
  
  if (isNaN(decimals) || decimals < 0 || decimals > 20) {
    console.log("❌ Invalid decimal places. Please enter a number between 0 and 20.");
    return;
  }
  
  try {
    const customCurrency = createCurrency(code, symbol, decimals);
    console.log(`\n✅ Created custom currency: ${customCurrency.code} (${customCurrency.symbol})`);
    console.log(`Decimal places: ${customCurrency.decimalPlaces}`);
    console.log(`Smallest unit: ${customCurrency.smallestUnit}`);
    
    // Test the custom currency
    const testAmount = 0.001;
    const testUnits = toSmallestUnit(testAmount, customCurrency);
    const testMargin = pctToBps(20);
    
    console.log(`\nTesting with amount: ${testAmount} ${customCurrency.code}`);
    console.log(`Amount in smallest units: ${testUnits.toString()}`);
    
    const price = calculatePrice(testUnits, testMargin, 'margin', 'identity');
    console.log(`Price with 20% margin: ${formatPrice(price, customCurrency, true)}`);
    
  } catch (error) {
    console.log(`❌ Error creating custom currency: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Starting Pricing Engine CLI...");
  
  while (true) {
    displayMenu();
    
    const choice = await question("\nSelect an option (1-7): ");
    
    try {
      switch (choice.trim()) {
        case '1':
          await singleCalculation();
          break;
        case '2':
          displayRounders();
          break;
        case '3':
          displayCurrencies();
          break;
        case '4':
          await currencyStatistics();
          break;
        case '5':
          await advancedCurrency();
          break;
        case '6':
          await batchTest();
          break;
        case '7':
          await customRounding();
          break;
        case '8':
          await customCurrency();
          break;
        case '9':
        case 'exit':
          console.log("\n👋 Goodbye! Thanks for testing the pricing engine.");
          rl.close();
          return;
        default:
          console.log("❌ Invalid option. Please select 1-9.");
      }
    } catch (error) {
      console.log(`❌ An error occurred: ${error.message}`);
    }
    
    if (choice.trim() !== '9' && choice.trim() !== 'exit') {
      await question("\nPress Enter to continue...");
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("\n\n👋 Goodbye! Thanks for testing the pricing engine.");
  rl.close();
  process.exit(0);
});

// Start the CLI
main().catch(console.error);
