import { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  Mic,
  CheckCircle2,
  ShoppingBasket,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  Trophy,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import {
  IngredientId,
  SANDWICH_ORDERS,
  SandwichOrder,
  SUPERMARKET_HERO_IMAGE,
  SUPERMARKET_INGREDIENTS,
  VOCAB_ITEMS,
  VocabId,
} from '../data/vocabData';
import {
  audioEngine,
  isSpeechRecognitionSupported,
  listenForWord,
  speakEnglish,
} from '../utils/audioEngine';
import { VocabImage } from './VocabImage';
import { SandwichVisualizer } from './SandwichVisualizer';

export type GamePhase = 'TITLE_MENU' | 'SUPERMARKET' | 'KITCHEN' | 'CELEBRATION';

export interface RoundCompletionPayload {
  studentName: string;
  score: number;
  sandwichesCount: number;
  wordsSpoken: number;
  micBonusCount: number;
  orderTitle: string;
}

interface GameStageProps {
  studentName: string;
  onStudentNameChange: (name: string) => void;
  selectedOrder: SandwichOrder;
  onSelectOrder: (order: SandwichOrder) => void;
  speechRate: number;
  showChinese: boolean;
  onEnsureMusicStarted: () => void;
  onRoundComplete: (payload: RoundCompletionPayload) => void;
  onNavigateLeaderboard: () => void;
  resetSignal: number;
}

export function GameStage({
  studentName,
  onStudentNameChange,
  selectedOrder,
  onSelectOrder,
  speechRate,
  showChinese,
  onEnsureMusicStarted,
  onRoundComplete,
  onNavigateLeaderboard,
  resetSignal,
}: GameStageProps) {
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [basket, setBasket] = useState<IngredientId[]>([]);
  const [stackedLayers, setStackedLayers] = useState<IngredientId[]>([]);
  const [hasTopBread, setHasTopBread] = useState(false);
  const [pendingReadTarget, setPendingReadTarget] = useState<VocabId | null>(null);

  const [score, setScore] = useState(0);
  const [wordsSpoken, setWordsSpoken] = useState(0);
  const [micBonusCount, setMicBonusCount] = useState(0);
  const [vegetableReadBonusClaimed, setVegetableReadBonusClaimed] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    tone: 'neutral' | 'success' | 'hint';
    text: string;
  } | null>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micFeedback, setMicFeedback] = useState<string | null>(null);

  const micSupported = isSpeechRecognitionSupported();
  const stopMicRef = useRef<(() => void) | null>(null);
  const savedRoundRef = useRef(false);

  // Reset when parent triggers New Round
  useEffect(() => {
    if (resetSignal > 0) {
      stopMicRef.current?.();
      setPhase('TITLE_MENU');
      setBasket([]);
      setStackedLayers([]);
      setHasTopBread(false);
      setPendingReadTarget(null);
      setScore(0);
      setWordsSpoken(0);
      setMicBonusCount(0);
      setVegetableReadBonusClaimed(false);
      setStatusMessage(null);
      setIsListeningMic(false);
      setMicFeedback(null);
      savedRoundRef.current = false;
    }
  }, [resetSignal]);

  const startSupermarket = () => {
    stopMicRef.current?.();
    onEnsureMusicStarted();
    setPhase('SUPERMARKET');
    setBasket([]);
    setStackedLayers([]);
    setHasTopBread(false);
    setPendingReadTarget(null);
    setScore(0);
    setWordsSpoken(0);
    setMicBonusCount(0);
    setVegetableReadBonusClaimed(false);
    setStatusMessage(null);
    setMicFeedback(null);
    savedRoundRef.current = false;

    const neededWords = selectedOrder.requiredIngredients.map((id) => VOCAB_ITEMS[id].word).join(', ');
    void speakEnglish(`Welcome to the supermarket! Please pick ${neededWords}.`, speechRate);
  };

  const handlePickFromShelf = (id: IngredientId) => {
    const item = VOCAB_ITEMS[id];
    void speakEnglish(item.spokenPrompt, speechRate);

    if (!selectedOrder.requiredIngredients.includes(id)) {
      audioEngine.playGentleNudge();
      setStatusMessage({
        tone: 'hint',
        text: `${item.word} is tasty, but this order needs: ${selectedOrder.requiredIngredients
          .map((r) => VOCAB_ITEMS[r].word)
          .join(', ')}.`,
      });
      return;
    }

    if (basket.includes(id)) {
      audioEngine.playPop();
      setStatusMessage({
        tone: 'neutral',
        text: `${item.word} is already in your basket! Say "${item.word}" again!`,
      });
      return;
    }

    audioEngine.playPop();
    const nextBasket = [...basket, id];
    setBasket(nextBasket);
    setScore((prev) => prev + 15);
    setStatusMessage({
      tone: 'success',
      text: `Added ${item.word}! +15 pts${item.isVegetable ? ' (Vegetable!)' : ''}`,
    });
  };

  const handleClaimVegetableHeader = () => {
    void speakEnglish('vegetable! Salad and tomato are vegetables.', speechRate);
    if (!vegetableReadBonusClaimed) {
      audioEngine.playSuccess();
      setVegetableReadBonusClaimed(true);
      setScore((prev) => prev + 10);
      setWordsSpoken((prev) => prev + 1);
      setStatusMessage({
        tone: 'success',
        text: 'Practiced "vegetable"! +10 bonus pts',
      });
    }
  };

  const enterKitchen = () => {
    stopMicRef.current?.();
    setPhase('KITCHEN');
    setStatusMessage({
      tone: 'neutral',
      text: 'Pick any ingredient below to add Layer #1 onto your bread!',
    });
    setMicFeedback(null);
    setPendingReadTarget(null);
    void speakEnglish(
      'Now let us make a sandwich layer by layer! Pick an ingredient first.',
      speechRate
    );
  };

  const selectLayerToAdd = (id: IngredientId) => {
    if (stackedLayers.includes(id) || isListeningMic || hasTopBread) return;
    setPendingReadTarget(id);
    setMicFeedback(null);
    setStatusMessage({
      tone: 'neutral',
      text: `Layer #${stackedLayers.length + 1}: Say "${VOCAB_ITEMS[id].word}" aloud to add it!`,
    });
    void speakEnglish(VOCAB_ITEMS[id].spokenPrompt, speechRate);
  };

  const completeReadAloud = (viaMic: boolean) => {
    if (!pendingReadTarget) return;
    const currentTarget = pendingReadTarget;
    const points = viaMic ? 30 : 20;

    setWordsSpoken((prev) => prev + 1);
    if (viaMic) {
      setMicBonusCount((prev) => prev + 1);
    }

    if (currentTarget === 'sandwich') {
      // Final step snaps top bread onto the sandwich and lets student admire & celebrate!
      audioEngine.playFanfare();
      setHasTopBread(true);
      const finalScore = score + points + 50;
      setScore(finalScore);
      setPendingReadTarget(null);
      setMicFeedback(null);
      setStatusMessage({
        tone: 'success',
        text: `Awesome! You read "sandwich" (+${points} pts) + Sandwich Master Bonus (+50 pts)!`,
      });

      void speakEnglish('Hooray! Sandwich! You made a yummy sandwich!', speechRate);

      if (!savedRoundRef.current) {
        savedRoundRef.current = true;
        onRoundComplete({
          studentName: studentName.trim() || 'Super Chef',
          score: finalScore,
          sandwichesCount: 1,
          wordsSpoken: wordsSpoken + 1,
          micBonusCount: micBonusCount + (viaMic ? 1 : 0),
          orderTitle: selectedOrder.title,
        });
      }
      return;
    }

    // Add ingredient layer onto sandwich
    const ingredientId = currentTarget as IngredientId;
    audioEngine.playStack();
    if (viaMic) {
      audioEngine.playSuccess();
    }

    const nextLayers = [...stackedLayers, ingredientId];
    setStackedLayers(nextLayers);
    setScore((prev) => prev + points);
    setMicFeedback(null);

    const remaining = basket.filter((id) => !nextLayers.includes(id));
    if (remaining.length > 0) {
      // Pause after stacking so the student clearly picks the next layer one by one!
      setPendingReadTarget(null);
      setStatusMessage({
        tone: 'success',
        text: `Added Layer #${nextLayers.length}: ${VOCAB_ITEMS[ingredientId].word}! (+${points} pts) Tap another ingredient below for the next layer!`,
      });
    } else {
      // All ingredients stacked -> prompt final "sandwich" read aloud!
      setPendingReadTarget('sandwich');
      setStatusMessage({
        tone: 'success',
        text: `All ${nextLayers.length} layers stacked! Now read "sandwich" aloud to finish!`,
      });
      window.setTimeout(() => {
        void speakEnglish('All layers are ready! Now put on the top bread and say: sandwich!', speechRate);
      }, 380);
    }
  };

  const handleMicCheck = async () => {
    if (!pendingReadTarget || isListeningMic) return;
    const vocab = VOCAB_ITEMS[pendingReadTarget];
    setIsListeningMic(true);
    setMicFeedback(`Listening... Say "${vocab.word}" clearly!`);

    const { promise, stop } = listenForWord(vocab.aliases);
    stopMicRef.current = stop;
    const result = await promise;
    stopMicRef.current = null;
    setIsListeningMic(false);

    if (result.matched) {
      setMicFeedback(`Awesome! Heard "${result.transcript || vocab.word}"`);
      completeReadAloud(true);
    } else if (result.error === 'not-allowed') {
      setMicFeedback('Microphone blocked by browser. Use "I Read It! (+20 pts)" below!');
    } else {
      setMicFeedback(
        result.transcript
          ? `Heard "${result.transcript}". Try saying "${vocab.word}" again, or click "I Read It!"`
          : `Did not catch voice. Try "${vocab.word}" again or click "I Read It!"`
      );
    }
  };

  const isBasketComplete =
    selectedOrder.requiredIngredients.every((id) => basket.includes(id));

  // -------------------- VIEW: TITLE MENU --------------------
  if (phase === 'TITLE_MENU') {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-amber-700 tracking-wide">
                Primary English Vocabulary · Supermarket &amp; Kitchen
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight text-balance">
                Shop, Stack &amp; Say Your Sandwich!
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                Pick fresh ingredients in the supermarket, build a layered sandwich step by step,
                and read every English word aloud to climb the class leaderboard.
                {showChinese && (
                  <span className="block mt-1.5 text-sm text-slate-500">
                    在可爱超市选出 cheese、vegetable（salad、tomato）和 egg，每加一层大声跟读单词制作三明治，赢取排行榜高分！
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label
                  htmlFor="student-name-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Student or Team Name {showChinese && '· 学生或小组名称'}
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => onStudentNameChange(e.target.value)}
                  placeholder="e.g. Lily, Tom, or Team Sunshine"
                  maxLength={28}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Choose a Sandwich Order {showChinese && '· 选择三明治订单'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SANDWICH_ORDERS.map((order) => {
                    const active = order.id === selectedOrder.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-amber-50 border-amber-400 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-display text-sm font-bold truncate">
                          {order.title.replace(/^Order \d+:\s*/, '')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {order.requiredIngredients.length} items · {order.customerName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={startSupermarket}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-base rounded-xl transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <ShoppingBasket className="w-5 h-5" />
                  Enter Supermarket
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void speakEnglish(
                      'Sandwich, cheese, vegetable, salad, tomato, egg!',
                      speechRate
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Preview All 6 Words
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-slate-200 min-h-[260px]">
            <VocabImage
              src={SUPERMARKET_HERO_IMAGE}
              alt="Cheerful children's supermarket fresh food aisle"
              fallbackLabel="Sunny Supermarket"
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-5 text-white">
              <div className="text-xs font-medium text-amber-200">
                Target Words Today
              </div>
              <div className="font-display text-lg font-bold mt-0.5">
                sandwich · cheese · vegetable (salad, tomato) · egg
              </div>
            </div>
          </div>
        </div>

        {/* 4-column quick hear strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SUPERMARKET_INGREDIENTS.map((id) => {
            const item = VOCAB_ITEMS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  audioEngine.playPop();
                  void speakEnglish(item.spokenPrompt, speechRate);
                }}
                className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-4 flex items-center gap-3.5 text-left transition-colors cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                  <VocabImage
                    src={item.imageUrl}
                    alt={item.word}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-lg text-slate-900 truncate">
                    {item.word}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {item.isVegetable ? 'vegetable' : item.categoryLabel}
                    {showChinese && ` · ${item.chinese}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------- VIEW: SUPERMARKET --------------------
  if (phase === 'SUPERMARKET') {
    const dairyEggItems: IngredientId[] = ['cheese', 'egg'];
    const vegetableItems: IngredientId[] = ['salad', 'tomato'];

    const renderShelfCard = (id: IngredientId) => {
      const item = VOCAB_ITEMS[id];
      const inBasket = basket.includes(id);
      const isRequired = selectedOrder.requiredIngredients.includes(id);

      return (
        <button
          key={id}
          type="button"
          onClick={() => handlePickFromShelf(id)}
          className={`relative text-left rounded-2xl border p-4 transition-all cursor-pointer group ${
            inBasket
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>
              {item.isVegetable ? 'Vegetable' : item.categoryLabel}
              {showChinese && ` · ${item.chinese}`}
            </span>
            {inBasket ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Basket
              </span>
            ) : isRequired ? (
              <span className="font-semibold text-amber-700">On List</span>
            ) : (
              <span className="text-slate-400">Extra</span>
            )}
          </div>

          <div className="aspect-square max-h-36 mx-auto rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
            <VocabImage
              src={item.imageUrl}
              alt={`${item.word} on supermarket shelf`}
              fallbackLabel={item.word}
              className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-display text-xl font-bold text-slate-900">{item.word}</div>
              <div className="text-xs font-mono-nums text-slate-500">{item.ipa}</div>
            </div>
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Volume2 className="w-4 h-4" />
            </span>
          </div>
        </button>
      );
    };

    return (
      <div className="space-y-6">
        {/* Supermarket Order Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-amber-700">
              Step 1: Supermarket Shopping · {selectedOrder.customerName}’s Order
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {selectedOrder.title}
            </h2>
            <p className="text-sm text-slate-600">
              {selectedOrder.description}
              {showChinese && ` （${selectedOrder.descriptionZh}）`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                void speakEnglish(
                  `Please pick ${selectedOrder.requiredIngredients
                    .map((id) => VOCAB_ITEMS[id].word)
                    .join(', ')}!`,
                  speechRate
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              Hear Order
            </button>
            <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-right">
              <div className="text-xs text-amber-800">Score</div>
              <div className="font-mono-nums text-xl font-bold text-amber-700">{score}</div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium border flex items-center justify-between gap-3 ${
              statusMessage.tone === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusMessage.tone === 'hint'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Supermarket Aisles */}
          <div className="lg:col-span-8 space-y-6">
            {/* Vegetable Aisle */}
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-emerald-950">
                    Vegetable Aisle · vegetable {showChinese && '（蔬菜区）'}
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Salad and tomato are both vegetables! Click the button to practice saying vegetable (+10 bonus).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClaimVegetableHeader}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Say “vegetable” {vegetableReadBonusClaimed ? '✓' : '+10'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vegetableItems.map(renderShelfCard)}
              </div>
            </div>

            {/* Dairy & Egg Aisle */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Cheese &amp; Fresh Eggs Aisle {showChinese && '（奶酪与鸡蛋区）'}
                </h3>
                <p className="text-xs text-slate-500">
                  Click each item to hear its English name and place it in your basket.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dairyEggItems.map(renderShelfCard)}
              </div>
            </div>
          </div>

          {/* Right: Shopping Basket */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-amber-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Shopping Basket
                </h3>
              </div>
              <span className="font-mono-nums text-sm font-semibold text-slate-600">
                {basket.length} / {selectedOrder.requiredIngredients.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedOrder.requiredIngredients.map((reqId) => {
                const item = VOCAB_ITEMS[reqId];
                const picked = basket.includes(reqId);
                return (
                  <div
                    key={reqId}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                      picked
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <VocabImage
                        src={item.imageUrl}
                        alt={item.word}
                        className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm text-slate-900 truncate">
                          {item.word}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.isVegetable ? 'vegetable' : item.categoryLabel}
                          {showChinese && ` · ${item.chinese}`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        picked ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {picked ? 'Ready ✓' : 'Needed'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!isBasketComplete}
              onClick={enterKitchen}
              className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-display font-bold text-base transition-colors whitespace-nowrap ${
                isBasketComplete
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              Make Sandwich Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </aside>
        </div>
      </div>
    );
  }

  // -------------------- VIEW: KITCHEN (MAKE SANDWICH + READ ALOUD) --------------------
  if (phase === 'KITCHEN') {
    const activeVocab = pendingReadTarget ? VOCAB_ITEMS[pendingReadTarget] : null;
    const allLayersDone = stackedLayers.length === basket.length;

    return (
      <div className="space-y-6">
        {/* Kitchen Progress Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-700">
              Step 2: Kitchen Sandwich Maker · Follow &amp; Read Every Layer!
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Build Your Sandwich &amp; Say Each Word
            </h2>
            <p className="text-sm text-slate-600">
              Every time you add an ingredient, listen and read it aloud to stack it onto your plate.
              {showChinese && ' 每加一层食材都要跟着大声读一遍英文单词哦！'}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-500">Words Read</div>
              <div className="font-mono-nums text-lg font-bold text-emerald-700">
                {wordsSpoken}
              </div>
            </div>
            <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-right">
              <div className="text-xs text-amber-800">Score</div>
              <div className="font-mono-nums text-xl font-bold text-amber-700">{score}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Sandwich Plate & Ingredient Tray */}
          <div className="lg:col-span-7 space-y-5">
            <SandwichVisualizer
              layers={stackedLayers}
              pendingTarget={pendingReadTarget}
              hasTopBread={hasTopBread}
              showChinese={showChinese}
              onSpeakWord={(w) => void speakEnglish(w, speechRate)}
            />

            {/* Picked Ingredients Tray */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Your Basket Ingredients {showChinese && '· 请点击食材一层一层添加'}
                </h3>
                <span className="font-mono-nums text-xs text-slate-500">
                  {stackedLayers.length} / {basket.length} stacked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {basket.map((id) => {
                  const item = VOCAB_ITEMS[id];
                  const isStacked = stackedLayers.includes(id);
                  const isSelected = pendingReadTarget === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isStacked || hasTopBread}
                      onClick={() => selectLayerToAdd(id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isStacked
                          ? 'bg-emerald-50/70 border-emerald-200 opacity-75 cursor-default'
                          : isSelected
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      <VocabImage
                        src={item.imageUrl}
                        alt={item.word}
                        className="w-14 h-14 mx-auto rounded-lg object-contain mb-1.5"
                      />
                      <div className="font-display font-bold text-sm text-slate-900">
                        {item.word}
                      </div>
                      <div className="text-xs text-slate-500">
                        {isStacked
                          ? `Layer #${stackedLayers.indexOf(id) + 1} ✓`
                          : isSelected
                            ? 'Reading now'
                            : 'Tap to add'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Follow & Read Aloud Coach Panel */}
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            {hasTopBread ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-emerald-700">
                    Sandwich Complete! · 三明治完成啦！
                  </span>
                  <span className="text-xs font-mono-nums text-amber-700 font-bold">
                    +50 Bonus
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <VocabImage
                    src={VOCAB_ITEMS.sandwich.imageUrl}
                    alt="sandwich"
                    className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200 object-contain p-2 shrink-0"
                  />
                  <div>
                    <div className="font-display text-3xl font-extrabold text-slate-900">
                      sandwich
                    </div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      <span className="font-mono-nums">{VOCAB_ITEMS.sandwich.ipa}</span>
                      {' · '}
                      <span>{VOCAB_ITEMS.sandwich.syllables}</span>
                    </div>
                    {showChinese && (
                      <div className="text-sm font-medium text-slate-700 mt-0.5">
                        三明治 · 美味完成！
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void speakEnglish('sandwich! Yummy sandwich!', speechRate)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Read “sandwich” Again
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPhase('CELEBRATION')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-base rounded-xl transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                >
                  <Trophy className="w-5 h-5" />
                  Finish &amp; See Scoreboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : activeVocab ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-amber-700">
                    {allLayersDone
                      ? 'Final Step · Say “sandwich” to finish!'
                      : `Layer #${stackedLayers.length + 1} · Read Aloud to Stack`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeVocab.categoryLabel}
                    {showChinese && ` · ${activeVocab.categoryZh}`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => void speakEnglish(activeVocab.spokenPrompt, speechRate)}
                    className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    title="Click to listen"
                  >
                    <VocabImage
                      src={activeVocab.imageUrl}
                      alt={activeVocab.word}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                  <div className="min-w-0">
                    <div className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {activeVocab.word}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      <span className="font-mono-nums">{activeVocab.ipa}</span>
                      {' · '}
                      <span>{activeVocab.syllables}</span>
                    </div>
                    {showChinese && (
                      <div className="mt-0.5 text-sm font-medium text-slate-700">
                        {activeVocab.chinese}
                      </div>
                    )}
                  </div>
                </div>

                {activeVocab.isVegetable && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-emerald-900">
                      Remember: <strong>{activeVocab.word}</strong> is a{' '}
                      <strong>vegetable</strong>!
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void speakEnglish(`vegetable, ${activeVocab.word}`, speechRate)
                      }
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer"
                    >
                      Hear Both
                    </button>
                  </div>
                )}

                {/* Audio playback buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void speakEnglish(activeVocab.word, speechRate)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen Again
                  </button>
                  <button
                    type="button"
                    onClick={() => void speakEnglish(activeVocab.word, 0.62)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Slow
                  </button>
                </div>

                {/* Primary Follow-and-Read Actions */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-600">
                    Say “{activeVocab.word}” aloud, then confirm:
                    {showChinese && ` 请大声跟读 “${activeVocab.word}”`}
                  </div>

                  {micSupported && (
                    <button
                      type="button"
                      onClick={() => void handleMicCheck()}
                      disabled={isListeningMic}
                      className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-display font-bold text-base transition-colors whitespace-nowrap cursor-pointer ${
                        isListeningMic
                          ? 'bg-rose-600 text-white'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                      {isListeningMic
                        ? `Listening for "${activeVocab.word}"...`
                        : `Speak in Mic (+30 pts)`}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => completeReadAloud(false)}
                    disabled={isListeningMic}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-base rounded-xl transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {allLayersDone
                      ? `I Read “sandwich”! (+20 pts)`
                      : `I Read “${activeVocab.word}”! (+20 pts)`}
                  </button>
                </div>

                {micFeedback && (
                  <div className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 rounded-xl p-3">
                    {micFeedback}
                  </div>
                )}

                {statusMessage && (
                  <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{statusMessage.text}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 py-2">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-xs font-semibold text-amber-700">
                    Step 2 · Layer #{stackedLayers.length + 1}
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                    Pick Your Next Ingredient!
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Tap any ingredient in your basket on the left to put Layer #{stackedLayers.length + 1} onto the sandwich and read the word aloud.
                  {showChinese && ' 请点击左侧购物篮里的任意食材，把它一层一层加到三明治上并跟着读！'}
                </p>

                <div className="space-y-2 pt-1">
                  {basket
                    .filter((id) => !stackedLayers.includes(id))
                    .map((id) => {
                      const item = VOCAB_ITEMS[id];
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectLayerToAdd(id)}
                          className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <VocabImage
                              src={item.imageUrl}
                              alt={item.word}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100"
                            />
                            <div className="text-left">
                              <div className="font-display font-bold text-sm text-slate-900">
                                Add {item.word}
                              </div>
                              {showChinese && (
                                <div className="text-xs text-slate-500">{item.chinese}</div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-600" />
                        </button>
                      );
                    })}
                </div>

                {statusMessage && (
                  <div className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>{statusMessage.text}</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  // -------------------- VIEW: CELEBRATION --------------------
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5">
          <div className="aspect-square rounded-2xl overflow-hidden border border-amber-200 bg-amber-50/40 p-3">
            <VocabImage
              src={VOCAB_ITEMS.sandwich.imageUrl}
              alt="Completed delicious sandwich"
              fallbackLabel="Yummy Sandwich"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        <div className="md:col-span-7 space-y-5">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-emerald-700">
              Sandwich Complete · Saved to Class Leaderboard
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Great Job, {studentName.trim() || 'Super Chef'}!
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              You shopped for all ingredients and read every English word aloud to make a delicious{' '}
              <strong className="text-slate-900">sandwich</strong>!
              {showChinese && ' 太棒了！你的得分已经记录到班级分数排行榜！'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="text-xs text-amber-800">Total Score</div>
              <div className="font-mono-nums text-2xl font-bold text-amber-700 mt-0.5">
                {score}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-xs text-slate-600">Words Read</div>
              <div className="font-mono-nums text-2xl font-bold text-slate-900 mt-0.5">
                {wordsSpoken}
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="text-xs text-emerald-800">Mic Stars</div>
              <div className="font-mono-nums text-2xl font-bold text-emerald-700 mt-0.5">
                {micBonusCount}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                const nextIndex =
                  (SANDWICH_ORDERS.findIndex((o) => o.id === selectedOrder.id) + 1) %
                  SANDWICH_ORDERS.length;
                onSelectOrder(SANDWICH_ORDERS[nextIndex]);
                setPhase('TITLE_MENU');
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-sm rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Play Next Order
            </button>

            <button
              type="button"
              onClick={() => {
                onStudentNameChange('');
                setPhase('TITLE_MENU');
              }}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Next Student
            </button>

            <button
              type="button"
              onClick={onNavigateLeaderboard}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
