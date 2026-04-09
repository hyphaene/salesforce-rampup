import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { allQuestions } from "@/data/questions";
import { useQuizStore } from "@/data/useQuizStore";
import type { QuizDomain } from "@/data/questions/types";

export const Route = createFileRoute("/quiz/$domain")({
  component: QuizDomainPage,
});

function QuizDomainPage() {
  const { domain } = Route.useParams();
  const navigate = useNavigate();
  const store = useQuizStore(allQuestions);

  useEffect(() => {
    if (!store.activeQuiz) {
      store.startQuiz(domain as QuizDomain | "all", "training", 20);
    }
  }, [domain]);

  function handleFinish() {
    // Stay on page to show results
  }

  return (
    <QuizEngine
      currentQuestion={store.currentQuestion}
      questionIndex={store.activeQuiz?.currentIndex ?? 0}
      totalQuestions={store.activeQuiz?.questions.length ?? 0}
      selectedAnswer={store.selectedAnswer}
      showExplanation={store.showExplanation}
      isLast={store.isLastQuestion}
      mode={store.activeQuiz?.mode ?? "training"}
      quizResults={store.quizResults}
      onSelect={store.setSelectedAnswer}
      onSubmit={store.submitAnswer}
      onNext={store.nextQuestion}
      onFinish={handleFinish}
      onRestart={() =>
        store.startQuiz(domain as QuizDomain | "all", "training", 20)
      }
      onBack={() => {
        store.endQuiz();
        navigate({ to: "/quiz" });
      }}
    />
  );
}
