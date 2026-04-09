import type { Lesson } from "./types";
export type { Lesson } from "./types";
import { apexLessons } from "./apex-fundamentals";
import { soqlDataModelLessons } from "./soql-data-model";
import { lwcJsLessons } from "./lwc-javascript";
import { securityIntegrationFlowsLessons } from "./security-integration-flows";

export const allLessons: Lesson[] = [
  ...(apexLessons as Lesson[]),
  ...soqlDataModelLessons,
  ...lwcJsLessons,
  ...securityIntegrationFlowsLessons,
];

export interface LessonCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const categorySet = new Set(allLessons.map((l) => l.category));

export const lessonCategories: LessonCategory[] = [
  {
    id: "types-variables",
    label: "Types & Variables",
    icon: "📦",
    description: "Primitifs, collections, null safety",
  },
  {
    id: "collections",
    label: "Collections",
    icon: "📚",
    description: "List, Set, Map",
  },
  {
    id: "classes-oop",
    label: "Classes & OOP",
    icon: "🏗️",
    description: "Classes, interfaces, enums",
  },
  {
    id: "control-flow",
    label: "Control Flow",
    icon: "🔀",
    description: "Boucles, switch, exceptions",
  },
  {
    id: "dml",
    label: "DML Operations",
    icon: "💾",
    description: "Insert, update, upsert, delete",
  },
  {
    id: "triggers",
    label: "Triggers",
    icon: "⚡",
    description: "Before/after, context, handlers",
  },
  {
    id: "soql",
    label: "SOQL",
    icon: "🔍",
    description: "Requêtes, relations, agrégations",
  },
  {
    id: "sosl",
    label: "SOSL",
    icon: "🔎",
    description: "Recherche full-text multi-objets",
  },
  {
    id: "governor-limits",
    label: "Governor Limits",
    icon: "🚧",
    description: "Quotas par transaction",
  },
  {
    id: "async",
    label: "Async Apex",
    icon: "⏳",
    description: "Future, Queueable, Batch, Scheduled",
  },
  {
    id: "testing",
    label: "Testing",
    icon: "🧪",
    description: "@isTest, mocks, couverture",
  },
  {
    id: "design-patterns",
    label: "Design Patterns",
    icon: "📐",
    description: "Selector, Service, Domain, UoW",
  },
  {
    id: "data-model",
    label: "Data Model",
    icon: "📊",
    description: "Objets, relations, Record Types",
  },
  {
    id: "lwc-fundamentals",
    label: "LWC Fondamentaux",
    icon: "🧩",
    description: "Composants, decorators, templates",
  },
  {
    id: "lwc-events",
    label: "LWC Events",
    icon: "📡",
    description: "CustomEvent, LMS, communication",
  },
  {
    id: "lwc-data",
    label: "LWC Data",
    icon: "📥",
    description: "Wire, imperative, LDS",
  },
  {
    id: "lwc-lifecycle",
    label: "LWC Lifecycle",
    icon: "🔄",
    description: "Hooks, rendering, cleanup",
  },
  {
    id: "lwc-advanced",
    label: "LWC Avancé",
    icon: "🚀",
    description: "Dynamic, testing, performance",
  },
  {
    id: "lwc-testing",
    label: "LWC Testing",
    icon: "🧪",
    description: "Jest, wire mocks, Apex mocks",
  },
  {
    id: "javascript",
    label: "JavaScript Core",
    icon: "📜",
    description: "Closures, this, prototypes, promises",
  },
  {
    id: "security",
    label: "Sécurité",
    icon: "🔒",
    description: "Sharing model, OWD, FLS",
  },
  {
    id: "integration",
    label: "Intégration",
    icon: "🔗",
    description: "APIs, callouts, patterns",
  },
  {
    id: "flows",
    label: "Flows",
    icon: "🔄",
    description: "Automation déclarative",
  },
  {
    id: "deployment",
    label: "Déploiement",
    icon: "🚀",
    description: "Sandboxes, DX, CI/CD",
  },
].filter((c) => {
  // Keep categories that have lessons (fuzzy match on category)
  return allLessons.some(
    (l) =>
      l.category === c.id ||
      l.category.toLowerCase().includes(c.id.split("-")[0]),
  );
});

export function getLessonsByCategory(categoryId: string): Lesson[] {
  return allLessons.filter(
    (l) =>
      l.category === categoryId ||
      l.category.toLowerCase().includes(categoryId.split("-")[0]),
  );
}
