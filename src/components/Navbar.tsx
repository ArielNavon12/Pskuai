import React from 'react';
import { BookOpen, Moon, Sun, Home, Smartphone } from 'lucide-react';

interface NavbarProps {
  versesCount: number;
  isCustomDb: boolean;
  theme: 'auto' | 'light' | 'dark';
  onToggleTheme: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
  onOpenApkModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  versesCount,
  isCustomDb,
  theme,
  onToggleTheme,
  onGoHome,
  showHomeButton = false,
  onOpenApkModal
}) => {
  return (
    <header className="w-full border-b border-amber-500/20 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {showHomeButton && onGoHome && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
              title="חזרה למסך הבית"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-biblical text-2xl font-black tracking-tight text-amber-400 drop-shadow-sm">
                פסוקאי
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold hidden sm:inline-block">
                חמישה חומשי תורה
              </span>
            </div>
            <span className="text-[11px] text-slate-400 -mt-0.5">
              משחק פסוקים מהתורה (עובד ללא אינטרנט)
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* APK Install Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer"
            title="התקן כאפליקציית אנדרואיד (APK)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>התקן אפליקציה (APK)</span>
          </button>

          {/* Database indicator badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hidden sm:flex"
            title={isCustomDb ? 'מאגר מותאם אישית נטען מ-localStorage' : 'מאגר מובנה של חמשת חומשי תורה'}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">
              {versesCount.toLocaleString()} {isCustomDb ? '(מותאם)' : 'פסוקים'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title={`החלף מצב תצוגה (נוכחי: ${theme})`}
            aria-label="החלף ערכת נושא"
          >
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
