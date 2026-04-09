import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Lesson } from "@/data/lessons/types";

const difficultyLabels = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

interface LessonViewerProps {
  lesson: Lesson;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function LessonViewer({
  lesson,
  onBack,
  onNext,
  onPrev,
}: LessonViewerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Retour
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{difficultyLabels[lesson.difficulty]}</Badge>
          <Badge variant="secondary">{lesson.category}</Badge>
          {lesson.certRelevance.map((cert) => (
            <Badge key={cert} variant="default" className="text-xs">
              {cert}
            </Badge>
          ))}
          {lesson.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-headings:mt-6 prose-headings:mb-3">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </CardContent>
      </Card>

      {lesson.tsAnalogy && (
        <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>🔄</span> Analogie TypeScript
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown>{lesson.tsAnalogy}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {lesson.gotchas.length > 0 && (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>⚠️</span> Pièges & Gotchas
            </h3>
            <ul className="space-y-2">
              {lesson.gotchas.map((gotcha, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5 shrink-0">•</span>
                  <span>{gotcha}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      <div className="flex justify-between">
        {onPrev ? (
          <Button variant="outline" onClick={onPrev}>
            ← Précédente
          </Button>
        ) : (
          <div />
        )}
        {onNext ? (
          <Button onClick={onNext}>Suivante →</Button>
        ) : (
          <Button variant="outline" onClick={onBack}>
            Retour à la liste
          </Button>
        )}
      </div>
    </div>
  );
}
