import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, UserCheck, ShieldCheck, Camera, CheckCircle2, Mic,
  Sparkles, Phone, MapPin, Languages, Check, Square, Loader2, Volume2, AlertCircle,
  Coins, Radio, CheckCheck
} from 'lucide-react';
import { Language, Customer } from '../types';
import { 
  getOnboardingPhrase, LANGUAGES, speakNative, FieldKey, 
  getFieldPromptPhrase 
} from '../lib/phrases';
import { playChime } from '../lib/audio';
import { getStoredCustomers, setActiveCustomerId, formatNaira } from '../lib/store';
import { VoiceFieldAssistantModal } from '../components/VoiceFieldAssistantModal';

interface OnboardingPageProps {
  onNavigate: (route: string) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Customer Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('25000');
  const [email, setEmail] = useState('');

  // Voice Field Assistant Modal State
  const [activeVoiceField, setActiveVoiceField] = useState<FieldKey | null>(null);

  // Step 2: Preferred Language
  const [preferredLang, setPreferredLang] = useState<Language>('yo');

  // Step 3: Face Enrollment
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const FIELD_ORDER: FieldKey[] = ['firstName', 'lastName', 'phone', 'address', 'initialDeposit'];
  const FIELD_LABELS: Record<string, string> = {
    firstName: 'First Name',
    lastName: 'Last Name / Surname',
    phone: 'Phone Number',
    address: 'Residential / Stall Address',
    initialDeposit: 'Opening Deposit (₦)'
  };

  const getNextField = (curr: FieldKey): FieldKey | null => {
    const idx = FIELD_ORDER.indexOf(curr);
    if (idx !== -1 && idx < FIELD_ORDER.length - 1) {
      return FIELD_ORDER[idx + 1];
    }
    return null;
  };

  const handleVoiceValueCaptured = (field: FieldKey, val: string) => {
    if (field === 'firstName') setFirstName(val);
    if (field === 'lastName') setLastName(val);
    if (field === 'phone') setPhone(val);
    if (field === 'address') setAddress(val);
    if (field === 'initialDeposit') setInitialDeposit(val);
  };

  const handleLanguageSelect = (lang: Language) => {
    setPreferredLang(lang);
    playChime('click');
    const greeting = LANGUAGES[lang]?.greeting || 'Hello';
    void speakNative(greeting, lang);
  };

  const voiceButton = (field: FieldKey) => {
    const langInfo = LANGUAGES[preferredLang] || LANGUAGES.en;
    return (
      <button
        type="button"
        aria-label={`Speak ${FIELD_LABELS[field] || field}`}
        onClick={() => {
          playChime('click');
          setActiveVoiceField(field);
        }}
        className="shrink-0 h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0D1B2A] bg-gradient-to-r from-[#FFF5F5] to-[#FEF3C7] hover:from-[#FEF3C7] hover:to-[#FED7AA] text-[#0D1B2A] shadow-[2px_2px_0px_#0D1B2A] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer group"
        title={`Speak in ${langInfo.name}`}
      >
        <Mic className="w-4 h-4 text-[#FF4646] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black font-mono hidden sm:inline">
          {langInfo.nativeName}
        </span>
      </button>
    );
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      return;
    }
    playChime('click');
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    playChime('click');
    setCurrentStep(3);
    startCamera();
  };

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch {
      // simulated face fallback
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCaptureFace = () => {
    playChime('verify');
    setIsCapturing(true);
    setCaptureProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setCaptureProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsCapturing(false);
        setFaceEnrolled(true);
        stopCamera();
        playChime('success');

        // Create new customer
        const randomNuban = '01' + Math.floor(10000000 + Math.random() * 90000000);
        const parsedBalance = Number(initialDeposit.replace(/\D/g, '')) || 25000;
        const createdCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: `${firstName} ${lastName}`.trim() || 'New ElderPay Member',
          phone: phone || '0803 000 0000',
          preferredLanguage: preferredLang,
          balance: parsedBalance,
          accountNumber: randomNuban,
          bankName: 'Wema Bank (ElderPay Virtual)',
          faceEnrolled: true,
          address: address || 'Nigeria',
          bvnMasked: '221***' + Math.floor(100 + Math.random() * 900),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };

        const existing = getStoredCustomers();
        const updated = [createdCustomer, ...existing];
        localStorage.setItem('elderpay_customers_v2', JSON.stringify(updated));
        setActiveCustomerId(createdCustomer.id);
        setNewCustomer(createdCustomer);

        setTimeout(() => {
          setCurrentStep(4);
          const welcomeText = `Welcome to ElderPay, ${firstName}! Your voice account has been created.`;
          console.log('[OnboardingPage] triggering speech:', welcomeText);
          void speakNative(welcomeText, preferredLang);
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EC] pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-[#0D1B2A]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#0D1B2A]/10">
          <button
            onClick={() => onNavigate('/')}
            className="retro-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <span className="text-xs font-mono font-bold text-[#0D1B2A]">
            AGENT ONBOARDING ENROLLMENT
          </span>
          <span className="text-xs font-bold text-[#0D1B2A] bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#0D1B2A]">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-between px-2">
          {['Customer Info', 'Native Dialect', 'Face Enrollment', 'Account Ready'].map((title, i) => (
            <div key={title} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black font-mono border-2 border-[#0D1B2A] ${
                  currentStep >= i + 1
                    ? 'bg-[#FF4646] text-white shadow-[2px_2px_0px_#0D1B2A]'
                    : 'bg-white text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-[#0D1B2A]">
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Card Container in PayCart Neo-Brutalist Style */}
        <div className="bg-white rounded-3xl p-7 sm:p-10 border-3 border-[#0D1B2A] shadow-[8px_8px_0px_#0D1B2A]">
          {/* STEP 1: CUSTOMER INFORMATION */}
          {currentStep === 1 && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleStep1Next}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h2 className="text-2xl font-black text-[#0D1B2A] font-display">
                    Customer Information & Spoken Enrollment
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#10B981] text-[#065F46] text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-[#10B981]" />
                    Sahara Intron Voice Powered
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  Fill in the elder's details directly, or tap any <strong className="text-[#0D1B2A]">Voice Mic</strong> button to let ElderPay speak the question in their language and record their answer.
                </p>
              </div>

              {/* Spoken Dialect Selector Bar */}
              <div className="p-3.5 bg-[#FAF5EC] rounded-2xl border-2 border-[#0D1B2A] shadow-[2px_2px_0px_#0D1B2A] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0D1B2A] flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-[#FF4646]" />
                    Spoken Dialect for this Session:
                  </span>
                  <span className="text-[11px] font-mono font-bold text-gray-600">
                    System speaks & listens in: <strong className="text-[#FF4646] uppercase">{LANGUAGES[preferredLang].name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(LANGUAGES) as Language[]).map((code) => {
                    const l = LANGUAGES[code];
                    const isSelected = preferredLang === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleLanguageSelect(code)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF4646] text-white border-[#0D1B2A] shadow-[2px_2px_0px_#0D1B2A] scale-[1.02]'
                            : 'bg-white text-[#0D1B2A] border-[#0D1B2A]/20 hover:border-[#0D1B2A] hover:bg-[#FEF3C7]'
                        }`}
                      >
                        <span className="font-black text-[11px] leading-tight">{l.nativeName}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {l.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hands-Free Guided Voice Enrollment Banner */}
              <div className="p-4 bg-gradient-to-r from-[#FFF5F5] via-[#FEF3C7] to-[#FAF5EC] rounded-2xl border-2 border-[#0D1B2A] shadow-[3px_3px_0px_#0D1B2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4646] text-white flex items-center justify-center border-2 border-[#0D1B2A] shadow-[2px_2px_0px_#0D1B2A] shrink-0">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0D1B2A]">
                      Hands-Free Voice Guided Enrollment
                    </h3>
                    <p className="text-[11px] text-gray-700 leading-snug">
                      ElderPay will speak each question out loud in <strong>{LANGUAGES[preferredLang].name}</strong>, listen to the elder's spoken response, and auto-populate each field.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playChime('listen');
                    setActiveVoiceField('firstName');
                  }}
                  className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl border-2 border-[#0D1B2A] bg-[#0D1B2A] hover:bg-[#1E293B] text-white text-xs font-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_#FF4646] cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#FF4646]" />
                  <span>Start Voice Walkthrough</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    First Name *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={(element) => { inputRefs.current.firstName = element; }}
                      type="text"
                      required
                      placeholder="e.g., Folashade"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="min-w-0 flex-1 px-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] focus:outline-none"
                    />
                    {voiceButton('firstName')}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Last Name / Surname
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={(element) => { inputRefs.current.lastName = element; }}
                      type="text"
                      placeholder="e.g., Adeleke"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="min-w-0 flex-1 px-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] focus:outline-none"
                    />
                    {voiceButton('lastName')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                  Phone Number (for SMS & Voice Alerts) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={(element) => { inputRefs.current.phone = element; }}
                    type="tel"
                    required
                    placeholder="0803 XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="min-w-0 flex-1 px-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] focus:outline-none"
                  />
                  {voiceButton('phone')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                  Residential / Market Stall Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={(element) => { inputRefs.current.address = element; }}
                    type="text"
                    placeholder="e.g., 18 Dugbe Market Road, Ibadan"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="min-w-0 flex-1 px-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] focus:outline-none"
                  />
                  {voiceButton('address')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Opening Initial Deposit (₦)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">
                        ₦
                      </span>
                      <input
                        ref={(element) => { inputRefs.current.initialDeposit = element; }}
                        type="text"
                        placeholder="25000"
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-bold text-[#0D1B2A] focus:outline-none font-mono"
                      />
                    </div>
                    {voiceButton('initialDeposit')}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1B2A] mb-1">
                    Email Address <span className="font-normal text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="elder@example.com (can be blank)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF5EC] rounded-xl border-2 border-[#0D1B2A] text-xs font-medium text-[#0D1B2A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <p className="text-[11px] text-gray-500">
                  * Required fields to create virtual account.
                </p>
                <button
                  type="submit"
                  className="retro-btn-primary px-6 py-3 text-xs font-black flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Language</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: PREFERRED LANGUAGE */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black text-[#0D1B2A] font-display">
                  Select Preferred Native Dialect
                </h2>
                <p className="text-xs text-gray-700 font-medium mt-1">
                  The terminal will speak and listen to the customer in this language.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(Object.keys(LANGUAGES) as Language[]).map(code => {
                  const lang = LANGUAGES[code];
                  const isSelected = preferredLang === code;
                  return (
                    <div
                      key={code}
                      onClick={() => {
                        playChime('click');
                        setPreferredLang(code);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'bg-[#FEF3C7] border-[#0D1B2A] shadow-[4px_4px_0px_#0D1B2A]'
                          : 'bg-white border-[#0D1B2A]/20 hover:border-[#0D1B2A] hover:bg-[#FAF5EC]'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-black text-[#0D1B2A] font-display">
                          {lang.name}
                        </h4>
                        <p className="text-xs text-[#FF4646] font-bold mt-0.5">
                          {lang.nativeName}
                        </p>
                        <p className="text-[11px] text-gray-600 mt-1 font-medium">
                          Greeting: “{lang.greeting}”
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#FF4646] text-white flex items-center justify-center text-xs font-black border border-[#0D1B2A]">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="retro-btn-secondary px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="retro-btn-primary px-6 py-3 text-xs font-black flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Face Enrollment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FACE ENROLLMENT */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div>
                <h2 className="text-2xl font-black text-[#0D1B2A] font-display">
                  Face Biometric Enrollment
                </h2>
                <p className="text-xs text-gray-700 font-medium mt-1">
                  Position customer's face within the frame to save their encrypted verification template.
                </p>
              </div>

              {/* Camera or Viewfinder frame */}
              <div className="relative mx-auto w-56 h-64 rounded-3xl border-3 border-[#0D1B2A] bg-[#0D1B2A] shadow-[6px_6px_0px_#0D1B2A] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 w-5 h-5 border-t-3 border-l-3 border-[#FF4646]" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-3 border-r-3 border-[#FF4646]" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-3 border-l-3 border-[#FF4646]" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-3 border-r-3 border-[#FF4646]" />

                {isCapturing && (
                  <motion.div
                    animate={{ y: [-110, 110] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute left-0 right-0 h-1 bg-[#FF4646] shadow-[0_0_12px_#FF4646]"
                  />
                )}

                <div className="w-24 h-32 rounded-t-full rounded-b-2xl border-2 border-dashed border-[#FF4646]/60 flex flex-col items-center justify-center p-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#FF4646]/60 mb-1" />
                  <div className="w-14 h-12 rounded-t-xl border-2 border-[#FF4646]/60" />
                </div>

                <span className="absolute bottom-2 text-[10px] font-mono text-white font-bold bg-black/70 border border-white/20 px-2.5 py-0.5 rounded-full">
                  {isCapturing ? `ENROLLING: ${captureProgress}%` : 'ALIGN FACE'}
                </span>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  disabled={isCapturing}
                  onClick={handleCaptureFace}
                  className="w-full retro-btn-primary py-3.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? 'Scanning Face...' : 'Capture & Enroll Face'}</span>
                </button>

                <p className="text-[11px] text-gray-600 font-mono">
                  *ElderPay stores only mathematical face descriptor vectors, never raw photos.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACCOUNT CREATED STATE */}
          {currentStep === 4 && newCustomer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0D8253] text-white flex items-center justify-center mx-auto text-2xl font-black border-2 border-[#0D1B2A] shadow-[4px_4px_0px_#0D1B2A]">
                ✓
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0D1B2A] font-display">
                  Account Created Successfully!
                </h2>
                <p className="text-xs text-gray-700 font-medium mt-1">
                  Customer is now enrolled for cardless voice-first banking.
                </p>
              </div>

              {/* Created Account Details Card */}
              <div className="bg-[#FAF5EC] p-6 rounded-2xl border-2 border-[#0D1B2A] shadow-[4px_4px_0px_#0D1B2A] text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-bold text-[#0D1B2A]">{newCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Virtual NUBAN:</span>
                  <span className="font-black text-[#FF4646] text-sm">{newCustomer.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner Bank:</span>
                  <span className="text-[#0D1B2A] font-bold">{newCustomer.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preferred Language:</span>
                  <span className="text-[#0D1B2A] font-bold">{LANGUAGES[newCustomer.preferredLanguage].name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biometric Verification:</span>
                  <span className="font-bold text-[#0D8253]">Enrolled ✓</span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-[#0D1B2A]/10">
                  <span className="text-gray-600">Initial Float:</span>
                  <span className="font-black text-[#0D8253] text-sm">{formatNaira(newCustomer.balance)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/app')}
                  className="flex-1 retro-btn-primary py-3.5 text-xs font-black cursor-pointer text-center"
                >
                  Test Voice Transfer with This Account
                </button>
                <button
                  onClick={() => onNavigate('/pos')}
                  className="retro-btn-secondary py-3.5 px-6 text-xs font-bold cursor-pointer"
                >
                  Return to Agent POS
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Voice Field Assistant Interactive Modal */}
      {activeVoiceField && (
        <VoiceFieldAssistantModal
          isOpen={Boolean(activeVoiceField)}
          field={activeVoiceField}
          fieldNameLabel={FIELD_LABELS[activeVoiceField] || activeVoiceField}
          language={preferredLang}
          onClose={() => setActiveVoiceField(null)}
          onValueCaptured={(val) => handleVoiceValueCaptured(activeVoiceField, val)}
          onNextField={
            getNextField(activeVoiceField)
              ? () => setActiveVoiceField(getNextField(activeVoiceField))
              : undefined
          }
          nextFieldNameLabel={
            getNextField(activeVoiceField)
              ? FIELD_LABELS[getNextField(activeVoiceField)!]
              : undefined
          }
        />
      )}
    </div>
  );
};
