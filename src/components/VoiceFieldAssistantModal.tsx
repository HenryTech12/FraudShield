import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Volume2, Square, Loader2, CheckCircle2, X, Sparkles, 
  ArrowRight, AlertCircle, RefreshCw, Radio
} from 'lucide-react';
import { Language } from '../types';
import { 
  FieldKey, getFieldPromptPhrase, extractCleanFieldValue, 
  FIELD_CONFIRM_PHRASES, LANGUAGES, speakNative, stopNativeSpeaking 
} from '../lib/phrases';
export type { FieldKey };
import { playChime, recordAudio } from '../lib/audio';
import { transcribeOnly } from '../lib/api';

interface VoiceFieldAssistantModalProps {
  isOpen: boolean;
  field: FieldKey;
  fieldNameLabel: string;
  language: Language;
  onClose: () => void;
  onValueCaptured: (value: string) => void;
  onNextField?: () => void;
  nextFieldNameLabel?: string;
}

export const VoiceFieldAssistantModal: React.FC<VoiceFieldAssistantModalProps> = ({
  isOpen,
  field,
  fieldNameLabel,
  language,
  onClose,
  onValueCaptured,
  onNextField,
  nextFieldNameLabel
}) => {
  const [phase, setPhase] = useState<'prompting' | 'listening' | 'transcribing' | 'success' | 'error'>('prompting');
  const [transcript, setTranscript] = useState('');
  const [extractedValue, setExtractedValue] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const recorderRef = useRef<{ stop: () => void; result: Promise<Blob> } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

  const promptInfo = getFieldPromptPhrase(field, language);
  const langInfo = LANGUAGES[language] || LANGUAGES.en;

  // Sample phrases for quick testing / fallback
  const sampleSuggestions: Record<FieldKey, string[]> = {
    firstName: ['Folashade', 'Adewale', 'Amina', 'Ngozi', 'Ibrahim', 'Emeka'],
    lastName: ['Adeleke', 'Ogunleye', 'Bello', 'Okonkwo', 'Musa', 'Danjuma'],
    fullName: ['Folashade Adeleke', 'Adewale Ogunleye', 'Amina Bello', 'Ngozi Okonkwo'],
    phone: ['0803 123 4567', '0812 987 6543', '0705 555 4321', '0901 234 5678'],
    address: ['18 Dugbe Market, Ibadan', '44 Bodija Road, Oyo', '12 Wuse Market, Abuja', 'Main Market, Onitsha'],
    initialDeposit: ['25,000', '10,000', '50,000', '15,000', '5,000'],
    amount: ['10,000', '5,000', '20,000', '2,500', '50,000'],
    recipient: ['Adewale Ogunleye', 'Mama Bola', 'Bello Ibrahim', 'Ngozi Okonkwo'],
    accountNumber: ['0129482711', '0234567890', '1029384756', '2039485761']
  };

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    isCancelledRef.current = false;
    startFieldPrompt();

    return () => {
      cleanup();
    };
  }, [isOpen, field, language]);

  const cleanup = () => {
    isCancelledRef.current = true;
    stopNativeSpeaking();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
  };

  const startFieldPrompt = async () => {
    setPhase('prompting');
    setTranscript('');
    setExtractedValue('');
    setErrorMessage('');
    setRecordingSeconds(0);

    // Speak the question in user's selected language
    try {
      console.log(`[VoiceAssistant] Asking for ${field} in ${language}: "${promptInfo.question}"`);
      await speakNative(promptInfo.question, language, () => {
        if (!isCancelledRef.current) {
          startListening();
        }
      });
    } catch {
      if (!isCancelledRef.current) {
        startListening();
      }
    }
  };

  const startListening = async () => {
    if (isCancelledRef.current) return;
    setPhase('listening');
    playChime('listen');
    setRecordingSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);

    try {
      const recorder = await recordAudio();
      recorderRef.current = recorder;
      const blob = await recorder.result;

      if (isCancelledRef.current) return;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setPhase('transcribing');

      // Transcribe via Sahara AI pipeline
      try {
        const { text, likely_unclear } = await transcribeOnly(blob, language);
        const rawTranscript = text.trim();

        if (!rawTranscript || likely_unclear) {
          throw new Error('UNCLEAR_TRANSCRIPTION');
        }

        handleSuccessfulTranscript(rawTranscript);
      } catch (err) {
        console.warn('[VoiceAssistant] Transcription error, trying fallback extraction:', err);
        // Fallback: prompt retry or quick suggestion
        setPhase('error');
        playChime('error');
        setErrorMessage(
          language === 'yo'
            ? 'Mi ò gbọ́ yé dáadáa. Jọ̀wọ́ tún gbìyànjú tàbí yan ọ̀kan nínú àwọn àpẹẹrẹ tó wà nísàlẹ̀.'
            : language === 'ha'
            ? 'Ban ji amsar ba sosai. Don Allah a sake gwadawa ko a zabi misali a kasa.'
            : language === 'ig'
            ? 'Anụghị m ya nke ọma. Biko nwaa ọzọ ma ọ bụ họrọ ihe atụ dị n’okpuru.'
            : language === 'pcm'
            ? 'I no hear you clearly. Abeg try again or tap any of the options below.'
            : "Could not clearly capture voice audio. Please speak clearly or pick a sample below."
        );
      }
    } catch (err) {
      console.warn('[VoiceAssistant] Microphone error:', err);
      setPhase('error');
      setErrorMessage('Microphone access unavailable. You can tap a quick sample below or enter manually.');
    }
  };

  const stopListeningManually = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
  };

  const handleSuccessfulTranscript = (rawText: string) => {
    setTranscript(rawText);
    const cleaned = extractCleanFieldValue(field, rawText, language);
    const finalValue = cleaned || rawText;
    setExtractedValue(finalValue);
    setPhase('success');
    playChime('understood');

    // Fill field
    onValueCaptured(finalValue);

    // Speak confirmation in user's selected language
    const confirmPhrase = FIELD_CONFIRM_PHRASES[language]
      ? FIELD_CONFIRM_PHRASES[language](finalValue)
      : `Understood: ${finalValue}`;

    console.log(`[VoiceAssistant] Confirming in ${language}: "${confirmPhrase}"`);
    void speakNative(confirmPhrase, language);
  };

  const handleApplySample = (sample: string) => {
    stopNativeSpeaking();
    handleSuccessfulTranscript(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-lg bg-[#0D1B2A] text-white border-2 border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Sahara Intron Voice Hackathon Top Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF4646] to-[#FF8080] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-[#FF4646]">
                  Sahara Intron Voice
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300">
                  Dialect AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Spoken Field Assistant · {langInfo.nativeName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Center Stage */}
        <div className="py-6 text-center space-y-4">
          {/* Target Field Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-gray-300">
            <span>Target Field:</span>
            <span className="text-white font-mono uppercase bg-[#FF4646]/20 text-[#FF8080] px-2 py-0.5 rounded-md border border-[#FF4646]/30">
              {fieldNameLabel}
            </span>
          </div>

          {/* PHASE 1: SYSTEM ASKING QUESTION */}
          {phase === 'prompting' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-[#FF4646] flex items-center justify-center shadow-[0_0_25px_rgba(255,70,70,0.5)] animate-pulse">
                <Volume2 className="w-8 h-8 text-white" />
              </div>

              <div>
                <p className="text-xs uppercase font-mono font-bold tracking-widest text-[#FF4646]">
                  ElderPay is asking in {langInfo.nativeName}...
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1 leading-snug">
                  “{promptInfo.nativeQuestion}”
                </h3>
                <p className="text-xs text-gray-400 mt-1 italic">
                  ({promptInfo.translation})
                </p>
              </div>

              {/* Animated Voice Equalizer */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[14, 28, 20, 32, 18, 30, 16, 24, 12].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-[#FF4646] rounded-full animate-pulse"
                    style={{ height: h, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  stopNativeSpeaking();
                  startListening();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 border border-white/20 transition-all cursor-pointer"
              >
                Skip prompt & speak now →
              </button>
            </div>
          )}

          {/* PHASE 2: LISTENING */}
          {phase === 'listening' && (
            <div className="space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-[#FF4646] animate-ping opacity-30" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#FF4646] to-[#E03A3A] flex items-center justify-center shadow-[0_0_35px_rgba(255,70,70,0.6)]">
                  <Mic className="w-9 h-9 text-white animate-bounce" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4646] animate-ping" />
                  <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#FF8080]">
                    Listening in {langInfo.nativeName} ({recordingSeconds}s)
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
                  Speak your {fieldNameLabel} now...
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Speak in {langInfo.name}, Nigerian Pidgin, or English. Tap below when done.
                </p>
              </div>

              {/* Live Waveform */}
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[12, 26, 36, 22, 38, 28, 34, 18, 24].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                    style={{ height: h, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={stopListeningManually}
                  className="px-6 py-2.5 rounded-xl bg-[#FF4646] hover:bg-[#E03A3A] text-white text-xs font-black font-mono uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Done Speaking ({recordingSeconds}s)</span>
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: TRANSCRIBING */}
          {phase === 'transcribing' && (
            <div className="py-6 space-y-4">
              <Loader2 className="w-12 h-12 text-[#FF4646] animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">
                  Transcribing with Sahara AI...
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Matching speech accents & extracting {fieldNameLabel}.
                </p>
              </div>
            </div>
          )}

          {/* PHASE 4: SUCCESS */}
          {phase === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {langInfo.nativeName} Spoken Input Captured!
                </span>
                <div className="mt-2 p-3 bg-white/10 rounded-2xl border border-emerald-500/30">
                  <p className="text-xs text-gray-400">Extracted & Filled:</p>
                  <p className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                    “{extractedValue}”
                  </p>
                  {transcript && transcript !== extractedValue && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Raw voice phrase: "{transcript}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startFieldPrompt}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-300 border border-white/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-speak</span>
                </button>

                {onNextField ? (
                  <button
                    type="button"
                    onClick={() => {
                      cleanup();
                      onNextField();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#ffffff] cursor-pointer"
                  >
                    <span>Next: {nextFieldNameLabel || 'Next Field'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      cleanup();
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PHASE 5: ERROR / RETRY */}
          {phase === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Could not clearly extract speech
                </h3>
                <p className="text-xs text-red-300 mt-1 px-4">
                  {errorMessage}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startFieldPrompt}
                  className="px-5 py-2.5 rounded-xl bg-[#FF4646] hover:bg-[#E03A3A] text-white text-xs font-black flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Speaking Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips (Hackathon Demo Helpers) */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 text-center sm:text-left flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#FF4646]" />
            <span>Hackathon Quick Dialect Samples (Tap to simulate spoken reply):</span>
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {(sampleSuggestions[field] || ['Sample 1', 'Sample 2']).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleApplySample(sample)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
