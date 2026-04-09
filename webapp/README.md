# Salesforce Rampup

Plateforme d'apprentissage pour les certifications Salesforce Developer — construite par un dev TypeScript pour des devs TypeScript.

## Stack

- **React 19** + **TypeScript 6**
- **Vite 8** (build + HMR)
- **Tailwind CSS v4** + **ShadCN/ui**
- **TanStack Router** (file-based routing)
- **localStorage** pour la persistence

## Fonctionnalités

### Roadmap Tracker (`/`)

5 phases de certification avec ~100 items checkables (notions, exercices, superbadges). Progression globale et par phase persistée en localStorage.

| Phase                  | Certif   | Durée estimée |
| ---------------------- | -------- | ------------- |
| Fondations             | —        | 3-4 semaines  |
| Platform Developer I   | PD1      | 6-8 semaines  |
| JavaScript Developer I | JS-Dev-I | 2-3 semaines  |
| Platform Developer II  | PD2      | 3-6 mois      |
| Integration Architect  | Int-Arch | Long terme    |

### Apprendre (`/learn`)

163 lessons structurées couvrant tous les domaines :

| Domaine                                               | Lessons |
| ----------------------------------------------------- | ------- |
| Apex (types, DML, triggers, async, testing, patterns) | 52      |
| SOQL / Data Model                                     | 30      |
| LWC / JavaScript                                      | 41      |
| Security / Integration / Flows / Deployment           | 40      |

Chaque lesson inclut :

- Contenu markdown riche avec exemples de code
- Analogies TypeScript/React/Vue systématiques
- Pièges d'examen (gotchas)
- Tags de pertinence par certification

### Quiz & QCM (`/quiz`)

189 questions exam-style avec mode entraînement :

| Domaine                                    | Questions |
| ------------------------------------------ | --------- |
| Apex                                       | 60        |
| JavaScript / LWC                           | 47        |
| SOQL / Security / Deployment / Integration | 42        |
| Flows / Data Model / Scénarios             | 34        |

Features :

- Mode training (explication immédiate après chaque réponse)
- Multi-select supporté
- Score global persisté en localStorage
- Résultats détaillés avec review des erreurs

## Getting Started

```bash
cd webapp
npm install
npm run dev
```

Ouvrir http://localhost:5173

## Structure

```
webapp/src/
├── data/
│   ├── roadmap.ts              # 5 phases, ~100 items
│   ├── useRoadmapStore.ts      # State + localStorage
│   ├── useQuizStore.ts         # Quiz engine state
│   ├── questions/              # 189 QCM (4 fichiers par domaine)
│   └── lessons/                # 163 lessons (4 fichiers par domaine)
├── components/
│   ├── layout/Sidebar.tsx      # Navigation + progression
│   ├── quiz/                   # QuizEngine, QuizCard, QuizResults
│   └── learn/                  # CategoryPicker, LessonViewer
└── routes/                     # TanStack file-based routing
    ├── index.tsx               # Dashboard roadmap
    ├── phase.$phaseId.tsx      # Détail phase
    ├── quiz.tsx + quiz.*       # Hub QCM + quiz par domaine
    └── learn.tsx + learn.*     # Hub lessons + viewer
```

## Roadmap

Voir [ROADMAP.md](./ROADMAP.md) pour les features planifiées (v2-v6) :

- Mapping TypeScript ↔ Apex (cheat sheet interactif)
- Governor Limits Simulator
- Order of Execution (flowchart interactif)
- Glossaire SF ↔ TS
- Flash Cards + Spaced Repetition
