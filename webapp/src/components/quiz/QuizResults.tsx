import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QuizQuestion } from "@/data/questions/types";

interface QuizResultsProps {
  results: {
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
  };
  onRestart: () => void;
  onBack: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function scoreColor(percent: number): string {
  if (percent >= 80) return "text-green-600";
  if (percent >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function QuizResults({ results, onRestart, onBack }: QuizResultsProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div
                className={`text-3xl font-bold ${scoreColor(results.percent)}`}
              >
                {results.percent}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {results.correct}/{results.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Bonnes réponses
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {formatDuration(results.duration)}
              </div>
              <div className="text-sm text-muted-foreground">Durée</div>
            </div>
          </div>
          <Progress value={results.percent} className="h-3" />
          {results.percent >= 68 ? (
            <p className="text-sm text-green-600 mt-2">
              Au-dessus du seuil PD1 (68%) !
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Seuil PD1 : 68% — continue de bosser !
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6">
        <Button onClick={onRestart}>Recommencer</Button>
        <Button variant="outline" onClick={onBack}>
          Choisir un autre domaine
        </Button>
      </div>

      <Separator className="mb-6" />

      <h2 className="text-lg font-semibold mb-4">Détail des réponses</h2>
      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {results.questions.map((item, i) => (
            <Card
              key={item.question.id}
              className={
                item.correct ? "border-green-500/30" : "border-red-500/30"
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {i + 1}. {item.question.question.slice(0, 120)}
                    {item.question.question.length > 120 ? "..." : ""}
                  </span>
                  <Badge
                    variant={item.correct ? "default" : "destructive"}
                    className="shrink-0"
                  >
                    {item.correct ? "✓" : "✗"}
                  </Badge>
                </div>
                {!item.correct && (
                  <div className="text-xs space-y-1">
                    <div className="text-red-600">
                      Ta réponse :{" "}
                      {Array.isArray(item.userAnswer)
                        ? item.userAnswer.join(", ")
                        : (item.userAnswer ?? "—")}
                    </div>
                    <div className="text-green-600">
                      Bonne réponse :{" "}
                      {Array.isArray(item.question.answer)
                        ? item.question.answer.join(", ")
                        : item.question.answer}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {item.question.explanation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
