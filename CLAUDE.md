# Salesforce Rampup — CLAUDE.md

## Projet

Webapp React pour apprendre Salesforce et préparer les certifications dev (PD1, PD2, JS Dev I, Integration Architect). Tout le code est dans `webapp/`.

## Stack

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS v4 + ShadCN/ui
- TanStack Router (file-based routing, `src/routes/`)
- localStorage pour la persistence (pas de backend)
- react-markdown pour le rendu des lessons

## Commandes

```bash
cd webapp
npm run dev      # Dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Architecture

```
webapp/src/
├── data/           # Données statiques + hooks state
│   ├── roadmap.ts            # Phases, topics, items de la roadmap
│   ├── useRoadmapStore.ts    # Hook : progression roadmap + localStorage
│   ├── useQuizStore.ts       # Hook : quiz engine (shuffle, score, history)
│   ├── questions/            # 189 QCM répartis en 4 fichiers
│   │   ├── types.ts          # QuizQuestion, QuizDomain, domainInfos
│   │   ├── apex.ts           # 60 questions
│   │   ├── javascript-lwc.ts # 47 questions (27 JS + 20 LWC)
│   │   ├── soql-security.ts  # 42 questions
│   │   ├── declarative-scenarios.ts # 34 questions
│   │   └── index.ts          # Barrel — allQuestions
│   └── lessons/              # 163 lessons en 4 fichiers
│       ├── types.ts          # Interface Lesson
│       ├── apex-fundamentals.ts      # 52 lessons
│       ├── soql-data-model.ts        # 30 lessons
│       ├── lwc-javascript.ts         # 41 lessons
│       ├── security-integration-flows.ts # 40 lessons
│       └── index.ts          # Barrel — allLessons
├── components/
│   ├── ui/         # ShadCN components (ne pas éditer manuellement)
│   ├── layout/     # Sidebar
│   ├── quiz/       # QuizEngine, QuizCard, QuizResults, QuizDomainPicker
│   └── learn/      # CategoryPicker, LessonViewer
└── routes/         # TanStack file-based routing
    ├── __root.tsx            # Layout principal (sidebar + outlet)
    ├── index.tsx             # / — Dashboard roadmap
    ├── phase.$phaseId.tsx    # /phase/:id — Détail phase
    ├── quiz.tsx              # /quiz — Layout wrapper (outlet)
    ├── quiz.index.tsx        # /quiz — Domain picker
    ├── quiz.$domain.tsx      # /quiz/:domain — Quiz actif
    ├── learn.tsx             # /learn — Layout wrapper (outlet)
    ├── learn.index.tsx       # /learn — Category picker
    └── learn.$lessonId.tsx   # /learn/:id — Lesson viewer
```

## Conventions

### Routing
TanStack Router file-based. Les routes layout (`quiz.tsx`, `learn.tsx`) rendent un `<Outlet />`. Les routes index (`quiz.index.tsx`) sont les pages par défaut. Les routes dynamiques utilisent `$param`.

### Data
Pas de backend. Toutes les données (questions, lessons, roadmap) sont des fichiers `.ts` statiques dans `src/data/`. La persistence utilise localStorage via des hooks custom (`useRoadmapStore`, `useQuizStore`).

### Questions
Format uniforme `QuizQuestion` : id, question, options `{key, text}[]`, answer (string ou string[] pour multi-select), explanation, category, domain, difficulty, multiSelect?.

### Lessons
Format uniforme `Lesson` : id, title, category, tags, difficulty, certRelevance, content (markdown), tsAnalogy? (markdown), gotchas (string[]).

### Composants
- `src/components/ui/` — ShadCN auto-générés, ne pas modifier
- Composants métier : logique dans les hooks, composants render-only

### Ajout de contenu
- Nouvelles questions : ajouter dans le fichier de domaine correspondant dans `questions/`, le barrel `index.ts` les agrège automatiquement
- Nouvelles lessons : ajouter dans le fichier de domaine correspondant dans `lessons/`, le barrel `index.ts` les agrège automatiquement
- Attention aux template literals dans le markdown des lessons : échapper `${` en `\${` pour éviter les erreurs de build

## Roadmap features

Voir `webapp/ROADMAP.md` pour le détail des v2-v6 planifiées.
