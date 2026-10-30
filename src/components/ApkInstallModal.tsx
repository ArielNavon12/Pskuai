import React, { useState } from 'react';
import { X, Smartphone, Download, CheckCircle, ExternalLink, Globe, Copy, Check, ShieldAlert } from 'lucide-react';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasNativePrompt: boolean;
  isInstalled: boolean;
  onPromptInstall: () => void;
  onDownloadStandaloneHtml: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({
  isOpen,
  onClose,
  hasNativePrompt,
  isInstalled,
  onPromptInstall,
  onDownloadStandaloneHtml
}) => {
  const [activeTab, setActiveTab] = useState<'device' | 'googleplay'>('googleplay');
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-l5hto5mvujddaeh6kylgif-8579603460.europe-west2.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-right flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-biblical text-slate-100">
                העלאה ל-Google Play והתקנת אנדרואיד
              </h2>
              <span className="text-xs text-amber-300/80">
                פרסום בחנות האפליקציות או התקנה ישירה במכשיר
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('googleplay')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'googleplay'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            פרסום בחנות Google Play (AAB)
          </button>
          <button
            onClick={() => setActiveTab('device')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'device'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            התקנה ישירה במכשיר (WebAPK)
          </button>
        </div>

        {/* Tab 1: Google Play Publishing Guide & Package Generation */}
        {activeTab === 'googleplay' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
            {/* Direct Package Generation Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm">יצירת חבילת AAB / APK מוכנה ל-Google Play</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold">חינם</span>
              </div>
              <p>
                חנות Google Play דורשת חבילת <strong>Android App Bundle (.aab)</strong> חתומה. האפליקציה כוללת תצורת PWA, Manifest ואייקונים תקניים מלאים. ניתן להפיק את חבילת ה-AAB המוכנה בלחיצה אחת:
              </p>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>הורד חבילת AAB ל-Google Play דרך PWABuilder</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleCopyUrl}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="העתק את כתובת האפליקציה"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? 'הועתק!' : 'העתק כתובת'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-100 text-sm block border-b border-slate-800 pb-2">
                שלבי הפרסום בחשבון Google Play Console:
              </span>

              <div className="space-y-2 text-[12px] text-slate-300">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <p>
                    <strong>הפקת הקובץ:</strong> לוחצים על הכפתור למעלה לפתיחת PWABuilder, לוחצים על <em>"Package for Android"</em>, ומורידים את קובץ ה-<code>.aab</code>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <p>
                    <strong>כניסה ל-Console:</strong> נכנסים אל <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">Google Play Console</a> עם חשבון המפתח שלך.
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <p>
                    <strong>יצירת אפליקציה חדשה:</strong> לוחצים על "Create app", מזינים את השם <em>"פסוקאי"</em> ושפת ברירת המחדל (עברית).
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                  <p>
                    <strong>העלאת החבילה:</strong> בלשונית <em>"Production"</em> (או Internal testing), יוצרים מהדורה (Release) וגוררים לשם את קובץ ה-<code>.aab</code> שהורדתם!
                  </p>
                </div>
              </div>
            </div>

            {/* Downloadable Ready Project and Keystore */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-100 text-sm block border-b border-slate-800 pb-2">
                קבצי פרויקט אנדרואיד ומפתח חתימה מוכנים להורדה:
              </span>
              <p className="text-[11px] text-slate-400">
                הכנו עבורך פרויקט Android Studio מלא ומפתח חתימה רשמי (Keystore) המוכן לבנייה מיידית:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href="/pasukai-android-project.zip"
                  download="pasukai-android-project.zip"
                  className="py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>הורד פרויקט Android מלא (ZIP)</span>
                </a>

                <a
                  href="/pasukai-release-key.jks"
                  download="pasukai-release-key.jks"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>הורד מפתח Keystore (.jks)</span>
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1">
                <div>פרטי מפתח: <span className="text-amber-400">alias: pasukai</span> | <span className="text-amber-400">password: pasukai123</span></div>
                <div className="text-[10px] text-slate-400 break-all">SHA256: 19:4E:8B:33:B3:98:A5:B7:D7:6C:1C:92:44:11:19:6A:95:8F:59:80:96:28:A6:A6:B6:9B:E7:12:DC:3E:25:26</div>
              </div>
            </div>

            {/* Note on Google Play Console Requirement */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                * העלאה ישירה לחנות גוגל פליי מתבצעת מתוך חשבון המפתח האישי שלך ב-Google Play Console (בהתאם למדיניות גוגל, נדרש חשבון מפתח מאומת). קובץ ה-AAB וה-Digital Asset Links מוכנים לחלוטין להעלאה מיידית.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Device Installation (WebAPK) */}
        {activeTab === 'device' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
            {isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>האפליקציה כבר מותקנת במכשיר זה ותפעל גם ללא חיבור לאינטרנט!</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">התקנה ישירה במכשיר ללא חנות (WebAPK)</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-semibold">מיידי</span>
                </div>
                <p>
                  ניתן להתקין את המשחק ישירות על כל טלפון אנדרואיד. מערכת אנדרואיד מייצרת ומתקינה קובץ <strong>WebAPK מקומי</strong> עם סמל ייעודי במסך הבית, מסך מלא ועבודה מלאה ללא אינטרנט:
                </p>

                {hasNativePrompt ? (
                  <button
                    onClick={() => {
                      onPromptInstall();
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>התקן עכשיו ישירות למכשיר</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                    <span className="font-bold text-amber-200 block">התקנה ידנית בדפדפן (Chrome / Samsung):</span>
                    <p>1. פתחו את תפריט 3 הנקודות <strong>⋮</strong> בראש הדפדפן.</p>
                    <p>2. לחצו על <strong>"התקן אפליקציה"</strong> או <strong>"הוסף למסך הבית"</strong>.</p>
                    <p>3. האפליקציה תותקן כאפליקציית אנדרואיד עצמאית במסך הבית.</p>
                  </div>
                )}
              </div>
            )}

            {/* Offline standalone HTML file */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-100 text-xs block">קובץ HTML עצמאי להפעלה מקומית:</span>
              <p className="text-[11px] text-slate-400">
                קובץ יחיד המכיל את כל 5,844 הפסוקים ואת המשחק כולו, שניתן לפתוח ישירות בכל סייר קבצים באנדרואיד:
              </p>
              <button
                onClick={() => {
                  onDownloadStandaloneHtml();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>הורד קובץ HTML מלא למכשיר (pasukai.html)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
