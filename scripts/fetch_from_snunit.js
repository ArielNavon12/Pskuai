import fs from 'fs';
import path from 'path';

function numberToHebrew(num) {
  const letters = [
    [400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'],
    [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'],
    [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']
  ];
  if (num === 15) return 'טו';
  if (num === 16) return 'טז';
  let result = '';
  for (const [val, char] of letters) {
    while (num >= val) {
      result += char;
      num -= val;
    }
  }
  return result;
}

const BOOKS = [
  { name: 'בראשית', prefix: '01', chapters: 50, id: 'gen' },
  { name: 'שמות', prefix: '02', chapters: 40, id: 'exo' },
  { name: 'ויקרא', prefix: '03', chapters: 27, id: 'lev' },
  { name: 'במדבר', prefix: '04', chapters: 36, id: 'num' },
  { name: 'דברים', prefix: '05', chapters: 34, id: 'deu' }
];

async function fetchSnunitChapter(book, chapNum) {
  const chapStr = String(chapNum).padStart(2, '0');
  const fileName = `t${book.prefix}${chapStr}.htm`;
  const url = `https://kodesh.snunit.k12.il/i/t/${fileName}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TorahVerseGame/1.0 (Snunit Kodesh Educational Torah Game; mailto:arielnavon12@gmail.com)'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const regex = /<A NAME="(\d+)">\s*<\/A>\s*<B><SPAN[^>]*>([^<]+)<\/SPAN><\/B>\s*([\s\S]*?)(?=<A NAME="|<\/P>|<div class=prakimLine>)/gi;
    let match;
    const verses = [];
    const perekLetter = numberToHebrew(chapNum);

    while ((match = regex.exec(html)) !== null) {
      const pNum = parseInt(match[1]);
      const pLetter = match[2].trim();
      const rawText = match[3]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#160;/g, ' ')
        .replace(/\{[פס]\}/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const clean = rawText
        .replace(/[\u0591-\u05C7]/g, '')
        .replace(/[-־–—׃\.,;!?'"״״׳`()[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (clean.length > 0) {
        verses.push({
          id: `${book.id}_${chapNum}_${pNum}`,
          book: book.name,
          perek: perekLetter,
          perekNum: chapNum,
          pasuk: pLetter,
          pasukNum: pNum,
          ref: `${book.name} פרק ${perekLetter} פסוק ${pLetter}`,
          shortRef: `${book.name} ${perekLetter}, ${pLetter}`,
          text: clean,
          vocalizedText: rawText,
          sourceUrl: `https://kodesh.snunit.k12.il/i/t/${fileName}#${pNum}`
        });
      }
    }

    return verses;
  } catch (err) {
    console.error(`Error fetching ${book.name} chap ${chapNum} (${fileName}):`, err.message);
    return [];
  }
}

async function main() {
  const allTasks = [];
  for (const b of BOOKS) {
    for (let c = 1; c <= b.chapters; c++) {
      allTasks.push({ book: b, chapter: c });
    }
  }

  console.log(`Starting fetch of 187 Torah chapters from Snunit (kodesh.snunit.k12.il)...`);
  const allVerses = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
    const batch = allTasks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(t => fetchSnunitChapter(t.book, t.chapter)));
    for (const r of results) {
      allVerses.push(...r);
    }
    process.stdout.write(`\rFetched ${allVerses.length} verses so far... (${Math.min(i + BATCH_SIZE, allTasks.length)}/${allTasks.length} chapters)`);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nCompleted! Total verses fetched from Snunit: ${allVerses.length}`);
  const outPath = path.resolve('src/data/torah.json');
  fs.writeFileSync(outPath, JSON.stringify(allVerses, null, 1));
  console.log(`Saved to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
