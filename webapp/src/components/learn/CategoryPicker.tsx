import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  allLessons,
  lessonCategories,
  getLessonsByCategory,
} from "@/data/lessons";

interface CategoryPickerProps {
  onSelectCategory: (categoryId: string) => void;
  onSelectLesson: (lessonId: string) => void;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function CategoryPicker({
  onSelectCategory,
  onSelectLesson,
}: CategoryPickerProps) {
  const uniqueCategories = new Set(allLessons.map((l) => l.category));
  const categoriesWithCounts = [...uniqueCategories]
    .map((cat) => {
      const lessons = allLessons.filter((l) => l.category === cat);
      const info = lessonCategories.find(
        (c) => c.id === cat || cat.toLowerCase().includes(c.id.split("-")[0]),
      );
      return {
        id: cat,
        label: info?.label ?? cat,
        icon: info?.icon ?? "📄",
        description: info?.description ?? "",
        count: lessons.length,
        lessons,
      };
    })
    .sort((a, b) => {
      const order = [
        "types",
        "collections",
        "classes",
        "control",
        "dml",
        "triggers",
        "soql",
        "sosl",
        "governor",
        "async",
        "testing",
        "design",
        "data",
        "lwc",
        "javascript",
        "security",
        "integration",
        "flows",
        "deployment",
      ];
      const aIdx = order.findIndex((o) => a.id.toLowerCase().includes(o));
      const bIdx = order.findIndex((o) => b.id.toLowerCase().includes(o));
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Apprendre</h1>
        <p className="text-muted-foreground mt-2">
          {allLessons.length} lessons couvrant tous les domaines — Apex, SOQL,
          LWC, JS, Sécurité, Intégration, Flows.
        </p>
      </div>

      <div className="space-y-4">
        {categoriesWithCounts.map((cat) => (
          <Card key={cat.id}>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <CardTitle className="text-base">{cat.label}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {cat.count} lessons
                  </Badge>
                </div>
              </div>
              {cat.description && (
                <p className="text-xs text-muted-foreground">
                  {cat.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-1">
                {cat.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <span className="flex-1 truncate">{lesson.title}</span>
                    <Badge
                      className={`text-[10px] px-1.5 ${difficultyColors[lesson.difficulty]}`}
                    >
                      {lesson.difficulty}
                    </Badge>
                    {lesson.certRelevance.map((cert) => (
                      <Badge
                        key={cert}
                        variant="outline"
                        className="text-[10px] px-1"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
