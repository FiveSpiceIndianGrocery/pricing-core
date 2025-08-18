# PricingCore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![ES Modules](https://img.shields.io/badge/ES%20Modules-✓-green.svg)](https://nodejs.org/api/esm.html)

A high-precision, **currency-agnostic** pricing engine built in Node.js using BigInt for financial calculations. Perfect for e-commerce, retail, and financial applications that need accurate pricing across multiple currencies.

## 🚀 **Quick Start**

```bash
npm install pricing-core
# Install specific version
npm install pricing-core@3.0.1
```

```javascript
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from 'pricing-core';

// Calculate price with 30% margin
const cost = toSmallestUnit(2.50, 'USD');  // $2.50 → 250 cents
const margin = pctToBps(30);                // 30% → 3000 bps
const price = calculatePrice(cost, margin, 'margin', 'ceilStepUSD'); // Round to nickels

console.log(formatPrice(price, 'USD', true)); // "$3.60"
```

## 🎯 **Why PricingCore?**

- **🔢 BigInt Precision** - No floating-point errors in financial calculations
- **🌍 180+ Currencies** - Full ISO 4217 support via currency-codes package
- **⚡ High Performance** - Integer-only arithmetic for maximum speed
- **🔧 Developer Friendly** - Clean API, comprehensive examples, ES modules
- **📱 Universal** - Works in Node.js, browsers, and edge environments

## 🏗️ **Architecture & Design**

### **Core Principles**
- **Integer-only arithmetic** using BigInt for maximum precision
- **Currency-agnostic** design supporting any decimal configuration
- **Strategy-based pricing** for different business models
- **Immutable calculations** with no side effects
- **Zero dependencies** beyond Node.js built-ins

### **Performance Characteristics**
- **O(1) time complexity** for all pricing calculations
- **Memory efficient** with BigInt operations
- **No garbage collection pressure** from floating-point operations
- **Deterministic results** across all environments

## 📚 **Core API**

### **Main Pricing Function**

#### `calculatePrice(costUnits, markupValue, strategy, rounding)`

The heart of the pricing engine. Calculate selling prices using different markup strategies.

**Parameters:**
- `costUnits` (BigInt | number): Cost in smallest currency units (e.g., cents)
- `markupValue` (BigInt | number): Markup amount based on strategy
- `strategy` (string): Markup strategy to use (default: 'margin')
- `rounding` (string | function): Rounding strategy or custom function

**Returns:** BigInt - Price in smallest currency units

**Supported Strategies:**
- **`margin`**: Margin on selling price (price = cost / (1 - margin))
- **`costPlus`**: Fixed percentage added to cost (price = cost * (1 + markup))
- **`keystone`**: Traditional retail markup (price = cost * 2)
- **`keystonePlus`**: Keystone plus additional percentage (price = cost * 2 * (1 + markup))
- **`fixedAmount`**: Fixed amount added to cost (price = cost + markup)
- **`targetMargin`**: Target margin on cost (price = cost / (1 - margin))
- **`markupOnCost`**: Percentage markup on cost (price = cost * (1 + markup))

### **Convenience Functions**

```javascript
// Legacy compatibility
calculatePriceWithMargin(cost, margin, rounding)

// Strategy-specific functions
calculateCostPlusPrice(cost, markup, rounding)
calculateKeystonePrice(cost, rounding)
calculateKeystonePlusPrice(cost, additionalMarkup, rounding)
calculateFixedAmountPrice(cost, fixedAmount, rounding)
calculateMarkupOnCostPrice(cost, markup, rounding)
```

### **Utility Functions**

```javascript
// Convert percentage to basis points (30% → 3000)
pctToBps(30)

// Convert decimal to smallest units ($2.50 → 250 cents)
toSmallestUnit(2.50, 'USD')

// Convert from smallest units back to decimal (250 cents → $2.50)
fromSmallestUnit(250, 'USD')

// Format price with currency symbols
formatPrice(250, 'USD', true) // "$2.50"
```

## 🌍 **Currency Support**

### **Built-in Currencies**
180+ currencies via ISO 4217 standard, automatically updated:

```javascript
// Major currencies
'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD'

// Zero-decimal currencies (like JPY)
'JPY', 'KRW', 'XOF', 'XAF'

// High-precision currencies (like BTC)
'BTC', 'ETH' // Custom with 8+ decimal places
```

### **Custom Currencies**
Create currencies for any use case:

```javascript
import { createCurrency } from 'pricing-core';

// Crypto currency
const btc = createCurrency('BTC', '₿', 8);
const satoshis = toSmallestUnit(0.001, btc); // 100000n

// Local market currency
const local = createCurrency('LOCAL', 'L', 3);
const amount = toSmallestUnit(12.345, local);
```

## 🎯 **Rounding Strategies**

### **Built-in Strategies**
```javascript
'identity'      // No rounding
'ceilStep5'     // Round up to next 5¢
'ceilStep10'    // Round up to next 10¢
'ceilStepUSD'   // Round up to next nickel
'ceilStepEUR'   // Round up to next 5 centimes
'ceilStepJPY'   // Round up to next yen
'charm99'       // Force .99 ending
```

### **Custom Rounding**
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

const price = calculatePrice(cost, margin, 'margin', roundToQuarter);
```

## 💻 **Implementation Examples**

### **Frontend (Browser)**

```javascript
// ES6 modules in browser
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from 'https://unpkg.com/pricing-core@latest/src/index.js';

// React component
function PricingCalculator({ cost, margin, currency }) {
  const costUnits = toSmallestUnit(cost, currency);
  const marginBps = pctToBps(margin);
  const price = calculatePrice(costUnits, marginBps, 'margin', 'charm99');
  
  return (
    <div>
      <p>Cost: {formatPrice(cost, currency)}</p>
      <p>Price: {formatPrice(price, currency, true)}</p>
    </div>
  );
}
```

### **Backend (Node.js)**

```javascript
// Express.js API endpoint
app.post('/api/calculate-price', (req, res) => {
  const { cost, margin, currency, strategy, rounding } = req.body;
  
  try {
    const costUnits = toSmallestUnit(cost, currency);
    const marginBps = pctToBps(margin);
    const price = calculatePrice(costUnits, marginBps, strategy, rounding);
    
    res.json({
      cost: formatPrice(cost, currency),
      price: formatPrice(price, currency, true),
      strategy,
      currency
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### **Batch Processing**

```javascript
// Process multiple products efficiently
const products = [
  { cost: 5.99, margin: 25, currency: 'USD', strategy: 'margin' },
  { cost: 12.50, margin: 30, currency: 'EUR', strategy: 'costPlus' },
  { cost: 1500, margin: 20, currency: 'JPY', strategy: 'keystone' }
];

const results = products.map(product => {
  const costUnits = toSmallestUnit(product.cost, product.currency);
  const marginBps = pctToBps(product.margin);
  const price = calculatePrice(costUnits, marginBps, product.strategy, 'identity');
  
  return {
    ...product,
    price: formatPrice(price, product.currency, true),
    priceUnits: price.toString()
  };
});
```

### **E-commerce Integration**

```javascript
// Shopify-like pricing rules
class PricingEngine {
  constructor() {
    this.markupRules = new Map();
  }
  
  addRule(category, strategy, markup) {
    this.markupRules.set(category, { strategy, markup });
  }
  
  calculatePrice(product) {
    const rule = this.markupRules.get(product.category);
    if (!rule) return product.cost;
    
    const costUnits = toSmallestUnit(product.cost, product.currency);
    const markupBps = pctToBps(rule.markup);
    
    return calculatePrice(costUnits, markupBps, rule.strategy, 'ceilStepUSD');
  }
}

// Usage
const engine = new PricingEngine();
engine.addRule('electronics', 'keystone', 0);        // 2x markup
engine.addRule('clothing', 'margin', 40);            // 40% margin
engine.addRule('food', 'costPlus', 300);             // 300% markup
```

### **Financial Services**

```javascript
// Loan interest calculations
function calculateLoanPayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  const costUnits = toSmallestUnit(principal, 'USD');
  
  // Calculate monthly payment using cost-plus strategy
  const monthlyPayment = calculatePrice(
    costUnits, 
    pctToBps(monthlyRate * 100), 
    'costPlus', 
    'ceilStepUSD'
  );
  
  return {
    principal: formatPrice(principal, 'USD'),
    monthlyPayment: formatPrice(monthlyPayment, 'USD', true),
    totalInterest: formatPrice(monthlyPayment * BigInt(months) - costUnits, 'USD', true)
  };
}
```

## 🔧 **Advanced Usage**

### **Custom Markup Strategies**

```javascript
// Dynamic pricing based on demand
function calculateDynamicPrice(cost, baseMarkup, demandMultiplier) {
  const adjustedMarkup = baseMarkup * demandMultiplier;
  const costUnits = toSmallestUnit(cost, 'USD');
  
  return calculatePrice(costUnits, pctToBps(adjustedMarkup), 'costPlus', 'identity');
}

// Seasonal pricing
const seasonalMarkups = {
  'off-season': 20,
  'regular': 35,
  'peak': 60
};

const price = calculateDynamicPrice(25.00, 35, seasonalMarkups['peak']);
```

### **Multi-Currency Batch Processing**

```javascript
// Process orders in multiple currencies
async function processInternationalOrders(orders) {
  const results = await Promise.all(
    orders.map(async (order) => {
      const costUnits = toSmallestUnit(order.cost, order.currency);
      const marginBps = pctToBps(order.margin);
      
      // Use different strategies based on region
      const strategy = order.region === 'EU' ? 'margin' : 'costPlus';
      const rounding = order.currency === 'JPY' ? 'ceilStepJPY' : 'ceilStepUSD';
      
      const price = calculatePrice(costUnits, marginBps, strategy, rounding);
      
      return {
        orderId: order.id,
        cost: formatPrice(order.cost, order.currency),
        price: formatPrice(price, order.currency, true),
        strategy,
        currency: order.currency
      };
    })
  );
  
  return results;
}
```

### **Error Handling & Validation**

```javascript
function safeCalculatePrice(cost, margin, strategy, rounding) {
  try {
    // Validate inputs
    if (cost < 0) throw new Error('Cost cannot be negative');
    if (margin < 0 || margin >= 100) throw new Error('Margin must be 0-99%');
    
    const costUnits = toSmallestUnit(cost, 'USD');
    const marginBps = pctToBps(margin);
    
    return {
      success: true,
      price: calculatePrice(costUnits, marginBps, strategy, rounding),
      costUnits: costUnits.toString(),
      marginBps
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      cost,
      margin,
      strategy
    };
  }
}
```

## 📦 **Package Integration**

### **As a Dependency**

```json
{
  "dependencies": {
    "pricing-core": "^2.0.0"
  }
}
```

### **Bundle Integration**

```javascript
// Webpack/Rollup configuration
import { calculatePrice } from 'pricing-core';

// Tree-shaking friendly - only import what you need
export { calculatePrice, pctToBps, toSmallestUnit, formatPrice };
```

### **TypeScript Support**

```typescript
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from 'pricing-core';

interface PricingRequest {
  cost: number;
  margin: number;
  currency: string;
  strategy: 'margin' | 'costPlus' | 'keystone';
}

function processPricingRequest(request: PricingRequest): string {
  const costUnits = toSmallestUnit(request.cost, request.currency);
  const marginBps = pctToBps(request.margin);
  const price = calculatePrice(costUnits, marginBps, request.strategy, 'identity');
  
  return formatPrice(price, request.currency, true);
}
```

## 🧪 **Testing & Development**

### **Unit Tests**

```javascript
import { calculatePrice, pctToBps, toSmallestUnit } from 'pricing-core';

describe('Pricing Engine', () => {
  test('margin strategy calculation', () => {
    const cost = toSmallestUnit(10.00, 'USD');
    const margin = pctToBps(30);
    const price = calculatePrice(cost, margin, 'margin', 'identity');
    
    expect(Number(price)).toBe(1429); // $14.29
  });
  
  test('keystone strategy', () => {
    const cost = toSmallestUnit(25.00, 'USD');
    const price = calculatePrice(cost, 0, 'keystone', 'identity');
    
    expect(Number(price)).toBe(5000); // $50.00
  });
});
```

### **Performance Testing**

```javascript
// Benchmark pricing calculations
function benchmarkPricing() {
  const iterations = 100000;
  const cost = toSmallestUnit(100.00, 'USD');
  const margin = pctToBps(25);
  
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    calculatePrice(cost, margin, 'margin', 'identity');
  }
  
  const end = performance.now();
  const avgTime = (end - start) / iterations;
  
  console.log(`Average calculation time: ${avgTime.toFixed(6)}ms`);
  console.log(`Operations per second: ${(1000 / avgTime).toFixed(0)}`);
}
```

## 🚀 **Deployment Considerations**

### **Environment Support**
- **Node.js**: 14.0.0+ (ES modules)
- **Browsers**: Modern browsers with BigInt support
- **Edge**: Cloudflare Workers, Vercel Edge Functions
- **Mobile**: React Native, Capacitor, Cordova

### **Bundle Size**
- **Core**: ~15KB minified + gzipped
- **With currencies**: ~45KB minified + gzipped
- **Tree-shaking**: Import only what you need

### **Performance Tips**
```javascript
// Cache frequently used values
const USD_CONFIG = { code: 'USD', symbol: '$', decimalPlaces: 2 };
const COMMON_MARGINS = {
  retail: pctToBps(40),
  wholesale: pctToBps(20),
  premium: pctToBps(60)
};

// Use in hot paths
function calculateRetailPrice(cost) {
  const costUnits = toSmallestUnit(cost, USD_CONFIG);
  return calculatePrice(costUnits, COMMON_MARGINS.retail, 'margin', 'ceilStepUSD');
}
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built for developers, by developers. No floating-point errors, no currency limitations, just precise pricing calculations.** 🎯✨
