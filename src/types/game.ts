import { VerseRecord, EvaluationOutcome } from '../utils/pasukaiEngine';

export type GameMode = 'daily' | 'practice';

export interface RoundResult {
  word: string;
  userQuote: string;
  evaluation: EvaluationOutcome;
  timeSpentSeconds: number;
}

export interface StoredDailyGame {
  dateKey: string;
  totalScore: number;
  results: RoundResult[];
  completedAt: string;
}

export function getScoreEmoji(score: number): string {
  if (score >= 100) return '🟩';
  if (score >= 75) return '🟨';
  if (score >= 50) return '🟦';
  if (score > 0) return '🟧';
  return '⬛';
}
