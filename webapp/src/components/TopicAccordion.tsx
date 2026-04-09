import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Topic } from "@/data/roadmap";

const typeIcons: Record<string, string> = {
  notion: "📖",
  exercise: "💻",
  superbadge: "🏆",
  exam: "📝",
};

const typeColors: Record<string, string> = {
  notion: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  exercise:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  superbadge:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface TopicAccordionProps {
  topics: Topic[];
  onToggleItem: (itemId: string) => void;
}

export function TopicAccordion({ topics, onToggleItem }: TopicAccordionProps) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {topics.map((topic) => {
        const doneCount = topic.items.filter((i) => i.done).length;
        const totalCount = topic.items.length;
        const percent =
          totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

        return (
          <AccordionItem
            key={topic.id}
            value={topic.id}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="flex-1">
                  <div className="font-medium">{topic.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {topic.description}
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{totalCount}
                  </span>
                  <Progress value={percent} className="h-1.5 w-16" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pb-2">
                {topic.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => onToggleItem(item.id)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span
                      className={`flex-1 text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 decoration-muted-foreground/50 hover:decoration-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.label}
                        </a>
                      ) : (
                        item.label
                      )}
                    </span>
                    <Badge
                      className={`text-[10px] px-1.5 ${typeColors[item.type]}`}
                    >
                      {typeIcons[item.type]} {item.type}
                    </Badge>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
