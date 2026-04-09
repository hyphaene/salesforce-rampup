import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  cheatsheetData,
  CATEGORIES,
  type CheatsheetEntry,
  type Category,
} from "@/data/cheatsheet";

export const Route = createFileRoute("/cheatsheet")({
  component: CheatsheetPage,
});

function useCheatsheet() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return cheatsheetData.filter((entry) => {
      const matchCategory =
        activeCategory === "All" || entry.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.notes.toLowerCase().includes(q) ||
        entry.tsCode.toLowerCase().includes(q) ||
        entry.apexCode.toLowerCase().includes(q) ||
        (entry.gotcha?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [activeCategory, search]);

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: cheatsheetData.length };
    for (const cat of CATEGORIES) {
      counts[cat] = cheatsheetData.filter((e) => e.category === cat).length;
    }
    return counts;
  }, []);

  return {
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    filtered,
    countByCategory,
  };
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: "typescript" | "apex";
}) {
  const label = language === "typescript" ? "TypeScript" : "Apex";
  const labelColor =
    language === "typescript"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded border ${labelColor}`}
        >
          {label}
        </span>
      </div>
      <pre className="bg-muted/60 rounded-md p-3 text-xs font-mono overflow-x-auto leading-relaxed border border-border/50 whitespace-pre-wrap break-words min-h-[80px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function EntryCard({ entry }: { entry: CheatsheetEntry }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {entry.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs shrink-0">
            {entry.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CodeBlock code={entry.tsCode} language="typescript" />
          <CodeBlock code={entry.apexCode} language="apex" />
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground leading-relaxed">
          {entry.notes}
        </div>

        {entry.gotcha && (
          <div className="flex gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
            <span className="text-amber-500 font-bold text-xs mt-0.5 shrink-0">
              ⚠ Gotcha
            </span>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              {entry.gotcha}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheatsheetPage() {
  const {
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    filtered,
    countByCategory,
  } = useCheatsheet();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Cheatsheet TS ↔ Apex
        </h1>
        <p className="text-muted-foreground mt-2">
          Correspondances TypeScript / Apex — {cheatsheetData.length} entrées
          couvrant les patterns essentiels.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="search"
          placeholder="Rechercher (titre, code, notes…)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          data-testid="cheatsheet-search-input"
        />

        <ScrollArea className="w-full">
          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as Category | "All")}
          >
            <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1">
              <TabsTrigger value="All" className="text-xs">
                Tout{" "}
                <span className="ml-1 opacity-60">({countByCategory.All})</span>
              </TabsTrigger>
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}{" "}
                  <span className="ml-1 opacity-60">
                    ({countByCategory[cat]})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollArea>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Aucun résultat</p>
          <p className="text-sm mt-1">
            Essaie un autre terme ou change de catégorie.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
            {activeCategory !== "All" ? ` dans "${activeCategory}"` : ""}
            {search ? ` pour "${search}"` : ""}
          </p>
          <div className="grid gap-4">
            {filtered.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
