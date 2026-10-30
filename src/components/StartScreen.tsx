import React, { useRef } from 'react';
import { Play, Sparkles, Upload, RotateCcw, Download, CheckCircle2, ShieldCheck, FileText, Smartphone } from 'lucide-react';
import { StoredDailyGame } from '../types/game';

interface StartScreenProps {
  dateKey: string;
  versesCount: number;
  isCustomDb: boolean;
  todayCompletedGame: StoredDailyGame | null;
  onStartDaily: () => void;
  onStartPractice: () => void;
  onViewDailyResults: () => void;
  onUploadCustomFile: (file: File) => void;
  onResetToDefaultDb: () => void;
  onDownloadStandaloneHtml: () => void;
  onOpenApkModal: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  dateKey,
  versesCount,
  isCustomDb,
  todayCompletedGame,
  onStartDaily,
  onStartPractice,
  onViewDailyResults,
  onUploadCustomFile,
  onResetToDefaultDb,
  onDownloadStandaloneHtml,
  onOpenApkModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 py-4 animate-in fade-in duration-300">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-b from-[#162038] via-[#12192e] to-[#0c1222] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <span>אתגר יומי לתאריך {dateKey}</span>
          </div>

          <h1 className="font-biblical text-4xl sm:text-6xl font-black text-amber-100 tracking-tight drop-shadow-md">
            פסוקאי
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-xl font-biblical">
            משחק פסוקים מחמישה חומשי תורה. מקבלים מילה, ומצטטים פסוק מהתורה שמכיל אותה!
          </p>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
            בכל יום מקבלים כל השחקנים בדיוק את אותן <span className="text-amber-300 font-bold">10 מילים</span>, עם <span className="text-amber-300 font-bold">30 שניות</span> לכל מילה, ללא רמזים.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-7 w-full sm:w-auto">
            {todayCompletedGame ? (
              <button
                onClick={onViewDailyResults}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>צפה בסיכום היומי שלך ({todayCompletedGame.totalScore} / 1000)</span>
              </button>
            ) : (
              <button
                onClick={onStartDaily}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-950/50 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>התחל אתגר יומי (10 מילים)</span>
              </button>
            )}

            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>אימון חופשי בלי לחץ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Breakdown Card */}
      <div className="bg-[#10182b] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-right">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold font-biblical text-slate-100">
            חוקי המשחק ושיטת הניקוד
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          הניקוד מחושב לפי רמת השלמות של הציטוט והדיוק בהטיית המילה המבוקשת (לדוגמה עם המילה <span className="font-bold text-amber-300">"זית"</span>):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Tier 1 */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">1. פסוק מלא + הטייה מדויקת</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-biblical text-xs">100 נק'</span>
            </div>
            <p className="text-slate-300 font-biblical text-[11px] leading-relaxed">
              "אֶרֶץ חִטָּה וּשְׂעֹרָה וְגֶפֶן וּתְאֵנָה וְרִמּוֹן אֶרֶץ זֵית שֶׁמֶן וּדְבָשׁ"
            </p>
            <span className="text-[11px] text-emerald-300/80">כיסוי של 95% ומעלה מהפסוק, עם המילה בדיוק ("זית").</span>
          </div>

          {/* Tier 2 */}
          <div className="p-3.5 rounded-2xl bg-yellow-950/20 border border-yellow-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-yellow-400">2. פסוק מלא + הטייה שונה</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold font-biblical text-xs">75 נק'</span>
            </div>
            <p className="text-slate-300 font-biblical text-[11px] leading-relaxed">
              "זֵיתִים יִהְיוּ לְךָ בְּכָל גְּבוּלְךָ וְשֶׁמֶן לֹא תָסוּךְ כִּי יִשַּׁל זֵיתֶךָ"
            </p>
            <span className="text-[11px] text-yellow-300/80">פסוק מלא, אך המילה בהטייה שונה ברבים ("זיתים") או בסיומת ("זיתך").</span>
          </div>

          {/* Tier 3 */}
          <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400">3. ציטוט חלקי + הטייה מדויקת</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold font-biblical text-xs">90 × אחוז המילים</span>
            </div>
            <p className="text-slate-300 font-biblical text-[11px] leading-relaxed">
              "אֶרֶץ זֵית שֶׁמֶן וּדְבָשׁ"
            </p>
            <span className="text-[11px] text-blue-300/80">חלק מהפסוק הכולל את המילה בדיוק (לפחות 3 מילים מהפסוק).</span>
          </div>

          {/* Tier 4 */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">4. ציטוט חלקי + הטייה שונה</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-biblical text-xs">70 × אחוז המילים</span>
            </div>
            <p className="text-slate-300 font-biblical text-[11px] leading-relaxed">
              "זֵיתִים יִהְיוּ לְךָ בְּכָל גְּבוּלְךָ"
            </p>
            <span className="text-[11px] text-amber-300/80">חלק מהפסוק כשהמילה בהטייה שונה (לפחות 3 מילים מהפסוק).</span>
          </div>
        </div>

        {/* Policy note */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <p className="font-semibold text-amber-300">סובלנות לשגיאות הקלדה וכתיב:</p>
          <p>
            • אין הורדת נקודות על שגיאות הקלדה קלות (חילופי אות סמוכה, ט/ת, כ/ק, א/ע, ס/ש).
          </p>
          <p>
            • שוויון מלא לכתיב מלא/חסר (ציצית/ציצת, לדורותם/לדרתם), אותיות סופיות, וכינויי שם ה' (ה', יי, יהוה, אלוקים/אלהים).
          </p>
          <p className="text-rose-300">
            • ניקוד יורד אך ורק על השמטת מילים מהפסוק או החלפתן במילים שונות. אין פסוק או פג הזמן = 0 נקודות.
          </p>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-[#10182b] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold font-biblical text-slate-100">
              מאגר הפסוקים והפעלה אופליין
            </h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 font-medium">
            {versesCount.toLocaleString()} פסוקים
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isCustomDb ? (
            <span className="text-amber-300 font-medium">
              כעת פעיל מאגר מותאם אישית שנטען על ידך ונשמר בדפדפן (localStorage).
            </span>
          ) : (
            <span>
              כל 5,844 הפסוקים מחמשת חומשי תורה (בראשית, שמות, ויקרא, במדבר, דברים) מוטמעים במלואם בקוד וזמינים תמיד אופליין ללא רשת.
            </span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.text"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>העלאת קובץ שורות מקור|פסוק</span>
          </button>

          {isCustomDb && (
            <button
              onClick={onResetToDefaultDb}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-xs font-semibold text-rose-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>חזרה למאגר המובנה של התורה</span>
            </button>
          )}

          <button
            onClick={onOpenApkModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>התקנה לאנדרואיד (APK / PWA)</span>
          </button>

          <button
            onClick={onDownloadStandaloneHtml}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
            title="שמור קובץ HTML יחיד עצמאי להפעלה מקומית ללא שרת"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>שמור כקובץ HTML עצמאי</span>
          </button>
        </div>
      </div>

      {/* Footer Notes */}
      <footer className="text-center text-xs text-slate-400 space-y-1 py-2">
        <p>הטבלה שמורה במכשיר הזה בלבד (אין שרת)</p>
        <p className="text-[11px] text-slate-500">
          נוסח חמשת חומשי תורה מבוסס על מאגר ספרות הקודש סנונית / מקראנט
        </p>
      </footer>
    </div>
  );
};
