export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskAnalysisResult {
  riskLevel: RiskLevel;
  riskIndicators: string[];
  explanation: string;
  safetyRecommendations: string[];
}

export interface BudgetInputs {
  income: number;
  expenses: {
    food: number;
    transport: number;
    bills: number;
    shopping: number;
    education: number;
    other: number;
  };
}

export interface BudgetCalculations {
  totalExpenses: number;
  remainingBalance: number;
  savingsRate: number;
  percentages: {
    food: number;
    transport: number;
    bills: number;
    shopping: number;
    education: number;
    other: number;
  };
}

export interface BudgetAnalysisResult {
  summary: string;
  highestSpendingCategory: string;
  observations: string[];
  suggestions: string[];
  remainingMoneyAdvice: string;
}

export type ExplainerLanguage = 'en' | 'hi';

export interface ExplainerResult {
  simpleExplanation: string;
  example: string;
  keyTakeaway: string;
}

export type ActiveTab = 'landing' | 'dashboard' | 'risk-analyzer' | 'budget' | 'explainer';
