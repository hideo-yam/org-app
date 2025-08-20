// お酒とお料理相性マトリックスから抽出した詳細料理データ

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
  typeClass1: string;
  typeClass2: string;
  matchBonus: number;
}

export const dishCompatibilityData: DishCompatibilityDetail[] = [
  {
    id: "sashimi_sushi",
    name: "刺身/寿司",
    cuisineType: "japanese",
    compatibility: {
      sakeMinLevel: 0.0,
      sakeMaxLevel: 5.0,
      acidityMin: 0.0,
      acidityMax: 2.0,
      alcoholMin: 10.0,
      alcoholMax: 16.0,
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
      sakeMinLevel: -3.0,
      sakeMaxLevel: 5.0,
      acidityMin: 0.0,
      acidityMax: 1.0,
      alcoholMin: 10.0,
      alcoholMax: 16.0,
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
      sakeMinLevel: 0.0,
      sakeMaxLevel: 15.0,
      acidityMin: 1.0,
      acidityMax: 2.0,
      alcoholMin: 15.0,
      alcoholMax: 20.0,
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
      sakeMinLevel: 0.0,
      sakeMaxLevel: 15.0,
      acidityMin: 1.0,
      acidityMax: 2.0,
      alcoholMin: 10.0,
      alcoholMax: 18.0,
    },
    typeClass1: "A",
    typeClass2: "B",
    matchBonus: 2.0
  },
  {
    id: "tenshin",
    name: "天津",
    cuisineType: "chinese",
    compatibility: {
      sakeMinLevel: -5.0,
      sakeMaxLevel: 5.0,
      acidityMin: 0.0,
      acidityMax: 2.0,
      alcoholMin: 10.0,
      alcoholMax: 15.0,
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
      sakeMinLevel: -5.0,
      sakeMaxLevel: 5.0,
      acidityMin: 0.0,
      acidityMax: 3.0,
      alcoholMin: 10.0,
      alcoholMax: 18.0,
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
      sakeMinLevel: 0.0,
      sakeMaxLevel: 10.0,
      acidityMin: 0.0,
      acidityMax: 1.0,
      alcoholMin: 10.0,
      alcoholMax: 15.0,
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
      sakeMinLevel: 2.0,
      sakeMaxLevel: 15.0,
      acidityMin: 0.0,
      acidityMax: 1.0,
      alcoholMin: 10.0,
      alcoholMax: 16.0,
    },
    typeClass1: "B",
    typeClass2: "C",
    matchBonus: 1.5
  },
  {
    id: "carpaccio_oyster",
    name: "カルパッチョ/生牡蠣",
    cuisineType: "western",
    compatibility: {
      sakeMinLevel: 2.0,
      sakeMaxLevel: 15.0,
      acidityMin: 1.0,
      acidityMax: 3.0,
      alcoholMin: 12.0,
      alcoholMax: 18.0,
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
      sakeMinLevel: 0.0,
      sakeMaxLevel: 18.0,
      acidityMin: 0.0,
      acidityMax: 2.0,
      alcoholMin: 12.0,
      alcoholMax: 16.0,
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
      sakeMinLevel: 2.0,
      sakeMaxLevel: 18.0,
      acidityMin: 0.0,
      acidityMax: 2.0,
      alcoholMin: 15.0,
      alcoholMax: 16.0,
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
      sakeMinLevel: -2.0,
      sakeMaxLevel: 5.0,
      acidityMin: 1.0,
      acidityMax: 3.0,
      alcoholMin: 15.0,
      alcoholMax: 18.0,
    },
    typeClass1: "C",
    typeClass2: "D",
    matchBonus: 1.8
  }
];

// 料理IDから表示名を取得
export function getDishDisplayName(dishId: string): string {
  const dish = dishCompatibilityData.find(d => d.id === dishId);
  return dish ? dish.name : dishId;
}

// 料理タイプから該当料理一覧を取得  
export function getDishesByCuisineType(cuisineType: 'japanese' | 'chinese' | 'western'): DishCompatibilityDetail[] {
  return dishCompatibilityData.filter(d => d.cuisineType === cuisineType);
}
