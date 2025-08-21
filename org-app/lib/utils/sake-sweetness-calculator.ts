/**
 * 日本酒度と酸度による正確な辛甘判定システム
 * 日本酒業界の標準的な判定基準を実装
 */

export interface SweetnessJudgment {
  level: string;
  description: string;
  category: 'amakuchi' | 'neutral' | 'karakuchi';
}

/**
 * 日本酒度と酸度による辛甘判定マトリックス
 */
const SWEETNESS_MATRIX = {
  // 酸度範囲別の判定テーブル
  lowAcidity: { min: 1.0, max: 1.2 }, // 低酸度
  midAcidity: { min: 1.3, max: 1.5 }, // 中酸度  
  highAcidity: { min: 1.6, max: 1.8 }, // 高酸度
  veryHighAcidity: { min: 1.9, max: 2.5 } // 超高酸度
};

/**
 * 日本酒度による基本的な甘辛判定
 */
export function getBasicSweetnessByDegree(nihonshuDegree: number): SweetnessJudgment {
  if (nihonshuDegree >= 6) {
    return { level: '大辛口', description: '非常にドライで切れ味鋭い', category: 'karakuchi' };
  } else if (nihonshuDegree >= 3.5) {
    return { level: '辛口', description: 'すっきりとした辛口', category: 'karakuchi' };
  } else if (nihonshuDegree >= 1.5) {
    return { level: 'やや辛口', description: '軽やかな辛口感', category: 'karakuchi' };
  } else if (nihonshuDegree >= -1.4) {
    return { level: '普通', description: 'バランスの良い味わい', category: 'neutral' };
  } else if (nihonshuDegree >= -3.4) {
    return { level: 'やや甘口', description: 'ほのかな甘み', category: 'amakuchi' };
  } else if (nihonshuDegree >= -5.9) {
    return { level: '甘口', description: 'まろやかな甘口', category: 'amakuchi' };
  } else {
    return { level: '大甘口', description: '豊かで濃厚な甘み', category: 'amakuchi' };
  }
}

/**
 * 酸度による味わいへの影響を計算
 * 酸度が高いほど辛口感が増す
 */
function getAcidityImpact(acidity: number): number {
  if (acidity >= 1.9) return 5; // 超高酸度：大幅に辛口感増
  if (acidity >= 1.6) return 3; // 高酸度：辛口感増
  if (acidity >= 1.3) return 0; // 中酸度：影響なし
  if (acidity >= 1.0) return -2; // 低酸度：甘口感増
  return -3; // 極低酸度：甘口感大幅増
}

/**
 * 日本酒度と酸度を組み合わせた実感辛甘度を計算
 */
export function calculateRealSweetness(nihonshuDegree: number, acidity: number): number {
  const acidityImpact = getAcidityImpact(acidity);
  return nihonshuDegree + acidityImpact;
}

/**
 * 日本酒度と酸度による最終的な辛甘判定
 */
export function judgeSweetnessByMatrix(nihonshuDegree: number, acidity: number): SweetnessJudgment {
  const realSweetness = calculateRealSweetness(nihonshuDegree, acidity);
  
  // 実感辛甘度による判定
  if (realSweetness >= 8) {
    return { level: '超辛口', description: '酸度の高さで非常にキレのある辛口', category: 'karakuchi' };
  } else if (realSweetness >= 6) {
    return { level: '大辛口', description: '力強くドライな味わい', category: 'karakuchi' };
  } else if (realSweetness >= 3.5) {
    return { level: '辛口', description: 'すっきりとした辛口', category: 'karakuchi' };
  } else if (realSweetness >= 1.5) {
    return { level: 'やや辛口', description: '軽やかな辛口感', category: 'karakuchi' };
  } else if (realSweetness >= -1.4) {
    return { level: '普通', description: 'バランスの良い味わい', category: 'neutral' };
  } else if (realSweetness >= -3.4) {
    return { level: 'やや甘口', description: 'ほのかな甘み', category: 'amakuchi' };
  } else if (realSweetness >= -5.9) {
    return { level: '甘口', description: 'まろやかな甘口', category: 'amakuchi' };
  } else {
    return { level: '大甘口', description: '豊かで濃厚な甘み', category: 'amakuchi' };
  }
}

/**
 * 甘辛度判定の詳細情報を取得
 */
export function getSweetnessAnalysis(nihonshuDegree: number, acidity: number): {
  basic: SweetnessJudgment;
  matrix: SweetnessJudgment;
  realSweetness: number;
  acidityEffect: string;
} {
  const basic = getBasicSweetnessByDegree(nihonshuDegree);
  const matrix = judgeSweetnessByMatrix(nihonshuDegree, acidity);
  const realSweetness = calculateRealSweetness(nihonshuDegree, acidity);
  
  let acidityEffect = '';
  const acidityImpact = getAcidityImpact(acidity);
  
  if (acidityImpact > 0) {
    acidityEffect = `酸度${acidity}により辛口感が${acidityImpact}度分増加`;
  } else if (acidityImpact < 0) {
    acidityEffect = `酸度${acidity}により甘口感が${Math.abs(acidityImpact)}度分増加`;
  } else {
    acidityEffect = `酸度${acidity}による影響は中程度`;
  }
  
  return {
    basic,
    matrix,
    realSweetness,
    acidityEffect
  };
}

/**
 * 日本酒の甘辛度をカテゴリで判定
 */
export function isKarakuchi(nihonshuDegree: number, acidity: number): boolean {
  const judgment = judgeSweetnessByMatrix(nihonshuDegree, acidity);
  return judgment.category === 'karakuchi';
}

export function isAmakuchi(nihonshuDegree: number, acidity?: number): boolean {
  if (acidity !== undefined) {
    const judgment = judgeSweetnessByMatrix(nihonshuDegree, acidity);
    return judgment.category === 'amakuchi';
  }
  // 酸度情報がない場合は日本酒度のみで判定
  return nihonshuDegree < -1.4;
}

export function isNeutral(nihonshuDegree: number, acidity: number): boolean {
  const judgment = judgeSweetnessByMatrix(nihonshuDegree, acidity);
  return judgment.category === 'neutral';
}

/**
 * 代表的な組み合わせパターンの例
 */
export const TYPICAL_PATTERNS = {
  tanreiKarakuchi: { nihonshuDegree: 5, acidity: 1.2, description: '淡麗辛口' },
  nouuncKarakuchi: { nihonshuDegree: 4, acidity: 1.8, description: '濃醇辛口' },
  tanreiAmakuchi: { nihonshuDegree: -4, acidity: 1.1, description: '淡麗甘口' },
  nouuncAmakuchi: { nihonshuDegree: -2, acidity: 1.6, description: '濃醇甘口' }
};