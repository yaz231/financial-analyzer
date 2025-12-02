'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, TrendingUp, Home, DollarSign, Info, Settings, HelpCircle, Wallet } from 'lucide-react';

const FinancialAnalyzer = () => {
  const [params, setParams] = useState({
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
    filingStatus: 'single', // 'single', 'married', 'headOfHousehold'
    stateTaxRate: 5.0, // State income tax as percentage

    // Monthly living expenses
    monthlyGroceries: 400,
    monthlyTransportation: 200,
    monthlyInsurance: 150, // car, health premiums not covered by employer
    monthlyUtilities: 150,
    monthlySubscriptions: 50, // gym, streaming, etc.
    monthlyOther: 200, // dining out, entertainment, misc

    monthlyRentToLive: 1800,
    renterInsurance: 25,
    rentToLiveGrowth: 3.0,
  });

  const [showExplanations, setShowExplanations] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const paramDefinitions = {
    housePrice: "The purchase price of the property you're considering buying.",
    downPaymentPercent: "The percentage of the house price you'll pay upfront. Higher down payments mean lower monthly mortgage payments and no PMI above 20%.",
    mortgageRate: "The annual interest rate on your home loan. This significantly impacts your monthly payment and total interest paid.",
    loanTermYears: "The number of years over which you'll repay the mortgage. Common terms are 15 or 30 years.",
    propertyTaxRate: "Annual property tax as a percentage of home value. This varies by location and is typically 0.3% to 2.5%.",
    homeInsurance: "Monthly cost to insure your home against damage, theft, and liability. Required by most lenders.",
    hoaFees: "Homeowners Association monthly fees for shared amenities and maintenance in planned communities or condos.",
    maintenancePercent: "Annual maintenance costs as a percentage of home value. Rule of thumb is 1% per year for routine upkeep.",
    homeAppreciation: "Expected annual increase in home value. Historical average is 3-6% but varies significantly by location.",
    pmiRate: "Private Mortgage Insurance annual cost as percentage of loan amount. Required when down payment is less than 20%.",
    pmiThreshold: "The equity percentage at which PMI is removed. Typically 20% equity.",
    rentPercentage: "Annual gross rent as a percentage of home value. The '1% rule' suggests monthly rent should be 1% of purchase price (12% annually).",
    monthlyRentFixed: "Fixed monthly rent amount you expect to charge tenants.",
    vacancyRate: "Percentage of time the property sits empty between tenants. National average is 6-7%.",
    propertyManagementPercent: "Fee charged by property managers as percentage of monthly rent. Typical range is 8-12%.",
    rentGrowth: "Expected annual increase in rental rates. Often tracks with inflation (2-4%).",
    landlordInsurancePremium: "Additional cost for landlord insurance compared to homeowner insurance. Typically 15-25% more.",
    maintenanceRental: "Monthly maintenance reserve as percentage of rent. Landlords typically budget 3-5% of rent.",
    capexReserve: "Capital Expenditure reserve for major repairs (roof, HVAC, appliances) as percentage of rent. Industry standard is 8-10%.",
    turnoverCostMonths: "Cost to prepare property for new tenant (cleaning, repairs, lost rent) measured in months of rent. Typically 1-2 months.",
    avgTenancyYears: "Average number of years a tenant stays before moving. Longer tenancy means lower turnover costs.",
    stockReturn: "Expected annual return from stock market investments. Historical S&P 500 average is 7-8% after inflation.",
    dividendYield: "Annual dividend income as percentage of stock value. S&P 500 currently yields about 1.5-2%.",
    dividendsReinvested: "Whether dividend payments are used to buy more stock (compounding) or taken as cash income.",
    initialCash: "Total cash available for down payment and/or investment. Money not used for down payment goes into stocks.",
    yearsToAnalyze: "Time horizon for comparing strategies. Longer periods favor appreciation and compound growth.",
    contributionAmount: "Regular additional investment into stocks. Enables dollar-cost averaging strategy.",
    marginalTaxRate: "Your top tax bracket percentage. Used to calculate tax benefits from mortgage interest deduction and rental deductions.",
    standardDeduction: "IRS standard deduction amount. Itemized deductions (like mortgage interest) only help if they exceed this.",
    landValuePercent: "Portion of property value attributed to land (which doesn't depreciate). Building portion can be depreciated over 27.5 years for rentals.",
    yearlyIncome: "Your annual gross income before taxes. Used to calculate what percentage of your income goes to housing costs.",
    filingStatus: "Your tax filing status (Single, Married Filing Jointly, or Head of Household). This determines your federal tax brackets.",
    stateTaxRate: "Your state income tax rate as a percentage. Use 0 for states with no income tax (e.g., FL, TX, WA). Average is 3-6%.",
    monthlyGroceries: "Monthly spending on groceries and household supplies.",
    monthlyTransportation: "Monthly transportation costs including gas, car payments, parking, public transit.",
    monthlyInsurance: "Monthly insurance costs not covered by employer (car insurance, health insurance premiums, life insurance, etc.).",
    monthlyUtilities: "Monthly utility costs like electricity, water, internet, phone bills.",
    monthlySubscriptions: "Monthly subscriptions including gym membership, streaming services, software subscriptions, etc.",
    monthlyOther: "Other monthly expenses like dining out, entertainment, shopping, personal care, etc.",
    monthlyRentToLive: "Monthly rent you'd pay to live in a comparable property instead of buying.",
    renterInsurance: "Monthly cost for renter's insurance (typically much cheaper than homeowner's insurance).",
    rentToLiveGrowth: "Expected annual increase in rent. Often tracks with inflation (2-4%).",
  };

  const InfoTooltip = ({ param }) => (
    <div className="relative inline-block">
      <HelpCircle 
        className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ml-1 inline-block"
        onMouseEnter={() => setHoveredTooltip(param)}
        onMouseLeave={() => setHoveredTooltip(null)}
      />
      {hoveredTooltip === param && (
        <div className="absolute z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-6">
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
          {paramDefinitions[param]}
        </div>
      )}
    </div>
  );

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: typeof value === 'boolean' ? value : (parseFloat(value) || 0) }));
  };

  const calculateMortgagePayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return principal / numPayments;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const calculateRemainingBalance = (principal, annualRate, totalMonths, monthsPaid) => {
    if (monthsPaid >= totalMonths) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const remaining = principal * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsPaid)) /
                     (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.max(0, remaining);
  };

  const calculateIncomeTaxes = (grossIncome, filingStatus) => {
    // 2024 Federal Tax Brackets
    const brackets = {
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

    const selectedBrackets = brackets[filingStatus] || brackets.single;

    let federalTax = 0;
    let remainingIncome = grossIncome;
    let previousLimit = 0;

    for (const bracket of selectedBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
      federalTax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
      previousLimit = bracket.limit;
    }

    // FICA Taxes
    const socialSecurityLimit = 168600; // 2024 limit
    const socialSecurityTax = Math.min(grossIncome, socialSecurityLimit) * 0.062;

    let medicareTax = grossIncome * 0.0145;
    // Additional Medicare tax for high earners
    const additionalMedicareThreshold = filingStatus === 'married' ? 250000 : 200000;
    if (grossIncome > additionalMedicareThreshold) {
      medicareTax += (grossIncome - additionalMedicareThreshold) * 0.009;
    }

    const ficaTax = socialSecurityTax + medicareTax;

    return {
      federalTax,
      ficaTax,
      socialSecurityTax,
      medicareTax,
      totalFederalAndFica: federalTax + ficaTax
    };
  };

  const calculations = useMemo(() => {
    const downPayment = params.housePrice * (params.downPaymentPercent / 100);
    const loanAmount = params.housePrice - downPayment;
    const monthlyMortgage = calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears);
    const monthlyPropertyTax = (params.housePrice * (params.propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (params.housePrice * (params.maintenancePercent / 100)) / 12;

    const needsPMI = params.downPaymentPercent < params.pmiThreshold;
    const monthlyPMI = needsPMI ? (loanAmount * (params.pmiRate / 100)) / 12 : 0;

    // Calculate taxes and after-tax income
    const taxes = calculateIncomeTaxes(params.yearlyIncome, params.filingStatus);
    const stateTax = params.yearlyIncome * (params.stateTaxRate / 100);
    const totalAnnualTaxes = taxes.totalFederalAndFica + stateTax;
    const afterTaxIncome = params.yearlyIncome - totalAnnualTaxes;
    const monthlyIncome = afterTaxIncome / 12;

    // Calculate living expenses
    const totalMonthlyLivingExpenses = params.monthlyGroceries + params.monthlyTransportation +
                                        params.monthlyInsurance + params.monthlyUtilities +
                                        params.monthlySubscriptions + params.monthlyOther;

    const results = {
      buyToLive: [],
      buyToRent: [],
      stocksOnly: [],
      rentToLive: [],
    };

    let cumulativeTaxBenefitsLive = 0;
    let cumulativeTaxBenefitsRent = 0;

    for (let year = 0; year <= params.yearsToAnalyze; year++) {
      const month = year * 12;
      const homeValue = params.housePrice * Math.pow(1 + params.homeAppreciation / 100, year);
      const remainingMortgage = calculateRemainingBalance(loanAmount, params.mortgageRate, params.loanTermYears * 12, month);
      
      const equityPercent = ((homeValue - remainingMortgage) / homeValue) * 100;
      const currentPMI = (needsPMI && equityPercent < params.pmiThreshold) ? monthlyPMI : 0;

      // TAX BENEFITS CALCULATION
      let taxBenefitLive = 0;
      let taxBenefitRent = 0;

      if (params.enableTaxBenefits && year > 0) {
        // BUY TO LIVE: Mortgage Interest Deduction
        const principalPaidLive = loanAmount - remainingMortgage - 
            calculateRemainingBalance(loanAmount, params.mortgageRate, params.loanTermYears * 12, (year - 1) * 12);
        const interestPaidLive = (monthlyMortgage * 12) - principalPaidLive;
        const propertyTaxAnnual = monthlyPropertyTax * 12;
        const totalItemized = interestPaidLive + propertyTaxAnnual;
        
        if (totalItemized > params.standardDeduction) {
            taxBenefitLive = (totalItemized - params.standardDeduction) * (params.marginalTaxRate / 100);
        }
        
        // BUY TO RENT: Depreciation + Expense Deductions
        const buildingValue = params.housePrice * (1 - params.landValuePercent / 100);
        const annualDepreciation = buildingValue / 27.5;
        
        const annualRentalIncome = netMonthlyRent * 12;
        const annualRentalExpenses = monthlyExpenses * 12;
        const netRentalIncome = annualRentalIncome - annualRentalExpenses - annualDepreciation;
    
        if (netRentalIncome < 0) {
            taxBenefitRent = Math.min(Math.abs(netRentalIncome), 25000) * (params.marginalTaxRate / 100);
        } else {
            taxBenefitRent = annualDepreciation * (params.marginalTaxRate / 100);
        }
      }

      cumulativeTaxBenefitsLive += taxBenefitLive;
      cumulativeTaxBenefitsRent += taxBenefitRent;

      // BUY TO LIVE
      const homeEquityLive = homeValue - remainingMortgage;
      const monthlyHousingCost = monthlyMortgage + currentPMI + monthlyPropertyTax +
                                params.homeInsurance + params.hoaFees + monthlyMaintenance;

      // Calculate leftover income that can be invested monthly
      const monthlyLeftoverLive = monthlyIncome - monthlyHousingCost - totalMonthlyLivingExpenses;

      // Initial stock investment from down payment
      const initialStockInvestmentLive = params.initialCash - downPayment;
      let stockValueLive = initialStockInvestmentLive * Math.pow(1 + params.stockReturn / 100, year);

      // Add monthly contributions from leftover income
      let monthlyContributionsLive = 0;
      let dividendsLive = 0;
      let annualDividendIncomeLive = 0;

      if (year > 0 && monthlyLeftoverLive > 0) {
        const annualContribution = monthlyLeftoverLive * 12;
        for (let y = 1; y <= year; y++) {
          const yearsToGrow = year - y;
          monthlyContributionsLive += annualContribution * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
        }
      }

      // Calculate dividends from the entire portfolio (initial + contributions)
      if (params.dividendYield > 0 && year > 0) {
        for (let y = 1; y <= year; y++) {
          const contributionsSoFar = monthlyLeftoverLive > 0 ? monthlyLeftoverLive * 12 * y : 0;
          const baseValueAtYear = initialStockInvestmentLive * Math.pow(1 + params.stockReturn / 100, y);
          const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y/2));
          const portfolioValueAtYear = baseValueAtYear + contributionsToYear;

          const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
          const yearsToGrow = year - y;

          if (params.dividendsReinvested) {
            dividendsLive += dividendAtYear * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
          } else {
            dividendsLive += dividendAtYear;
          }

          if (y === year) {
            annualDividendIncomeLive = dividendAtYear;
          }
        }
      }

      const totalStockValueLive = stockValueLive + monthlyContributionsLive + dividendsLive;
      const netWorthLive = homeEquityLive + totalStockValueLive + cumulativeTaxBenefitsLive;


      // BUY TO RENT
      const homeEquityRent = homeValue - remainingMortgage;
      const monthlyRent = params.useRentPercentage ? 
        (params.housePrice * (params.rentPercentage / 100) / 12) * Math.pow(1 + params.rentGrowth / 100, year) :
        params.monthlyRentFixed * Math.pow(1 + params.rentGrowth / 100, year);
      
      const effectiveRent = monthlyRent * (1 - params.vacancyRate / 100);
      const propertyManagementFee = effectiveRent * (params.propertyManagementPercent / 100);
      
      const landlordInsurance = params.homeInsurance * (1 + params.landlordInsurancePremium / 100);
      const rentalMaintenance = monthlyRent * (params.maintenanceRental / 100);
      const capexReserve = monthlyRent * (params.capexReserve / 100);
      
      const monthlyExpenses = monthlyMortgage + currentPMI + monthlyPropertyTax + 
                             landlordInsurance + params.hoaFees + rentalMaintenance + capexReserve;
      
      const netMonthlyRent = effectiveRent - propertyManagementFee;
      const monthlyCashFlow = netMonthlyRent - monthlyExpenses;
      
      let rentalProfitsInvested = 0;
      let turnoverCosts = 0;
      
      if (year > 0) {
        for (let y = 1; y <= year; y++) {
          const rentAtYear = params.useRentPercentage ?
            (params.housePrice * (params.rentPercentage / 100) / 12) * Math.pow(1 + params.rentGrowth / 100, y) :
            params.monthlyRentFixed * Math.pow(1 + params.rentGrowth / 100, y);
          
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
      
      const initialStockInvestmentRent = params.initialCash - downPayment;
      const stockValueRent = initialStockInvestmentRent * Math.pow(1 + params.stockReturn / 100, year);
      const totalStocksRent = stockValueRent + rentalProfitsInvested;
      const netWorthRent = homeEquityRent + totalStocksRent + cumulativeTaxBenefitsRent;

      // STOCKS ONLY (with optional DCA)
      let stockValueOnly = params.initialCash * Math.pow(1 + params.stockReturn / 100, year);
      let contributionsAccumulated = 0;
      let dividendsAccumulated = 0;
      let annualDividendIncome = 0;

      // Add recurring contributions if enabled
      if (params.enableRecurringContributions && year > 0) {
        const contributionsPerYear = params.contributionFrequency === 'monthly' ? 
            params.contributionAmount * 12 : params.contributionAmount;
        
        for (let y = 1; y <= year; y++) {
            const yearsToGrow = year - y;
            contributionsAccumulated += contributionsPerYear * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
        }
      }

      // Calculate dividends
      if (params.dividendYield > 0 && year > 0) {
        for (let y = 1; y <= year; y++) {
            const contributionsSoFar = params.enableRecurringContributions ? 
            (params.contributionFrequency === 'monthly' ? params.contributionAmount * 12 : params.contributionAmount) * y : 0;

            const baseValueAtYear = params.initialCash * Math.pow(1 + params.stockReturn / 100, y);
            const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y/2));
            const portfolioValueAtYear = baseValueAtYear + contributionsToYear;
    
            const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
            const yearsToGrow = year - y;
            
            if (params.dividendsReinvested) {
            dividendsAccumulated += dividendAtYear * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
            } else {
            dividendsAccumulated += dividendAtYear;
            }
    
            if (y === year) {
            annualDividendIncome = dividendAtYear;
            }
        }
      }

      const netWorthStocks = stockValueOnly + contributionsAccumulated + dividendsAccumulated;
      const monthlyCashFlowStocks = !params.dividendsReinvested ? annualDividendIncome / 12 : 
      (params.enableRecurringContributions ? -params.contributionAmount : 0);

      // RENT TO LIVE (NEW SCENARIO)
      const currentRentToLive = params.monthlyRentToLive * Math.pow(1 + params.rentToLiveGrowth / 100, year);
      const monthlyRentCost = currentRentToLive + params.renterInsurance;

      // Calculate leftover income that can be invested monthly
      const monthlyLeftoverRent = monthlyIncome - monthlyRentCost - totalMonthlyLivingExpenses;

      // All initial cash goes into stocks
      let stocksFromRentingBase = params.initialCash * Math.pow(1 + params.stockReturn / 100, year);

      // Add monthly contributions from leftover income
      let monthlyContributionsRent = 0;
      if (year > 0 && monthlyLeftoverRent > 0) {
        const annualContribution = monthlyLeftoverRent * 12;
        for (let y = 1; y <= year; y++) {
          const yearsToGrow = year - y;
          monthlyContributionsRent += annualContribution * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
        }
      }

      // Calculate dividends for Rent to Live portfolio (from initial + contributions)
      let rentToLiveDividendsAccumulated = 0;
      let rentToLiveAnnualDividendIncome = 0;

      if (params.dividendYield > 0 && year > 0) {
        for (let y = 1; y <= year; y++) {
          const contributionsSoFar = monthlyLeftoverRent > 0 ? monthlyLeftoverRent * 12 * y : 0;
          const baseValueAtYear = params.initialCash * Math.pow(1 + params.stockReturn / 100, y);
          const contributionsToYear = contributionsSoFar * Math.pow(1 + params.stockReturn / 100, y - Math.floor(y/2));
          const portfolioValueAtYear = baseValueAtYear + contributionsToYear;

          const dividendAtYear = portfolioValueAtYear * (params.dividendYield / 100);
          const yearsToGrow = year - y;

          if (params.dividendsReinvested) {
            rentToLiveDividendsAccumulated += dividendAtYear * Math.pow(1 + params.stockReturn / 100, yearsToGrow);
          } else {
            rentToLiveDividendsAccumulated += dividendAtYear;
          }

          if (y === year) {
            rentToLiveAnnualDividendIncome = dividendAtYear;
          }
        }
      }

      // Calculate total stock value for Rent to Live
      const stocksFromRenting = stocksFromRentingBase + monthlyContributionsRent + rentToLiveDividendsAccumulated;

      // Calculate net monthly cash flow
      // If dividends are not reinvested, they offset the rent cost
      const monthlyDividendIncomeRent = !params.dividendsReinvested ? (rentToLiveAnnualDividendIncome / 12) : 0;
      const netMonthlyCashFlowRent = -monthlyRentCost + monthlyDividendIncomeRent;
  
      results.stocksOnly.push({
        year,
        netWorth: netWorthStocks,
        stockValue: stockValueOnly,
        contributions: contributionsAccumulated,
        dividends: dividendsAccumulated,
        monthlyCashFlow: monthlyCashFlowStocks
      });
        
      // Net monthly cash flow for Buy to Live: housing cost offset by dividends (if not reinvested)
      const monthlyDividendOffsetLive = !params.dividendsReinvested ? (annualDividendIncomeLive / 12) : 0;
      const netMonthlyCashFlowLive = -monthlyHousingCost + monthlyDividendOffsetLive;

      results.buyToLive.push({
        year,
        netWorth: netWorthLive,
        homeEquity: homeEquityLive,
        stockValue: totalStockValueLive,
        stockValueBase: stockValueLive,
        monthlyContributions: monthlyContributionsLive,
        dividends: dividendsLive,
        homeValue,
        remainingMortgage,
        monthlyPayment: monthlyHousingCost,
        monthlyPMI: currentPMI,
        taxBenefit: taxBenefitLive,
        monthlyLeftover: monthlyLeftoverLive,
        monthlyDividendIncome: annualDividendIncomeLive / 12,
        netMonthlyCashFlow: netMonthlyCashFlowLive
      });

      results.buyToRent.push({
        year,
        netWorth: netWorthRent,
        homeEquity: homeEquityRent,
        stockValue: totalStocksRent,
        rentalProfits: rentalProfitsInvested,
        homeValue,
        remainingMortgage,
        monthlyRent: netMonthlyRent,
        monthlyExpenses,
        monthlyCashFlow,
        turnoverCosts,
        taxBenefit: taxBenefitRent,
        netMonthlyCashFlow: Math.round(monthlyCashFlow)
      });

      results.rentToLive.push({
        year,
        netWorth: stocksFromRenting,
        stockValue: stocksFromRenting,
        stockValueBase: stocksFromRentingBase,
        monthlyContributions: monthlyContributionsRent,
        dividends: rentToLiveDividendsAccumulated,
        monthlyRent: currentRentToLive,
        monthlyRentCost: monthlyRentCost,
        monthlyLeftover: monthlyLeftoverRent,
        monthlyDividendIncome: monthlyDividendIncomeRent,
        monthlyCashFlow: netMonthlyCashFlowRent
      });
    }

    return {
      ...results,
      taxes: {
        grossIncome: params.yearlyIncome,
        federalTax: taxes.federalTax,
        socialSecurityTax: taxes.socialSecurityTax,
        medicareTax: taxes.medicareTax,
        ficaTax: taxes.ficaTax,
        stateTax: stateTax,
        totalTaxes: totalAnnualTaxes,
        afterTaxIncome: afterTaxIncome,
        monthlyAfterTaxIncome: monthlyIncome,
        effectiveTaxRate: (totalAnnualTaxes / params.yearlyIncome) * 100
      },
      livingExpenses: {
        monthlyTotal: totalMonthlyLivingExpenses,
        annualTotal: totalMonthlyLivingExpenses * 12
      }
    };
  }, [params]);

  const netWorthChartData = useMemo(() => {
    return calculations.buyToLive.map((item, idx) => ({
      year: item.year,
      'Own Your Home': Math.round(item.netWorth),
      'Buy Rental Property': Math.round(calculations.buyToRent[idx].netWorth),
      'Rent & Invest More': Math.round(calculations.rentToLive[idx].netWorth),
      'Skip Homeownership': Math.round(calculations.stocksOnly[idx].netWorth),
    }));
  }, [calculations, params.enableRecurringContributions]);

  const cashFlowChartData = useMemo(() => {
    return calculations.buyToLive.slice(0, Math.min(36, params.yearsToAnalyze + 1)).map((item, idx) => ({
      year: item.year,
      'Own Your Home': -Math.round(item.monthlyPayment),
      'Buy Rental Property': Math.round(calculations.buyToRent[idx].monthlyCashFlow),
      'Rent & Invest More': -Math.round(calculations.rentToLive[idx].monthlyRentCost),
      'Skip Homeownership': calculations.stocksOnly[idx].monthlyCashFlow
    }));
  }, [calculations, params.yearsToAnalyze]);

  const finalYear = params.yearsToAnalyze;
  const finalResults = {
    buyToLive: calculations.buyToLive[finalYear],
    buyToRent: calculations.buyToRent[finalYear],
    rentToLive: calculations.rentToLive[finalYear],
    stocksOnly: calculations.stocksOnly[finalYear],
  };

  const bestStrategy = Object.keys(finalResults).reduce((best, current) => 
    finalResults[current].netWorth > finalResults[best].netWorth ? current : best
  );

  const formatCurrency = (value) => {
    return value.toLocaleString(undefined, {maximumFractionDigits: 0});
  };

  const formatStrategyName = (name) => {
    const nameMap = {
      'buyToLive': 'Own Your Home',
      'buyToRent': 'Buy Rental Property',
      'rentToLive': 'Rent & Invest More',
      'stocksOnly': 'Skip Homeownership'
    };
    return nameMap[name] || name;
  };

  const monthlyRentCalculated = params.useRentPercentage ?
    (params.housePrice * (params.rentPercentage / 100) / 12) : params.monthlyRentFixed;

  // Personal Finance Calculations (NEW)
  const monthlyIncome = calculations.taxes.monthlyAfterTaxIncome;
  const totalMonthlyLivingExpenses = calculations.livingExpenses.monthlyTotal;
  const buyToLiveMonthlyPayment = calculations.buyToLive[0].monthlyPayment;
  const rentToLiveMonthlyPayment = calculations.rentToLive[0].monthlyRentCost;
  const buyToRentMonthlyExpenses = calculations.buyToRent[0].monthlyExpenses;
  const buyToRentMonthlyIncome = calculations.buyToRent[0].monthlyRent;

  const buyToLivePercentOfIncome = (buyToLiveMonthlyPayment / monthlyIncome) * 100;
  const rentToLivePercentOfIncome = (rentToLiveMonthlyPayment / monthlyIncome) * 100;
  const buyToRentNetCashFlow = buyToRentMonthlyIncome - buyToRentMonthlyExpenses;
  const buyToRentPercentOfIncome = (buyToRentMonthlyExpenses / monthlyIncome) * 100;

  const buyToLiveLeftoverMonthly = monthlyIncome - buyToLiveMonthlyPayment;
  const rentToLiveLeftoverMonthly = monthlyIncome - rentToLiveMonthlyPayment;
  const buyToRentLeftoverMonthly = monthlyIncome - buyToRentMonthlyExpenses + buyToRentMonthlyIncome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calculator className="w-12 h-12" />
                <div>
                  <h1 className="text-4xl font-bold">Investment Strategy Calculator</h1>
                  <p className="text-blue-100 mt-2">Compare Real Estate vs Stock Market Strategies</p>
                </div>
              </div>
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition backdrop-blur-sm"
              >
                <Info className="w-5 h-5" />
                {showExplanations ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-8 border-b">
              {['overview', 'personal', 'parameters', 'cashflow', 'analysis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'personal' ? (
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Personal Finance
                    </span>
                  ) : (
                    tab.charAt(0).toUpperCase() + tab.slice(1)
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Introductory Guide Section */}
                <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 shadow-lg">
                  <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Info className="w-6 h-6" />
                    What Questions Does This Calculator Answer?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">💭 Should I buy a house to live in?</p>
                      <p>Compare <strong>Own Your Home</strong> vs <strong>Rent & Invest</strong> strategies to see which builds more wealth and cash flow.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">💰 Can I still invest in stocks if I buy?</p>
                      <p>Yes! The <strong>Own Your Home</strong> strategy invests your leftover cash after the down payment into stocks.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">📊 What about monthly cash flow?</p>
                      <p>Check the <strong>Personal Finance</strong> tab to see monthly costs, leftover cash, and housing % of income.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">🏠 Should I buy a cheaper house and invest more?</p>
                      <p>Go to <strong>Parameters</strong>, lower the house price, then compare final net worth in each strategy.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">🏘️ What about buying a rental property?</p>
                      <p>The <strong>Buy Rental Property</strong> strategy shows you buying a property to rent out while living elsewhere.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-200">
                      <p className="font-semibold text-indigo-900 mb-2">🎯 How do I use this?</p>
                      <p>Start with the defaults, then adjust <strong>Parameters</strong> to match your situation. Compare results below!</p>
                    </div>
                  </div>
                </div>

                {/* Strategy Explanations */}
                <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📋 What Each Strategy Means</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Own Your Home + Invest
                      </h4>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Buy a house and live in it. Your down payment builds equity, and leftover cash goes into stocks. This is the traditional "American Dream" path.
                      </p>
                      <p className="text-indigo-600 font-semibold text-xs mt-2">Best for: Stability, pride of ownership</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Buy Rental Property + Invest
                      </h4>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Buy a property to rent out. Rental income covers expenses (hopefully) and leftover cash goes into stocks. You live elsewhere.
                      </p>
                      <p className="text-green-600 font-semibold text-xs mt-2">Best for: Passive income seekers, landlords</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                      <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Rent & Invest More
                      </h4>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Rent a place to live and invest all your cash in stocks. No down payment needed, lower monthly costs, maximum flexibility.
                      </p>
                      <p className="text-amber-600 font-semibold text-xs mt-2">Best for: Flexibility, job mobility, higher risk tolerance</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Skip Homeownership
                      </h4>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Don't deal with housing at all - invest everything in the stock market. Pure equity exposure with no housing costs factored in.
                      </p>
                      <p className="text-purple-600 font-semibold text-xs mt-2">Best for: Baseline comparison, living with family/friends</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                  {/* Buy to Live Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border-2 border-indigo-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Home className="w-7 h-7 text-indigo-600" />
                      <h3 className="font-semibold text-lg text-indigo-900">Own Your Home</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-indigo-700 mb-1">Final Net Worth</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${formatCurrency(finalResults.buyToLive.netWorth)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-indigo-300">
                        <p className="text-sm text-indigo-700">Home Equity</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.buyToLive.homeEquity)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-indigo-300">
                        <p className="text-sm text-indigo-700">Stock Portfolio</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.buyToLive.stockValue)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-indigo-300">
                        <p className="text-sm text-indigo-700">Monthly Cash Flow</p>
                        <p className="text-lg font-semibold text-red-600">
                          -${formatCurrency(finalResults.buyToLive.monthlyPayment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buy to Rent Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-7 h-7 text-green-600" />
                      <h3 className="font-semibold text-lg text-green-900">Buy Rental Property</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-green-700 mb-1">Final Net Worth</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${formatCurrency(finalResults.buyToRent.netWorth)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <p className="text-sm text-green-700">Home Equity</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.buyToRent.homeEquity)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <p className="text-sm text-green-700">Stock Portfolio</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.buyToRent.stockValue)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <p className="text-sm text-green-700">Monthly Cash Flow</p>
                        <p className={`text-lg font-semibold ${finalResults.buyToRent.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {finalResults.buyToRent.monthlyCashFlow >= 0 ? '+' : ''}${formatCurrency(Math.abs(finalResults.buyToRent.monthlyCashFlow))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rent to Live Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border-2 border-amber-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Home className="w-7 h-7 text-amber-600" />
                      <h3 className="font-semibold text-lg text-amber-900">Rent & Invest More</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-amber-700 mb-1">Final Net Worth</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${formatCurrency(finalResults.rentToLive.netWorth)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-300">
                        <p className="text-sm text-amber-700">Home Equity</p>
                        <p className="text-lg font-semibold text-gray-800">
                          $0
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-300">
                        <p className="text-sm text-amber-700">Stock Portfolio</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.rentToLive.stockValue)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-300">
                        <p className="text-sm text-amber-700">Monthly Cash Flow</p>
                        <p className="text-lg font-semibold text-red-600">
                          {finalResults.rentToLive.monthlyCashFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(finalResults.rentToLive.monthlyCashFlow))}
                        </p>
                        {!params.dividendsReinvested && finalResults.rentToLive.monthlyDividendIncome > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            (Rent -${formatCurrency(finalResults.rentToLive.monthlyRentCost)} + Dividends ${formatCurrency(finalResults.rentToLive.monthlyDividendIncome)})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stocks Only Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-7 h-7 text-purple-600" />
                      <h3 className="font-semibold text-lg text-purple-900">Skip Homeownership</h3>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-purple-700 mb-1">Final Net Worth</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${formatCurrency(finalResults.stocksOnly.netWorth)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-purple-300">
                        <p className="text-sm text-purple-700">Home Equity</p>
                        <p className="text-lg font-semibold text-gray-800">
                          $0
                        </p>
                      </div>
                      <div className="pt-2 border-t border-purple-300">
                        <p className="text-sm text-purple-700">Stock Portfolio</p>
                        <p className="text-lg font-semibold text-gray-800">
                          ${formatCurrency(finalResults.stocksOnly.stockValue)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-purple-300">
                        <p className="text-sm text-purple-700">Monthly Cash Flow</p>
                        <p className={`text-lg font-semibold ${
                          finalResults.stocksOnly.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {finalResults.stocksOnly.monthlyCashFlow >= 0 ? '+' : ''}${formatCurrency(Math.abs(finalResults.stocksOnly.monthlyCashFlow))}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-md">
                  <p className="font-semibold text-yellow-900 text-lg">
                    Best Strategy: <span className="text-yellow-800">{formatStrategyName(bestStrategy)}</span>
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    After {params.yearsToAnalyze} years, this strategy yields the highest net worth of ${formatCurrency(finalResults[bestStrategy].netWorth)}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Net Worth Over Time</h3>
                  <ResponsiveContainer width="100%" height={450}>
                    <AreaChart data={netWorthChartData}>
                      <defs>
                        <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorRentToLive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Net Worth ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                      <Legend />
                      <Area type="monotone" dataKey="Own Your Home" stroke="#4F46E5" fillOpacity={1} fill="url(#colorLive)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Buy Rental Property" stroke="#10B981" fillOpacity={1} fill="url(#colorRent)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Rent & Invest More" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRentToLive)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Skip Homeownership" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorStocks)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Monthly Cash Flow Comparison</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={cashFlowChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Monthly Cash Flow ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                      <Legend />
                      <Bar dataKey="Own Your Home" fill="#4F46E5" />
                      <Bar dataKey="Buy Rental Property" fill="#10B981" />
                      <Bar dataKey="Rent & Invest More" fill="#f59e0b" />
                      <Bar dataKey="Skip Homeownership" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    Personal Financial Overview
                  </h3>
                  <p className="text-gray-700 mb-6">
                    Understand how each housing strategy affects your personal finances. See what percentage of your income goes to housing and how much you have left over each month.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Annual Income <InfoTooltip param="yearlyIncome" />
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-600">$</span>
                        <input
                          type="number"
                          value={params.yearlyIncome}
                          onChange={(e) => updateParam('yearlyIncome', e.target.value)}
                          className="text-3xl font-bold text-indigo-600 border-b-2 border-indigo-300 focus:border-indigo-600 outline-none bg-transparent w-full"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Gross monthly: <span className="font-semibold">${formatCurrency(params.yearlyIncome / 12)}</span>
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Annual Taxes</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Federal Income Tax:</span>
                          <span className="font-semibold">${formatCurrency(calculations.taxes.federalTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Social Security (6.2%):</span>
                          <span className="font-semibold">${formatCurrency(calculations.taxes.socialSecurityTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Medicare (1.45%):</span>
                          <span className="font-semibold">${formatCurrency(calculations.taxes.medicareTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>State Tax ({params.stateTaxRate}%):</span>
                          <span className="font-semibold">${formatCurrency(calculations.taxes.stateTax)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-red-700">
                          <span>Total Taxes:</span>
                          <span>${formatCurrency(calculations.taxes.totalTaxes)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-700">
                          <span>After-Tax Income:</span>
                          <span>${formatCurrency(calculations.taxes.afterTaxIncome)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-1">
                          <span>Effective Tax Rate:</span>
                          <span>{calculations.taxes.effectiveTaxRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Edit in Parameters tab</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Living Expenses</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Groceries:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlyGroceries)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transportation:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlyTransportation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlyInsurance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Utilities:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlyUtilities)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subscriptions:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlySubscriptions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other:</span>
                          <span className="font-semibold">${formatCurrency(params.monthlyOther)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-900">
                          <span>Total Living Expenses:</span>
                          <span>${formatCurrency(totalMonthlyLivingExpenses)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Edit these in the Parameters tab</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Buy to Live Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-4 text-lg flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Own Your Home
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Monthly Income:</span>
                            <span className="font-semibold text-green-700">+${formatCurrency(monthlyIncome)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Housing Cost:</span>
                            <span className="font-semibold text-red-600">-${formatCurrency(buyToLiveMonthlyPayment)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Living Expenses:</span>
                            <span className="font-semibold text-red-600">-${formatCurrency(totalMonthlyLivingExpenses)}</span>
                          </div>
                          {calculations.buyToLive[0].monthlyDividendIncome > 0 && !params.dividendsReinvested && (
                            <div className="flex justify-between text-gray-600">
                              <span>Dividend Income:</span>
                              <span className="font-semibold text-green-700">+${formatCurrency(calculations.buyToLive[0].monthlyDividendIncome)}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Discretionary Income</p>
                          <p className={`text-2xl font-bold ${calculations.buyToLive[0].monthlyLeftover >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculations.buyToLive[0].monthlyLeftover >= 0 ? '+' : ''}${formatCurrency(calculations.buyToLive[0].monthlyLeftover)}
                          </p>
                          {calculations.buyToLive[0].monthlyLeftover > 0 && (
                            <p className="text-xs text-green-600 mt-1">✓ Automatically invested into stocks</p>
                          )}
                          {calculations.buyToLive[0].monthlyLeftover < 0 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Spending more than you earn!</p>
                          )}
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Housing % of Income</p>
                          <p className={`text-xl font-bold ${buyToLivePercentOfIncome > 30 ? 'text-red-600' : 'text-green-600'}`}>
                            {buyToLivePercentOfIncome.toFixed(1)}%
                          </p>
                          {buyToLivePercentOfIncome > 30 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Above 30% recommended</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rent to Live Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
                      <h4 className="font-semibold text-green-900 mb-4 text-lg flex items-center gap-2">
                        <Home className="w-5 h-5" />
                        Rent & Invest More
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Monthly Income:</span>
                            <span className="font-semibold text-green-700">+${formatCurrency(monthlyIncome)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Rent + Insurance:</span>
                            <span className="font-semibold text-red-600">-${formatCurrency(rentToLiveMonthlyPayment)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Living Expenses:</span>
                            <span className="font-semibold text-red-600">-${formatCurrency(totalMonthlyLivingExpenses)}</span>
                          </div>
                          {calculations.rentToLive[0].monthlyDividendIncome > 0 && !params.dividendsReinvested && (
                            <div className="flex justify-between text-gray-600">
                              <span>Dividend Income:</span>
                              <span className="font-semibold text-green-700">+${formatCurrency(calculations.rentToLive[0].monthlyDividendIncome)}</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Discretionary Income</p>
                          <p className={`text-2xl font-bold ${calculations.rentToLive[0].monthlyLeftover >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculations.rentToLive[0].monthlyLeftover >= 0 ? '+' : ''}${formatCurrency(calculations.rentToLive[0].monthlyLeftover)}
                          </p>
                          {calculations.rentToLive[0].monthlyLeftover > 0 && (
                            <p className="text-xs text-green-600 mt-1">✓ Automatically invested into stocks</p>
                          )}
                          {calculations.rentToLive[0].monthlyLeftover < 0 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Spending more than you earn!</p>
                          )}
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Housing % of Income</p>
                          <p className={`text-xl font-bold ${rentToLivePercentOfIncome > 30 ? 'text-red-600' : 'text-green-600'}`}>
                            {rentToLivePercentOfIncome.toFixed(1)}%
                          </p>
                          {rentToLivePercentOfIncome > 30 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Above 30% recommended</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buy to Rent Card */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Buy Rental Property
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Net Cash Flow</p>
                          <p className={`text-2xl font-bold ${buyToRentNetCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {buyToRentNetCashFlow >= 0 ? '+' : ''}${formatCurrency(buyToRentNetCashFlow)}
                          </p>
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Expenses as % of Income</p>
                          <p className={`text-xl font-bold ${buyToRentPercentOfIncome > 30 ? 'text-red-600' : 'text-green-600'}`}>
                            {buyToRentPercentOfIncome.toFixed(1)}%
                          </p>
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">Leftover Monthly</p>
                          <p className="text-xl font-bold text-green-600">
                            ${formatCurrency(buyToRentLeftoverMonthly)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            ${formatCurrency(buyToRentLeftoverMonthly * 12)}/year
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Insights */}
                  <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-4 text-lg">💡 Key Insights</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Most Cash Available:</strong>{' '}
                        {Math.max(buyToLiveLeftoverMonthly, rentToLiveLeftoverMonthly, buyToRentLeftoverMonthly) === buyToLiveLeftoverMonthly
                          ? 'Own Your Home'
                          : Math.max(rentToLiveLeftoverMonthly, buyToRentLeftoverMonthly) === rentToLiveLeftoverMonthly
                          ? 'Rent & Invest More'
                          : 'Buy Rental Property'}{' '}
                        leaves you with the most monthly cash flow.
                      </p>
                      <p>
                        <strong>Lowest Housing Cost %:</strong>{' '}
                        {Math.min(buyToLivePercentOfIncome, rentToLivePercentOfIncome, buyToRentPercentOfIncome) === buyToLivePercentOfIncome
                          ? 'Own Your Home'
                          : Math.min(rentToLivePercentOfIncome, buyToRentPercentOfIncome) === rentToLivePercentOfIncome
                          ? 'Rent & Invest More'
                          : 'Buy Rental Property'}{' '}
                        has the lowest cost as a percentage of your income.
                      </p>
                      <p className="pt-2 border-t border-indigo-200">
                        <strong>Financial Health Guideline:</strong> Experts recommend keeping housing costs below 30% of gross income. 
                        {Math.max(buyToLivePercentOfIncome, rentToLivePercentOfIncome, buyToRentPercentOfIncome) > 30
                          ? " Some of your options exceed this threshold - consider if you're comfortable with the higher burden."
                          : " All your options are within healthy limits!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-indigo-900 border-b-2 border-indigo-200 pb-3">
                    Property Parameters
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      House Price ($)
                      <InfoTooltip param="housePrice" />
                    </label>
                    <input
                      type="number"
                      value={params.housePrice}
                      onChange={(e) => updateParam('housePrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font`-medium text-gray-700 mb-2">
                        Down Payment (%)
                        <InfoTooltip param="downPaymentPercent" />
                    </label>
                    <div className='relative'>
                        <input
                        type="number"
                        value={params.downPaymentPercent}
                        onChange={(e) => updateParam('downPaymentPercent', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                        min="0"
                        max="100"
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        ${formatCurrency(params.housePrice * (params.downPaymentPercent / 100))}
                        </span>
                    </div>
                    {params.downPaymentPercent < 20 && (
                        <p className="text-xs text-amber-600 mt-1">PMI will apply (below 20%)</p>
                    )}
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mortgage Rate (%)
                      <InfoTooltip param="mortgageRate" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.mortgageRate}
                      onChange={(e) => updateParam('mortgageRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Term (Years)
                      <InfoTooltip param="loanTermYears" />
                    </label>
                    <input
                      type="number"
                      value={params.loanTermYears}
                      onChange={(e) => updateParam('loanTermYears', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Tax Rate (%)
                      <InfoTooltip param="propertyTaxRate" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.propertyTaxRate}
                      onChange={(e) => updateParam('propertyTaxRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Insurance ($/month)
                      <InfoTooltip param="homeInsurance" />
                    </label>
                    <input
                      type="number"
                      value={params.homeInsurance}
                      onChange={(e) => updateParam('homeInsurance', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HOA Fees ($/month)
                      <InfoTooltip param="hoaFees" />
                    </label>
                    <input
                      type="number"
                      value={params.hoaFees}
                      onChange={(e) => updateParam('hoaFees', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance (% of home value/year)
                      <InfoTooltip param="maintenance" />
                    </label>
                    <div className='relative'>
                    <input
                      type="number"
                      step="0.1"
                      value={params.maintenancePercent}
                      onChange={(e) => updateParam('maintenancePercent', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                      min="0"
                      max="100"
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                      ${formatCurrency(params.housePrice * (params.maintenancePercent / 100))}
                    </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Home Appreciation (% per year)
                      <InfoTooltip param="homeAppreciation" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.homeAppreciation}
                      onChange={(e) => updateParam('homeAppreciation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">PMI Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PMI Rate (% annually)
                          <InfoTooltip param="pmiRate" />
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={params.pmiRate}
                          onChange={(e) => updateParam('pmiRate', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PMI Threshold (% equity)
                          <InfoTooltip param="pmiThreshold" />
                        </label>
                        <input
                          type="number"
                          value={params.pmiThreshold}
                          onChange={(e) => updateParam('pmiThreshold', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-green-900 border-b-2 border-green-200 pb-3">
                    Rental Parameters
                  </h3>

                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={params.useRentPercentage}
                        onChange={(e) => updateParam('useRentPercentage', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-gray-900">Use % of Home Value for Rent</span>
                    </label>
                  </div>

                  {params.useRentPercentage ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent (% of home value annually)
                        <InfoTooltip param="rentPercentage" />
                        </label>
                        <div className='relative'>
                        <input
                            type="number"
                            step="0.1"
                            value={params.rentPercentage}
                            onChange={(e) => updateParam('rentPercentage', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                        />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                            ${formatCurrency(monthlyRentCalculated)}/mo
                        </span>
                        </div>
                    </div>
                    ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent ($/month)
                        <InfoTooltip param="monthlyRentFixed" />
                        </label>
                        <input
                        type="number"
                        value={params.monthlyRentFixed}
                        onChange={(e) => updateParam('monthlyRentFixed', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                        />
                    </div>
                    )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vacancy Rate (%)
                      <InfoTooltip param="vacancyRate" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.vacancyRate}
                      onChange={(e) => updateParam('vacancyRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Management (%)
                      <InfoTooltip param="propertyManagementPercent" />
                    </label>
                    <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={params.propertyManagementPercent}
                      onChange={(e) => updateParam('propertyManagementPercent', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    ${formatCurrency(params.housePrice * (params.propertyManagementPercent / 100))}
                    </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rent Growth (% per year)
                      <InfoTooltip param="rentGrowth" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.rentGrowth}
                      onChange={(e) => updateParam('rentGrowth', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landlord Insurance Premium (% above homeowner)
                      <InfoTooltip param="landlordInsurancePremium" />
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={params.landlordInsurancePremium}
                      onChange={(e) => updateParam('landlordInsurancePremium', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance (% of rent)
                      <InfoTooltip param="maintenanceRental" />
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={params.maintenanceRental}
                        onChange={(e) => updateParam('maintenanceRental', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"

                      />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        ${formatCurrency(params.housePrice * (params.maintenanceRental / 100))}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CapEx Reserve (% of rent)
                      <InfoTooltip param="capexReserve" />
                    </label>
                    <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={params.capexReserve}
                      onChange={(e) => updateParam('capexReserve', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        ${formatCurrency(params.housePrice * (params.capexReserve / 100))}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turnover Cost (months of rent)
                      <InfoTooltip param="turnoverCostMonths" />
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={params.turnoverCostMonths}
                      onChange={(e) => updateParam('turnoverCostMonths', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Tenant Stay (years)
                      <InfoTooltip param="avgTenancyYears" />
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={params.avgTenancyYears}
                      onChange={(e) => updateParam('avgTenancyYears', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-teal-900 border-b-2 border-teal-200 pb-3">
                    Income & Taxes
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Income ($/year)
                      <InfoTooltip param="yearlyIncome" />
                    </label>
                    <input
                      type="number"
                      value={params.yearlyIncome}
                      onChange={(e) => updateParam('yearlyIncome', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      After-tax: ${formatCurrency(calculations.taxes.afterTaxIncome)}/year
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Filing Status
                      <InfoTooltip param="filingStatus" />
                    </label>
                    <select
                      value={params.filingStatus}
                      onChange={(e) => setParams(prev => ({ ...prev, filingStatus: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                      <option value="headOfHousehold">Head of Household</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State Tax Rate (%)
                      <InfoTooltip param="stateTaxRate" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.stateTaxRate}
                      onChange={(e) => updateParam('stateTaxRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use 0% for states with no income tax (FL, TX, WA, etc.)
                    </p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                    <p className="text-sm font-semibold text-teal-900">Tax Summary</p>
                    <div className="text-xs text-gray-700 space-y-1 mt-2">
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="font-semibold">${formatCurrency(calculations.taxes.federalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FICA (SS + Medicare):</span>
                        <span className="font-semibold">${formatCurrency(calculations.taxes.ficaTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Tax:</span>
                        <span className="font-semibold">${formatCurrency(calculations.taxes.stateTax)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-teal-300 font-bold">
                        <span>Effective Rate:</span>
                        <span>{calculations.taxes.effectiveTaxRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg text-orange-900 border-b-2 border-orange-200 pb-3 mt-8">
                    Monthly Living Expenses
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Groceries ($/month)
                      <InfoTooltip param="monthlyGroceries" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlyGroceries}
                      onChange={(e) => updateParam('monthlyGroceries', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transportation ($/month)
                      <InfoTooltip param="monthlyTransportation" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlyTransportation}
                      onChange={(e) => updateParam('monthlyTransportation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance ($/month)
                      <InfoTooltip param="monthlyInsurance" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlyInsurance}
                      onChange={(e) => updateParam('monthlyInsurance', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Utilities ($/month)
                      <InfoTooltip param="monthlyUtilities" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlyUtilities}
                      onChange={(e) => updateParam('monthlyUtilities', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscriptions ($/month)
                      <InfoTooltip param="monthlySubscriptions" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlySubscriptions}
                      onChange={(e) => updateParam('monthlySubscriptions', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Expenses ($/month)
                      <InfoTooltip param="monthlyOther" />
                    </label>
                    <input
                      type="number"
                      value={params.monthlyOther}
                      onChange={(e) => updateParam('monthlyOther', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <p className="text-sm font-semibold text-orange-900">Total Living Expenses</p>
                    <p className="text-2xl font-bold text-orange-800">${formatCurrency(totalMonthlyLivingExpenses)}/month</p>
                    <p className="text-xs text-gray-600 mt-1">${formatCurrency(totalMonthlyLivingExpenses * 12)}/year</p>
                  </div>

                  <h3 className="font-semibold text-lg text-purple-900 border-b-2 border-purple-200 pb-3 mt-8">
                    Investment & Timeline
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Market Return (% per year)
                      <InfoTooltip param="stockReturn" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.stockReturn}
                      onChange={(e) => updateParam('stockReturn', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dividend Yield (%)
                      <InfoTooltip param="dividendYield" />
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={params.dividendYield}
                      onChange={(e) => updateParam('dividendYield', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={params.dividendsReinvested}
                        onChange={(e) => updateParam('dividendsReinvested', e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium text-gray-900 font-medium">Reinvest Dividends</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Cash Available ($)
                      <InfoTooltip param="initialCash" />
                    </label>
                    <input
                      type="number"
                      value={params.initialCash}
                      onChange={(e) => updateParam('initialCash', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years to Analyze
                      <InfoTooltip param="yearsToAnalyze" />
                    </label>
                    <input
                      type="number"
                      value={params.yearsToAnalyze}
                      onChange={(e) => updateParam('yearsToAnalyze', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-medium"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div className="bg-purple-100 p-5 rounded-xl border-2 border-purple-300">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recurring Contributions
                    </h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={params.enableRecurringContributions}
                          onChange={(e) => updateParam('enableRecurringContributions', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Enable Recurring Contributions</span>
                      </label>

                      {params.enableRecurringContributions && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contribution Amount ($)
                            </label>
                            <input
                              type="number"
                              value={params.contributionAmount}
                              onChange={(e) => updateParam('contributionAmount', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Frequency
                            </label>
                            <select
                              value={params.contributionFrequency}
                              onChange={(e) => setParams(prev => ({ ...prev, contributionFrequency: e.target.value }))}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-medium"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>

                          <div className="text-xs text-purple-700 bg-white p-2 rounded">
                            Total per year: ${formatCurrency(params.contributionFrequency === 'monthly' ? 
                              params.contributionAmount * 12 : params.contributionAmount)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'cashflow' && (
                <div className="space-y-8">
                    {/* Monthly cost cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-2">Buy to Live</h4>
                        <p className="text-3xl font-bold text-red-600">
                        -${formatCurrency(calculations.buyToLive[0].monthlyPayment)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">per month</p>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2">Buy to Rent</h4>
                        <p className={`text-3xl font-bold ${calculations.buyToRent[0].monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculations.buyToRent[0].monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(Math.round(calculations.buyToRent[0].monthlyCashFlow))}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">per month</p>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">Stocks Only</h4>
                        <p className="text-3xl font-bold text-gray-600">
                        ${formatCurrency(Math.round(calculations.stocksOnly[0].monthlyCashFlow))}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">per month</p>
                    </div>
                    </div> */}

                    {/* Line chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                    <h4 className="font-semibold text-lg mb-4">Monthly Cash Flow Over Time</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={cashFlowChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${formatCurrency(value)}`} />
                        <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="Own Your Home" stroke="#4F46E5" strokeWidth={2} />
                        <Line type="monotone" dataKey="Buy Rental Property" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Rent & Invest More" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="Skip Homeownership" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Year-by-Year Net Worth Comparison</h3>
                  <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900 font-medium">Year</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-900 font-medium">Buy to Live</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-900 font-medium">Buy to Rent</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-900 font-medium">Stocks Only</th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900 font-medium">Winner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 5, 10, 15, 20, 25, 30, 35].filter(y => y <= params.yearsToAnalyze).map(year => {
                          const live = calculations.buyToLive[year];
                          const rent = calculations.buyToRent[year];
                          const stocks = calculations.stocksOnly[year];
                          
                          const values = {
                            live: live.netWorth,
                            rent: rent.netWorth,
                            stocks: stocks.netWorth,
                          };
                          
                          const max = Math.max(...Object.values(values));
                          
                          return (
                            <tr key={year} className="border-b hover:bg-gray-50 transition ">
                              <td className="px-6 py-4 text-gray-900 font-medium">{year}</td>
                              <td className={`px-6 py-4 text-right text-gray-900 ${live.netWorth === max ? 'font-bold text-indigo-600 bg-indigo-50 ' : ''}`}>
                                ${formatCurrency(live.netWorth)}
                              </td>
                              <td className={`px-6 py-4 text-right text-gray-900 ${rent.netWorth === max ? 'font-bold text-green-600 bg-green-50 ' : ''}`}>
                                ${formatCurrency(rent.netWorth)}
                              </td>
                              <td className={`px-6 py-4 text-right text-gray-900 ${stocks.netWorth === max ? 'font-bold text-purple-600 bg-purple-50 ' : ''}`}>
                                ${formatCurrency(stocks.netWorth)}
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-medium">
                                {live.netWorth === max && '🏠 Buy to Live'}
                                {rent.netWorth === max && '💰 Buy to Rent'}
                                {stocks.netWorth === max && '📈 Stocks Only'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Return on Investment Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.keys(finalResults).filter(key => key !== 'stocksWithContributions' || params.enableRecurringContributions).map(strategyKey => {
                      const result = finalResults[strategyKey];
                      const totalROI = ((result.netWorth / params.initialCash) - 1) * 100;
                      const annualROI = (Math.pow(result.netWorth / params.initialCash, 1/params.yearsToAnalyze) - 1) * 100;
                      
                      const colorMap = {
                        buyToLive: 'indigo',
                        buyToRent: 'green',
                        stocksOnly: 'purple',
                      };
                      const color = colorMap[strategyKey];
                      
                      return (
                        <div key={strategyKey} className={`bg-${color}-50 p-6 rounded-xl border-2 border-${color}-200`}>
                          <h4 className={`font-semibold text-${color}-900 mb-3`}>{formatStrategyName(strategyKey)}</h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-700">
                              Initial: ${formatCurrency(params.initialCash)}
                            </p>
                            <p className="text-gray-700">
                              Final: ${formatCurrency(result.netWorth)}
                            </p>
                            <p className={`text-gray-700 font-semibold text-${color}-700`}>
                              Total ROI: {totalROI.toFixed(1)}%
                            </p>
                            <p className="text-gray-700">
                              Annual ROI: {annualROI.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Break-Even Analysis</h3>
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          When does Buy to Rent become more profitable than Stocks Only?
                        </p>
                        {(() => {
                          const breakEvenYear = calculations.buyToRent.findIndex((item, idx) => 
                            item.netWorth > calculations.stocksOnly[idx].netWorth
                          );
                          return breakEvenYear > 0 ? (
                            <p className="text-sm text-gray-600">
                              Buy to Rent surpasses Stocks Only at Year {breakEvenYear}
                            </p>
                          ) : breakEvenYear === 0 ? (
                            <p className="text-sm text-gray-600">
                              Buy to Rent is immediately more profitable
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Buy to Rent never surpasses Stocks Only in this timeframe
                            </p>
                          );
                        })()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          When does Buy to Live become more profitable than Stocks Only?
                        </p>
                        {(() => {
                          const breakEvenYear = calculations.buyToLive.findIndex((item, idx) => 
                            item.netWorth > calculations.stocksOnly[idx].netWorth
                          );
                          return breakEvenYear > 0 ? (
                            <p className="text-sm text-gray-600">
                              Buy to Live surpasses Stocks Only at Year {breakEvenYear}
                            </p>
                          ) : breakEvenYear === 0 ? (
                            <p className="text-sm text-gray-600">
                              Buy to Live is immediately more profitable
                            </p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              Buy to Live never surpasses Stocks Only in this timeframe
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showExplanations && (() => {
                
                const downPayment = params.housePrice * (params.downPaymentPercent / 100);
                const loanAmount = params.housePrice - downPayment;

                return (
              <div className="mt-12 bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 pb-4 mb-6">
                  Calculation Methodology & Formulas
                </h3>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-indigo-900 mb-3 text-lg">Monthly Mortgage Payment</h4>
                    <div className="bg-indigo-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      M = P × [r(1+r)^n] / [(1+r)^n - 1]
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Where:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-2">
                      <li>M = Monthly payment</li>
                      <li>P = Principal (loan amount)</li>
                      <li>r = Monthly interest rate (annual rate / 12)</li>
                      <li>n = Total number of payments (years × 12)</li>
                    </ul>
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Your Example:</p>
                      <p className="text-sm text-gray-700">
                        For your ${formatCurrency(loanAmount)} loan at {params.mortgageRate}% for {params.loanTermYears} years: Monthly rate = {params.mortgageRate}/12 = {(params.mortgageRate/100/12).toFixed(4)}, 
                        n = {params.loanTermYears * 12} months. Payment = ${formatCurrency(calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears))}/month
                      </p>
                    </div>
                    <div className="mt-4 bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
                        <p className="text-sm font-semibold text-indigo-900 mb-2">Your Total Monthly Housing Payment Breakdown:</p>
                        <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex justify-between">
                            <span>Principal & Interest (Mortgage):</span>
                            <span className="font-medium">${formatCurrency(calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears))}</span>
                            </div>
                            {params.downPaymentPercent < params.pmiThreshold && (
                            <div className="flex justify-between text-amber-700">
                                <span>PMI (until {params.pmiThreshold}% equity):</span>
                                <span className="font-medium">${formatCurrency((loanAmount * (params.pmiRate / 100)) / 12)}</span>
                            </div>
                            )}
                            <div className="flex justify-between">
                            <span>Property Tax:</span>
                            <span className="font-medium">${formatCurrency((params.housePrice * (params.propertyTaxRate / 100)) / 12)}</span>
                            </div>
                            <div className="flex justify-between">
                            <span>Home Insurance:</span>
                            <span className="font-medium">${formatCurrency(params.homeInsurance)}</span>
                            </div>
                            <div className="flex justify-between">
                            <span>HOA Fees:</span>
                            <span className="font-medium">${formatCurrency(params.hoaFees)}</span>
                            </div>
                            <div className="flex justify-between">
                            <span>Maintenance Reserve (1% annually):</span>
                            <span className="font-medium">${formatCurrency((params.housePrice * (params.maintenancePercent / 100)) / 12)}</span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t-2 border-indigo-300 font-bold text-indigo-900">
                            <span>TOTAL Monthly Payment:</span>
                            <span className="text-lg">${formatCurrency(
                                calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears) +
                                (params.downPaymentPercent < params.pmiThreshold ? (loanAmount * (params.pmiRate / 100)) / 12 : 0) +
                                (params.housePrice * (params.propertyTaxRate / 100)) / 12 +
                                params.homeInsurance +
                                params.hoaFees +
                                (params.housePrice * (params.maintenancePercent / 100)) / 12
                            )}</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-amber-900 mb-3 text-lg">PMI (Private Mortgage Insurance)</h4>
                    <div className="bg-amber-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Monthly PMI = (Loan Amount × PMI Rate) / 12
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      PMI is required when down payment is less than 20% of home value. It typically costs 0.3-1.5% of the loan amount annually. PMI is removed once you reach 20% equity through payments and appreciation.
                    </p>
                    <div className="mt-4 bg-amber-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Example:</p>
                      <p className="text-sm text-gray-700">
                        For your ${formatCurrency(params.housePrice)} home with {params.downPaymentPercent}% down (${formatCurrency(params.housePrice * (params.downPaymentPercent / 100))}) = ${formatCurrency(loanAmount)} loan.
                        At 0.5% PMI rate: Annual PMI = $1,508, Monthly PMI = ${formatCurrency(loanAmount * 0.005 / 12)}/month
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-indigo-900 mb-3 text-lg">Buy to Live Net Worth Calculation</h4>
                    <div className="bg-indigo-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Net Worth = Home Equity + Stock Investments
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Home Equity:</strong> Current home value minus remaining mortgage balance
                    </p>
                    <div className="bg-indigo-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Home Value(t) = Purchase Price × (1 + Appreciation Rate)^t
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Stock Investments:</strong> Any cash not used for down payment, invested in the market
                    </p>
                    <div className="bg-indigo-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Stock Value(t) = (Initial Cash - Down Payment) × (1 + Stock Return)^t
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Monthly Costs:</strong> Mortgage + PMI + Property Tax + Insurance + HOA + Maintenance
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Example (Year 10):</p>
                      <p className="text-sm text-gray-700">
                        ${formatCurrency(params.housePrice)} home appreciating at {params.homeAppreciation}%/year = ${formatCurrency(params.housePrice * Math.pow(1 + params.homeAppreciation / 100, 10))} value.
                        Remaining mortgage = ${formatCurrency(calculateRemainingBalance(loanAmount, params.mortgageRate, params.loanTermYears, 120))}.
                        Home Equity = ${formatCurrency(params.housePrice * Math.pow(1 + params.homeAppreciation / 100, 10) - calculateRemainingBalance(loanAmount, params.mortgageRate, params.loanTermYears, 120))}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-green-900 mb-3 text-lg">Buy to Rent Net Worth Calculation</h4>
                    <div className="bg-green-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Net Worth = Home Equity + Initial Stock Investment + Accumulated Rental Profits
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Net Monthly Rent:</strong>
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Gross Rent × (1 - Vacancy Rate) × (1 - Management Fee %)
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Monthly Expenses:</strong> Mortgage + PMI + Property Tax + Landlord Insurance + HOA + Maintenance + CapEx Reserve
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Monthly Cash Flow:</strong>
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Cash Flow = Net Monthly Rent - Monthly Expenses
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Positive cash flow is invested in stocks and compounds over time. Turnover costs (cleaning, repairs, vacancy) occur every few years based on average tenant stay.
                    </p>
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-2">Example:</p>
                      <p className="text-sm text-gray-700">
                        Monthly rent of ${formatCurrency(monthlyRentCalculated)} with {params.vacancyRate}% vacancy = ${formatCurrency(monthlyRentCalculated * (1 - (params.vacancyRate / 100)))} effective rent per month.
                        {params.propertyManagementPercent} % management fee = ${formatCurrency(monthlyRentCalculated * (1 - params.vacancyRate / 100) * (params.propertyManagementPercent / 100))} per month. Net rent = ${formatCurrency(monthlyRentCalculated * (1 - params.vacancyRate / 100) - monthlyRentCalculated * (1 - params.vacancyRate / 100) * (params.propertyManagementPercent / 100))}.
                        If expenses = $1,800, cash flow = ${formatCurrency(monthlyRentCalculated * (1 - params.vacancyRate / 100) - monthlyRentCalculated * (1 - params.vacancyRate / 100) * (params.propertyManagementPercent / 100) - 1800)} per month.
                      </p>    
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-purple-900 mb-3 text-lg">Stock Investment Calculations</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Basic Growth (Stocks Only):</strong>
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Value(t) = Initial Investment × (1 + Return Rate)^t
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>With Dividends (Reinvested):</strong>
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Annual Dividend = Portfolio Value × Dividend Yield<br/>
                      Dividend Value(t) = Σ [Dividend(year i) × (1 + Return)^(t-i)]
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>With Recurring Contributions:</strong>
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg font-mono text-sm mb-3 text-gray-900 font-medium">
                      Future Value = Σ [Contribution(year i) × (1 + Return)^(t-i)]
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Each year's contribution grows for the remaining years until the target year.
                    </p>
                    <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-purple-900 mb-2">Example (10 years):</p>
                      <p className="text-sm text-gray-700">
                        ${formatCurrency(params.initialCash)} initial at {params.stockReturn}% return = ${formatCurrency(params.initialCash * Math.pow(1 + params.stockReturn / 100, 10))}.
                        
                        With ${formatCurrency(params.contributionAmount)} monthly contributions ({params.contributionFrequency === 'monthly' ? '$' + formatCurrency(params.contributionAmount * 12) : '$' + formatCurrency(params.contributionAmount)} per year) over 10 years = approximately ${formatCurrency(
                        (() => {
                            const monthlyRate = params.stockReturn / 100 / 12;
                            const months = 10 * 12;
                            const yearlyContribution = params.contributionFrequency === 'monthly' ? params.contributionAmount * 12 : params.contributionAmount;
                            // Future value of annuity formula
                            return yearlyContribution * ((Math.pow(1 + params.stockReturn / 100, 10) - 1) / (params.stockReturn / 100));
                        })()
                        )} from contributions alone.
                        
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">Key Assumptions</h4>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                      <li>All returns are real (inflation-adjusted) unless otherwise specified</li>
                      <li>Stock returns and real estate appreciation compound annually</li>
                      <li>Rental income and expenses adjust annually for growth/inflation</li>
                      <li>Maintenance costs scale with home value (for owners) or rent (for landlords)</li>
                      <li>PMI is removed when home equity reaches the threshold percentage (typically 20%)</li>
                      <li>Rental property cash flows are reinvested in stocks immediately</li>
                      <li>No taxes, transaction costs, or selling fees are included (focus on net worth only)</li>
                      <li>Perfect market liquidity assumed</li>
                      <li>Dividends can be reinvested or taken as cash</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">Data Sources & Defaults</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>Property Appreciation:</strong> Historical average for major metros ranges 3-6% annually. Houston historically: 6.04% (10-year average through 2025).</p>
                      <p><strong>Stock Returns:</strong> S&P 500 historical average ~10% nominal, ~7-8% real (inflation-adjusted).</p>
                      <p><strong>Dividend Yields:</strong> S&P 500 current yield ~1.5-2%. Total return includes price appreciation + dividends.</p>
                      <p><strong>Property Tax:</strong> Varies widely by location. Range: 0.3% (Hawaii) to 2.5% (New Jersey). Houston average: 1.9%.</p>
                      <p><strong>PMI Rate:</strong> Typically 0.3-1.5% of loan amount annually. Default: 0.5%.</p>
                      <p><strong>Rental Vacancy:</strong> National average 6-7%, varies by market conditions. Houston currently elevated at 11% (apartments).</p>
                      <p><strong>Property Management:</strong> Typical range 8-12% of monthly rent. Houston average: 8-10%.</p>
                      <p><strong>CapEx Reserve:</strong> Industry standard 8-10% of rent for major repairs (roof, HVAC, appliances).</p>
                      <p><strong>Maintenance:</strong> 1% of home value annually for owners, 3-5% of rent for landlords.</p>
                    </div>
                  </div>
                </div>
              </div>
                );
            })()}
          </div>
        </div>
        

        <div className="text-center text-gray-600 text-sm mt-8 pb-4">
          <p>Interactive Investment Strategy Calculator • Adjust parameters to explore scenarios</p>
          <p className="text-xs text-gray-500 mt-2">For educational purposes only. Not financial advice. Consult a professional advisor.</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalyzer;