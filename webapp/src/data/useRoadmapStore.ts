import { useState, useCallback, useMemo } from "react";
import { roadmap, type Phase, type CheckItem } from "./roadmap";

const STORAGE_KEY = "sf-rampup-progress";

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useRoadmapStore() {
  const [progress, setProgress] =
    useState<Record<string, boolean>>(loadProgress);

  const toggleItem = useCallback((itemId: string) => {
    setProgress((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      saveProgress(next);
      return next;
    });
  }, []);

  const phases = useMemo((): Phase[] => {
    return roadmap.map((phase) => ({
      ...phase,
      topics: phase.topics.map((topic) => {
        const items: CheckItem[] = topic.items.map((item) => ({
          ...item,
          done: progress[item.id] ?? item.done,
        }));
        const doneCount = items.filter((i) => i.done).length;
        const status =
          doneCount === 0
            ? "not-started"
            : doneCount === items.length
              ? "done"
              : "in-progress";
        return { ...topic, items, status };
      }),
    }));
  }, [progress]);

  const getPhaseProgress = useCallback(
    (phaseId: string) => {
      const phase = phases.find((p) => p.id === phaseId);
      if (!phase) return { done: 0, total: 0, percent: 0 };
      const total = phase.topics.reduce((acc, t) => acc + t.items.length, 0);
      const done = phase.topics.reduce(
        (acc, t) => acc + t.items.filter((i) => i.done).length,
        0,
      );
      return {
        done,
        total,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    },
    [phases],
  );

  const globalProgress = useMemo(() => {
    const total = phases.reduce(
      (acc, p) => acc + p.topics.reduce((a, t) => a + t.items.length, 0),
      0,
    );
    const done = phases.reduce(
      (acc, p) =>
        acc +
        p.topics.reduce((a, t) => a + t.items.filter((i) => i.done).length, 0),
      0,
    );
    return {
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }, [phases]);

  return { phases, toggleItem, getPhaseProgress, globalProgress };
}
