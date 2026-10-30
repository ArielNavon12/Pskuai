import React, { useEffect } from 'react';
import { CheckCircle2, Award, XCircle, ArrowLeft, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { RoundResult } from '../types/game';
import { stripVowelsAndPunctuation } from '../utils/pasukaiEngine';

interface RoundResultScreenProps {
  result: RoundResult;
  roundIndex: number;
  totalWords: number;
  onNextWord: () => void;
}

export const RoundResultScreen: React.FC<RoundResultScreenProps> = ({
  result,
  roundIndex,
  totalWords,
  onNextWord
}) => {
  const { evaluation, word, userQuote } = result;
  const isLastWord = roundIndex + 1 >= totalWords;

  // Listen for Enter key to advance quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNextWord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextWord]);

  // Color theme by score tier
  const getTheme = () => {
    switch (evaluation.tier) {
      case 1:
        return {
          border: 'border-emerald-500/40',
          bg: 'from-emerald-950/40 to-slate-900',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
          title: `ניקוד מלא! (100 נקודות)`
        };
      case 2:
        return {
          border: 'border-yellow-500/40',
          bg: 'from-yellow-950/40 to-slate-900',
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: <Award className="w-7 h-7 text-yellow-400" />,
          title: `פסוק מלא בהטייה שונה (75 נקודות)`
        };
      case 3:
        return {
          border: 'border-blue-500/40',
          bg: 'from-blue-950/40 to-slate-900',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: <Award className="w-7 h-7 text-blue-400" />,
          title: `ציטוט חלקי מדויק (${evaluation.score} נקודות)`
        };
      case 4:
        return {
          border: 'border-amber-600/40',
          bg: 'from-amber-950/40 to-slate-900',
          badgeBg: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
          icon: <Award className="w-7 h-7 text-amber-400" />,
          title: `ציטוט חלקי בהטייה שונה (${evaluation.score} נקודות)`
        };
      default:
        return {
          border: 'border-rose-500/40',
          bg: 'from-rose-950/40 to-slate-900',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-7 h-7 text-rose-400" />,
          title: `לא הוענק ניקוד (0 נקודות)`
        };
    }
  };

  const theme = getTheme();
  const matchedVerse = evaluation.matchedVerse;
  const exampleVerse = evaluation.exampleVerse;

  // Split vocalized verse words
  const vocalizedWords = matchedVerse ? matchedVerse.vocalizedText.split(' ').filter(Boolean) : [];
  const exampleVocalizedWords = exampleVerse ? exampleVerse.vocalizedText.split(' ').filter(Boolean) : [];

  return (
    <div className="w-full max-w-2xl flex flex-col gap-5 py-4 animate-in fade-in duration-200 text-right">
      {/* Timeout Alert Banner if applicable */}
      {evaluation.timedOut && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">הזמן נגמר, הציטוט נשלח אוטומטית.</span>
        </div>
      )}

      {/* Main Result Card */}
      <div className={`bg-gradient-to-b ${theme.bg} border ${theme.border} rounded-3xl p-5 sm:p-7 shadow-xl space-y-5`}>
        {/* Header: Score & Reason */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 shrink-0">
              {theme.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold font-biblical text-slate-100">
                {theme.title}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {evaluation.reason}
              </p>
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-[11px] text-slate-400">מילה מבוקשת:</div>
            <div className="font-biblical text-xl font-black text-amber-300">"{word}"</div>
          </div>
        </div>

        {/* Block 1: "מה ציטטת" */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>מה ציטטת:</span>
            {userQuote.trim() ? (
              <span className="text-[11px] text-slate-400">
                {evaluation.userWordsDetails.filter(w => w.isMatch).length} מתוך {evaluation.userWordsDetails.length} מילים תואמות
              </span>
            ) : null}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-base font-biblical leading-relaxed">
            {evaluation.userWordsDetails.length > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {evaluation.userWordsDetails.map((item, idx) => (
                  <span
                    key={idx}
                    className={
                      item.isMatch
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 line-through decoration-rose-400 decoration-2'
                    }
                  >
                    {item.userWord}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">לא הוקלד ציטוט כלל.</span>
            )}
          </div>
        </div>

        {/* Block 2: "הפסוק המלא" (Scored verse, or closest verse if score 0) */}
        {matchedVerse && !evaluation.isOnlyTargetWordTyped && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                הפסוק המלא ({matchedVerse.ref}):
              </span>
              <span className="text-amber-300/80 text-[11px]">עם ניקוד</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-lg font-biblical leading-loose text-slate-200">
              <div className="flex flex-wrap gap-x-2 gap-y-1.5">
                {vocalizedWords.map((vWord, vi) => {
                  const isMatchedByQuote = evaluation.verseWordsMatchedIndices.has(vi);
                  const isTarget = evaluation.targetWordInVerseIndex === vi;

                  let colorClass = isMatchedByQuote ? 'text-emerald-400 font-bold' : 'text-rose-400';
                  let underlineClass = isTarget ? 'underline decoration-amber-400 decoration-2 font-black' : '';

                  return (
                    <span
                      key={vi}
                      className={`${colorClass} ${underlineClass}`}
                      title={isTarget ? `המילה המבוקשת ("${word}")` : isMatchedByQuote ? 'צוטט נכון' : 'הושמט מהציטוט'}
                    >
                      {vWord}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Block 3: Example verse / Warning box */}
        {evaluation.isOnlyTargetWordTyped ? (
          <div className="space-y-3 pt-1 border-t border-rose-500/30">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>לא ניתן להקליד את המילה המבוקשת בלבד, ללא הקשר בפסוק כלשהו</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                מטרת המשחק היא לצטט פסוק שלם (או לפחות ביטוי עם מילים נוספות מתוכו) מחמישה חומשי תורה המכיל את המילה <span className="text-amber-300 font-bold">"{word}"</span>.
              </p>
              {exampleVerse && (
                <div className="pt-2.5 border-t border-rose-500/30 space-y-1.5">
                  <span className="text-xs font-semibold text-amber-300 block">
                    לדוגמה, פסוק מתאים מהתורה ({exampleVerse.ref}):
                  </span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-base font-biblical text-slate-200">
                    {exampleVocalizedWords.map((vWord, vi) => {
                      const cleanW = stripVowelsAndPunctuation(vWord);
                      const isTarget = cleanW.includes(word) || word.includes(cleanW);
                      return (
                        <span
                          key={vi}
                          className={isTarget ? 'text-amber-300 font-black underline decoration-amber-400 decoration-2' : 'text-slate-300'}
                        >
                          {vWord}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          (evaluation.score === 0 || !matchedVerse || evaluation.targetWordInVerseIndex === null) && exampleVerse && (
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  פסוק לדוגמה שמכיל את המילה ({exampleVerse.ref}):
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-base font-biblical leading-relaxed text-slate-200">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {exampleVocalizedWords.map((vWord, vi) => {
                    const cleanW = stripVowelsAndPunctuation(vWord);
                    const isTarget = cleanW.includes(word) || word.includes(cleanW);
                    return (
                      <span
                        key={vi}
                        className={isTarget ? 'text-amber-300 font-black underline decoration-amber-400 decoration-2' : 'text-slate-300'}
                      >
                        {vWord}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* Color Legend */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300">ירוק:</span> מילה תואמת לפסוק
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block text-rose-400 line-through">אדום</span>
            <span>בציטוט: שגויה/מיותרת</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block text-rose-400 font-bold">אדום</span>
            <span>בפסוק: הושמטה</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="underline decoration-amber-400 decoration-2 text-amber-300 font-bold">קו תחתון:</span>
            <span>המילה המבוקשת</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 text-center">
          <button
            onClick={onNextWord}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isLastWord ? 'לסיכום המשחק (Enter)' : 'המילה הבאה (Enter)'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
