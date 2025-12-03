/**
 * Formatting utility functions
 */

/**
 * Format a number as currency (no decimals)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

/**
 * Format a number as a percentage with specified decimal places
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return value.toFixed(decimals) + '%';
};

/**
 * Format a strategy key to a display name
 * @param {string} strategyKey - The strategy key (e.g., 'buyToLive')
 * @returns {string} Display name (e.g., 'Own Your Home')
 */
export const formatStrategyName = (strategyKey) => {
  const nameMap = {
    'buyToLive': 'Own Your Home',
    'buyToRent': 'Buy Rental Property',
    'rentToLive': 'Rent & Invest More',
    'stocksOnly': 'Skip Homeownership'
  };
  return nameMap[strategyKey] || strategyKey;
};

/**
 * Format a large number with K/M suffix
 * @param {number} value - The value to format
 * @returns {string} Formatted string with suffix
 */
export const formatCompact = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
};
