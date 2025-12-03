/**
 * Tax calculation utilities
 */

import { TAX_BRACKETS } from '../constants';

/**
 * Calculate income taxes (federal + state)
 * @param {number} grossIncome - Annual gross income
 * @param {string} filingStatus - Filing status ('single', 'married', 'headOfHousehold')
 * @param {number} stateTaxRate - State tax rate as percentage
 * @returns {object} Tax breakdown { federalTax, stateTax, totalTaxes, afterTaxIncome, effectiveTaxRate }
 */
export const calculateIncomeTaxes = (grossIncome, filingStatus, stateTaxRate) => {
  const brackets = TAX_BRACKETS[filingStatus] || TAX_BRACKETS.single;

  let federalTax = 0;
  let remainingIncome = grossIncome;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
    federalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    previousLimit = bracket.limit;
  }

  const stateTax = grossIncome * (stateTaxRate / 100);
  const totalTaxes = federalTax + stateTax;
  const afterTaxIncome = grossIncome - totalTaxes;
  const effectiveTaxRate = (totalTaxes / grossIncome) * 100;

  return {
    federalTax,
    stateTax,
    totalTaxes,
    afterTaxIncome,
    monthlyAfterTaxIncome: afterTaxIncome / 12,
    effectiveTaxRate
  };
};

/**
 * Calculate tax benefits from mortgage interest deduction
 * @param {number} interestPaid - Annual interest paid on mortgage
 * @param {number} propertyTaxPaid - Annual property tax paid
 * @param {number} standardDeduction - Standard deduction amount
 * @param {number} marginalTaxRate - Marginal tax rate as percentage
 * @returns {number} Tax benefit amount
 */
export const calculateMortgageInterestDeduction = (
  interestPaid,
  propertyTaxPaid,
  standardDeduction,
  marginalTaxRate
) => {
  const totalItemized = interestPaid + propertyTaxPaid;

  if (totalItemized > standardDeduction) {
    return (totalItemized - standardDeduction) * (marginalTaxRate / 100);
  }

  return 0;
};

/**
 * Calculate tax benefits from rental property depreciation and expenses
 * @param {number} buildingValue - Value of building (excluding land)
 * @param {number} annualRentalIncome - Annual rental income
 * @param {number} annualExpenses - Annual rental expenses
 * @param {number} marginalTaxRate - Marginal tax rate as percentage
 * @param {number} depreciationYears - Number of years to depreciate (default 27.5)
 * @returns {number} Tax benefit amount
 */
export const calculateRentalTaxBenefits = (
  buildingValue,
  annualRentalIncome,
  annualExpenses,
  marginalTaxRate,
  depreciationYears = 27.5
) => {
  const annualDepreciation = buildingValue / depreciationYears;
  const netRentalIncome = annualRentalIncome - annualExpenses - annualDepreciation;

  // If rental property shows a loss, can deduct up to $25,000
  if (netRentalIncome < 0) {
    const deductibleLoss = Math.min(Math.abs(netRentalIncome), 25000);
    return deductibleLoss * (marginalTaxRate / 100);
  }

  // If profitable, depreciation still provides tax benefit
  return annualDepreciation * (marginalTaxRate / 100);
};
