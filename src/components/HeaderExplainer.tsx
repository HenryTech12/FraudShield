import React from 'react';
import { PhoneCall, ShieldCheck } from 'lucide-react';

export const HeaderExplainer: React.FC = () => {
  return (
    <header className="w-full max-w-2xl mx-auto pt-8 sm:pt-14 pb-6 px-4 text-center">
      {/* Friendly context pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-800 text-xs sm:text-sm font-medium mb-5">
        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        <span>UAE Retail Banking Concept Demo</span>
      </div>

      {/* Primary title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
        FraudShield Voice
      </h1>

      {/* Plain-language explanation (no jargon, clear and honest) */}
      <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto font-normal">
        When a bank spots a suspicious transaction, every minute matters.
        <span className="text-slate-900 font-medium"> FraudShield Voice</span> is an AI phone agent that calls the customer immediately, confirms it’s really them, and freezes the card if needed — all while a real human fraud specialist stays in charge of anything that can’t be undone.
      </p>

      {/* Quick 10-second reassurance bar */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs sm:text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
          Calls in &lt; 15 seconds
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>Safe & reversible</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>Never asks for PIN</span>
      </div>
    </header>
  );
};
