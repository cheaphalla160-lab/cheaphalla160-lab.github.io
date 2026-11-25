export interface LeaderboardEntry {
  id: string;
  studentName: string;
  score: number;
  sandwichesCount: number;
  wordsSpoken: number;
  micBonusCount: number;
  orderTitle: string;
  createdAt: string;
}

const STORAGE_KEY = 'yummy_sandwich_lab_leaderboard_v1';

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort((a, b) => b.score - a.score || b.wordsSpoken - a.wordsSpoken);
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(
  entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>
): LeaderboardEntry[] {
  const existing = getLeaderboard();
  const nextEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  // Merge if same student plays multiple rounds in a row? Let's keep each round OR keep best/cumulative!
  // Keeping each game round as a clear entry helps teachers see every student turn and compare scores.
  const updated = [nextEntry, ...existing]
    .sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota errors
  }

  return updated;
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

export function exportLeaderboardCsv(entries: LeaderboardEntry[]): void {
  const headers = ['Rank', 'Student', 'Score', 'Sandwiches', 'Words Read', 'Mic Bonus', 'Order', 'Date'];
  const rows = entries.map((e, i) => [
    String(i + 1),
    `"${e.studentName.replace(/"/g, '""')}"`,
    String(e.score),
    String(e.sandwichesCount),
    String(e.wordsSpoken),
    String(e.micBonusCount),
    `"${e.orderTitle.replace(/"/g, '""')}"`,
    new Date(e.createdAt).toLocaleString(),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sandwich-vocab-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
