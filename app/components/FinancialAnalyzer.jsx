'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, Home, DollarSign, Info } from 'lucide-react';

const FinancialAnalyzer = () => {
  const [params, setParams] = useState({
    housePrice: 300000,
    downPaymentPercent: 20,
    mortgageRate: 5.0,
    loanTermYears: 30,
    propertyTaxRate: 1.5,
    homeInsurance: 100,
    hoaFees: 100,
    homeAppreciation: 3.0,
    maintenancePercent: 1.0,
    monthlyRent: 2500,
    vacancyRate: 5,
    propertyManagementPercent: 10,
    rentGrowth: 3.0,
    stockReturn: 7.5,
    yearsToAnalyze: 35,
    initialCash: 60000
  });

  const [showExplanations, setShowExplanations] = useState(true);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
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

  const calculations = useMemo(() => {
    const downPayment = params.housePrice * (params.downPaymentPercent / 100);
    const loanAmount = params.housePrice - downPayment;
    const monthlyMortgage = calculateMortgagePayment(loanAmount, params.mortgageRate, params.loanTermYears);
    const monthlyPropertyTax = (params.housePrice * (params.propertyTaxRate / 100)) / 12;
    const monthlyMaintenance = (params.housePrice * (params.maintenancePercent / 100)) / 12;

    const results = {
      buyToLive: [],
      buyToRent: [],
      stocksOnly: []
    };

    for (let year = 0; year <= params.yearsToAnalyze; year++) {
      const month = year * 12;
      const homeValue = params.housePrice * Math.pow(1 + params.homeAppreciation / 100, year);
      const remainingMortgage = calculateRemainingBalance(
        loanAmount, 
        params.mortgageRate, 
        params.loanTermYears * 12, 
        month
      );

      const homeEquityLive = homeValue - remainingMortgage;
      const monthlyHousingCost = monthlyMortgage + monthlyPropertyTax + 
                                params.homeInsurance + params.hoaFees + monthlyMaintenance;
      const totalHousingCostPaid = year > 0 ? 
        (monthlyHousingCost * Math.min(month, params.loanTermYears * 12)) : 0;

      const initialStockInvestment = params.initialCash - downPayment;
      const stockValueLive = initialStockInvestment * Math.pow(1 + params.stockReturn / 100, year);
      
      const netWorthLive = homeEquityLive + stockValueLive;

      const homeEquityRent = homeValue - remainingMortgage;
      const monthlyRentIncome = params.monthlyRent * Math.pow(1 + params.rentGrowth / 100, year);
      const effectiveRent = monthlyRentIncome * (1 - params.vacancyRate / 100);
      const propertyManagementFee = effectiveRent * (params.propertyManagementPercent / 100);
      const netMonthlyRent = effectiveRent - propertyManagementFee;
      
      const monthlyExpenses = monthlyMortgage + monthlyPropertyTax + 
                             params.homeInsurance + params.hoaFees + monthlyMaintenance;
      const monthlyCashFlow = netMonthlyRent - monthlyExpenses;
      
      let rentalProfitsInvested = 0;
      if (year > 0) {
        for (let y = 1; y <= year; y++) {
          const rentAtYear = params.monthlyRent * Math.pow(1 + params.rentGrowth / 100, y);
          const effectiveRentAtYear = rentAtYear * (1 - params.vacancyRate / 100);
          const managementAtYear = effectiveRentAtYear * (params.propertyManagementPercent / 100);
          const netRentAtYear = effectiveRentAtYear - managementAtYear;
          const cashFlowAtYear = (netRentAtYear - monthlyExpenses) * 12;
          
          const yearsOfGrowth = year - y;
          rentalProfitsInvested += cashFlowAtYear * Math.pow(1 + params.stockReturn / 100, yearsOfGrowth);
        }
      }
      
      const initialStockInvestmentRent = params.initialCash - downPayment;
      const stockValueRent = initialStockInvestmentRent * Math.pow(1 + params.stockReturn / 100, year);
      const totalStocksRent = stockValueRent + rentalProfitsInvested;
      
      const netWorthRent = homeEquityRent + totalStocksRent;

      const stockValueOnly = params.initialCash * Math.pow(1 + params.stockReturn / 100, year);
      const netWorthStocks = stockValueOnly;

      results.buyToLive.push({
        year,
        netWorth: netWorthLive,
        homeEquity: homeEquityLive,
        stockValue: stockValueLive,
        homeValue,
        remainingMortgage,
        monthlyPayment: monthlyHousingCost,
        totalCostPaid: downPayment + totalHousingCostPaid
      });

      results.buyToRent.push({
        year,
        netWorth: netWorthRent,
        homeEquity: homeEquityRent,
        stockValue: totalStocksRent,
        homeValue,
        remainingMortgage,
        monthlyRent: netMonthlyRent,
        monthlyExpenses,
        monthlyCashFlow,
        totalCostPaid: downPayment
      });

      results.stocksOnly.push({
        year,
        netWorth: netWorthStocks,
        stockValue: stockValueOnly,
        monthlyPayment: 0
      });
    }

    return results;
  }, [params]);

  const netWorthChartData = useMemo(() => {
    return calculations.buyToLive.map((item, idx) => ({
      year: item.year,
      'Buy to Live': Math.round(item.netWorth),
      'Buy to Rent': Math.round(calculations.buyToRent[idx].netWorth),
      'Stocks Only': Math.round(calculations.stocksOnly[idx].netWorth)
    }));
  }, [calculations]);

  const cashFlowChartData = useMemo(() => {
    return calculations.buyToLive.slice(0, 36).map((item, idx) => ({
      year: item.year,
      'Buy to Live': -Math.round(item.monthlyPayment),
      'Buy to Rent': Math.round(calculations.buyToRent[idx].monthlyCashFlow),
      'Stocks Only': 0
    }));
  }, [calculations]);

  const finalYear = params.yearsToAnalyze;
  const finalResults = {
    buyToLive: calculations.buyToLive[finalYear],
    buyToRent: calculations.buyToRent[finalYear],
    stocksOnly: calculations.stocksOnly[finalYear]
  };

  const bestStrategy = Object.keys(finalResults).reduce((best, current) => 
    finalResults[current].netWorth > finalResults[best].netWorth ? current : best
  );

  const formatCurrency = (value) => {
    return value.toLocaleString(undefined, {maximumFractionDigits: 0});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-10 h-10 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Real Estate vs Stock Investment Analyzer
              </h1>
            </div>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
            >
              <Info className="w-4 h-4" />
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-indigo-900 border-b pb-2">Property Parameters</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Price ($)
                </label>
                <input
                  type="number"
                  value={params.housePrice}
                  onChange={(e) => updateParam('housePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  value={params.downPaymentPercent}
                  onChange={(e) => updateParam('downPaymentPercent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mortgage Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.mortgageRate}
                  onChange={(e) => updateParam('mortgageRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (Years)
                </label>
                <input
                  type="number"
                  value={params.loanTermYears}
                  onChange={(e) => updateParam('loanTermYears', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.propertyTaxRate}
                  onChange={(e) => updateParam('propertyTaxRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Insurance ($/month)
                </label>
                <input
                  type="number"
                  value={params.homeInsurance}
                  onChange={(e) => updateParam('homeInsurance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HOA Fees ($/month)
                </label>
                <input
                  type="number"
                  value={params.hoaFees}
                  onChange={(e) => updateParam('hoaFees', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance (% of home value/year)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.maintenancePercent}
                  onChange={(e) => updateParam('maintenancePercent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Appreciation (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.homeAppreciation}
                  onChange={(e) => updateParam('homeAppreciation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-green-900 border-b pb-2">Rental Parameters</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent ($/month)
                </label>
                <input
                  type="number"
                  value={params.monthlyRent}
                  onChange={(e) => updateParam('monthlyRent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vacancy Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.vacancyRate}
                  onChange={(e) => updateParam('vacancyRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Management (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.propertyManagementPercent}
                  onChange={(e) => updateParam('propertyManagementPercent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent Growth (% per year)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.rentGrowth}
                  onChange={(e) => updateParam('rentGrowth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-purple-900 border-b pb-2">Investment & Timeline</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Market Return (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={params.stockReturn}
                  onChange={(e) => updateParam('stockReturn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Cash Available ($)
                </label>
                <input
                  type="number"
                  value={params.initialCash}
                  onChange={(e) => updateParam('initialCash', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years to Analyze
                </label>
                <input
                  type="number"
                  value={params.yearsToAnalyze}
                  onChange={(e) => updateParam('yearsToAnalyze', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                  max="50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <Home className="w-6 h-6 text-indigo-600" />
                <h3 className="font-semibold text-lg text-indigo-900">Buy to Live</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-indigo-900">
                  ${formatCurrency(finalResults.buyToLive.netWorth)}
                </p>
                <p className="text-sm text-gray-600">Final Net Worth</p>
                <p className="text-sm text-gray-700">
                  Monthly Cost: ${formatCurrency(finalResults.buyToLive.monthlyPayment)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-lg text-green-900">Buy to Rent</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-900">
                  ${formatCurrency(finalResults.buyToRent.netWorth)}
                </p>
                <p className="text-sm text-gray-600">Final Net Worth</p>
                <p className="text-sm text-gray-700">
                  Monthly Cash Flow: ${formatCurrency(finalResults.buyToRent.monthlyCashFlow)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-lg text-purple-900">Stocks Only</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-900">
                  ${formatCurrency(finalResults.stocksOnly.netWorth)}
                </p>
                <p className="text-sm text-gray-600">Final Net Worth</p>
                <p className="text-sm text-gray-700">
                  Monthly Cost: $0
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <p className="font-semibold text-yellow-800">
              Best Strategy: <span className="text-yellow-900">{bestStrategy.replace(/([A-Z])/g, ' $1').trim()}</span>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              After {params.yearsToAnalyze} years, this strategy yields the highest net worth of ${formatCurrency(finalResults[bestStrategy].netWorth)}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Net Worth Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={netWorthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Net Worth ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                <Legend />
                <Line type="monotone" dataKey="Buy to Live" stroke="#4F46E5" strokeWidth={2} />
                <Line type="monotone" dataKey="Buy to Rent" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="Stocks Only" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Monthly Cash Flow ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${formatCurrency(value)}`} />
                <Legend />
                <Bar dataKey="Buy to Live" fill="#4F46E5" />
                <Bar dataKey="Buy to Rent" fill="#10B981" />
                <Bar dataKey="Stocks Only" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Year-by-Year Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-right">Buy to Live</th>
                    <th className="px-4 py-2 text-right">Buy to Rent</th>
                    <th className="px-4 py-2 text-right">Stocks Only</th>
                    <th className="px-4 py-2 text-left">Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 5, 10, 15, 20, 25, 30, 35].filter(y => y <= params.yearsToAnalyze).map(year => {
                    const live = calculations.buyToLive[year];
                    const rent = calculations.buyToRent[year];
                    const stocks = calculations.stocksOnly[year];
                    const max = Math.max(live.netWorth, rent.netWorth, stocks.netWorth);
                    
                    return (
                      <tr key={year} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{year}</td>
                        <td className={`px-4 py-2 text-right ${live.netWorth === max ? 'font-bold text-indigo-600' : ''}`}>
                          ${formatCurrency(live.netWorth)}
                        </td>
                        <td className={`px-4 py-2 text-right ${rent.netWorth === max ? 'font-bold text-green-600' : ''}`}>
                          ${formatCurrency(rent.netWorth)}
                        </td>
                        <td className={`px-4 py-2 text-right ${stocks.netWorth === max ? 'font-bold text-purple-600' : ''}`}>
                          ${formatCurrency(stocks.netWorth)}
                        </td>
                        <td className="px-4 py-2">
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

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Return on Investment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Buy to Live</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    Initial Investment: ${formatCurrency(params.housePrice * params.downPaymentPercent / 100)}
                  </p>
                  <p className="text-gray-700">
                    Final Value: ${formatCurrency(finalResults.buyToLive.netWorth)}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Total ROI: {(((finalResults.buyToLive.netWorth / params.initialCash) - 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-700">
                    Annual ROI: {((Math.pow(finalResults.buyToLive.netWorth / params.initialCash, 1/params.yearsToAnalyze) - 1) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Buy to Rent</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    Initial Investment: ${formatCurrency(params.housePrice * params.downPaymentPercent / 100)}
                  </p>
                  <p className="text-gray-700">
                    Final Value: ${formatCurrency(finalResults.buyToRent.netWorth)}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Total ROI: {(((finalResults.buyToRent.netWorth / params.initialCash) - 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-700">
                    Annual ROI: {((Math.pow(finalResults.buyToRent.netWorth / params.initialCash, 1/params.yearsToAnalyze) - 1) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Stocks Only</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    Initial Investment: ${formatCurrency(params.initialCash)}
                  </p>
                  <p className="text-gray-700">
                    Final Value: ${formatCurrency(finalResults.stocksOnly.netWorth)}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Total ROI: {(((finalResults.stocksOnly.netWorth / params.initialCash) - 1) * 100).toFixed(1)}%
                  </p>
                  <p className="text-gray-700">
                    Annual ROI: {((Math.pow(finalResults.stocksOnly.netWorth / params.initialCash, 1/params.yearsToAnalyze) - 1) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Break-Even Analysis</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>When does Buy to Rent become more profitable than Stocks Only?</strong>
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
              
              <p className="text-sm text-gray-700 mb-2 mt-4">
                <strong>When does Buy to Live become more profitable than Stocks Only?</strong>
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

          {showExplanations && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                How the Calculations Work
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2">Monthly Mortgage Payment</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
                  </p>
                  <p className="text-sm text-gray-600">
                    Where: P = principal (loan amount), r = monthly interest rate, n = number of payments
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2">Buy to Live Strategy</h4>
                  <p className="text-sm text-gray-700">
                    <strong>Net Worth</strong> = Home Equity + Stock Investments
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Home Equity = Home Value - Remaining Mortgage Balance
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock Investments = (Initial Cash - Down Payment) × (1 + Stock Return)^Years
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Monthly Costs</strong> = Mortgage + Property Tax + Insurance + HOA + Maintenance
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Buy to Rent Strategy</h4>
                  <p className="text-sm text-gray-700">
                    <strong>Net Worth</strong> = Home Equity + Stock Investments (initial + accumulated rental profits)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Net Monthly Rent = Gross Rent × (1 - Vacancy Rate) × (1 - Management Fee)
                  </p>
                  <p className="text-sm text-gray-600">
                    Monthly Cash Flow = Net Rent - (Mortgage + Taxes + Insurance + HOA + Maintenance)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Positive cash flows are invested in stocks and compound over time
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Stocks Only Strategy</h4>
                  <p className="text-sm text-gray-700">
                    <strong>Net Worth</strong> = Initial Cash × (1 + Stock Return)^Years
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Simple compound growth with no housing expenses or rental income
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Assumptions</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>All returns are assumed to be inflation-adjusted (real returns)</li>
                    <li>Stock returns compound annually</li>
                    <li>Rental income and expenses adjust annually for growth/inflation</li>
                    <li>Maintenance costs scale with home value</li>
                    <li>No transaction costs, taxes, or selling fees included</li>
                    <li>Perfect market liquidity assumed</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-600 text-sm">
          <p>Interactive Financial Analysis Tool • Adjust parameters to explore different scenarios</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalyzer;