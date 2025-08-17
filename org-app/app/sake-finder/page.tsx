'use client';

import { useState, useEffect } from 'react';
import { DiagnosisForm } from '@/components/diagnosis/diagnosis-form';
import { RecommendationResults } from '@/components/results/recommendation-results';
import { DiagnosisResult } from '@/lib/types/diagnosis';
import { RecommendationScore, recommendSakes } from '@/lib/recommendation/sake-recommender';

type AppState = 'welcome' | 'diagnosis' | 'results';

export default function SakeFinderPage() {
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);

  useEffect(() => {
    document.title = '日本酒診断 - 好みの日本酒探し';
  }, []);

  const handleStartDiagnosis = () => {
    setCurrentState('diagnosis');
  };

  const handleDiagnosisComplete = (result: DiagnosisResult) => {
    setDiagnosisResult(result);
    const sakeRecommendations = recommendSakes(result, 3);
    setRecommendations(sakeRecommendations);
    setCurrentState('results');
  };

  const handleRetry = () => {
    setCurrentState('welcome');
    setDiagnosisResult(null);
    setRecommendations([]);
  };


  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            好みの日本酒
            <span className="text-blue-600">探し</span>
          </h1>
          <p className="text-xl text-gray-600">
            簡単な質問に答えて、あなたにぴったりの日本酒を見つけましょう
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold text-gray-900">簡単診断</h3>
              <p className="text-sm text-gray-600">
                6つの質問に答えるだけ
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900">的確な提案</h3>
              <p className="text-sm text-gray-600">
                あなたの好みに合わせた3選
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-semibold text-gray-900">簡単購入</h3>
              <p className="text-sm text-gray-600">
                ECサイトでそのまま購入
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              onClick={handleStartDiagnosis}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
            >
              診断を始める
            </button>
            <p className="text-xs text-gray-500 mt-3">
              診断は約3分で完了します
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>🔞 20歳未満の飲酒は法律で禁止されています</p>
        </div>
      </div>
    </div>
  );

  const renderDiagnosisScreen = () => (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <DiagnosisForm onComplete={handleDiagnosisComplete} />
    </div>
  );

  const renderResultsScreen = () => (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {diagnosisResult && (
        <RecommendationResults
          diagnosisResult={diagnosisResult}
          recommendations={recommendations}
          onRetry={handleRetry}
        />
      )}
    </div>
  );

  return (
    <>
      {currentState === 'welcome' && renderWelcomeScreen()}
      {currentState === 'diagnosis' && renderDiagnosisScreen()}
      {currentState === 'results' && renderResultsScreen()}
    </>
  );
}