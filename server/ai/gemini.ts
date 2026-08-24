import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Robust JSON extraction helper handling pure JSON, Markdown code fences, and substring bounds
 */
export function extractJson<T = any>(text: string | undefined): T | null {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(trimmed) as T;
  } catch (_) {
    // 2. Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim()) as T;
      } catch (_) {
        // Continue to outer brace extraction
      }
    }

    // 3. Search for outermost curly braces
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1)) as T;
      } catch (_) {
        // Ignore and return null
      }
    }
  }
  return null;
}

/**
 * Timeout wrapper for AI asynchronous operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 40000,
  timeoutMessage: string = "The AI service request timed out. Please try again."
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}
