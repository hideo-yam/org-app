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

// issendo.jpで実際に確認済みの日本酒商品データのみ
export const sakeData: SakeProfile[] = [
  // 確認済み実商品のみ
  {
    id: "seiraku_tokujoshu_kasu_500g",
    name: "清酒 来楽 特醸酒粕 500g",
    brewery: "来楽酒造", // 商品名から推定
    price: 495,
    alcoholContent: 0, // 酒粕のためアルコール度数なし
    riceMilling: 0, // 酒粕のため精米歩合なし
    sweetness: 5.0,
    richness: 5.0,
    acidity: 5.0,
    aroma: 5.0,
    type: "普通酒", // 酒粕なので分類外だが仮設定
    prefecture: "不明",
    description: "酒造りの副産物として生まれる酒粕。風味豊かで様々な用途に使用できる。",
    imageUrl: "https://img07.shop-pro.jp/PA01460/199/product/184593793_th.jpg",
    ecUrl: "https://issendo.jp/?pid=184593793",
    tags: ["酒粕", "手頃", "料理用", "健康"],
    sakeTypeCategory: "醇酒"
  },
  {
    id: "jokura_junmai_karakuchi_720",
    name: "常蔵 純米 辛口酒720ml",
    brewery: "常蔵酒造", // 商品名から推定
    price: 1100,
    alcoholContent: 15.0, // 推定値
    riceMilling: 65, // 推定値
    sweetness: 3.5, // 辛口
    richness: 5.0,
    acidity: 1.4,
    aroma: 5.0,
    type: "純米酒",
    prefecture: "不明",
    description: "スッキリとした辛口の純米酒。キレがあり食事との相性が抜群。",
    imageUrl: "https://img07.shop-pro.jp/PA01460/199/product/184429721_th.jpg",
    ecUrl: "https://issendo.jp/?pid=184429721",
    tags: ["辛口", "キレ", "食事に合う", "コスパ良"],
    sakeTypeCategory: "爽酒"
  },
  {
    id: "tenryosei_junmai_tokubetsu_720",
    name: "天領盛 純米 特別純米 720ml",
    brewery: "天領酒造", // 商品名から推定
    price: 1980,
    alcoholContent: 15.0, // 推定値
    riceMilling: 60, // 推定値
    sweetness: 4.8, // 中口
    richness: 5.8,
    acidity: 1.3,
    aroma: 6.0,
    type: "純米酒",
    prefecture: "不明",
    description: "特別純米酒。米の旨味と上品な香りを持つバランスの良い一本。",
    imageUrl: "https://img07.shop-pro.jp/PA01460/199/product/180215428_th.jpg",
    ecUrl: "https://issendo.jp/?pid=180215428",
    tags: ["特別純米", "バランス良", "上品", "米の旨味"],
    sakeTypeCategory: "醇酒"
  },
  {
    id: "mino_junmai_hitogokochi_720",
    name: "美濃 純米 ひとごこち720ml",
    brewery: "不明酒造",
    price: 1870,
    alcoholContent: 15.0, // 推定値
    riceMilling: 65, // 推定値
    sweetness: 5.0, // 中口
    richness: 5.5,
    acidity: 1.3,
    aroma: 5.8,
    type: "純米酒",
    prefecture: "不明",
    description: "ひとごこち米を使用した純米酒。まろやかで上品な味わい。",
    imageUrl: "https://img07.shop-pro.jp/PA01460/199/product/176124148_th.jpg",
    ecUrl: "https://issendo.jp/?pid=176124148",
    tags: ["ひとごこち", "まろやか", "上品", "中口"],
    sakeTypeCategory: "醇酒"
  },
  {
    id: "akishika_junmai_nama_720",
    name: "秋鹿 純米 生720ml",
    brewery: "秋鹿酒造",
    price: 3000,
    alcoholContent: 16.0, // 推定値
    riceMilling: 60, // 推定値
    sweetness: 4.0, // 辛口
    richness: 6.5,
    acidity: 1.5,
    aroma: 7.5,
    type: "純米酒",
    prefecture: "大阪府", // 秋鹿酒造は実在の大阪の酒蔵
    description: "生酒のフレッシュな味わいと香りが特徴の純米酒。濃厚で力強い一本。",
    imageUrl: "https://img07.shop-pro.jp/PA01460/199/product/176102678_th.jpg",
    ecUrl: "https://issendo.jp/?pid=176102678",
    tags: ["生酒", "フレッシュ", "濃厚", "力強い"],
    sakeTypeCategory: "醇酒"
  }
];

export const getRandomSakes = (count: number = 3): SakeProfile[] => {
  const shuffled = [...sakeData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};