# Salesforce Rampup Webapp — Roadmap Features

## Fait

### v0 — Skeleton + Roadmap tracker

- [x] Vite 8 + React + TypeScript + Tailwind v4 + ShadCN/ui + TanStack Router (file-based)
- [x] 5 phases de certification (Fondations → Integration Architect)
- [x] ~100 items (notions, exercices, superbadges) avec checkboxes
- [x] Progression persistée en localStorage (global + par phase)
- [x] Sidebar navigation + barres de progression
- [x] Détails certif (questions, durée, score, prérequis, superbadges)
- [x] Liens directs Trailhead

## En cours

### v1 — QCM & Scénarios

- [ ] Banque de QCM par domaine (Apex, SOQL, LWC, JS, Security, Integration, Flows)
- [ ] Format : question + 4 options + réponse + explication + catégorie + difficulté (PD1/PD2/JS-Dev-I)
- [ ] Mode examen : timer, score, review des erreurs
- [ ] Mode entraînement : question par question, explication immédiate
- [ ] Scénarios pratiques ("200 records insérés, que se passe-t-il ?")
- [ ] Données stockées dans `src/data/questions/` (un fichier par domaine)

## Backlog

### v2 — Mapping TypeScript ↔ Apex (Cheat Sheet interactif)

- [ ] Comparaison side-by-side des concepts : syntaxe TS à gauche, Apex à droite
- [ ] Catégories : types, collections, async, classes, error handling, testing
- [ ] Code snippets exécutables / copiables
- [ ] Highlighting des différences clés (case-insensitive, no generics inference, etc.)
- [ ] Section "pièges pour un dev TS" (governor limits, no filesystem, single-thread par tx)

### v3 — Governor Limits Simulator

- [ ] Input : description du scénario (nb records, nb SOQL dans trigger, nb DML, etc.)
- [ ] Output : visualisation des compteurs qui montent, alerte quand ça explose
- [ ] Scénarios prédéfinis (trigger non-bulk, SOQL in loop, nested DML)
- [ ] Mode "fix it" : proposer le code corrigé (bulkifié)

### v4 — Order of Execution (visualisation interactive)

- [ ] Flowchart cliquable de l'ordre d'exécution SF complet
- [ ] Étapes : system validation → before triggers → system validation → after triggers → assignment rules → auto-response → workflow → escalation → flows → entitlements → DML → post-commit (platform events, outbound messages)
- [ ] Chaque étape cliquable → explication + piège d'exam associé
- [ ] Mode quiz : "à quelle étape X se produit ?"

### v5 — Glossaire SF ↔ TS

- [ ] Mapping bidirectionnel des concepts (DML↔CRUD, Governor Limits↔Rate Limiting, Wire↔Reactive fetch, Sharing Rules↔ACL, Sandbox↔Environment, etc.)
- [ ] Recherche fuzzy
- [ ] Liens vers la notion correspondante dans la roadmap

### v6 — Flash Cards + Spaced Repetition

- [ ] ~200 cartes générées depuis les items de la roadmap
- [ ] Algorithme Leitner (boîtes 1→5, review espacé)
- [ ] Persistance localStorage du state de chaque carte (last review, box level)
- [ ] Stats : cartes maîtrisées, à revoir, nouvelles
- [ ] Mode session : 10/20/50 cartes
- [ ] Priorité automatique : les cartes ratées en QCM remontent

## Architecture

```
webapp/src/
├── data/
│   ├── roadmap.ts              # Phases + topics + items (v0)
│   ├── useRoadmapStore.ts      # State + localStorage persistence (v0)
│   ├── questions/              # QCM par domaine (v1)
│   │   ├── apex.ts
│   │   ├── soql.ts
│   │   ├── lwc.ts
│   │   ├── javascript.ts
│   │   ├── security.ts
│   │   ├── integration.ts
│   │   ├── flows.ts
│   │   └── scenarios.ts
│   ├── cheatsheet.ts           # Mapping TS ↔ Apex (v2)
│   ├── governor-limits.ts      # Scénarios de limites (v3)
│   ├── execution-order.ts      # Ordre d'exécution steps (v4)
│   ├── glossary.ts             # Glossaire bidirectionnel (v5)
│   └── flashcards.ts           # Cartes + algo Leitner (v6)
├── components/
│   ├── quiz/                   # QCM engine (v1)
│   ├── cheatsheet/             # Comparateur TS↔Apex (v2)
│   ├── simulator/              # Governor limits sim (v3)
│   ├── execution-order/        # Flowchart interactif (v4)
│   ├── glossary/               # Glossaire (v5)
│   └── flashcards/             # Flash cards UI (v6)
├── routes/
│   ├── __root.tsx
│   ├── index.tsx               # Dashboard (v0)
│   ├── phase.$phaseId.tsx      # Détail phase (v0)
│   ├── quiz.tsx                # QCM hub (v1)
│   ├── quiz.$domain.tsx        # QCM par domaine (v1)
│   ├── cheatsheet.tsx          # Mapping TS↔Apex (v2)
│   ├── simulator.tsx           # Governor limits (v3)
│   ├── execution-order.tsx     # Flowchart (v4)
│   ├── glossary.tsx            # Glossaire (v5)
│   └── flashcards.tsx          # Flash cards (v6)
```

## Priorités

| Feature                  | Impact apprentissage | Effort dev | Priorité      |
| ------------------------ | -------------------- | ---------- | ------------- |
| QCM & Scénarios (v1)     | Très élevé           | Moyen      | P0 — en cours |
| Mapping TS↔Apex (v2)     | Élevé                | Faible     | P1            |
| Governor Limits Sim (v3) | Élevé                | Moyen      | P1            |
| Order of Execution (v4)  | Élevé                | Moyen      | P2            |
| Glossaire (v5)           | Moyen                | Faible     | P2            |
| Flash Cards (v6)         | Élevé                | Moyen      | P3            |
