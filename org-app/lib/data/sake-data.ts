export interface SakeProfile {
  id: string;
  name: string;
  brewery: string;
  price: number;
  alcoholContent: number;
  riceMilling: number;
  sweetness: number; // 1-10 (1: 辛口, 10: 甘口) - 内部使用、日本酒度から変換
  richness: number; // 1-10 (1: 淡麗, 10: 濃醇)
  acidity: number; // 実際の酸度値 (0.8-2.5程度)
  aroma: number; // 1-10 (1: 控えめ, 10: 華やか)
  type: '純米' | '純米吟醸' | '純米大吟醸' | '吟醸' | '大吟醸' | '本醸造' | '普通酒' | '純米酒' | '吟醸酒';
  prefecture: string;
  description: string;
  imageUrl?: string;
  ecUrl: string;
  tags: string[];
  sakeTypeCategory?: '薫酒' | '爽酒' | '醇酒' | '熟酒'; // 4タイプ分類
  // マトリックス基準: 正確な日本酒度と酸度
  nihonshuDegree?: number; // 日本酒度 (マトリックス範囲: -5～+18)
  realAcidity?: number; // 実際の酸度 (マトリックス範囲: 0～3.0)
}

// 「おさけとお料理マトリックス」CSV データから生成された日本酒データ
export const sakeData: SakeProfile[] = [
  // CSVマトリックス基準: 〇〇正宗（純米酒、日本酒度-2、酸度1、度数12、Aタイプ、価格1500）
  {
    id: "marumarushomune_junmai_720",
    name: "〇〇正宗 純米酒 720ml",
    brewery: "正宗酒造",
    price: 1500,
    alcoholContent: 12.0,
    riceMilling: 65,
    sweetness: 6.0, // 日本酒度-2から算出
    richness: 4.5,  // Aタイプ（薫酒）
    acidity: 1.0,   // マトリックス値そのまま
    aroma: 8.5,     // Aタイプは香り高い
    type: "純米酒",
    prefecture: "新潟県",
    description: "マトリックスデータ基準の純米酒。日本酒度-2、酸度1.0のAタイプ。やわらかな甘みと上品な香りが特徴。",
    imageUrl: "https://example.com/marumarushomune.jpg",
    ecUrl: "https://issendo.jp/?pid=marumarushomune_junmai",
    tags: ["純米酒", "Aタイプ", "お手頃", "やわらか", "甘み"],
    sakeTypeCategory: "薫酒",
    nihonshuDegree: -2,
    realAcidity: 1.0
  },
  
  // CSVマトリックス基準: ××錦（吟醸酒、日本酒度10、酸度2、度数18、Bタイプ、価格2000）  
  {
    id: "batsunishiki_ginjo_720",
    name: "××錦 吟醸酒 720ml", 
    brewery: "錦酒造",
    price: 2000,
    alcoholContent: 18.0,
    riceMilling: 60,
    sweetness: 1.2, // 日本酒度10から算出（大辛口）
    richness: 4.0,  // Bタイプ（爽酒）
    acidity: 2.0,   // マトリックス値そのまま
    aroma: 6.0,     // Bタイプはバランス良い
    type: "吟醸酒",
    prefecture: "京都府", 
    description: "マトリックスデータ基準の吟醸酒。日本酒度10、酸度2.0のBタイプ。高アルコールの力強い大辛口。",
    imageUrl: "https://example.com/batsunishiki.jpg",
    ecUrl: "https://issendo.jp/?pid=batsunishiki_ginjo",
    tags: ["吟醸酒", "Bタイプ", "大辛口", "高アルコール", "力強い"],
    sakeTypeCategory: "爽酒",
    nihonshuDegree: 10,
    realAcidity: 2.0
  },

  // CSVマトリックス基準: △△男山（普通酒、日本酒度3、酸度1、度数15、Cタイプ、価格1000）
  {
    id: "sankakuotokoyama_futsushu_720",
    name: "△△男山 普通酒 720ml",
    brewery: "男山酒造", 
    price: 1000,
    alcoholContent: 15.0,
    riceMilling: 70,
    sweetness: 3.8, // 日本酒度3から算出（辛口）
    richness: 7.5,  // Cタイプ（醇酒）
    acidity: 1.0,   // マトリックス値そのまま
    aroma: 5.5,     // Cタイプはコクあり
    type: "普通酒",
    prefecture: "北海道",
    description: "マトリックスデータ基準の普通酒。日本酒度3、酸度1.0のCタイプ。コストパフォーマンス抜群の辛口。",
    imageUrl: "https://example.com/sankakuotokoyama.jpg", 
    ecUrl: "https://issendo.jp/?pid=sankakuotokoyama_futsushu",
    tags: ["普通酒", "Cタイプ", "コスパ良", "辛口", "濃醇"],
    sakeTypeCategory: "醇酒",
    nihonshuDegree: 3,
    realAcidity: 1.0
  }
];

/**
 * 日本酒度から甘辛度スケール(1-10)に変換
 * 日本酒度+6以上=1(大辛口), -6以下=10(大甘口)
 */
export function convertNihonshuDegreeToSweetness(nihonshuDegree: number): number {
  // 日本酒度を1-10スケールに変換（線形変換）
  // +6→1, +0→4, -6→10 の関係
  const sweetness = 4 - (nihonshuDegree / 3);
  return Math.max(1, Math.min(10, sweetness));
}

/**
 * 甘辛度スケール(1-10)から日本酒度に逆変換
 */
export function convertSweetnessToNihonshuDegree(sweetness: number): number {
  return (4 - sweetness) * 3;
}

export const getRandomSakes = (count: number = 3): SakeProfile[] => {
  const shuffled = [...sakeData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};