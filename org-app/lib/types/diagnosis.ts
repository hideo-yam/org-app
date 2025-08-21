export interface DiagnosisQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options?: DiagnosisOption[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: [string, string];
}

export interface DiagnosisOption {
  id: string;
  text: string;
  value: number | string;
  weight?: {
    sweetness?: number;
    richness?: number;
    acidity?: number;
    aroma?: number;
  };
}

export interface DiagnosisAnswer {
  questionId: string;
  selectedOptions: string[];
  scaleValue?: number;
}

export interface DiagnosisResult {
  sweetness: number;
  richness: number;
  acidity: number;
  aroma: number;
}

// 動的質問生成用の料理種類データ
export const cuisineSpecificOptions = {
  japanese: [
    {
      id: 'sashimi_sushi',
      text: '刺身・寿司',
      value: 'sashimi_sushi',
      weight: { sweetness: 0, richness: 1, acidity: 2, aroma: 0 },
      compatibility: { sakeMinLevel: 0, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 2, alcoholMin: 10, alcoholMax: 16 }
    },
    {
      id: 'nimono',
      text: '煮物',
      value: 'nimono',
      weight: { sweetness: 1, richness: 1, acidity: 0, aroma: 1 },
      compatibility: { sakeMinLevel: -3, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 16 }
    },
    {
      id: 'yakimono',
      text: '焼き物',
      value: 'yakimono',
      weight: { sweetness: 0, richness: 2, acidity: 1, aroma: 1 },
      compatibility: { sakeMinLevel: 0, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 2, alcoholMin: 15, alcoholMax: 20 }
    },
    {
      id: 'agemono',
      text: '揚げ物',
      value: 'agemono',
      weight: { sweetness: 0, richness: 2, acidity: 1, aroma: 1 },
      compatibility: { sakeMinLevel: 0, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 2, alcoholMin: 10, alcoholMax: 18 }
    }
  ],
  chinese: [
    {
      id: 'tenshin',
      text: '天津（甘酢系）',
      value: 'tenshin',
      weight: { sweetness: 2, richness: 1, acidity: 1, aroma: 1 },
      compatibility: { sakeMinLevel: -5, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 2, alcoholMin: 10, alcoholMax: 15 }
    },
    {
      id: 'strong_taste',
      text: '濃い味（四川・麻婆など）',
      value: 'strong_taste',
      weight: { sweetness: -1, richness: 3, acidity: 2, aroma: 0 },
      compatibility: { sakeMinLevel: -5, sakeMaxLevel: 5, acidityMin: 0, acidityMax: 3, alcoholMin: 10, alcoholMax: 18 }
    },
    {
      id: 'light_taste',
      text: '薄味（蒸し物・炒め物）',
      value: 'light_taste',
      weight: { sweetness: 1, richness: 0, acidity: 0, aroma: 1 },
      compatibility: { sakeMinLevel: 0, sakeMaxLevel: 10, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 15 }
    },
    {
      id: 'chinese_fried',
      text: '中華揚げ物',
      value: 'chinese_fried',
      weight: { sweetness: 0, richness: 2, acidity: 1, aroma: 0 },
      compatibility: { sakeMinLevel: 2, sakeMaxLevel: 15, acidityMin: 0, acidityMax: 1, alcoholMin: 10, alcoholMax: 16 }
    }
  ],
  western: [
    {
      id: 'carpaccio_oyster',
      text: 'カルパッチョ・生牡蠣',
      value: 'carpaccio_oyster',
      weight: { sweetness: 1, richness: -1, acidity: 2, aroma: 2 },
      compatibility: { sakeMinLevel: 2, sakeMaxLevel: 15, acidityMin: 1, acidityMax: 3, alcoholMin: 12, alcoholMax: 18 }
    },
    {
      id: 'meat_dish',
      text: '肉料理（ステーキ・ローストなど）',
      value: 'meat_dish',
      weight: { sweetness: 0, richness: 2, acidity: 1, aroma: 1 },
      compatibility: { sakeMinLevel: 0, sakeMaxLevel: 18, acidityMin: 0, acidityMax: 2, alcoholMin: 12, alcoholMax: 16 }
    },
    {
      id: 'fish_dish',
      text: '魚料理（ムニエル・グリルなど）',
      value: 'fish_dish',
      weight: { sweetness: 1, richness: 0, acidity: 1, aroma: 2 },
      compatibility: { sakeMinLevel: 2, sakeMaxLevel: 18, acidityMin: 0, acidityMax: 2, alcoholMin: 15, alcoholMax: 16 }
    },
    {
      id: 'gibier',
      text: 'ジビエ（鹿・猪など）',
      value: 'gibier',
      weight: { sweetness: 1, richness: 3, acidity: 2, aroma: 0 },
      compatibility: { sakeMinLevel: -2, sakeMaxLevel: 5, acidityMin: 1, acidityMax: 3, alcoholMin: 15, alcoholMax: 18 }
    }
  ]
};

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: 'q1',
    question: 'どのジャンルの料理と一緒に日本酒を楽しみたいですか？',
    type: 'single',
    options: [
      {
        id: 'japanese',
        text: '和食',
        value: 'japanese',
        weight: { sweetness: 5, richness: 6, acidity: 4, aroma: 6 }
      },
      {
        id: 'chinese',
        text: '中華料理',
        value: 'chinese',
        weight: { sweetness: 4, richness: 7, acidity: 5, aroma: 5 }
      },
      {
        id: 'western',
        text: '洋食',
        value: 'western',
        weight: { sweetness: 6, richness: 5, acidity: 6, aroma: 7 }
      },
      {
        id: 'various',
        text: '色々な料理と合わせたい',
        value: 'various',
        weight: { sweetness: 5, richness: 5, acidity: 5, aroma: 5 }
      }
    ]
  },
  // q2は動的に生成されるため、ここでは空の placeholder
  {
    id: 'q2',
    question: '', // 動的に設定
    type: 'single',
    options: [] // 動的に設定
  },
  {
    id: 'q3',
    question: '甘口、辛口のどちらがお好みですか？',
    type: 'single',
    options: [
      {
        id: 'amakuchi',
        text: '甘口',
        value: 'amakuchi',
        weight: { sweetness: 2, richness: 0, acidity: 0, aroma: 0 }
      },
      {
        id: 'karakuchi',
        text: '辛口',
        value: 'karakuchi',
        weight: { sweetness: -2, richness: 0, acidity: 0, aroma: 0 }
      },
      {
        id: 'either',
        text: 'どちらでも良い',
        value: 'either',
        weight: { sweetness: 0, richness: 0, acidity: 0, aroma: 0 }
      }
    ]
  },
  {
    id: 'q4',
    question: '香りの高いお酒が好みですか？',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: ['控えめが好き', '華やかが好き']
  }
];