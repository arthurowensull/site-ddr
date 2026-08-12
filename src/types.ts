export type AnatomyTarget = 'cornea' | 'cristalino' | 'retina' | 'macula' | 'nervo';
export type QuestionType = 'choice' | 'short' | 'long' | 'order' | 'visual' | 'match';

export interface Flashcard {
  type: string;
  question: string;
  verdict: string;
  answer: string;
}

export interface MatchPair { label: string; answer: string; }

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  title: string;
  hint?: string;
  options?: string[];
  items?: string[];
  pairs?: MatchPair[];
  answer?: string | number | string[];
  answerText?: string;
  keywords?: string[];
  reference?: string;
  requiredConcepts?: string[];
  placeholder?: string;
  points: number;
}

export interface AIGrade {
  score: number;
  correct: boolean;
  feedback: string;
  strengths: string[];
  missing: string[];
  mode: 'ai' | 'local';
}
