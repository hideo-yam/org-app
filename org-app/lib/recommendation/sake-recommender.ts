import { DiagnosisResult } from '@/lib/types/diagnosis';
import { SakeProfile, sakeData } from '@/lib/data/sake-data';
import { calculateCuisineCompatibility, calculateSpecificDishCompatibility, getCuisineDescription } from '@/lib/data/cuisine-compatibility';

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
  const recommendations: RecommendationScore[] = sakeData.map(sake => {
    const baseScore = calculateCompatibilityScore(sake, diagnosisResult);
    
    // 料理相性スコアを追加
    let cuisineScore = 0;
    if (specificDish) {
      // 具体的な料理が選択されている場合はより精密なスコア計算
      cuisineScore = calculateSpecificDishCompatibility(specificDish, sake);
    } else if (cuisineType && cuisineType !== 'various') {
      cuisineScore = calculateCuisineCompatibility(cuisineType, sake);
    }
    
    // 基本スコア（50%）+ 料理相性スコア（50%）- 具体的な料理の場合はより重要視
    const cuisineWeight = specificDish ? 0.5 : 0.4;
    const baseWeight = specificDish ? 0.5 : 0.6;
    const finalScore = baseScore * baseWeight + cuisineScore * cuisineWeight;
    
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

  // 甘辛度のマッチング
  const sweetnessGap = Math.abs(sake.sweetness - diagnosis.sweetness);
  if (sweetnessGap <= 1.5) {
    if (diagnosis.sweetness >= 7) {
      reasons.push('甘口がお好みにぴったり');
    } else if (diagnosis.sweetness <= 4) {
      reasons.push('辛口がお好みにぴったり');
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
      const dishNames = {
        'sashimi_sushi': '刺身・寿司',
        'nimono': '煮物',
        'yakimono': '焼き物',
        'agemono': '揚げ物',
        'tenshin': '天津料理',
        'strong_taste': '濃い味の中華',
        'light_taste': '薄味の中華',
        'chinese_fried': '中華揚げ物',
        'carpaccio_oyster': 'カルパッチョ・生牡蠣',
        'meat_dish': '肉料理',
        'fish_dish': '魚料理',
        'gibier': 'ジビエ料理'
      };
      const dishName = dishNames[specificDish as keyof typeof dishNames];
      if (dishName) {
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
  const sweetness = diagnosis.sweetness >= 7 ? '甘口' : 
                   diagnosis.sweetness <= 4 ? '辛口' : '中口';
  const richness = diagnosis.richness >= 7 ? '濃醇' : 
                   diagnosis.richness <= 4 ? '淡麗' : 'バランス';
  const aroma = diagnosis.aroma >= 7 ? '華やか' : 
                diagnosis.aroma <= 4 ? '控えめ' : '程よい香り';

  return `${sweetness}で${richness}、${aroma}な日本酒がお好みのようです。`;
}