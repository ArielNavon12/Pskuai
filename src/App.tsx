import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { PlayingScreen } from './components/PlayingScreen';
import { RoundResultScreen } from './components/RoundResultScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { ApkInstallModal } from './components/ApkInstallModal';
import { TorahDatabase, torahEngine } from './utils/pasukaiEngine';
import { DEFAULT_TORAH_RAW_TEXT } from './data/defaultTorahText';
import { getTodayDateKey, getDailyWords, getRandomPracticeWords } from './utils/dailyWordsEngine';
import { usePWAInstall } from './utils/usePWAInstall';
import {
  getStoredDailyGame,
  saveStoredDailyGame,
  getCustomTorahText,
  saveCustomTorahText,
  clearCustomTorahText,
  getStoredTheme,
  setStoredTheme
} from './utils/storage';
import { generateStandaloneHtml } from './utils/exportHtml';
import { GameMode, RoundResult, StoredDailyGame } from './types/game';

type AppView = 'START' | 'PLAYING' | 'ROUND_RESULT' | 'GAME_OVER';

export default function App() {
  const dateKey = getTodayDateKey();
  const pwa = usePWAInstall();
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Active Torah Database State
  const [activeRawText, setActiveRawText] = useState<string>(() => {
    return getCustomTorahText() || DEFAULT_TORAH_RAW_TEXT;
  });

  const [isCustomDb, setIsCustomDb] = useState<boolean>(() => {
    return Boolean(getCustomTorahText());
  });

  const db = useMemo(() => {
    if (activeRawText === DEFAULT_TORAH_RAW_TEXT) {
      return torahEngine;
    }
    return new TorahDatabase(activeRawText);
  }, [activeRawText]);

  // Theme State
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>(() => getStoredTheme());

  useEffect(() => {
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    setStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'auto';
      return 'dark';
    });
  };

  // Check if today's daily challenge was already completed
  const [todayCompletedGame, setTodayCompletedGame] = useState<StoredDailyGame | null>(() => {
    return getStoredDailyGame(dateKey);
  });

  // Game Navigation & Session State
  const [view, setView] = useState<AppView>('START');
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null);

  // Running total score
  const totalScore = useMemo(() => {
    return roundResults.reduce((acc, r) => acc + r.evaluation.score, 0);
  }, [roundResults]);

  // Start Daily Challenge
  const handleStartDaily = useCallback(() => {
    const dailyWordsList = getDailyWords(dateKey, db);
    setWords(dailyWordsList);
    setGameMode('daily');
    setCurrentWordIndex(0);
    setRoundResults([]);
    setCurrentResult(null);
    setView('PLAYING');
  }, [dateKey, db]);

  // Start Practice Mode
  const handleStartPractice = useCallback(() => {
    const practiceWordsList = getRandomPracticeWords(10, db);
    setWords(practiceWordsList);
    setGameMode('practice');
    setCurrentWordIndex(0);
    setRoundResults([]);
    setCurrentResult(null);
    setView('PLAYING');
  }, [db]);

  // View today's completed daily game summary
  const handleViewDailyResults = () => {
    if (todayCompletedGame) {
      setRoundResults(todayCompletedGame.results);
      setGameMode('daily');
      setView('GAME_OVER');
    }
  };

  // Submit quote in current round (either manual or upon 30s timeout)
  const handleSubmitQuote = (quote: string, timedOut: boolean) => {
    const currentWord = words[currentWordIndex];
    const evaluation = db.evaluate(currentWord, quote, timedOut);

    const resultItem: RoundResult = {
      word: currentWord,
      userQuote: quote,
      evaluation,
      timeSpentSeconds: timedOut ? 30 : 0
    };

    setCurrentResult(resultItem);
    const updatedResults = [...roundResults, resultItem];
    setRoundResults(updatedResults);
    setView('ROUND_RESULT');
  };

  // Advance to next word or game over
  const handleNextWord = () => {
    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex(prev => prev + 1);
      setCurrentResult(null);
      setView('PLAYING');
    } else {
      // Completed all 10 words!
      if (gameMode === 'daily') {
        const completedGame: StoredDailyGame = {
          dateKey,
          totalScore: roundResults.reduce((acc, r) => acc + r.evaluation.score, 0),
          results: roundResults,
          completedAt: new Date().toISOString()
        };
        saveStoredDailyGame(completedGame);
        setTodayCompletedGame(completedGame);
      }
      setView('GAME_OVER');
    }
  };

  // Handle uploading custom Torah text file (מקור|פסוק)
  const handleUploadCustomFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.includes('|')) {
        saveCustomTorahText(text);
        setActiveRawText(text);
        setIsCustomDb(true);
        alert('קובץ הפסוקים נטען ונשמר בהצלחה!');
      } else {
        alert('שגיאה: הקובץ חייב להכיל שורות בפורמט מקור|פסוק');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default embedded Torah text
  const handleResetToDefaultDb = () => {
    clearCustomTorahText();
    setActiveRawText(DEFAULT_TORAH_RAW_TEXT);
    setIsCustomDb(false);
  };

  // Download standalone offline-ready HTML file
  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneHtml(activeRawText);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pasukai.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-main)] font-biblical">
      {/* Top Navbar */}
      <Navbar
        versesCount={db.verses.length}
        isCustomDb={isCustomDb}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onGoHome={() => setView('START')}
        showHomeButton={view !== 'START'}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-4 w-full">
        {view === 'START' && (
          <StartScreen
            dateKey={dateKey}
            versesCount={db.verses.length}
            isCustomDb={isCustomDb}
            todayCompletedGame={todayCompletedGame}
            onStartDaily={handleStartDaily}
            onStartPractice={handleStartPractice}
            onViewDailyResults={handleViewDailyResults}
            onUploadCustomFile={handleUploadCustomFile}
            onResetToDefaultDb={handleResetToDefaultDb}
            onDownloadStandaloneHtml={handleDownloadStandaloneHtml}
            onOpenApkModal={() => setIsApkModalOpen(true)}
          />
        )}

        {view === 'PLAYING' && words.length > 0 && (
          <PlayingScreen
            word={words[currentWordIndex]}
            wordIndex={currentWordIndex}
            totalWords={words.length}
            totalScore={totalScore}
            gameMode={gameMode}
            onSubmitQuote={handleSubmitQuote}
            onQuitToHome={() => setView('START')}
          />
        )}

        {view === 'ROUND_RESULT' && currentResult && (
          <RoundResultScreen
            result={currentResult}
            roundIndex={currentWordIndex}
            totalWords={words.length}
            onNextWord={handleNextWord}
          />
        )}

        {view === 'GAME_OVER' && (
          <GameOverScreen
            dateKey={dateKey}
            gameMode={gameMode}
            results={roundResults}
            onPlayPracticeAgain={handleStartPractice}
            onGoHome={() => setView('START')}
          />
        )}
      </main>

      {/* APK & PWA Install Modal */}
      <ApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        hasNativePrompt={pwa.hasNativePrompt}
        isInstalled={pwa.isInstalled}
        onPromptInstall={pwa.promptInstall}
        onDownloadStandaloneHtml={handleDownloadStandaloneHtml}
      />
    </div>
  );
}
