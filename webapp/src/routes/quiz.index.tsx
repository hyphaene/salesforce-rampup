import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { QuizDomainPicker } from "@/components/quiz/QuizDomainPicker";
import { allQuestions } from "@/data/questions";
import { useQuizStore } from "@/data/useQuizStore";
import type { QuizDomain } from "@/data/questions/types";

export const Route = createFileRoute("/quiz/")({
  component: QuizIndex,
});

function QuizIndex() {
  const navigate = useNavigate();
  const { domainStats } = useQuizStore(allQuestions);

  function handleSelectDomain(domain: QuizDomain | "all") {
    navigate({ to: "/quiz/$domain", params: { domain } });
  }

  return (
    <QuizDomainPicker
      questions={allQuestions}
      domainStats={domainStats}
      onSelectDomain={handleSelectDomain}
    />
  );
}
