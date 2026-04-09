import { Link } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Phase } from "@/data/roadmap";

const phaseColors: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

interface SidebarProps {
  phases: Phase[];
  getPhaseProgress: (id: string) => {
    done: number;
    total: number;
    percent: number;
  };
  globalProgress: { done: number; total: number; percent: number };
}

export function Sidebar({
  phases,
  getPhaseProgress,
  globalProgress,
}: SidebarProps) {
  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link to="/" className="block">
          <h1 className="text-lg font-bold tracking-tight">
            Salesforce Rampup
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dev Certification Path
          </p>
        </Link>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progression globale</span>
            <span className="font-medium">{globalProgress.percent}%</span>
          </div>
          <Progress value={globalProgress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {globalProgress.done}/{globalProgress.total} items
          </p>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          <Link
            to="/learn"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium font-medium"
          >
            <span className="text-base">📖</span>
            <div className="flex-1 min-w-0">
              <div>Apprendre</div>
              <div className="text-xs text-muted-foreground">163 lessons</div>
            </div>
          </Link>

          <Link
            to="/quiz"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium font-medium"
          >
            <span className="text-base">📝</span>
            <div className="flex-1 min-w-0">
              <div>Quiz & QCM</div>
              <div className="text-xs text-muted-foreground">189 questions</div>
            </div>
          </Link>

          <div className="pt-2 pb-1 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Phases
          </div>

          {phases.map((phase) => {
            const prog = getPhaseProgress(phase.id);
            return (
              <Link
                key={phase.id}
                to="/phase/$phaseId"
                params={{ phaseId: phase.id }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent [&.active]:bg-accent [&.active]:font-medium"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${phaseColors[phase.color] ?? "bg-gray-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{phase.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {prog.done}/{prog.total}
                  </div>
                </div>
                {prog.percent === 100 && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    Done
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">
          Données sauvegardées en localStorage
        </p>
      </div>
    </aside>
  );
}
