import { createFileRoute, Link } from "@tanstack/react-router";
import { useRoadmapStore } from "@/data/useRoadmapStore";
import { PhaseCard } from "@/components/PhaseCard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { phases, getPhaseProgress } = useRoadmapStore();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Salesforce Developer Roadmap
        </h1>
        <p className="text-muted-foreground mt-2">
          De TypeScript dev à Salesforce certified — toutes les phases, notions
          et exercices.
        </p>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => (
          <Link
            key={phase.id}
            to="/phase/$phaseId"
            params={{ phaseId: phase.id }}
          >
            <PhaseCard phase={phase} progress={getPhaseProgress(phase.id)} />
          </Link>
        ))}
      </div>
    </div>
  );
}
