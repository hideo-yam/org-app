'use client';

import { SakeProfile } from '@/lib/data/sake-data';
import { getSakeTypeDescription } from '@/lib/recommendation/sake-recommender';
import { purchaseHandler } from '@/lib/ec/purchase-handler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SakeCardProps {
  sake: SakeProfile;
  matchReasons?: string[];
  score?: number;
  onPurchase?: (sake: SakeProfile) => void;
}

export function SakeCard({ sake, matchReasons, score, onPurchase }: SakeCardProps) {
  const handlePurchaseClick = () => {
    if (onPurchase) {
      onPurchase(sake);
    } else {
      purchaseHandler.handlePurchase(sake, 'diagnosis');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCharacteristicBar = (value: number, label: string) => (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600 w-16">{label}</span>
      <div className="flex-1 mx-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${value * 10}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-medium w-6 text-right">{value}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto sake-card-hover">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{sake.name}</CardTitle>
            <p className="text-sm text-gray-600">{sake.brewery} ({sake.prefecture})</p>
          </div>
          {score && (
            <Badge className={getScoreColor(score)}>
              マッチ度 {score}/10
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">種類:</span>
            <span className="ml-2 font-medium">{sake.type}</span>
          </div>
          <div>
            <span className="text-gray-600">価格:</span>
            <span className="ml-2 font-medium">¥{sake.price.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">アルコール度数:</span>
            <span className="ml-2 font-medium">{sake.alcoholContent}%</span>
          </div>
          <div>
            <span className="text-gray-600">精米歩合:</span>
            <span className="ml-2 font-medium">{sake.riceMilling}%</span>
          </div>
        </div>

        {/* 味の特徴グラフ */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-3 text-gray-700">味の特徴</h4>
          {getCharacteristicBar(sake.sweetness, '甘さ')}
          {getCharacteristicBar(sake.richness, 'コク')}
          {getCharacteristicBar(sake.aroma, '香り')}
          {getCharacteristicBar(sake.acidity, '酸味')}
        </div>

        {/* 日本酒の種類説明 */}
        <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
          {getSakeTypeDescription(sake.type)}
        </div>

        {/* 説明文 */}
        <p className="text-sm text-gray-700">{sake.description}</p>

        {/* マッチング理由 */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">おすすめ理由</h4>
            <div className="flex flex-wrap gap-1">
              {matchReasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* タグ */}
        {sake.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sake.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 購入ボタン */}
        <Button 
          onClick={handlePurchaseClick}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          購入サイトで詳細を見る
        </Button>
      </CardContent>
    </Card>
  );
}