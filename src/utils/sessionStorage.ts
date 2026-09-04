/**
 * localStorage-backed persistence for the editor.
 *
 * The live/current session autosaves continuously under CURRENT_KEY. Up to
 * MAX_HISTORY previous sessions live under HISTORY_KEY, most-recent-first;
 * App.tsx's "New Session" / history-restore actions are what move a
 * session between "current" and "history" — this module only knows how to
 * read and write the two localStorage slots.
 */

export type Session = {
  id: string;
  paragraph: string;
  englishParagraph: string;
  englishBuffer: string;
  savedAt: number;
  /** User-given name, e.g. "Meeting notes". Absent means "untitled" — falls back to a text preview in the UI. */
  title?: string;
};

export const MAX_HISTORY = 5;

const CURRENT_KEY = 'bodo-typewriter:current-session';
const HISTORY_KEY = 'bodo-typewriter:session-history';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Missing, corrupt, or localStorage unavailable (private mode, etc.)
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable or full — persistence is best-effort only
  }
}

/**
 * Sessions saved before the englishParagraph/englishBuffer rename used
 * romanParagraph/romanBuffer — read those back so old saved sessions don't
 * silently lose their text on first load after the rename.
 */
function migrateLegacySession(raw: unknown): Session {
  const s = raw as Session & { romanParagraph?: string; romanBuffer?: string };
  return {
    ...s,
    englishParagraph: s.englishParagraph ?? s.romanParagraph ?? '',
    englishBuffer: s.englishBuffer ?? s.romanBuffer ?? '',
  };
}

export function isEmptySession(s: Pick<Session, 'paragraph' | 'englishParagraph' | 'englishBuffer'>): boolean {
  return !s.paragraph && !s.englishParagraph && !s.englishBuffer;
}

export function loadCurrentSession(): Session | null {
  const session = loadJSON<Session | null>(CURRENT_KEY, null);
  return session ? migrateLegacySession(session) : null;
}

export function saveCurrentSession(session: Session): void {
  saveJSON(CURRENT_KEY, session);
}

export function loadHistory(): Session[] {
  return loadJSON<Session[]>(HISTORY_KEY, []).map(migrateLegacySession);
}

export function saveHistory(history: Session[]): void {
  saveJSON(HISTORY_KEY, history.slice(0, MAX_HISTORY));
}

export function newSessionId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

export type SessionBackup = {
  version: 1;
  exportedAt: number;
  current: Session | null;
  history: Session[];
};

/** Everything currently in localStorage, bundled for a file download. */
export function buildBackup(): SessionBackup {
  return {
    version: 1,
    exportedAt: Date.now(),
    current: loadCurrentSession(),
    history: loadHistory(),
  };
}

/**
 * Merges a parsed backup file into the existing history — deliberately
 * never touches the live current session, so importing a backup can
 * never clobber whatever the user is actively working on. The backup's
 * own "current" (if it held anything) is folded in as just another
 * history entry. Every incoming session gets a fresh id (so it can never
 * collide with a local one), then everything is sorted newest-first and
 * capped at MAX_HISTORY — imported sessions can push older local ones
 * out, same as any other new session would.
 *
 * Throws if `raw` doesn't look like a backup this app produced.
 */
export function mergeBackupIntoHistory(
  raw: unknown,
  existingHistory: Session[],
): { history: Session[]; importedCount: number } {
  const backup = raw as Partial<SessionBackup> | null;
  if (!backup || typeof backup !== 'object' || !Array.isArray(backup.history)) {
    throw new Error('That file doesn’t look like a Bodo Typewriter backup.');
  }

  const incoming: Session[] = [...backup.history];
  if (backup.current && !isEmptySession(backup.current)) {
    incoming.push(backup.current);
  }
  const withFreshIds = incoming.map(s => ({ ...s, id: newSessionId() }));

  const merged = [...withFreshIds, ...existingHistory]
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_HISTORY);

  return { history: merged, importedCount: withFreshIds.length };
}
