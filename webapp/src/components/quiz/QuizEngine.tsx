import { QuizCard } from "./QuizCard";
import { QuizResults } from "./QuizResults";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { QuizQuestion, QuizDomain } from "@/data/questions/types";
import type { QuizMode } from "@/data/useQuizStore";

interface QuizEngineProps {
  currentQuestion: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | string[] | null;
  showExplanation: boolean;
  isLast: boolean;
  mode: QuizMode;
  quizResults: {
    total: number;
    answered: number;
    correct: number;
    percent: number;
    duration: number;
    questions: {
      question: QuizQuestion;
      userAnswer: string | string[] | null;
      correct: boolean;
    }[];
  } | null;
  onSelect: (answer: string | string[]) => void;
  onSubmit: (answer: string | string[]) => void;
  onNext: () => void;
  onFinish: () => void;
  onRestart: () => void;
  onBack: () => void;
}

export function QuizEngine({
  currentQuestion,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  isLast,
  mode,
  quizResults,
  onSelect,
  onSubmit,
  onNext,
  onFinish,
  onRestart,
  onBack,
}: QuizEngineProps) {
  const showResults =
    quizResults !== null &&
    quizResults.answered === quizResults.total &&
    showExplanation &&
    isLast;

  if (showResults && quizResults) {
    return (
      <QuizResults
        results={quizResults}
        onRestart={onRestart}
        onBack={onBack}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune question disponible
      </div>
    );
  }

  const progressPercent = Math.round(
    ((questionIndex + 1) / totalQuestions) * 100,
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Retour
        </Button>
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {questionIndex + 1}/{totalQuestions}
        </span>
      </div>

      <QuizCard
        question={currentQuestion}
        questionIndex={questionIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={selectedAnswer}
        showExplanation={showExplanation}
        onSelect={onSelect}
        onSubmit={() => {
          if (selectedAnswer !== null) onSubmit(selectedAnswer);
        }}
        onNext={onNext}
        isLast={isLast}
        onFinish={onFinish}
      />
    </div>
  );
}
