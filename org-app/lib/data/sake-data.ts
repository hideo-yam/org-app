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

// エクセルファイルから読み込んだ日本酒データ
export const sakeData: SakeProfile[] = [
  {
    id: "sake001",
    name: "〇〇正宗",
    brewery: "正宗酒造",
    price: 1500,
    alcoholContent: 12.0,
    riceMilling: 70,
    sweetness: 6.7,
    richness: 6.0,
    acidity: 3.0,
    aroma: 6,
    type: "純米酒",
    prefecture: "新潟県",
    description: "純米酒の特徴を活かした、薫酒タイプの日本酒です。やや甘口でまろやかな味わいが特徴。",
    ecUrl: "https://example-ec.com/sake001",
    tags: ["おすすめ", "甘口", "まろやか"],
    sakeTypeCategory: "薫酒"
  },
  {
    id: "sake002",
    name: "××錦",
    brewery: "錦酒造",
    price: 2000,
    alcoholContent: 18.0,
    riceMilling: 55,
    sweetness: 2.7,
    richness: 9.0,
    acidity: 6.0,
    aroma: 8,
    type: "吟醸酒",
    prefecture: "京都府",
    description: "吟醸酒の特徴を活かした、爽酒タイプの日本酒です。華やかな香りと辛口のキレが魅力。",
    ecUrl: "https://example-ec.com/sake002",
    tags: ["辛口", "フルーティー", "華やか", "キレ"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "sake003",
    name: "△△男山",
    brewery: "男山酒造",
    price: 1000,
    alcoholContent: 15.0,
    riceMilling: 70,
    sweetness: 5.0,
    richness: 7.5,
    acidity: 3.0,
    aroma: 4,
    type: "普通酒",
    prefecture: "北海道",
    description: "普通酒の特徴を活かした、醇酒タイプの日本酒です。コストパフォーマンスに優れた日常酒。",
    ecUrl: "https://example-ec.com/sake003",
    tags: ["コスパ良", "日常酒", "バランス"],
    sakeTypeCategory: "醇酒"
  }
];

export const getRandomSakes = (count: number = 3): SakeProfile[] => {
  const shuffled = [...sakeData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};