import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/data/questions/types";

interface QuizCardProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | string[] | null;
  showExplanation: boolean;
  onSelect: (answer: string | string[]) => void;
  onSubmit: () => void;
  onNext: () => void;
  isLast: boolean;
  onFinish: () => void;
}

export function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  onSelect,
  onSubmit,
  onNext,
  isLast,
  onFinish,
}: QuizCardProps) {
  const isAnswered = selectedAnswer !== null && showExplanation;
  const isMultiSelect = question.multiSelect === true;

  function handleOptionClick(key: string) {
    if (isAnswered) return;
    if (isMultiSelect) {
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      onSelect(next);
    } else {
      onSelect(key);
    }
  }

  function isCorrectOption(key: string): boolean {
    return Array.isArray(question.answer)
      ? question.answer.includes(key)
      : question.answer === key;
  }

  function isSelectedOption(key: string): boolean {
    if (!selectedAnswer) return false;
    return Array.isArray(selectedAnswer)
      ? selectedAnswer.includes(key)
      : selectedAnswer === key;
  }

  function optionStyle(key: string): string {
    const base =
      "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all text-left w-full";
    if (!isAnswered) {
      return isSelectedOption(key)
        ? `${base} border-primary bg-primary/10`
        : `${base} border-border hover:border-primary/50 hover:bg-accent/50`;
    }
    if (isCorrectOption(key)) {
      return `${base} border-green-500 bg-green-500/10`;
    }
    if (isSelectedOption(key) && !isCorrectOption(key)) {
      return `${base} border-red-500 bg-red-500/10`;
    }
    return `${base} border-border opacity-60`;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Question {questionIndex + 1}/{totalQuestions}
        </span>
        <div className="flex gap-2">
          <Badge variant="outline">{question.difficulty}</Badge>
          <Badge variant="secondary">{question.domain}</Badge>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
            {question.question}
          </p>
          {isMultiSelect && (
            <p className="text-xs text-muted-foreground mt-2">
              Plusieurs réponses possibles — sélectionnez toutes les bonnes
              réponses
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2 mb-6">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => handleOptionClick(opt.key)}
            className={optionStyle(opt.key)}
            disabled={isAnswered}
          >
            <span className="font-mono font-bold text-sm mt-0.5 shrink-0 w-6">
              {opt.key})
            </span>
            <span className="text-sm">{opt.text}</span>
            {isAnswered && isCorrectOption(opt.key) && (
              <span className="ml-auto shrink-0 text-green-600">✓</span>
            )}
            {isAnswered &&
              isSelectedOption(opt.key) &&
              !isCorrectOption(opt.key) && (
                <span className="ml-auto shrink-0 text-red-600">✗</span>
              )}
          </button>
        ))}
      </div>

      {isAnswered && (
        <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-1">Explication</div>
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        {!isAnswered && selectedAnswer !== null && (
          <Button onClick={onSubmit}>Valider</Button>
        )}
        {isAnswered && !isLast && <Button onClick={onNext}>Suivante →</Button>}
        {isAnswered && isLast && (
          <Button onClick={onFinish}>Voir les résultats</Button>
        )}
      </div>
    </div>
  );
}
