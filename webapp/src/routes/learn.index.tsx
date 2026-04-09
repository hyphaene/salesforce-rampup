import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CategoryPicker } from "@/components/learn/CategoryPicker";

export const Route = createFileRoute("/learn/")({
  component: LearnIndex,
});

function LearnIndex() {
  const navigate = useNavigate();

  return (
    <CategoryPicker
      onSelectCategory={() => {}}
      onSelectLesson={(lessonId) =>
        navigate({ to: "/learn/$lessonId", params: { lessonId } })
      }
    />
  );
}
