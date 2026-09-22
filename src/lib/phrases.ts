import { Language, LanguageInfo } from '../types';
import { API_BASE, synthesizeSpeech } from './api';

export const LANGUAGES: Record<Language, LanguageInfo> = {
  yo: {
    code: 'yo',
    name: 'Yorùbá',
    nativeName: 'Èdè Yorùbá',
    region: 'Southwest Nigeria',
    greeting: 'Ẹ káàbọ̀ sí ElderPay',
    samplePhrase: 'Mo fẹ́ fi ẹgbàárùn-ún náírà ránṣẹ́ sí Adéwálé',
    sampleTranslation: 'I want to send 10,000 Naira to Adewale',
    understoodText: 'A ti gbọ́: Ìfipamọ́ ranṣẹ́ sí Adéwálé, ₦10,000',
    confirmationText: 'Ṣe o fẹ́ fi ẹgbàárùn-ún náírà (₦10,000) ránṣẹ́ sí Adéwálé? Jọ̀wọ́ jẹ́rìí sí i.',
    successText: 'Owó ẹgbàárùn-ún náírà ti lọ sí ọ̀dọ̀ Adéwálé pẹ̀lú àlàáfíà!'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English (Nigerian Accent)',
    region: 'Nationwide',
    greeting: 'Welcome to ElderPay',
    samplePhrase: 'Send ten thousand naira to Adewale',
    sampleTranslation: 'Send 10,000 Naira to Adewale',
    understoodText: 'Understood: Transfer ₦10,000 to Adewale',
    confirmationText: 'You are sending ten thousand naira to Adewale. Is that correct?',
    successText: 'Your transfer of ₦10,000 to Adewale was successful.'
  },
  pcm: {
    code: 'pcm',
    name: 'Nigerian Pidgin',
    nativeName: 'Naija Pidgin',
    region: 'South-South / Nationwide',
    greeting: 'How far! Welcome to ElderPay',
    samplePhrase: 'I wan send ten thousand naira give Adewale',
    sampleTranslation: 'I want to send 10,000 Naira to Adewale',
    understoodText: 'We don hear you: Transfer ₦10,000 give Adewale',
    confirmationText: 'You wan send ten thousand naira give Adewale. Make we proceed?',
    successText: 'The ten thousand naira don land for Adewale account sharp-sharp!'
  },
  ha: {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Harshen Hausa',
    region: 'Northern Nigeria',
    greeting: 'Barka da zuwa ElderPay',
    samplePhrase: 'Ina son tura naira dubu goma zuwa ga Adewale',
    sampleTranslation: 'I want to send 10,000 Naira to Adewale',
    understoodText: 'An fahimta: Canja wurin ₦10,000 zuwa Adewale',
    confirmationText: 'Kuna son tura naira dubu goma (₦10,000) zuwa ga Adewale. Haka ne?',
    successText: 'An yi nasarar tura kudi naira dubu goma zuwa ga Adewale.'
  },
  ig: {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Asụsụ Igbo',
    region: 'Southeast Nigeria',
    greeting: 'Nnọọ na ElderPay',
    samplePhrase: 'Achọrọ m iziga puku naira iri nye Adewale',
    sampleTranslation: 'I want to send 10,000 Naira to Adewale',
    understoodText: 'A ghọtara ya: Ziga ₦10,000 nye Adewale',
    confirmationText: 'Ị na-eziga puku naira iri (₦10,000) nye Adewale. Ọ bụ eziokwu?',
    successText: 'E zigara puku naira iri ahụ nye Adewale nke ọma.'
  }
};

type OnboardingPhraseKey = 'voiceEntryPrompt' | 'phoneConfirmation' | 'voiceRetryPrompt';

const ONBOARDING_PHRASES: Record<Language, Record<OnboardingPhraseKey, string>> = {
  en: {
    voiceEntryPrompt: 'Tap the microphone next to each box to speak your answer, or type it in.',
    phoneConfirmation: "I heard {phone}. If that's wrong, please correct it or try again.",
    voiceRetryPrompt: "I couldn't hear that clearly. Please try again or type your answer."
  },
  yo: {
    voiceEntryPrompt: 'Tẹ aami gbohungbohun lẹ́gbẹ̀ẹ́ àpótí kọ̀ọ̀kan láti sọ ìdáhùn rẹ, tàbí tẹ̀ ẹ́ sínú rẹ̀.',
    phoneConfirmation: 'Mo gbọ́ {phone}. Tí kò bá tọ̀nà, jọ̀wọ́ ṣe àtúnṣe rẹ̀ tàbí tún gbìyànjú.',
    voiceRetryPrompt: 'Mi ò gbọ́ dáadáa. Jọ̀wọ́ tún gbìyànjú tàbí tẹ ìdáhùn rẹ sínú rẹ̀.'
  },
  pcm: {
    voiceEntryPrompt: 'Tap the microphone near each box to talk your answer, or type am inside.',
    phoneConfirmation: 'I hear {phone}. If e no correct, abeg correct am or try again.',
    voiceRetryPrompt: 'I no hear that well. Abeg try again or type your answer.'
  },
  ha: {
    voiceEntryPrompt: 'Ta makirufo kusa da kowane akwati don faɗin amsarka, ko ka rubuta ta.',
    phoneConfirmation: 'Na ji {phone}. Idan ba daidai ba ne, don Allah ka gyara shi ko ka sake gwadawa.',
    voiceRetryPrompt: 'Ban ji hakan da kyau ba. Don Allah ka sake gwadawa ko ka rubuta amsarka.'
  },
  ig: {
    voiceEntryPrompt: 'Pịa igwe okwu dị n’akụkụ igbe ọ bụla iji kwuo azịza gị, ma ọ bụ pịnye ya.',
    phoneConfirmation: 'Anụla m {phone}. Ọ bụrụ na ọ bụghị eziokwu, biko mezie ya ma ọ bụ nwaa ọzọ.',
    voiceRetryPrompt: 'Anụghị m nke ọma. Biko nwaa ọzọ ma ọ bụ pịnye azịza gị.'
  }
};

export type FieldKey = 
  | 'firstName' 
  | 'lastName' 
  | 'fullName' 
  | 'phone' 
  | 'address' 
  | 'amount' 
  | 'initialDeposit' 
  | 'recipient' 
  | 'accountNumber';

export interface FieldPromptInfo {
  question: string;
  nativeQuestion: string;
  translation: string;
}

export const FIELD_VOICE_PROMPTS: Record<Language, Record<FieldKey, FieldPromptInfo>> = {
  yo: {
    firstName: {
      question: 'Kí ni orúkọ àkọ́kọ́ rẹ?',
      nativeQuestion: 'Kí ni orúkọ àkọ́kọ́ rẹ?',
      translation: 'What is your first name?'
    },
    lastName: {
      question: 'Kí ni orúkọ ìdílé rẹ?',
      nativeQuestion: 'Kí ni orúkọ ìdílé rẹ?',
      translation: 'What is your last name or surname?'
    },
    fullName: {
      question: 'Kí ni orúkọ rẹ ní kíkún?',
      nativeQuestion: 'Kí ni orúkọ rẹ ní kíkún?',
      translation: 'What is your full name?'
    },
    phone: {
      question: 'Kí ni nọ́mbà tẹlifóònù rẹ?',
      nativeQuestion: 'Kí ni nọ́mbà tẹlifóònù rẹ?',
      translation: 'What is your phone number?'
    },
    address: {
      question: 'Ibo ni adirẹsi tàbí ìlú rẹ wà?',
      nativeQuestion: 'Ibo ni adirẹsi tàbí ìlú rẹ wà?',
      translation: 'What is your address or location?'
    },
    initialDeposit: {
      question: 'Èló ni owó àkọ́kọ́ tí o fẹ́ fi pamọ́ sí àkọ́ọ́ntì rẹ?',
      nativeQuestion: 'Èló ni owó àkọ́kọ́ tí o fẹ́ fi pamọ́?',
      translation: 'How much is your initial opening deposit in naira?'
    },
    amount: {
      question: 'Èló ni owó tí o fẹ́ fi ránṣẹ́?',
      nativeQuestion: 'Èló ni owó tí o fẹ́ fi ránṣẹ́?',
      translation: 'How much money do you want to transfer?'
    },
    recipient: {
      question: 'Ta ni o fẹ́ fi owó ránṣẹ́ sí? Kí ni orúkọ wọn?',
      nativeQuestion: 'Ta ni o fẹ́ fi owó ránṣẹ́ sí?',
      translation: 'Who do you want to send money to?'
    },
    accountNumber: {
      question: 'Jọ̀wọ́ sọ nọ́mbà àkọ́ọ́ntì mẹ́wàá náà.',
      nativeQuestion: 'Jọ̀wọ́ sọ nọ́mbà àkọ́ọ́ntì mẹ́wàá náà.',
      translation: 'Please state the 10-digit NUBAN account number.'
    }
  },
  ha: {
    firstName: {
      question: 'Menene sunanka na farko?',
      nativeQuestion: 'Menene sunanka na farko?',
      translation: 'What is your first name?'
    },
    lastName: {
      question: 'Menene sunan mahaifinka ko sunan zuriya?',
      nativeQuestion: 'Menene sunan mahaifinka?',
      translation: 'What is your last name or surname?'
    },
    fullName: {
      question: 'Menene cikakken sunanka?',
      nativeQuestion: 'Menene cikakken sunanka?',
      translation: 'What is your full name?'
    },
    phone: {
      question: 'Menene lambar wayarka?',
      nativeQuestion: 'Menene lambar wayarka?',
      translation: 'What is your phone number?'
    },
    address: {
      question: 'Ina ne adireshinku ko garinku?',
      nativeQuestion: 'Ina ne adireshinku?',
      translation: 'What is your address or city?'
    },
    initialDeposit: {
      question: 'Kudi nawa kuke son sakawa a asusunku a matsayin ajiya na farko?',
      nativeQuestion: 'Kudi nawa kuke son sakawa a asusunku?',
      translation: 'How much is your initial deposit in naira?'
    },
    amount: {
      question: 'Kudi nawa kuke son turawa?',
      nativeQuestion: 'Kudi nawa kuke son turawa?',
      translation: 'How much money do you want to transfer?'
    },
    recipient: {
      question: 'Wa kuke son tura wa kudi? Menene sunansa?',
      nativeQuestion: 'Wa kuke son tura wa kudi?',
      translation: 'Who do you want to send money to?'
    },
    accountNumber: {
      question: 'Don Allah faɗi lambar asusun mai lamba goma.',
      nativeQuestion: 'Faɗi lambar asusun mai lamba goma.',
      translation: 'Please state the 10-digit account number.'
    }
  },
  ig: {
    firstName: {
      question: 'Kedu aha mbụ gị?',
      nativeQuestion: 'Kedu aha mbụ gị?',
      translation: 'What is your first name?'
    },
    lastName: {
      question: 'Kedu aha nna gị ma ọ bụ aha ezinụlọ gị?',
      nativeQuestion: 'Kedu aha nna gị?',
      translation: 'What is your last name or surname?'
    },
    fullName: {
      question: "Kedu aha gị n'uju?",
      nativeQuestion: "Kedu aha gị n'uju?",
      translation: 'What is your full name?'
    },
    phone: {
      question: 'Kedu nọmba ekwentị gị?',
      nativeQuestion: 'Kedu nọmba ekwentị gị?',
      translation: 'What is your phone number?'
    },
    address: {
      question: 'Ebee ka ebe obibi gị ma ọ bụ obodo gị dị?',
      nativeQuestion: 'Ebee ka ebe obibi gị dị?',
      translation: 'What is your address or location?'
    },
    initialDeposit: {
      question: 'Ego ole ka ị chọrọ itinye na mbụ na akaụntụ gị?',
      nativeQuestion: 'Ego ole ka ị chọrọ itinye na mbụ?',
      translation: 'How much is your initial deposit in naira?'
    },
    amount: {
      question: 'Ego ole ka ị chọrọ iziga?',
      nativeQuestion: 'Ego ole ka ị chọrọ iziga?',
      translation: 'How much money do you want to transfer?'
    },
    recipient: {
      question: 'Onye ka ị chọrọ iziga ego? Kedu aha ya?',
      nativeQuestion: 'Onye ka ị chọrọ iziga ego?',
      translation: 'Who do you want to send money to?'
    },
    accountNumber: {
      question: 'Biko kwuo nọmba akaụntụ nwere ọnụọgụgụ iri.',
      nativeQuestion: 'Biko kwuo nọmba akaụntụ nwere ọnụọgụgụ iri.',
      translation: 'Please state the 10-digit account number.'
    }
  },
  pcm: {
    firstName: {
      question: 'Wetin be your first name?',
      nativeQuestion: 'Wetin be your first name?',
      translation: 'What is your first name?'
    },
    lastName: {
      question: 'Wetin be your last name or surname?',
      nativeQuestion: 'Wetin be your surname?',
      translation: 'What is your last name or surname?'
    },
    fullName: {
      question: 'Wetin be your full name?',
      nativeQuestion: 'Wetin be your full name?',
      translation: 'What is your full name?'
    },
    phone: {
      question: 'Wetin be your phone number?',
      nativeQuestion: 'Wetin be your phone number?',
      translation: 'What is your phone number?'
    },
    address: {
      question: 'Which address or which area you dey stay?',
      nativeQuestion: 'Which area you dey stay?',
      translation: 'What is your residential or stall address?'
    },
    initialDeposit: {
      question: 'How much money you wan deposit to start with for naira?',
      nativeQuestion: 'How much money you wan put?',
      translation: 'How much is your initial deposit in naira?'
    },
    amount: {
      question: 'How much money you wan send?',
      nativeQuestion: 'How much money you wan send?',
      translation: 'How much money do you want to send?'
    },
    recipient: {
      question: 'Who you wan send money give? Wetin be the person name?',
      nativeQuestion: 'Who you wan send money give?',
      translation: 'Who do you want to send money to?'
    },
    accountNumber: {
      question: 'Abeg call the 10-digit account number.',
      nativeQuestion: 'Abeg call the 10-digit account number.',
      translation: 'Please state the 10-digit account number.'
    }
  },
  en: {
    firstName: {
      question: 'What is your first name?',
      nativeQuestion: 'What is your first name?',
      translation: 'What is your first name?'
    },
    lastName: {
      question: 'What is your last name or surname?',
      nativeQuestion: 'What is your last name or surname?',
      translation: 'What is your last name or surname?'
    },
    fullName: {
      question: 'What is your full name?',
      nativeQuestion: 'What is your full name?',
      translation: 'What is your full name?'
    },
    phone: {
      question: 'What is your phone number?',
      nativeQuestion: 'What is your phone number?',
      translation: 'What is your phone number?'
    },
    address: {
      question: 'What is your residential address or location?',
      nativeQuestion: 'What is your address?',
      translation: 'What is your residential address or location?'
    },
    initialDeposit: {
      question: 'How much is your initial opening deposit in naira?',
      nativeQuestion: 'How much is your initial deposit?',
      translation: 'How much is your initial opening deposit in naira?'
    },
    amount: {
      question: 'How much money do you want to transfer?',
      nativeQuestion: 'How much do you want to transfer?',
      translation: 'How much money do you want to transfer?'
    },
    recipient: {
      question: 'Who is the recipient? What is their name?',
      nativeQuestion: 'Who do you want to send money to?',
      translation: 'Who is the recipient? What is their name?'
    },
    accountNumber: {
      question: 'Please state the 10-digit NUBAN account number.',
      nativeQuestion: 'Please speak the 10-digit account number.',
      translation: 'Please state the 10-digit NUBAN account number.'
    }
  }
};

export const FIELD_CONFIRM_PHRASES: Record<Language, (val: string) => string> = {
  yo: (val) => `A ti gbà á: ${val}.`,
  ha: (val) => `An karɓa: ${val}.`,
  ig: (val) => `A nabatala: ${val}.`,
  pcm: (val) => `I don capture am: ${val}.`,
  en: (val) => `Understood: ${val}.`
};

export function getFieldPromptPhrase(field: FieldKey, language: Language): FieldPromptInfo {
  const langKey = language || 'en';
  return FIELD_VOICE_PROMPTS[langKey]?.[field] || FIELD_VOICE_PROMPTS.en[field];
}

export function extractCleanFieldValue(field: FieldKey, rawText: string, lang: Language): string {
  if (!rawText || !rawText.trim()) return '';
  let cleaned = rawText.trim();

  if (field === 'firstName' || field === 'lastName' || field === 'fullName' || field === 'recipient') {
    // Remove typical conversational introductions in English, Yoruba, Hausa, Igbo, Pidgin
    const prefixes = [
      /^(my name is|my names are|my name na|name is|i am|call me|it is|this is|my full name is)\s+/i,
      /^(orúkọ mi ni|oruko mi ni|orúkọ mi jẹ́|oruko mi je|orúkọ mi|oruko mi|oruko re ni)\s+/i,
      /^(sunana shine|sunana shi ne|sunana ne|sunana|suna na)\s+/i,
      /^(aha m bụ|aha m bu|aham bu|aha m)\s+/i,
      /^(na me be|my name na|na)\s+/i,
      /^(send to|transfer to|give to|ziga nye|tura wa|fi ránṣẹ́ sí)\s+/i
    ];
    for (const p of prefixes) {
      cleaned = cleaned.replace(p, '');
    }
    // Remove excessive punctuation
    cleaned = cleaned.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ').trim();
    // Capitalize words
    cleaned = cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    
    if (field === 'firstName') {
      const parts = cleaned.split(' ');
      return parts[0] || cleaned;
    }
    if (field === 'lastName') {
      const parts = cleaned.split(' ');
      return parts[parts.length - 1] || cleaned;
    }
    return cleaned;
  }

  if (field === 'phone' || field === 'accountNumber') {
    // Word to digit mapping
    const wordNums: Record<string, string> = {
      'zero': '0', 'o': '0', 'oh': '0',
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ọkan': '1', 'èjì': '2', 'ẹ́ta': '3', 'ẹ́rin': '4', 'àrún': '5',
      'daya': '1', 'biyu': '2', 'uku': '3', 'hudu': '4', 'biyar': '5',
      'otu': '1', 'abuo': '2', 'abụọ': '2', 'ato': '3', 'atọ': '3', 'ano': '4', 'anọ': '4', 'ise': '5', 'isé': '5'
    };
    let text = cleaned.toLowerCase();
    for (const [w, d] of Object.entries(wordNums)) {
      text = text.replace(new RegExp(`\\b${w}\\b`, 'g'), d);
    }
    const digitsOnly = text.replace(/\D/g, '');
    if (field === 'phone') {
      if (digitsOnly.length === 10 && (digitsOnly.startsWith('80') || digitsOnly.startsWith('70') || digitsOnly.startsWith('90') || digitsOnly.startsWith('81') || digitsOnly.startsWith('71'))) {
        return '0' + digitsOnly;
      }
      return digitsOnly || cleaned;
    }
    return digitsOnly || cleaned;
  }

  if (field === 'amount' || field === 'initialDeposit') {
    const lower = cleaned.toLowerCase();
    if (lower.includes('hundred thousand') || lower.includes('100k') || lower.includes('dubu dari')) return '100000';
    if (lower.includes('fifty thousand') || lower.includes('50k') || lower.includes('dubu hamsin')) return '50000';
    if (lower.includes('twenty five thousand') || lower.includes('25k')) return '25000';
    if (lower.includes('twenty thousand') || lower.includes('20k') || lower.includes('ẹgbàáwàá') || lower.includes('dubu ashirin') || lower.includes('puku iri abuo')) return '20000';
    if (lower.includes('ten thousand') || lower.includes('10k') || lower.includes('ẹgbàárùn-ún') || lower.includes('dubu goma') || lower.includes('puku iri')) return '10000';
    if (lower.includes('five thousand') || lower.includes('5k') || lower.includes('dubu biyar') || lower.includes('puku ise')) return '5000';
    if (lower.includes('two thousand') || lower.includes('2k') || lower.includes('dubu biyu')) return '2000';
    if (lower.includes('one thousand') || lower.includes('1k') || lower.includes('dubu daya')) return '1000';

    const digits = lower.replace(/[^\d]/g, '');
    if (digits) return digits;
    return cleaned;
  }

  if (field === 'address') {
    const prefixes = [
      /^(i live at|i live in|my address is|my address na|address is|address na)\s+/i,
      /^(mo ń gbé ní|mo n gbe ni|adirẹsi mi ni|adiresi mi ni)\s+/i,
      /^(ina zama a|adireshi na shine|adireshina)\s+/i,
      /^(ebe m bi bụ|ebe m bi bu|adreesi m)\s+/i,
      /^(i dey stay for|my area na)\s+/i
    ];
    for (const p of prefixes) {
      cleaned = cleaned.replace(p, '');
    }
    return cleaned.trim();
  }

  return cleaned;
}

export function getOnboardingPhrase(
  language: Language | null | undefined,
  key: OnboardingPhraseKey,
  phone?: string
): string {
  const template = ONBOARDING_PHRASES[language || 'en']?.[key] || ONBOARDING_PHRASES.en[key];
  return template.replace('{phone}', phone || '');
}

type PhraseKey =
  | 'confirmSend' | 'confirmDeposit' | 'confirmAirtime' | 'confirmWithdraw'
  | 'successSend' | 'successDeposit' | 'successAirtime' | 'successWithdraw'
  | 'welcomeBack' | 'faceAuthFailed' | 'balance'
  | 'askFullName' | 'askEmail' | 'askAddress' | 'enrollmentComplete'
  | 'notUnderstood';

const PHRASE_TEMPLATES: Record<PhraseKey, string> = {
  confirmSend: 'You are sending {0} naira to {1}. Is that correct?',
  confirmDeposit: 'You are depositing {0} naira. Is that correct?',
  confirmAirtime: 'You are buying {0} naira of airtime for {1}. Is that correct?',
  confirmWithdraw: 'You are withdrawing {0} naira. Is that correct?',
  successSend: 'Your transfer of {0} naira to {1} was successful.',
  successDeposit: 'Your deposit of {0} naira was successful.',
  successAirtime: 'Your airtime purchase of {0} naira was successful.',
  successWithdraw: 'Your withdrawal of {0} naira was successful.',
  welcomeBack: 'Welcome back, {0}.',
  faceAuthFailed: "We couldn't verify your face. Please try again.",
  balance: 'Your balance is {0} naira.',
  askFullName: 'Please enter the customer full name.',
  askEmail: 'Please enter the customer email address, or leave it blank.',
  askAddress: 'Please enter the customer address.',
  enrollmentComplete: 'Your account has been created successfully.',
  notUnderstood: "I couldn't hear that clearly. Please speak clearly or try again."
};

export function phrase(language: Language, key: PhraseKey, ...values: (string | number)[]): string {
  const template = PHRASE_TEMPLATES[key] || PHRASE_TEMPLATES.faceAuthFailed;
  return template.replace(/\{(\d+)\}/g, (_, index: string) => String(values[Number(index)] ?? ''));
}

let speaking = false;
let activeAudio: HTMLAudioElement | null = null;
let resolveActiveAudio: (() => void) | null = null;
let speechRequest = 0;
const speakingListeners = new Set<(value: boolean) => void>();

function setSpeaking(value: boolean) {
  speaking = value;
  speakingListeners.forEach((listener) => listener(value));
}

export function subscribeSpeaking(listener: (value: boolean) => void): () => void {
  speakingListeners.add(listener);
  listener(speaking);
  return () => speakingListeners.delete(listener);
}

export async function speakNative(text: string, language: Language, onEnd?: () => void): Promise<void> {
  const speechUrl = `${API_BASE}/api/tts`;
  console.log('[speakNative] entry:', { text, language });
  console.log('[speakNative] fetching URL:', speechUrl);
  stopNativeSpeaking();
  const requestId = ++speechRequest;
  setSpeaking(true);
  try {
    const response = await synthesizeSpeech(text, language);
    console.log('[speakNative] fetch succeeded:', { url: response.url, status: response.status });
    const blob = response.blob;
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    await new Promise<void>((resolve) => {
      const finish = () => {
        URL.revokeObjectURL(objectUrl);
        if (activeAudio === audio) activeAudio = null;
        if (resolveActiveAudio === finish) resolveActiveAudio = null;
        resolve();
      };
      activeAudio = audio;
      resolveActiveAudio = finish;
      audio.onended = finish;
      audio.onerror = finish;
      void audio.play().catch(finish);
    });
    console.log('[speakNative] branch: real YarnGPT audio played');
  } catch (error) {
    const responseError = error as { status?: number; url?: string };
    console.log('[speakNative] fetch failed:', {
      url: responseError.url || speechUrl,
      status: responseError.status,
      error
    });
    console.log('[speakNative] branch: browser-voice fallback triggered:', error);
    await new Promise<void>((resolve) => {
      const completed = speakConfirmationFallback(text, language, resolve);
      if (!completed) resolve();
    });
  } finally {
    if (requestId === speechRequest) setSpeaking(false);
    onEnd?.();
  }
}

export function stopNativeSpeaking(): void {
  speechRequest += 1;
  resolveActiveAudio?.();
  resolveActiveAudio = null;
  activeAudio?.pause();
  activeAudio = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setSpeaking(false);
}

function speakConfirmationFallback(text: string, language: Language, onEnd: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  try {
    window.speechSynthesis.cancel(); // cancel any stale speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set locale code
    const langMap: Record<Language, string> = {
      yo: 'yo-NG',
      ha: 'ha-NG',
      ig: 'ig-NG',
      pcm: 'en-NG',
      en: 'en-NG'
    };
    utterance.lang = langMap[language] || 'en-NG';
    utterance.rate = 0.95; // slightly deliberate for clarity
    utterance.pitch = 1.05;

    // Pick best available voice if matching
    const voices = window.speechSynthesis.getVoices?.() || [];
    const matchingVoice = voices.find(v => 
      v.lang.toLowerCase().includes('ng') || 
      v.name.toLowerCase().includes('nigeria') ||
      v.name.toLowerCase().includes('african') ||
      (language === 'en' && (v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    let ended = false;
    const finish = () => {
      if (!ended) {
        ended = true;
        onEnd();
      }
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    
    // Fallback timer in case browser synthesis doesn't fire onend
    const wordCount = text.split(/\s+/).length;
    const estTimeMs = Math.max(1800, wordCount * 450);
    setTimeout(finish, estTimeMs + 800);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function prefetchSpeech(text: string, language: Language): void {
  void synthesizeSpeech(text, language).catch(() => {});
}

export const QUICK_VOICE_COMMANDS = [
  {
    language: 'yo' as Language,
    text: 'Mo fẹ́ fi ẹgbàárùn-ún náírà ránṣẹ́ sí Adéwálé',
    translation: 'Send ₦10,000 to Adewale',
    type: 'transfer' as const,
    amount: 10000,
    recipient: 'Adewale Ogunleye'
  },
  {
    language: 'en' as Language,
    text: 'Send ten thousand naira to Adewale',
    translation: 'Send ₦10,000 to Adewale',
    type: 'transfer' as const,
    amount: 10000,
    recipient: 'Adewale Ogunleye'
  },
  {
    language: 'pcm' as Language,
    text: 'I wan withdraw five thousand naira cash',
    translation: 'Cash Out ₦5,000',
    type: 'cash_out' as const,
    amount: 5000,
    recipient: 'Self (Agent Cash)'
  },
  {
    language: 'ha' as Language,
    text: 'Duba min kudin da ke asusun na',
    translation: 'Check my account balance',
    type: 'balance' as const,
    amount: 0,
    recipient: 'Account Balance'
  },
  {
    language: 'ig' as Language,
    text: 'Achọrọ m itinye puku naira iri abụọ n’akpa ego m',
    translation: 'Cash In ₦20,000 deposit',
    type: 'cash_in' as const,
    amount: 20000,
    recipient: 'Adewale Ogunleye (Self)'
  }
];
