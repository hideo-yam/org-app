// お酒とお料理相性マトリックスから抽出した詳細料理データ
// CSVファイル「料理（和食・中華・洋食）とお酒の相性データマトリックス.csv」から取得

import { convertTypeClassToSakeType } from '@/lib/recommendation/sake-recommender';

export interface DishCompatibilityDetail {
  id: string;
  name: string;
  cuisineType: 'japanese' | 'chinese' | 'western';
  compatibility: {
    sakeMinLevel: number;
    sakeMaxLevel: number;
    acidityMin: number;
    acidityMax: number;
    alcoholMin: number;
    alcoholMax: number;
  };
  typeClass1: string; // A=薫酒, B=爽酒, C=醇酒, D=熟酒
  typeClass2: string; // A=薫酒, B=爽酒, C=醇酒, D=熟酒
  matchBonus: number;
}

/**
 * 料理の推奨4タイプ分類を取得
 */
export function getDishRecommendedSakeTypes(dishId: string): string[] {
  const dish = dishCompatibilityData.find(d => d.id === dishId);
  if (!dish) return [];
  
  const types = [];
  if (dish.typeClass1) types.push(convertTypeClassToSakeType(dish.typeClass1));
  if (dish.typeClass2 && dish.typeClass2 !== dish.typeClass1) {
    types.push(convertTypeClassToSakeType(dish.typeClass2));
  }
  return types;
}

export const dishCompatibilityData: DishCompatibilityDetail[] = [
  // 【和食系】CSVデータより
  {
    id: "sashimi_sushi",
    name: "刺身/寿司",
    cuisineType: "japanese",
    compatibility: {
      sakeMinLevel: 0,
      sakeMaxLevel: 5,
      acidityMin: 0,
      acidityMax: 2,
      alcoholMin: 10,
      alcoholMax: 16,
    },
    typeClass1: "A",
    typeClass2: "B",
    matchBonus: 2.5
  },
  {
    id: "nimono",
    name: "煮物",
    cuisineType: "japanese",
    compatibility: {
      sakeMinLevel: -3,
      sakeMaxLevel: 5,
      acidityMin: 0,
      acidityMax: 1,
      alcoholMin: 10,
      alcoholMax: 16,
    },
    typeClass1: "B",
    typeClass2: "C",
    matchBonus: 2.0
  },
  {
    id: "yakimono",
    name: "焼き物",
    cuisineType: "japanese",
    compatibility: {
      sakeMinLevel: 0,
      sakeMaxLevel: 15,
      acidityMin: 1,
      acidityMax: 2,
      alcoholMin: 15,
      alcoholMax: 20,
    },
    typeClass1: "B",
    typeClass2: "C",
    matchBonus: 2.0
  },
  {
    id: "agemono",
    name: "揚げ物",
    cuisineType: "japanese",
    compatibility: {
      sakeMinLevel: 0,
      sakeMaxLevel: 15,
      acidityMin: 1,
      acidityMax: 2,
      alcoholMin: 10,
      alcoholMax: 18,
    },
    typeClass1: "A",
    typeClass2: "B",
    matchBonus: 2.0
  },

  // 【中華系】CSVデータより
  {
    id: "tenshin",
    name: "天津",
    cuisineType: "chinese",
    compatibility: {
      sakeMinLevel: -5,
      sakeMaxLevel: 5,
      acidityMin: 0,
      acidityMax: 2,
      alcoholMin: 10,
      alcoholMax: 15,
    },
    typeClass1: "B",
    typeClass2: "B",
    matchBonus: 1.5
  },
  {
    id: "strong_taste",
    name: "濃い味",
    cuisineType: "chinese",
    compatibility: {
      sakeMinLevel: -5,
      sakeMaxLevel: 5,
      acidityMin: 0,
      acidityMax: 3,
      alcoholMin: 10,
      alcoholMax: 18,
    },
    typeClass1: "C",
    typeClass2: "D",
    matchBonus: 1.5
  },
  {
    id: "light_taste",
    name: "薄味",
    cuisineType: "chinese",
    compatibility: {
      sakeMinLevel: 0,
      sakeMaxLevel: 10,
      acidityMin: 0,
      acidityMax: 1,
      alcoholMin: 10,
      alcoholMax: 15,
    },
    typeClass1: "B",
    typeClass2: "B",
    matchBonus: 1.5
  },
  {
    id: "chinese_fried",
    name: "揚げ物",
    cuisineType: "chinese",
    compatibility: {
      sakeMinLevel: 2,
      sakeMaxLevel: 15,
      acidityMin: 0,
      acidityMax: 1,
      alcoholMin: 10,
      alcoholMax: 16,
    },
    typeClass1: "B",
    typeClass2: "C",
    matchBonus: 1.5
  },

  // 【洋食系】CSVデータより
  {
    id: "carpaccio_oyster",
    name: "カルパッチョ/生牡蠣",
    cuisineType: "western",
    compatibility: {
      sakeMinLevel: 2,
      sakeMaxLevel: 15,
      acidityMin: 1,
      acidityMax: 3,
      alcoholMin: 12,
      alcoholMax: 18,
    },
    typeClass1: "A",
    typeClass2: "B",
    matchBonus: 2.3
  },
  {
    id: "meat_dish",
    name: "肉料理",
    cuisineType: "western",
    compatibility: {
      sakeMinLevel: 0,
      sakeMaxLevel: 18,
      acidityMin: 0,
      acidityMax: 2,
      alcoholMin: 12,
      alcoholMax: 16,
    },
    typeClass1: "B",
    typeClass2: "C",
    matchBonus: 1.8
  },
  {
    id: "fish_dish",
    name: "魚料理",
    cuisineType: "western",
    compatibility: {
      sakeMinLevel: 2,
      sakeMaxLevel: 18,
      acidityMin: 0,
      acidityMax: 2,
      alcoholMin: 15,
      alcoholMax: 16,
    },
    typeClass1: "A",
    typeClass2: "B",
    matchBonus: 1.8
  },
  {
    id: "gibier",
    name: "ジビエ",
    cuisineType: "western",
    compatibility: {
      sakeMinLevel: -2,
      sakeMaxLevel: 5,
      acidityMin: 1,
      acidityMax: 3,
      alcoholMin: 15,
      alcoholMax: 18,
    },
    typeClass1: "C",
    typeClass2: "D",
    matchBonus: 1.8
  }
];

// CSVマトリックスデータ要約
export const matrixDataSummary = {
  japanese: {
    sakeRange: { min: -3, max: 15 },
    acidityRange: { min: 0, max: 2 },
    alcoholRange: { min: 10, max: 20 }
  },
  chinese: {
    sakeRange: { min: -5, max: 15 },
    acidityRange: { min: 0, max: 3 },
    alcoholRange: { min: 10, max: 18 }
  },
  western: {
    sakeRange: { min: -2, max: 18 },
    acidityRange: { min: 0, max: 3 },
    alcoholRange: { min: 12, max: 18 }
  }
};

// 料理IDから表示名を取得
export function getDishDisplayName(dishId: string): string {
  const dish = dishCompatibilityData.find(d => d.id === dishId);
  return dish ? dish.name : dishId;
}

// 料理タイプから該当料理一覧を取得  
export function getDishesByCuisineType(cuisineType: 'japanese' | 'chinese' | 'western'): DishCompatibilityDetail[] {
  return dishCompatibilityData.filter(d => d.cuisineType === cuisineType);
}
