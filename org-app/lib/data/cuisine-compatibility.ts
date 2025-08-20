// エクセルファイルの料理シートから抽出した相性データ
import { dishCompatibilityData } from './dish-compatibility-matrix';

export interface CuisineCompatibility {
  cuisineType: 'japanese' | 'chinese' | 'western';
  sakeMinLevel: number; // 日本酒度下限
  sakeMaxLevel: number; // 日本酒度上限
  acidityMin: number;   // 酸度下限
  acidityMax: number;   // 酸度上限
  alcoholMin: number;   // 度数下限
  alcoholMax: number;   // 度数上限
  typeClass1: string;   // 4タイプ分類-1
  typeClass2: string;   // 4タイプ分類-2
  matchBonus: number;   // マッチボーナススコア
}

export const cuisineCompatibilityData: CuisineCompatibility[] = [
  // 和食系の相性データ（平均値を計算）
  {
    cuisineType: 'japanese',
    sakeMinLevel: -1, // (0-3+0+0)/4の平均
    sakeMaxLevel: 10, // (5+5+15+15)/4の平均
    acidityMin: 0.5,  // (0+0+1+1)/4の平均
    acidityMax: 1.75, // (2+1+2+2)/4の平均
    alcoholMin: 12.5, // (10+10+15+10)/4の平均
    alcoholMax: 17.5, // (16+16+20+18)/4の平均
    typeClass1: 'A',
    typeClass2: 'B',
    matchBonus: 2.0
  },
  // 中華系の相性データ
  {
    cuisineType: 'chinese',
    sakeMinLevel: -2, // (-5-5+0+2)/4の平均
    sakeMaxLevel: 8.75, // (5+5+10+15)/4の平均
    acidityMin: 0,    // (0+0+0+0)/4の平均
    acidityMax: 1.75, // (2+3+1+1)/4の平均
    alcoholMin: 10,   // (10+10+10+10)/4の平均
    alcoholMax: 16,   // (15+18+15+16)/4の平均
    typeClass1: 'B',
    typeClass2: 'C',
    matchBonus: 1.5
  },
  // 洋食系の相性データ
  {
    cuisineType: 'western',
    sakeMinLevel: 0.5,  // (2+0+2-2)/4の平均
    sakeMaxLevel: 14,   // (15+18+18+5)/4の平均
    acidityMin: 0.5,    // (1+0+0+1)/4の平均
    acidityMax: 2.5,    // (3+2+2+3)/4の平均
    alcoholMin: 13.5,   // (12+12+15+15)/4の平均
    alcoholMax: 17,     // (18+16+16+18)/4の平均
    typeClass1: 'A',
    typeClass2: 'B',
    matchBonus: 1.8
  }
];

// 正しい辛口判定：日本酒度+1以上 AND 酸度1.1以上
export function isKarakuchi(sakeDegree: number, acidity: number): boolean {
  return sakeDegree >= 1.0 && acidity >= 1.1;
}

// 正しい甘口判定：日本酒度-1以下
export function isAmakuchi(sakeDegree: number): boolean {
  return sakeDegree <= -1.0;
}

// 日本酒度と酸度を考慮した甘辛度を計算するヘルパー関数
export function sakeDegreeToSweetnessScale(sakeDegree: number, acidity: number = 1.0): number {
  // 正しい辛口・甘口判定を適用
  if (isKarakuchi(sakeDegree, acidity)) {
    // 辛口：1-4の範囲（日本酒度+1以上 AND 酸度1.1以上）
    return Math.max(1, Math.min(4, 3 - (sakeDegree / 5)));
  } else if (isAmakuchi(sakeDegree)) {
    // 甘口：7-10の範囲（日本酒度-1以下）
    return Math.max(7, Math.min(10, 8.5 + (Math.abs(sakeDegree) / 4)));
  } else {
    // 中口：4-7の範囲（辛口にも甘口にも当てはまらない場合）
    return Math.max(4, Math.min(7, 5.5 - (sakeDegree / 6)));
  }
}


// 具体的な料理種類に基づく日本酒の相性スコアを計算
export function calculateSpecificDishCompatibility(
  dishType: string,
  sake: { sweetness: number; acidity: number; alcoholContent: number }
): number {
  // マトリックスデータから該当料理を検索
  const dishData = dishCompatibilityData.find(dish => dish.id === dishType);
  if (!dishData) return 0;
  
  const compatibility = dishData.compatibility;
  let score = 0;
  let factors = 0;
  
  // 日本酒度の相性をチェック（甘辛度から逆算）
  const estimatedSakeDegree = (6 - sake.sweetness) * 3;
  if (estimatedSakeDegree >= compatibility.sakeMinLevel && 
      estimatedSakeDegree <= compatibility.sakeMaxLevel) {
    score += 4; // より高い重み
  } else {
    const distance = Math.min(
      Math.abs(estimatedSakeDegree - compatibility.sakeMinLevel),
      Math.abs(estimatedSakeDegree - compatibility.sakeMaxLevel)
    );
    score += Math.max(0, 4 - distance / 2);
  }
  factors++;
  
  // 酸度の相性をチェック
  if (sake.acidity >= compatibility.acidityMin && 
      sake.acidity <= compatibility.acidityMax) {
    score += 3;
  } else {
    const distance = Math.min(
      Math.abs(sake.acidity - compatibility.acidityMin),
      Math.abs(sake.acidity - compatibility.acidityMax)
    );
    score += Math.max(0, 3 - distance);
  }
  factors++;
  
  // アルコール度数の相性をチェック
  if (sake.alcoholContent >= compatibility.alcoholMin && 
      sake.alcoholContent <= compatibility.alcoholMax) {
    score += 3;
  } else {
    const distance = Math.min(
      Math.abs(sake.alcoholContent - compatibility.alcoholMin),
      Math.abs(sake.alcoholContent - compatibility.alcoholMax)
    );
    score += Math.max(0, 3 - distance / 2);
  }
  factors++;
  
  // マトリックスデータのマッチボーナスを適用
  const baseScore = factors > 0 ? score / factors : 0;
  return baseScore * (dishData.matchBonus / 2.0); // ボーナススケール調整
}

// 料理タイプに基づく日本酒の相性スコアを計算
export function calculateCuisineCompatibility(
  cuisineType: string,
  sake: { sweetness: number; acidity: number; alcoholContent: number }
): number {
  const compatibility = cuisineCompatibilityData.find(c => c.cuisineType === cuisineType);
  if (!compatibility) return 0;

  let score = 0;
  let factors = 0;

  // 日本酒度の相性をチェック（甘辛度から逆算）
  const estimatedSakeDegree = (6 - sake.sweetness) * 3; // 甘辛度から日本酒度を推定
  if (estimatedSakeDegree >= compatibility.sakeMinLevel && 
      estimatedSakeDegree <= compatibility.sakeMaxLevel) {
    score += 3;
  } else {
    // 範囲外でも近ければ部分点
    const distance = Math.min(
      Math.abs(estimatedSakeDegree - compatibility.sakeMinLevel),
      Math.abs(estimatedSakeDegree - compatibility.sakeMaxLevel)
    );
    score += Math.max(0, 3 - distance / 2);
  }
  factors++;

  // 酸度の相性をチェック
  if (sake.acidity >= compatibility.acidityMin && 
      sake.acidity <= compatibility.acidityMax) {
    score += 2;
  } else {
    const distance = Math.min(
      Math.abs(sake.acidity - compatibility.acidityMin),
      Math.abs(sake.acidity - compatibility.acidityMax)
    );
    score += Math.max(0, 2 - distance);
  }
  factors++;

  // アルコール度数の相性をチェック
  if (sake.alcoholContent >= compatibility.alcoholMin && 
      sake.alcoholContent <= compatibility.alcoholMax) {
    score += 2;
  } else {
    const distance = Math.min(
      Math.abs(sake.alcoholContent - compatibility.alcoholMin),
      Math.abs(sake.alcoholContent - compatibility.alcoholMax)
    );
    score += Math.max(0, 2 - distance / 2);
  }
  factors++;

  // 平均スコアを計算
  const averageScore = factors > 0 ? score / factors : 0;
  
  // マッチボーナスを適用
  return averageScore * compatibility.matchBonus;
}

// 料理タイプの説明文を取得
export function getCuisineDescription(cuisineType: string): string {
  const descriptions = {
    'japanese': '和食との相性を重視した日本酒をお勧めします。',
    'chinese': '中華料理との相性を重視した日本酒をお勧めします。',
    'western': '洋食との相性を重視した日本酒をお勧めします。',
    'various': '様々な料理との相性を考慮した汎用性の高い日本酒をお勧めします。'
  };
  return descriptions[cuisineType as keyof typeof descriptions] || '';
}