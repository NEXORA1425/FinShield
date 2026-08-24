import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  RefreshCw,
  BookOpen,
  Send,
  Languages,
  CheckCircle,
  Lightbulb,
  Compass,
  ArrowRight,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { ExplainerLanguage, ExplainerResult } from '../types';

export const FinancialExplainer: React.FC = () => {
  const [query, setQuery] = useState<string>('What is compound interest?');
  const [language, setLanguage] = useState<ExplainerLanguage>('en');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainerResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const exampleQuestions = [
    { en: 'What is compound interest?', hi: 'कंपाउंड इंटरेस्ट (चक्रवृद्धि ब्याज) क्या है?' },
    { en: 'What is EMI?', hi: 'ईएमआई (EMI) क्या होती है?' },
    { en: 'What is inflation?', hi: 'महंगाई (Inflation) का क्या मतलब है?' },
    { en: 'What is a credit score?', hi: 'क्रेडिट स्कोर (Credit Score) क्या है?' },
    { en: 'How does budgeting work?', hi: 'बजट कैसे काम करता है?' },
  ];

  const handleAsk = async (questionText?: string, targetLang?: ExplainerLanguage) => {
    const textToAsk = questionText !== undefined ? questionText : query;
    const langToUse = targetLang !== undefined ? targetLang : language;

    if (!textToAsk.trim()) {
      setError('Please type or select a financial question to explain.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/explain-finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToAsk.trim(),
          language: langToUse === 'hi' ? 'Hindi' : 'English',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: ExplainerResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error explaining finance:', err);
      setError(err?.message || 'Unable to fetch financial explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExample = (item: { en: string; hi: string }) => {
    const text = language === 'hi' ? item.hi : item.en;
    setQuery(text);
  };

  const handleLanguageToggle = (newLang: ExplainerLanguage) => {
    setLanguage(newLang);
    // Find matching example if query was one of the standard examples
    const match = exampleQuestions.find((q) => q.en === query || q.hi === query);
    const newQuery = match ? (newLang === 'hi' ? match.hi : match.en) : query;
    setQuery(newQuery);

    if (result) {
      handleAsk(newQuery, newLang);
    }
  };

  const handleCopyExplanation = () => {
    if (!result) return;
    const text = `FinShield Financial Concept Explainer\nTopic: ${query}\n\n1. Simple Explanation:\n${result.simpleExplanation}\n\n2. Everyday Example:\n${result.example}\n\n3. Key Takeaway:\n${result.keyTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Finance explained in plain words.
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Ask any financial question and get an easy explanation.
        </p>
      </div>

      {/* Language Switcher & Interactive Question Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Language Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <Languages className="w-4 h-4 text-[#10B981]" />
            <span>Language:</span>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => handleLanguageToggle('en')}
              className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hi"
              type="button"
              onClick={() => handleLanguageToggle('hi')}
              className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'hi'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Example Quick-Pick Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500">
            Suggested Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((item, idx) => {
              const label = language === 'hi' ? item.hi : item.en;
              const isActive = query === label;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <div className="relative">
              <input
                id="explainer-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'जैसे: कंपाउंड इंटरेस्ट क्या है? या ईएमआई कैसे काम करती है?'
                    : 'Ask something like: What is compound interest?'
                }
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm font-medium"
              />
              <button
                id="explainer-submit-btn"
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#10B981] hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-lg transition disabled:opacity-40"
                aria-label="Explain Concept"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'सामान्य वित्तीय साक्षरता के लिए मार्गदर्शन।'
                : 'Educational guidance only. General financial literacy information.'}
            </p>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                  <span>{language === 'hi' ? 'समझाया जा रहा है...' : 'Explaining...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{language === 'hi' ? 'समझाएं' : 'Explain'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
          <p className="text-xs font-semibold">{error}</p>
          <button
            onClick={() => handleAsk()}
            className="text-xs font-semibold underline hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Structured Result Display */}
      {result && !loading && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-600">
                  {language === 'hi' ? 'वित्तीय व्याख्या' : 'Explanation'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">"{query}"</h3>
              </div>
            </div>

            <button
              onClick={handleCopyExplanation}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition self-start sm:self-center"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{language === 'hi' ? 'कॉपी हो गया' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'hi' ? 'कॉपी करें' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Simple Explanation */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{language === 'hi' ? 'सरल व्याख्या' : 'Simple Explanation'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {result.simpleExplanation}
            </p>
          </div>

          {/* Section 2: Real-World Example */}
          <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-200/70 space-y-1.5">
            <h4 className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'hi' ? 'दैनिक जीवन का उदाहरण' : 'Real-World Example'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {result.example}
            </p>
          </div>

          {/* Section 3: Key Takeaway */}
          <div className="bg-[#0F172A] text-white p-5 rounded-xl border border-slate-800 space-y-1">
            <h4 className="text-xs font-semibold text-[#10B981] uppercase tracking-wider flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मुख्य सीख' : 'Key Takeaway'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {result.keyTakeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
