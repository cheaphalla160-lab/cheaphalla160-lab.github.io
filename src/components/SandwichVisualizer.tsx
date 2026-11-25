import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { IngredientId, VOCAB_ITEMS, VocabId } from '../data/vocabData';

interface SandwichVisualizerProps {
  layers: IngredientId[];
  pendingTarget: VocabId | null;
  hasTopBread: boolean;
  showChinese: boolean;
  onSpeakWord: (word: string) => void;
}

function LayerSvg({ type }: { type: IngredientId }) {
  switch (type) {
    case 'cheese':
      return (
        <svg viewBox="0 0 280 42" className="w-64 h-10 drop-shadow-sm" aria-hidden="true">
          <path
            d="M16 14 L264 14 L272 28 Q230 38 190 26 Q145 39 100 25 Q55 37 12 26 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="74" cy="21" r="4.5" fill="#FEF08A" />
          <circle cx="154" cy="20" r="5" fill="#FEF08A" />
          <circle cx="218" cy="21" r="4" fill="#FEF08A" />
        </svg>
      );
    case 'salad':
      return (
        <svg viewBox="0 0 280 44" className="w-68 h-11 drop-shadow-sm" aria-hidden="true">
          <path
            d="M14 24 Q30 8 52 20 Q74 6 96 20 Q118 6 140 20 Q162 6 184 20 Q206 6 228 20 Q250 8 266 24 Q248 38 224 30 Q200 40 176 30 Q148 40 124 30 Q96 40 72 30 Q44 38 14 24 Z"
            fill="#4ADE80"
            stroke="#15803D"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M42 24 Q70 18 92 25 M128 23 Q155 17 178 24 M200 24 Q225 18 244 24"
            fill="none"
            stroke="#86EFAC"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'tomato':
      return (
        <svg viewBox="0 0 280 38" className="w-62 h-9 drop-shadow-sm" aria-hidden="true">
          <rect x="24" y="10" width="108" height="20" rx="10" fill="#EF4444" stroke="#B91C1C" strokeWidth="3" />
          <ellipse cx="56" cy="20" rx="14" ry="4" fill="#FCA5A5" opacity="0.65" />
          <ellipse cx="98" cy="20" rx="14" ry="4" fill="#FCA5A5" opacity="0.65" />
          <rect x="148" y="10" width="108" height="20" rx="10" fill="#EF4444" stroke="#B91C1C" strokeWidth="3" />
          <ellipse cx="180" cy="20" rx="14" ry="4" fill="#FCA5A5" opacity="0.65" />
          <ellipse cx="222" cy="20" rx="14" ry="4" fill="#FCA5A5" opacity="0.65" />
        </svg>
      );
    case 'egg':
      return (
        <svg viewBox="0 0 280 42" className="w-64 h-10 drop-shadow-sm" aria-hidden="true">
          <path
            d="M28 24 Q20 12 48 12 Q88 8 140 12 Q196 8 236 14 Q262 18 250 28 Q210 36 140 34 Q70 36 28 24 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="3"
          />
          <ellipse cx="140" cy="18" rx="34" ry="11" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
          <ellipse cx="131" cy="15" rx="9" ry="3" fill="#FEF3C7" />
        </svg>
      );
  }
}

function TopBreadSvg() {
  return (
    <svg viewBox="0 0 280 56" className="w-64 h-14 drop-shadow-md" aria-hidden="true">
      <path
        d="M22 30 Q20 8 76 8 L204 8 Q260 8 258 30 L254 44 Q252 50 242 50 L38 50 Q28 50 26 44 Z"
        fill="#FDE68A"
        stroke="#B45309"
        strokeWidth="3.5"
      />
      <path
        d="M36 22 Q140 16 244 22"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function SandwichVisualizer({
  layers,
  pendingTarget,
  hasTopBread,
  showChinese,
  onSpeakWord,
}: SandwichVisualizerProps) {
  const isPendingIngredient =
    pendingTarget !== null && pendingTarget !== 'sandwich' && !hasTopBread;
  const isPendingTopBread = pendingTarget === 'sandwich' && !hasTopBread;

  return (
    <div className="relative flex flex-col items-center justify-end min-h-[380px] w-full py-6 px-4 bg-gradient-to-b from-sky-50/70 to-amber-50/50 rounded-2xl border border-slate-200">
      {/* Top status bar inside plate stage */}
      <div className="w-full flex items-center justify-between text-xs text-slate-600 mb-4 px-2">
        <span className="font-semibold text-slate-800">
          Sandwich Plate {showChinese && '· 三明治制作台'}
        </span>
        <span className="font-mono-nums">
          Layers: {layers.length} {hasTopBread ? '· Complete!' : ''}
        </span>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-end">
        {/* Hovering Preview Layer waiting to be read aloud */}
        <AnimatePresence mode="wait">
          {isPendingIngredient && pendingTarget && (
            <motion.div
              key={`pending-${pendingTarget}`}
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center mb-3 z-30"
            >
              <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg mb-1.5 flex items-center gap-1.5">
                <span>
                  Read “{VOCAB_ITEMS[pendingTarget].word}” to add Layer #{layers.length + 1}
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="opacity-70 scale-95">
                <LayerSvg type={pendingTarget as IngredientId} />
              </div>
            </motion.div>
          )}

          {isPendingTopBread && (
            <motion.div
              key="pending-top-bread"
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center mb-3 z-30"
            >
              <div className="text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-lg mb-1.5 flex items-center gap-1.5">
                <span>
                  Final Step: Read “sandwich” to close the top bread!
                  {showChinese && ' 读 sandwich 盖上面包！'}
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="opacity-75 scale-95">
                <TopBreadSvg />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed Top Bread Slice */}
        <AnimatePresence>
          {hasTopBread && (
            <motion.div
              initial={{ opacity: 0, y: -56, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="relative z-20 -mb-2 flex flex-col items-center"
            >
              <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-display font-bold rounded-lg shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Yummy Sandwich!
              </div>
              <button
                type="button"
                onClick={() => onSpeakWord('sandwich')}
                className="cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 rounded-xl hover:scale-105 transition-transform"
                title="Click to hear sandwich"
              >
                <TopBreadSvg />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stacked Ingredient Layers (Bottom -> Top) */}
        <div className="flex flex-col-reverse items-center w-full z-10">
          <AnimatePresence initial={false}>
            {layers.map((layerId, index) => {
              const vocab = VOCAB_ITEMS[layerId];
              return (
                <motion.div
                  key={`${layerId}-${index}`}
                  initial={{ opacity: 0, y: -42, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  className="relative flex items-center justify-center -my-1.5 w-full"
                >
                  <button
                    type="button"
                    onClick={() => onSpeakWord(vocab.spokenPrompt)}
                    className="cursor-pointer transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg"
                    title={`Click to hear ${vocab.word}`}
                  >
                    <LayerSvg type={layerId} />
                  </button>
                  <div className="hidden sm:flex items-center gap-1.5 ml-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                    <span className="font-mono-nums text-slate-400">#{index + 1}</span>
                    <span className="font-display font-bold text-slate-900">{vocab.word}</span>
                    {vocab.isVegetable && (
                      <span className="text-emerald-700">· vegetable</span>
                    )}
                    {showChinese && (
                      <span className="text-slate-500">· {vocab.chinese}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Bread Slice */}
        <div className="relative z-0 -mt-1 flex items-center justify-center">
          <svg viewBox="0 0 280 46" className="w-64 h-12 drop-shadow-sm" aria-hidden="true">
            <path
              d="M28 14 L252 14 Q260 14 258 26 L252 36 Q248 42 238 42 L42 42 Q32 42 28 36 L22 26 Q20 14 28 14 Z"
              fill="#FCD34D"
              stroke="#B45309"
              strokeWidth="3.5"
            />
          </svg>
        </div>

        {/* Porcelain Plate */}
        <div className="w-80 h-6 -mt-2 rounded-full bg-white border-2 border-slate-200 shadow-sm" />
      </div>

      {/* Layer Summary Text */}
      <div className="mt-5 text-center text-sm text-slate-600">
        {layers.length === 0 && !isPendingIngredient ? (
          <span>
            Bottom bread is ready! Pick an ingredient below to stack Layer #1.
            {showChinese && ' 底层面包已就绪，点击下方食材开始一层一层叠加吧！'}
          </span>
        ) : hasTopBread ? (
          <span className="font-display font-bold text-base text-amber-700">
            Sandwich complete! · {layers.map((id) => VOCAB_ITEMS[id].word).join(' → ')} → sandwich
          </span>
        ) : (
          <span>
            Stacked ({layers.length}): {layers.length > 0 ? layers.map((id) => VOCAB_ITEMS[id].word).join(' → ') : 'Bread base'}
          </span>
        )}
      </div>
    </div>
  );
}
