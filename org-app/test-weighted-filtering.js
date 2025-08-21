console.log('=== 重みづけフィルタリングシステムテスト ===');

// テスト用データ
const testSakes = [
  {
    name: '薫酒タイプA', 
    sakeTypeCategory: '薫酒',
    nihonshuDegree: 3,
    acidity: 1.2, 
    alcoholContent: 15,
    sweetness: 3,
    richness: 5,
    aroma: 8
  },
  {
    name: '醇酒タイプB', 
    sakeTypeCategory: '醇酒',
    nihonshuDegree: 2,
    acidity: 1.5, 
    alcoholContent: 16,
    sweetness: 6,
    richness: 7,
    aroma: 5
  },
  {
    name: '爽酒タイプC', 
    sakeTypeCategory: '爽酒',
    nihonshuDegree: 4,
    acidity: 1.0, 
    alcoholContent: 14,
    sweetness: 2,
    richness: 4,
    aroma: 6
  }
];

// 刺身/寿司のマトリックス制約
const sashimiMatrix = {
  sakeMinLevel: 0,
  sakeMaxLevel: 5,
  acidityMin: 0,
  acidityMax: 2,
  alcoholMin: 10,
  alcoholMax: 16,
  typeClass1: 'A', // 薫酒
  typeClass2: 'B'  // 爽酒
};

// ユーザー診断結果（例：辛口・香り高め好み）
const userDiagnosis = {
  sweetness: 3,  // 辛口寄り
  richness: 5,   // 普通
  aroma: 8,      // 香り高め
  acidity: 5     // 普通
};

function convertTypeClassToSakeType(typeClass) {
  const typeMapping = { 'A': '薫酒', 'B': '爽酒', 'C': '醇酒', 'D': '熟酒' };
  return typeMapping[typeClass] || typeClass;
}

function isMatchingTypeClass(sakeType) {
  const recommendedTypes = [
    convertTypeClassToSakeType(sashimiMatrix.typeClass1),
    convertTypeClassToSakeType(sashimiMatrix.typeClass2)
  ];
  return recommendedTypes.includes(sakeType);
}

function calculateMatrixScore(sake) {
  let score = 0;
  
  // 1. 4タイプ分類チェック（最優先）
  const typeClassMatch = isMatchingTypeClass(sake.sakeTypeCategory);
  if (typeClassMatch) {
    score += 10;
  } else {
    score -= 5;
  }
  
  // 2. 数値制約チェック
  if (sake.nihonshuDegree >= sashimiMatrix.sakeMinLevel && 
      sake.nihonshuDegree <= sashimiMatrix.sakeMaxLevel) {
    score += 3;
  }
  
  if (sake.acidity >= sashimiMatrix.acidityMin && 
      sake.acidity <= sashimiMatrix.acidityMax) {
    score += 2;
  }
  
  if (sake.alcoholContent >= sashimiMatrix.alcoholMin && 
      sake.alcoholContent <= sashimiMatrix.alcoholMax) {
    score += 1;
  }
  
  return score;
}

function calculateUserPreferenceScore(sake, diagnosis) {
  const weights = { sweetness: 0.4, aroma: 0.3, richness: 0.2, acidity: 0.1 };
  
  const sweetnessScore = Math.max(0, 10 - Math.abs(sake.sweetness - diagnosis.sweetness));
  const richnessScore = Math.max(0, 10 - Math.abs(sake.richness - diagnosis.richness));
  const aromaScore = Math.max(0, 10 - Math.abs(sake.aroma - diagnosis.aroma));
  const acidityScore = Math.max(0, 10 - Math.abs(sake.acidity - diagnosis.acidity));
  
  return sweetnessScore * weights.sweetness +
         richnessScore * weights.richness +
         aromaScore * weights.aroma +
         acidityScore * weights.acidity;
}

console.log('刺身/寿司 + 辛口・香り高め好みユーザー:');
console.log('推奨4タイプ:', [
  convertTypeClassToSakeType(sashimiMatrix.typeClass1),
  convertTypeClassToSakeType(sashimiMatrix.typeClass2)
].join(', '));
console.log('');

testSakes.forEach(sake => {
  const matrixScore = calculateMatrixScore(sake);
  const userScore = calculateUserPreferenceScore(sake, userDiagnosis);
  const finalScore = matrixScore * 2.0 + userScore * 1.0;
  
  console.log(`${sake.name}:`);
  console.log(`  4タイプ: ${sake.sakeTypeCategory} ${isMatchingTypeClass(sake.sakeTypeCategory) ? '✅' : '❌'}`);
  console.log(`  マトリックススコア: ${matrixScore}点`);
  console.log(`  ユーザー好みスコア: ${userScore.toFixed(1)}点`);
  console.log(`  最終スコア: ${finalScore.toFixed(1)}点`);
  console.log('');
});