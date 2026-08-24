export interface ValidatedRiskInput {
  message: string;
}

export interface ExpenseBreakdown {
  food: number;
  transport: number;
  bills: number;
  shopping: number;
  education: number;
  other: number;
  [key: string]: number;
}

export interface CalculatedBudgetSummary {
  income: number;
  expenses: ExpenseBreakdown;
  totalExpenses: number;
  remainingBalance: number;
  percentages: Record<string, number>;
  highestCategory: { name: string; amount: number; percentage: number };
}

export interface ValidatedExplainerInput {
  question: string;
  language: "English" | "Hindi";
}

export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }
}

/**
 * Validate Risk Analyzer incoming payload
 */
export function validateRiskRequest(body: any): ValidatedRiskInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Please provide a valid request body.");
  }

  const { message } = body;
  if (message === undefined || message === null) {
    throw new ValidationError("Please provide a valid financial message to analyze.");
  }

  if (typeof message !== "string") {
    throw new ValidationError("Message must be a text string.");
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("Please provide a valid financial message to analyze.");
  }

  if (trimmed.length > 4000) {
    throw new ValidationError("Message is too long. Please limit to 4000 characters.");
  }

  return { message: trimmed };
}

/**
 * Validate Budget Analyzer incoming payload and execute server-side deterministic arithmetic
 */
export function validateAndCalculateBudget(body: any): CalculatedBudgetSummary {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Please provide a valid budget payload.");
  }

  const { income, expenses } = body;

  // Validate income
  if (income === undefined || income === null) {
    throw new ValidationError("Please provide a valid monthly income.");
  }

  const numIncome = Number(income);
  if (!Number.isFinite(numIncome) || isNaN(numIncome) || numIncome < 0) {
    throw new ValidationError("Income must be a valid, non-negative number.");
  }

  // Validate expenses object
  if (!expenses || typeof expenses !== "object" || Array.isArray(expenses)) {
    throw new ValidationError("Expenses must be an object with numeric category amounts.");
  }

  const categories = ["food", "transport", "bills", "shopping", "education", "other"];
  const sanitizedExpenses: ExpenseBreakdown = {
    food: 0,
    transport: 0,
    bills: 0,
    shopping: 0,
    education: 0,
    other: 0,
  };

  let totalExpenses = 0;
  let highestCategory = { name: "None", amount: 0, percentage: 0 };

  // Check categories in standard or custom list
  for (const cat of categories) {
    const rawVal = expenses[cat];
    const val = rawVal !== undefined && rawVal !== null ? Number(rawVal) : 0;
    if (!Number.isFinite(val) || isNaN(val) || val < 0) {
      throw new ValidationError(`Expense for '${cat}' must be a valid, non-negative number.`);
    }
    sanitizedExpenses[cat] = Math.round(val * 100) / 100;
    totalExpenses += sanitizedExpenses[cat];

    if (sanitizedExpenses[cat] > highestCategory.amount) {
      highestCategory = {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        amount: sanitizedExpenses[cat],
        percentage: 0,
      };
    }
  }

  totalExpenses = Math.round(totalExpenses * 100) / 100;
  const remainingBalance = Math.round((numIncome - totalExpenses) * 100) / 100;

  // Calculate percentages deterministically
  const percentages: Record<string, number> = {};
  for (const cat of categories) {
    percentages[cat] =
      totalExpenses > 0
        ? Math.round((sanitizedExpenses[cat] / totalExpenses) * 1000) / 10
        : 0;
  }

  if (totalExpenses > 0 && highestCategory.amount > 0) {
    highestCategory.percentage =
      Math.round((highestCategory.amount / totalExpenses) * 1000) / 10;
  }

  return {
    income: numIncome,
    expenses: sanitizedExpenses,
    totalExpenses,
    remainingBalance,
    percentages,
    highestCategory,
  };
}

/**
 * Validate Financial Explainer incoming payload
 */
export function validateExplainerRequest(body: any): ValidatedExplainerInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Please provide a valid request body.");
  }

  // Support both 'question' and 'query' keys for flexible frontend compatibility
  const rawQuestion = body.question !== undefined ? body.question : body.query;

  if (rawQuestion === undefined || rawQuestion === null) {
    throw new ValidationError("Please provide a financial question to explain.");
  }

  if (typeof rawQuestion !== "string") {
    throw new ValidationError("Question must be a text string.");
  }

  const trimmedQuestion = rawQuestion.trim();
  if (trimmedQuestion.length === 0) {
    throw new ValidationError("Please provide a financial question to explain.");
  }

  if (trimmedQuestion.length > 1000) {
    throw new ValidationError("Question is too long. Please keep under 1000 characters.");
  }

  // Parse and normalize language ('English' | 'Hindi' | 'en' | 'hi')
  let language: "English" | "Hindi" = "English";
  const rawLang = String(body.language || "").trim().toLowerCase();
  if (rawLang === "hindi" || rawLang === "hi") {
    language = "Hindi";
  }

  return {
    question: trimmedQuestion,
    language,
  };
}
