// ─── Flashcard types ──────────────────────────────────────────────────────────

export type LeitnerBox = 0 | 1 | 2 | 3; // 0=daily, 1=2days, 2=5days, 3=mastered

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  box: LeitnerBox;
  lastReviewed?: number; // timestamp ms
}

export interface Deck {
  id: string;
  title: string;
  createdAt: number;
  cards: Flashcard[];
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export interface Question {
  id: string;
  soal: string;
  opsi: string[];   // array of 4 options, each prefixed with "A. " etc by AI
  jawaban: number;  // index 0-3
  pembahasan: string;
}

export interface QuizSession {
  questions: Question[];
  currentIdx: number;
  score: { correct: number; total: number };
  done: boolean;
  duration?: number; // seconds per question
}

export interface QuizDeck {
  id: string;
  title: string;
  createdAt: number;
  questions: Question[];
  stats?: {
    lastScore: number;
    totalPlayed: number;
  };
}

// ─── Chat types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface GenerateFlashcardsRequest {
  materi: string;
}

export interface GenerateFlashcardsResponse {
  cards: Array<{ front: string; back: string }>;
}

export interface GenerateQuestionsRequest {
  materi: string;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  userMessage: string;
}

export interface ChatResponse {
  reply: string;
}
