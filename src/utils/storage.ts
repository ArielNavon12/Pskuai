import { StoredDailyGame } from '../types/game';

const CUSTOM_TEXT_KEY = 'pasukai_custom_torah_text';
const THEME_KEY = 'pasukai_theme_mode';

export function getStoredDailyGame(dateKey: string): StoredDailyGame | null {
  try {
    const raw = localStorage.getItem(`pasukai_daily_${dateKey}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading daily game from localStorage:', e);
    return null;
  }
}

export function saveStoredDailyGame(game: StoredDailyGame): void {
  try {
    localStorage.setItem(`pasukai_daily_${game.dateKey}`, JSON.stringify(game));
  } catch (e) {
    console.error('Error saving daily game to localStorage:', e);
  }
}

export function getCustomTorahText(): string | null {
  try {
    return localStorage.getItem(CUSTOM_TEXT_KEY);
  } catch (e) {
    console.error('Error reading custom torah text from localStorage:', e);
    return null;
  }
}

export function saveCustomTorahText(text: string): boolean {
  try {
    localStorage.setItem(CUSTOM_TEXT_KEY, text);
    return true;
  } catch (e) {
    console.error('Error saving custom torah text to localStorage:', e);
    return false;
  }
}

export function clearCustomTorahText(): void {
  try {
    localStorage.removeItem(CUSTOM_TEXT_KEY);
  } catch (e) {
    console.error('Error clearing custom torah text from localStorage:', e);
  }
}

export function getStoredTheme(): 'auto' | 'light' | 'dark' {
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'auto') return val;
    return 'auto';
  } catch {
    return 'auto';
  }
}

export function setStoredTheme(theme: 'auto' | 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
