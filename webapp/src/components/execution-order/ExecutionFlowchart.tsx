import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  executionSteps,
  categoryColors,
  categoryLabels,
  quizQuestions,
  type ExecutionStep,
} from "@/data/execution-order";
import { cn } from "@/lib/utils";

function useExecutionFlowchart() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const currentQuestion = quizQuestions[currentQuizIndex];

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function startQuiz() {
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
    setExpandedId(null);
  }

  function exitQuiz() {
    setQuizMode(false);
    setSelectedAnswer(null);
    setQuizDone(false);
  }

  function selectAnswer(stepId: string) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(stepId);
    if (stepId === currentQuestion.correctStepId) {
      setQuizScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentQuizIndex + 1 >= quizQuestions.length) {
      setQuizDone(true);
    } else {
      setCurrentQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  }

  return {
    expandedId,
    toggleExpand,
    quizMode,
    startQuiz,
    exitQuiz,
    currentQuestion,
    currentQuizIndex,
    selectedAnswer,
    selectAnswer,
    nextQuestion,
    quizScore,
    quizDone,
  };
}

interface StepNodeProps {
  step: ExecutionStep;
  isExpanded: boolean;
  onToggle: () => void;
  isRerunSource?: boolean;
}

function StepNode({
  step,
  isExpanded,
  onToggle,
  isRerunSource,
}: StepNodeProps) {
  const colors = categoryColors[step.category];

  return (
    <div className="relative">
      <button
        data-testid={`step-node-${step.id}`}
        onClick={onToggle}
        className={cn(
          "w-full text-left rounded-xl border-2 transition-all duration-200",
          "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          colors.bg,
          colors.border,
          isExpanded && "shadow-md ring-2 ring-offset-1",
          isExpanded && colors.border,
        )}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <span
            className={cn(
              "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
              colors.border,
              colors.text,
              "bg-white dark:bg-gray-900",
            )}
          >
            {step.order}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("font-semibold text-sm", colors.text)}>
                {step.name}
              </span>
              {isRerunSource && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-medium">
                  ↩ re-trigger
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  colors.badge,
                )}
              >
                {categoryLabels[step.category]}
              </span>
              {step.canModifyRecord ? (
                <Badge
                  variant="outline"
                  className="text-xs h-5 border-emerald-400 text-emerald-700 dark:text-emerald-400"
                >
                  peut modifier
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs h-5 text-muted-foreground"
                >
                  lecture seule
                </Badge>
              )}
            </div>
          </div>
          <span className={cn("text-xs mt-1 flex-shrink-0", colors.text)}>
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div
          className={cn(
            "mt-1 rounded-xl border-2 px-4 py-4 text-sm space-y-3",
            colors.bg,
            colors.border,
          )}
        >
          <p className="text-foreground leading-relaxed">{step.description}</p>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Piege d'examen
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              {step.examTip}
            </p>
          </div>
          {step.isRerunnable && (
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-3 py-2">
              <p className="text-xs text-violet-700 dark:text-violet-300">
                Cette etape peut etre re-declenchee si des field updates
                modifient le record.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConnectorProps {
  hasRetrigger?: boolean;
}

function Connector({ hasRetrigger }: ConnectorProps) {
  return (
    <div className="flex items-center justify-center h-6 relative">
      <div className="w-0.5 h-full bg-border" />
      {hasRetrigger && (
        <div className="absolute left-1/2 ml-6 flex items-center gap-1">
          <div className="w-8 h-0.5 bg-amber-400" />
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
            re-run ↑
          </span>
        </div>
      )}
    </div>
  );
}

interface QuizPanelProps {
  currentQuestion: (typeof quizQuestions)[number];
  currentQuizIndex: number;
  selectedAnswer: string | null;
  quizScore: number;
  quizDone: boolean;
  onSelectAnswer: (id: string) => void;
  onNext: () => void;
  onExit: () => void;
}

function QuizPanel({
  currentQuestion,
  currentQuizIndex,
  selectedAnswer,
  quizScore,
  quizDone,
  onSelectAnswer,
  onNext,
  onExit,
}: QuizPanelProps) {
  if (quizDone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz termine !</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-bold text-center">
            {quizScore}/{quizQuestions.length}
          </p>
          <p className="text-center text-muted-foreground text-sm">
            {quizScore === quizQuestions.length
              ? "Parfait ! Tu maitrises l'order of execution."
              : quizScore >= 3
                ? "Bien ! Revois les etapes ou tu as hesite."
                : "Continue a t'entrainer, c'est un sujet cle pour l'examen."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={onExit}>
              Retour au flowchart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const optionSteps = currentQuestion.options.map(
    (id) => executionSteps.find((s) => s.id === id)!,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Question {currentQuizIndex + 1}/{quizQuestions.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Score : {quizScore}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-sm leading-relaxed">
          {currentQuestion.question}
        </p>
        <div className="space-y-2">
          {optionSteps.map((step) => {
            const isCorrect = step.id === currentQuestion.correctStepId;
            const isSelected = step.id === selectedAnswer;
            let btnClass =
              "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ";

            if (selectedAnswer === null) {
              btnClass +=
                "border-border hover:bg-muted hover:border-muted-foreground";
            } else if (isCorrect) {
              btnClass +=
                "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300";
            } else if (isSelected) {
              btnClass +=
                "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300";
            } else {
              btnClass += "border-border opacity-50";
            }

            return (
              <button
                key={step.id}
                data-testid={`quiz-option-${step.id}`}
                className={btnClass}
                onClick={() => onSelectAnswer(step.id)}
                disabled={selectedAnswer !== null}
              >
                <span className="font-medium">Etape {step.order}</span> —{" "}
                {step.name}
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <div className="space-y-3">
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                selectedAnswer === currentQuestion.correctStepId
                  ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
                  : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
              )}
            >
              {selectedAnswer === currentQuestion.correctStepId
                ? "Correct !"
                : `Incorrect. La bonne reponse est l'etape ${executionSteps.find((s) => s.id === currentQuestion.correctStepId)?.order} — ${executionSteps.find((s) => s.id === currentQuestion.correctStepId)?.name}`}
            </div>
            <Button size="sm" onClick={onNext} data-testid="quiz-next-button">
              {currentQuizIndex + 1 >= quizQuestions.length
                ? "Voir le score"
                : "Question suivante"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExecutionFlowchart() {
  const {
    expandedId,
    toggleExpand,
    quizMode,
    startQuiz,
    exitQuiz,
    currentQuestion,
    currentQuizIndex,
    selectedAnswer,
    selectAnswer,
    nextQuestion,
    quizScore,
    quizDone,
  } = useExecutionFlowchart();

  const RETRIGGER_STEPS = new Set([
    "workflow-field-updates",
    "after-save-flow-field-updates",
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Order of Execution Salesforce
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {executionSteps.length} etapes — cliquez sur une etape pour les
            details
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!quizMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={startQuiz}
              data-testid="start-quiz-button"
            >
              Mode quiz
            </Button>
          )}
          {quizMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={exitQuiz}
              data-testid="exit-quiz-button"
            >
              Quitter le quiz
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            "validation",
            "trigger",
            "automation",
            "commit",
            "post-commit",
          ] as const
        ).map((cat) => {
          const colors = categoryColors[cat];
          return (
            <span
              key={cat}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium border",
                colors.badge,
                colors.border,
              )}
            >
              {categoryLabels[cat]}
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-0">
          {executionSteps.map((step, idx) => (
            <div key={step.id}>
              <StepNode
                step={step}
                isExpanded={expandedId === step.id}
                onToggle={() => toggleExpand(step.id)}
                isRerunSource={RETRIGGER_STEPS.has(step.id)}
              />
              {idx < executionSteps.length - 1 && (
                <Connector hasRetrigger={RETRIGGER_STEPS.has(step.id)} />
              )}
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 sticky top-4 space-y-4">
          {quizMode ? (
            <QuizPanel
              currentQuestion={currentQuestion}
              currentQuizIndex={currentQuizIndex}
              selectedAnswer={selectedAnswer}
              quizScore={quizScore}
              quizDone={quizDone}
              onSelectAnswer={selectAnswer}
              onNext={nextQuestion}
              onExit={exitQuiz}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Legende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <p className="font-medium text-muted-foreground uppercase tracking-wide text-xs">
                    Categories
                  </p>
                  {(
                    [
                      "validation",
                      "trigger",
                      "automation",
                      "commit",
                      "post-commit",
                    ] as const
                  ).map((cat) => {
                    const colors = categoryColors[cat];
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-3 h-3 rounded-full border-2",
                            colors.border,
                            colors.bg,
                          )}
                        />
                        <span className="text-muted-foreground">
                          {categoryLabels[cat]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-1.5 pt-1 border-t">
                  <p className="font-medium text-muted-foreground uppercase tracking-wide text-xs">
                    Badges
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs h-5 border-emerald-400 text-emerald-700 dark:text-emerald-400"
                    >
                      peut modifier
                    </Badge>
                    <span className="text-muted-foreground">
                      Peut changer le record
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs h-5 text-muted-foreground"
                    >
                      lecture seule
                    </Badge>
                    <span className="text-muted-foreground">
                      Ne peut pas modifier
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-medium">
                      ↩ re-trigger
                    </span>
                    <span className="text-muted-foreground">
                      Re-declenche des etapes
                    </span>
                  </div>
                </div>
                <div className="pt-1 border-t">
                  <p className="text-muted-foreground">
                    Cliquez sur une etape pour voir la description detaillee et
                    le piege d'examen.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Points cles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                Before-save flows s'executent{" "}
                <strong className="text-foreground">avant</strong> les before
                triggers.
              </p>
              <p>
                Workflow Field Updates re-triggent les triggers mais{" "}
                <strong className="text-foreground">pas</strong> les validation
                rules.
              </p>
              <p>
                Les emails et @future s'executent{" "}
                <strong className="text-foreground">apres le commit</strong>.
              </p>
              <p>
                Un Roll-Up Summary peut declencher l'order of execution sur le{" "}
                <strong className="text-foreground">parent</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
