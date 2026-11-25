export type VocabId = 'sandwich' | 'cheese' | 'vegetable' | 'salad' | 'tomato' | 'egg';
export type IngredientId = 'cheese' | 'salad' | 'tomato' | 'egg';

export interface VocabItem {
  id: VocabId;
  word: string;
  syllables: string;
  ipa: string;
  chinese: string;
  categoryLabel: string;
  categoryZh: string;
  isVegetable?: boolean;
  spokenPrompt: string;
  exampleSentence: string;
  exampleZh: string;
  imageUrl: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  aliases: string[];
}

export interface SandwichOrder {
  id: string;
  title: string;
  titleZh: string;
  customerName: string;
  description: string;
  descriptionZh: string;
  requiredIngredients: IngredientId[];
}

export const SUPERMARKET_HERO_IMAGE = '/src/assets/images/supermarket_aisle_hero_1795604441202.jpg';

export const VOCAB_ITEMS: Record<VocabId, VocabItem> = {
  sandwich: {
    id: 'sandwich',
    word: 'sandwich',
    syllables: 'sand · wich',
    ipa: '/ˈsænwɪtʃ/',
    chinese: '三明治',
    categoryLabel: 'Main Dish',
    categoryZh: '美味主食',
    spokenPrompt: 'sandwich',
    exampleSentence: 'Let us make a yummy sandwich!',
    exampleZh: '让我们做一个美味的三明治吧！',
    imageUrl: '/src/assets/images/vocab_sandwich_card_1795604441038.jpg',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200',
    aliases: ['sandwich', 'sandwiches', 'sanwich', 'sandwish', 'sandwitch'],
  },
  cheese: {
    id: 'cheese',
    word: 'cheese',
    syllables: 'cheese',
    ipa: '/tʃiːz/',
    chinese: '奶酪',
    categoryLabel: 'Dairy',
    categoryZh: '乳制品',
    spokenPrompt: 'cheese',
    exampleSentence: 'I like yellow cheese in my sandwich.',
    exampleZh: '我喜欢在三明治里放黄色的奶酪。',
    imageUrl: '/src/assets/images/vocab_cheese_card_1795604440567.jpg',
    accentBg: 'bg-yellow-50',
    accentText: 'text-yellow-800',
    accentBorder: 'border-yellow-200',
    aliases: ['cheese', 'chees', 'cheeze', 'sheese', 'cheez', 'geese'],
  },
  vegetable: {
    id: 'vegetable',
    word: 'vegetable',
    syllables: 'veg · e · ta · ble',
    ipa: '/ˈvedʒtəbl/',
    chinese: '蔬菜',
    categoryLabel: 'Food Group',
    categoryZh: '食物类别',
    spokenPrompt: 'vegetable',
    exampleSentence: 'Salad and tomato are healthy vegetables.',
    exampleZh: '生菜沙拉和番茄都是健康的蔬菜。',
    imageUrl: '/src/assets/images/vocab_salad_card_1795604441054.jpg',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-800',
    accentBorder: 'border-emerald-200',
    aliases: ['vegetable', 'vegetables', 'veggie', 'veggies', 'vegetal'],
  },
  salad: {
    id: 'salad',
    word: 'salad',
    syllables: 'sal · ad',
    ipa: '/ˈsæləd/',
    chinese: '蔬菜沙拉 · 生菜',
    categoryLabel: 'Vegetable',
    categoryZh: '蔬菜类',
    isVegetable: true,
    spokenPrompt: 'vegetable, salad',
    exampleSentence: 'Put fresh green salad on the bread.',
    exampleZh: '把新鲜的绿色生菜沙拉放到面包上。',
    imageUrl: '/src/assets/images/vocab_salad_card_1795604441054.jpg',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-800',
    accentBorder: 'border-emerald-200',
    aliases: ['salad', 'salads', 'salat', 'solid', 'salad vegetable', 'vegetable salad'],
  },
  tomato: {
    id: 'tomato',
    word: 'tomato',
    syllables: 'to · ma · to',
    ipa: '/təˈmeɪtəʊ/',
    chinese: '番茄 · 西红柿',
    categoryLabel: 'Vegetable',
    categoryZh: '蔬菜类',
    isVegetable: true,
    spokenPrompt: 'vegetable, tomato',
    exampleSentence: 'Add a juicy red tomato slice.',
    exampleZh: '加上一片多汁的红番茄。',
    imageUrl: '/src/assets/images/vocab_tomato_card_1795604441009.jpg',
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-800',
    accentBorder: 'border-rose-200',
    aliases: ['tomato', 'tomatoes', 'tomatos', 'tomata', 'tomato vegetable', 'vegetable tomato'],
  },
  egg: {
    id: 'egg',
    word: 'egg',
    syllables: 'egg',
    ipa: '/eɡ/',
    chinese: '鸡蛋',
    categoryLabel: 'Protein',
    categoryZh: '蛋类营养',
    spokenPrompt: 'egg',
    exampleSentence: 'One sunny egg makes the sandwich tasty!',
    exampleZh: '一个煎蛋让三明治更香更美味！',
    imageUrl: '/src/assets/images/vocab_egg_card_1795604441771.jpg',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-800',
    accentBorder: 'border-orange-200',
    aliases: ['egg', 'eggs', 'eg', 'ache', 'eck'],
  },
};

export const SUPERMARKET_INGREDIENTS: IngredientId[] = ['cheese', 'salad', 'tomato', 'egg'];

export const ALL_VOCAB_LIST: VocabItem[] = [
  VOCAB_ITEMS.sandwich,
  VOCAB_ITEMS.cheese,
  VOCAB_ITEMS.vegetable,
  VOCAB_ITEMS.salad,
  VOCAB_ITEMS.tomato,
  VOCAB_ITEMS.egg,
];

export const SANDWICH_ORDERS: SandwichOrder[] = [
  {
    id: 'classic',
    title: 'Order 1: Classic Sunshine Sandwich',
    titleZh: '订单一：经典阳光三明治',
    customerName: 'Chef Mia',
    description: 'Pick cheese, salad (vegetable), tomato (vegetable), and egg!',
    descriptionZh: '去超市选奶酪、蔬菜沙拉、番茄和鸡蛋，然后跟着读做三明治！',
    requiredIngredients: ['cheese', 'salad', 'tomato', 'egg'],
  },
  {
    id: 'veggie',
    title: 'Order 2: Fresh Vegetable Sandwich',
    titleZh: '订单二：鲜蔬活力三明治',
    customerName: 'Rabbit Leo',
    description: 'Pick salad (vegetable), tomato (vegetable), and cheese!',
    descriptionZh: '选择两种蔬菜（沙拉、番茄）和奶酪，完成健康三明治！',
    requiredIngredients: ['salad', 'tomato', 'cheese'],
  },
  {
    id: 'protein',
    title: 'Order 3: Breakfast Energy Sandwich',
    titleZh: '订单三：早餐能量三明治',
    customerName: 'Bear Sam',
    description: 'Pick egg, cheese, and tomato (vegetable)!',
    descriptionZh: '挑选鸡蛋、奶酪和番茄，跟读单词做早餐三明治！',
    requiredIngredients: ['egg', 'cheese', 'tomato'],
  },
];
