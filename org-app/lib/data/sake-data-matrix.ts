/**
 * マトリックスCSVデータから抽出したお酒の商品データ
 * 実際のマトリックスで定義された日本酒のスペックに基づく
 */

import { SakeProfile } from './sake-data';

// タイプクラス変換関数
function convertTypeClassToSakeTypeName(typeClass: string): string {
  const typeMapping = {
    'A': '薫酒',
    'B': '爽酒',
    'C': '醇酒',
    'D': '熟酒'
  };
  return typeMapping[typeClass as keyof typeof typeMapping] || typeClass;
}

// マトリックスCSVデータから抽出したお酒の基本情報
export interface MatrixSakeData {
  name: string;
  category: string; // 純米酒、吟醸酒、普通酒
  nihonshuDegree: number; // 日本酒度
  acidity: number; // 酸度
  alcoholContent: number; // 度数
  typeClass: string; // ４タイプ分類（A, B, C）
  priceRange: string; // 価格帯（L, M, H）
  price: number; // 価格
}

// CSVから取得したマトリックスお酒データ
export const matrixSakeRawData: MatrixSakeData[] = [
  {
    name: "〇〇正宗",
    category: "純米酒", 
    nihonshuDegree: -2,
    acidity: 1,
    alcoholContent: 12,
    typeClass: "A",
    priceRange: "M",
    price: 1500
  },
  {
    name: "××錦",
    category: "吟醸酒",
    nihonshuDegree: 10, 
    acidity: 2,
    alcoholContent: 18,
    typeClass: "B", 
    priceRange: "H",
    price: 2000
  },
  {
    name: "△△男山",
    category: "普通酒",
    nihonshuDegree: 3,
    acidity: 1,
    alcoholContent: 15,
    typeClass: "C",
    priceRange: "L", 
    price: 1000
  }
];

/**
 * マトリックスデータを完全なSakeProfileフォーマットに変換
 * 日本酒度と酸度による正確な辛甘判定を適用
 */
export function convertMatrixToSakeProfile(matrixData: MatrixSakeData): SakeProfile {
  // 日本酒度から甘辛度スケール(1-10)に変換
  // より正確な変換式を使用
  const sweetness = Math.max(1, Math.min(10, 5.5 - (matrixData.nihonshuDegree / 2)));
  
  // 酸度から1-10スケールに変換（実値をそのまま使用）
  const acidityScale = matrixData.acidity;
  
  // 4タイプ分類から特徴を推定
  const getCharacteristicsByType = (typeClass: string) => {
    switch (typeClass) {
      case 'A': // 薫酒系 - 香り高い
        return { richness: 4.5, aroma: 8.5, sakeTypeCategory: '薫酒' as const };
      case 'B': // 爽酒系 - すっきり
        return { richness: 4.0, aroma: 6.0, sakeTypeCategory: '爽酒' as const };
      case 'C': // 醇酒系 - コクあり
        return { richness: 7.5, aroma: 5.5, sakeTypeCategory: '醇酒' as const };
      default:
        return { richness: 5.0, aroma: 6.0, sakeTypeCategory: '醇酒' as const };
    }
  };

  const characteristics = getCharacteristicsByType(matrixData.typeClass);

  // 酒蔵名を商品名から推定
  const brewery = matrixData.name.includes('正宗') ? `${matrixData.name.replace('正宗', '')}酒造` :
                  matrixData.name.includes('錦') ? `${matrixData.name.replace('錦', '')}酒造` :
                  matrixData.name.includes('男山') ? `${matrixData.name.replace('男山', '')}酒造` :
                  `${matrixData.name}酒造`;

  // 都道府県を推定（仮）
  const prefecture = matrixData.name.includes('正宗') ? '新潟県' :
                    matrixData.name.includes('錦') ? '京都府' :
                    matrixData.name.includes('男山') ? '北海道' : 
                    '不明';

  return {
    id: `matrix_${matrixData.name.toLowerCase().replace(/[〇×△]/g, 'sake')}`,
    name: `${matrixData.name} ${matrixData.category} 720ml`,
    brewery,
    price: matrixData.price,
    alcoholContent: matrixData.alcoholContent,
    riceMilling: matrixData.category === '吟醸酒' ? 60 :
                 matrixData.category === '純米酒' ? 65 : 70,
    sweetness,
    richness: characteristics.richness,
    acidity: acidityScale,
    aroma: characteristics.aroma,
    type: matrixData.category as SakeProfile['type'],
    prefecture,
    description: `日本酒度${matrixData.nihonshuDegree >= 0 ? '+' : ''}${matrixData.nihonshuDegree}、酸度${matrixData.acidity}の${convertTypeClassToSakeTypeName(matrixData.typeClass)}タイプの${matrixData.category}。`,
    imageUrl: `https://example.com/${matrixData.name}.jpg`,
    tags: [
      matrixData.category,
      convertTypeClassToSakeTypeName(matrixData.typeClass),
      matrixData.priceRange === 'H' ? '高級' : matrixData.priceRange === 'L' ? 'コスパ良' : 'お手頃'
    ],
    sakeTypeCategory: characteristics.sakeTypeCategory,
    nihonshuDegree: matrixData.nihonshuDegree,
    realAcidity: matrixData.acidity
  };
}

// 変換されたお酒データ
export const matrixBasedSakeProfiles: SakeProfile[] = matrixSakeRawData.map(convertMatrixToSakeProfile);

// 既存のお酒データと統合するための関数
export function getExpandedMatrixSakeData(): SakeProfile[] {
  // マトリックス範囲を満たすより多くのお酒データを生成
  const expandedData: SakeProfile[] = [...matrixBasedSakeProfiles];
  
  // 各料理に最適化された追加の日本酒を生成
  
  // 刺身・寿司用（日本酒度0-5、酸度0-2、度数10-16）
  expandedData.push({
    id: "sashimi_optimal_1",
    name: "海風 純米酒 720ml",
    brewery: "海風酒造",
    price: 2200,
    alcoholContent: 15,
    riceMilling: 60,
    sweetness: 3.5, // 日本酒度+3相当
    richness: 4.0,
    acidity: 1.2,
    aroma: 7.0,
    type: "純米酒",
    prefecture: "石川県",
    description: "刺身・寿司に最適な淡麗な純米酒。海の幸との相性抜群。",
    imageUrl: "https://example.com/umikaze.jpg",
    ecUrl: "https://issendo.jp/?pid=umikaze_junmai",
    tags: ["刺身", "寿司", "淡麗", "海の幸"],
    sakeTypeCategory: "爽酒",
    nihonshuDegree: 3,
    realAcidity: 1.2
  });

  // 煮物用（日本酒度-3-5、酸度0-1、度数10-16）
  expandedData.push({
    id: "nimono_optimal_1", 
    name: "ふくよか 純米酒 720ml",
    brewery: "ふくよか酒造",
    price: 1800,
    alcoholContent: 14,
    riceMilling: 65,
    sweetness: 5.5, // 日本酒度-1相当
    richness: 6.5,
    acidity: 0.9,
    aroma: 6.0,
    type: "純米酒", 
    prefecture: "秋田県",
    description: "煮物に寄り添うまろやかな純米酒。優しい味わいが特徴。",
    imageUrl: "https://example.com/fukuyoka.jpg",
    ecUrl: "https://issendo.jp/?pid=fukuyoka_junmai",
    tags: ["煮物", "まろやか", "優しい", "和食"],
    sakeTypeCategory: "醇酒",
    nihonshuDegree: -1,
    realAcidity: 0.9
  });

  // 焼き物用（日本酒度0-15、酸度1-2、度数15-20）
  expandedData.push({
    id: "yakimono_optimal_1",
    name: "炎舞 本醸造 720ml", 
    brewery: "炎舞酒造",
    price: 1600,
    alcoholContent: 17,
    riceMilling: 70,
    sweetness: 2.0, // 日本酒度+7相当
    richness: 8.0,
    acidity: 1.8,
    aroma: 5.5,
    type: "本醸造",
    prefecture: "広島県",
    description: "焼き物の香ばしさに負けない力強い本醸造。アルコール度数高めでしっかりとした味わい。",
    imageUrl: "https://example.com/enbu.jpg", 
    ecUrl: "https://issendo.jp/?pid=enbu_honjozo",
    tags: ["焼き物", "力強い", "アルコール度数高め", "香ばしい"],
    sakeTypeCategory: "醇酒",
    nihonshuDegree: 7,
    realAcidity: 1.8
  });

  return expandedData;
}