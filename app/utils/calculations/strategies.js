/**
 * Main strategy calculation logic
 *
 * This file contains the core calculations for all 4 investment strategies:
 * 1. Buy To Live (Own Your Home)
 * 2. Buy To Rent (Buy Rental Property)
 * 3. Rent To Live (Rent & Invest More)
 * 4. Stocks Only (Skip Homeownership)
 */

import { calculateMortgagePayment, calculateRemainingBalance } from './mortgage';
import { calculateIncomeTaxes, calculateMortgageInterestDeduction, calculateRentalTaxBenefits } from './taxes';
import { calculateCompoundGrowth, calculateFutureValueOfContributions } from './helpers';

/**
 * Calculate all strategy results for all years
 * @param {object} params - All calculation parameters
 * @returns {object} Complete calculations for all strategies
 */
export const calculateAllStrategies = (params) => {
  // Calculate taxes and income
  const taxes = calculateIncomeTaxes(params.yearlyIncome, params.filingStatus, params.stateTaxRate);
  const monthlyIncome = taxes.monthlyAfterTaxIncome;

  // Calculate total monthly living expenses
  const totalMonthlyLivingExpenses =
    params.monthlyGroceries +
    params.monthlyTransportation +
    params.monthlyInsurance +
    params.monthlyUtilities +
    params.monthlySubscriptions +
    params.monthlyOther;

  // Initialize results arrays
  const results = {
    buyToLive: [],
    buyToRent: [],
    rentToLive: [],
    stocksOnly: [],
    taxes: {
      ...taxes,
      grossIncome: params.yearlyIncome,
    },
    livingExpenses: {
      monthlyTotal: totalMonthlyLivingExpenses,
      annualTotal: totalMonthlyLivingExpenses * 12,
    }
  };

  // Mortgage calculations (shared by buyToLive and buyToRent)
  const downPayment = params.housePrice * (params.downPaymentPercent / 100);
  const loanAmount = params.housePrice - downPayment;
  const monthlyMortgage = calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears);
  const monthlyPropertyTax = (params.housePrice * (params.propertyTaxRate / 100)) / 12;
  const monthlyMaintenance = (params.housePrice * (params.maintenancePercent / 100)) / 12;
  const needsPMI = params.downPaymentPercent < params.pmiThreshold;
  const monthlyPMI = needsPMI ? (loanAmount * (params.pmiRate / 100)) / 12 : 0;

  // Track cumulative tax benefits
  let cumulativeTaxBenefitsLive = 0;
  let cumulativeTaxBenefitsRent = 0;

  // Calculate for each year
  for (let year = 0; year <= params.yearsToAnalyze; year++) {
    const month = year * 12;
    const homeValue = params.housePrice * Math.pow(1 + params.homeAppreciation / 100, year);
    const remainingMortgage = calculateRemainingBalance(loanAmount, params.mortgageRate, params.loanTermYears * 12, month);
    const equityPercent = ((homeValue - remainingMortgage) / homeValue) * 100;
    const currentPMI = (needsPMI && equityPercent < params.pmiThreshold) ? monthlyPMI : 0;

    // ==================== BUY TO LIVE (Own Your Home) ====================
    const buyToLiveResult = calculateBuyToLive({
      year,
      params,
      monthlyIncome,
      totalMonthlyLivingExpenses,
      homeValue,
      remainingMortgage,
      monthlyMortgage,
      monthlyPropertyTax,
      monthlyMaintenance,
      currentPMI,
      downPayment,
      results: results.buyToLive
    });

    // Calculate tax benefits for Buy To Live
    if (params.enableTaxBenefits && year > 0) {
      const prevMortgage = results.buyToLive[year - 1].remainingMortgage;
      const principalPaid = prevMortgage - remainingMortgage;
      const interestPaid = (monthlyMortgage * 12) - principalPaid;
      const propertyTaxAnnual = monthlyPropertyTax * 12;

      const taxBenefit = calculateMortgageInterestDeduction(
        interestPaid,
        propertyTaxAnnual,
        params.standardDeduction,
        params.marginalTaxRate
      );

      cumulativeTaxBenefitsLive += taxBenefit;
      buyToLiveResult.taxBenefit = taxBenefit;
    }

    buyToLiveResult.netWorth += cumulativeTaxBenefitsLive;
    results.buyToLive.push(buyToLiveResult);

    // ==================== BUY TO RENT (Buy Rental Property) ====================
    const buyToRentResult = calculateBuyToRent({
      year,
      params,
      monthlyIncome,
      totalMonthlyLivingExpenses,
      homeValue,
      remainingMortgage,
      monthlyMortgage,
      monthlyPropertyTax,
      monthlyPMI: currentPMI,
      downPayment,
      results: results.buyToRent
    });

    // Calculate tax benefits for Buy To Rent
    if (params.enableTaxBenefits && year > 0) {
      const buildingValue = params.housePrice * (1 - params.landValuePercent / 100);
      const annualRentalIncome = buyToRentResult.monthlyRent * 12;
      const annualExpenses = buyToRentResult.monthlyExpenses * 12;

      const taxBenefit = calculateRentalTaxBenefits(
        buildingValue,
        annualRentalIncome,
        annualExpenses,
        params.marginalTaxRate
      );

      cumulativeTaxBenefitsRent += taxBenefit;
      buyToRentResult.taxBenefit = taxBenefit;
    }

    buyToRentResult.netWorth += cumulativeTaxBenefitsRent;
    results.buyToRent.push(buyToRentResult);

    // ==================== RENT TO LIVE (Rent & Invest More) ====================
    const rentToLiveResult = calculateRentToLive({
      year,
      params,
      monthlyIncome,
      totalMonthlyLivingExpenses,
      results: results.rentToLive
    });

    results.rentToLive.push(rentToLiveResult);

    // ==================== STOCKS ONLY (Skip Homeownership) ====================
    const stocksOnlyResult = calculateStocksOnly({
      year,
      params,
      monthlyIncome,
      totalMonthlyLivingExpenses,
      results: results.stocksOnly
    });

    results.stocksOnly.push(stocksOnlyResult);
  }

  return results;
};

/**
 * Calculate Buy To Live strategy (Own Your Home)
 */
function calculateBuyToLive(config) {
  const {
    year,
    params,
    monthlyIncome,
    totalMonthlyLivingExpenses,
    homeValue,
    remainingMortgage,
    monthlyMortgage,
    monthlyPropertyTax,
    monthlyMaintenance,
    currentPMI,
    downPayment,
    results
  } = config;

  const homeEquity = homeValue - remainingMortgage;

  // Monthly housing cost = mortgage + PMI + property tax + insurance + HOA + maintenance
  const monthlyHousingCost = monthlyMortgage + currentPMI + monthlyPropertyTax +
                            params.homeInsurance + params.hoaFees + monthlyMaintenance;

  // Monthly leftover = income - housing - living expenses
  const monthlyLeftover = monthlyIncome - monthlyHousingCost - totalMonthlyLivingExpenses;

  // Initial stock investment (cash not used for down payment)
  const initialStockInvestment = params.initialCash - downPayment;
  let stockValueBase = calculateCompoundGrowth(initialStockInvestment, params.stockReturn, year);

  // Add monthly contributions from leftover income
  let monthlyContributions = 0;
  if (year > 0 && monthlyLeftover > 0) {
    monthlyContributions = calculateFutureValueOfContributions(
      monthlyLeftover * 12,
      params.stockReturn,
      year
    );
  }

  // Calculate dividends
  let dividends = 0;
  let annualDividendIncome = 0;
  if (params.dividendYield > 0 && year > 0) {
    for (let y = 1; y <= year; y++) {
      const contributionsSoFar = monthlyLeftover > 0 ? monthlyLeftover * 12 * y : 0;
      const baseValueAtYear = calculateCompoundGrowth(initialStockInvestment, params.stockReturn, y);
      const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y / 2));
      const portfolioValueAtYear = baseValueAtYear + contributionsToYear;

      const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
      const yearsToGrow = year - y;

      if (params.dividendsReinvested) {
        dividends += calculateCompoundGrowth(dividendAtYear, params.stockReturn, yearsToGrow);
      } else {
        dividends += dividendAtYear;
      }

      if (y === year) {
        annualDividendIncome = dividendAtYear;
      }
    }
  }

  const totalStockValue = stockValueBase + monthlyContributions + dividends;
  const monthlyDividendIncome = annualDividendIncome / 12;
  const monthlyDividendOffset = !params.dividendsReinvested ? monthlyDividendIncome : 0;

  // Net monthly cash flow = income + dividends - housing - living
  const netMonthlyCashFlow = monthlyIncome + monthlyDividendOffset - monthlyHousingCost - totalMonthlyLivingExpenses;

  return {
    year,
    netWorth: homeEquity + totalStockValue,
    homeEquity,
    homeValue,
    remainingMortgage,
    stockValue: totalStockValue,
    stockValueBase,
    monthlyContributions,
    dividends,
    monthlyPayment: monthlyHousingCost,
    monthlyPMI: currentPMI,
    monthlyLeftover,
    monthlyDividendIncome,
    netMonthlyCashFlow,
    taxBenefit: 0
  };
}

/**
 * Calculate Buy To Rent strategy (Buy Rental Property)
 * FIXED: Now correctly calculates leftover as income + rental cash flow - living expenses
 */
function calculateBuyToRent(config) {
  const {
    year,
    params,
    monthlyIncome,
    totalMonthlyLivingExpenses,
    homeValue,
    remainingMortgage,
    monthlyMortgage,
    monthlyPropertyTax,
    monthlyPMI,
    downPayment,
    results
  } = config;

  const homeEquity = homeValue - remainingMortgage;

  // Calculate rental income
  const monthlyRent = params.useRentPercentage
    ? (params.housePrice * (params.rentPercentage / 100) / 12) * Math.pow(1 + params.rentGrowth / 100, year)
    : params.monthlyRentFixed * Math.pow(1 + params.rentGrowth / 100, year);

  const effectiveRent = monthlyRent * (1 - params.vacancyRate / 100);
  const propertyManagementFee = effectiveRent * (params.propertyManagementPercent / 100);
  const netMonthlyRent = effectiveRent - propertyManagementFee;

  // Calculate rental expenses
  const landlordInsurance = params.homeInsurance * (1 + params.landlordInsurancePremium / 100);
  const rentalMaintenance = monthlyRent * (params.maintenanceRental / 100);
  const capexReserve = monthlyRent * (params.capexReserve / 100);

  const monthlyExpenses = monthlyMortgage + monthlyPMI + monthlyPropertyTax +
                         landlordInsurance + params.hoaFees + rentalMaintenance + capexReserve;

  // Property cash flow (rental income - rental expenses)
  const propertyCashFlow = netMonthlyRent - monthlyExpenses;

  // FIXED: Personal monthly leftover = job income + property cash flow - personal living expenses
  const monthlyLeftover = monthlyIncome + propertyCashFlow - totalMonthlyLivingExpenses;

  // Calculate invested rental profits
  let rentalProfitsInvested = 0;
  if (year > 0) {
    for (let y = 1; y <= year; y++) {
      const rentAtYear = params.useRentPercentage
        ? (params.housePrice * (params.rentPercentage / 100) / 12) * Math.pow(1 + params.rentGrowth / 100, y)
        : params.monthlyRentFixed * Math.pow(1 + params.rentGrowth / 100, y);

      const effectiveRentAtYear = rentAtYear * (1 - params.vacancyRate / 100);
      const managementAtYear = effectiveRentAtYear * (params.propertyManagementPercent / 100);
      const netRentAtYear = effectiveRentAtYear - managementAtYear;

      const maintenanceAtYear = rentAtYear * (params.maintenanceRental / 100);
      const capexAtYear = rentAtYear * (params.capexReserve / 100);
      const expensesAtYear = monthlyMortgage + monthlyPropertyTax + landlordInsurance +
                            params.hoaFees + maintenanceAtYear + capexAtYear;

      const cashFlowAtYear = (netRentAtYear - expensesAtYear) * 12;
      const annualizedTurnoverCost = (rentAtYear * params.turnoverCostMonths) / params.avgTenancyYears;

      const yearsOfGrowth = year - y;
      const profitAfterTurnover = cashFlowAtYear - annualizedTurnoverCost;
      rentalProfitsInvested += profitAfterTurnover * Math.pow(1 + params.stockReturn / 100, yearsOfGrowth);
    }
  }

  // Initial stock investment
  const initialStockInvestment = params.initialCash - downPayment;
  const stockValueBase = calculateCompoundGrowth(initialStockInvestment, params.stockReturn, year);
  const totalStockValue = stockValueBase + rentalProfitsInvested;

  // Net monthly cash flow = income + property cash flow - living expenses
  const netMonthlyCashFlow = monthlyIncome + propertyCashFlow - totalMonthlyLivingExpenses;

  return {
    year,
    netWorth: homeEquity + totalStockValue,
    homeEquity,
    homeValue,
    remainingMortgage,
    stockValue: totalStockValue,
    rentalProfits: rentalProfitsInvested,
    monthlyRent: netMonthlyRent,
    monthlyExpenses,
    monthlyCashFlow: propertyCashFlow, // Property-only cash flow
    monthlyLeftover, // FIXED: Now includes living expenses
    netMonthlyCashFlow, // Total personal cash flow
    turnoverCosts: 0,
    taxBenefit: 0
  };
}

/**
 * Calculate Rent To Live strategy (Rent & Invest More)
 */
function calculateRentToLive(config) {
  const {
    year,
    params,
    monthlyIncome,
    totalMonthlyLivingExpenses,
    results
  } = config;

  const currentRent = params.monthlyRentToLive * Math.pow(1 + params.rentToLiveGrowth / 100, year);
  const monthlyRentCost = currentRent + params.renterInsurance;

  // Monthly leftover = income - rent - living expenses
  const monthlyLeftover = monthlyIncome - monthlyRentCost - totalMonthlyLivingExpenses;

  // All initial cash goes into stocks
  let stockValueBase = calculateCompoundGrowth(params.initialCash, params.stockReturn, year);

  // Add monthly contributions
  let monthlyContributions = 0;
  if (year > 0 && monthlyLeftover > 0) {
    monthlyContributions = calculateFutureValueOfContributions(
      monthlyLeftover * 12,
      params.stockReturn,
      year
    );
  }

  // Calculate dividends
  let dividends = 0;
  let annualDividendIncome = 0;
  if (params.dividendYield > 0 && year > 0) {
    for (let y = 1; y <= year; y++) {
      const contributionsSoFar = monthlyLeftover > 0 ? monthlyLeftover * 12 * y : 0;
      const baseValueAtYear = calculateCompoundGrowth(params.initialCash, params.stockReturn, y);
      const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y / 2));
      const portfolioValueAtYear = baseValueAtYear + contributionsToYear;

      const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
      const yearsToGrow = year - y;

      if (params.dividendsReinvested) {
        dividends += calculateCompoundGrowth(dividendAtYear, params.stockReturn, yearsToGrow);
      } else {
        dividends += dividendAtYear;
      }

      if (y === year) {
        annualDividendIncome = dividendAtYear;
      }
    }
  }

  const totalStockValue = stockValueBase + monthlyContributions + dividends;
  const monthlyDividendIncome = annualDividendIncome / 12;
  const monthlyDividendOffset = !params.dividendsReinvested ? monthlyDividendIncome : 0;

  // Net monthly cash flow = income + dividends - rent - living
  const monthlyCashFlow = monthlyIncome + monthlyDividendOffset - monthlyRentCost - totalMonthlyLivingExpenses;

  return {
    year,
    netWorth: totalStockValue,
    stockValue: totalStockValue,
    stockValueBase,
    monthlyContributions,
    dividends,
    monthlyRent: currentRent,
    monthlyRentCost,
    monthlyLeftover,
    monthlyDividendIncome,
    monthlyCashFlow
  };
}

/**
 * Calculate Stocks Only strategy (Skip Homeownership)
 */
function calculateStocksOnly(config) {
  const {
    year,
    params,
    monthlyIncome,
    totalMonthlyLivingExpenses,
    results
  } = config;

  // Initial investment
  let stockValueBase = calculateCompoundGrowth(params.initialCash, params.stockReturn, year);

  // Add recurring contributions if enabled
  let contributionsAccumulated = 0;
  if (params.enableRecurringContributions && year > 0) {
    const contributionsPerYear = params.contributionFrequency === 'monthly'
      ? params.contributionAmount * 12
      : params.contributionAmount;

    contributionsAccumulated = calculateFutureValueOfContributions(
      contributionsPerYear,
      params.stockReturn,
      year
    );
  }

  // Calculate dividends
  let dividends = 0;
  let annualDividendIncome = 0;
  if (params.dividendYield > 0 && year > 0) {
    for (let y = 1; y <= year; y++) {
      const contributionsSoFar = params.enableRecurringContributions
        ? (params.contributionFrequency === 'monthly' ? params.contributionAmount * 12 : params.contributionAmount) * y
        : 0;

      const baseValueAtYear = calculateCompoundGrowth(params.initialCash, params.stockReturn, y);
      const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y / 2));
      const portfolioValueAtYear = baseValueAtYear + contributionsToYear;

      const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
      const yearsToGrow = year - y;

      if (params.dividendsReinvested) {
        dividends += calculateCompoundGrowth(dividendAtYear, params.stockReturn, yearsToGrow);
      } else {
        dividends += dividendAtYear;
      }

      if (y === year) {
        annualDividendIncome = dividendAtYear;
      }
    }
  }

  const netWorth = stockValueBase + contributionsAccumulated + dividends;
  const monthlyDividendIncome = !params.dividendsReinvested ? annualDividendIncome / 12 : 0;
  const monthlyRecurringContribution = params.enableRecurringContributions ? params.contributionAmount : 0;

  // Cash flow = income + dividends - living expenses - recurring contributions
  const monthlyCashFlow = monthlyIncome + monthlyDividendIncome - totalMonthlyLivingExpenses - monthlyRecurringContribution;

  return {
    year,
    netWorth,
    stockValue: stockValueBase,
    contributions: contributionsAccumulated,
    dividends,
    monthlyCashFlow
  };
}
