import { Type } from "@google/genai";
import { getGenAI, extractJson, withTimeout } from "./gemini";
import { CalculatedBudgetSummary } from "../validation/validators";

export interface BudgetAnalysisResponse {
  summary: string;
  highestSpendingCategory: string;
  observations: string[];
  suggestions: string[];
  remainingMoneyAdvice: string;
}

export function getFallbackBudgetAnalysis(budgetData: CalculatedBudgetSummary): BudgetAnalysisResponse {
  const surplusPct = budgetData.income > 0 ? (budgetData.remainingBalance / budgetData.income) * 100 : 0;
  const isSurplus = budgetData.remainingBalance >= 0;

  return {
    summary: isSurplus
      ? `Your monthly income of ₹${budgetData.income.toLocaleString()} covers your ₹${budgetData.totalExpenses.toLocaleString()} expenses, creating a monthly surplus of ₹${budgetData.remainingBalance.toLocaleString()} (${surplusPct.toFixed(1)}% savings rate).`
      : `Your expenses (₹${budgetData.totalExpenses.toLocaleString()}) currently exceed monthly income (₹${budgetData.income.toLocaleString()}) by ₹${Math.abs(budgetData.remainingBalance).toLocaleString()}. Trimming flexible spending will restore balance.`,
    highestSpendingCategory: `${budgetData.highestCategory.name} (₹${budgetData.highestCategory.amount.toLocaleString()} - ${budgetData.highestCategory.percentage}% of overall expenses)`,
    observations: [
      `Your largest spending driver is ${budgetData.highestCategory.name}, taking up ${budgetData.highestCategory.percentage}% of total outflow.`,
      `You are currently allocating ${surplusPct > 0 ? surplusPct.toFixed(1) : 0}% of net earnings toward savings and reserve funds.`,
      budgetData.expenses.food > 0 ? `Food & dining represents ₹${budgetData.expenses.food.toLocaleString()} (${budgetData.percentages.food || 0}% of expenses).` : "Discretionary expenses are relatively controlled.",
    ],
    suggestions: [
      isSurplus
        ? "Aim to route a steady portion of your surplus into an emergency liquidity reserve covering 3 months of basic living costs."
        : "Review discretionary subscriptions and non-essential shopping to close the immediate deficit gap.",
      "Track variable day-to-day transactions with weekly checkpoints to stay within your targets.",
      "Explore the 50/30/20 guideline (50% Needs, 30% Wants, 20% Savings) to systematically balance monthly priorities.",
    ],
    remainingMoneyAdvice: isSurplus
      ? `With ₹${budgetData.remainingBalance.toLocaleString()} left each month, consider keeping ₹${Math.round(budgetData.remainingBalance * 0.5).toLocaleString()} in a liquid emergency account and investing the rest in low-cost index funds or fixed deposits.`
      : `Focus on stabilizing your monthly cash flow before taking on discretionary debt or non-essential commitments.`,
  };
}

export async function analyzeBudgetWithGemini(
  budgetData: CalculatedBudgetSummary
): Promise<BudgetAnalysisResponse> {
  const ai = getGenAI();

  const systemInstruction = `You are FinShield's Smart Budget Coach, designed to provide encouraging, practical, and clear financial habit guidance for everyday users, students, and young adults.

CORE SAFETY & COMMUNICATION PRINCIPLES:
1. Provide educational spending observations and constructive, realistic suggestions.
2. DO NOT judge, scold, or use shaming language about the user's spending choices.
3. DO NOT offer guaranteed financial returns, stock picks, crypto trading advice, or personalized investment mandates.
4. Use positive, actionable phrasing like "Consider reviewing...", "One possible area to examine is...", "This may help build a stronger buffer...".
5. Accurately reflect the pre-calculated financial metrics provided in the prompt.`;

  const prompt = `Here is the user's monthly budget summary:
- Verified Monthly Income: ₹${budgetData.income.toLocaleString()}
- Calculated Total Expenses: ₹${budgetData.totalExpenses.toLocaleString()}
- Net Remaining Balance: ₹${budgetData.remainingBalance.toLocaleString()} (${budgetData.income > 0 ? ((budgetData.remainingBalance / budgetData.income) * 100).toFixed(1) : "0"}% surplus rate)
- Highest Category: ${budgetData.highestCategory.name} (₹${budgetData.highestCategory.amount.toLocaleString()} - ${budgetData.highestCategory.percentage}% of total expenses)

Category Expense Breakdown:
- Food: ₹${budgetData.expenses.food} (${budgetData.percentages.food || 0}%)
- Transport: ₹${budgetData.expenses.transport} (${budgetData.percentages.transport || 0}%)
- Bills & Utilities: ₹${budgetData.expenses.bills} (${budgetData.percentages.bills || 0}%)
- Shopping: ₹${budgetData.expenses.shopping} (${budgetData.percentages.shopping || 0}%)
- Education: ₹${budgetData.expenses.education} (${budgetData.percentages.education || 0}%)
- Other: ₹${budgetData.expenses.other} (${budgetData.percentages.other || 0}%)

Please evaluate this budget and provide structured, encouraging feedback.`;

  try {
    const aiCall = ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A constructive, friendly 2-3 sentence overview of their overall cash flow and financial health",
            },
            highestSpendingCategory: {
              type: Type.STRING,
              description: "Name of the highest spending category with a concise educational insight",
            },
            observations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 3 objective observations regarding spending distribution and benchmark comparisons",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 3 practical, non-judgmental optimization steps (e.g., starter emergency fund, 50/30/20 balance)",
            },
            remainingMoneyAdvice: {
              type: Type.STRING,
              description: "Encouraging guidance on how to allocate the remaining balance or stabilize a deficit",
            },
          },
          required: ["summary", "highestSpendingCategory", "observations", "suggestions", "remainingMoneyAdvice"],
        },
      },
    });

    const response = await withTimeout(
      aiCall,
      35000,
      "The AI budget coach is taking longer than expected. Please try again."
    );

    const responseText = response.text?.trim() || "";
    const parsedData = extractJson<Partial<BudgetAnalysisResponse>>(responseText);

    if (!parsedData) {
      return getFallbackBudgetAnalysis(budgetData);
    }

    return {
      summary: parsedData.summary && typeof parsedData.summary === "string"
        ? parsedData.summary.trim()
        : `Your monthly budget allocates ₹${budgetData.totalExpenses.toLocaleString()} across your active commitments, leaving a net balance of ₹${budgetData.remainingBalance.toLocaleString()}.`,
      highestSpendingCategory: parsedData.highestSpendingCategory && typeof parsedData.highestSpendingCategory === "string"
        ? parsedData.highestSpendingCategory.trim()
        : `${budgetData.highestCategory.name} is your largest expense at ${budgetData.highestCategory.percentage}% of overall spending.`,
      observations: Array.isArray(parsedData.observations) && parsedData.observations.length > 0
        ? parsedData.observations.map(String)
        : [
            `Fixed commitments account for the majority of outflow.`,
            `Your current savings buffer stands at ${budgetData.income > 0 ? ((budgetData.remainingBalance / budgetData.income) * 100).toFixed(1) : 0}% of net income.`,
          ],
      suggestions: Array.isArray(parsedData.suggestions) && parsedData.suggestions.length > 0
        ? parsedData.suggestions.map(String)
        : [
            "Consider building an emergency buffer covering 1-3 months of essential expenses.",
            "Track recurring discretionary spending to identify small potential weekly savings.",
          ],
      remainingMoneyAdvice: parsedData.remainingMoneyAdvice && typeof parsedData.remainingMoneyAdvice === "string"
        ? parsedData.remainingMoneyAdvice.trim()
        : "Consider placing surplus funds into a dedicated high-yield savings account or emergency reserve.",
    };
  } catch (err: any) {
    console.warn("Gemini budget analysis fell back to local calculations:", err?.message || err);
    return getFallbackBudgetAnalysis(budgetData);
  }
}
