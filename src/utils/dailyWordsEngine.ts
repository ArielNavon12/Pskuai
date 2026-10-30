import { TorahDatabase, getWordSkeleton, getWordStem, isStopWord, cleanHebrewWord } from './pasukaiEngine';

export interface EligibleWordInfo {
  stem: string;
  word: string;
  stemCount: number;
  wordCount: number;
}

// In-memory cache of eligible word pool per database instance
const poolCache = new WeakMap<TorahDatabase, EligibleWordInfo[]>();

export function getEligibleWordsPool(db: TorahDatabase): EligibleWordInfo[] {
  if (poolCache.has(db)) {
    return poolCache.get(db)!;
  }

  const stemMap = new Map<string, Map<string, number>>();

  for (const v of db.verses) {
    for (const rawW of v.words) {
      const cleanW = cleanHebrewWord(rawW);
      if (cleanW.length < 3) continue;
      if (cleanW.startsWith('וי')) continue;
      if (isStopWord(cleanW)) continue;

      const skel = getWordSkeleton(cleanW);
      if (!skel || skel.length < 2) continue;
      const stem = getWordStem(skel);
      if (!stem) continue;

      if (!stemMap.has(stem)) {
        stemMap.set(stem, new Map());
      }
      const formCounts = stemMap.get(stem)!;
      formCounts.set(cleanW, (formCounts.get(cleanW) || 0) + 1);
    }
  }

  const eligible: EligibleWordInfo[] = [];

  for (const [stem, forms] of stemMap.entries()) {
    let totalCount = 0;
    let maxForm = '';
    let maxCount = 0;

    for (const [form, cnt] of forms.entries()) {
      totalCount += cnt;
      if (cnt > maxCount) {
        maxCount = cnt;
        maxForm = form;
      }
    }

    // Rules:
    // "בחר רק גזעים שמופיעים בין 4 ל-80 פעמים ושצורה אחת שלהם מופיעה לפחות 3 פעמים. מכל גזע בחר את הצורה הנפוצה ביותר."
    if (totalCount >= 4 && totalCount <= 80 && maxCount >= 3) {
      eligible.push({
        stem,
        word: maxForm,
        stemCount: totalCount,
        wordCount: maxCount
      });
    }
  }

  // Deterministic sort by word before seeding
  eligible.sort((a, b) => a.word.localeCompare(b.word, 'he'));
  poolCache.set(db, eligible);

  return eligible;
}

// 32-bit Mulberry32 PRNG
function mulberry32(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyWords(dateKey: string, db: TorahDatabase): string[] {
  const pool = getEligibleWordsPool(db);
  if (pool.length === 0) return [];

  const rng = mulberry32(stringToSeed(dateKey));
  const poolCopy = [...pool];

  // Fisher-Yates shuffle
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  return poolCopy.slice(0, 10).map(item => item.word);
}

export function getRandomPracticeWords(count: number = 10, db: TorahDatabase): string[] {
  const pool = getEligibleWordsPool(db);
  if (pool.length === 0) return [];

  const poolCopy = [...pool];
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }

  return poolCopy.slice(0, count).map(item => item.word);
}
