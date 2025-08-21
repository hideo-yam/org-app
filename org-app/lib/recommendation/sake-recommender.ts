import { DiagnosisResult } from '@/lib/types/diagnosis';
import { SakeProfile, sakeData, convertSweetnessToNihonshuDegree } from '@/lib/data/sake-data';
import { calculateCuisineCompatibility, calculateSpecificDishCompatibility, getCuisineDescription, isKarakuchi, isAmakuchi } from '@/lib/data/cuisine-compatibility';
import { dishCompatibilityData, getDishDisplayName } from '@/lib/data/dish-compatibility-matrix';
import { judgeSweetnessByMatrix, getSweetnessAnalysis, isKarakuchi as isKarakuchiMatrix, isAmakuchi as isAmakuchiMatrix } from '@/lib/utils/sake-sweetness-calculator';

export interface RecommendationScore {
  sake: SakeProfile;
  score: number;
  matchReasons: string[];
}

export function recommendSakes(
  diagnosisResult: DiagnosisResult & { answers?: { questionId: string; selectedOptions: string[] }[] },
  count: number = 3,
  cuisineType?: string,
  specificDish?: string
): RecommendationScore[] {
  // **マトリックスベース推薦**: CSVマトリックスデータに基づく完全制御
  let candidateSakes: SakeProfile[] = [];
  const matrixFilterApplied = true;
  
  console.log(`🍶 マトリックスベース推薦開始: 料理=${specificDish || cuisineType || '汎用'}`);
  
  if (specificDish) {
    // 個別料理マトリックス範囲内の日本酒のみを抽出
    console.log(`🔍 料理マトリックス絞り込み開始: ${specificDish}`);
    
    candidateSakes = sakeData.filter(sake => {
      const isWithinRange = isWithinMatrixCompatibilityRange(specificDish, sake);
      const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
      const realAcidity = sake.realAcidity ?? sake.acidity;
      
      console.log(`  ${sake.name}: ${isWithinRange ? '✅' : '❌'} (日本酒度: ${nihonshuDegree}, 酸度: ${realAcidity}, アルコール: ${sake.alcoholContent})`);
      
      return isWithinRange;
    });
    
    console.log(`✅ 料理マトリックス制限: ${specificDish}の範囲内から${candidateSakes.length}本を選定`);
    
  } else if (cuisineType && cuisineType !== 'various') {
    // 料理カテゴリマトリックス範囲内の日本酒のみを抽出
    candidateSakes = sakeData.filter(sake => {
      return isWithinCuisineMatrixRange(cuisineType, sake);
    });
    
    console.log(`✅ カテゴリマトリックス制限: ${cuisineType}料理の範囲内から${candidateSakes.length}本を選定`);
    
  } else {
    // 「色々な料理」選択時: マトリックス全範囲から選定
    candidateSakes = [...sakeData]; // すべてのマトリックス日本酒を対象
    
    console.log(`✅ 全マトリックス対象: 色々な料理対応で${candidateSakes.length}本を選定`);
  }
  
  // マトリックスベースなので必ず候補が存在するはず
  if (candidateSakes.length === 0) {
    console.warn(`⚠️ 警告: マトリックス範囲内に適合する日本酒がありません。全データから選定します。`);
    candidateSakes = [...sakeData]; // フォールバック
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
    
    // 甘辛度ボーナス（q3の回答に基づく追加ボーナス）
    let sweetnessBonus = 0;
    const q3Answer = findAnswerForQuestion(diagnosisResult, 'q3');
    if (q3Answer) {
      sweetnessBonus = calculateSweetnessBonus(sake, q3Answer);
    }
    
    // 最終スコア計算: 日本酒度・香味を重視した重み付け
    // マトリックス絞り込みが適用された場合は、特性重視の配分
    const characteristicWeight = matrixFilterApplied ? 0.7 : 0.5;
    const baseWeight = matrixFilterApplied ? 0.3 : 0.5;
    
    const finalScore = (baseScore * baseWeight + sakeCharacteristicScore * characteristicWeight) + cuisineBonus + sweetnessBonus;
    
    const matchReasons = generateMatchReasons(sake, diagnosisResult, cuisineType, specificDish);
    
    return {
      sake,
      score: finalScore,
      matchReasons
    };
  });

  // スコアでソートして上位を返す
  const finalCount = Math.min(count, candidateSakes.length);
  const result = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, finalCount);
    
  console.log(`最終推薦: ${result.length}本を選定（要求: ${count}本、候補: ${candidateSakes.length}本）`);
  return result;
}

// 料理マトリックスの範囲内にあるかチェック（マトリックス完全準拠）
function isWithinMatrixCompatibilityRange(
  dishType: string,
  sake: SakeProfile
): boolean {
  const compatibilityRange = getSpecificDishCompatibilityRange(dishType);
  if (!compatibilityRange) {
    console.log(`⚠️ 料理タイプ「${dishType}」のマトリックス範囲が見つかりません`);
    return false; // 不明な料理は除外
  }
  
  // マトリックス基準: 正確な日本酒度と酸度を使用
  const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
  const realAcidity = sake.realAcidity ?? sake.acidity;
  const alcoholContent = sake.alcoholContent;
  
  // 各範囲チェック（マトリックス完全準拠）
  const sakeInRange = nihonshuDegree >= compatibilityRange.sakeMinLevel && 
                     nihonshuDegree <= compatibilityRange.sakeMaxLevel;
  
  const acidityInRange = realAcidity >= compatibilityRange.acidityMin &&
                        realAcidity <= compatibilityRange.acidityMax;
  
  const alcoholInRange = alcoholContent >= compatibilityRange.alcoholMin &&
                        alcoholContent <= compatibilityRange.alcoholMax;
  
  // デバッグログ（マトリックス基準）
  console.log(`    🎯 マトリックス範囲チェック詳細:`);
  console.log(`      日本酒度: ${sakeInRange ? '✅' : '❌'} (${nihonshuDegree} in ${compatibilityRange.sakeMinLevel}~${compatibilityRange.sakeMaxLevel})`);
  console.log(`      酸度: ${acidityInRange ? '✅' : '❌'} (${realAcidity} in ${compatibilityRange.acidityMin}~${compatibilityRange.acidityMax})`);
  console.log(`      アルコール: ${alcoholInRange ? '✅' : '❌'} (${alcoholContent} in ${compatibilityRange.alcoholMin}~${compatibilityRange.alcoholMax})`);
  
  // マトリックス基準: すべての条件を満たす必要がある
  return sakeInRange && acidityInRange && alcoholInRange;
}

// 料理カテゴリマトリックスの範囲内にあるかチェック（マトリックス完全準拠）
function isWithinCuisineMatrixRange(cuisineType: string, sake: SakeProfile): boolean {
  const compatibilityRange = getCuisineCompatibilityRange(cuisineType);
  if (!compatibilityRange) {
    console.log(`⚠️ 料理カテゴリ「${cuisineType}」のマトリックス範囲が見つかりません`);
    return false;
  }
  
  // マトリックス基準: 正確な日本酒度と酸度を使用
  const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
  const realAcidity = sake.realAcidity ?? sake.acidity;
  const alcoholContent = sake.alcoholContent;
  
  const sakeInRange = nihonshuDegree >= compatibilityRange.sakeMinLevel && 
                     nihonshuDegree <= compatibilityRange.sakeMaxLevel;
  
  const acidityInRange = realAcidity >= compatibilityRange.acidityMin &&
                        realAcidity <= compatibilityRange.acidityMax;
  
  const alcoholInRange = alcoholContent >= compatibilityRange.alcoholMin &&
                        alcoholContent <= compatibilityRange.alcoholMax;
  
  console.log(`  ${sake.name}: ${sakeInRange && acidityInRange && alcoholInRange ? '✅' : '❌'} (日本酒度: ${nihonshuDegree}, 酸度: ${realAcidity}, アルコール: ${alcoholContent})`);
  
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
  // 日本酒度と酸度の両方を考慮した判定
  const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
  const realAcidity = sake.realAcidity ?? sake.acidity;
  
  const sweetnessGap = Math.abs(sake.sweetness - diagnosis.sweetness);
  if (sweetnessGap <= 1.5) {
    const sweetnessJudgment = judgeSweetnessByMatrix(nihonshuDegree, realAcidity);
    
    if (sweetnessJudgment.category === 'karakuchi') {
      reasons.push(`${sweetnessJudgment.level}がお好みにぴったり（日本酒度${nihonshuDegree >= 0 ? '+' : ''}${nihonshuDegree}・酸度${realAcidity}）`);
    } else if (sweetnessJudgment.category === 'amakuchi') {
      reasons.push(`${sweetnessJudgment.level}がお好みにぴったり（日本酒度${nihonshuDegree >= 0 ? '+' : ''}${nihonshuDegree}・酸度${realAcidity}）`);
    } else {
      reasons.push(`バランスの良い${sweetnessJudgment.level}（日本酒度${nihonshuDegree >= 0 ? '+' : ''}${nihonshuDegree}・酸度${realAcidity}）`);
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

// ヘルパー関数: Q3の回答を取得
function findAnswerForQuestion(
  diagnosisResult: { answers?: { questionId: string; selectedOptions: string[] }[] }, 
  questionId: string
): string | null {
  if (diagnosisResult.answers) {
    const answer = diagnosisResult.answers.find((a) => a.questionId === questionId);
    return answer?.selectedOptions?.[0] || null;
  }
  return null;
}

// 甘辛度ボーナスの計算（日本酒度・酸度マトリックスベース）
function calculateSweetnessBonus(sake: SakeProfile, q3Answer: string): number {
  const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
  const realAcidity = sake.realAcidity ?? sake.acidity;
  
  const sweetnessJudgment = judgeSweetnessByMatrix(nihonshuDegree, realAcidity);
  
  if (q3Answer === 'amakuchi') {
    // 甘口好みの場合、マトリックス判定で甘口の日本酒にボーナス
    return sweetnessJudgment.category === 'amakuchi' ? 0.5 : 0;
  } else if (q3Answer === 'karakuchi') {
    // 辛口好みの場合、マトリックス判定で辛口の日本酒にボーナス
    return sweetnessJudgment.category === 'karakuchi' ? 0.5 : 0;
  }
  // 'either'の場合はボーナスなし
  return 0;
}

export function getPreferenceDescription(diagnosis: DiagnosisResult): string {
  // 日本酒度・酸度マトリックスを使った正確な甘辛度判定
  const estimatedNihonshuDegree = convertSweetnessToNihonshuDegree(diagnosis.sweetness);
  const estimatedAcidity = diagnosis.acidity; // 酸度は実値と仮定
  const sweetnessJudgment = judgeSweetnessByMatrix(estimatedNihonshuDegree, estimatedAcidity);
  
  const richness = diagnosis.richness >= 7 ? '濃醇' : 
                   diagnosis.richness <= 4 ? '淡麗' : 'バランス';
  const aroma = diagnosis.aroma >= 7 ? '華やか' : 
                diagnosis.aroma <= 4 ? '控えめ' : '程よい香り';

  return `${sweetnessJudgment.level}で${richness}、${aroma}な香りの日本酒がお好みのようです。`;
}