import React from 'react';
import { HeaderExplainer } from './components/HeaderExplainer';
import { PhoneCallDemo } from './components/PhoneCallDemo';
import { SafetySection } from './components/SafetySection';
import { FooterDisclaimer } from './components/FooterDisclaimer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-sky-600 selection:text-white antialiased">
      {/* Top subtle brand bar */}
      <nav className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xs sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-700 flex items-center justify-center text-white font-bold text-xs">
              FS
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              FraudShield Voice
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Interactive Concept
          </span>
        </div>
      </nav>

      {/* Main Single-Page Content Stack */}
      <main className="flex-1 flex flex-col justify-center">
        {/* Part 1: Short plain-language explanation */}
        <HeaderExplainer />

        {/* Part 2: One big obvious button to try it & active call simulator */}
        <PhoneCallDemo />

        {/* Part 3: Simple 'why this is safe' section */}
        <SafetySection />
      </main>

      {/* Honest disclaimer footer */}
      <FooterDisclaimer />
    </div>
  );
}
