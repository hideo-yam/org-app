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
  type: '純米' | '純米吟醸' | '純米大吟醸' | '吟醸' | '大吟醸' | '本醸造' | '普通酒' | '純米酒' | '吟醸酒';
  prefecture: string;
  description: string;
  imageUrl?: string;
  ecUrl: string;
  tags: string[];
  sakeTypeCategory?: '薫酒' | '爽酒' | '醇酒' | '熟酒'; // 4タイプ分類
}

// issendo.jpで取り扱われている実際の日本酒商品データ
export const sakeData: SakeProfile[] = [
  // ヒカリ正宗シリーズ
  {
    id: "hikari_masamune_junmai_1800",
    name: "ヒカリ正宗 純米酒 1800ml",
    brewery: "光正宗酒造",
    price: 3960,
    alcoholContent: 15.5,
    riceMilling: 65,
    sweetness: 5.0, // 日本酒度+3程度（中口）
    richness: 6.0,
    acidity: 1.3, // 実酸度1.3
    aroma: 5.0,
    type: "純米酒",
    prefecture: "福岡県",
    description: "米の旨味を活かした純米酒。バランスの良い味わいで食事との相性も抜群。",
    ecUrl: "https://issendo.jp/",
    tags: ["人気", "コスパ良", "食事に合う", "バランス"],
    sakeTypeCategory: "醇酒"
  },
  {
    id: "harukaku_junmai_720",
    name: "春鶴 純米酒 47 Quatre Sept 720ml",
    brewery: "春鶴酒造",
    price: 2475,
    alcoholContent: 15.0,
    riceMilling: 60,
    sweetness: 4.5, // 日本酒度+4.5程度（やや辛口）
    richness: 5.5,
    acidity: 1.4, // 実酸度1.4
    aroma: 7.0,
    type: "純米酒",
    prefecture: "広島県",
    description: "春鶴酒造の代表作。やや辛口でキレがあり、食事との相性が抜群。",
    ecUrl: "https://issendo.jp/",
    tags: ["やや辛口", "キレ", "食事に合う", "おすすめ"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "fukuda_junmai_500",
    name: "福田 純米酒 500g",
    brewery: "福田酒造",
    price: 495,
    alcoholContent: 14.5,
    riceMilling: 70,
    sweetness: 5.5, // 日本酒度+1.5程度（中口よりやや甘め）
    richness: 5.0,
    acidity: 1.2,
    aroma: 4.5,
    type: "純米酒",
    prefecture: "佐賀県",
    description: "手頃な価格で楽しめる純米酒。まろやかな口当たりで日本酒初心者にもおすすめ。",
    ecUrl: "https://issendo.jp/",
    tags: ["初心者向け", "まろやか", "手頃", "コスパ良"],
    sakeTypeCategory: "醇酒"
  },
  
  // 熊本系列
  {
    id: "kumamoto_junmai_720",
    name: "熊本 純米酒 蔵元 720ml",
    brewery: "熊本蔵元",
    price: 1100,
    alcoholContent: 15.0,
    riceMilling: 65,
    sweetness: 4.8, // 日本酒度+3.6程度（やや辛口）
    richness: 5.5,
    acidity: 1.3,
    aroma: 5.5,
    type: "純米酒",
    prefecture: "熊本県",
    description: "熊本の蔵元が手がける純米酒。やや辛口でスッキリとした味わい。地元の水と米を使用。",
    ecUrl: "https://issendo.jp/",
    tags: ["地酒", "やや辛口", "スッキリ", "コスパ良"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "takano_junmai_720",
    name: "高野 純米酒 720ml",
    brewery: "高野酒造",
    price: 1320,
    alcoholContent: 15.5,
    riceMilling: 60,
    sweetness: 4.2, // やや辛口
    richness: 5.5,
    acidity: 1.2,
    aroma: 5.0,
    type: "純米酒",
    prefecture: "新潟県",
    description: "新潟の地酒らしいすっきりとした辛口。米の旨味と清涼感のバランスが良い純米酒。",
    ecUrl: "https://issendo.jp/",
    tags: ["地酒", "やや辛口", "すっきり", "コスパ良"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "meikyou_junmai_500",
    name: "明鏡 純米酒 500ml",
    brewery: "明鏡酒造",
    price: 880,
    alcoholContent: 14.8,
    riceMilling: 65,
    sweetness: 5.0, // 中口
    richness: 5.2,
    acidity: 1.3,
    aroma: 4.8,
    type: "純米酒",
    prefecture: "岩手県",
    description: "岩手の清らかな水で仕込んだ純米酒。まろやかな口当たりで初心者にも親しみやすい味わい。",
    ecUrl: "https://issendo.jp/",
    tags: ["初心者向け", "まろやか", "中口", "コスパ良"],
    sakeTypeCategory: "醇酒"
  },

  // いせん堂セレクト吟醸シリーズ
  {
    id: "kanazawa_junmai_daiginjo",
    name: "金沢 純米大吟醸 720ml",
    brewery: "金沢酒造",
    price: 3200,
    alcoholContent: 15.2,
    riceMilling: 45,
    sweetness: 4.5, // やや辛口
    richness: 5.8,
    acidity: 1.4,
    aroma: 7.8,
    type: "純米大吟醸",
    prefecture: "石川県",
    description: "石川県産の上質な酒米を使用した純米大吟醸。華やかな香りと繊細でバランスの取れた味わい。",
    ecUrl: "https://issendo.jp/",
    tags: ["華やか", "繊細", "バランス", "上質"],
    sakeTypeCategory: "薫酒"
  },
  {
    id: "azuma_tokubetsu_honjozo",
    name: "東山 特別本醸造 720ml",
    brewery: "東山酒造",
    price: 1150,
    alcoholContent: 15.3,
    riceMilling: 55,
    sweetness: 4.1, // やや辛口
    richness: 5.8,
    acidity: 1.3,
    aroma: 5.5,
    type: "本醸造",
    prefecture: "福島県",
    description: "福島の清らかな水で仕込んだ特別本醸造。バランスの良い辛口で食事との相性が抜群。",
    ecUrl: "https://issendo.jp/",
    tags: ["バランス良", "やや辛口", "食事に合う", "万能"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "shirakiku_futsushu",
    name: "白菊 普通酒 1800ml",
    brewery: "白菊酒造",
    price: 1650,
    alcoholContent: 15.0,
    riceMilling: 70,
    sweetness: 4.5, // 中口
    richness: 5.2,
    acidity: 1.2,
    aroma: 4.2,
    type: "普通酒",
    prefecture: "高知県",
    description: "高知の代表的な普通酒。すっきりとした飲み口で毎日の晩酌にぴったり。",
    ecUrl: "https://issendo.jp/",
    tags: ["晩酌", "すっきり", "日常飲み", "大容量", "コスパ良"],
    sakeTypeCategory: "爽酒"
  },

  // いせん堂プレミアムセレクション
  {
    id: "iwanoi_junmai_daiginjo",
    name: "岩の井 純米大吟醸 720ml",
    brewery: "岩の井酒造",
    price: 4400,
    alcoholContent: 15.8,
    riceMilling: 40,
    sweetness: 5.2, // 中口よりやや甘め
    richness: 6.2,
    acidity: 1.3,
    aroma: 8.0,
    type: "純米大吟醸",
    prefecture: "千葉県",
    description: "千葉県の蔵元が丹精込めて醸した純米大吟醸。上品な香りと深みのある味わいが特徴的。",
    ecUrl: "https://issendo.jp/",
    tags: ["上品", "深み", "丹精", "千葉"],
    sakeTypeCategory: "薫酒"
  },
  {
    id: "otokoyama_honjozo",
    name: "男山 本醸造 1800ml",
    brewery: "男山酒造",
    price: 2200,
    alcoholContent: 15.5,
    riceMilling: 65,
    sweetness: 4.0, // やや辛口
    richness: 5.8,
    acidity: 1.4,
    aroma: 5.8,
    type: "本醸造",
    prefecture: "北海道",
    description: "北海道の清冽な水で仕込んだ本醸造酒。キリッとした辛口で力強い味わい。",
    ecUrl: "https://issendo.jp/",
    tags: ["北海道", "キリッと", "辛口", "力強い"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "yamakawa_tokubetsu_junmai",
    name: "山川 特別純米酒 720ml",
    brewery: "山川酒造",
    price: 1650,
    alcoholContent: 15.2,
    riceMilling: 58,
    sweetness: 5.3, // 中口
    richness: 6.5,
    acidity: 1.4,
    aroma: 5.5,
    type: "純米酒",
    prefecture: "山形県",
    description: "山形県産の良質な酒造好適米を使用した特別純米酒。米の旨味がしっかりと感じられる濃醇な味わい。",
    ecUrl: "https://issendo.jp/",
    tags: ["山形", "米の旨味", "濃醇", "酒造好適米"],
    sakeTypeCategory: "醇酒"
  }
];

export const getRandomSakes = (count: number = 3): SakeProfile[] => {
  const shuffled = [...sakeData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};