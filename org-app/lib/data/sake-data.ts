export interface SakeProfile {
  id: string;
  name: string;
  brewery: string;
  price: number;
  alcoholContent: number;
  riceMilling: number;
  sweetness: number; // 1-10 (1: 辛口, 10: 甘口)
  richness: number; // 1-10 (1: 淡麗, 10: 濃醇)
  acidity: number; // 1-10 (1: 低酸, 10: 高酸)
  aroma: number; // 1-10 (1: 控えめ, 10: 華やか)
  type: '純米' | '純米吟醸' | '純米大吟醸' | '吟醸' | '大吟醸' | '本醸造' | '普通酒';
  prefecture: string;
  description: string;
  imageUrl?: string;
  ecUrl: string;
  tags: string[];
}

export const sakeData: SakeProfile[] = [
  {
    id: 'sake001',
    name: '獺祭 純米大吟醸45',
    brewery: '旭酒造',
    price: 3300,
    alcoholContent: 16,
    riceMilling: 45,
    sweetness: 6,
    richness: 4,
    acidity: 3,
    aroma: 8,
    type: '純米大吟醸',
    prefecture: '山口県',
    description: 'フルーティーで華やかな香りが特徴の人気銘柄。日本酒初心者にもおすすめ。',
    ecUrl: 'https://example-ec.com/sake001',
    tags: ['初心者向け', 'フルーティー', '人気']
  },
  {
    id: 'sake002',
    name: '久保田 千寿',
    brewery: '朝日酒造',
    price: 2420,
    alcoholContent: 15,
    riceMilling: 50,
    sweetness: 4,
    richness: 5,
    acidity: 4,
    aroma: 5,
    type: '吟醸',
    prefecture: '新潟県',
    description: 'すっきりとした辛口で、食事との相性が抜群。定番の美味しさ。',
    ecUrl: 'https://example-ec.com/sake002',
    tags: ['辛口', '食事に合う', '定番']
  },
  {
    id: 'sake003',
    name: '八海山 特別純米酒',
    brewery: '八海醸造',
    price: 2750,
    alcoholContent: 15.5,
    riceMilling: 55,
    sweetness: 3,
    richness: 6,
    acidity: 5,
    aroma: 4,
    type: '純米',
    prefecture: '新潟県',
    description: '清らかでキレの良い味わい。冷やから燗まで幅広く楽しめる。',
    ecUrl: 'https://example-ec.com/sake003',
    tags: ['辛口', '万能', 'すっきり']
  },
  {
    id: 'sake004',
    name: '黒龍 いっちょらい',
    brewery: '黒龍酒造',
    price: 1980,
    alcoholContent: 15,
    riceMilling: 65,
    sweetness: 5,
    richness: 5,
    acidity: 4,
    aroma: 6,
    type: '純米',
    prefecture: '福井県',
    description: 'バランスの良い味わいで、日常酒として親しまれている。コストパフォーマンス抜群。',
    ecUrl: 'https://example-ec.com/sake004',
    tags: ['コスパ良', 'バランス', '日常酒']
  },
  {
    id: 'sake005',
    name: '松竹梅 白壁蔵 澪',
    brewery: '宝酒造',
    price: 1650,
    alcoholContent: 5,
    riceMilling: 70,
    sweetness: 8,
    richness: 3,
    acidity: 6,
    aroma: 7,
    type: '普通酒',
    prefecture: '京都府',
    description: 'スパークリング日本酒。甘口で飲みやすく、女性に人気。',
    ecUrl: 'https://example-ec.com/sake005',
    tags: ['甘口', 'スパークリング', '女性向け', '低アルコール']
  },
  {
    id: 'sake006',
    name: '雪の茅舎 純米吟醸',
    brewery: '齋彌酒造店',
    price: 3850,
    alcoholContent: 16,
    riceMilling: 55,
    sweetness: 5,
    richness: 7,
    acidity: 3,
    aroma: 6,
    type: '純米吟醸',
    prefecture: '秋田県',
    description: '深い味わいと上品な香り。じっくり味わいたい上質な日本酒。',
    ecUrl: 'https://example-ec.com/sake006',
    tags: ['上品', '深い味わい', '高級']
  },
  {
    id: 'sake007',
    name: '鳳凰美田 純米吟醸',
    brewery: '小林酒造',
    price: 3300,
    alcoholContent: 16,
    riceMilling: 55,
    sweetness: 7,
    richness: 4,
    acidity: 4,
    aroma: 8,
    type: '純米吟醸',
    prefecture: '栃木県',
    description: 'フルーティーで華やかな香り。甘みもありつつバランスの良い味わい。',
    ecUrl: 'https://example-ec.com/sake007',
    tags: ['フルーティー', '華やか', 'バランス良']
  },
  {
    id: 'sake008',
    name: '作 穂乃智',
    brewery: '清水清三郎商店',
    price: 4400,
    alcoholContent: 16,
    riceMilling: 60,
    sweetness: 4,
    richness: 8,
    acidity: 5,
    aroma: 5,
    type: '純米',
    prefecture: '三重県',
    description: '濃醇でコクのある味わい。しっかりとした旨味を感じられる。',
    ecUrl: 'https://example-ec.com/sake008',
    tags: ['濃醇', 'コク', '旨味']
  }
];

export const getRandomSakes = (count: number = 3): SakeProfile[] => {
  const shuffled = [...sakeData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};