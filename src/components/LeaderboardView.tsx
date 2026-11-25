import { useState } from 'react';
import { Trophy, Download, Trash2, Medal, Play } from 'lucide-react';
import { LeaderboardEntry } from '../utils/leaderboardStorage';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  showChinese: boolean;
  onClearAll: () => void;
  onExportCsv: () => void;
  onStartPlay: () => void;
}

export function LeaderboardView({
  entries,
  showChinese,
  onClearAll,
  onExportCsv,
  onStartPlay,
}: LeaderboardViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'today'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);
  const filtered =
    filterMode === 'today'
      ? entries.filter((e) => e.createdAt.slice(0, 10) === todayKey)
      : entries;

  const topThree = filtered.slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Class Score Leaderboard
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Celebrate students who pick fresh ingredients and read every English word aloud.
            {showChinese && ' 记录每位同学在超市选材与三明治跟读中的积分排名。'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filterMode === 'today'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
          </div>

          {entries.length > 0 && (
            <>
              <button
                type="button"
                onClick={onExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-slate-900">
              No scores recorded yet
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Complete a supermarket shopping and sandwich-making round to put the first student on the leaderboard.
              {showChinese && ' 完成一轮超市选材和三明治跟读挑战后，成绩会自动登上排行榜！'}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartPlay}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Start First Round
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Champions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((entry, idx) => {
              const rankColors = [
                'bg-amber-50 border-amber-200 text-amber-700',
                'bg-slate-100 border-slate-200 text-slate-700',
                'bg-orange-50 border-orange-200 text-orange-700',
              ];
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${rankColors[idx]}`}
                    >
                      <Medal className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        Rank #{idx + 1} · {entry.wordsSpoken} words read
                      </div>
                      <div className="font-display text-lg font-bold text-slate-900 truncate">
                        {entry.studentName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-nums text-2xl font-bold text-amber-600">
                      {entry.score}
                    </div>
                    <div className="text-xs text-slate-500">pts</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-5">Rank</th>
                    <th className="py-3.5 px-5">Student / Team</th>
                    <th className="py-3.5 px-5">Order</th>
                    <th className="py-3.5 px-5 text-right">Words Spoken</th>
                    <th className="py-3.5 px-5 text-right">Mic Bonus</th>
                    <th className="py-3.5 px-5 text-right">Score</th>
                    <th className="py-3.5 px-5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono-nums font-semibold text-slate-700">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {entry.studentName}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{entry.orderTitle}</td>
                      <td className="py-3.5 px-5 text-right font-mono-nums text-slate-700">
                        {entry.wordsSpoken}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono-nums text-emerald-700">
                        {entry.micBonusCount}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono-nums font-bold text-amber-600">
                        {entry.score}
                      </td>
                      <td className="py-3.5 px-5 text-right text-xs text-slate-500 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
