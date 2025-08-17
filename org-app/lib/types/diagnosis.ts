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

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: 'q1',
    question: '普段よく飲むお酒は何ですか？',
    type: 'single',
    options: [
      {
        id: 'beer',
        text: 'ビール',
        value: 'beer',
        weight: { sweetness: 3, richness: 5, acidity: 6, aroma: 4 }
      },
      {
        id: 'wine',
        text: 'ワイン',
        value: 'wine',
        weight: { sweetness: 6, richness: 6, acidity: 7, aroma: 8 }
      },
      {
        id: 'cocktail',
        text: 'カクテル・チューハイ',
        value: 'cocktail',
        weight: { sweetness: 8, richness: 3, acidity: 5, aroma: 7 }
      },
      {
        id: 'whiskey',
        text: 'ウイスキー・焼酎',
        value: 'whiskey',
        weight: { sweetness: 2, richness: 8, acidity: 3, aroma: 5 }
      },
      {
        id: 'none',
        text: 'あまり飲まない',
        value: 'none',
        weight: { sweetness: 5, richness: 5, acidity: 5, aroma: 5 }
      }
    ]
  },
  {
    id: 'q2',
    question: '甘い飲み物は好きですか？',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: ['苦手', '大好き']
  },
  {
    id: 'q3',
    question: '香りの強い食べ物・飲み物は好きですか？',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 10,
    scaleLabels: ['控えめが好き', '華やかが好き']
  },
  {
    id: 'q4',
    question: '飲み物の味について、どちらが好みですか？',
    type: 'single',
    options: [
      {
        id: 'light',
        text: 'あっさり・すっきり',
        value: 'light',
        weight: { sweetness: 0, richness: -3, acidity: 2, aroma: -1 }
      },
      {
        id: 'rich',
        text: 'コクがある・濃厚',
        value: 'rich',
        weight: { sweetness: 0, richness: 3, acidity: -1, aroma: 1 }
      }
    ]
  },
  {
    id: 'q5',
    question: '食事のシーンで日本酒を飲むとしたら？（複数選択可）',
    type: 'multiple',
    options: [
      {
        id: 'sushi',
        text: '寿司・刺身',
        value: 'sushi',
        weight: { sweetness: -1, richness: 1, acidity: 2, aroma: 0 }
      },
      {
        id: 'yakitori',
        text: '焼き鳥・居酒屋料理',
        value: 'yakitori',
        weight: { sweetness: 0, richness: 2, acidity: 1, aroma: 1 }
      },
      {
        id: 'japanese',
        text: '和食（煮物・天ぷら等）',
        value: 'japanese',
        weight: { sweetness: 1, richness: 1, acidity: 0, aroma: 1 }
      },
      {
        id: 'western',
        text: '洋食',
        value: 'western',
        weight: { sweetness: 1, richness: 0, acidity: 1, aroma: 2 }
      },
      {
        id: 'alone',
        text: 'ひとりで楽しむ',
        value: 'alone',
        weight: { sweetness: 2, richness: 0, acidity: 0, aroma: 2 }
      }
    ]
  },
  {
    id: 'q6',
    question: '日本酒の温度について',
    type: 'single',
    options: [
      {
        id: 'cold',
        text: '冷たい方が好き',
        value: 'cold',
        weight: { sweetness: 1, richness: -1, acidity: 1, aroma: 2 }
      },
      {
        id: 'room',
        text: '常温が好き',
        value: 'room',
        weight: { sweetness: 0, richness: 1, acidity: 0, aroma: 0 }
      },
      {
        id: 'warm',
        text: '温かい方が好き',
        value: 'warm',
        weight: { sweetness: 0, richness: 2, acidity: -1, aroma: -1 }
      },
      {
        id: 'unknown',
        text: 'わからない',
        value: 'unknown',
        weight: { sweetness: 0, richness: 0, acidity: 0, aroma: 0 }
      }
    ]
  }
];