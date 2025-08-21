// テスト用の推薦システム検証スクリプト
const { sakeData } = require('./lib/data/sake-data.ts');
const { recommendSakes } = require('./lib/recommendation/sake-recommender.ts');

// テスト用の診断結果
const testDiagnosisResult = {
  sweetness: 3, // やや辛口好み
  richness: 5,  // 中程度の濃さ
  aroma: 6,     // やや華やか
  servingStyle: 2 // 冷やして
};

console.log('=== 日本酒推薦システムテスト ===');
console.log('総日本酒数:', sakeData.length);

// 和食料理との相性テスト
console.log('\n=== 和食料理（刺身/寿司）との相性テスト ===');
const recommendations = recommendSakes(testDiagnosisResult, 3, 'japanese', 'sashimi_sushi');

console.log('推薦結果数:', recommendations.length);
recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.sake.name}`);
  console.log(`   酒蔵: ${rec.sake.brewery}`);
  console.log(`   価格: ${rec.sake.price}円`);
  console.log(`   甘辛度: ${rec.sake.sweetness}`);
  console.log(`   酸度: ${rec.sake.acidity}`);
  console.log(`   アルコール度数: ${rec.sake.alcoholContent}%`);
  console.log(`   総合スコア: ${rec.totalScore.toFixed(2)}`);
  console.log(`   URL: ${rec.sake.ecUrl}`);
  console.log('');
});

// 全ての日本酒がissendo.jpのURLを持っているかチェック
console.log('\n=== URL検証 ===');
const issendoSakes = sakeData.filter(sake => sake.ecUrl === 'https://issendo.jp/');
console.log(`issendo.jpのURL を持つ日本酒: ${issendoSakes.length}/${sakeData.length}`);

if (issendoSakes.length === sakeData.length) {
  console.log('✅ 全ての日本酒がissendo.jpのURLに更新されています');
} else {
  console.log('❌ 一部の日本酒でURLが更新されていません');
}

console.log('\n=== テスト完了 ===');