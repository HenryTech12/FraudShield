import React from 'react';

export const FooterDisclaimer: React.FC = () => {
  return (
    <footer className="w-full max-w-2xl mx-auto px-4 pt-4 pb-12 text-center">
      <div className="border-t border-slate-200/80 pt-6">
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          This is a working demo using made-up data to show how the idea would work — it’s not connected to a real bank.
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          FraudShield Voice • Hackathon Prototype
        </p>
      </div>
    </footer>
  );
};
