import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, AlertTriangle } from 'lucide-react';
import { GameMode } from '../types/game';

interface PlayingScreenProps {
  word: string;
  wordIndex: number;
  totalWords: number;
  totalScore: number;
  gameMode: GameMode;
  onSubmitQuote: (quote: string, timedOut: boolean) => void;
  onQuitToHome: () => void;
}

const MAX_TIME = 30; // 30 seconds per word

export const PlayingScreen: React.FC<PlayingScreenProps> = ({
  word,
  wordIndex,
  totalWords,
  totalScore,
  gameMode,
  onSubmitQuote,
  onQuitToHome
}) => {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userInputRef = useRef(userInput);

  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  // Auto-focus textarea on round start & reset state
  useEffect(() => {
    setUserInput('');
    userInputRef.current = '';
    setTimeLeft(MAX_TIME);
    inputRef.current?.focus();
  }, [word, wordIndex]);

  // Stable timer loop
  useEffect(() => {
    setTimeLeft(MAX_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto submit whatever user typed upon timeout
          onSubmitQuote(userInputRef.current, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [word, wordIndex, onSubmitQuote]);

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmitQuote(userInputRef.current, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  const isCriticalTime = timeLeft <= 5;
  const progressPercent = (timeLeft / MAX_TIME) * 100;

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5 py-4 animate-in fade-in duration-200 text-right">
      {/* Top HUD */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            {gameMode === 'daily' ? 'אתגר יומי' : 'אימון חופשי'}
          </span>
          <span className="text-xs text-slate-300 font-medium">
            מילה <span className="text-amber-200 font-bold">{wordIndex + 1}</span> מתוך {totalWords}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-300">
            ניקוד מצטבר: <span className="font-biblical font-bold text-amber-300 text-sm">{totalScore}</span>
          </div>

          <button
            onClick={onQuitToHome}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            יציאה
          </button>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className={`w-3.5 h-3.5 ${isCriticalTime ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={isCriticalTime ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
              {timeLeft} שניות
            </span>
          </div>
          {isCriticalTime && (
            <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              הזמן עומד להסתיים!
            </span>
          )}
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isCriticalTime
                ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-md shadow-red-500/50'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Target Word Hero Box */}
      <div className="bg-gradient-to-b from-[#162038] via-[#12192e] to-[#0c1222] border border-amber-500/25 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
        <div className="text-xs text-amber-300/80 font-medium mb-1">
          המילה המבוקשת:
        </div>

        <div className="py-2">
          <h2 className="font-biblical text-5xl sm:text-7xl font-black tracking-tight text-amber-100 drop-shadow-md select-none">
            {word}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-biblical">
          צטטו פסוק מחמישה חומשי תורה שמכיל את המילה <span className="text-amber-300 font-bold">"{word}"</span>
        </p>
      </div>

      {/* Input Area */}
      <form onSubmit={handleManualSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            dir="rtl"
            placeholder="הקלידו כאן את הפסוק או חלק ממנו... (Enter לשליחה, Shift+Enter לשורה חדשה)"
            className="w-full bg-[#10182b] border border-slate-700 focus:border-amber-500 rounded-2xl p-4 text-slate-100 text-base font-biblical placeholder:text-slate-500 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            * הבדיקה רצה רק בעת לחיצה על שלח, ללא השפעה על מהירות ההקלדה.
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/40 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>שלח ציטוט לבדיקה (Enter)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
