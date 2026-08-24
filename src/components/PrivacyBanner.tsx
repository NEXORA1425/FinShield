import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-[11px] sm:text-xs">
            <strong className="font-semibold text-amber-900">Privacy Notice:</strong> FinShield is an educational prototype. Do not enter passwords, OTPs, PINs, card numbers, banking credentials, or other highly sensitive information.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-500/20 transition"
          aria-label="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
