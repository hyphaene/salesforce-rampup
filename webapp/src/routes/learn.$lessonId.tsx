import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LessonViewer } from "@/components/learn/LessonViewer";
import { allLessons } from "@/data/lessons";

export const Route = createFileRoute("/learn/$lessonId")({
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();

  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[lessonIndex];

  if (!lesson) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Lesson introuvable : {lessonId}
      </div>
    );
  }

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  return (
    <LessonViewer
      lesson={lesson}
      onBack={() => navigate({ to: "/learn" })}
      onPrev={
        prevLesson
          ? () =>
              navigate({
                to: "/learn/$lessonId",
                params: { lessonId: prevLesson.id },
              })
          : undefined
      }
      onNext={
        nextLesson
          ? () =>
              navigate({
                to: "/learn/$lessonId",
                params: { lessonId: nextLesson.id },
              })
          : undefined
      }
    />
  );
}
