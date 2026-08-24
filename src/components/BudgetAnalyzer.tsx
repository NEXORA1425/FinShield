import React, { useState, useMemo } from 'react';
import {
  Wallet,
  PieChart as PieChartIcon,
  TrendingDown,
  PiggyBank,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { BudgetInputs, BudgetAnalysisResult } from '../types';

export const BudgetAnalyzer: React.FC = () => {
  // Preloaded with realistic initial default values
  const [inputs, setInputs] = useState<BudgetInputs>({
    income: 30000,
    expenses: {
      food: 5000,
      transport: 3000,
      bills: 7000,
      shopping: 4000,
      education: 1000,
      other: 1000,
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<BudgetAnalysisResult | null>(null);

  // Local deterministic calculations (strict requirement: arithmetic in React code)
  const calculations = useMemo(() => {
    const food = Math.max(0, inputs.expenses.food || 0);
    const transport = Math.max(0, inputs.expenses.transport || 0);
    const bills = Math.max(0, inputs.expenses.bills || 0);
    const shopping = Math.max(0, inputs.expenses.shopping || 0);
    const education = Math.max(0, inputs.expenses.education || 0);
    const other = Math.max(0, inputs.expenses.other || 0);

    const totalExpenses = food + transport + bills + shopping + education + other;
    const income = Math.max(0, inputs.income || 0);
    const remainingBalance = income - totalExpenses;
    const savingsRate = income > 0 ? ((remainingBalance / income) * 100).toFixed(1) : '0';

    const percentages = {
      food: totalExpenses > 0 ? ((food / totalExpenses) * 100).toFixed(1) : '0',
      transport: totalExpenses > 0 ? ((transport / totalExpenses) * 100).toFixed(1) : '0',
      bills: totalExpenses > 0 ? ((bills / totalExpenses) * 100).toFixed(1) : '0',
      shopping: totalExpenses > 0 ? ((shopping / totalExpenses) * 100).toFixed(1) : '0',
      education: totalExpenses > 0 ? ((education / totalExpenses) * 100).toFixed(1) : '0',
      other: totalExpenses > 0 ? ((other / totalExpenses) * 100).toFixed(1) : '0',
    };

    return {
      totalExpenses,
      remainingBalance,
      savingsRate: Number(savingsRate),
      percentages,
      rawNumbers: { food, transport, bills, shopping, education, other },
    };
  }, [inputs]);

  // Chart data
  const chartData = [
    { name: 'Food', value: calculations.rawNumbers.food, color: '#10B981' },
    { name: 'Bills & Utilities', value: calculations.rawNumbers.bills, color: '#3B82F6' },
    { name: 'Shopping', value: calculations.rawNumbers.shopping, color: '#F59E0B' },
    { name: 'Transport', value: calculations.rawNumbers.transport, color: '#8B5CF6' },
    { name: 'Education', value: calculations.rawNumbers.education, color: '#EC4899' },
    { name: 'Other', value: calculations.rawNumbers.other, color: '#64748B' },
  ].filter((item) => item.value > 0);

  const handleExpenseChange = (category: keyof BudgetInputs['expenses'], val: string) => {
    const parsed = parseFloat(val) || 0;
    setInputs((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [category]: Math.max(0, parsed),
      },
    }));
  };

  const handleIncomeChange = (val: string) => {
    const parsed = parseFloat(val) || 0;
    setInputs((prev) => ({
      ...prev,
      income: Math.max(0, parsed),
    }));
  };

  const handleAnalyzeBudget = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (inputs.income <= 0) {
      setError('Please enter a monthly income greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: inputs.income,
          expenses: inputs.expenses,
          totalExpenses: calculations.totalExpenses,
          remainingBalance: calculations.remainingBalance,
          percentages: calculations.percentages,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data: BudgetAnalysisResult = await res.json();
      setAiResult(data);
    } catch (err: any) {
      console.error('Error analyzing budget:', err);
      setError(err?.message || 'Unable to analyze your budget right now.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetScenario = (type: 'student' | 'entryLevel' | 'frugal') => {
    if (type === 'student') {
      setInputs({
        income: 15000,
        expenses: {
          food: 4500,
          transport: 1500,
          bills: 3500,
          shopping: 1500,
          education: 2000,
          other: 500,
        },
      });
    } else if (type === 'entryLevel') {
      setInputs({
        income: 30000,
        expenses: {
          food: 5000,
          transport: 3000,
          bills: 7000,
          shopping: 4000,
          education: 1000,
          other: 1000,
        },
      });
    } else if (type === 'frugal') {
      setInputs({
        income: 45000,
        expenses: {
          food: 7000,
          transport: 3500,
          bills: 10000,
          shopping: 3000,
          education: 2500,
          other: 1500,
        },
      });
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Understand where your money goes.
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          See your spending clearly and get simple AI insights.
        </p>
      </div>

      {/* Preset Profiles */}
      <div className="flex items-center justify-center space-x-2">
        <span className="text-xs text-slate-500 font-semibold">Quick Profiles:</span>
        <button
          onClick={() => handlePresetScenario('student')}
          className="px-3 py-1 text-xs rounded-full bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200/80 shadow-sm transition"
        >
          Student (₹15k)
        </button>
        <button
          onClick={() => handlePresetScenario('entryLevel')}
          className="px-3 py-1 text-xs rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#10B981] border border-emerald-300 font-semibold shadow-sm transition"
        >
          Young Earner (₹30k)
        </button>
        <button
          onClick={() => handlePresetScenario('frugal')}
          className="px-3 py-1 text-xs rounded-full bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200/80 shadow-sm transition"
        >
          Professional (₹45k)
        </button>
      </div>

      {/* Local Arithmetic Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Income Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Monthly Income</span>
            <Wallet className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 pt-1">₹{inputs.income.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Entered monthly income</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 pt-1">₹{calculations.totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-slate-500">
            {inputs.income > 0 ? `${((calculations.totalExpenses / inputs.income) * 100).toFixed(1)}% of income` : '0%'}
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Remaining Surplus</span>
            <PiggyBank className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className={`text-2xl sm:text-3xl font-bold pt-1 ${calculations.remainingBalance >= 0 ? 'text-[#10B981]' : 'text-rose-600'}`}>
            {calculations.remainingBalance >= 0 ? `+₹${calculations.remainingBalance.toLocaleString()}` : `-₹${Math.abs(calculations.remainingBalance).toLocaleString()}`}
          </p>
          <p className="text-xs text-emerald-700">
            {calculations.savingsRate}% monthly savings buffer
          </p>
        </div>
      </div>

      {/* Main Budget Grid: Inputs on Left, Recharts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Budget Inputs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Adjust values to calculate totals in real-time.</p>
          </div>

          <form onSubmit={handleAnalyzeBudget} className="space-y-4">
            {/* Income Field */}
            <div className="space-y-1">
              <label htmlFor="input-income" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Monthly Income (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  id="input-income"
                  type="number"
                  min="0"
                  step="500"
                  value={inputs.income || ''}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Expense Categories (₹)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Food */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-food">Food & Groceries</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.food}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-food"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.food || ''}
                      onChange={(e) => handleExpenseChange('food', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Bills & Utilities */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-bills">Bills & Rent</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.bills}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-bills"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.bills || ''}
                      onChange={(e) => handleExpenseChange('bills', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Transport */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-transport">Transport & Fuel</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.transport}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-transport"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.transport || ''}
                      onChange={(e) => handleExpenseChange('transport', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Shopping */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-shopping">Shopping & Discretionary</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.shopping}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-shopping"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.shopping || ''}
                      onChange={(e) => handleExpenseChange('shopping', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-education">Education / Books</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.education}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-education"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.education || ''}
                      onChange={(e) => handleExpenseChange('education', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Other */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="input-other">Other & Misc</label>
                    <span className="text-slate-400 font-normal">{calculations.percentages.other}%</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      id="input-other"
                      type="number"
                      min="0"
                      step="100"
                      value={inputs.expenses.other || ''}
                      onChange={(e) => handleExpenseChange('other', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#10B981] text-slate-900 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                id="analyze-budget-btn"
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#10B981]" />
                    <span>Analyzing your spending...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#10B981]" />
                    <span>Analyze Budget</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Recharts Visualization & Visual Meters */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Spending Distribution</h2>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                ₹{calculations.totalExpenses.toLocaleString()} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Visual proportions across active categories.</p>
          </div>

          {/* Pie Chart */}
          <div className="h-56 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs">
                <p>Enter expenses to view chart breakdown</p>
              </div>
            )}
          </div>

          {/* Category Badges / Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            {chartData.map((item) => (
              <div key={item.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                </div>
                <p className="text-slate-600 font-medium">₹{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* 50-30-20 Benchmark Guide */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Standard 50/30/20 Rule Benchmark</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Guidelines suggest ~50% on Needs (bills, groceries), ~30% on Wants (shopping, dining), and ~20% for Savings. Currently saving {calculations.savingsRate}% of income.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => handleAnalyzeBudget()}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* AI Structured Feedback Card */}
      {aiResult && !loading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center border border-emerald-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700">AI Budget Coach</span>
                <h3 className="text-lg font-bold text-slate-900">Spending Insights</h3>
              </div>
            </div>

            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
              Highest Spend: <strong className="text-slate-900 font-semibold">{aiResult.highestSpendingCategory}</strong>
            </div>
          </div>

          {/* Summary Overview */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-1">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Overview Assessment</h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {aiResult.summary}
            </p>
          </div>

          {/* Observations and Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Observations */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Observations</span>
              </h4>
              <ul className="space-y-2">
                {aiResult.observations.map((obs, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Optimization Ideas</span>
              </h4>
              <ul className="space-y-2">
                {aiResult.suggestions.map((sug, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remaining Money Advice */}
          <div className="bg-[#0F172A] text-white p-5 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-semibold text-[#10B981] uppercase tracking-wider flex items-center space-x-1.5">
              <PiggyBank className="w-4 h-4" />
              <span>Surplus Guidance</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {aiResult.remainingMoneyAdvice}
            </p>
          </div>

          <div className="text-center text-xs text-slate-400">
            <p>
              * FinShield offers general financial literacy feedback.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
