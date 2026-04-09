export interface QuizQuestion {
  id: string;
  question: string;
  options: { key: string; text: string }[];
  answer: string | string[];
  explanation: string;
  category: string;
  domain: QuizDomain;
  difficulty: "PD1" | "PD2" | "JS-Dev-I" | "Integration-Arch";
  multiSelect?: boolean;
}

export type QuizDomain =
  | "apex"
  | "soql"
  | "javascript"
  | "lwc"
  | "security"
  | "integration"
  | "flows"
  | "data-model"
  | "deployment"
  | "scenarios";

export interface QuizDomainInfo {
  id: QuizDomain;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const domainInfos: QuizDomainInfo[] = [
  {
    id: "apex",
    label: "Apex",
    description: "Triggers, DML, classes, governor limits, async, testing",
    icon: "⚡",
    color: "purple",
  },
  {
    id: "soql",
    label: "SOQL / SOSL",
    description: "Requêtes, relations, agrégations, injection",
    icon: "🔍",
    color: "blue",
  },
  {
    id: "javascript",
    label: "JavaScript",
    description: "ES6+, closures, this, promises, event loop",
    icon: "📜",
    color: "yellow",
  },
  {
    id: "lwc",
    label: "LWC",
    description: "Decorators, wire, events, lifecycle, shadow DOM",
    icon: "🧩",
    color: "green",
  },
  {
    id: "security",
    label: "Sécurité",
    description: "Sharing model, OWD, profiles, FLS, permissions",
    icon: "🔒",
    color: "red",
  },
  {
    id: "integration",
    label: "Intégration",
    description: "REST/SOAP, callouts, platform events, patterns",
    icon: "🔗",
    color: "orange",
  },
  {
    id: "flows",
    label: "Flows",
    description: "Record-triggered, screen, scheduled, order of execution",
    icon: "🔄",
    color: "cyan",
  },
  {
    id: "data-model",
    label: "Data Model",
    description: "Objets, relations, record types, big objects",
    icon: "📊",
    color: "indigo",
  },
  {
    id: "deployment",
    label: "Déploiement",
    description: "Sandboxes, change sets, DX, packages, CI/CD",
    icon: "🚀",
    color: "teal",
  },
  {
    id: "scenarios",
    label: "Scénarios",
    description: "Questions situationnelles et debugging",
    icon: "🎯",
    color: "pink",
  },
];
