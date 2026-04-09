import type { QuizQuestion } from "./types";

export const declarativeScenariosQuestions: QuizQuestion[] = [
  {
    id: "flow-1",
    question:
      "Un développeur doit auto-remplir un champ \"Last Reviewed Date\" à aujourd'hui à chaque sauvegarde d'un Account. Solution la plus performante sans code ?",
    options: [
      { key: "A", text: "After-Save Record-Triggered Flow" },
      { key: "B", text: "Before-Save Record-Triggered Flow" },
      { key: "C", text: "Scheduled Flow nightly" },
      { key: "D", text: "Workflow Rule avec Field Update" },
    ],
    answer: "B",
    explanation:
      "Les before-save flows modifient le record en mémoire sans DML additionnel — jusqu'à 10x plus rapide qu'un after-save flow pour des updates simples sur le même record.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-2",
    question:
      "Un Record-Triggered Flow sur Opportunity doit créer un Task relié. Quel type de flow ?",
    options: [
      { key: "A", text: "Before-Save Record-Triggered Flow" },
      { key: "B", text: "After-Save Record-Triggered Flow" },
      { key: "C", text: "Scheduled Flow" },
      { key: "D", text: "Autolaunched Flow (No Trigger)" },
    ],
    answer: "B",
    explanation:
      "Les before-save flows ne peuvent QUE modifier le record déclencheur. Créer un Task (autre objet) nécessite du DML → after-save flow obligatoire.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-3",
    question:
      "Un Screen Flow échoue quand un lookup requis est vide dans un Create Records. Comment gérer ?",
    options: [
      {
        key: "A",
        text: "Decision element avant le Create Records pour valider",
      },
      {
        key: "B",
        text: "Fault Connector vers un Screen avec message d'erreur custom",
      },
      { key: "C", text: "Try-Catch dans le flow" },
      { key: "D", text: "A et B ensemble" },
    ],
    answer: "D",
    explanation:
      "Best practice : validation proactive (Decision) ET fault connector pour les erreurs inattendues. Il n'existe pas de try-catch dans Flow Builder.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-4",
    question:
      "Quelles actions sont supportées dans un Before-Save Record-Triggered Flow ? (2 réponses)",
    options: [
      { key: "A", text: "Update des champs du record déclencheur" },
      { key: "B", text: "Créer un child record" },
      { key: "C", text: "Envoyer un email" },
      { key: "D", text: "Formulas et assignments pour calculer des valeurs" },
    ],
    answer: ["A", "D"],
    explanation:
      "Les before-save flows sont limités à la modification in-memory du record déclencheur : assignments, decisions, loops, formulas. Pas de DML sur d'autres objets, pas d'emails.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "flow-5",
    question:
      "Email hebdomadaire chaque lundi aux owners d'Accounts non mis à jour depuis 30+ jours — quel type de flow ?",
    options: [
      { key: "A", text: "Record-Triggered Flow (After-Save)" },
      { key: "B", text: "Platform Event-Triggered Flow" },
      { key: "C", text: "Scheduled Flow" },
      { key: "D", text: "Screen Flow" },
    ],
    answer: "C",
    explanation:
      "Les Scheduled Flows tournent à heure programmée sur une collection de records selon des critères — exactement ce scénario.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-6",
    question: "Ordre d'exécution correct lors d'un record save ?",
    options: [
      {
        key: "A",
        text: "Before Trigger → Before-Save Flow → Validation → After Flow → After Trigger",
      },
      {
        key: "B",
        text: "Before-Save Flow → Before Trigger → Validation → Save → After Flow",
      },
      {
        key: "C",
        text: "Validation → Before-Save Flow → Before Trigger → Save → After Trigger",
      },
      {
        key: "D",
        text: "Before Trigger → Validation → Before-Save Flow → Save → After Flow",
      },
    ],
    answer: "B",
    explanation:
      "Ordre moderne : System validation → Before-save flows → Before triggers → Custom validation → Save to DB → After-save flows → After triggers → Workflow rules → Commit.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-7",
    question:
      "Un before-save flow ET un before trigger modifient le même champ d'un Account. Quelle valeur persiste ?",
    options: [
      { key: "A", text: "La valeur du flow (exécute en premier)" },
      { key: "B", text: "La valeur du trigger (overwrite le flow)" },
      { key: "C", text: "Merge des deux valeurs" },
      { key: "D", text: "Erreur de conflit" },
    ],
    answer: "B",
    explanation:
      "Le before trigger s'exécute APRÈS le before-save flow sur le même objet en mémoire. Sa valeur écrase celle du flow.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-8",
    question:
      "Empêcher la sauvegarde d'une Opportunity si Amount=0 — validation rule ou before-save flow ?",
    options: [
      { key: "A", text: "Before-save flow avec Decision + error" },
      { key: "B", text: "Validation rule : Amount = 0" },
      { key: "C", text: "Les deux sont équivalents" },
      { key: "D", text: "After-save flow qui supprime le record" },
    ],
    answer: "B",
    explanation:
      "Les validation rules sont conçues pour ça : déclaratives, simples, versionables, avec messages ciblés par champ.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-9",
    question:
      "Les validation rules se ré-évaluent-elles après un workflow field update ?",
    options: [
      { key: "A", text: "Oui — à chaque field update" },
      { key: "B", text: "Non — une seule fois, avant les workflows" },
      { key: "C", text: "Oui si formula-based" },
      { key: "D", text: "Seulement après commit" },
    ],
    answer: "B",
    explanation:
      "Les custom validation rules s'exécutent à l'étape 4 — avant les workflows. Elles ne sont PAS ré-exécutées après un workflow field update. Piège classique d'examen.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-10",
    question:
      "Empêcher la suppression d'un record Container si Status ≠ 'Decommissioned' — solution sans code ?",
    options: [
      { key: "A", text: "Before-Delete Record-Triggered Flow" },
      { key: "B", text: "Validation Rule avec ISDELETED()" },
      { key: "C", text: "Before-Delete Apex Trigger avec addError()" },
      { key: "D", text: "Pas de solution sans code — Apex requis" },
    ],
    answer: "D",
    explanation:
      "Piège ! Il n'existe PAS de before-delete flow. Les validation rules ne peuvent pas empêcher les suppressions. Seul un before-delete trigger Apex peut le faire.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "flow-11",
    question:
      "Autolaunched Flow (No Trigger) vs Record-Triggered Flow — quand utiliser lequel ?",
    options: [
      { key: "A", text: "Autolaunched=schedule, Record-Triggered=user" },
      {
        key: "B",
        text: "Autolaunched=appelé par Apex/bouton/flow, Record-Triggered=événements DML auto",
      },
      {
        key: "C",
        text: "Autolaunched=logique complexe, Record-Triggered=simple",
      },
      { key: "D", text: "Interchangeables" },
    ],
    answer: "B",
    explanation:
      "Autolaunched flows sont appelés programmatiquement (Apex, LWC, subflow, bouton). Record-Triggered fires automatiquement sur create/update.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
  },
  {
    id: "dm-1",
    question:
      "Modéliser une relation Camera↔Part many-to-many — quel data model ?",
    options: [
      { key: "A", text: "Lookup de Camera vers Part" },
      { key: "B", text: "Master-Detail de Camera vers Part" },
      { key: "C", text: "Junction Object avec deux Master-Detail" },
      { key: "D", text: "Junction Object avec deux Lookups" },
    ],
    answer: "C",
    explanation:
      "Les relations many-to-many utilisent un junction object avec deux Master-Detail — permet les roll-up summaries sur les deux parents et le cascade delete.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-2",
    question: "TROIS différences clés Lookup vs Master-Detail ?",
    options: [
      { key: "A", text: "Master-Detail supporte roll-up summaries" },
      { key: "B", text: "Suppression master = cascade delete des enfants" },
      { key: "C", text: "Enfants Master-Detail héritent du OWD du parent" },
      { key: "D", text: "Toutes les réponses" },
    ],
    answer: "D",
    explanation:
      "Roll-up summaries (COUNT, SUM, MIN, MAX) uniquement sur Master-Detail. Cascade delete à la suppression du parent. Héritage OWD/sharing du parent.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-3",
    question:
      "Stocker un identifiant unique du système ERP legacy pour les upserts — quel type de champ ?",
    options: [
      { key: "A", text: "Text avec contrainte unique" },
      { key: "B", text: "External ID" },
      { key: "C", text: "Auto-Number" },
      { key: "D", text: "Formula" },
    ],
    answer: "B",
    explanation:
      "Les External IDs sont indexés, supportent l'opération upsert() pour le matching, et sont disponibles dans les APIs.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-4",
    question: "Quand utiliser un Big Object plutôt qu'un Custom Object ?",
    options: [
      { key: "A", text: "Roll-up summaries sur millions de records" },
      {
        key: "B",
        text: "Stocker des centaines de millions de records rarement mis à jour",
      },
      { key: "C", text: "Accès temps réel à des données externes" },
      { key: "D", text: "Validation rules complexes sur high-volume" },
    ],
    answer: "B",
    explanation:
      "Big Objects sont conçus pour le stockage massif (100M+) de données write-once, rarement mises à jour (audit, historique).",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-5",
    question:
      "Voir/reporter des données SAP sans les importer dans SF — quelle feature ?",
    options: [
      { key: "A", text: "Big Objects" },
      { key: "B", text: "Custom Objects + External IDs" },
      { key: "C", text: "Salesforce Connect avec External Objects" },
      { key: "D", text: "Data Import Wizard" },
    ],
    answer: "C",
    explanation:
      "Salesforce Connect virtualise les données externes via OData — accès temps réel sans réplication.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-6",
    question:
      "Reparenter un child record dans une relation Master-Detail — comment ?",
    options: [
      { key: "A", text: "Changer en Lookup" },
      { key: "B", text: "Activer 'Allow Reparenting'" },
      { key: "C", text: "Impossible avec Master-Detail" },
      { key: "D", text: "Créer un junction object" },
    ],
    answer: "B",
    explanation:
      "L'option 'Allow Reparenting' sur le champ Master-Detail permet de déplacer les enfants entre parents.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-7",
    question: "Pourquoi les governor limits existent dans Salesforce ?",
    options: [
      { key: "A", text: "Empêcher le code inefficace" },
      { key: "B", text: "Protéger l'infrastructure multi-tenant partagée" },
      { key: "C", text: "Licensing" },
      { key: "D", text: "Limiter les accès API non autorisés" },
    ],
    answer: "B",
    explanation:
      "Architecture multi-tenant = milliers d'orgs sur infrastructure partagée. Les governor limits sont des circuit-breakers empêchant un tenant de monopoliser les ressources.",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "dm-8",
    question: "Junction object sharing — quelle règle d'accès ?",
    options: [
      { key: "A", text: "Max 3 Master-Detail" },
      {
        key: "B",
        text: "Accès via le parent avec le plus de droits (higher access wins)",
      },
      { key: "C", text: "Roll-up summaries vers les deux parents" },
      { key: "D", text: "Suppression parent n'affecte pas le junction" },
    ],
    answer: "B",
    explanation:
      "Pour les junction objects, un utilisateur accède au record s'il a accès à L'UN OU L'AUTRE parent (higher access wins).",
    category: "data-model",
    domain: "data-model",
    difficulty: "PD1",
  },
  {
    id: "sc-1",
    question:
      "SCÉNARIO : Before-save flow met Description='Flow Updated', before trigger met Description='Updated'. Quelle valeur finale ?",
    options: [
      { key: "A", text: "'Flow Updated' — le flow tourne en premier" },
      { key: "B", text: "'Updated' — le trigger overwrite le flow" },
      {
        key: "C",
        text: "'Updated' — le before trigger s'exécute après le before-save flow",
      },
      { key: "D", text: "Erreur de conflit" },
    ],
    answer: "C",
    explanation:
      "Ordre : before-save flow → before trigger. Le trigger écrase la valeur du flow sur le même objet en mémoire.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-2",
    question:
      "SCÉNARIO : for(Case c : cases) { c.Status='In Progress'; update c; } avec 10,000 Cases. Que se passe-t-il ?",
    options: [
      { key: "A", text: "10,000 cases updated" },
      { key: "B", text: "150 premiers updates OK, puis LimitException" },
      { key: "C", text: "Échec SOQL 10,000 records" },
      { key: "D", text: "Échec update dans loop" },
    ],
    answer: "B",
    explanation:
      "DML limit = 150 statements. update c dans la boucle = 1 DML par record. À la 151ème, LimitException non-catchable. Fix: collecter dans une List et update une fois.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-3",
    question:
      "SCÉNARIO : Before trigger (Counter+1) + After-save flow (Counter+1) sur Opportunity. Counter=0 initial, un update. Valeur finale ?",
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
      { key: "C", text: "3" },
      { key: "D", text: "0 — erreur" },
    ],
    answer: "B",
    explanation:
      "Before trigger: 0+1=1, save. After-save flow: 1+1=2, DML update. Récursion prevention du flow empêche le re-fire.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-4",
    question:
      "SCÉNARIO : Order fulfilled → ERP notifié en secondes, 500+/min en pic. Meilleure architecture ?",
    options: [
      { key: "A", text: "Flow → Apex callout HTTP direct" },
      { key: "B", text: "Flow → Platform Event → External subscriber" },
      { key: "C", text: "Batch job chaque minute" },
      { key: "D", text: "Workflow Outbound Message" },
    ],
    answer: "B",
    explanation:
      "Platform Events = publish-subscribe découplé et scalable. Le flow publie (pas de callout limit), l'ERP subscribe en near-real-time.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD2",
  },
  {
    id: "sc-5",
    question:
      "SCÉNARIO : Traiter 2M records chaque nuit avec calculs complexes — meilleure implémentation ?",
    options: [
      { key: "A", text: "Scheduled Flow sur tous les records" },
      { key: "B", text: "Batch Apex (Database.Batchable) avec chunks" },
      { key: "C", text: "Autolaunched Flow dans boucle" },
      { key: "D", text: "Chaîner 10,000 Queueable jobs" },
    ],
    answer: "B",
    explanation:
      "Batch Apex = conçu pour le traitement massif. Chaque execute() a ses propres governor limits. QueryLocator supporte 50M records.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-6",
    question:
      "SCÉNARIO : SOQL in loop — for(Account acc : accountList) { contacts = [SELECT...WHERE AccountId=:acc.Id]; } — risque et fix ?",
    options: [
      { key: "A", text: "Données stales → SOSL" },
      { key: "B", text: "100 SOQL limit → query avant loop + Map" },
      { key: "C", text: "Performance → index" },
      { key: "D", text: "NullPointerException → null check" },
    ],
    answer: "B",
    explanation:
      "Anti-pattern #1 testé en PD1. 101+ records = LimitException. Fix : collecter les Ids, une seule query, Map<Id,List<Contact>> pour lookup O(1).",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-7",
    question:
      "SCÉNARIO : Test échoue 'List has no rows for assignment to SObject' en récupérant le Standard Pricebook. Fix ?",
    options: [
      { key: "A", text: "SeeAllData=true" },
      { key: "B", text: "Test.getStandardPricebookId()" },
      { key: "C", text: "Créer Pricebook2 IsStandard=true" },
      { key: "D", text: "Query par Name" },
    ],
    answer: "B",
    explanation:
      "Test.getStandardPricebookId() retourne l'Id du Standard Pricebook en contexte de test sans SeeAllData.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-8",
    question:
      "SCÉNARIO : Lead converti → créer un Task Welcome due date J+7. Meilleure solution ?",
    options: [
      { key: "A", text: "Before-save flow" },
      { key: "B", text: "After-save flow quand IsConverted passe à true" },
      { key: "C", text: "Process Builder" },
      { key: "D", text: "After update trigger" },
    ],
    answer: "B",
    explanation:
      "After-save flow détecte IsConverted true + $Record__Prior false, crée le Task. Déclaratif et maintenable. Flow-first principle.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-9",
    question:
      "SCÉNARIO : Debug log montre 'SOQL_EXECUTE_END|Rows:0' répété. Pas d'erreur mais record jamais créé. Cause probable ?",
    options: [
      { key: "A", text: "Governor limits dépassées" },
      {
        key: "B",
        text: "WHERE clause ne matche aucun record — vérifier valeurs et types",
      },
      { key: "C", text: "Running in System Mode" },
      { key: "D", text: "@future delayed" },
    ],
    answer: "B",
    explanation:
      "Rows:0 = query OK mais 0 résultats. Causes courantes : mauvaise valeur, mauvais type, API name vs label, données absentes en contexte test.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-10",
    question:
      "SCÉNARIO : Batch Apex échoue 'Too many DML statements: 151' dans execute(). Code: for(Case c : scope) { if(Status=='Escalated') update c; }. Fix ?",
    options: [
      { key: "A", text: "Réduire batch size à 50" },
      { key: "B", text: "Collecter dans List, update hors de la boucle" },
      { key: "C", text: "Queueable à la place" },
      { key: "D", text: "try-catch autour du update" },
    ],
    answer: "B",
    explanation:
      "Même dans Batch execute(), la limite de 150 DML statements s'applique. Fix : List<Case> toUpdate, update toUpdate après la boucle.",
    category: "scenario-debugging",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-11",
    question:
      "SCÉNARIO : Queueable vs Future pour : HTTP callout + chaînage second job + suivi de status. Lequel ?",
    options: [
      { key: "A", text: "@future(callout=true)" },
      {
        key: "B",
        text: "Queueable + AllowsCallouts : callouts, chaînage, job ID",
      },
      { key: "C", text: "Batch Apex pour monitoring" },
      { key: "D", text: "Scheduled Apex pour chaînage" },
    ],
    answer: "B",
    explanation:
      "Queueable : (1) AllowsCallouts pour callouts, (2) enqueueJob dans execute() pour chaîner, (3) retourne job ID queryable via AsyncApexJob.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-12",
    question:
      "SCÉNARIO : 500M historical records pour compliance, write-once, query par date. Custom Object à 10M déjà lent. Recommandation ?",
    options: [
      { key: "A", text: "Custom Object + index" },
      { key: "B", text: "Salesforce Connect External Objects" },
      { key: "C", text: "Big Objects avec index sur date" },
      { key: "D", text: "Acheter du stockage" },
    ],
    answer: "C",
    explanation:
      "Big Objects scalent à des milliards de records, write-once, queryables par index. N'impactent pas les performances des objets standard.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD2",
  },
  {
    id: "sc-13",
    question:
      "SCÉNARIO : Un Flow doit récupérer des données commande d'un système externe en temps réel. Approche ?",
    options: [
      {
        key: "A",
        text: "Get Records sur External Object via Salesforce Connect",
      },
      {
        key: "B",
        text: "Apex Action avec @InvocableMethod faisant un HTTP callout",
      },
      { key: "C", text: "HTTP Callout natif dans Flow" },
      { key: "D", text: "Platform Event request-response" },
    ],
    answer: "B",
    explanation:
      "Les Flows ne peuvent pas faire de callouts HTTP nativement. Pattern : @InvocableMethod Apex fait le callout, exposé comme Apex Action dans le Flow.",
    category: "scenario-architecture",
    domain: "scenarios",
    difficulty: "PD1",
  },
  {
    id: "sc-14",
    question:
      "SCÉNARIO : @InvocableMethod pour Flow — quelles exigences ? (3 réponses)",
    options: [
      { key: "A", text: "Annotation @InvocableMethod" },
      { key: "B", text: "Méthode static" },
      { key: "C", text: "Un seul paramètre de type List<>" },
      { key: "D", text: "@AuraEnabled" },
      { key: "E", text: "with sharing" },
      { key: "F", text: "Un seul @InvocableMethod par classe" },
    ],
    answer: ["A", "B", "C"],
    explanation:
      "@InvocableMethod : (A) annotation requise, (B) must be static, (C) un seul paramètre List<>. (F) aussi vrai mais la question demande 3.",
    category: "flows",
    domain: "flows",
    difficulty: "PD1",
    multiSelect: true,
  },
];
