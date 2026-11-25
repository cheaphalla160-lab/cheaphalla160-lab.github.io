import { useState } from 'react';
import { Volume2, Mic, CheckCircle2, Sparkles } from 'lucide-react';
import { ALL_VOCAB_LIST, VocabItem } from '../data/vocabData';
import { VocabImage } from './VocabImage';
import {
  isSpeechRecognitionSupported,
  listenForWord,
  speakEnglish,
} from '../utils/audioEngine';

interface WordCardsViewProps {
  speechRate: number;
  showChinese: boolean;
  onPracticeSuccess: (word: string) => void;
}

export function WordCardsView({
  speechRate,
  showChinese,
  onPracticeSuccess,
}: WordCardsViewProps) {
  const [listeningId, setListeningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const micSupported = isSpeechRecognitionSupported();

  const handleListen = (item: VocabItem, rateOverride?: number) => {
    void speakEnglish(item.word, rateOverride ?? speechRate);
  };

  const handleMicPractice = async (item: VocabItem) => {
    if (listeningId) return;
    setListeningId(item.id);
    setFeedback((prev) => ({
      ...prev,
      [item.id]: { ok: true, msg: 'Listening... Say the word clearly!' },
    }));

    const { promise } = listenForWord(item.aliases);
    const result = await promise;
    setListeningId(null);

    if (result.matched) {
      setFeedback((prev) => ({
        ...prev,
        [item.id]: {
          ok: true,
          msg: `Great pronunciation! Heard "${result.transcript || item.word}"`,
        },
      }));
      onPracticeSuccess(item.word);
    } else if (result.error === 'not-allowed') {
      setFeedback((prev) => ({
        ...prev,
        [item.id]: {
          ok: false,
          msg: 'Microphone access denied. Try clicking Listen and reading aloud!',
        },
      }));
    } else {
      setFeedback((prev) => ({
        ...prev,
        [item.id]: {
          ok: false,
          msg: result.transcript
            ? `Heard "${result.transcript}". Try "${item.word}" again!`
            : `Did not catch voice. Try speaking "${item.word}" closer to the mic.`,
        },
      }));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Interactive Vocabulary Cards
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Click any card to hear standard pronunciation, practice slow phonics, or test your voice.
            {showChinese && ' 点击卡片听发音，支持慢速跟读与语音打卡。'}
          </p>
        </div>
        <div className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
          6 Core Words · Vegetable includes Salad &amp; Tomato
        </div>
      </div>

      {/* Vegetable concept callout */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-emerald-900">
            Category Tip: Vegetable = Salad + Tomato
          </div>
          <p className="text-xs sm:text-sm text-emerald-800">
            Help students remember that <strong className="font-semibold">salad</strong> and{' '}
            <strong className="font-semibold">tomato</strong> belong to the{' '}
            <strong className="font-semibold">vegetable</strong> family!
            {showChinese && '（提示：salad 蔬菜沙拉 和 tomato 番茄 都属于 vegetable 蔬菜类单词。）'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void speakEnglish('Vegetable! Salad and tomato are vegetables.', speechRate)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          Hear Example
        </button>
      </div>

      {/* 6 Vocabulary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_VOCAB_LIST.map((item) => {
          const itemFeedback = feedback[item.id];
          const isListening = listeningId === item.id;

          return (
            <article
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>
                    {item.categoryLabel}
                    {showChinese && ` · ${item.categoryZh}`}
                  </span>
                  <span className="font-mono-nums">{item.ipa}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleListen(item)}
                  className="w-full aspect-square max-h-48 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-4 cursor-pointer group focus-visible:outline-2 focus-visible:outline-amber-500"
                  title={`Click to hear ${item.word}`}
                >
                  <VocabImage
                    src={item.imageUrl}
                    alt={`${item.word} illustration`}
                    fallbackLabel={item.word}
                    className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                  />
                </button>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl font-bold text-slate-900">
                    {item.word}
                  </h3>
                  {showChinese && (
                    <span className="text-sm font-medium text-slate-600">
                      {item.chinese}
                    </span>
                  )}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Syllables: <span className="font-medium text-slate-700">{item.syllables}</span>
                </div>

                <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                  “{item.exampleSentence}”
                  {showChinese && (
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {item.exampleZh}
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleListen(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Read Word
                  </button>
                  <button
                    type="button"
                    onClick={() => handleListen(item, 0.65)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    title="Slow pronunciation for kids"
                  >
                    Slow
                  </button>
                  {micSupported && (
                    <button
                      type="button"
                      onClick={() => void handleMicPractice(item)}
                      disabled={Boolean(listeningId)}
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                        isListening
                          ? 'bg-rose-600 text-white'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                      title="Practice saying this word into your microphone"
                    >
                      <Mic className="w-4 h-4" />
                      {isListening ? 'Listening' : 'Speak'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => void speakEnglish(item.exampleSentence, speechRate)}
                  className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Hear Full Sentence
                </button>

                {itemFeedback && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium pt-1 ${
                      itemFeedback.ok ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {itemFeedback.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{itemFeedback.msg}</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
