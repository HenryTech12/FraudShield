import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  MapPin,
  CreditCard,
  UserCheck,
  FastForward
} from 'lucide-react';
import { CallMessage, Decision, SuspiciousTransaction } from '../types';
import { sampleTransaction } from '../data/mockData';
import { speechSynthesizer } from '../lib/speech';

export const PhoneCallDemo: React.FC = () => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [waitingForDecision, setWaitingForDecision] = useState<boolean>(false);
  const [userDecision, setUserDecision] = useState<Decision>(null);
  const [isMuted, setIsMuted] = useState<boolean>(speechSynthesizer.muted);
  const [cardLocked, setCardLocked] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Script definition
  const scriptLines = [
    {
      speaker: 'ai' as const,
      text: "Hello, this is Noor, an automated fraud safety agent calling from Emirates Horizon Bank. For your peace of mind, I will never ask for your PIN, passwords, or online login details.",
      timestamp: '00:03',
      highlight: 'Never asks for PIN'
    },
    {
      speaker: 'ai' as const,
      text: "Before we review your recent activity, could you please confirm the city you last used your card in?",
      timestamp: '00:08',
      highlight: 'Identity check'
    },
    {
      speaker: 'customer' as const,
      text: "Dubai.",
      timestamp: '00:12',
    },
    {
      speaker: 'ai' as const,
      text: "Thank you. That matches our security records — you are verified.",
      timestamp: '00:15',
    },
    {
      speaker: 'ai' as const,
      text: `We just detected an unusual charge of ${sampleTransaction.amount} at "${sampleTransaction.merchant}" in ${sampleTransaction.location}, ${sampleTransaction.timeAgo}. Does this transaction look familiar to you?`,
      timestamp: '00:20',
      isPromptForDecision: true
    }
  ];

  // Auto-scroll when new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, waitingForDecision, userDecision, cardLocked]);

  // Call timer
  useEffect(() => {
    if (callActive && !callEnded) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive, callEnded]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      speechSynthesizer.stop();
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSound = () => {
    const nextMute = speechSynthesizer.toggleMute();
    setIsMuted(nextMute);
  };

  // Start the call demo
  const handleStartCall = () => {
    speechSynthesizer.stop();
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);

    setCallActive(true);
    setCallDuration(0);
    setCurrentStepIndex(0);
    setMessages([]);
    setWaitingForDecision(false);
    setUserDecision(null);
    setCardLocked(false);
    setCallEnded(false);
    setIsSpeaking(true);

    speechSynthesizer.playChime('connected');

    // Trigger first line after brief ring
    stepTimeoutRef.current = setTimeout(() => {
      playScriptStep(0);
    }, 900);
  };

  // Advance through script steps
  const playScriptStep = (stepIdx: number) => {
    if (stepIdx >= scriptLines.length) return;

    const line = scriptLines[stepIdx];
    setCurrentStepIndex(stepIdx);

    const newMessage: CallMessage = {
      id: `msg-${stepIdx}-${Date.now()}`,
      speaker: line.speaker,
      text: line.text,
      timestamp: formatTimer(callDuration),
      highlight: line.highlight
    };

    setMessages((prev) => [...prev, newMessage]);

    if (line.speaker === 'ai') {
      setIsSpeaking(true);
      speechSynthesizer.speak(
        line.text,
        () => {
          setIsSpeaking(false);
          if (line.isPromptForDecision) {
            setWaitingForDecision(true);
          } else {
            stepTimeoutRef.current = setTimeout(() => {
              playScriptStep(stepIdx + 1);
            }, 1200);
          }
        },
        () => {
          setIsSpeaking(false);
          if (line.isPromptForDecision) {
            setWaitingForDecision(true);
          } else {
            stepTimeoutRef.current = setTimeout(() => {
              playScriptStep(stepIdx + 1);
            }, 1200);
          }
        }
      );
    } else {
      // Customer simulated response
      setIsSpeaking(false);
      stepTimeoutRef.current = setTimeout(() => {
        playScriptStep(stepIdx + 1);
      }, 1400);
    }
  };

  // Fast-forward or skip to next line
  const handleSkipNext = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    speechSynthesizer.stop();
    setIsSpeaking(false);

    if (currentStepIndex < scriptLines.length - 1) {
      playScriptStep(currentStepIndex + 1);
    } else if (!waitingForDecision && !userDecision) {
      setWaitingForDecision(true);
    }
  };

  // User decision: "Yes, that was me"
  const handleDecisionYes = () => {
    speechSynthesizer.stop();
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);

    setWaitingForDecision(false);
    setUserDecision('yes');
    speechSynthesizer.playChime('approved');

    const custMsg: CallMessage = {
      id: `cust-${Date.now()}`,
      speaker: 'customer',
      text: "Yes, that was me. I made that purchase.",
      timestamp: formatTimer(callDuration + 1),
    };

    setMessages((prev) => [...prev, custMsg]);

    const aiEndingText =
      "Thank you for confirming! Your card remains active and protected, and no further action is needed. Have a wonderful day.";

    stepTimeoutRef.current = setTimeout(() => {
      const aiEndingMsg: CallMessage = {
        id: `ai-end-${Date.now()}`,
        speaker: 'ai',
        text: aiEndingText,
        timestamp: formatTimer(callDuration + 3),
      };
      setMessages((prev) => [...prev, aiEndingMsg]);
      setIsSpeaking(true);

      speechSynthesizer.speak(aiEndingText, () => {
        setIsSpeaking(false);
        setCallEnded(true);
      });
    }, 900);
  };

  // User decision: "No, I didn't do this"
  const handleDecisionNo = () => {
    speechSynthesizer.stop();
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);

    setWaitingForDecision(false);
    setUserDecision('no');
    setCardLocked(true);
    speechSynthesizer.playChime('freeze');

    const custMsg: CallMessage = {
      id: `cust-${Date.now()}`,
      speaker: 'customer',
      text: "No, I didn't do this. I'm not in Deira.",
      timestamp: formatTimer(callDuration + 1),
    };

    setMessages((prev) => [...prev, custMsg]);

    const aiEndingText =
      "I understand. I am temporarily freezing your card right now so no more charges can go through. Don't worry — this is temporary and fully reversible. Our fraud specialist, Tariq, will call you back shortly to sort out anything further.";

    stepTimeoutRef.current = setTimeout(() => {
      const aiEndingMsg: CallMessage = {
        id: `ai-end-${Date.now()}`,
        speaker: 'ai',
        text: aiEndingText,
        timestamp: formatTimer(callDuration + 3),
        isAction: true,
      };
      setMessages((prev) => [...prev, aiEndingMsg]);
      setIsSpeaking(true);

      speechSynthesizer.speak(aiEndingText, () => {
        setIsSpeaking(false);
        setCallEnded(true);
      });
    }, 900);
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-4" id="demo-section">
      {!callActive ? (
        /* BIG OBVIOUS BUTTON TO TRY IT */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-10 text-center transition-all hover:border-slate-300">
          {/* Situation preview banner */}
          <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  The Situation
                </p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">
                  Unusual charge detected: <span className="font-semibold text-amber-900">AED 3,420</span> at Dubai Luxury Boutique
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Instead of waiting hours for a call center, the bank’s AI agent calls within 15 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* THE BIG OBVIOUS BUTTON */}
          <button
            id="try-call-button"
            onClick={handleStartCall}
            className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-semibold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-sky-600/60 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span>Try the call</span>
          </button>

          <p className="text-xs sm:text-sm text-slate-500 mt-4">
            Interactive phone call demo • Plays out in ~30 seconds • No setup needed
          </p>
        </div>
      ) : (
        /* ACTIVE CALL SIMULATOR */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all">
          {/* Call Header Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Agent Avatar with speaking pulse */}
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-sky-600 text-white ${
                    isSpeaking ? 'ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                >
                  N
                </div>
                {isSpeaking && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    Noor — Bank AI Agent
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Automated
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{callEnded ? 'Call Finished' : 'Call in progress'}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono text-slate-300">{formatTimer(callDuration)}</span>
                </div>
              </div>
            </div>

            {/* Controls: Mute & End/Reset */}
            <div className="flex items-center gap-2">
              <button
                id="toggle-voice-btn"
                onClick={handleToggleSound}
                title={isMuted ? 'Turn voice speech on' : 'Mute voice speech'}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span className="hidden sm:inline text-slate-400">Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline text-sky-300">Voice On</span>
                  </>
                )}
              </button>

              {!callEnded && !waitingForDecision && !userDecision && (
                <button
                  id="skip-next-btn"
                  onClick={handleSkipNext}
                  title="Fast forward to next line"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
                >
                  <FastForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Next</span>
                </button>
              )}

              <button
                id="reset-call-btn"
                onClick={handleStartCall}
                title="Restart this call"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Restart</span>
              </button>
            </div>
          </div>

          {/* Voice Wave Animation when speaking */}
          <div className="bg-slate-850 px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Audio:</span>
              {isSpeaking ? (
                <div className="flex items-center gap-1 h-4">
                  <div className="w-1 bg-sky-400 rounded-full animate-voice-wave" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 bg-sky-400 rounded-full animate-voice-wave" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 bg-sky-400 rounded-full animate-voice-wave" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 bg-sky-400 rounded-full animate-voice-wave" style={{ animationDelay: '100ms' }} />
                  <span className="ml-1.5 text-sky-300 text-xs">Noor is speaking...</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Listening / Paused</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Verified caller ID • Emirates Horizon Bank
            </div>
          </div>

          {/* Chat-style conversation container */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-slate-50/50">
            {messages.map((msg) => {
              const isAi = msg.speaker === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 font-medium">
                    {isAi ? (
                      <>
                        <Volume2 className="w-3 h-3 text-sky-600" />
                        <span>Noor (AI Agent)</span>
                      </>
                    ) : (
                      <>
                        <span>You (Customer)</span>
                      </>
                    )}
                    <span className="text-slate-400">•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
                        : 'bg-sky-700 text-white shadow-sm rounded-tr-sm'
                    }`}
                  >
                    {msg.text}

                    {/* Highlight reassurance badge if present */}
                    {msg.highlight && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-800 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>{msg.highlight}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated Transaction Card (Appears during beat 4) */}
            {currentStepIndex >= 4 && (
              <div className="my-3 p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {sampleTransaction.merchant}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {sampleTransaction.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {sampleTransaction.amount}
                    </span>
                    <span className="block text-[11px] text-amber-700 font-medium">
                      Flagged as unusual
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    Card ending in {sampleTransaction.cardLast4}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {sampleTransaction.timeAgo}
                  </span>
                </div>
              </div>
            )}

            {/* STEP 5: THE TWO DECISION BUTTONS (THE MOST PROMINENT MOMENT ON THE PAGE) */}
            {waitingForDecision && !userDecision && (
              <div className="my-6 p-5 sm:p-7 rounded-2xl bg-white border-2 border-sky-600 shadow-xl text-center space-y-4 animate-pulse-gentle">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    Your Turn to Answer
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    Did you make this purchase?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    Click an option below as if you were answering the AI on the phone:
                  </p>
                </div>

                {/* THE TWO BIG DECISION BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {/* Button 1: Yes, that was me */}
                  <button
                    id="decision-yes-btn"
                    onClick={handleDecisionYes}
                    className="group flex flex-col items-center justify-center p-5 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 font-bold transition-all transform active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-base sm:text-lg text-emerald-950">
                      Yes, that was me
                    </span>
                    <span className="text-xs text-emerald-800 font-normal mt-1">
                      Keep card open & approve charge
                    </span>
                  </button>

                  {/* Button 2: No, I didn't do this (warm accent alert) */}
                  <button
                    id="decision-no-btn"
                    onClick={handleDecisionNo}
                    className="group flex flex-col items-center justify-center p-5 rounded-xl border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-950 font-bold transition-all transform active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <span className="text-base sm:text-lg text-red-950">
                      No, I didn’t do this
                    </span>
                    <span className="text-xs text-red-800 font-normal mt-1">
                      Freeze card immediately
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: VISUAL CARD LOCKING MOMENT (IF "NO" SELECTED) */}
            {cardLocked && (
              <div className="my-4 p-5 rounded-xl bg-amber-50/90 border-2 border-amber-300 text-slate-900 shadow-sm transition-all">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Card Temporarily Frozen</span>
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        Locked for Safety
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 mt-1">
                      Visa ending in <span className="font-mono font-bold">•••• 4892</span> is now protected against any further unauthorized attempts.
                    </p>

                    <div className="mt-3 pt-3 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Action is 100% reversible</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <UserCheck className="w-4 h-4 text-sky-700 shrink-0" />
                        <span>Fraud specialist Tariq calling back</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: VISUAL APPROVAL MOMENT (IF "YES" SELECTED) */}
            {userDecision === 'yes' && (
              <div className="my-4 p-5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-slate-900 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-emerald-950">
                        Transaction Verified & Card Active
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Safe
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-900 mt-1">
                      No block has been placed. You can continue using your card as usual without interruption.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Call Outcome Footer with "Try Other Option" */}
          {callEnded && (
            <div className="p-4 sm:p-5 bg-slate-100/90 border-t border-slate-200 text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-600">
                You just experienced how quickly a customer is protected in real life.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {userDecision === 'yes' ? (
                  <button
                    id="try-fraud-path-btn"
                    onClick={() => {
                      handleStartCall();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try again (and test the "No, wasn't me" freeze path)</span>
                  </button>
                ) : (
                  <button
                    id="try-approve-path-btn"
                    onClick={() => {
                      handleStartCall();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try again (and test the "Yes, that was me" path)</span>
                  </button>
                )}

                <button
                  id="toggle-reset-view-btn"
                  onClick={() => setCallActive(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4 text-slate-500" />
                  <span>Close Call</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
