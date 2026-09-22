import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, UserPlus, Store, History, Terminal, Home, Globe } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGES } from '../lib/phrases';

interface QuickNavDockProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const QuickNavDock: React.FC<QuickNavDockProps> = ({
  currentRoute,
  onNavigate,
  selectedLanguage,
  onSelectLanguage
}) => {
  const dockItems = [
    {
      id: '/app',
      label: 'Voice POS',
      shortLabel: 'POS',
      icon: Sparkles,
      desc: 'Virtual Voice Terminal',
      badge: 'Primary'
    },
    {
      id: '/onboarding',
      label: 'Voice Onboard',
      shortLabel: 'Onboard',
      icon: UserPlus,
      desc: 'Spoken Field Enrollment',
      badge: 'Voice Form'
    },
    {
      id: '/pos',
      label: 'Agent Stall',
      shortLabel: 'Agent',
      icon: Store,
      desc: 'Merchant Cash Float'
    },
    {
      id: '/history',
      label: 'Ledger',
      shortLabel: 'Ledger',
      icon: History,
      desc: 'NUBAN Audit Trail'
    },
    {
      id: '/terminal',
      label: 'Hardware POS',
      shortLabel: 'Hardware',
      icon: Terminal,
      desc: 'Offline POS Hardware'
    },
    {
      id: '/',
      label: 'Overview',
      shortLabel: 'Home',
      icon: Home,
      desc: 'System Architecture'
    }
  ];

  return (
    <aside aria-label="Quick Navigation Dock" className="fixed bottom-3 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none flex flex-col items-center gap-2">
      {/* Sleek Floating Dock */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto bg-[#0B131B]/95 text-white backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex items-center gap-1 sm:gap-1.5 max-w-2xl w-full justify-between sm:justify-center overflow-x-auto no-scrollbar"
      >
        {dockItems.map((item) => {
          const isActive = currentRoute === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl transition-all cursor-pointer select-none shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF4646] to-[#E03A3A] text-white font-bold shadow-[0_2px_10px_rgba(255,70,70,0.4)]'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title={`${item.label} — ${item.desc}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF4646]'}`} />
              <span className="text-xs font-bold tracking-tight hidden md:inline">
                {item.label}
              </span>
              <span className="text-xs font-bold tracking-tight md:hidden">
                {item.shortLabel}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeDockDot"
                  className="w-1.5 h-1.5 rounded-full bg-white absolute -top-1 left-1/2 -translate-x-1/2"
                />
              )}
            </button>
          );
        })}

        <div className="h-5 w-[1px] bg-white/15 mx-0.5 hidden sm:block shrink-0" />

        {/* Quick Language Chip in Dock */}
        <div className="relative shrink-0">
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value as Language)}
            className="bg-white/10 text-white text-xs font-bold px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/20 hover:bg-white/15 focus:outline-none cursor-pointer tracking-tight"
            title="Switch Dialect"
          >
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <option key={key} value={key} className="bg-[#0B131B] text-white">
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    </aside>
  );
};
