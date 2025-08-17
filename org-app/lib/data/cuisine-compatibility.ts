// エクセルファイルの料理シートから抽出した相性データ

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

// 日本酒度から甘辛度を計算するヘルパー関数
export function sakeDegreeToSweetnessScale(sakeDegree: number): number {
  // 日本酒度が低い（マイナス）ほど甘口、高い（プラス）ほど辛口
  // -15～+15の範囲を1～10にマッピング
  return Math.max(1, Math.min(10, 6 - (sakeDegree / 3)));
}

// 料理の相性データ型定義
interface DishCompatibility {
  id: string;
  compatibility: {
    sakeMinLevel: number;
    sakeMaxLevel: number;
    acidityMin: number;
    acidityMax: number;
    alcoholMin: number;
    alcoholMax: number;
  };
}

// 具体的な料理種類に基づく日本酒の相性スコアを計算
export function calculateSpecificDishCompatibility(
  dishType: string,
  sake: { sweetness: number; acidity: number; alcoholContent: number }
): number {
  // 全ての料理種類データから該当するものを検索
  let dishData: DishCompatibility | null = null;
  
  const cuisineData = {
    japanese: [
      { id: 'sashimi_sushi', compatibility: { sakeMinLevel: 0, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 2, alcoholMin: 10, alcoholMax: 16 }},
      { id: 'nimono', compatibility: { sakeMinLevel: -3, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 16 }},
      { id: 'yakimono', compatibility: { sakeMinLevel: 0, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 2, alcoholMin: 15, alcoholMax: 20 }},
      { id: 'agemono', compatibility: { sakeMinLevel: 0, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 2, alcoholMin: 10, alcoholMax: 18 }}
    ],
    chinese: [
      { id: 'tenshin', compatibility: { sakeMinLevel: -5, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 2, alcoholMin: 10, alcoholMax: 15 }},
      { id: 'strong_taste', compatibility: { sakeMinLevel: -5, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 3, alcoholMin: 10, alcoholMax: 18 }},
      { id: 'light_taste', compatibility: { sakeMinLevel: 0, sakeMaxLevel: 10, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 15 }},
      { id: 'chinese_fried', compatibility: { sakeMinLevel: 2, sakeMaxLevel: 15, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 16 }}
    ],
    western: [
      { id: 'carpaccio_oyster', compatibility: { sakeMinLevel: 2, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 3, alcoholMin: 12, alcoholMax: 18 }},
      { id: 'meat_dish', compatibility: { sakeMinLevel: 0, sakeMaxLevel: 18, acidityMin: 0, acidityMax: 2, alcoholMin: 12, alcoholMax: 16 }},
      { id: 'fish_dish', compatibility: { sakeMinLevel: 2, sakeMaxLevel: 18, acidityMin: 0, acidityMax: 2, alcoholMin: 15, alcoholMax: 16 }},
      { id: 'gibier', compatibility: { sakeMinLevel: -2, sakeMaxLevel: 5, acidityMin: 1, acidityMax: 3, alcoholMin: 15, alcoholMax: 18 }}
    ]
  };
  
  for (const dishes of Object.values(cuisineData)) {
    const dish = dishes.find(d => d.id === dishType);
    if (dish) {
      dishData = dish;
      break;
    }
  }
  
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
  
  return factors > 0 ? score / factors : 0;
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