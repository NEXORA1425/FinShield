import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  validateRiskRequest,
  validateAndCalculateBudget,
  validateExplainerRequest,
  ValidationError,
} from "./server/validation/validators";
import { analyzeRiskWithGemini } from "./server/ai/riskAnalyzer";
import { analyzeBudgetWithGemini } from "./server/ai/budgetAnalyzer";
import { explainFinanceWithGemini } from "./server/ai/financialExplainer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Lightweight JSON body parser with bounded payload size
  app.use(express.json({ limit: "500kb" }));

  // Basic in-memory rate limiting / throttling for hackathon MVP protection
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    // Skip health check from rate limiting
    if (req.path === "/health") {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "anonymous";
    const now = Date.now();
    const clientState = requestCounts.get(ip);

    if (!clientState || now > clientState.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    if (clientState.count >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: "Too many requests. Please wait a moment before trying again.",
      });
    }

    clientState.count += 1;
    next();
  });

  // =========================================================================
  // API ROUTE 0: Health Check
  // =========================================================================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "FinShield API",
      timestamp: new Date().toISOString(),
    });
  });

  // =========================================================================
  // API ROUTE 1: Financial Risk Analyzer (HERO FEATURE)
  // =========================================================================
  app.post("/api/analyze-risk", async (req: Request, res: Response) => {
    try {
      // 1. Server-side validation & prompt injection defense preparation
      const { message } = validateRiskRequest(req.body);

      // 2. Execute AI analysis with trusted system boundary
      const result = await analyzeRiskWithGemini(message);

      // 3. Return strictly formatted response
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      console.error("Internal error in /api/analyze-risk:", error?.message || error);
      return res.status(500).json({
        error: "The AI service is temporarily unavailable. Please try again.",
      });
    }
  });

  // =========================================================================
  // API ROUTE 2: Smart Budget Analyzer
  // =========================================================================
  app.post("/api/analyze-budget", async (req: Request, res: Response) => {
    try {
      // 1. Server-side validation & deterministic arithmetic calculation
      const calculatedSummary = validateAndCalculateBudget(req.body);

      // 2. Pass pre-computed metrics to Gemini budget coach
      const result = await analyzeBudgetWithGemini(calculatedSummary);

      // 3. Return structured recommendations
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      console.error("Internal error in /api/analyze-budget:", error?.message || error);
      return res.status(500).json({
        error: "The AI budget coaching service is temporarily unavailable. Please try again.",
      });
    }
  });

  // =========================================================================
  // API ROUTE 3: Financial Explainer (English & Hindi)
  // =========================================================================
  app.post("/api/explain-finance", async (req: Request, res: Response) => {
    try {
      // 1. Server-side validation & language normalization
      const { question, language } = validateExplainerRequest(req.body);

      // 2. Execute contextual explanation generation
      const result = await explainFinanceWithGemini(question, language);

      // 3. Return clean explanation schema
      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      console.error("Internal error in /api/explain-finance:", error?.message || error);
      return res.status(500).json({
        error: "The financial explanation service is temporarily unavailable. Please try again.",
      });
    }
  });

  // =========================================================================
  // Catch-all 404 handler for unknown /api/* routes
  // =========================================================================
  app.all("/api/*", (_req: Request, res: Response) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  // =========================================================================
  // Vite Middleware (Dev) or Static Assets (Prod)
  // =========================================================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinShield Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting FinShield server:", err);
});
