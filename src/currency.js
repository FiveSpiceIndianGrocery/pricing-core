/**
 * Currency utilities for the pricing engine
 * Uses currency-codes package for ISO 4217 currency data
 * @see https://www.npmjs.com/package/currency-codes
 */

import currencyCodes from 'currency-codes';

/**
 * Currency configuration object
 * @typedef {Object} CurrencyConfig
 * @property {string} code - ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
 * @property {string} symbol - Currency symbol (e.g., '$', '€', '¥')
 * @property {number} decimalPlaces - Number of decimal places (e.g., 2 for USD, 0 for JPY)
 * @property {number} smallestUnit - Value of smallest unit in base currency (e.g., 0.01 for USD, 1 for JPY)
 */

/**
 * Currency symbols mapping for major currencies
 * Note: currency-codes doesn't include symbols, so we maintain a subset
 */
const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
  CAD: 'C$', AUD: 'A$', CHF: 'CHF', KRW: '₩', BRL: 'R$',
  RUB: '₽', MXN: '$', SGD: 'S$', HKD: 'HK$', SEK: 'kr',
  NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', THB: '฿',
  TRY: '₺', UAH: '₴', AED: 'د.إ', SAR: 'ر.س', QAR: 'ر.ق',
  KWD: 'د.ك', BHD: '.د.ب', OMR: 'ر.ع.', JOD: 'د.ا', LBP: 'ل.ل',
  ILS: '₪', IRR: '﷼', IQD: 'ع.د', LYD: 'ل.د', TND: 'د.ت',
  MAD: 'د.م.', EGP: '£', NGN: '₦', KES: 'KSh', GHS: '₵',
  ZAR: 'R', XOF: 'CFA', XAF: 'FCFA', KMF: 'CF', GNF: 'FG',
  CLP: '$', PYG: '₲', VUV: 'VT', XPF: '₣', XDR: 'SDR',
  XAU: 'Au', XAG: 'Ag', XPT: 'Pt', XPD: 'Pd', XTS: 'Test',
  XXX: 'No Currency'
};

/**
 * Get all supported currencies from currency-codes package
 * @returns {Object} Object with currency codes as keys and CurrencyConfig as values
 */
export const CURRENCIES = (() => {
  const currencies = {};
  
  // Get all currency codes from the package
  const codes = currencyCodes.codes();
  
  codes.forEach(code => {
    const currencyData = currencyCodes.code(code);
    if (currencyData) {
      currencies[code] = {
        code: currencyData.code,
        symbol: CURRENCY_SYMBOLS[code] || code, // Use symbol if available, fallback to code
        decimalPlaces: currencyData.digits,
        smallestUnit: Math.pow(10, -currencyData.digits),
        number: currencyData.number,
        currency: currencyData.currency,
        countries: currencyData.countries
      };
    }
  });
  
  return currencies;
})();

/**
 * Convert a decimal amount to the smallest currency unit (e.g., dollars to cents)
 * @param {number} amount - Amount in base currency (e.g., 2.50 for $2.50)
 * @param {CurrencyConfig|string} currency - Currency config or ISO code
 * @returns {bigint} Amount in smallest units (e.g., 250n for $2.50)
 */
export function toSmallestUnit(amount, currency = 'USD') {
  const config = typeof currency === 'string' ? CURRENCIES[currency] : currency;
  if (!config) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  
  const multiplier = 1 / config.smallestUnit;
  return BigInt(Math.round(amount * multiplier));
}

/**
 * Convert from smallest currency unit back to decimal amount
 * @param {bigint} units - Amount in smallest units (e.g., 250n for $2.50)
 * @param {CurrencyConfig|string} currency - Currency config or ISO code
 * @returns {number} Amount in base currency (e.g., 2.50 for $2.50)
 */
export function fromSmallestUnit(units, currency = 'USD') {
  const config = typeof currency === 'string' ? CURRENCIES[currency] : currency;
  if (!config) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  
  return Number(units) * config.smallestUnit;
}

/**
 * Format a price in the specified currency
 * @param {bigint|number} amount - Amount (can be in smallest units or base currency)
 * @param {CurrencyConfig|string} currency - Currency config or ISO code
 * @param {boolean} inSmallestUnits - Whether the amount is already in smallest units
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, currency = 'USD', inSmallestUnits = false) {
  const config = typeof currency === 'string' ? CURRENCIES[currency] : currency;
  if (!config) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  
  let baseAmount;
  if (inSmallestUnits) {
    baseAmount = fromSmallestUnit(amount, config);
  } else {
    baseAmount = Number(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces
  }).format(baseAmount);
}

/**
 * Get the step size for rounding in smallest units
 * @param {number} stepAmount - Step amount in base currency (e.g., 0.05 for 5¢)
 * @param {CurrencyConfig|string} currency - Currency config or ISO code
 * @returns {bigint} Step size in smallest units
 */
export function getStepSize(stepAmount, currency = 'USD') {
  const config = typeof currency === 'string' ? CURRENCIES[currency] : currency;
  if (!config) {
    throw new Error(`Unknown currency: ${currency}`);
  }
  
  return toSmallestUnit(stepAmount, config);
}

/**
 * Create a custom currency configuration
 * @param {string} code - ISO currency code
 * @param {string} symbol - Currency symbol
 * @param {number} decimalPlaces - Number of decimal places
 * @returns {CurrencyConfig} Custom currency configuration
 */
export function createCurrency(code, symbol, decimalPlaces) {
  const smallestUnit = Math.pow(10, -decimalPlaces);
  return { code, symbol, decimalPlaces, smallestUnit };
}

/**
 * Validate if a currency code is supported
 * @param {string} code - ISO currency code
 * @returns {boolean} Whether the currency is supported
 */
export function isSupportedCurrency(code) {
  return code in CURRENCIES;
}

/**
 * Get all supported currency codes
 * @returns {string[]} Array of supported currency codes
 */
export function getSupportedCurrencies() {
  return Object.keys(CURRENCIES);
}

/**
 * Get currencies by decimal places
 * @param {number} decimalPlaces - Number of decimal places to filter by
 * @returns {string[]} Array of currency codes with the specified decimal places
 */
export function getCurrenciesByDecimalPlaces(decimalPlaces) {
  return Object.entries(CURRENCIES)
    .filter(([_, config]) => config.decimalPlaces === decimalPlaces)
    .map(([code, _]) => code);
}

/**
 * Get currencies by region (approximate grouping)
 * @returns {Object} Currencies grouped by region
 */
export function getCurrenciesByRegion() {
  return {
    'North America': ['USD', 'CAD', 'MXN'],
    'Europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'BGN', 'RON', 'HRK', 'RSD'],
    'Asia Pacific': ['JPY', 'CNY', 'KRW', 'INR', 'SGD', 'HKD', 'TWD', 'THB', 'MYR', 'IDR', 'PHP', 'VND'],
    'Latin America': ['BRL', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'PYG'],
    'Africa': ['ZAR', 'EGP', 'NGN', 'KES', 'GHS', 'MAD', 'TND', 'DZD'],
    'Middle East': ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'ILS', 'IRR', 'IQD'],
    'Oceania': ['AUD', 'NZD', 'FJD', 'PGK', 'WST', 'TOP', 'VUV']
  };
}

/**
 * Get currency information by ISO number
 * @param {number} number - ISO 4217 currency number
 * @returns {CurrencyConfig|null} Currency configuration or null if not found
 */
export function getCurrencyByNumber(number) {
  const currencyData = currencyCodes.number(number);
  if (!currencyData) return null;
  
  return CURRENCIES[currencyData.code] || null;
}

/**
 * Get currencies by country
 * @param {string} country - Country name (case-insensitive)
 * @returns {CurrencyConfig[]} Array of currency configurations for the country
 */
export function getCurrenciesByCountry(country) {
  const currencies = currencyCodes.country(country);
  return currencies.map(currency => CURRENCIES[currency.code]).filter(Boolean);
}

/**
 * Get the publish date of the ISO 4217 data
 * @returns {string} Publish date in YYYY-MM-DD format
 */
export function getISOPublishDate() {
  return currencyCodes.publishDate;
}

/**
 * Get detailed currency information
 * @param {string} code - ISO currency code
 * @returns {Object|null} Detailed currency information including countries and number
 */
export function getCurrencyDetails(code) {
  const currencyData = currencyCodes.code(code);
  if (!currencyData) return null;
  
  return {
    ...currencyData,
    symbol: CURRENCY_SYMBOLS[code] || code,
    smallestUnit: Math.pow(10, -currencyData.digits)
  };
}
