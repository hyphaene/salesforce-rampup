import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRoadmapStore } from "@/data/useRoadmapStore";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { phases, getPhaseProgress, globalProgress } = useRoadmapStore();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        phases={phases}
        getPhaseProgress={getPhaseProgress}
        globalProgress={globalProgress}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
