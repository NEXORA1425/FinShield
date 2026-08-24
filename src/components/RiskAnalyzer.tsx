import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  HelpCircle,
  Lock,
  ArrowRight,
  Info,
  Layers,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { RiskAnalysisResult, RiskLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';

interface RiskAnalyzerProps {
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const RiskAnalyzer: React.FC<RiskAnalyzerProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskAnalysisResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedToCloud, setSavedToCloud] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Preset demo scenarios for quick testing during hackathon pitch
  const exampleMessages = [
    {
      title: 'Lottery / Prize Reward',
      badge: 'Demo Scenario',
      text: 'Congratulations! You won ₹50,000 in our lucky draw. Click this link immediately to claim your reward before it expires.',
    },
    {
      title: 'Urgent Account Threat',
      badge: 'Demo Scenario',
      text: 'Bank Notice: Your account will be temporarily suspended today due to pending KYC. Verify immediately using the attached link.',
    },
    {
      title: 'Standard Bank Transaction',
      badge: 'Demo Scenario',
      text: 'Bank Alert: ₹2,450.00 was spent on your debit card ending in 4092 at Metro Mart. If not you, contact official customer care.',
    },
  ];

  const handleSelectExample = (text: string) => {
    setMessage(text);
    const inputEl = document.getElementById('risk-message-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  const runAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setError('Please enter or paste a message to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedToCloud(false);

    try {
      const response = await fetch('/api/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToAnalyze.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Something went wrong while analyzing this message.');
      }

      const data: RiskAnalysisResult = await response.json();
      setResult(data);

      // Auto-save to Firestore if user is authenticated
      if (user) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'scans'), {
            userId: user.uid,
            snippet: textToAnalyze.slice(0, 150),
            riskLevel: data.riskLevel,
            explanation: data.explanation,
            createdAt: serverTimestamp(),
          });
          setSavedToCloud(true);
        } catch (saveErr) {
          console.warn('Could not auto-save scan to Firestore:', saveErr);
        }
      }
    } catch (err: any) {
      console.error('Error analyzing risk:', err);
      setError(err?.message || 'Something went wrong while analyzing this message.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('signin');
      return;
    }
    if (!result || !message) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'scans'), {
        userId: user.uid,
        snippet: message.slice(0, 150),
        riskLevel: result.riskLevel,
        explanation: result.explanation,
        createdAt: serverTimestamp(),
      });
      setSavedToCloud(true);
    } catch (err) {
      console.error('Error saving scan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await runAnalysis(message);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `FinShield AI Risk Assessment
Risk Level: ${result.riskLevel.toUpperCase()}

Risk Indicators Detected:
${result.riskIndicators.map((item) => `- ${item}`).join('\n')}

Analysis & Context:
${result.explanation}

Recommended Safe Next Steps:
${result.safetyRecommendations.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

Evaluated by FinShield (MelbourneHack 2026)`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setMessage('');
    setResult(null);
    setError(null);
    setSavedToCloud(false);
  };

  const getRiskConfig = (level: RiskLevel | string) => {
    const normalized = (level || '').toUpperCase();
    switch (normalized) {
      case 'HIGH':
        return {
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          containerBorder: 'border-rose-300',
          icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
          title: 'High Risk / Severe Warning Signs Detected',
          subtext: 'This message exhibits known patterns typical of phishing, scam solicitations, or financial coercion.',
          accentColor: 'text-rose-700',
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          containerBorder: 'border-amber-300',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          title: 'Moderate Risk / Caution Advised',
          subtext: 'Contains unverified claims, unusual urgency, or requests that require careful verification before taking any action.',
          accentColor: 'text-amber-700',
        };
      case 'LOW':
      default:
        return {
          badgeBg: 'bg-emerald-50 text-[#10B981] border-emerald-200',
          containerBorder: 'border-emerald-300',
          icon: <ShieldCheck className="w-6 h-6 text-[#10B981]" />,
          title: 'Low Risk Profile',
          subtext: 'The notification appears typical of routine official advisories. Still avoid sharing credentials or OTPs.',
          accentColor: 'text-emerald-700',
        };
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Is this financial message safe?
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Paste a message and let FinShield identify potential warning signs before you act.
        </p>
      </div>

      {/* Main Analyzer Input Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Sample Messages */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sample Messages
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {exampleMessages.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectExample(item.text)}
                className="p-3.5 text-left rounded-xl border border-slate-200/80 hover:border-[#10B981] hover:bg-slate-50 transition text-xs space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 group-hover:text-[#10B981]">{item.title}</span>
                </div>
                <p className="text-slate-500 line-clamp-2 text-xs leading-relaxed">
                  "{item.text}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <textarea
                id="risk-message-input"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste a suspicious SMS, email, payment message, or financial notification here..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm placeholder:text-slate-400 transition-all font-sans leading-relaxed resize-y min-h-[130px]"
                maxLength={4000}
              />
              <div className="absolute right-3 bottom-3 text-xs text-slate-400">
                {message.length} / 4000
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <p>
              FinShield evaluates language and risk patterns. Never paste real account passwords, PINs, or card CVVs.
            </p>
          </div>

          {/* Actions & Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              {message && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              id="analyze-risk-submit-btn"
              type="submit"
              disabled={loading || !message.trim()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span>Analyzing message...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <span>Analyze Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error State with Retry */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <ShieldX className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Something went wrong while analyzing this message.</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => runAnalysis(message)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition self-start sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Structured Result UI */}
      {result && !loading && (
        <div className={`bg-white rounded-2xl p-6 sm:p-8 border shadow-sm space-y-6 ${getRiskConfig(result.riskLevel).containerBorder}`}>
          {/* Header Status & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                {getRiskConfig(result.riskLevel).icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500">Risk Assessment</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${getRiskConfig(result.riskLevel).badgeBg}`}>
                    {result.riskLevel} Risk
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {getRiskConfig(result.riskLevel).title}
                </h3>
              </div>
            </div>

            {/* Quick Share / Save Action */}
            <div className="flex items-center space-x-2">
              {user ? (
                <button
                  onClick={handleManualSave}
                  disabled={saving || savedToCloud}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  {savedToCloud ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Scan'}</span>
                    </>
                  )}
                </button>
              ) : (
                onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>Login to Save</span>
                  </button>
                )
              )}

              <button
                onClick={handleCopyReport}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-slate-800 text-white transition"
              >
                New Scan
              </button>
            </div>
          </div>

          {/* Section 1: Observable Warning Signs & Risk Indicators */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Risk Indicators</span>
            </h4>
            {result.riskIndicators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.riskIndicators.map((indicator, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start space-x-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed font-medium">{indicator}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No overt manipulation flags detected in message text.</p>
            )}
          </div>

          {/* Section 2: Why It May Be Risky */}
          <div className="space-y-2 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Why It May Be Risky</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {result.explanation}
            </p>
          </div>

          {/* Section 3: Safety Recommendations */}
          <div className="space-y-3 bg-emerald-50/50 p-5 rounded-xl border border-emerald-200/80">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <h4 className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Safety Recommendations
              </h4>
            </div>
            <ul className="space-y-2">
              {result.safetyRecommendations.map((step, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start space-x-2.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Educational Disclaimer Footer */}
          <div className="pt-1 text-center text-xs text-slate-400">
            <p>
              * FinShield evaluations are indicative. Always verify banking notices through official phone numbers or apps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
