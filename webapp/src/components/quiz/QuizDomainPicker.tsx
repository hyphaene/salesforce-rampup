import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  domainInfos,
  type QuizDomain,
  type QuizQuestion,
} from "@/data/questions/types";

interface QuizDomainPickerProps {
  questions: QuizQuestion[];
  domainStats: Map<string, { total: number; correct: number }>;
  onSelectDomain: (domain: QuizDomain | "all") => void;
}

export function QuizDomainPicker({
  questions,
  domainStats,
  onSelectDomain,
}: QuizDomainPickerProps) {
  const totalQuestions = questions.length;
  const totalAttempts = Array.from(domainStats.values()).reduce(
    (a, s) => a + s.total,
    0,
  );
  const totalCorrect = Array.from(domainStats.values()).reduce(
    (a, s) => a + s.correct,
    0,
  );
  const globalPercent =
    totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Quiz & QCM</h1>
        <p className="text-muted-foreground mt-2">
          189 questions couvrant tous les domaines des certifications
          Salesforce.
        </p>
        {totalAttempts > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-accent/30">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>
                Score global : {totalCorrect}/{totalAttempts} ({globalPercent}%)
              </span>
            </div>
            <Progress value={globalPercent} className="h-2" />
          </div>
        )}
      </div>

      <Card
        className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors border-2 border-dashed"
        onClick={() => onSelectDomain("all")}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎲</span>
            <div>
              <div className="font-semibold">Mix — Tous les domaines</div>
              <div className="text-sm text-muted-foreground">
                {totalQuestions} questions au total
              </div>
            </div>
          </div>
          <Badge variant="outline">Aléatoire</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {domainInfos.map((info) => {
          const count = questions.filter((q) => q.domain === info.id).length;
          if (count === 0) return null;
          const stats = domainStats.get(info.id);
          const percent =
            stats && stats.total > 0
              ? Math.round((stats.correct / stats.total) * 100)
              : null;

          return (
            <Card
              key={info.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onSelectDomain(info.id)}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.icon}</span>
                    <CardTitle className="text-base">{info.label}</CardTitle>
                  </div>
                  <Badge variant="secondary">{count}q</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {info.description}
                </p>
                {percent !== null && (
                  <div className="flex items-center gap-2">
                    <Progress value={percent} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium">{percent}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
