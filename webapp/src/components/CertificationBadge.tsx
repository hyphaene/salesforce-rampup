import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Certification } from "@/data/roadmap";

const difficultyLabels = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

interface CertificationBadgeProps {
  certification: Certification;
}

export function CertificationBadge({ certification }: CertificationBadgeProps) {
  return (
    <Card className="bg-accent/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">
            Certification : {certification.name}
          </h3>
          <Badge variant="outline">{certification.code}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Questions</div>
            <div className="font-medium">{certification.questions} MCQ</div>
          </div>
          <div>
            <div className="text-muted-foreground">Durée</div>
            <div className="font-medium">{certification.duration}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Score requis</div>
            <div className="font-medium">{certification.passingScore}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Difficulté</div>
            <div className="font-medium">
              {difficultyLabels[certification.difficulty]}
            </div>
          </div>
        </div>
        {certification.requiredSuperbadges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-sm text-muted-foreground mb-1">
              Superbadges requis :
            </div>
            <div className="flex flex-wrap gap-1">
              {certification.requiredSuperbadges.map((sb) => (
                <Badge key={sb} variant="secondary" className="text-xs">
                  {sb}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {certification.prerequisites.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-muted-foreground mb-1">
              Prérequis :
            </div>
            <div className="flex flex-wrap gap-1">
              {certification.prerequisites.map((p) => (
                <Badge key={p} variant="destructive" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
