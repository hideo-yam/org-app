console.log('=== 4タイプ分類による料理絞り込みテスト ===');

const sashimiDish = {
  typeClass1: 'A', 
  typeClass2: 'B'  
};

function convertTypeClassToSakeType(typeClass) {
  const typeMapping = {
    'A': '薫酒',
    'B': '爽酒', 
    'C': '醇酒',
    'D': '熟酒'
  };
  return typeMapping[typeClass] || typeClass;
}

const recommendedTypes = [];
if (sashimiDish.typeClass1) {
  recommendedTypes.push(convertTypeClassToSakeType(sashimiDish.typeClass1));
}
if (sashimiDish.typeClass2 && sashimiDish.typeClass2 !== sashimiDish.typeClass1) {
  recommendedTypes.push(convertTypeClassToSakeType(sashimiDish.typeClass2));
}

console.log('刺身/寿司の推奨4タイプ:', recommendedTypes);

const testSakes = [
  { name: '薫酒タイプ', sakeTypeCategory: '薫酒' },
  { name: '爽酒タイプ', sakeTypeCategory: '爽酒' },
  { name: '醇酒タイプ', sakeTypeCategory: '醇酒' },
  { name: '熟酒タイプ', sakeTypeCategory: '熟酒' },
  { name: 'タイプ未分類', sakeTypeCategory: null }
];

console.log('\n絞り込み結果:');
testSakes.forEach(sake => {
  const isMatch = recommendedTypes.includes(sake.sakeTypeCategory);
  console.log(`  ${sake.name}: ${isMatch ? '✅ 適合' : '❌ 除外'} (タイプ: ${sake.sakeTypeCategory || '未分類'})`);
});

console.log('\n=== 他の料理例 ===');
const nimonoDish = { typeClass1: 'B', typeClass2: 'C' }; // 煮物: 爽酒, 醇酒
const nimonoTypes = [];
if (nimonoDish.typeClass1) nimonoTypes.push(convertTypeClassToSakeType(nimonoDish.typeClass1));
if (nimonoDish.typeClass2 && nimonoDish.typeClass2 !== nimonoDish.typeClass1) {
  nimonoTypes.push(convertTypeClassToSakeType(nimonoDish.typeClass2));
}
console.log('煮物の推奨4タイプ:', nimonoTypes);