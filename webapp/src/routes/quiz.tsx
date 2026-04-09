import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz")({
  component: QuizLayout,
});

function QuizLayout() {
  return <Outlet />;
}
