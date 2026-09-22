import { SuspiciousTransaction, SafetyPillar } from '../types';

export const sampleTransaction: SuspiciousTransaction = {
  amount: 'AED 3,420.00',
  merchant: 'Dubai Luxury Boutique',
  location: 'City Centre Deira, Dubai',
  timeAgo: '3 minutes ago',
  cardLast4: '4892',
  cardType: 'Visa Signature',
};

export const safetyPillars: SafetyPillar[] = [
  {
    id: 'no-pin',
    title: 'Never asks for your PIN or password',
    detail: 'No passwords, security codes, or banking login details are ever requested by the agent.',
    iconName: 'ShieldAlert',
  },
  {
    id: 'ai-disclosure',
    title: 'Always tells you it’s an AI, right away',
    detail: 'Complete transparency from the very first greeting — never pretends to be a human caller.',
    iconName: 'Bot',
  },
  {
    id: 'safe-freeze',
    title: 'Can only freeze a card temporarily',
    detail: 'A safe, fully reversible action that stops theft immediately. Permanent actions require a person.',
    iconName: 'Lock',
  },
  {
    id: 'call-records',
    title: 'Every call is recorded and logged',
    detail: 'Full audit record with exact timestamps, ensuring absolute clarity with zero confusion.',
    iconName: 'FileAudio',
  },
  {
    id: 'human-handover',
    title: 'Hands you straight to a real person',
    detail: 'If you are unsure, stressed, or disputing a charge, a human fraud specialist takes over directly.',
    iconName: 'UserCheck',
  },
];
