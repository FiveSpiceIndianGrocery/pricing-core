# Changelog

All notable changes to PricingCore will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2024-12-19

### ⚠️ BREAKING CHANGES
- **calculatePrice() function signature changed** - Added strategy parameter for markup strategies
  - Old: `calculatePrice(cost, margin, rounding)`
  - New: `calculatePrice(cost, markup, strategy, rounding)`
  - Default strategy is 'margin' for backward compatibility
  - Use `calculatePriceWithMargin()` for legacy behavior

### Added
- **Multiple markup strategies** for different business models:
  - `margin`: Margin on selling price (original behavior)
  - `costPlus`: Fixed percentage added to cost
  - `keystone`: Traditional retail markup (double cost)
  - `keystonePlus`: Keystone plus additional percentage
  - `fixedAmount`: Fixed amount added to cost
  - `targetMargin`: Target margin on cost
  - `markupOnCost`: Percentage markup on cost
- **Convenience functions** for each strategy:
  - `calculateCostPlusPrice()`
  - `calculateKeystonePrice()`
  - `calculateKeystonePlusPrice()`
  - `calculateFixedAmountPrice()`
  - `calculateMarkupOnCostPrice()`
- **Business use case examples** for different industries
- **Strategy selection guide** for choosing the right markup approach
- **Enhanced version management script** with major version support

### Changed
- Enhanced `calculatePrice()` function to support multiple markup strategies
- Updated examples to demonstrate all new markup strategies
- Enhanced CLI to work with new function signatures
- Improved documentation with strategy selection guide
- Enhanced version management script for better major version handling

### Deprecated
- `calculatePrice(cost, margin, rounding)` - Use `calculatePrice(cost, margin, 'margin', rounding)` instead
- Legacy function `calculatePriceWithMargin()` provided for backward compatibility

### Migration Guide
For existing users, update your code as follows:

```javascript
// Old way (still works but deprecated)
const price = calculatePrice(cost, margin, 'charm99');

// New way (recommended)
const price = calculatePrice(cost, margin, 'margin', 'charm99');

// Or use convenience function
const price = calculatePriceWithMargin(cost, margin, 'charm99');

// New strategies
const costPlusPrice = calculatePrice(cost, markup, 'costPlus', 'ceilStepUSD');
const keystonePrice = calculatePrice(cost, 0, 'keystone', 'identity');
```

## [1.0.15] - 2024-12-19

### Added
- Automated version management
- Enhanced security policies
- GitHub Actions privacy controls

### Changed
- Repository renamed to pricing-core
- Package branding updated to PricingCore

### Fixed
- Security vulnerability reporting process
- GitHub Actions permissions

## [1.0.0] - 2024-08-17

### Added
- High-precision pricing engine with BigInt
- 180+ currency support via ISO 4217
- Multiple rounding strategies
- CLI testing environment
- Comprehensive examples
- TypeScript support
