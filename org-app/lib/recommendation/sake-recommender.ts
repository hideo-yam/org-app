import { DiagnosisResult } from '@/lib/types/diagnosis';
import { SakeProfile, sakeData, convertSweetnessToNihonshuDegree } from '@/lib/data/sake-data';
import { calculateCuisineCompatibility, calculateSpecificDishCompatibility, getCuisineDescription } from '@/lib/data/cuisine-compatibility';
import { dishCompatibilityData, getDishDisplayName } from '@/lib/data/dish-compatibility-matrix';
import { judgeSweetnessByMatrix } from '@/lib/utils/sake-sweetness-calculator';

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
  
  // Q3甘辛選択による追加フィルタリング
  const q3Answer = findAnswerForQuestion(diagnosisResult, 'q3');
  if (q3Answer === 'amakuchi' || q3Answer === 'karakuchi') {
    console.log(`🍯 Q3甘辛選択フィルタリング: ${q3Answer === 'amakuchi' ? '甘口選択→辛口除外' : '辛口選択→甘口除外'}`);
    
    const beforeCount = candidateSakes.length;
    candidateSakes = candidateSakes.filter(sake => {
      const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
      const realAcidity = sake.realAcidity ?? sake.acidity;
      const sweetnessJudgment = judgeSweetnessByMatrix(nihonshuDegree, realAcidity);
      
      if (q3Answer === 'amakuchi') {
        // 甘口選択時：辛口を除外
        const isAllowed = sweetnessJudgment.category !== 'karakuchi';
        console.log(`  ${sake.name}: ${isAllowed ? '✅' : '❌'} (${sweetnessJudgment.level})`);
        return isAllowed;
      } else {
        // 辛口選択時：甘口を除外
        const isAllowed = sweetnessJudgment.category !== 'amakuchi';
        console.log(`  ${sake.name}: ${isAllowed ? '✅' : '❌'} (${sweetnessJudgment.level})`);
        return isAllowed;
      }
    });
    
    console.log(`✅ Q3甘辛フィルタリング完了: ${beforeCount}本 → ${candidateSakes.length}本`);
  }
  
  // Q4選択による4タイプ分類フィルタリング（香りの好み：1-4は控えめ好き）
  const q4Answer = findScaleAnswerForQuestion(diagnosisResult, 'q4');
  if (q4Answer !== null && q4Answer >= 1 && q4Answer <= 4) {
    console.log(`🎯 Q4選択フィルタリング: 香り控えめ好み(${q4Answer})→薫酒・熟酒除外`);
    
    const beforeCount = candidateSakes.length;
    candidateSakes = candidateSakes.filter(sake => {
      const sakeType = sake.sakeTypeCategory;
      const isAllowed = sakeType !== '薫酒' && sakeType !== '熟酒';
      console.log(`  ${sake.name}: ${isAllowed ? '✅' : '❌'} (${sakeType || '未分類'})`);
      return isAllowed;
    });
    
    console.log(`✅ Q4タイプ分類フィルタリング完了: ${beforeCount}本 → ${candidateSakes.length}本`);
  }
  
  // マトリックスベースなので必ず候補が存在するはず
  if (candidateSakes.length === 0) {
    console.warn(`⚠️ 警告: マトリックス範囲内に適合する日本酒がありません。全データから選定します。`);
    candidateSakes = [...sakeData]; // フォールバック
  }
  
  // 第二段階: 日本酒度・香味による重み付け計算
  const recommendations: RecommendationScore[] = candidateSakes.map(sake => {
    // 基本診断との適合度を計算
    calculateCompatibilityScore(sake, diagnosisResult);
    
    // 日本酒度・香味に基づく重み付けスコア
    calculateSakeCharacteristicScore(sake, diagnosisResult);
    
    // マトリックス適合度スコア（最優先）
    let matrixScore = 0;
    if (specificDish) {
      const nihonshuDegree = sake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(sake.sweetness);
      const realAcidity = sake.realAcidity ?? sake.acidity;
      const alcoholContent = sake.alcoholContent;
      
      const compatibilityRange = getSpecificDishCompatibilityRange(specificDish);
      if (compatibilityRange) {
        const sakeInRange = nihonshuDegree >= compatibilityRange.sakeMinLevel && 
                           nihonshuDegree <= compatibilityRange.sakeMaxLevel;
        const acidityInRange = realAcidity >= compatibilityRange.acidityMin &&
                              realAcidity <= compatibilityRange.acidityMax;
        const alcoholInRange = alcoholContent >= compatibilityRange.alcoholMin &&
                              alcoholContent <= compatibilityRange.alcoholMax;
        const typeClassMatch = isMatchingTypeClass(specificDish, sake);
        
        matrixScore = calculateMatrixCompatibilityScore(
          specificDish, sake, sakeInRange, acidityInRange, alcoholInRange, typeClassMatch
        );
      }
    }
    
    // 料理相性ボーナス（従来のスコアを維持）
    let cuisineBonus = 0;
    if (specificDish) {
      cuisineBonus = calculateSpecificDishCompatibility(specificDish, sake) * 0.2;
    } else if (cuisineType && cuisineType !== 'various') {
      cuisineBonus = calculateCuisineCompatibility(cuisineType, sake) * 0.1;
    }
    
    // ユーザー好み適合度（最終段階）
    const userPreferenceScore = calculateUserPreferenceScore(sake, diagnosisResult);
    
    // 最終スコア計算: 段階的重みづけ
    // 1. マトリックス適合度（最重要）
    // 2. ユーザー好み適合度（次重要）
    // 3. 従来の料理相性ボーナス（補助的）
    const finalScore = matrixScore * 2.0 + userPreferenceScore * 1.0 + cuisineBonus;
    
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
  
  // 4タイプ分類による絞り込み追加
  const typeClassMatch = isMatchingTypeClass(dishType, sake);
  console.log(`      4タイプ分類: ${typeClassMatch ? '✅' : '❌'} (${sake.sakeTypeCategory || '未分類'})`);
  
  // OR条件による絞り込み：4タイプ分類または数値範囲のいずれかが適合すれば許可
  return typeClassMatch || (sakeInRange && acidityInRange && alcoholInRange);
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
  // ユーザーが香りを重視している場合（7以上）の重み調整
  const isAromaImportant = diagnosis.aroma >= 7;
  
  // 動的重み設定
  const weights = isAromaImportant ? {
    sweetness: 0.35, // 甘辛度
    aroma: 0.4,      // 香り（ユーザー重視時）
    richness: 0.15,  // コク
    acidity: 0.1     // 酸味
  } : {
    sweetness: 0.4,  // 甘辛度（通常）
    aroma: 0.3,      // 香り（通常）
    richness: 0.2,   // コク
    acidity: 0.1     // 酸味
  };
  
  // 各適合度の計算
  const sweetnessMatch = 10 - Math.abs(sake.sweetness - diagnosis.sweetness);
  const sweetnessScore = Math.max(0, sweetnessMatch) * weights.sweetness;
  
  const aromaMatch = 10 - Math.abs(sake.aroma - diagnosis.aroma);
  const aromaScore = Math.max(0, aromaMatch) * weights.aroma;
  
  const richnessMatch = 10 - Math.abs(sake.richness - diagnosis.richness);
  const richnessScore = Math.max(0, richnessMatch) * weights.richness;
  
  const acidityMatch = 10 - Math.abs(sake.acidity - diagnosis.acidity);
  const acidityScore = Math.max(0, acidityMatch) * weights.acidity;
  
  console.log(`    🎯 重み設定: 香り重視=${isAromaImportant} (香り${weights.aroma*100}%, 甘辛${weights.sweetness*100}%)`);
  
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
  // ユーザーが香りを重視している場合の動的重み調整
  const isAromaImportant = diagnosis.aroma >= 7;
  
  const weights = isAromaImportant ? {
    sweetness: 0.25,  // 甘辛度
    aroma: 0.35,      // 香り（ユーザー重視時）
    richness: 0.25,   // コク
    acidity: 0.15     // 酸味
  } : {
    sweetness: 0.3,   // 甘辛度（通常）
    aroma: 0.25,      // 香り（通常）
    richness: 0.25,   // コク
    acidity: 0.2      // 酸味
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

/**
 * typeClassコード(A,B,C,D)を4タイプ分類名に変換
 */
export function convertTypeClassToSakeType(typeClass: string): string {
  const typeMapping = {
    'A': '薫酒',
    'B': '爽酒', 
    'C': '醇酒',
    'D': '熟酒'
  };
  return typeMapping[typeClass as keyof typeof typeMapping] || typeClass;
}

/**
 * マトリックス適合度スコア計算（OR条件方式）
 * 1. 4タイプ分類（OR条件でマッチング）
 * 2. 日本酒度・酸度・アルコール度数（次優先）
 */
function calculateMatrixCompatibilityScore(
  _dishType: string,
  _sake: SakeProfile,
  sakeInRange: boolean,
  acidityInRange: boolean,
  alcoholInRange: boolean,
  typeClassMatch: boolean
): number {
  let score = 0;
  
  // 1. 4タイプ分類マッチング（OR条件で評価）
  if (typeClassMatch) {
    score += 10; // OR条件でいずれかにマッチした場合の高得点
    console.log(`      🥇 4タイプ分類適合（OR条件）: +10点`);
  } else {
    console.log(`      ❌ 4タイプ分類不適合: 0点`);
    // OR条件でもマッチしない場合は減点なし（除外条件から変更）
  }
  
  // 2. 数値的制約（副次的重要度）
  if (sakeInRange) {
    score += 3;
    console.log(`      🥈 日本酒度適合: +3点`);
  }
  
  if (acidityInRange) {
    score += 2;
    console.log(`      🥈 酸度適合: +2点`);
  }
  
  if (alcoholInRange) {
    score += 1;
    console.log(`      🥈 アルコール度数適合: +1点`);
  }
  
  console.log(`      📊 マトリックス適合度スコア: ${score}点`);
  return score;
}

/**
 * ユーザー好み適合度スコア計算
 * マトリックス絞り込み後にユーザーの診断結果との適合度を計算
 */
function calculateUserPreferenceScore(sake: SakeProfile, diagnosis: DiagnosisResult): number {
  // ユーザーが香りを重視している場合の動的重み調整
  const isAromaImportant = diagnosis.aroma >= 7;
  
  const weights = isAromaImportant ? {
    sweetness: 0.35, // 甘辛度
    aroma: 0.4,      // 香り（ユーザー重視時：40%）
    richness: 0.15,  // コク
    acidity: 0.1     // 酸味
  } : {
    sweetness: 0.4,  // 甘辛度（通常）
    aroma: 0.3,      // 香り（通常：30%）
    richness: 0.2,   // コク
    acidity: 0.1     // 酸味
  };

  // 各要素の適合度を計算（10点満点での距離ベース）
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

  console.log(`      🎯 ユーザー好み適合度スコア: ${Math.round(totalScore * 10) / 10}点`);
  return Math.round(totalScore * 10) / 10;
}

/**
 * 料理の推奨4タイプ分類と日本酒のタイプが一致するかチェック（OR条件）
 */
function isMatchingTypeClass(dishType: string, sake: SakeProfile): boolean {
  // 料理の推奨タイプを取得
  const dishData = dishCompatibilityData.find(dish => dish.id === dishType);
  if (!dishData) {
    console.log(`    料理「${dishType}」のデータが見つかりません`);
    return true; // データがない場合は制限しない
  }
  
  // 日本酒の4タイプ分類
  const sakeType = sake.sakeTypeCategory;
  if (!sakeType) {
    console.log(`    日本酒「${sake.name}」のタイプ分類がありません`);
    return true; // タイプ分類がない場合は制限しない
  }
  
  // OR条件: typeClass1またはtypeClass2のいずれかにマッチすれば適合
  const isMatch1 = Boolean(dishData.typeClass1 && convertTypeClassToSakeType(dishData.typeClass1) === sakeType);
  const isMatch2 = Boolean(dishData.typeClass2 && convertTypeClassToSakeType(dishData.typeClass2) === sakeType);
  
  const isMatch = isMatch1 || isMatch2;
  
  console.log(`    推奨タイプ1: ${dishData.typeClass1 ? convertTypeClassToSakeType(dishData.typeClass1) : 'なし'} ${isMatch1 ? '✅' : '❌'}`);
  console.log(`    推奨タイプ2: ${dishData.typeClass2 ? convertTypeClassToSakeType(dishData.typeClass2) : 'なし'} ${isMatch2 ? '✅' : '❌'}`);
  console.log(`    日本酒タイプ: ${sakeType}, OR条件結果: ${isMatch ? '✅' : '❌'}`);
  
  return isMatch;
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

// ヘルパー関数: スケール回答を取得
function findScaleAnswerForQuestion(
  diagnosisResult: { answers?: { questionId: string; scaleValue?: number }[] }, 
  questionId: string
): number | null {
  if (diagnosisResult.answers) {
    const answer = diagnosisResult.answers.find((a) => a.questionId === questionId);
    return answer?.scaleValue ?? null;
  }
  return null;
}


export function getPreferenceDescription(
  diagnosis: DiagnosisResult,
  recommendedSakes?: RecommendationScore[]
): string {
  // おすすめされた日本酒の特徴を分析
  if (recommendedSakes && recommendedSakes.length > 0) {
    return generateRecommendationBasedDescription(diagnosis, recommendedSakes);
  }
  
  // フォールバック: 診断結果のみから生成
  return generateDiagnosisBasedDescription(diagnosis);
}

/**
 * おすすめ日本酒の特徴を踏まえた説明文生成
 */
function generateRecommendationBasedDescription(
  _diagnosis: DiagnosisResult,
  recommendations: RecommendationScore[]
): string {
  const topSake = recommendations[0].sake;
  
  // おすすめ日本酒の実際の特徴を使用
  const nihonshuDegree = topSake.nihonshuDegree ?? convertSweetnessToNihonshuDegree(topSake.sweetness);
  const realAcidity = topSake.realAcidity ?? topSake.acidity;
  const sweetnessJudgment = judgeSweetnessByMatrix(nihonshuDegree, realAcidity);
  
  const richness = topSake.richness >= 7 ? '濃醇' : 
                   topSake.richness <= 4 ? '淡麗' : 'バランスの良い';
  const aroma = topSake.aroma >= 7 ? '華やか' : 
                topSake.aroma <= 4 ? '控えめ' : '程よい';
  
  // 4タイプ分類も含めた説明
  const typeDescription = topSake.sakeTypeCategory ? 
    `${topSake.sakeTypeCategory}タイプの` : '';
  
  // 複数の特徴を組み合わせた自然な説明文
  if (recommendations.length === 1) {
    return `あなたには${typeDescription}${sweetnessJudgment.level}で${richness}、${aroma}な香りの「${topSake.name}」をおすすめします。`;
  } else {
    const sakeTypeSet = new Set(recommendations.slice(0, 3).map(r => r.sake.sakeTypeCategory).filter(Boolean));
    const typeText = sakeTypeSet.size > 0 ? 
      `${Array.from(sakeTypeSet).join('・')}タイプの` : '';
    
    return `あなたには${typeText}${sweetnessJudgment.level}で${richness}、${aroma}な香りの日本酒をおすすめします。`;
  }
}

/**
 * 診断結果のみに基づく説明文生成（フォールバック）
 */
function generateDiagnosisBasedDescription(diagnosis: DiagnosisResult): string {
  const estimatedNihonshuDegree = convertSweetnessToNihonshuDegree(diagnosis.sweetness);
  const estimatedAcidity = diagnosis.acidity;
  const sweetnessJudgment = judgeSweetnessByMatrix(estimatedNihonshuDegree, estimatedAcidity);
  
  const richness = diagnosis.richness >= 7 ? '濃醇' : 
                   diagnosis.richness <= 4 ? '淡麗' : 'バランスの良い';
  const aroma = diagnosis.aroma >= 7 ? '華やか' : 
                diagnosis.aroma <= 4 ? '控えめ' : '程よい';

  return `あなたには${sweetnessJudgment.level}で${richness}、${aroma}な香りの日本酒をおすすめします。`;
}