import React from 'react';
import {
  ShieldCheck,
  Bot,
  Lock,
  FileCheck2,
  Users2,
  CheckCircle2
} from 'lucide-react';
import { safetyPillars } from '../data/mockData';

export const SafetySection: React.FC = () => {
  const iconMap = {
    ShieldAlert: ShieldCheck,
    Bot: Bot,
    Lock: Lock,
    FileAudio: FileCheck2,
    UserCheck: Users2,
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pt-10 pb-6" id="safety-section">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Why this is safe for banks and customers
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
          Built with strict human-in-the-loop safeguards from the ground up.
        </p>
      </div>

      {/* Five clean, reassuring bullet lines — no dense tables or jargon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-4">
        {safetyPillars.map((pillar) => {
          const IconComponent = iconMap[pillar.iconName];
          return (
            <div
              key={pillar.id}
              className="flex items-start gap-3.5 py-1.5 border-b border-slate-100 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                    {pillar.title}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
