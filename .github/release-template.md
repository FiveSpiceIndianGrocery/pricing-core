## 🎉 What's New in PricingCore v${{ github.ref_name }}

### ✨ Features Added
- 

### 🔧 Improvements
- 

### 🐛 Bug Fixes
- 

### 📚 Documentation
- 

### 🔒 Security
- 

---

## 📦 Installation

```bash
npm install pricing-core
```

## 🚀 Quick Start

```javascript
import { calculatePrice, pctToBps, toSmallestUnit, formatPrice } from 'pricing-core';

const cost = toSmallestUnit(2.50, 'USD');
const margin = pctToBps(30);
const price = calculatePrice(cost, margin, 'ceilStepUSD');

console.log(formatPrice(price, 'USD', true)); // "$3.60"
```

## 📊 Breaking Changes

> **None** - This is a backward-compatible release.

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/pricing-core
- **Documentation**: https://github.com/FiveSpiceIndianGrocery/pricing-core#readme
- **Issues**: https://github.com/FiveSpiceIndianGrocery/pricing-core/issues

---

**Thank you for using PricingCore! 🚀**

*Built with ❤️ for accurate financial calculations*
