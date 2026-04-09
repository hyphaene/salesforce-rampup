import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Phase } from "@/data/roadmap";

const difficultyColors = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const phaseAccents: Record<string, string> = {
  blue: "border-l-blue-500",
  purple: "border-l-purple-500",
  green: "border-l-green-500",
  orange: "border-l-orange-500",
  red: "border-l-red-500",
};

interface PhaseCardProps {
  phase: Phase;
  progress: { done: number; total: number; percent: number };
}

export function PhaseCard({ phase, progress }: PhaseCardProps) {
  return (
    <Card
      className={`border-l-4 ${phaseAccents[phase.color] ?? ""} hover:bg-accent/50 transition-colors cursor-pointer`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{phase.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {phase.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{phase.estimatedDuration}</Badge>
            {phase.certification && (
              <Badge
                className={difficultyColors[phase.certification.difficulty]}
              >
                {phase.certification.code}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Progress value={progress.percent} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {progress.done}/{progress.total}
          </span>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {phase.topics.map((topic) => (
            <Badge
              key={topic.id}
              variant={topic.status === "done" ? "default" : "outline"}
              className="text-xs"
            >
              {topic.title}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
