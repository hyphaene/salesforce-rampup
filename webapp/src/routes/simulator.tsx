import { createFileRoute } from "@tanstack/react-router";
import { GovernorSimulator } from "@/components/simulator/GovernorSimulator";

export const Route = createFileRoute("/simulator")({
  component: SimulatorPage,
});

function SimulatorPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Governor Limits Simulator
        </h1>
        <p className="text-muted-foreground mt-2">
          Simule les governor limits Salesforce — visualise en temps réel ce qui
          explose et pourquoi, avec la correction.
        </p>
      </div>
      <GovernorSimulator />
    </div>
  );
}
