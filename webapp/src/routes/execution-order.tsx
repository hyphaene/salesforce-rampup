import { createFileRoute } from "@tanstack/react-router";
import { ExecutionFlowchart } from "@/components/execution-order/ExecutionFlowchart";

export const Route = createFileRoute("/execution-order")({
  component: ExecutionOrderPage,
});

function ExecutionOrderPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Order of Execution
        </h1>
        <p className="text-muted-foreground mt-2">
          Les 20 etapes d'execution Salesforce — de la charge du record au
          post-commit. Sujet incontournable pour l'examen Platform Developer I.
        </p>
      </div>
      <ExecutionFlowchart />
    </div>
  );
}
