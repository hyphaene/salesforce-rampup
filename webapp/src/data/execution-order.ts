export interface ExecutionStep {
  id: string;
  order: number;
  name: string;
  description: string;
  category: "validation" | "trigger" | "automation" | "commit" | "post-commit";
  examTip: string;
  canModifyRecord: boolean;
  isRerunnable: boolean;
}

export const executionSteps: ExecutionStep[] = [
  {
    id: "load-record",
    order: 1,
    name: "Loads record from DB",
    description:
      "Salesforce charge le record existant depuis la base de données (pour un update/delete), ou initialise un nouveau record vide (pour un insert). À ce stade, aucune des nouvelles valeurs de la requête n'est encore appliquée. Le système prépare simplement l'état initial du record en mémoire.",
    category: "validation",
    examTip:
      "Cette étape est souvent ignorée dans les questions d'examen. Retiens qu'elle existe avant TOUTE logique — même avant les flows ou triggers.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "load-field-values",
    order: 2,
    name: "Loads field values from request",
    description:
      "Les nouvelles valeurs envoyées dans la requête DML (insert/update) sont mergées avec le record chargé. Les formules et les champs par défaut sont recalculés à ce stade. Pour un insert, les valeurs par défaut des champs sont appliquées ici.",
    category: "validation",
    examTip:
      "Les valeurs par défaut des champs (Default Field Values) sont appliquées ici, AVANT les flows et triggers. Un before trigger qui lit un champ avec valeur par défaut obtiendra bien cette valeur.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "system-validation",
    order: 3,
    name: "System validation",
    description:
      "Salesforce effectue les validations système : champs requis (Required Fields), formats de champs (email, URL, numéro de téléphone), longueur maximale, et unicité des External IDs. Ces validations sont non-contournables — elles précèdent même les flows et triggers.",
    category: "validation",
    examTip:
      "La validation système s'exécute AVANT les before-save flows et les before triggers. Si un required field est manquant, l'exécution s'arrête ici. Contrairement aux Validation Rules custom (étape 6), ceci ne peut pas être désactivé.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "before-save-flows",
    order: 4,
    name: "Before-save record-triggered flows",
    description:
      "Les Record-Triggered Flows configurés pour s'exécuter 'Before the record is saved' s'exécutent ici. C'est une addition récente (Winter '20) qui permet de modifier le record AVANT qu'il soit sauvegardé, sans DML explicite. Ces flows s'exécutent AVANT les Apex before triggers et peuvent modifier les champs du record en cours.",
    category: "automation",
    examTip:
      "Piège classique : les before-save flows s'exécutent AVANT les before triggers Apex — l'inverse de ce qu'on pourrait intuiter. Un before-save flow qui modifie un champ : ce changement sera visible dans le before trigger. Ils ne consomment pas de DML statements.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "before-triggers",
    order: 5,
    name: "Before triggers",
    description:
      "Les Apex triggers configurés en 'before insert', 'before update', ou 'before delete' s'exécutent ici. Ils ont accès au record en mémoire avant la sauvegarde et peuvent le modifier directement via `Trigger.new` sans DML. C'est l'endroit idéal pour les validations complexes et la normalisation de données.",
    category: "trigger",
    examTip:
      "Dans un before trigger, tu modifies `Trigger.new` directement (pas de update() DML nécessaire). Dans un after trigger, le record est read-only — tu dois faire un update() DML séparé. Ne pas confondre !",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "custom-validation-rules",
    order: 6,
    name: "Custom validation rules",
    description:
      "Les Validation Rules, Duplicate Rules et Unique Rules définies dans Setup s'exécutent. Si une règle de validation retourne true (condition d'erreur vérifiée), une DMLException est levée et la transaction s'arrête. Les Duplicate Rules peuvent bloquer ou signaler les doublons selon leur configuration.",
    category: "validation",
    examTip:
      "Les Validation Rules s'exécutent APRÈS les before triggers. Un before trigger peut donc modifier le record pour satisfaire une validation rule. Attention : si un Workflow Field Update re-trigger le cycle, les validation rules NE s'exécutent PAS à nouveau (contrairement aux before/after triggers).",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "record-saved",
    order: 7,
    name: "Record saved to DB (not committed)",
    description:
      "Le record est écrit dans la base de données, mais la transaction n'est PAS encore commitée. L'enregistrement a maintenant un ID (pour un insert) et est visible dans la même transaction, mais pas encore en dehors. C'est à partir de ce point que les after triggers peuvent lire les données mises à jour.",
    category: "commit",
    examTip:
      "Le record est 'saved' mais pas 'committed'. Les after triggers voient le nouvel ID (pour un insert). Si la transaction échoue après ce point, ce write est annulé. Ne pas confondre 'saved' avec 'committed' — le commit final est à l'étape 19.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "after-triggers",
    order: 8,
    name: "After triggers",
    description:
      "Les Apex triggers 'after insert', 'after update', 'after delete', et 'after undelete' s'exécutent. Le record est maintenant read-only via `Trigger.new`, mais tu peux accéder à l'ID nouvellement créé (pour insert). Pour modifier le record, un DML séparé est nécessaire (attention aux boucles récursives).",
    category: "trigger",
    examTip:
      "Les after triggers peuvent déclencher d'autres DML, ce qui peut créer des boucles récursives. Pattern classique : utiliser une variable statique booléenne pour empêcher la récursion. Aussi : `Trigger.newMap` et `Trigger.oldMap` sont disponibles uniquement dans les after triggers (pas dans before delete).",
    canModifyRecord: false,
    isRerunnable: true,
  },
  {
    id: "assignment-rules",
    order: 9,
    name: "Assignment rules",
    description:
      "Les règles d'attribution (Assignment Rules) pour les Leads et Cases sont évaluées. Si une règle correspond, le champ OwnerId est mis à jour automatiquement. Ces règles ne s'appliquent qu'aux objets Lead et Case, et uniquement si `AssignmentRule` est activé dans la requête DML.",
    category: "automation",
    examTip:
      "Les assignment rules ne s'appliquent QU'AUX Leads et Cases. Pour qu'elles s'exécutent via Apex, il faut explicitement activer la DmlOption `assignmentRuleHeader`. Par défaut (UI), elles sont actives. Via Apex, elles sont désactivées par défaut.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "auto-response-rules",
    order: 10,
    name: "Auto-response rules",
    description:
      "Les règles de réponse automatique (Auto-Response Rules) pour les Leads et Cases sont évaluées. Si une règle correspond, un email de confirmation est planifié pour envoi. L'email n'est pas envoyé immédiatement — il fait partie du post-commit (étape 20).",
    category: "automation",
    examTip:
      "Les auto-response rules s'appliquent uniquement aux Leads (Web-to-Lead) et Cases (Web-to-Case). L'email n'est envoyé qu'au commit de la transaction. Si la transaction échoue, aucun email n'est envoyé.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "workflow-rules",
    order: 11,
    name: "Workflow rules",
    description:
      "Les Workflow Rules (fonctionnalité legacy, remplacée par les Flows) sont évaluées. Chaque rule qui correspond peut déclencher : des Field Updates, des Tasks, des Email Alerts, ou des Outbound Messages. Les Workflow Rules sont dépréciées depuis Winter '23 mais toujours fonctionnelles.",
    category: "automation",
    examTip:
      "Les Workflow Rules sont legacy mais apparaissent encore aux examens ! Elles s'exécutent APRÈS les after triggers (pas avant). Si plusieurs field updates sont définis, ils s'exécutent tous en même temps, puis re-trigger les before/after triggers UNE SEULE FOIS.",
    canModifyRecord: true,
    isRerunnable: true,
  },
  {
    id: "workflow-field-updates",
    order: 12,
    name: "Workflow field updates (re-trigger)",
    description:
      "Si des Workflow Field Updates ont modifié le record, les étapes 5 (before triggers) et 8 (after triggers) sont RE-DÉCLENCHÉES une seule fois. ATTENTION : les Validation Rules (étape 6) ne sont PAS re-exécutées. C'est un comportement asymétrique important. Cette boucle ne peut se produire QU'UNE SEULE FOIS — pas de boucle infinie possible avec les Workflows.",
    category: "automation",
    examTip:
      "C'est LE piège classique des examens Salesforce : après un Workflow Field Update, les before/after triggers se ré-exécutent MAIS PAS les Validation Rules. De plus, cette re-exécution n'arrive QU'UNE SEULE FOIS — si le re-trigger déclenche d'autres workflow field updates, ils ne re-triggent pas une deuxième fois.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "after-save-flows",
    order: 13,
    name: "After-save record-triggered flows",
    description:
      "Les Record-Triggered Flows configurés pour s'exécuter 'After the record is saved' s'exécutent ici. Contrairement aux before-save flows (étape 4), ils s'exécutent après la sauvegarde du record et peuvent effectuer des DML sur d'autres records. Ils ont accès aux valeurs finales du record sauvegardé.",
    category: "automation",
    examTip:
      "Les after-save flows peuvent faire des DML sur d'autres objets (contrairement aux before-save flows). Mais si un after-save flow met à jour le record lui-même, ça déclenche l'étape 14 (re-trigger partiel). À ne pas confondre avec les before-save flows qui modifient le record directement sans DML.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "after-save-flow-field-updates",
    order: 14,
    name: "After-save flow field updates (re-trigger)",
    description:
      "Si un after-save flow a modifié le record (via un Update Records sur l'objet en cours), les before/after triggers sont re-déclenchés. MAIS les flows eux-mêmes ne sont PAS re-exécutés (pour éviter les boucles infinies). Ce comportement est similaire aux Workflow Field Updates mais spécifique aux flows.",
    category: "automation",
    examTip:
      "Si un after-save flow fait un Update Records sur le record déclencheur : les triggers se ré-exécutent, mais les flows ne se ré-exécutent pas. C'est la principale différence avec les Workflow Field Updates où aussi les triggers se ré-exécutent mais pas les validations.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "entitlement-rules",
    order: 15,
    name: "Entitlement rules",
    description:
      "Les Entitlement Rules (règles d'habilitation pour les Service Contracts et Cases) sont évaluées. Elles gèrent les milestones et les SLAs. Cette étape ne concerne que les organisations avec le module Service Cloud activé.",
    category: "automation",
    examTip:
      "Les Entitlement Rules apparaissent rarement aux examens Developer mais sont présentes dans l'order of execution officiel. Retiens simplement leur position : après les flows, avant les roll-up summaries.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "rollup-summary",
    order: 16,
    name: "Roll-up summary fields",
    description:
      "Les champs Roll-Up Summary (COUNT, SUM, MIN, MAX) sur les objets Master dans une relation Master-Detail sont recalculés. Cette recalcul peut déclencher une mise à jour sur le record parent, ce qui peut à son tour déclencher l'order of execution sur le parent.",
    category: "automation",
    examTip:
      "Un Roll-Up Summary sur le parent peut déclencher l'order of execution complet sur le PARENT ! C'est un vecteur classique de comportement inattendu en bulk. Si l'objet parent a des triggers ou des flows, ils s'exécuteront lors de ce recalcul.",
    canModifyRecord: true,
    isRerunnable: false,
  },
  {
    id: "cross-object-formulas",
    order: 17,
    name: "Cross-object formula fields",
    description:
      "Les champs de formule qui référencent des champs sur des objets parents (cross-object formulas avec la notation __ via __r) sont recalculés. Ces recalculs propagent les changements de valeurs à travers les relations.",
    category: "automation",
    examTip:
      "Les cross-object formulas se recalculent APRÈS les roll-up summaries. Si une formule dépend d'un roll-up summary sur un parent, elle verra la valeur mise à jour du roll-up. L'ordre entre ces deux étapes est souvent testé.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "sharing-rules",
    order: 18,
    name: "Criteria-based sharing",
    description:
      "Les règles de partage basées sur des critères (Criteria-Based Sharing Rules) sont réévaluées. Si les valeurs du record ont changé et qu'elles affectent les critères d'une sharing rule, les partages sont mis à jour. Cela inclut aussi le recalcul du Owner-Based Sharing.",
    category: "automation",
    examTip:
      "Le recalcul des sharing rules est asynchrone dans certains cas pour les bulk operations. Pour les examens, retiens qu'il s'exécute AVANT le commit final. Les Manual Sharing (partagés manuellement) ne sont PAS réévalués ici.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "dml-commit",
    order: 19,
    name: "DML commit",
    description:
      "La transaction est finalement commitée en base de données. Tous les changements effectués depuis l'étape 7 (saved) sont maintenant permanents et visibles par d'autres transactions. Si une exception est levée après ce point, les données sont déjà commitées.",
    category: "commit",
    examTip:
      "C'est ici que la transaction devient permanente. AVANT ce point, un rollback (savepoint) peut annuler tous les changements. APRÈS ce point, seule une nouvelle transaction peut corriger les données. Les emails et @future calls attendent ce commit pour s'exécuter.",
    canModifyRecord: false,
    isRerunnable: false,
  },
  {
    id: "post-commit",
    order: 20,
    name: "Post-commit logic",
    description:
      "Après le commit, les opérations asynchrones et externes s'exécutent : les emails (Email Alerts, auto-response emails) sont réellement envoyés, les @future methods sont mis en queue pour exécution asynchrone, les Platform Events sont publiés (Publish After Commit), et les Outbound Messages sont envoyés. Ces opérations ne peuvent pas être rollbackées.",
    category: "post-commit",
    examTip:
      "Les @future methods s'exécutent APRÈS le commit — jamais dans la même transaction. Un @future appelé depuis un before trigger s'exécutera seulement après que la transaction principale soit commitée. Les Platform Events en mode 'Publish After Commit' sont publiés ici (vs 'Publish Immediately' qui publie avant le commit).",
    canModifyRecord: false,
    isRerunnable: false,
  },
];

export const categoryLabels: Record<ExecutionStep["category"], string> = {
  validation: "Validation",
  trigger: "Trigger Apex",
  automation: "Automation",
  commit: "Commit",
  "post-commit": "Post-Commit",
};

export const categoryColors: Record<
  ExecutionStep["category"],
  { bg: string; border: string; text: string; badge: string }
> = {
  validation: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  trigger: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  automation: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  commit: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  "post-commit": {
    bg: "bg-gray-50 dark:bg-gray-900/50",
    border: "border-gray-200 dark:border-gray-700",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
};

export const quizQuestions: Array<{
  question: string;
  correctStepId: string;
  options: string[];
}> = [
  {
    question:
      "À quelle étape les before-save Record-Triggered Flows s'exécutent-ils ?",
    correctStepId: "before-save-flows",
    options: [
      "before-triggers",
      "before-save-flows",
      "after-save-flows",
      "workflow-rules",
    ],
  },
  {
    question:
      "Après un Workflow Field Update, quelles étapes sont RE-déclenchées ?",
    correctStepId: "workflow-field-updates",
    options: [
      "workflow-field-updates",
      "custom-validation-rules",
      "after-save-flows",
      "dml-commit",
    ],
  },
  {
    question: "À quelle étape le record reçoit-il son ID (pour un insert) ?",
    correctStepId: "record-saved",
    options: ["load-record", "before-triggers", "record-saved", "dml-commit"],
  },
  {
    question:
      "À quelle étape les emails (Email Alerts) sont-ils réellement envoyés ?",
    correctStepId: "post-commit",
    options: [
      "auto-response-rules",
      "workflow-rules",
      "dml-commit",
      "post-commit",
    ],
  },
  {
    question:
      "Dans quel ordre s'exécutent les before-save flows et les before triggers ?",
    correctStepId: "before-save-flows",
    options: [
      "before-triggers",
      "before-save-flows",
      "custom-validation-rules",
      "system-validation",
    ],
  },
];
