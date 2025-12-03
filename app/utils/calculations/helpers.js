/**
 * Helper calculation utilities
 */

/**
 * Calculate compound growth over time
 * @param {number} principal - Initial amount
 * @param {number} annualRate - Annual growth rate as percentage
 * @param {number} years - Number of years
 * @returns {number} Final value after growth
 */
export const calculateCompoundGrowth = (principal, annualRate, years) => {
  return principal * Math.pow(1 + annualRate / 100, years);
};

/**
 * Calculate future value of recurring contributions
 * @param {number} contribution - Annual contribution amount
 * @param {number} annualRate - Annual return rate as percentage
 * @param {number} years - Number of years of contributions
 * @returns {number} Future value of all contributions
 */
export const calculateFutureValueOfContributions = (contribution, annualRate, years) => {
  let total = 0;
  for (let y = 1; y <= years; y++) {
    const yearsToGrow = years - y;
    total += contribution * Math.pow(1 + annualRate / 100, yearsToGrow);
  }
  return total;
};

/**
 * Calculate dividend accumulation over time
 * @param {number} portfolioValue - Current portfolio value
 * @param {number} dividendYield - Dividend yield as percentage
 * @param {number} yearsToAccumulate - Years to accumulate dividends
 * @param {number} growthRate - Annual growth rate for reinvestment
 * @param {boolean} reinvest - Whether dividends are reinvested
 * @returns {number} Total dividend value
 */
export const calculateDividendAccumulation = (
  portfolioValue,
  dividendYield,
  yearsToAccumulate,
  growthRate,
  reinvest
) => {
  let totalDividends = 0;

  for (let year = 1; year <= yearsToAccumulate; year++) {
    const dividendPayment = portfolioValue * (dividendYield / 100);
    const yearsToGrow = yearsToAccumulate - year;

    if (reinvest) {
      totalDividends += dividendPayment * Math.pow(1 + growthRate / 100, yearsToGrow);
    } else {
      totalDividends += dividendPayment;
    }
  }

  return totalDividends;
};

/**
 * Find the year when one value surpasses another
 * @param {Array} values1 - Array of values for strategy 1
 * @param {Array} values2 - Array of values for strategy 2
 * @returns {number|null} Year of crossover, or null if no crossover
 */
export const findCrossoverYear = (values1, values2) => {
  for (let year = 1; year < values1.length; year++) {
    if (values1[year] > values2[year] && values1[year - 1] <= values2[year - 1]) {
      return year;
    }
  }
  return null;
};

/**
 * Calculate Year-over-Year growth rate
 * @param {number} currentValue - Current year value
 * @param {number} previousValue - Previous year value
 * @returns {number} Growth rate as percentage
 */
export const calculateYoYGrowth = (currentValue, previousValue) => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * @param {number} beginningValue - Starting value
 * @param {number} endingValue - Ending value
 * @param {number} years - Number of years
 * @returns {number} CAGR as percentage
 */
export const calculateCAGR = (beginningValue, endingValue, years) => {
  if (beginningValue === 0 || years === 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
};
