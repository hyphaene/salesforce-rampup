import { createFileRoute } from "@tanstack/react-router";
import { useRoadmapStore } from "@/data/useRoadmapStore";
import { TopicAccordion } from "@/components/TopicAccordion";
import { CertificationBadge } from "@/components/CertificationBadge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/phase/$phaseId")({
  component: PhasePage,
});

function PhasePage() {
  const { phaseId } = Route.useParams();
  const { phases, toggleItem, getPhaseProgress } = useRoadmapStore();

  const phase = phases.find((p) => p.id === phaseId);
  if (!phase)
    return (
      <div className="text-center py-12 text-muted-foreground">
        Phase introuvable
      </div>
    );

  const progress = getPhaseProgress(phase.id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{phase.title}</h1>
          <Badge variant="outline">{phase.estimatedDuration}</Badge>
        </div>
        <p className="text-muted-foreground">{phase.subtitle}</p>
        <div className="flex items-center gap-3 mt-4">
          <Progress value={progress.percent} className="h-3 flex-1" />
          <span className="text-sm font-medium">
            {progress.done}/{progress.total} ({progress.percent}%)
          </span>
        </div>
      </div>

      {phase.certification && (
        <>
          <CertificationBadge certification={phase.certification} />
          <Separator className="my-6" />
        </>
      )}

      <h2 className="text-lg font-semibold mb-4">Topics</h2>
      <TopicAccordion topics={phase.topics} onToggleItem={toggleItem} />
    </div>
  );
}
