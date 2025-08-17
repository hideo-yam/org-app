'use client';

import { DiagnosisResult } from '@/lib/types/diagnosis';
import { RecommendationScore } from '@/lib/recommendation/sake-recommender';
import { getPreferenceDescription } from '@/lib/recommendation/sake-recommender';
import { SakeCard } from '@/components/sake/sake-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecommendationResultsProps {
  diagnosisResult: DiagnosisResult;
  recommendations: RecommendationScore[];
  onRetry: () => void;
}

export function RecommendationResults({ 
  diagnosisResult, 
  recommendations, 
  onRetry 
}: RecommendationResultsProps) {
  const preferenceDescription = getPreferenceDescription(diagnosisResult);

  const getCharacteristicLevel = (value: number) => {
    if (value >= 8) return '高';
    if (value >= 6) return '中';
    if (value >= 4) return '中';
    return '低';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* 診断結果サマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">診断結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-lg">{preferenceDescription}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {diagnosisResult.sweetness}
              </div>
              <div className="text-sm text-gray-600">甘さ</div>
              <Badge variant="outline" className="mt-1">
                {getCharacteristicLevel(diagnosisResult.sweetness)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {diagnosisResult.richness}
              </div>
              <div className="text-sm text-gray-600">コク</div>
              <Badge variant="outline" className="mt-1">
                {getCharacteristicLevel(diagnosisResult.richness)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {diagnosisResult.aroma}
              </div>
              <div className="text-sm text-gray-600">香り</div>
              <Badge variant="outline" className="mt-1">
                {getCharacteristicLevel(diagnosisResult.aroma)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {diagnosisResult.acidity}
              </div>
              <div className="text-sm text-gray-600">酸味</div>
              <Badge variant="outline" className="mt-1">
                {getCharacteristicLevel(diagnosisResult.acidity)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* おすすめ日本酒 */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">
          あなたにおすすめの日本酒
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.sake.id} className="relative">
              {index === 0 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-yellow-500 text-white">
                    No.1 おすすめ
                  </Badge>
                </div>
              )}
              <SakeCard
                sake={recommendation.sake}
                matchReasons={recommendation.matchReasons}
              />
            </div>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onRetry}>
          診断をやり直す
        </Button>
        <Button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ページトップに戻る
        </Button>
      </div>

      {/* 注意事項 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <h3 className="font-medium text-yellow-800 mb-2">ご注意</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 価格は参考価格です。実際の販売価格は店舗により異なります。</li>
            <li>• 在庫状況により、商品が入手できない場合があります。</li>
            <li>• 20歳未満の飲酒は法律で禁止されています。</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}