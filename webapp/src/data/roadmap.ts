export type TopicStatus = "not-started" | "in-progress" | "done";

export interface Topic {
  id: string;
  title: string;
  description: string;
  status: TopicStatus;
  items: CheckItem[];
}

export interface CheckItem {
  id: string;
  label: string;
  type: "notion" | "exercise" | "superbadge" | "exam";
  done: boolean;
  link?: string;
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  questions: number;
  duration: string;
  passingScore: string;
  cost: string;
  difficulty: "easy" | "medium" | "hard";
  prerequisites: string[];
  requiredSuperbadges: string[];
}

export interface Phase {
  id: string;
  title: string;
  subtitle: string;
  estimatedDuration: string;
  certification: Certification | null;
  topics: Topic[];
  color: string;
}

export const roadmap: Phase[] = [
  {
    id: "foundations",
    title: "Phase 1 — Fondations",
    subtitle: "Comprendre l'écosystème Salesforce",
    estimatedDuration: "3-4 semaines",
    color: "blue",
    certification: null,
    topics: [
      {
        id: "sf-basics",
        title: "Salesforce Platform Basics",
        description:
          "Architecture multi-tenant, AppExchange, éditions, data model",
        status: "not-started",
        items: [
          {
            id: "sf-b-1",
            label: "Multi-tenant architecture",
            type: "notion",
            done: false,
          },
          {
            id: "sf-b-2",
            label: "Objets standard : Account, Contact, Lead, Opportunity",
            type: "notion",
            done: false,
          },
          {
            id: "sf-b-3",
            label: "Relations : Lookup vs Master-Detail",
            type: "notion",
            done: false,
          },
          {
            id: "sf-b-4",
            label: "Record Types, Page Layouts",
            type: "notion",
            done: false,
          },
          {
            id: "sf-b-5",
            label: "Trailhead: Salesforce Platform Basics",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/starting_force_com",
          },
          {
            id: "sf-b-6",
            label: "Créer un Trailhead Playground",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/trailhead_playground_management",
          },
        ],
      },
      {
        id: "sf-security",
        title: "Sécurité & Accès",
        description:
          "Profiles, Permission Sets, OWD, Sharing Rules, Role Hierarchy",
        status: "not-started",
        items: [
          {
            id: "sec-1",
            label: "Profiles vs Permission Sets",
            type: "notion",
            done: false,
          },
          {
            id: "sec-2",
            label: "Organization-Wide Defaults (OWD)",
            type: "notion",
            done: false,
          },
          { id: "sec-3", label: "Role Hierarchy", type: "notion", done: false },
          {
            id: "sec-4",
            label: "Sharing Rules & Manual Sharing",
            type: "notion",
            done: false,
          },
          {
            id: "sec-5",
            label: "Field-Level Security (FLS)",
            type: "notion",
            done: false,
          },
          {
            id: "sec-6",
            label: "Trailhead: Data Security",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/data_security",
          },
        ],
      },
      {
        id: "sf-declarative",
        title: "Outils déclaratifs",
        description: "Flows, Validation Rules, Formulas, Process Automation",
        status: "not-started",
        items: [
          {
            id: "dec-1",
            label: "Flow Builder : Screen Flow, Record-Triggered",
            type: "notion",
            done: false,
          },
          {
            id: "dec-2",
            label: "Validation Rules & Formulas",
            type: "notion",
            done: false,
          },
          {
            id: "dec-3",
            label: "Workflow Rules (legacy) vs Flow",
            type: "notion",
            done: false,
          },
          {
            id: "dec-4",
            label: "Approval Processes",
            type: "notion",
            done: false,
          },
          {
            id: "dec-5",
            label: "Trailhead: Flow Builder",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/business_process_automation",
          },
        ],
      },
      {
        id: "sf-env-setup",
        title: "Environnement Dev",
        description: "SF CLI, VS Code, Scratch Orgs, DX Project",
        status: "not-started",
        items: [
          {
            id: "env-1",
            label: "Installer Salesforce CLI (sf)",
            type: "exercise",
            done: false,
          },
          {
            id: "env-2",
            label: "VS Code + Salesforce Extension Pack",
            type: "exercise",
            done: false,
          },
          {
            id: "env-3",
            label: "Connecter un Dev Hub",
            type: "exercise",
            done: false,
          },
          {
            id: "env-4",
            label: "Créer un Scratch Org",
            type: "exercise",
            done: false,
          },
          {
            id: "env-5",
            label: "sf project deploy / retrieve",
            type: "notion",
            done: false,
          },
          {
            id: "env-6",
            label: "Trailhead: Quick Start Salesforce DX",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/projects/quick-start-salesforce-dx",
          },
        ],
      },
    ],
  },
  {
    id: "pd1",
    title: "Phase 2 — Platform Developer I",
    subtitle: "Apex, SOQL, LWC, Tests — la certif centrale",
    estimatedDuration: "6-8 semaines",
    color: "purple",
    certification: {
      id: "cert-pd1",
      name: "Platform Developer I",
      code: "PD1",
      questions: 60,
      duration: "105 min",
      passingScore: "68%",
      cost: "$200",
      difficulty: "medium",
      prerequisites: [],
      requiredSuperbadges: [],
    },
    topics: [
      {
        id: "apex-basics",
        title: "Apex — Fondamentaux",
        description: "Syntaxe, types, collections, classes, interfaces",
        status: "not-started",
        items: [
          {
            id: "ap-1",
            label: "Types primitifs, String, Integer, Boolean, Date",
            type: "notion",
            done: false,
          },
          {
            id: "ap-2",
            label: "Collections : List, Set, Map",
            type: "notion",
            done: false,
          },
          {
            id: "ap-3",
            label: "Classes, Interfaces, Enums",
            type: "notion",
            done: false,
          },
          {
            id: "ap-4",
            label: "Exceptions & try/catch",
            type: "notion",
            done: false,
          },
          {
            id: "ap-5",
            label: "Static vs Instance methods",
            type: "notion",
            done: false,
          },
          {
            id: "ap-6",
            label: "Trailhead: Apex Basics & Database",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/apex_database",
          },
          {
            id: "ap-7",
            label: "Écrire une classe utilitaire Apex",
            type: "exercise",
            done: false,
          },
        ],
      },
      {
        id: "apex-triggers",
        title: "Apex — Triggers & DML",
        description: "Trigger context, DML operations, bulk patterns",
        status: "not-started",
        items: [
          {
            id: "tr-1",
            label: "Trigger context variables (new, old, isInsert, etc.)",
            type: "notion",
            done: false,
          },
          {
            id: "tr-2",
            label: "Before vs After triggers",
            type: "notion",
            done: false,
          },
          {
            id: "tr-3",
            label: "Bulk trigger pattern (jamais coder pour 1 record)",
            type: "notion",
            done: false,
          },
          {
            id: "tr-4",
            label: "DML : insert, update, upsert, delete, undelete",
            type: "notion",
            done: false,
          },
          {
            id: "tr-5",
            label: "Order of Execution",
            type: "notion",
            done: false,
          },
          {
            id: "tr-6",
            label: "Trigger Handler Pattern",
            type: "notion",
            done: false,
          },
          {
            id: "tr-7",
            label: "Trailhead: Apex Triggers",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/apex_triggers",
          },
          {
            id: "tr-8",
            label: "Créer un trigger bulk-safe",
            type: "exercise",
            done: false,
          },
        ],
      },
      {
        id: "soql-sosl",
        title: "SOQL & SOSL",
        description: "Requêtes, relations, agrégations, limites",
        status: "not-started",
        items: [
          {
            id: "sq-1",
            label: "SELECT, WHERE, ORDER BY, LIMIT",
            type: "notion",
            done: false,
          },
          {
            id: "sq-2",
            label: "Relationship queries (parent-to-child, child-to-parent)",
            type: "notion",
            done: false,
          },
          {
            id: "sq-3",
            label: "Aggregate functions : COUNT, SUM, AVG, GROUP BY",
            type: "notion",
            done: false,
          },
          {
            id: "sq-4",
            label: "Dynamic SOQL vs Static SOQL",
            type: "notion",
            done: false,
          },
          {
            id: "sq-5",
            label: "SOSL : FIND, IN, RETURNING",
            type: "notion",
            done: false,
          },
          {
            id: "sq-6",
            label: "Limite : 100 SOQL queries par transaction",
            type: "notion",
            done: false,
          },
          {
            id: "sq-7",
            label: "Trailhead: SOQL for Admins",
            type: "exercise",
            done: false,
          },
        ],
      },
      {
        id: "governor-limits",
        title: "Governor Limits",
        description:
          "Le concept le plus alien pour un dev TS — les quotas par transaction",
        status: "not-started",
        items: [
          {
            id: "gl-1",
            label: "100 SOQL queries par synchrone transaction",
            type: "notion",
            done: false,
          },
          {
            id: "gl-2",
            label: "150 DML statements par transaction",
            type: "notion",
            done: false,
          },
          {
            id: "gl-3",
            label: "10 000 DML rows par transaction",
            type: "notion",
            done: false,
          },
          {
            id: "gl-4",
            label: "10s CPU time (sync), 60s (async)",
            type: "notion",
            done: false,
          },
          { id: "gl-5", label: "6 MB heap size", type: "notion", done: false },
          {
            id: "gl-6",
            label: "Patterns d'optimisation : bulkification, lazy loading",
            type: "notion",
            done: false,
          },
          {
            id: "gl-7",
            label:
              "Limits class : Limits.getQueries(), Limits.getDmlStatements()",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "lwc-basics",
        title: "LWC — Lightning Web Components",
        description:
          "Composants web natifs — ton terrain familier (React/Vue like)",
        status: "not-started",
        items: [
          {
            id: "lwc-1",
            label: "Structure : .js + .html + .css + .xml",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-2",
            label: "Decorators : @api, @track, @wire",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-3",
            label: "Data binding & template directives (if:true, for:each)",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-4",
            label: "Events : CustomEvent, dispatchEvent, bubbles/composed",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-5",
            label: "Wire service : @wire(getRecord), @wire(apex method)",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-6",
            label: "Lifecycle hooks : connectedCallback, renderedCallback",
            type: "notion",
            done: false,
          },
          {
            id: "lwc-7",
            label: "Trailhead: Lightning Web Components Basics",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/lightning-web-components-basics",
          },
          {
            id: "lwc-8",
            label: "Créer un composant LWC avec wire service",
            type: "exercise",
            done: false,
          },
        ],
      },
      {
        id: "apex-testing",
        title: "Tests Apex",
        description: "75% coverage obligatoire — @isTest, testSetup, asserts",
        status: "not-started",
        items: [
          {
            id: "at-1",
            label: "@isTest annotation & test classes",
            type: "notion",
            done: false,
          },
          {
            id: "at-2",
            label: "@testSetup pour les données de test",
            type: "notion",
            done: false,
          },
          {
            id: "at-3",
            label: "System.assert, assertEquals, assertNotEquals",
            type: "notion",
            done: false,
          },
          {
            id: "at-4",
            label: "Test.startTest() / Test.stopTest() — governor limits reset",
            type: "notion",
            done: false,
          },
          {
            id: "at-5",
            label: "Créer des données de test (pas de SeeAllData=true)",
            type: "notion",
            done: false,
          },
          {
            id: "at-6",
            label: "75% minimum coverage pour déployer en prod",
            type: "notion",
            done: false,
          },
          {
            id: "at-7",
            label: "Trailhead: Apex Testing",
            type: "exercise",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/modules/apex_testing",
          },
          {
            id: "at-8",
            label:
              "Écrire des tests pour un trigger avec positive/negative cases",
            type: "exercise",
            done: false,
          },
        ],
      },
      {
        id: "deployment",
        title: "Déploiement & Sandboxes",
        description: "Change Sets, Metadata API, Sandboxes, Packages",
        status: "not-started",
        items: [
          {
            id: "dep-1",
            label: "Types de Sandbox : Dev, Dev Pro, Partial, Full",
            type: "notion",
            done: false,
          },
          {
            id: "dep-2",
            label: "Change Sets (outbound/inbound)",
            type: "notion",
            done: false,
          },
          {
            id: "dep-3",
            label: "Metadata API deployment",
            type: "notion",
            done: false,
          },
          {
            id: "dep-4",
            label: "Unlocked Packages",
            type: "notion",
            done: false,
          },
          {
            id: "dep-5",
            label: "sf project deploy start",
            type: "exercise",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "js-dev",
    title: "Phase 3 — JavaScript Developer I",
    subtitle: "Ta certif easy win — JS pur + LWC Superbadge",
    estimatedDuration: "2-3 semaines",
    color: "green",
    certification: {
      id: "cert-jsdev",
      name: "JavaScript Developer I",
      code: "JS-Dev-I",
      questions: 60,
      duration: "105 min",
      passingScore: "65%",
      cost: "$200",
      difficulty: "easy",
      prerequisites: [],
      requiredSuperbadges: ["Lightning Web Components Specialist"],
    },
    topics: [
      {
        id: "js-core",
        title: "JavaScript Core (ES6+)",
        description: "Ce que tu connais déjà — révision ciblée pour l'exam",
        status: "not-started",
        items: [
          {
            id: "js-1",
            label: "var vs let vs const, hoisting, TDZ",
            type: "notion",
            done: false,
          },
          {
            id: "js-2",
            label: "Closures & scope chain",
            type: "notion",
            done: false,
          },
          {
            id: "js-3",
            label: "Prototypal inheritance vs class syntax",
            type: "notion",
            done: false,
          },
          {
            id: "js-4",
            label: "this binding (call, apply, bind, arrow functions)",
            type: "notion",
            done: false,
          },
          {
            id: "js-5",
            label: "Destructuring, spread, rest",
            type: "notion",
            done: false,
          },
          {
            id: "js-6",
            label: "Symbol, Iterator, Generator",
            type: "notion",
            done: false,
          },
          { id: "js-7", label: "Proxy & Reflect", type: "notion", done: false },
          {
            id: "js-8",
            label: "WeakMap, WeakSet, WeakRef",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "js-async",
        title: "Asynchrone",
        description: "Promises, async/await, event loop, microtasks",
        status: "not-started",
        items: [
          {
            id: "ja-1",
            label: "Event loop, call stack, task queue, microtask queue",
            type: "notion",
            done: false,
          },
          {
            id: "ja-2",
            label: "Promise.all, Promise.race, Promise.allSettled, Promise.any",
            type: "notion",
            done: false,
          },
          {
            id: "ja-3",
            label: "async/await error handling patterns",
            type: "notion",
            done: false,
          },
          {
            id: "ja-4",
            label: "setTimeout/setInterval dans l'event loop",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "js-dom",
        title: "Browser & DOM",
        description: "DOM API, events, shadow DOM",
        status: "not-started",
        items: [
          {
            id: "jd-1",
            label: "DOM traversal & manipulation",
            type: "notion",
            done: false,
          },
          {
            id: "jd-2",
            label: "Event bubbling, capturing, delegation",
            type: "notion",
            done: false,
          },
          {
            id: "jd-3",
            label: "Custom Elements & Shadow DOM",
            type: "notion",
            done: false,
          },
          {
            id: "jd-4",
            label: "Fetch API, AbortController",
            type: "notion",
            done: false,
          },
          {
            id: "jd-5",
            label: "Web Storage, IndexedDB",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "js-testing",
        title: "Testing JS",
        description: "Jest basics, mocking, assertions",
        status: "not-started",
        items: [
          {
            id: "jt-1",
            label: "Jest : describe, it, expect, matchers",
            type: "notion",
            done: false,
          },
          {
            id: "jt-2",
            label: "Mocking : jest.fn(), jest.mock()",
            type: "notion",
            done: false,
          },
          {
            id: "jt-3",
            label: "LWC Jest testing (@salesforce/sfdx-lwc-jest)",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "lwc-superbadge",
        title: "Superbadge LWC Specialist",
        description: "Requis pour obtenir la certification JS Dev I",
        status: "not-started",
        items: [
          {
            id: "lwc-sb-1",
            label: "Compléter le Superbadge LWC Specialist sur Trailhead",
            type: "superbadge",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/superbadges/superbadge_lwc_specialist",
          },
        ],
      },
    ],
  },
  {
    id: "pd2",
    title: "Phase 4 — Platform Developer II",
    subtitle: "Niveau avancé — patterns, intégration, performance",
    estimatedDuration: "3-6 mois (XP terrain requise)",
    color: "orange",
    certification: {
      id: "cert-pd2",
      name: "Platform Developer II",
      code: "PD2",
      questions: 60,
      duration: "120 min",
      passingScore: "70%",
      cost: "$200",
      difficulty: "hard",
      prerequisites: ["Platform Developer I"],
      requiredSuperbadges: [
        "Apex Specialist",
        "Data Integration Specialist",
        "Advanced Apex Specialist",
      ],
    },
    topics: [
      {
        id: "apex-advanced",
        title: "Apex Avancé",
        description: "Batch, Queueable, Scheduled, Future, design patterns",
        status: "not-started",
        items: [
          {
            id: "aa-1",
            label: "@future methods (async fire-and-forget)",
            type: "notion",
            done: false,
          },
          {
            id: "aa-2",
            label: "Queueable Apex (chaînable, state)",
            type: "notion",
            done: false,
          },
          {
            id: "aa-3",
            label: "Batch Apex (Database.Batchable, start/execute/finish)",
            type: "notion",
            done: false,
          },
          {
            id: "aa-4",
            label: "Scheduled Apex (Schedulable interface)",
            type: "notion",
            done: false,
          },
          {
            id: "aa-5",
            label: "Platform Events & Change Data Capture",
            type: "notion",
            done: false,
          },
          {
            id: "aa-6",
            label: "Custom Metadata Types vs Custom Settings",
            type: "notion",
            done: false,
          },
          {
            id: "aa-7",
            label: "Apex Design Patterns : Singleton, Strategy, Factory",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "integration",
        title: "Intégration",
        description: "REST/SOAP callouts, Connected Apps, Named Credentials",
        status: "not-started",
        items: [
          {
            id: "int-1",
            label: "HTTP Callouts : HttpRequest, HttpResponse",
            type: "notion",
            done: false,
          },
          {
            id: "int-2",
            label: "REST API exposition (@RestResource)",
            type: "notion",
            done: false,
          },
          {
            id: "int-3",
            label: "Named Credentials & External Credentials",
            type: "notion",
            done: false,
          },
          {
            id: "int-4",
            label: "Connected Apps & OAuth flows",
            type: "notion",
            done: false,
          },
          {
            id: "int-5",
            label: "Mock callouts in tests (HttpCalloutMock)",
            type: "notion",
            done: false,
          },
          {
            id: "int-6",
            label: "Outbound Messaging",
            type: "notion",
            done: false,
          },
          {
            id: "int-7",
            label: "External Services & Flows",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "lwc-advanced",
        title: "LWC Avancé",
        description: "Navigation, Lightning Data Service, performance",
        status: "not-started",
        items: [
          {
            id: "la-1",
            label: "Lightning Navigation Service",
            type: "notion",
            done: false,
          },
          {
            id: "la-2",
            label: "Lightning Data Service (LDS) cache",
            type: "notion",
            done: false,
          },
          {
            id: "la-3",
            label: "Lightning Message Service (LMS)",
            type: "notion",
            done: false,
          },
          {
            id: "la-4",
            label: "Dynamic component creation",
            type: "notion",
            done: false,
          },
          {
            id: "la-5",
            label: "Performance : lazy loading, caching strategies",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "pd2-superbadges",
        title: "Superbadges requis",
        description: "3 superbadges obligatoires pour obtenir PD2",
        status: "not-started",
        items: [
          {
            id: "sb-1",
            label: "Apex Specialist Superbadge",
            type: "superbadge",
            done: false,
            link: "https://trailhead.salesforce.com/content/learn/superbadges/superbadge_apex",
          },
          {
            id: "sb-2",
            label: "Data Integration Specialist Superbadge",
            type: "superbadge",
            done: false,
          },
          {
            id: "sb-3",
            label: "Advanced Apex Specialist Superbadge",
            type: "superbadge",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "integration-architect",
    title: "Phase 5 — Integration Architect",
    subtitle: "Architecture d'intégration enterprise (2+ ans XP)",
    estimatedDuration: "Long terme",
    color: "red",
    certification: {
      id: "cert-intarch",
      name: "Integration Architect",
      code: "Integration-Arch",
      questions: 60,
      duration: "120 min",
      passingScore: "67%",
      cost: "$200",
      difficulty: "hard",
      prerequisites: ["Platform Developer I"],
      requiredSuperbadges: [],
    },
    topics: [
      {
        id: "int-patterns",
        title: "Patterns d'intégration",
        description: "Les 6 patterns Salesforce à maîtriser",
        status: "not-started",
        items: [
          {
            id: "ip-1",
            label: "Remote Process Invocation — Request & Reply",
            type: "notion",
            done: false,
          },
          {
            id: "ip-2",
            label: "Remote Process Invocation — Fire & Forget",
            type: "notion",
            done: false,
          },
          {
            id: "ip-3",
            label: "Batch Data Synchronization",
            type: "notion",
            done: false,
          },
          { id: "ip-4", label: "Remote Call-In", type: "notion", done: false },
          {
            id: "ip-5",
            label: "UI Update Based on Data Changes",
            type: "notion",
            done: false,
          },
          {
            id: "ip-6",
            label: "Data Virtualization",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "int-security",
        title: "Sécurité & Auth",
        description: "OAuth 2.0 flows, JWT Bearer, SAML",
        status: "not-started",
        items: [
          {
            id: "is-1",
            label:
              "OAuth 2.0 : Authorization Code, Client Credentials, JWT Bearer",
            type: "notion",
            done: false,
          },
          { id: "is-2", label: "SAML SSO", type: "notion", done: false },
          {
            id: "is-3",
            label: "Shield Platform Encryption",
            type: "notion",
            done: false,
          },
          {
            id: "is-4",
            label: "Connected App policies",
            type: "notion",
            done: false,
          },
        ],
      },
      {
        id: "int-middleware",
        title: "Middleware & Tools",
        description: "MuleSoft, Heroku, middleware patterns",
        status: "not-started",
        items: [
          {
            id: "im-1",
            label: "MuleSoft Anypoint basics",
            type: "notion",
            done: false,
          },
          { id: "im-2", label: "Heroku Connect", type: "notion", done: false },
          {
            id: "im-3",
            label: "Salesforce Connect (External Objects)",
            type: "notion",
            done: false,
          },
          {
            id: "im-4",
            label: "Change Data Capture at scale",
            type: "notion",
            done: false,
          },
        ],
      },
    ],
  },
];
