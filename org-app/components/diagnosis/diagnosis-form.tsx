'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DiagnosisAnswer, 
  DiagnosisResult,
  diagnosisQuestions 
} from '@/lib/types/diagnosis';

interface DiagnosisFormProps {
  onComplete: (result: DiagnosisResult) => void;
}

export function DiagnosisForm({ onComplete }: DiagnosisFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number>(5);

  const currentQuestion = diagnosisQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === diagnosisQuestions.length - 1;

  const handleOptionSelect = (optionId: string, isMultiple: boolean = false) => {
    if (isMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleNext = () => {
    const answer: DiagnosisAnswer = {
      questionId: currentQuestion.id,
      selectedOptions,
      ...(currentQuestion.type === 'scale' && { scaleValue })
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (isLastQuestion) {
      const result = calculateResult(newAnswers);
      onComplete(result);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptions([]);
      setScaleValue(5);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevAnswer = answers[currentQuestionIndex - 1];
      setSelectedOptions(prevAnswer.selectedOptions);
      if (prevAnswer.scaleValue !== undefined) {
        setScaleValue(prevAnswer.scaleValue);
      }
      setAnswers(prev => prev.slice(0, -1));
    }
  };

  const calculateResult = (allAnswers: DiagnosisAnswer[]): DiagnosisResult => {
    let sweetness = 5;
    let richness = 5;
    let acidity = 5;
    let aroma = 5;

    allAnswers.forEach(answer => {
      const question = diagnosisQuestions.find(q => q.id === answer.questionId);
      if (!question) return;

      if (question.type === 'scale') {
        const value = answer.scaleValue || 5;
        if (question.id === 'q2') {
          sweetness = value;
        } else if (question.id === 'q3') {
          aroma = value;
        }
      } else {
        answer.selectedOptions.forEach(optionId => {
          const option = question.options?.find(opt => opt.id === optionId);
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
      aroma: Math.max(1, Math.min(10, aroma))
    };
  };

  const canProceed = () => {
    if (currentQuestion.type === 'scale') return true;
    if (currentQuestion.type === 'multiple') return selectedOptions.length > 0;
    return selectedOptions.length === 1;
  };

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