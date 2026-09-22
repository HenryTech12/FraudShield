export type Language = 'en' | 'yo' | 'pcm' | 'ha' | 'ig';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
  greeting: string;
  samplePhrase: string;
  sampleTranslation: string;
  understoodText: string;
  confirmationText: string;
  successText: string;
}

export type Action = "send" | "balance" | "withdraw" | "deposit" | "airtime" | "bill" | "unknown";
export type TransactionType = 'transfer' | 'cash_out' | 'cash_in' | 'balance';

export type TransactionState =
  | "INTENT_DETECTED"
  | "COLLECTING_DETAILS"
  | "CONFIRMATION_REQUIRED"
  | "USER_CONFIRMED"
  | "FACE_VERIFICATION_REQUIRED"
  | "FACE_VERIFIED"
  | "TRANSACTION_PROCESSING"
  | "TRANSACTION_SUCCESS"
  | "USER_CANCELLED"
  | "INVALID_AMOUNT"
  | "INSUFFICIENT_FUNDS"
  | "UNKNOWN_RECIPIENT"
  | "LOW_AI_CONFIDENCE"
  | "TRANSACTION_FAILED"
  | "FACE_VERIFICATION_FAILED"
  | "PAYMENT_API_ERROR";

export interface ParsedIntent {
  action: Action;
  amount: number | null;
  recipient: string | null;
  confidence: number;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  action: Action;
  amount: number | null;
  recipient: string | null;
  recipientAccount?: string | null;
  confidence: number | null;
  state: TransactionState;
  createdAt: string;
  faceVerified: boolean;
  verificationMethod?: "face" | "voice" | null;
  paymentReference: string | null;
  error: string | null;
  needsClarification?: "amount" | "recipient" | "accountNumber";
}

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: Language;
  balance: number;
  accountNumber: string;
  bankName: string;
  faceEnrolled: boolean;
  avatar?: string;
  address?: string;
  bvnMasked: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  amount: number;
  recipient: string;
  recipientAccount?: string;
  recipientBank?: string;
  sender: string;
  date: string;
  time: string;
  status: TransactionStatus;
  language: Language;
  voiceTranscript: string;
  fee: number;
  verificationMethod: 'face_verification' | 'agent_override' | 'voice_biometric';
}

export interface Agent {
  id: string;
  name: string;
  terminalId: string;
  location: string;
  status: 'online' | 'busy' | 'offline';
  todayTransactionsCount: number;
  todayVolumeNaira: number;
  successRate: number;
  code?: string;
}

export interface HealthStatus {
  ok: boolean;
  demoMode: boolean;
  paystackConfigured: boolean;
  yarngptConfigured: boolean;
  dbConnected: boolean;
}

export interface AgentPayoutProfile {
  paystackRecipientCode: string | null;
  paystackAccountNumber: string | null;
  paystackBankCode: string | null;
  payoutOnboarded: boolean;
}

export interface Bank {
  name: string;
  code: string;
}

export interface AccountRegisterPayload {
  userId: string;
  fullName: string;
  address: string;
  email?: string;
  language: Language;
}

export interface AccountProfile {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: Language;
  balance?: number;
  accountNumber?: string;
  cardNumber?: string;
  faceEnrolled?: boolean;
}

export interface Receipt {
  transactionId: string;
  type: string;
  amount: number;
  recipient: string | null;
  reference: string;
  date: string;
  environment: string;
}

export interface FaceAuthorizeResult {
  authorized: boolean;
}

export interface FaceStatus {
  registered: boolean;
}

export interface VoiceAuthorizeResult {
  authorized: boolean;
}

export interface VoiceStatus {
  registered: boolean;
}

// FraudShield Voice Types
export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

export type MessageSpeaker = 'ai' | 'customer' | 'system';

export interface CallMessage {
  id: string;
  speaker: MessageSpeaker;
  text: string;
  timestamp: string;
  isAction?: boolean;
  highlight?: string;
}

export type Decision = 'yes' | 'no' | null;

export interface SuspiciousTransaction {
  amount: string;
  merchant: string;
  location: string;
  timeAgo: string;
  cardLast4: string;
  cardType: string;
}

export interface SafetyPillar {
  id: string;
  title: string;
  detail: string;
  iconName: 'ShieldAlert' | 'Bot' | 'Lock' | 'FileAudio' | 'UserCheck';
}
