import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { governorLimits, limitScenarios } from "@/data/governor-limits";
import type { LimitScenario } from "@/data/governor-limits";
import ReactMarkdown from "react-markdown";

const RECORD_PRESETS = [1, 10, 50, 100, 200, 500];

function useGovernorSimulator() {
  const [selectedScenario, setSelectedScenario] =
    useState<LimitScenario | null>(null);
  const [recordCount, setRecordCount] = useState(100);

  function selectScenario(scenario: LimitScenario) {
    setSelectedScenario(scenario);
    setRecordCount(scenario.triggerRecords);
  }

  function computeConsumed(scenario: LimitScenario) {
    return scenario.limitsConsumed.map((c) => {
      const limit = governorLimits.find((l) => l.id === c.limitId);
      const total = c.perRecord === 0 ? 1 : c.perRecord * recordCount;
      const syncLimit = limit?.syncLimit ?? 1;
      const percent = Math.min((total / syncLimit) * 100, 100);
      const exceeded = total > syncLimit;
      const formula = c.formula
        .replace("{n}", String(recordCount))
        .replace("{n}×3", String(recordCount * 3))
        .replace("{n}×20", String(recordCount * 20))
        .replace("{n}×5", String(recordCount * 5));
      return { limitId: c.limitId, total, percent, exceeded, formula, limit };
    });
  }

  function computeFixed(scenario: LimitScenario) {
    return scenario.limitsFixed.map((f) => {
      const limit = governorLimits.find((l) => l.id === f.limitId);
      const total = f.formula.includes("{n}×3")
        ? f.total * recordCount
        : f.formula.includes("{n}")
          ? recordCount
          : f.total;
      const syncLimit = limit?.syncLimit ?? 1;
      const percent = Math.min((total / syncLimit) * 100, 100);
      const exceeded = total > syncLimit;
      const formula = f.formula
        .replace("{n}", String(recordCount))
        .replace("{n}×3", String(recordCount * 3));
      return { limitId: f.limitId, total, percent, exceeded, formula, limit };
    });
  }

  return {
    selectedScenario,
    recordCount,
    setRecordCount,
    selectScenario,
    computeConsumed,
    computeFixed,
  };
}

const difficultyConfig = {
  beginner: {
    label: "Débutant",
    className: "bg-green-500/15 text-green-700 border-green-500/30",
  },
  intermediate: {
    label: "Intermédiaire",
    className: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  },
  advanced: {
    label: "Avancé",
    className: "bg-red-500/15 text-red-700 border-red-500/30",
  },
} as const;

function LimitBar({
  name,
  consumed,
  syncLimit,
  unit,
  percent,
  exceeded,
  formula,
}: {
  name: string;
  consumed: number;
  syncLimit: number;
  unit: string;
  percent: number;
  exceeded: boolean;
  formula: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate flex-1 mr-2">{name}</span>
        <span
          className={`font-mono text-xs shrink-0 ${exceeded ? "text-red-600 font-bold" : "text-muted-foreground"}`}
        >
          {consumed.toLocaleString()} / {syncLimit.toLocaleString()} {unit}
        </span>
      </div>
      <Progress
        value={percent}
        className={`h-3 transition-all duration-500 ${exceeded ? "[&>div]:bg-red-500" : percent > 75 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{formula}</p>
        {exceeded && (
          <Badge variant="destructive" className="text-xs animate-pulse">
            BOOM — LimitException
          </Badge>
        )}
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  isSelected,
  onClick,
}: {
  scenario: LimitScenario;
  isSelected: boolean;
  onClick: () => void;
}) {
  const diff = difficultyConfig[scenario.difficulty];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50 ${isSelected ? "border-primary bg-accent" : "border-border"}`}
      data-testid={`scenario-card-${scenario.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">{scenario.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {scenario.description}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs shrink-0 ${diff.className}`}
        >
          {diff.label}
        </Badge>
      </div>
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>
      <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto max-h-96 leading-relaxed font-mono whitespace-pre-wrap break-words">
        {code}
      </pre>
    </div>
  );
}

function GovernorLimitsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Référence — Governor Limits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 pr-4 font-medium text-muted-foreground">
                  Limite
                </th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                  Sync
                </th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                  Async
                </th>
                <th className="pb-2 font-medium text-muted-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {governorLimits.map((limit) => (
                <tr
                  key={limit.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2.5 pr-4 font-medium">{limit.name}</td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums">
                    <span className="text-blue-600 font-semibold">
                      {limit.syncLimit.toLocaleString()}
                    </span>{" "}
                    <span className="text-muted-foreground">{limit.unit}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-xs tabular-nums">
                    {limit.asyncLimit === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <>
                        <span className="text-purple-600 font-semibold">
                          {limit.asyncLimit.toLocaleString()}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {limit.unit}
                        </span>
                      </>
                    )}
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground max-w-sm">
                    {limit.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernorSimulator() {
  const {
    selectedScenario,
    recordCount,
    setRecordCount,
    selectScenario,
    computeConsumed,
    computeFixed,
  } = useGovernorSimulator();

  const consumed = selectedScenario ? computeConsumed(selectedScenario) : [];
  const fixed = selectedScenario ? computeFixed(selectedScenario) : [];
  const hasExplosion = consumed.some((c) => c.exceeded);

  return (
    <div className="space-y-6">
      <GovernorLimitsTable />

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario list */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-base font-semibold">Scénarios</h2>
          <div className="space-y-2">
            {limitScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario?.id === scenario.id}
                onClick={() => selectScenario(scenario)}
              />
            ))}
          </div>
        </div>

        {/* Scenario detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedScenario ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedScenario.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedScenario.description}
                  </p>
                </div>
                {hasExplosion && (
                  <Badge
                    variant="destructive"
                    className="text-sm shrink-0 animate-pulse"
                  >
                    LIMITE DÉPASSÉE
                  </Badge>
                )}
              </div>

              {/* Record count slider */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Nombre de records déclencheurs
                      </label>
                      <span className="font-mono font-bold text-lg">
                        {recordCount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={500}
                      value={recordCount}
                      onChange={(e) => setRecordCount(Number(e.target.value))}
                      className="w-full accent-primary"
                      data-testid="record-count-slider"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {RECORD_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setRecordCount(preset)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            recordCount === preset
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-accent"
                          }`}
                          data-testid={`preset-${preset}`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs: simulation + code + explanation */}
              <Tabs defaultValue="simulation">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="simulation">Simulation</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="explanation">Explication</TabsTrigger>
                </TabsList>

                <TabsContent value="simulation" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bad code limits */}
                    <Card className={hasExplosion ? "border-red-500/50" : ""}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="text-red-500">Bad code</span>
                          {hasExplosion && <span className="text-lg">💥</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {consumed.map((c) => (
                          <LimitBar
                            key={c.limitId}
                            name={c.limit?.name ?? c.limitId}
                            consumed={c.total}
                            syncLimit={c.limit?.syncLimit ?? 1}
                            unit={c.limit?.unit ?? ""}
                            percent={c.percent}
                            exceeded={c.exceeded}
                            formula={c.formula}
                          />
                        ))}
                      </CardContent>
                    </Card>

                    {/* Good code limits */}
                    <Card className="border-green-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="text-green-600">Good code</span>
                          <span className="text-lg">✓</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {fixed.map((f) => (
                          <LimitBar
                            key={f.limitId}
                            name={f.limit?.name ?? f.limitId}
                            consumed={f.total}
                            syncLimit={f.limit?.syncLimit ?? 1}
                            unit={f.limit?.unit ?? ""}
                            percent={f.percent}
                            exceeded={f.exceeded}
                            formula={f.formula}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="mt-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <CodeBlock
                      code={selectedScenario.badCode}
                      label="Mauvais code — explose les limites"
                    />
                    <CodeBlock
                      code={selectedScenario.goodCode}
                      label="Bon code — bulkifié"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="explanation" className="mt-4">
                  <Card>
                    <CardContent className="pt-4 prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {selectedScenario.explanation}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm border border-dashed rounded-lg">
              Sélectionne un scénario pour commencer la simulation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
