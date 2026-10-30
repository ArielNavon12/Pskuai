import React, { useState } from 'react';
import { Trophy, Share2, Sparkles, Home, Check, Copy } from 'lucide-react';
import { RoundResult, getScoreEmoji, GameMode } from '../types/game';

interface GameOverScreenProps {
  dateKey: string;
  gameMode: GameMode;
  results: RoundResult[];
  onPlayPracticeAgain: () => void;
  onGoHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  dateKey,
  gameMode,
  results,
  onPlayPracticeAgain,
  onGoHome
}) => {
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  const totalScore = results.reduce((acc, r) => acc + r.evaluation.score, 0);
  const emojiSquares = results.map(r => getScoreEmoji(r.evaluation.score)).join(' ');

  const shareText = `פסוקאי | ${gameMode === 'daily' ? `אתגר יומי (${dateKey})` : 'אימון חופשי'}
ניקוד: ${totalScore} / 1000
${emojiSquares}
משחק פסוקים מהתורה`;

  const handleCopyShare = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        setShowManualCopy(true);
      }
    } catch {
      setShowManualCopy(true);
    }
  };

  const getScoreMessage = () => {
    if (totalScore >= 950) return 'עילוי בתורה! שליטה מופתית בפסוקי החומש!';
    if (totalScore >= 800) return 'מצוין ביותר! בקיאות מרשימה בתורה!';
    if (totalScore >= 600) return 'תוצאה יפה מאוד! ידע נרחב בפסוקים!';
    if (totalScore >= 400) return 'כל הכבוד! ציטוטים יפים מאוד.';
    return 'התחלה טובה! מחר יום חדש של אתגרים.';
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 py-4 animate-in fade-in duration-200 text-right">
      {/* Hero Victory Card */}
      <div className="bg-gradient-to-b from-[#18233d] via-[#12192e] to-[#0c1222] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>{gameMode === 'daily' ? `סיכום אתגר יומי (${dateKey})` : 'סיכום אימון חופשי'}</span>
        </div>

        <div className="py-2">
          <div className="text-xs text-slate-400">סכום סופי:</div>
          <div className="font-biblical text-6xl sm:text-7xl font-black text-amber-100 tracking-tight drop-shadow-md">
            {totalScore}
            <span className="text-2xl sm:text-3xl font-normal text-amber-300/60 mr-2">/ 1000</span>
          </div>
        </div>

        <p className="text-sm font-biblical text-amber-300 font-semibold mt-1">
          {getScoreMessage()}
        </p>

        {/* Emoji Grid Display */}
        <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl inline-block font-mono text-xl sm:text-2xl tracking-wider select-all">
          {emojiSquares}
        </div>

        {/* Share Button */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={handleCopyShare}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'התוצאה הועתקה ללוח!' : 'העתק לשיתוף'}</span>
          </button>

          {showManualCopy && (
            <div className="w-full mt-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-right space-y-2">
              <span className="text-xs text-slate-300 block">העתקה אוטומטית לא נתמכת, העתק מכאן:</span>
              <textarea
                readOnly
                value={shareText}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 select-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Breakdown list of the 10 words */}
      <div className="bg-[#10182b] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-3">
        <h3 className="font-biblical font-bold text-base text-slate-100 border-b border-slate-800 pb-2">
          פירוט המילים והניקוד:
        </h3>

        <div className="divide-y divide-slate-800/80">
          {results.map((res, i) => {
            const emoji = getScoreEmoji(res.evaluation.score);
            return (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-base select-none">{emoji}</span>
                  <span className="text-slate-400 text-[11px] w-5">{i + 1}.</span>
                  <span className="font-biblical font-bold text-slate-100 text-base">{res.word}</span>
                  {res.evaluation.matchedVerse && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      ({res.evaluation.matchedVerse.ref})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {res.evaluation.tier === 1 && 'פסוק מלא'}
                    {res.evaluation.tier === 2 && 'הטייה שונה'}
                    {res.evaluation.tier === 3 && 'חלקי'}
                    {res.evaluation.tier === 4 && 'חלקי (שונה)'}
                    {res.evaluation.tier === 5 && '0 נק\''}
                  </span>
                  <span className="font-biblical font-bold text-amber-300 text-sm min-w-[50px] text-left">
                    +{res.evaluation.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onPlayPracticeAgain}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>שחק אימון חופשי</span>
        </button>

        <button
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>חזרה למסך הבית</span>
        </button>
      </div>

      {/* Footer note */}
      <footer className="text-center text-xs text-slate-400 space-y-1 py-2">
        <p>הטבלה שמורה במכשיר הזה בלבד (אין שרת)</p>
      </footer>
    </div>
  );
};
