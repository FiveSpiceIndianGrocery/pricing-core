# @pricing-engine/core

[![npm version](https://badge.fury.io/js/%40pricing-engine%2Fcore.svg)](https://badge.fury.io/js/%40pricing-engine%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

A high-precision, **currency-agnostic** pricing engine built in Node.js using BigInt for financial calculations. Perfect for e-commerce, retail, and financial applications that need accurate pricing across multiple currencies.

## ✨ Features

- **🔢 BigInt Precision**: All calculations use BigInt to avoid floating-point errors
- **🌍 Currency Agnostic**: Support for any currency with configurable decimal places
- **📊 Margin-Based Pricing**: Calculate prices using gross margin on selling price
- **🎯 Multiple Rounding Strategies**: Built-in and custom rounding options
- **⚡ High Performance**: Integer-only arithmetic for maximum speed
- **🔧 Extensible**: Easy to add new rounding strategies and currencies
- **📱 CLI Testing**: Interactive command-line interface for testing

## 🚀 Quick Start

### Installation

```bash
npm install @pricing-engine/core
```

### Basic Usage

```javascript
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from '@pricing-engine/core';

// Calculate price for a $2.50 item with 30% margin
const cost = toSmallestUnit(2.50, 'USD');  // Convert to cents
const margin = pctToBps(30);                // 30% → 3000 basis points
const price = calculatePrice(cost, margin, 'ceilStepUSD'); // Round to nickels

console.log(formatPrice(price, 'USD', true)); // "$3.60"
```

## 📚 API Reference

### Core Functions

#### `calculatePrice(costUnits, marginBps, rounding)`

Calculate the selling price based on cost and desired margin.

**Parameters:**
- `costUnits` (BigInt | number): Cost in smallest currency units (e.g., cents)
- `marginBps` (BigInt | number): Margin in basis points (e.g., 3000 for 30%)
- `rounding` (string | function): Rounding strategy or custom function

**Returns:** BigInt - Price in smallest currency units

**Example:**
```javascript
const cost = toSmallestUnit(10.99, 'USD');  // 1099 cents
const margin = pctToBps(35);                // 35% margin
const price = calculatePrice(cost, margin, 'charm99');
// Returns price in cents with .99 ending
```

#### `pctToBps(percentage)`

Convert percentage to basis points.

**Parameters:**
- `percentage` (number): Percentage value (e.g., 30 for 30%)

**Returns:** number - Basis points (e.g., 3000 for 30%)

### Currency Utilities

#### `toSmallestUnit(amount, currency)`

Convert decimal amount to smallest currency unit.

**Parameters:**
- `amount` (number): Amount in base currency (e.g., 2.50 for $2.50)
- `currency` (string | CurrencyConfig): Currency code or config

**Returns:** BigInt - Amount in smallest units

**Example:**
```javascript
const cents = toSmallestUnit(2.50, 'USD');     // 250n
const yen = toSmallestUnit(1000, 'JPY');       // 1000n
const euros = toSmallestUnit(5.75, 'EUR');     // 575n
```

#### `fromSmallestUnit(units, currency)`

Convert from smallest currency unit back to decimal.

**Parameters:**
- `units` (BigInt): Amount in smallest units
- `currency` (string | CurrencyConfig): Currency code or config

**Returns:** number - Amount in base currency

#### `formatPrice(amount, currency, inSmallestUnits)`

Format price with proper currency formatting.

**Parameters:**
- `amount` (BigInt | number): Amount to format
- `currency` (string | CurrencyConfig): Currency code or config
- `inSmallestUnits` (boolean): Whether amount is in smallest units

**Returns:** string - Formatted price string

**Example:**
```javascript
formatPrice(250, 'USD', true);    // "$2.50"
formatPrice(1000, 'JPY', true);   // "¥1,000"
formatPrice(575, 'EUR', true);    // "€5.75"
```

#### `createCurrency(code, symbol, decimalPlaces)`

Create a custom currency configuration.

**Parameters:**
- `code` (string): ISO currency code
- `symbol` (string): Currency symbol
- `decimalPlaces` (number): Number of decimal places

**Returns:** CurrencyConfig - Custom currency configuration

**Example:**
```javascript
const btc = createCurrency('BTC', '₿', 8);  // Bitcoin with 8 decimals
const satoshis = toSmallestUnit(0.001, btc); // 100000n
```

#### `getSupportedCurrencies()`

Get all supported currency codes.

**Returns:** string[] - Array of supported currency codes

#### `getCurrenciesByDecimalPlaces(decimalPlaces)`

Get currencies filtered by number of decimal places.

**Parameters:**
- `decimalPlaces` (number): Number of decimal places to filter by

**Returns:** string[] - Array of currency codes with the specified decimal places

**Example:**
```javascript
const zeroDecimalCurrencies = getCurrenciesByDecimalPlaces(0); // ['JPY', 'KRW', 'XOF', ...]
const twoDecimalCurrencies = getCurrenciesByDecimalPlaces(2); // ['USD', 'EUR', 'GBP', ...]
```

#### `getCurrenciesByRegion()`

Get currencies grouped by geographical region.

**Returns:** Object - Currencies grouped by region

**Example:**
```javascript
const regions = getCurrenciesByRegion();
console.log(regions['Asia Pacific']); // ['JPY', 'CNY', 'KRW', 'INR', ...]
```

#### `getCurrencyByNumber(number)`

Get currency information by ISO 4217 number.

**Parameters:**
- `number` (number): ISO 4217 currency number (e.g., 840 for USD)

**Returns:** CurrencyConfig | null - Currency configuration or null if not found

**Example:**
```javascript
const usd = getCurrencyByNumber(840); // Returns USD configuration
```

#### `getCurrenciesByCountry(country)`

Get currencies used by a specific country.

**Parameters:**
- `country` (string): Country name (case-insensitive)

**Returns:** CurrencyConfig[] - Array of currency configurations for the country

**Example:**
```javascript
const colombiaCurrencies = getCurrenciesByCountry('colombia'); // Returns COP and COU
```

#### `getISOPublishDate()`

Get the publish date of the ISO 4217 data.

**Returns:** string - Publish date in YYYY-MM-DD format

**Example:**
```javascript
const publishDate = getISOPublishDate(); // "2024-06-25"
```

#### `getCurrencyDetails(code)`

Get detailed currency information including countries and ISO number.

**Parameters:**
- `code` (string): ISO currency code

**Returns:** Object | null - Detailed currency information or null if not found

**Example:**
```javascript
const eurDetails = getCurrencyDetails('EUR');
console.log(eurDetails.countries); // ['andorra', 'austria', 'belgium', ...]
```

## 🌍 Supported Currencies

The package includes **complete ISO 4217 currency support** via the [currency-codes](https://www.npmjs.com/package/currency-codes) package, providing **180+ currencies** from around the world with automatic updates:

### Major Currencies
| Currency | Code | Symbol | Decimal Places | Smallest Unit |
|----------|------|--------|----------------|---------------|
| US Dollar | USD | $ | 2 | $0.01 |
| Euro | EUR | € | 2 | €0.01 |
| British Pound | GBP | £ | 2 | £0.01 |
| Japanese Yen | JPY | ¥ | 0 | ¥1 |
| Chinese Yuan | CNY | ¥ | 2 | ¥0.01 |
| Indian Rupee | INR | ₹ | 2 | ₹0.01 |
| Canadian Dollar | CAD | C$ | 2 | C$0.01 |
| Australian Dollar | AUD | A$ | 2 | A$0.01 |
| Swiss Franc | CHF | CHF | 2 | CHF0.01 |
| South Korean Won | KRW | ₩ | 0 | ₩1 |

### Currency Categories by Decimal Places
- **0 decimal places**: JPY, KRW, XOF, XAF, KMF, CLP, DJF, GNF, ISK, PYG, VUV, XPF, XDR, XAU, XAG, XPT, XPD, XTS, XXX
- **2 decimal places**: Most currencies (USD, EUR, GBP, etc.)
- **3 decimal places**: BHD, IQD, JOD, KWD, LYD, OMR, TND
- **4 decimal places**: CLF, UYW

### Regional Coverage
- **North America**: USD, CAD, MXN
- **Europe**: EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK, HUF
- **Asia Pacific**: JPY, CNY, KRW, INR, SGD, HKD, TWD, THB, MYR
- **Latin America**: BRL, ARS, CLP, COP, PEN, UYU, PYG
- **Africa**: ZAR, EGP, NGN, KES, GHS, MAD, TND, DZD
- **Middle East**: SAR, AED, QAR, KWD, BHD, OMR, JOD, LBP, ILS
- **Oceania**: AUD, NZD, FJD, PGK, WST, TOP, VUV

### Special Currencies
- **Precious Metals**: XAU (Gold), XAG (Silver), XPT (Platinum), XPD (Palladium)
- **Special Drawing Rights**: XDR (IMF SDR)
- **Testing**: XTS (Testing purposes)
- **No Currency**: XXX (Transactions without currency)

### Currency-Codes Integration

This package leverages the [currency-codes](https://www.npmjs.com/package/currency-codes) package for:
- **Automatic Updates**: Currency data is automatically updated when the underlying package updates
- **Official Data**: Uses official ISO 4217 data from the maintainer
- **Rich Metadata**: Includes country information, ISO numbers, and currency names
- **Maintenance**: No need to manually maintain currency data

## 🎯 Rounding Strategies

### Built-in Strategies

- **`identity`**: No rounding (keep computed price as-is)
- **`ceilStep5`**: Round up to next 5¢ increment
- **`ceilStep10`**: Round up to next 10¢ increment
- **`ceilStepUSD`**: Round up to next nickel (USD-specific)
- **`ceilStepEUR`**: Round up to next 5 centimes (EUR-specific)
- **`ceilStepJPY`**: Round up to next yen (JPY-specific)
- **`ceilStepINR`**: Round up to next 5 paise (INR-specific)
- **`charm99`**: Force .99 ending for psychological pricing

### Custom Rounding

Create your own rounding functions:

```javascript
// Round to nearest quarter (25¢)
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

const price = calculatePrice(cost, margin, roundToQuarter);
```

## 📖 Examples

### Example 1: Basic USD Pricing

```javascript
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from '@pricing-engine/core';

const cost = toSmallestUnit(2.50, 'USD');  // $2.50 → 250 cents
const margin = pctToBps(30);                // 30% → 3000 bps
const price = calculatePrice(cost, margin, 'ceilStepUSD');

console.log(formatPrice(price, 'USD', true)); // "$3.60"
```

### Example 2: Multi-Currency Batch Pricing

```javascript
const products = [
  { name: 'Widget A', cost: 10.99, currency: 'USD', margin: 35 },
  { name: 'Widget B', cost: 15.50, currency: 'EUR', margin: 30 },
  { name: 'Widget C', cost: 2000, currency: 'JPY', margin: 25 }
];

products.forEach(product => {
  const costUnits = toSmallestUnit(product.cost, product.currency);
  const marginBps = pctToBps(product.margin);
  const price = calculatePrice(costUnits, marginBps, 'identity');
  
  console.log(`${product.name}: ${formatPrice(price, product.currency, true)}`);
});
```

### Example 3: Custom Currency (Crypto)

```javascript
const btc = createCurrency('BTC', '₿', 8);  // Bitcoin with 8 decimal places
const btcCost = toSmallestUnit(0.001, btc);  // 0.001 BTC → 100000 satoshis
const btcMargin = pctToBps(15);               // 15% margin

const btcPrice = calculatePrice(btcCost, btcMargin, 'identity');
console.log(formatPrice(btcPrice, btc, true)); // "₿0.00115000"
```

## 🧪 Testing

### Run Examples

```bash
npm run examples
```

### Run Tests

```bash
npm test
```

### Interactive CLI

```bash
npm run cli
```

## 🔧 Advanced Usage

### Custom Currency Configuration

```javascript
import { createCurrency } from '@pricing-engine/core';

// Create a custom currency for a local market
const localCurrency = createCurrency('LOCAL', 'L', 3);  // 3 decimal places
const amount = toSmallestUnit(12.345, localCurrency);
```

### Batch Processing

```javascript
// Process multiple items efficiently
const items = [
  { cost: 5.99, margin: 25, currency: 'USD' },
  { cost: 12.50, margin: 30, currency: 'EUR' },
  { cost: 1500, margin: 20, currency: 'JPY' }
];

const results = items.map(item => {
  const costUnits = toSmallestUnit(item.cost, item.currency);
  const marginBps = pctToBps(item.margin);
  const price = calculatePrice(costUnits, marginBps, 'identity');
  
  return {
    ...item,
    price: formatPrice(price, item.currency, true)
  };
});
```

### Error Handling

```javascript
try {
  const price = calculatePrice(cost, margin, 'unknownRounding');
} catch (error) {
  if (error.message.includes('Unknown rounding style')) {
    console.log('Invalid rounding strategy');
  } else if (error.message.includes('marginBps must be between')) {
    console.log('Invalid margin percentage');
  }
}
```

## 📦 Package Structure

```
@pricing-engine/core/
├── src/
│   ├── index.js          # Main exports
│   ├── core/
│   │   ├── calculator.js # BigInt pricing calculator
│   │   └── math.js       # Integer-safe helpers
│   ├── rounding/
│   │   ├── index.js      # Rounding registry
│   │   ├── identity.js   # No rounding
│   │   ├── ceilStep.js   # Step-based rounding
│   │   └── charm99.js    # .99 ending
│   └── currency.js       # Currency utilities
├── test/                 # Test suite
├── cli.js                # CLI testing environment
└── examples.js           # Comprehensive examples
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pricing-engine/issues)
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/pricing-engine/wiki)
- **Examples**: Run `npm run examples` for comprehensive examples

## 🔗 Related Packages

- `@pricing-engine/rounding` - Additional rounding strategies
- `@pricing-engine/currencies` - Extended currency support
- `@pricing-engine/tax` - Tax calculation utilities

---

**Made with ❤️ for accurate financial calculations**
