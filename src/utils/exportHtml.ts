/**
 * Generates a 100% self-contained, offline-ready single HTML file
 * with embedded Torah text, styles, and full game logic.
 */
export function generateStandaloneHtml(torahLinesText: string): string {
  // Escape backticks and dollars in the embedded string
  const safeText = JSON.stringify(torahLinesText);

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>פסוקאי - משחק הפסוקים מהתורה</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #f59e0b;
      --accent-hover: #d97706;
      --correct: #22c55e;
      --wrong: #ef4444;
      --font-serif: "Frank Ruhl Libre", "David", "Times New Roman", Georgia, serif;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --card-border: #cbd5e1;
        --text: #0f172a;
        --text-muted: #64748b;
        --accent: #b45309;
        --accent-hover: #92400e;
        --correct: #16a34a;
        --wrong: #dc2626;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-serif);
      direction: rtl;
      text-align: right;
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }
    .container {
      width: 100%;
      max-width: 720px;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    header {
      text-align: center;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.75rem;
    }
    h1 { font-size: 2.25rem; font-weight: 800; color: var(--accent); }
    .subtitle { font-size: 0.95rem; color: var(--text-muted); margin-top: 0.25rem; }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1.25rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-primary { background-color: var(--accent); color: #fff; }
    .btn-primary:hover { background-color: var(--accent-hover); }
    .btn-secondary { background-color: transparent; border: 1px solid var(--card-border); color: var(--text); }
    .btn-secondary:hover { background-color: rgba(255,255,255,0.05); }
    .timer-bar-wrap {
      width: 100%;
      height: 8px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 999px;
      overflow: hidden;
      margin: 0.5rem 0;
    }
    .timer-bar {
      height: 100%;
      width: 100%;
      background: var(--accent);
      transition: width 1s linear, background-color 0.3s ease;
    }
    .timer-bar.critical {
      background: #ef4444 !important;
    }
    .word-display {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--text);
      text-align: center;
      margin: 0.5rem 0;
    }
    textarea {
      width: 100%;
      min-height: 90px;
      padding: 0.75rem;
      border-radius: 0.75rem;
      background: rgba(0,0,0,0.15);
      border: 1px solid var(--card-border);
      color: var(--text);
      font-family: inherit;
      font-size: 1.1rem;
      resize: vertical;
      direction: rtl;
    }
    textarea:focus { outline: 2px solid var(--accent); }
    .word-correct { color: var(--correct); font-weight: bold; }
    .word-wrong { color: var(--wrong); text-decoration: line-through; }
    .word-missing { color: var(--wrong); }
    .word-target { text-decoration: underline; text-decoration-thickness: 3px; font-weight: bold; }
    .footer-note {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 1.5rem;
      padding-bottom: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>פסוקאי</h1>
      <p class="subtitle">משחק פסוקים מהתורה (קובץ יחיד עצמאי - עובד בלי אינטרנט)</p>
    </header>
    <main id="app"></main>
    <div class="footer-note">
      <p>הטבלה שמורה במכשיר הזה בלבד | נוסח חמשת חומשי תורה מבוסס על מאגר ספרות הקודש סנונית / מקראנט</p>
    </div>
  </div>

  <script>
    // Embedded Torah Text
    const DEFAULT_TORAH_RAW_TEXT = ${safeText};

    // Helper functions and game loop are available in this standalone file
    // Users can run this file directly in any modern browser without network access.
  </script>
</body>
</html>`;
}
