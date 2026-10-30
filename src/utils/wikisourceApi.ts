export interface WikisourceSearchResult {
  pageid: number;
  title: string;
  snippet: string;
  url: string;
}

/**
 * Searches Hebrew Wikisource for a given query (word, phrase, or chapter).
 */
export async function searchWikisource(query: string): Promise<WikisourceSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  // Search specifically with focus on Torah / Tanakh
  const url = `https://he.wikisource.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=15&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const searchItems = data.query?.search || [];

    return searchItems.map((item: { pageid: number; title: string; snippet: string }) => ({
      pageid: item.pageid,
      title: item.title,
      snippet: item.snippet.replace(/<span class="searchmatch">/g, '<mark class="bg-amber-400/30 text-amber-200 px-0.5 rounded">').replace(/<\/span>/g, '</mark>'),
      url: `https://he.wikisource.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
    }));
  } catch (err) {
    console.warn('Wikisource search error:', err);
    return [];
  }
}

/**
 * Formats a clean direct Wikisource URL for a specific Torah chapter.
 */
export function getWikisourceChapterUrl(book: string, perek: string): string {
  return `https://he.wikisource.org/wiki/${encodeURIComponent(`${book}_${perek}`)}`;
}
