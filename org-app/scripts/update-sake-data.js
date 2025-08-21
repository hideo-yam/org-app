#!/usr/bin/env node

/**
 * issendo.jp からの日本酒データ取得・更新スクリプト
 * 
 * 使用方法:
 * node scripts/update-sake-data.js
 * 
 * 機能:
 * - issendo.jpから商品データをスクレイピング
 * - sake-data.tsのデータ構造に変換
 * - 既存データとの差分確認
 * - 新規商品の追加提案
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// 設定
const CONFIG = {
  baseUrl: 'https://issendo.jp',
  outputPath: path.join(__dirname, '..', 'lib', 'data', 'sake-data-scraped.json'),
  existingDataPath: path.join(__dirname, '..', 'lib', 'data', 'sake-data.ts'),
  maxPages: 5, // 取得するページ数の上限
  delay: 1000, // リクエスト間隔（ms）
};

/**
 * 商品データをスクレイピング
 */
async function scrapeSakeData() {
  console.log('🚀 issendo.jp からの日本酒データ取得を開始します...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // メインページへアクセス
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2' });
    
    // 商品リンクを取得
    const productLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="?pid="]'));
      return links.map(link => ({
        url: link.href,
        pid: new URL(link.href).searchParams.get('pid'),
        name: link.textContent?.trim() || ''
      })).filter(item => item.pid);
    });
    
    console.log(`📦 ${productLinks.length} 個の商品を発見しました`);
    
    const scrapedData = [];
    
    // 各商品ページを順次スクレイピング
    for (let i = 0; i < Math.min(productLinks.length, CONFIG.maxPages * 10); i++) {
      const product = productLinks[i];
      console.log(`📄 商品 ${i + 1}/${productLinks.length}: ${product.name}`);
      
      try {
        await page.goto(product.url, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
        
        // 商品詳細情報を抽出
        const productData = await page.evaluate((pid) => {
          // ページから商品情報を抽出するロジック
          const getName = () => {
            return document.querySelector('h1')?.textContent?.trim() ||
                   document.querySelector('.product-name')?.textContent?.trim() ||
                   document.title?.split('|')[0]?.trim() || '';
          };
          
          const getPrice = () => {
            const priceText = document.querySelector('.price, .product-price, [class*="price"]')?.textContent || '';
            const price = priceText.replace(/[^0-9]/g, '');
            return price ? parseInt(price) : 0;
          };
          
          const getDescription = () => {
            return document.querySelector('.description, .product-description, .product-detail')?.textContent?.trim() || '';
          };
          
          const getImageUrl = () => {
            const img = document.querySelector('.product-image img, .main-image img, img[src*="product"]');
            return img ? img.src : '';
          };
          
          return {
            pid,
            name: getName(),
            price: getPrice(),
            description: getDescription(),
            imageUrl: getImageUrl(),
            scrapedAt: new Date().toISOString()
          };
        }, product.pid);
        
        if (productData.name && productData.price > 0) {
          scrapedData.push(productData);
        }
        
      } catch (error) {
        console.warn(`⚠️  商品 ${product.name} の取得でエラー:`, error.message);
      }
    }
    
    return scrapedData;
    
  } finally {
    await browser.close();
  }
}

/**
 * スクレイピングデータを sake-data.ts 形式に変換
 */
function convertToSakeDataFormat(scrapedData) {
  return scrapedData.map((item, index) => {
    // 日本酒名から特徴を推測（簡易版）
    const name = item.name.toLowerCase();
    const isJunmai = name.includes('純米');
    const isDaiginjo = name.includes('大吟醸');
    const isGinjo = name.includes('吟醸');
    const isHonjozo = name.includes('本醸造');
    
    // 価格帯から特徴を推測
    const priceCategory = item.price < 1500 ? 'budget' : item.price < 3000 ? 'mid' : 'premium';
    
    return {
      id: `scraped_${item.pid}`,
      name: item.name,
      brewery: extractBreweryName(item.name),
      price: item.price,
      alcoholContent: 15.0, // デフォルト値
      riceMilling: isDaiginjo ? 45 : isGinjo ? 55 : 65,
      sweetness: priceCategory === 'premium' ? 4.5 : 5.0,
      richness: isJunmai ? 6.0 : 5.5,
      acidity: 1.3,
      aroma: isDaiginjo ? 8.0 : isGinjo ? 7.0 : 5.0,
      type: isDaiginjo ? '純米大吟醸' : isGinjo ? (isJunmai ? '純米吟醸' : '吟醸') : isJunmai ? '純米酒' : isHonjozo ? '本醸造' : '普通酒',
      prefecture: '不明', // スクレイピング結果からは特定困難
      description: item.description || `${item.name}の詳細情報`,
      imageUrl: item.imageUrl,
      ecUrl: `https://issendo.jp/?pid=${item.pid}`,
      tags: generateTags(item, priceCategory),
      sakeTypeCategory: isDaiginjo || isGinjo ? '薫酒' : '醇酒'
    };
  });
}

/**
 * 酒蔵名を抽出（簡易版）
 */
function extractBreweryName(productName) {
  // 商品名から酒蔵名を推測する簡易ロジック
  const patterns = [
    /(.+?)酒造/,
    /(.+?)醸造/,
    /(.+?)\s+/,
  ];
  
  for (const pattern of patterns) {
    const match = productName.match(pattern);
    if (match) {
      return match[1] + '酒造';
    }
  }
  
  return '不明酒造';
}

/**
 * タグを生成
 */
function generateTags(item, priceCategory) {
  const tags = [];
  
  if (priceCategory === 'budget') tags.push('コスパ良');
  if (priceCategory === 'premium') tags.push('高級');
  if (item.name.includes('純米')) tags.push('純米');
  if (item.name.includes('吟醸')) tags.push('吟醸');
  if (item.price < 1000) tags.push('手頃');
  
  return tags;
}

/**
 * 既存データとの差分チェック
 */
async function checkDataDifferences(newData) {
  try {
    const existingData = await fs.readFile(CONFIG.existingDataPath, 'utf8');
    const existingPids = existingData.match(/pid=(\d+)/g) || [];
    const existingPidSet = new Set(existingPids.map(pid => pid.replace('pid=', '')));
    
    const newProducts = newData.filter(item => {
      const pid = item.id.replace('scraped_', '');
      return !existingPidSet.has(pid);
    });
    
    console.log(`📊 既存商品: ${existingPidSet.size}個`);
    console.log(`🆕 新規商品: ${newProducts.length}個`);
    
    return { newProducts, totalExisting: existingPidSet.size };
    
  } catch (error) {
    console.warn('既存データの読み込みでエラー:', error.message);
    return { newProducts: newData, totalExisting: 0 };
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    // スクレイピング実行
    const scrapedData = await scrapeSakeData();
    console.log(`✅ ${scrapedData.length}個の商品データを取得しました`);
    
    // データ変換
    const convertedData = convertToSakeDataFormat(scrapedData);
    
    // 差分チェック
    const { newProducts, totalExisting } = await checkDataDifferences(convertedData);
    
    // 結果をファイルに保存
    await fs.writeFile(CONFIG.outputPath, JSON.stringify(convertedData, null, 2));
    
    // レポート表示
    console.log('\n📋 データ取得レポート:');
    console.log(`- 取得商品数: ${scrapedData.length}`);
    console.log(`- 変換済みデータ: ${convertedData.length}`);
    console.log(`- 既存商品数: ${totalExisting}`);
    console.log(`- 新規商品数: ${newProducts.length}`);
    console.log(`- 出力ファイル: ${CONFIG.outputPath}`);
    
    if (newProducts.length > 0) {
      console.log('\n🆕 新規商品:');
      newProducts.slice(0, 5).forEach(product => {
        console.log(`  - ${product.name} (¥${product.price})`);
      });
      if (newProducts.length > 5) {
        console.log(`  ... 他 ${newProducts.length - 5}商品`);
      }
    }
    
    console.log('\n💡 次のステップ:');
    console.log('1. 生成されたデータを確認してください');
    console.log('2. 手動で sake-data.ts に新規商品を追加してください');
    console.log('3. 商品の詳細情報（酒蔵、地域等）を手動で補完してください');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// CLI実行時
if (require.main === module) {
  main();
}

module.exports = {
  scrapeSakeData,
  convertToSakeDataFormat,
  checkDataDifferences
};