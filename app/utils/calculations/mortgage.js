/**
 * Mortgage calculation utilities
 */

/**
 * Calculate monthly mortgage payment
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as percentage
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment amount
 */
export const calculateMortgagePayment = (principal, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1);
};

/**
 * Calculate remaining mortgage balance after a certain number of payments
 * @param {number} principal - Original loan amount
 * @param {number} annualRate - Annual interest rate as percentage
 * @param {number} totalMonths - Total number of months in the loan term
 * @param {number} monthsPaid - Number of months already paid
 * @returns {number} Remaining balance
 */
export const calculateRemainingBalance = (principal, annualRate, totalMonths, monthsPaid) => {
  if (monthsPaid >= totalMonths) return 0;

  const monthlyRate = annualRate / 100 / 12;
  const remaining = principal * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsPaid)) /
                   (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.max(0, remaining);
};

/**
 * Calculate total interest paid over the life of a loan
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as percentage
 * @param {number} years - Loan term in years
 * @returns {number} Total interest paid
 */
export const calculateTotalInterest = (principal, annualRate, years) => {
  const monthlyPayment = calculateMortgagePayment(principal, annualRate, years);
  const totalPaid = monthlyPayment * years * 12;
  return totalPaid - principal;
};

/**
 * Calculate home equity percentage
 * @param {number} homeValue - Current home value
 * @param {number} remainingMortgage - Remaining mortgage balance
 * @returns {number} Equity percentage (0-100)
 */
export const calculateEquityPercent = (homeValue, remainingMortgage) => {
  if (homeValue === 0) return 0;
  return ((homeValue - remainingMortgage) / homeValue) * 100;
};
