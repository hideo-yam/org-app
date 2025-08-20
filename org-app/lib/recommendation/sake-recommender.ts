import { DiagnosisResult } from '@/lib/types/diagnosis';
import { SakeProfile, sakeData } from '@/lib/data/sake-data';
import { calculateCuisineCompatibility, calculateSpecificDishCompatibility, getCuisineDescription, isKarakuchi, isAmakuchi } from '@/lib/data/cuisine-compatibility';
import { dishCompatibilityData, getDishDisplayName } from '@/lib/data/dish-compatibility-matrix';

export interface RecommendationScore {
  sake: SakeProfile;
  score: number;
  matchReasons: string[];
}

export function recommendSakes(
  diagnosisResult: DiagnosisResult,
  count: number = 3,
  cuisineType?: string,
  specificDish?: string
): RecommendationScore[] {
  // 第一段階: 個別料理マトリックス行データによる厳格な絞り込み
  let candidateSakes = sakeData;
  let matrixFilterApplied = false;
  
  if (specificDish) {
    // 料理マトリックス行データの範囲内にある日本酒のみを厳格に抽出
    const matrixFilteredCandidates = sakeData.filter(sake => {
      return isWithinMatrixCompatibilityRange(specificDish, sake);
    });
    
    // マトリックス範囲内の候補が十分にある場合のみ適用
    if (matrixFilteredCandidates.length >= Math.max(count, 5)) {
      candidateSakes = matrixFilteredCandidates;
      matrixFilterApplied = true;
      console.log(`第一段階（マトリックス）: ${specificDish}の範囲内で${sakeData.length}本中${candidateSakes.length}本に絞り込み`);
    } else {
      // 候補が少ない場合はマトリックス範囲を緩和
      const relaxedMatrixCandidates = sakeData.filter(sake => {
        return isWithinMatrixCompatibilityRange(specificDish, sake, 1.2); // 20%範囲拡張
      });
      
      if (relaxedMatrixCandidates.length >= count) {
        candidateSakes = relaxedMatrixCandidates;
        matrixFilterApplied = true;
        console.log(`第一段階（マトリックス緩和）: ${specificDish}で${sakeData.length}本中${candidateSakes.length}本に絞り込み`);
      }
    }
  } else if (cuisineType && cuisineType !== 'various') {
    // 料理カテゴリのマトリックス範囲による絞り込み
    const categoryMatrixFiltered = sakeData.filter(sake => {
      return isWithinCuisineMatrixRange(cuisineType, sake);
    });
    
    if (categoryMatrixFiltered.length >= Math.max(count * 2, 10)) {
      candidateSakes = categoryMatrixFiltered;
      matrixFilterApplied = true;
      console.log(`第一段階（カテゴリマトリックス）: ${cuisineType}料理で${sakeData.length}本中${candidateSakes.length}本に絞り込み`);
    }
  }
  
  // 第二段階: 日本酒度・香味による重み付け計算
  const recommendations: RecommendationScore[] = candidateSakes.map(sake => {
    // 基本診断との適合度を計算
    const baseScore = calculateCompatibilityScore(sake, diagnosisResult);
    
    // 日本酒度・香味に基づく重み付けスコア
    const sakeCharacteristicScore = calculateSakeCharacteristicScore(sake, diagnosisResult);
    
    // 料理相性ボーナス（従来のスコアを維持）
    let cuisineBonus = 0;
    if (specificDish) {
      cuisineBonus = calculateSpecificDishCompatibility(specificDish, sake) * 0.3;
    } else if (cuisineType && cuisineType !== 'various') {
      cuisineBonus = calculateCuisineCompatibility(cuisineType, sake) * 0.2;
    }
    
    // 最終スコア計算: 日本酒度・香味を重視した重み付け
    // マトリックス絞り込みが適用された場合は、特性重視の配分
    const characteristicWeight = matrixFilterApplied ? 0.7 : 0.5;
    const baseWeight = matrixFilterApplied ? 0.3 : 0.5;
    
    const finalScore = (baseScore * baseWeight + sakeCharacteristicScore * characteristicWeight) + cuisineBonus;
    
    const matchReasons = generateMatchReasons(sake, diagnosisResult, cuisineType, specificDish);
    
    return {
      sake,
      score: finalScore,
      matchReasons
    };
  });

  // スコアでソートして上位を返す
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

// 料理マトリックスの範囲内にあるかチェック（個別料理用）
function isWithinMatrixCompatibilityRange(
  dishType: string,
  sake: SakeProfile,
  tolerance: number = 1.0
): boolean {
  const compatibilityRange = getSpecificDishCompatibilityRange(dishType);
  if (!compatibilityRange) return true; // 不明な料理は通す
  
  // 日本酒度の推定（甘辛度から）
  const estimatedSakeDegree = (6 - sake.sweetness) * 3;
  const sakeInRange = estimatedSakeDegree >= compatibilityRange.sakeMinLevel / tolerance && 
                     estimatedSakeDegree <= compatibilityRange.sakeMaxLevel * tolerance;
  
  // 酸度の範囲チェック
  const acidityInRange = sake.acidity >= compatibilityRange.acidityMin / tolerance &&
                        sake.acidity <= compatibilityRange.acidityMax * tolerance;
  
  // アルコール度数の範囲チェック
  const alcoholInRange = sake.alcoholContent >= compatibilityRange.alcoholMin / tolerance &&
                        sake.alcoholContent <= compatibilityRange.alcoholMax * tolerance;
  
  // すべての条件を満たす必要がある
  return sakeInRange && acidityInRange && alcoholInRange;
}

// 料理カテゴリマトリックスの範囲内にあるかチェック
function isWithinCuisineMatrixRange(cuisineType: string, sake: SakeProfile): boolean {
  const compatibilityRange = getCuisineCompatibilityRange(cuisineType);
  if (!compatibilityRange) return true;
  
  const estimatedSakeDegree = (6 - sake.sweetness) * 3;
  const sakeInRange = estimatedSakeDegree >= compatibilityRange.sakeMinLevel && 
                     estimatedSakeDegree <= compatibilityRange.sakeMaxLevel;
  
  const acidityInRange = sake.acidity >= compatibilityRange.acidityMin &&
                        sake.acidity <= compatibilityRange.acidityMax;
  
  const alcoholInRange = sake.alcoholContent >= compatibilityRange.alcoholMin &&
                        sake.alcoholContent <= compatibilityRange.alcoholMax;
  
  return sakeInRange && acidityInRange && alcoholInRange;
}

// 日本酒度・香味特性による重み付けスコア計算
function calculateSakeCharacteristicScore(
  sake: SakeProfile,
  diagnosis: DiagnosisResult
): number {
  // 日本酒度（甘辛度）の適合度 - 最重要
  const sweetnessMatch = 10 - Math.abs(sake.sweetness - diagnosis.sweetness);
  const sweetnessScore = Math.max(0, sweetnessMatch) * 0.4; // 40%の重み
  
  // 香味（香り＋味わい）の適合度
  const aromaMatch = 10 - Math.abs(sake.aroma - diagnosis.aroma);
  const aromaScore = Math.max(0, aromaMatch) * 0.3; // 30%の重み
  
  // 濃淡度（コク）の適合度
  const richnessMatch = 10 - Math.abs(sake.richness - diagnosis.richness);
  const richnessScore = Math.max(0, richnessMatch) * 0.2; // 20%の重み
  
  // 酸味の適合度
  const acidityMatch = 10 - Math.abs(sake.acidity - diagnosis.acidity);
  const acidityScore = Math.max(0, acidityMatch) * 0.1; // 10%の重み
  
  return sweetnessScore + aromaScore + richnessScore + acidityScore;
}

// ヘルパー関数群
function getSpecificDishCompatibilityRange(dishType: string) {
  // マトリックスデータから該当料理を検索
  const dishData = dishCompatibilityData.find(dish => dish.id === dishType);
  if (!dishData) return null;
  
  return {
    sakeMinLevel: dishData.compatibility.sakeMinLevel,
    sakeMaxLevel: dishData.compatibility.sakeMaxLevel,
    acidityMin: dishData.compatibility.acidityMin,
    acidityMax: dishData.compatibility.acidityMax,
    alcoholMin: dishData.compatibility.alcoholMin,
    alcoholMax: dishData.compatibility.alcoholMax
  };
}

function getCuisineCompatibilityRange(cuisineType: string) {
  const cuisineRanges = {
    'japanese': { sakeMinLevel: -1, sakeMaxLevel: 10, acidityMin: 0.5, acidityMax: 1.75, alcoholMin: 12.5, alcoholMax: 17.5 },
    'chinese': { sakeMinLevel: -2, sakeMaxLevel: 8.75, acidityMin: 0, acidityMax: 1.75, alcoholMin: 10, alcoholMax: 16 },
    'western': { sakeMinLevel: 0.5, sakeMaxLevel: 14, acidityMin: 0.5, acidityMax: 2.5, alcoholMin: 13.5, alcoholMax: 17 }
  };
  return cuisineRanges[cuisineType as keyof typeof cuisineRanges];
}

function calculateCompatibilityScore(
  sake: SakeProfile,
  diagnosis: DiagnosisResult
): number {
  // 各要素の重要度重み
  const weights = {
    sweetness: 0.3,
    richness: 0.25,
    aroma: 0.25,
    acidity: 0.2
  };

  // 各要素の差を計算（10点満点での差）
  const sweetnessGap = Math.abs(sake.sweetness - diagnosis.sweetness);
  const richnessGap = Math.abs(sake.richness - diagnosis.richness);
  const aromaGap = Math.abs(sake.aroma - diagnosis.aroma);
  const acidityGap = Math.abs(sake.acidity - diagnosis.acidity);

  // 差が小さいほど高スコア（10 - gap で計算）
  const sweetnessScore = Math.max(0, 10 - sweetnessGap);
  const richnessScore = Math.max(0, 10 - richnessGap);
  const aromaScore = Math.max(0, 10 - aromaGap);
  const acidityScore = Math.max(0, 10 - acidityGap);

  // 重み付き平均で最終スコアを計算
  const totalScore = 
    sweetnessScore * weights.sweetness +
    richnessScore * weights.richness +
    aromaScore * weights.aroma +
    acidityScore * weights.acidity;

  return Math.round(totalScore * 10) / 10; // 小数点第1位まで
}

function generateMatchReasons(
  sake: SakeProfile,
  diagnosis: DiagnosisResult,
  cuisineType?: string,
  specificDish?: string
): string[] {
  const reasons: string[] = [];

  // 甘辛度のマッチング（正しい日本酒度・酸度基準を適用）
  // 甘辛度から日本酒度を逆算し、酸度と組み合わせて判定
  const estimatedSakeDegree = (6 - sake.sweetness) * 3;
  const sakeAcidity = sake.acidity / 3; // 1-10スケールから実際の酸度に戻す
  
  const sweetnessGap = Math.abs(sake.sweetness - diagnosis.sweetness);
  if (sweetnessGap <= 1.5) {
    if (isKarakuchi(estimatedSakeDegree, sakeAcidity)) {
      reasons.push('辛口がお好みにぴったり（日本酒度・酸度基準）');
    } else if (isAmakuchi(estimatedSakeDegree)) {
      reasons.push('甘口がお好みにぴったり（日本酒度・酸度基準）');
    } else {
      reasons.push('バランスの良い甘辛度');
    }
  }

  // 濃淡度のマッチング
  const richnessGap = Math.abs(sake.richness - diagnosis.richness);
  if (richnessGap <= 1.5) {
    if (diagnosis.richness >= 7) {
      reasons.push('濃醇でコクのある味わい');
    } else if (diagnosis.richness <= 4) {
      reasons.push('淡麗ですっきりした味わい');
    } else {
      reasons.push('程よいコクと飲みやすさ');
    }
  }

  // 香りのマッチング
  const aromaGap = Math.abs(sake.aroma - diagnosis.aroma);
  if (aromaGap <= 1.5) {
    if (diagnosis.aroma >= 7) {
      reasons.push('華やかで豊かな香り');
    } else if (diagnosis.aroma <= 4) {
      reasons.push('控えめで上品な香り');
    } else {
      reasons.push('バランスの良い香り');
    }
  }

  // 酸味のマッチング
  const acidityGap = Math.abs(sake.acidity - diagnosis.acidity);
  if (acidityGap <= 1.5) {
    if (diagnosis.acidity >= 7) {
      reasons.push('爽やかな酸味');
    } else {
      reasons.push('まろやかな味わい');
    }
  }

  // 料理相性の理由を追加
  if (specificDish) {
    // 具体的な料理が選択されている場合
    const dishScore = calculateSpecificDishCompatibility(specificDish, sake);
    if (dishScore > 5) {
      const dishName = getDishDisplayName(specificDish);
      if (dishName && dishName !== specificDish) {
        reasons.push(`${dishName}との相性抜群`);
      }
    }
  } else if (cuisineType && cuisineType !== 'various') {
    const cuisineScore = calculateCuisineCompatibility(cuisineType, sake);
    if (cuisineScore > 5) {
      const description = getCuisineDescription(cuisineType);
      reasons.push(description.replace('日本酒をお勧めします。', '相性'));
    }
  }

  // タグベースの追加理由
  if (sake.tags.includes('初心者向け')) {
    reasons.push('日本酒初心者にもおすすめ');
  }
  if (sake.tags.includes('コスパ良')) {
    reasons.push('コストパフォーマンス抜群');
  }
  if (sake.tags.includes('人気')) {
    reasons.push('多くの人に愛される定番品');
  }

  return reasons.slice(0, 3); // 最大3つまで
}

export function getSakeTypeDescription(type: SakeProfile['type']): string {
  const descriptions = {
    '純米': '米と米麹のみで造られた、米の旨味を感じられる日本酒',
    '純米酒': '米と米麹のみで造られた、米の旨味を感じられる日本酒',
    '純米吟醸': '吟醸造りで香り高く、米の旨味も楽しめる上品な日本酒',
    '純米大吟醸': '最高級の製法で造られた、香り豊かで繊細な味わいの日本酒',
    '吟醸': '香り高く淡麗で、上品な味わいが特徴の日本酒',
    '吟醸酒': '香り高く淡麗で、上品な味わいが特徴の日本酒',
    '大吟醸': '最高級の吟醸酒。華やかな香りと洗練された味わい',
    '本醸造': '飲み飽きしない、バランスの良いスタンダードな日本酒',
    '普通酒': '日常的に楽しめる、親しみやすい日本酒'
  };
  return descriptions[type] || '';
}

export function getSakeTypeCategoryDescription(category: SakeProfile['sakeTypeCategory']): string {
  if (!category) return '';
  
  const descriptions = {
    '薫酒': '香り高く、フルーティーで華やかな日本酒。吟醸酒に多いタイプ',
    '爽酒': 'すっきりと軽やか、清涼感のある日本酒。飲みやすく親しみやすい',
    '醇酒': 'コクがあり旨味豊か、しっかりとした味わいの日本酒。純米酒に多い',
    '熟酒': '深いコクと複雑な味わい、熟成による独特の風味を持つ日本酒'
  };
  return descriptions[category] || '';
}

export function getPreferenceDescription(diagnosis: DiagnosisResult): string {
  // 正しい甘辛度判定基準を適用
  const sweetness = diagnosis.sweetness >= 7 ? '甘口' : 
                   diagnosis.sweetness <= 4 ? '辛口' : '中口';
  const richness = diagnosis.richness >= 7 ? '濃醇' : 
                   diagnosis.richness <= 4 ? '淡麗' : 'バランス';
  const aroma = diagnosis.aroma >= 7 ? '華やか' : 
                diagnosis.aroma <= 4 ? '控えめ' : '程よい香り';

  return `${sweetness}で${richness}、${aroma}な日本酒がお好みのようです。`;
}