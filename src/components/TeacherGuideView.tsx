import { Volume2 } from 'lucide-react';
import { speakEnglish } from '../utils/audioEngine';

interface TeacherGuideViewProps {
  speechRate: number;
  onStartPlay: () => void;
}

const CLASSROOM_STEPS = [
  {
    step: '01. Warm-up on Word Cards (3 mins)',
    desc: 'Open the Word Cards tab on the smartboard. Click each illustration (sandwich, cheese, vegetable, salad, tomato, egg) so students hear clear pronunciation and repeat together.',
    descZh: '打开“Word Cards”单词卡，带领全班听音跟读 6 个核心单词，重点强调 vegetable 包含 salad 和 tomato。',
  },
  {
    step: '02. Supermarket Listening Hunt (5 mins)',
    desc: 'Switch to Play Game and pick an Order. Let students come up or raise hands to click the matching ingredients in the supermarket aisle.',
    descZh: '进入超市选材环节，播放订单语音，请学生根据英文指令找出对应的 cheese、salad、tomato 和 egg 放入购物篮。',
  },
  {
    step: '03. Make a Sandwich & Read Aloud (5 mins)',
    desc: 'In the Kitchen stage, every layer requires a Read-Aloud check before it drops onto the plate. Use Mic Check for individual volunteers or Class Read Aloud for whole-class choral repetition.',
    descZh: '制作三明治时，每添加一层食材必须跟读一遍单词（支持麦克风语音识别加分，或全班齐读后点击确认），最后齐读 sandwich 完成制作！',
  },
  {
    step: '04. Leaderboard Celebration (2 mins)',
    desc: 'Switch between student names or teams (e.g., Team Apple vs. Team Tomato) and export the Class Leaderboard CSV after class.',
    descZh: '支持多小组或学生姓名轮流挑战，排行榜自动记录分数并可导出 CSV 作为课堂表现记录。',
  },
];

const KEY_SENTENCES = [
  { en: 'Let us go to the supermarket!', zh: '我们一起去超市吧！' },
  { en: 'I want some cheese, please.', zh: '请给我一些奶酪。' },
  { en: 'Salad and tomato are vegetables.', zh: '生菜沙拉和番茄都是蔬菜。' },
  { en: 'Put an egg in the sandwich!', zh: '往三明治里放一个鸡蛋！' },
  { en: 'Look! I made a yummy sandwich!', zh: '看！我做了一个美味的三明治！' },
];

export function TeacherGuideView({ speechRate, onStartPlay }: TeacherGuideViewProps) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Elementary Teacher Lesson Guide
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Ready-to-use 15-minute classroom flow and sentence frames for Grades 1–4.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartPlay}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Back to Game Stage
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CLASSROOM_STEPS.map((item) => (
          <div key={item.step} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2.5">
            <h3 className="font-display text-lg font-bold text-slate-900">{item.step}</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{item.descZh}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Classroom Dialogue Prompts · 课堂常用句型
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Click any sentence to play audio for the class to repeat.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {KEY_SENTENCES.map((s) => (
            <div
              key={s.en}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="font-display font-semibold text-base text-slate-900">{s.en}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.zh}</div>
              </div>
              <button
                type="button"
                onClick={() => void speakEnglish(s.en, speechRate)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Speak
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
