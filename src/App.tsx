import { useState } from 'react';
import { Music, VolumeX, Gauge, Languages } from 'lucide-react';
import { SANDWICH_ORDERS, SandwichOrder } from './data/vocabData';
import { audioEngine, speakEnglish } from './utils/audioEngine';
import {
  clearLeaderboard,
  exportLeaderboardCsv,
  getLeaderboard,
  LeaderboardEntry,
  saveLeaderboardEntry,
} from './utils/leaderboardStorage';
import { GameStage, RoundCompletionPayload } from './components/GameStage';
import { WordCardsView } from './components/WordCardsView';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherGuideView } from './components/TeacherGuideView';

type AppView = 'PLAY' | 'CARDS' | 'LEADERBOARD' | 'GUIDE';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('PLAY');
  const [studentName, setStudentName] = useState('Lily');
  const [selectedOrder, setSelectedOrder] = useState<SandwichOrder>(SANDWICH_ORDERS[0]);
  const [musicOn, setMusicOn] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [showChinese, setShowChinese] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [resetSignal, setResetSignal] = useState(0);

  const handleToggleMusic = () => {
    const next = audioEngine.toggleMusic();
    setMusicOn(next);
  };

  const handleEnsureMusicStarted = () => {
    if (!audioEngine.getMusicState()) {
      audioEngine.startMusic();
      setMusicOn(true);
    }
  };

  const handleRoundComplete = (payload: RoundCompletionPayload) => {
    const updated = saveLeaderboardEntry(payload);
    setLeaderboard(updated);
  };

  const handleNewRound = () => {
    setActiveView('PLAY');
    setResetSignal((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Wordmark */}
          <button
            type="button"
            onClick={() => setActiveView('PLAY')}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Yummy Sandwich Lab
          </button>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveView('PLAY')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'PLAY'
                  ? 'text-slate-900 font-semibold border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              Play Game
            </button>
            <button
              type="button"
              onClick={() => setActiveView('CARDS')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'CARDS'
                  ? 'text-slate-900 font-semibold border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              Word Cards
            </button>
            <button
              type="button"
              onClick={() => setActiveView('LEADERBOARD')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'LEADERBOARD'
                  ? 'text-slate-900 font-semibold border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              Leaderboard ({leaderboard.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('GUIDE')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'GUIDE'
                  ? 'text-slate-900 font-semibold border-b-2 border-amber-500'
                  : 'hover:text-slate-900'
              }`}
            >
              Teacher Guide
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleNewRound}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              New Round
            </button>
          </div>
        </div>

        {/* Mobile navigation row */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-4 overflow-x-auto text-xs font-medium text-slate-600">
          {(
            [
              ['PLAY', 'Play Game'],
              ['CARDS', 'Word Cards'],
              ['LEADERBOARD', `Leaderboard (${leaderboard.length})`],
              ['GUIDE', 'Teacher Guide'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveView(key)}
              className={`py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === key ? 'text-amber-700 font-semibold' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Workspace Controls Bar */}
      <div className="bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-800">
              Player: {studentName.trim() || 'Super Chef'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Words: sandwich · cheese · vegetable · salad · tomato · egg</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                musicOn
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {musicOn ? <Music className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {musicOn ? 'Music On' : 'Play Music'}
            </button>

            <button
              type="button"
              onClick={() => setSpeechRate((prev) => (prev < 0.8 ? 0.88 : 0.65))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              title="Toggle pronunciation speed"
            >
              <Gauge className="w-3.5 h-3.5" />
              Voice: {speechRate < 0.8 ? 'Slow' : 'Normal'}
            </button>

            <button
              type="button"
              onClick={() => setShowChinese((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5" />
              {showChinese ? 'EN + 中文' : 'English Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeView === 'PLAY' && (
          <GameStage
            studentName={studentName}
            onStudentNameChange={setStudentName}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            speechRate={speechRate}
            showChinese={showChinese}
            onEnsureMusicStarted={handleEnsureMusicStarted}
            onRoundComplete={handleRoundComplete}
            onNavigateLeaderboard={() => setActiveView('LEADERBOARD')}
            resetSignal={resetSignal}
          />
        )}

        {activeView === 'CARDS' && (
          <WordCardsView
            speechRate={speechRate}
            showChinese={showChinese}
            onPracticeSuccess={(word) => {
              audioEngine.playSuccess();
              void speakEnglish(`Great! ${word}`, speechRate);
            }}
          />
        )}

        {activeView === 'LEADERBOARD' && (
          <LeaderboardView
            entries={leaderboard}
            showChinese={showChinese}
            onClearAll={() => setLeaderboard(clearLeaderboard())}
            onExportCsv={() => exportLeaderboardCsv(leaderboard)}
            onStartPlay={() => setActiveView('PLAY')}
          />
        )}

        {activeView === 'GUIDE' && (
          <TeacherGuideView
            speechRate={speechRate}
            onStartPlay={() => setActiveView('PLAY')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Yummy Sandwich Lab · Elementary English Vocabulary Helper</span>
          <span>Target Vocabulary: sandwich · cheese · vegetable (salad, tomato) · egg</span>
        </div>
      </footer>
    </div>
  );
}
