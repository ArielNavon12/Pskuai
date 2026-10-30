import { DEFAULT_TORAH_RAW_TEXT } from '../data/defaultTorahText';

export interface VerseRecord {
  ref: string;          // e.g. "בראשית א א"
  vocalizedText: string;// vocalized clean text
  cleanText: string;    // unvocalized letters only
  words: string[];      // unvocalized words
  skeletons: string[];  // word skeletons
  stems: string[];      // word stems
}

export interface WordMatchDetails {
  userWord: string;
  matchedVerseWordIndex: number | null; // index in verse, or null if extra/wrong
  isMatch: boolean;
}

export interface EvaluationOutcome {
  score: number;
  tier: 1 | 2 | 3 | 4 | 5;
  reason: string;
  isFullVerse: boolean;
  isExactInflection: boolean;
  matchedVerse: VerseRecord | null;
  exampleVerse: VerseRecord | null;
  userWordsDetails: WordMatchDetails[];
  verseWordsMatchedIndices: Set<number>;
  targetWordInVerseIndex: number | null;
  coverageRatio: number;
  timedOut?: boolean;
  isOnlyTargetWordTyped?: boolean;
}

// Hebrew Stop Words
export const BASE_STOP_WORDS = new Set([
  'את', 'אל', 'על', 'אשר', 'כי', 'לא', 'כל', 'הוא', 'היא', 'יהוה', 'אלהים',
  'זה', 'זאת', 'אלה', 'אלו', 'אם', 'גם', 'פן', 'רק', 'אך', 'כה', 'פה', 'שם',
  'עתה', 'הנה', 'למה', 'מדוע', 'מה', 'מי', 'בי', 'בו', 'בה', 'בנו', 'בם', 'בהם',
  'לי', 'לו', 'לה', 'לנו', 'להם', 'לכם', 'עמדי', 'עמו', 'עמה', 'עמם', 'עמכם',
  'מאת', 'מאתו', 'מאתה', 'מאתם', 'עליו', 'עליה', 'עליהם', 'עלינו', 'אליו',
  'אליה', 'אליהם', 'אלינו', 'אותי', 'אותו', 'אותה', 'אותם', 'אותנו', 'אתכם',
  'אתכן', 'עדי', 'עד', 'בין', 'אחרי', 'תחת', 'טרם', 'בטרם', 'עקב', 'יען',
  'כן', 'הם', 'המה', 'אנוכי', 'אנכי', 'אני', 'אתה', 'אתם', 'אנחנו',
  'היה', 'יהיה', 'היו', 'תהיה', 'ויהי', 'והיה'
]);

export function isStopWord(cleanWord: string): boolean {
  if (BASE_STOP_WORDS.has(cleanWord)) return true;
  const stripped = cleanWord.replace(/^[ובהלמכש]{1,2}/, '');
  if (BASE_STOP_WORDS.has(stripped)) return true;
  return false;
}

export function hasNikud(word: string): boolean {
  return /[\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C7]/.test(word);
}

export function cleanHebrewWord(w: string): string {
  return w.replace(/[\u0591-\u05C7]/g, '').replace(/[^\u05D0-\u05EA]/g, '');
}

/**
 * Strips nikud, ta'amim, punctuation to leave pure Hebrew letters.
 */
export function stripVowelsAndPunctuation(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[-־–—:׃\.,;!?'"״״׳`(){}\[\]/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses and cleans Torah text formatted as lines of "מקור|פסוק".
 * Rules:
 * 1. כתיב בסוגריים לפני קרי: למחוק מה שבסוגריים ולהשאיר קרי מנוקד
 * 2. כל מילה בלי ניקוד היא סימון עלייה או הערה: למחוק
 */
export function cleanRawVerseLine(text: string): string {
  let s = text;

  // Parens cleaning for ketiv / kri
  s = s.replace(/\([^)]*\)\s*([^\s()]+)/g, (_m, kri) => {
    return hasNikud(kri) ? ` ${kri} ` : '';
  });
  s = s.replace(/([^\s()]+)\s*\(([^)]+)\)/g, (_m, ketiv, kri) => {
    if (hasNikud(kri)) return ` ${kri} `;
    return ` ${ketiv} `;
  });
  s = s.replace(/\([^)]*\)/g, ' ');

  // Replace hyphens & punctuation with spaces
  s = s.replace(/[-־–—:׃\.,;!?'"״״׳`(){}\[\]/\\]/g, ' ');

  const tokens = s.split(/\s+/).filter(Boolean);
  const result: string[] = [];

  for (const rawToken of tokens) {
    const cleanToken = rawToken.replace(/[-־–—:׃\.,;!?'"״״׳`(){}\[\]/\\]/g, '').trim();
    if (!cleanToken) continue;

    const hebrewLetters = cleanToken.replace(/[^\u0590-\u05FF]/g, '');
    if (!hebrewLetters) continue;

    // Filter out unvocalized tokens (aliyah marks / editorial comments)
    if (!hasNikud(cleanToken)) {
      continue;
    }

    result.push(cleanToken);
  }

  return result.join(' ');
}

/**
 * Word Skeleton definition:
 * 1. Replace final letters to normal: ך->כ, ם->מ, ן->נ, ף->פ, ץ->צ
 * 2. ן in middle of word counts as ו
 * 3. Delete י and ו (ktiv male/chaser)
 * 4. Convert "אלק" at start of word (after single prefix) to "אלה"
 */
export function getWordSkeleton(rawWord: string): string {
  let w = rawWord
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[-־–—:׃\.,;!?'"״״׳`(){}\[\]/\\]/g, '')
    .trim();
  if (!w) return '';

  // Final letters to normal
  w = w
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ');

  // Convert אלק -> אלה at start or after single prefix
  w = w.replace(/^([ובהלמכש]?)אלק/, '$1אלה');

  // ן באמצע מילה נחשב כ-ו
  if (w.length >= 3) {
    const first = w[0];
    const last = w[w.length - 1];
    const middle = w.slice(1, -1).replace(/נ/g, 'ו');
    w = first + middle + last;
  }

  // Delete interior and exterior י and ו
  w = w.replace(/[יו]/g, '');

  return w;
}

/**
 * Word Stem definition:
 * "מהשלד: להסיר תחילית אחת מ"ובהלמכש" אם אורך השלד מעל 3, ולהסיר סיומת אחת מ"מנהתכ" אם אורכו מעל 2."
 */
export function getWordStem(skeleton: string): string {
  let s = skeleton;
  if (s.length > 3 && /^[ובהלמכש]/.test(s)) {
    s = s.slice(1);
  }
  if (s.length > 2 && /[מנהתכ]$/.test(s)) {
    s = s.slice(0, -1);
  }
  return s;
}

// God's name checker:
// שם ה': כל אחד מ"ה", "ה'", "ה׳", "השם", "יי", "ד'", "הויה", "אדני", "אדוני", "יהוה"
// (גם עם תחילית, וגם "לה'" או "בה'" במקום "ליהוה" או "ביהוה") תואם לכל "יהוה" או "אדני" בפסוק.
export function isGodsNameVariant(word: string): { isGod: boolean; prefix: string } {
  const clean = word.replace(/['״׳]/g, '').trim();
  // Match prefix
  const m = clean.match(/^([ובהלמכש]?)(ה|ד|יי|השם|הויה|אדני|אדוני|יהוה)$/);
  if (m) {
    return { isGod: true, prefix: m[1] };
  }
  return { isGod: false, prefix: '' };
}

export function isVerseGodsName(word: string): { isGod: boolean; prefix: string } {
  const clean = word.replace(/[\u0591-\u05C7]/g, '').replace(/[^\u05D0-\u05EA]/g, '');
  const m = clean.match(/^([ובהלמכש]?)(יהוה|אדני)$/);
  if (m) {
    return { isGod: true, prefix: m[1] };
  }
  return { isGod: false, prefix: '' };
}

/**
 * Fast Damerau-Levenshtein distance
 */
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const prevRow = new Array(n + 1);
  const currRow = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    const aChar = a[i - 1];
    for (let j = 1; j <= n; j++) {
      const bChar = b[j - 1];
      const cost = aChar === bChar ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,       // insertion
        prevRow[j] + 1,           // deletion
        prevRow[j - 1] + cost     // substitution
      );
      // Damerau adjacent transposition
      if (i > 1 && j > 1 && aChar === b[j - 2] && a[i - 2] === bChar) {
        currRow[j] = Math.min(currRow[j], prevRow[j - 2] + 1);
      }
    }
    for (let k = 0; k <= n; k++) {
      prevRow[k] = currRow[k];
    }
  }
  return prevRow[n];
}

/**
 * Tolerant Word Matching:
 * Compares player's word with verse word:
 * - Equal skeletons
 * - Prefix difference on ONE side only: ו, ה, ב, ל, מ, כ, ש (not both at once)
 * - Words >= 4 letters: after normalizing ט/ת, כ/ק, א/ע, ס/ש, edit distance <= 1 (<= 2 for 6+ letters)
 * - God's name rules
 * - Short words (<= 3 letters) must match exactly (except prefix and God's name rules)
 */
export function areWordsMatching(userWord: string, verseWord: string): boolean {
  if (userWord === verseWord) return true;

  // 1. Check God's name
  const vGod = isVerseGodsName(verseWord);
  if (vGod.isGod) {
    const uGod = isGodsNameVariant(userWord);
    if (uGod.isGod) {
      // Either prefixes match, or one side has none, or both belong to holy name
      return true;
    }
  }

  const sUser = getWordSkeleton(userWord);
  const sVerse = getWordSkeleton(verseWord);

  if (!sUser || !sVerse) return false;

  // 2. Exact skeletons
  if (sUser === sVerse) return true;

  // 3. Single prefix on ONE side only: ו, ה, ב, ל, מ, כ, ש
  // "לא בשני הצדדים בבת אחת, כדי ש'בארץ' ו'לארץ' יישארו שונות"
  if (sUser.length === sVerse.length + 1 && /^[ובהלמכש]/.test(sUser) && sUser.slice(1) === sVerse) {
    return true;
  }
  if (sVerse.length === sUser.length + 1 && /^[ובהלמכש]/.test(sVerse) && sVerse.slice(1) === sUser) {
    return true;
  }

  // 4. Short words (<= 3 letters in skeleton) are required to match exactly in skeleton
  const minLen = Math.min(sUser.length, sVerse.length);
  const maxLen = Math.max(sUser.length, sVerse.length);
  if (minLen <= 3) {
    return false;
  }

  // Length difference > 2 is not a typo
  if (maxLen - minLen > 2) return false;

  // 5. In words of 4+ letters: normalize confusions (ט/ת, כ/ק, א/ע, ס/ש) and check edit distance
  const normU = sUser
    .replace(/ט/g, 'ת')
    .replace(/ק/g, 'כ')
    .replace(/ע/g, 'א')
    .replace(/ס/g, 'ש');

  const normV = sVerse
    .replace(/ט/g, 'ת')
    .replace(/ק/g, 'כ')
    .replace(/ע/g, 'א')
    .replace(/ס/g, 'ש');

  if (normU === normV) return true;

  const dist = damerauLevenshtein(normU, normV);
  if (minLen >= 6) {
    return dist <= 2;
  } else {
    // 4 to 5 letters
    return dist <= 1;
  }
}

/**
 * Checks whether a word matches targetWord:
 * Returns:
 * - 'exact': same skeleton, including single prefix difference only (e.g. ארץ / הארץ)
 * - 'inflected': different inflection (same stem)
 * - null: no match
 */
export function matchTargetWordClassification(
  word: string,
  targetWord: string
): 'exact' | 'inflected' | null {
  const sWord = getWordSkeleton(word);
  const sTarget = getWordSkeleton(targetWord);
  if (!sWord || !sTarget) return null;

  // Exact skeleton
  if (sWord === sTarget) return 'exact';

  // Difference of single prefix only: ארץ / הארץ
  if (sWord.length === sTarget.length + 1 && /^[ובהלמכש]/.test(sWord) && sWord.slice(1) === sTarget) {
    return 'exact';
  }
  if (sTarget.length === sWord.length + 1 && /^[ובהלמכש]/.test(sTarget) && sTarget.slice(1) === sWord) {
    return 'exact';
  }

  // Check stem:
  // "שתי מילים הן "הטייה שונה" אם הגזע שלהן שווה (גם בשילוב של גזע עם הסרת סיומת בלבד)"
  const stemWord = getWordStem(sWord);
  const stemTarget = getWordStem(sTarget);

  if (stemWord === stemTarget) {
    return 'inflected';
  }

  // Also check if word with suffix removed matches stem of target
  const sWordNoSuffix = sWord.length > 2 && /[מנהתכ]$/.test(sWord) ? sWord.slice(0, -1) : sWord;
  const sTargetNoSuffix = sTarget.length > 2 && /[מנהתכ]$/.test(sTarget) ? sTarget.slice(0, -1) : sTarget;
  if (sWordNoSuffix === stemTarget || stemWord === sTargetNoSuffix || sWordNoSuffix === sTargetNoSuffix) {
    return 'inflected';
  }

  return null;
}

/**
 * Database index structure
 */
export class TorahDatabase {
  public verses: VerseRecord[] = [];
  public skeletonIndex: Map<string, number[]> = new Map();

  constructor(rawLinesText: string) {
    this.loadText(rawLinesText);
  }

  public loadText(rawLinesText: string) {
    this.verses = [];
    this.skeletonIndex.clear();

    const lines = rawLinesText.split('\n');
    let idx = 0;

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length < 2) continue;
      const ref = parts[0].trim();
      const rawVerse = parts[1].trim();
      if (!ref || !rawVerse) continue;

      const vocalizedClean = cleanRawVerseLine(rawVerse);
      if (!vocalizedClean) continue;

      const cleanText = stripVowelsAndPunctuation(vocalizedClean);
      const words = cleanText.split(' ').filter(Boolean);
      const skeletons = words.map(getWordSkeleton);
      const stems = skeletons.map(getWordStem);

      const record: VerseRecord = {
        ref,
        vocalizedText: vocalizedClean,
        cleanText,
        words,
        skeletons,
        stems
      };

      this.verses.push(record);

      for (const sk of skeletons) {
        if (sk.length < 2) continue;
        let list = this.skeletonIndex.get(sk);
        if (!list) {
          list = [];
          this.skeletonIndex.set(sk, list);
        }
        if (list.length === 0 || list[list.length - 1] !== idx) {
          list.push(idx);
        }
      }

      idx++;
    }
  }

  /**
   * Find candidate verses for an input quote.
   */
  public findCandidates(inputWords: string[], targetWord: string): VerseRecord[] {
    const candidateHitCounts = new Map<number, number>();

    const targetSkel = getWordSkeleton(targetWord);
    const targetStem = getWordStem(targetSkel);

    // Verses matching target word or its stem
    if (this.skeletonIndex.has(targetSkel)) {
      for (const vi of this.skeletonIndex.get(targetSkel)!) {
        candidateHitCounts.set(vi, (candidateHitCounts.get(vi) || 0) + 10);
      }
    }

    // Tally input words
    for (const w of inputWords) {
      const sk = getWordSkeleton(w);
      if (sk.length < 2) continue;
      const matches = this.skeletonIndex.get(sk);
      if (matches) {
        for (const vi of matches) {
          candidateHitCounts.set(vi, (candidateHitCounts.get(vi) || 0) + 1);
        }
      }
    }

    // Sort candidate indices
    const sorted = Array.from(candidateHitCounts.entries())
      .filter(([_, count]) => count >= 2 || inputWords.length <= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([vi]) => this.verses[vi]);

    // Fallback: if empty, find any verse containing targetWord
    if (sorted.length === 0) {
      for (const v of this.verses) {
        if (v.skeletons.includes(targetSkel) || v.stems.includes(targetStem)) {
          sorted.push(v);
          if (sorted.length >= 20) break;
        }
      }
    }

    return sorted;
  }

  /**
   * Monotonically aligns inputWords with verseWords without jumping backward.
   */
  public alignInputWithVerse(inputWords: string[], verseWords: string[]) {
    const n = inputWords.length;
    const m = verseWords.length;

    // dp[i][j] = max matched words between inputWords[0..i-1] and verseWords[0..j-1]
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (areWordsMatching(inputWords[i - 1], verseWords[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to extract matched pairs
    let i = n, j = m;
    const userWordToVerseIndex = new Map<number, number>();
    const matchedVerseIndices = new Set<number>();

    while (i > 0 && j > 0) {
      if (areWordsMatching(inputWords[i - 1], verseWords[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) {
        userWordToVerseIndex.set(i - 1, j - 1);
        matchedVerseIndices.add(j - 1);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return {
      matchedCount: dp[n][m],
      userWordToVerseIndex,
      matchedVerseIndices
    };
  }

  /**
   * Evaluates user input against a target word.
   */
  public evaluate(targetWord: string, rawInput: string, timedOut: boolean = false): EvaluationOutcome {
    const cleanInput = stripVowelsAndPunctuation(rawInput);
    const inputWords = cleanInput.split(' ').filter(Boolean);

    // Shortest example verse containing the target word
    const exampleVerse = this.findShortestVerseWithWord(targetWord);

    if (inputWords.length === 0) {
      return {
        score: 0,
        tier: 5,
        reason: 'לא הוקלד ציטוט',
        isFullVerse: false,
        isExactInflection: false,
        matchedVerse: null,
        exampleVerse,
        userWordsDetails: [],
        verseWordsMatchedIndices: new Set(),
        targetWordInVerseIndex: null,
        coverageRatio: 0,
        timedOut
      };
    }

    // Check if the user typed ONLY the target word itself without any context from a verse
    const isOnlyTargetWord =
      inputWords.length === 1 && matchTargetWordClassification(inputWords[0], targetWord) !== null;
    const isOnlyTargetForms =
      inputWords.length > 0 &&
      inputWords.every(w => matchTargetWordClassification(w, targetWord) !== null);

    if (isOnlyTargetWord || isOnlyTargetForms) {
      const userWordsDetails: WordMatchDetails[] = inputWords.map(w => ({
        userWord: w,
        matchedVerseWordIndex: null,
        isMatch: false
      }));

      return {
        score: 0,
        tier: 5,
        reason: 'לא ניתן להקליד את המילה המבוקשת בלבד, ללא הקשר בפסוק כלשהו',
        isFullVerse: false,
        isExactInflection: false,
        matchedVerse: null,
        exampleVerse,
        userWordsDetails,
        verseWordsMatchedIndices: new Set(),
        targetWordInVerseIndex: null,
        coverageRatio: 0,
        timedOut,
        isOnlyTargetWordTyped: true
      };
    }

    const candidates = this.findCandidates(inputWords, targetWord);

    let bestVerse: VerseRecord | null = null;
    let bestScore = -1;
    let bestTier: 1 | 2 | 3 | 4 | 5 = 5;
    let bestReason = '';
    let bestIsFull = false;
    let bestIsExact = false;
    let bestAlignment: {
      matchedCount: number;
      userWordToVerseIndex: Map<number, number>;
      matchedVerseIndices: Set<number>;
    } | null = null;
    let bestCoverage = 0;
    let bestTargetIdx: number | null = null;

    // Track closest verse for 0-score display
    let closestVerse: VerseRecord | null = null;
    let closestAlignment: any = null;
    let maxMatchCount = 0;

    for (const verse of candidates) {
      const align = this.alignInputWithVerse(inputWords, verse.words);
      const matchedCount = align.matchedCount;
      const totalVWords = verse.words.length;
      const coverage = matchedCount / totalVWords;

      if (matchedCount > maxMatchCount) {
        maxMatchCount = matchedCount;
        closestVerse = verse;
        closestAlignment = align;
      }

      // Check if this verse contains the target word (exact or inflected)
      let targetWordInVerseIndex: number | null = null;
      let targetInflectionInVerse: 'exact' | 'inflected' | null = null;

      for (let vi = 0; vi < verse.words.length; vi++) {
        const cls = matchTargetWordClassification(verse.words[vi], targetWord);
        if (cls) {
          targetWordInVerseIndex = vi;
          targetInflectionInVerse = cls;
          if (cls === 'exact') break; // prefer exact
        }
      }

      // Did user quote include the target word?
      let targetInQuotedWords = false;
      let userTargetInflection: 'exact' | 'inflected' | null = null;

      for (let ui = 0; ui < inputWords.length; ui++) {
        const vi = align.userWordToVerseIndex.get(ui);
        if (vi !== undefined) {
          const cls = matchTargetWordClassification(inputWords[ui], targetWord);
          if (cls) {
            targetInQuotedWords = true;
            userTargetInflection = cls;
            if (cls === 'exact') break;
          }
        }
      }

      // Determine full verse: coverage >= 95%
      const isFull = coverage >= 0.95;

      // Determine valid partial quote:
      // "ציטוט חלקי חייב לכלול לפחות 3 מילים מתוך הפסוק (או את כולן, בפסוק קצר), וחייב לכלול את המילה המבוקשת."
      // When timedOut is true, the user was interrupted while typing, so we accept whatever was typed from the verse!
      const validPartialMinWords = timedOut
        ? (matchedCount >= 1)
        : (totalVWords < 3 ? matchedCount === totalVWords : matchedCount >= 3);

      const validTargetPresence = isFull
        ? (targetWordInVerseIndex !== null)
        : timedOut
          ? (targetWordInVerseIndex !== null) // user was typing this verse containing targetWord when time ran out!
          : (targetInQuotedWords && targetWordInVerseIndex !== null);

      const userQuoteCoherence = matchedCount / inputWords.length;

      if (!validTargetPresence) {
        continue;
      }

      const minCoherence = timedOut ? 0.30 : 0.50;
      if (!isFull && (!validPartialMinWords || userQuoteCoherence < minCoherence)) {
        continue;
      }

      const isExact = (userTargetInflection === 'exact') || (isFull && targetInflectionInVerse === 'exact');

      let currentScore = 0;
      let currentTier: 1 | 2 | 3 | 4 = 1;
      let reason = '';

      if (isFull) {
        if (isExact) {
          currentScore = 100;
          currentTier = 1;
          reason = 'פסוק מלא עם הטייה מדויקת (100 נקודות)';
        } else {
          currentScore = 75;
          currentTier = 2;
          reason = 'פסוק מלא עם הטייה שונה (75 נקודות)';
        }
      } else {
        const isExactMatch = isExact || (timedOut && targetInflectionInVerse === 'exact');
        if (isExactMatch) {
          const rawScore = Math.round(90 * coverage);
          currentScore = timedOut ? Math.max(15, rawScore) : rawScore;
          currentTier = 3;
          reason = timedOut
            ? `הזמן הסתיים בעת הקלדה: נשפטו ${matchedCount} מתוך ${totalVWords} מילים שנכתבו מהפסוק (${currentScore} נקודות)`
            : `ציטוט חלקי: ${matchedCount} מתוך ${totalVWords} מילים, הטייה מדויקת (${currentScore} נקודות)`;
        } else {
          const rawScore = Math.round(70 * coverage);
          currentScore = timedOut ? Math.max(10, rawScore) : rawScore;
          currentTier = 4;
          reason = timedOut
            ? `הזמן הסתיים בעת הקלדה: נשפטו ${matchedCount} מתוך ${totalVWords} מילים שנכתבו מהפסוק (${currentScore} נקודות)`
            : `ציטוט חלקי: ${matchedCount} מתוך ${totalVWords} מילים, הטייה שונה (${currentScore} נקודות)`;
        }
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestTier = currentTier;
        bestReason = reason;
        bestVerse = verse;
        bestIsFull = isFull;
        bestIsExact = isExact;
        bestAlignment = align;
        bestCoverage = coverage;
        bestTargetIdx = targetWordInVerseIndex;
      }
    }

    // If a scoring match was found
    if (bestVerse && bestScore > 0 && bestAlignment) {
      const userWordsDetails: WordMatchDetails[] = inputWords.map((uw, idx) => ({
        userWord: uw,
        matchedVerseWordIndex: bestAlignment!.userWordToVerseIndex.get(idx) ?? null,
        isMatch: bestAlignment!.userWordToVerseIndex.has(idx)
      }));

      return {
        score: bestScore,
        tier: bestTier,
        reason: bestReason,
        isFullVerse: bestIsFull,
        isExactInflection: bestIsExact,
        matchedVerse: bestVerse,
        exampleVerse,
        userWordsDetails,
        verseWordsMatchedIndices: bestAlignment.matchedVerseIndices,
        targetWordInVerseIndex: bestTargetIdx,
        coverageRatio: bestCoverage,
        timedOut
      };
    }

    // If timedOut is true and the user typed words from ANY matching verse in the Torah:
    // award points for what was typed so the player does not get 0 points!
    if (timedOut && closestVerse && closestAlignment && closestAlignment.matchedCount >= 1) {
      const matchedCount = closestAlignment.matchedCount;
      const totalVWords = closestVerse.words.length;
      const coverage = matchedCount / totalVWords;
      const fallbackScore = Math.max(10, Math.round(60 * coverage));

      const userWordsDetails: WordMatchDetails[] = inputWords.map((uw, idx) => ({
        userWord: uw,
        matchedVerseWordIndex: closestAlignment.userWordToVerseIndex.get(idx) ?? null,
        isMatch: closestAlignment.userWordToVerseIndex.has(idx)
      }));

      return {
        score: fallbackScore,
        tier: 4,
        reason: `הזמן הסתיים בעת הקלדה: נשפטו ${matchedCount} מתוך ${totalVWords} מילים שנכתבו (${fallbackScore} נקודות)`,
        isFullVerse: false,
        isExactInflection: false,
        matchedVerse: closestVerse,
        exampleVerse,
        userWordsDetails,
        verseWordsMatchedIndices: closestAlignment.matchedVerseIndices,
        targetWordInVerseIndex: this.findTargetWordInVerse(closestVerse, targetWord),
        coverageRatio: coverage,
        timedOut: true
      };
    }

    // Score is 0: determine explanatory reason
    // "כשאין ניקוד, הפסוק הדומה ביותר לציטוט (לפחות 3 מילים תואמות ו-40% מהציטוט, או שתי מילים אם זה כל הציטוט)"
    let fallbackVerse: VerseRecord | null = null;
    let fallbackAlignment: any = null;

    if (closestVerse && closestAlignment) {
      const matchedCount = closestAlignment.matchedCount;
      const inputLen = inputWords.length;
      const minMatched = inputLen <= 2 ? 2 : 3;
      if (matchedCount >= minMatched && (matchedCount / inputLen >= 0.4 || inputLen <= 2)) {
        fallbackVerse = closestVerse;
        fallbackAlignment = closestAlignment;
      }
    }

    let zeroReason = 'לא זוהה פסוק מתאים בתורה';
    if (fallbackVerse) {
      const containsTarget = fallbackVerse.words.some(w => matchTargetWordClassification(w, targetWord));
      if (!containsTarget) {
        zeroReason = `בפסוק שציטטת (${fallbackVerse.ref}) אין את המילה "${targetWord}"`;
      } else {
        zeroReason = 'הציטוט קצר מדי או שונה מדי מהפסוק';
      }
    }

    const userWordsDetails: WordMatchDetails[] = inputWords.map((uw, idx) => ({
      userWord: uw,
      matchedVerseWordIndex: fallbackAlignment ? (fallbackAlignment.userWordToVerseIndex.get(idx) ?? null) : null,
      isMatch: fallbackAlignment ? fallbackAlignment.userWordToVerseIndex.has(idx) : false
    }));

    return {
      score: 0,
      tier: 5,
      reason: zeroReason,
      isFullVerse: false,
      isExactInflection: false,
      matchedVerse: fallbackVerse,
      exampleVerse,
      userWordsDetails,
      verseWordsMatchedIndices: fallbackAlignment ? fallbackAlignment.matchedVerseIndices : new Set(),
      targetWordInVerseIndex: fallbackVerse ? this.findTargetWordInVerse(fallbackVerse, targetWord) : null,
      coverageRatio: 0,
      timedOut
    };
  }

  public findTargetWordInVerse(verse: VerseRecord, targetWord: string): number | null {
    for (let i = 0; i < verse.words.length; i++) {
      if (matchTargetWordClassification(verse.words[i], targetWord)) {
        return i;
      }
    }
    return null;
  }

  public findShortestVerseWithWord(targetWord: string): VerseRecord | null {
    let shortest: VerseRecord | null = null;
    for (const v of this.verses) {
      if (v.words.some(w => matchTargetWordClassification(w, targetWord))) {
        if (!shortest || v.words.length < shortest.words.length) {
          shortest = v;
        }
      }
    }
    return shortest;
  }
}

// Global engine instance
export const torahEngine = new TorahDatabase(DEFAULT_TORAH_RAW_TEXT);
