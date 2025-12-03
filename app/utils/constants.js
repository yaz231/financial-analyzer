/**
 * Constants for financial calculations
 */

// Tax brackets for 2024 (from IRS.gov)
export const TAX_BRACKETS = {
  single: [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  married: [
    { limit: 23200, rate: 0.10 },
    { limit: 94300, rate: 0.12 },
    { limit: 201050, rate: 0.22 },
    { limit: 383900, rate: 0.24 },
    { limit: 487450, rate: 0.32 },
    { limit: 731200, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ],
  headOfHousehold: [
    { limit: 16550, rate: 0.10 },
    { limit: 63100, rate: 0.12 },
    { limit: 100500, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243700, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ]
};

// Default parameter values
export const DEFAULT_PARAMS = {
  // Property parameters
  housePrice: 300000,
  downPaymentPercent: 20,
  mortgageRate: 5.0,
  loanTermYears: 30,
  propertyTaxRate: 1.9,
  homeInsurance: 417,
  hoaFees: 100,
  homeAppreciation: 4.0,
  maintenancePercent: 1.0,

  // PMI
  pmiRate: 0.5,
  pmiThreshold: 20,

  // Rental parameters
  useRentPercentage: true,
  rentPercentage: 8.0,
  monthlyRentFixed: 2400,
  vacancyRate: 7,
  propertyManagementPercent: 8,
  rentGrowth: 3.0,
  landlordInsurancePremium: 20,
  maintenanceRental: 3.0,
  capexReserve: 8.0,
  turnoverCostMonths: 2,
  avgTenancyYears: 3,

  // Stock investment
  stockReturn: 7.5,
  dividendYield: 2.0,
  dividendsReinvested: true,

  // Recurring contributions
  enableRecurringContributions: false,
  contributionAmount: 500,
  contributionFrequency: 'monthly',

  // Timeline
  yearsToAnalyze: 30,
  initialCash: 60000,

  // Tax parameters
  enableTaxBenefits: false,
  marginalTaxRate: 24,
  standardDeduction: 29200, // 2024 married filing jointly
  itemizedDeductions: 0,
  landValuePercent: 20,

  yearlyIncome: 75000,
  filingStatus: 'single',
  stateTaxRate: 5.0,

  // Monthly living expenses
  monthlyGroceries: 400,
  monthlyTransportation: 200,
  monthlyInsurance: 150,
  monthlyUtilities: 150,
  monthlySubscriptions: 50,
  monthlyOther: 200,

  monthlyRentToLive: 1800,
  renterInsurance: 25,
  rentToLiveGrowth: 3.0,
};

// Strategy names
export const STRATEGY_NAMES = {
  buyToLive: 'Own Your Home',
  buyToRent: 'Buy Rental Property',
  rentToLive: 'Rent & Invest More',
  stocksOnly: 'Skip Homeownership'
};

// Strategy colors
export const STRATEGY_COLORS = {
  buyToLive: {
    primary: '#4F46E5', // indigo-600
    light: '#EEF2FF', // indigo-50
    border: '#C7D2FE' // indigo-200
  },
  buyToRent: {
    primary: '#10B981', // green-600
    light: '#ECFDF5', // green-50
    border: '#A7F3D0' // green-200
  },
  rentToLive: {
    primary: '#F59E0B', // amber-600
    light: '#FEF3C7', // amber-50
    border: '#FCD34D' // amber-200
  },
  stocksOnly: {
    primary: '#8B5CF6', // purple-600
    light: '#F5F3FF', // purple-50
    border: '#DDD6FE' // purple-200
  }
};

// Financial guidelines
export const FINANCIAL_GUIDELINES = {
  RECOMMENDED_HOUSING_PERCENT: 30, // Max recommended housing as % of income
  RENTAL_DEPRECIATION_YEARS: 27.5, // IRS depreciation period for residential rental
  MAX_RENTAL_LOSS_DEDUCTION: 25000 // Max rental loss deduction for tax purposes
};
