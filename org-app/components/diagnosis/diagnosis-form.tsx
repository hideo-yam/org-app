'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DiagnosisAnswer, 
  DiagnosisResult,
  diagnosisQuestions,
  cuisineSpecificOptions,
  DiagnosisQuestion
} from '@/lib/types/diagnosis';

interface DiagnosisFormProps {
  onComplete: (result: DiagnosisResult & { cuisineType?: string; specificDish?: string }) => void;
}

export function DiagnosisForm({ onComplete }: DiagnosisFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number>(5);
  const [dynamicQuestions, setDynamicQuestions] = useState<DiagnosisQuestion[]>(() => {
    console.log('Initializing diagnosis questions:', diagnosisQuestions);
    console.log('Questions array length:', diagnosisQuestions.length);
    console.log('Question IDs:', diagnosisQuestions.map(q => q.id));
    return [...diagnosisQuestions];
  });

  // インデックス変更を監視
  useEffect(() => {
    console.log('📍 Question index changed to:', currentQuestionIndex);
  }, [currentQuestionIndex]);

  // 回答変更を監視
  useEffect(() => {
    console.log('📝 Answers updated:', answers);
  }, [answers]);

  // 現在の質問を取得（シンプル版）
  const getCurrentQuestion = (): DiagnosisQuestion => {
    const question = dynamicQuestions[currentQuestionIndex];
    
    console.log('🔍 getCurrentQuestion called:', {
      currentQuestionIndex,
      questionId: question?.id,
      hasOptions: question?.options?.length || 0,
      question: question
    });
    
    // 質問が存在しない場合の安全チェック
    if (!question) {
      console.error('Question not found at index:', currentQuestionIndex);
      return dynamicQuestions[0]; // デフォルトで最初の質問を返す
    }
    
    return question;
  };

  const currentQuestion = getCurrentQuestion();
  // 最後の質問かどうかを判定（シンプルに）
  const isLastQuestion = currentQuestionIndex === 3; // q4（index=3）が最後の質問
  
  console.log('📊 Current state:', {
    index: currentQuestionIndex,
    questionId: currentQuestion.id,
    isLast: isLastQuestion,
    answersCount: answers.length
  });

  const getCuisineDisplayName = (cuisineType: string): string => {
    const names = {
      'japanese': '和食',
      'chinese': '中華料理',
      'western': '洋食'
    };
    return names[cuisineType as keyof typeof names] || '';
  };

  const handleOptionSelect = (optionId: string, isMultiple: boolean = false) => {
    console.log('🎯 OPTION SELECTED!', { 
      optionId, 
      isMultiple, 
      currentQuestionId: currentQuestion.id,
      currentQuestionIndex 
    });
    
    if (isMultiple) {
      setSelectedOptions(prev => {
        const newOptions = prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId];
        console.log('✅ Multiple selection updated:', newOptions);
        return newOptions;
      });
    } else {
      setSelectedOptions([optionId]);
      console.log('✅ Single selection set:', [optionId]);
    }
  };

  const handleNext = () => {
    console.log('🚀 handleNext called!', {
      currentQuestionId: currentQuestion.id,
      currentQuestionIndex,
      selectedOptions,
      canProceedValue: canProceed()
    });
    
    try {
      const answer: DiagnosisAnswer = {
        questionId: currentQuestion.id,
        selectedOptions,
        ...(currentQuestion.type === 'scale' && { scaleValue })
      };

      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      
      console.log('handleNext - current question ID:', currentQuestion.id, 'index:', currentQuestionIndex, 'answers:', newAnswers);
      console.log('isLastQuestion check:', isLastQuestion, 'questionsLength:', dynamicQuestions.length);

      if (isLastQuestion) {
        console.log('This is the last question, completing diagnosis');
        const result = calculateResult(newAnswers);
        onComplete(result);
        return;
      } else {
        console.log('Not the last question, proceeding to next');
      }

      // 第1問の回答後、第2問の動的質問を準備
      if (currentQuestionIndex === 0) {
        const firstAnswerOption = selectedOptions[0];
        if (firstAnswerOption && firstAnswerOption !== 'various') {
          console.log('🔧 Preparing dynamic Q2 for cuisine:', firstAnswerOption);
          
          const cuisineOptions = cuisineSpecificOptions[firstAnswerOption as keyof typeof cuisineSpecificOptions];
          if (cuisineOptions) {
            const options = cuisineOptions.map(option => ({
              id: option.id,
              text: option.text,
              value: option.value,
              weight: option.weight
            }));
            
            const dynamicQ2 = {
              id: 'q2',
              question: `どのような${getCuisineDisplayName(firstAnswerOption)}がお好みですか？`,
              type: 'single' as const,
              options: options
            };
            
            // dynamicQuestionsを更新
            const updatedQuestions = [...dynamicQuestions];
            updatedQuestions[1] = dynamicQ2;
            setDynamicQuestions(updatedQuestions);
            
            console.log('✅ Dynamic Q2 prepared:', dynamicQ2);
          }
        }
      }

      // シンプルなナビゲーションロジック
      let nextIndex: number;
      
      // シンプルなインデックスベースのナビゲーション
      if (currentQuestionIndex === 0) {
        // 第1問から第2問へ（または第3問へ直接）
        if (selectedOptions[0] === 'various') {
          nextIndex = 2; // q3（甘口の好みの質問）に直接移動
          console.log('🚀 Q1->Q3: Skipping Q2 due to various selection');
        } else {
          nextIndex = 1; // q2（動的質問）に移動
          console.log('🚀 Q1->Q2: Going to dynamic question');
        }
      } else if (currentQuestionIndex === 1) {
        // 第2問から第3問へ（確実に）
        nextIndex = 2;
        console.log('🚀 Q2->Q3: Going from dynamic question to Q3');
      } else if (currentQuestionIndex === 2) {
        // 第3問から第4問へ
        nextIndex = 3;
        console.log('🚀 Q3->Q4: Going to final question');
      } else {
        // 通常の順次移動
        nextIndex = currentQuestionIndex + 1;
        console.log('🚀 Normal progression to index:', nextIndex);
      }
      
      console.log('Moving to question index:', nextIndex);
      console.log('🔄 About to change index from', currentQuestionIndex, 'to', nextIndex);
      
      // 状態更新を段階的に実行
      setCurrentQuestionIndex(nextIndex);
      console.log('🔄 Question index set to:', nextIndex);
      
      setSelectedOptions([]);
      console.log('🔄 Selected options cleared');
      
      setScaleValue(5);
      console.log('🔄 Scale value reset to 5');
      
      console.log('✅ All state updates initiated');
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in handleNext:', error);
      console.error('Error details:', {
        currentIndex: currentQuestionIndex,
        currentQuestionId: currentQuestion.id,
        selectedOptions,
        answersLength: answers.length,
        isLastQuestion,
        nextIndex: 'undefined'
      });
      // エラーが発生した場合も強制的に次に進む
      setCurrentQuestionIndex(Math.min(currentQuestionIndex + 1, 3));
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      let prevIndex = currentQuestionIndex - 1;
      
      // q3からの戻りの場合、前の回答をチェック
      if (currentQuestionIndex === 2) {
        // variousが選択されてq2がスキップされた場合はq1に戻る
        if (answers.length === 1 && answers[0]?.selectedOptions?.[0] === 'various') {
          prevIndex = 0;
        } else if (answers.length >= 2) {
          prevIndex = 1; // q2に戻る
        }
      }
      
      console.log('Going back to index:', prevIndex, 'from:', currentQuestionIndex);
      setCurrentQuestionIndex(prevIndex);
      
      const prevAnswer = answers[answers.length - 1];
      if (prevAnswer) {
        setSelectedOptions(prevAnswer.selectedOptions);
        if (prevAnswer.scaleValue !== undefined) {
          setScaleValue(prevAnswer.scaleValue);
        }
      }
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const calculateResult = (allAnswers: DiagnosisAnswer[]): DiagnosisResult & { cuisineType?: string; specificDish?: string } => {
    let sweetness = 5;
    let richness = 5;
    let acidity = 5;
    let aroma = 5;
    let cuisineType: string | undefined;
    let specificDish: string | undefined;

    // 最初に料理タイプを取得
    const firstAnswer = allAnswers.find(answer => answer.questionId === 'q1');
    if (firstAnswer) {
      const firstQuestion = diagnosisQuestions.find(q => q.id === 'q1');
      const option = firstQuestion?.options?.find(opt => opt.id === firstAnswer.selectedOptions[0]);
      cuisineType = option?.value as string;
    }

    allAnswers.forEach(answer => {
      const question = diagnosisQuestions.find(q => q.id === answer.questionId);
      if (!question) return;

      if (question.type === 'scale') {
        const value = answer.scaleValue || 5;
        if (question.id === 'q3') {
          sweetness = value;
        } else if (question.id === 'q4') {
          aroma = value;
        }
      } else {
        answer.selectedOptions.forEach(optionId => {
          let option = question.options?.find(opt => opt.id === optionId);
          
          // q2の場合は動的生成された料理種類オプションを検索
          if (question.id === 'q2' && !option && cuisineType && cuisineType !== 'various') {
            const cuisineOptions = cuisineSpecificOptions[cuisineType as keyof typeof cuisineSpecificOptions];
            option = cuisineOptions?.find(opt => opt.id === optionId);
            if (option) {
              specificDish = option.value as string;
            }
          }
          
          if (option?.weight) {
            sweetness += option.weight.sweetness || 0;
            richness += option.weight.richness || 0;
            acidity += option.weight.acidity || 0;
            aroma += option.weight.aroma || 0;
          }
        });
      }
    });

    return {
      sweetness: Math.max(1, Math.min(10, sweetness)),
      richness: Math.max(1, Math.min(10, richness)),
      acidity: Math.max(1, Math.min(10, acidity)),
      aroma: Math.max(1, Math.min(10, aroma)),
      cuisineType,
      specificDish
    };
  };

  const canProceed = () => {
    const result = (() => {
      if (currentQuestion.type === 'scale') return true;
      if (currentQuestion.type === 'multiple') return selectedOptions.length > 0;
      return selectedOptions.length === 1;
    })();
    
    console.log('canProceed check:', {
      result,
      questionType: currentQuestion.type,
      questionId: currentQuestion.id,
      selectedOptions,
      selectedOptionsLength: selectedOptions.length
    });
    return result;
  };

  console.log('🎨 RENDER Q' + (currentQuestionIndex + 1) + ':', currentQuestion.id, 'isLast:', isLastQuestion);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          好み診断 ({currentQuestionIndex + 1}/{diagnosisQuestions.length})
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / diagnosisQuestions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium text-center">{currentQuestion.question}</h3>
        
        {currentQuestion.type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentQuestion.scaleLabels?.[0]}</span>
              <span>{currentQuestion.scaleLabels?.[1]}</span>
            </div>
            <input
              type="range"
              min={currentQuestion.scaleMin}
              max={currentQuestion.scaleMax}
              value={scaleValue}
              onChange={(e) => setScaleValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center">
              <Badge variant="secondary">{scaleValue}</Badge>
            </div>
          </div>
        )}

        {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                {currentQuestion.type === 'multiple' ? (
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleOptionSelect(option.id, true)}
                  />
                ) : (
                  <input
                    type="radio"
                    id={option.id}
                    name={currentQuestion.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleOptionSelect(option.id, false)}
                    className="w-4 h-4 text-blue-600"
                  />
                )}
                <label 
                  htmlFor={option.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            戻る
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {isLastQuestion ? '診断結果を見る' : '次へ'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}