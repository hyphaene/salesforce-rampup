export interface GovernorLimit {
  id: string;
  name: string;
  syncLimit: number;
  asyncLimit: number;
  unit: string;
  description: string;
}

export interface LimitScenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  badCode: string;
  goodCode: string;
  explanation: string;
  triggerRecords: number;
  limitsConsumed: {
    limitId: string;
    perRecord: number;
    formula: string;
  }[];
  limitsFixed: {
    limitId: string;
    total: number;
    formula: string;
  }[];
}

export const governorLimits: GovernorLimit[] = [
  {
    id: "soql-queries",
    name: "SOQL Queries",
    syncLimit: 100,
    asyncLimit: 200,
    unit: "queries",
    description:
      "Nombre total de requêtes SOQL pouvant être émises dans une seule transaction.",
  },
  {
    id: "soql-rows",
    name: "SOQL Rows Retrieved",
    syncLimit: 50000,
    asyncLimit: 50000,
    unit: "rows",
    description:
      "Nombre total de lignes pouvant être retournées par toutes les requêtes SOQL combinées.",
  },
  {
    id: "dml-statements",
    name: "DML Statements",
    syncLimit: 150,
    asyncLimit: 150,
    unit: "statements",
    description:
      "Nombre total d'opérations DML (insert, update, delete, upsert, undelete, merge) dans une transaction.",
  },
  {
    id: "dml-rows",
    name: "DML Rows",
    syncLimit: 10000,
    asyncLimit: 10000,
    unit: "rows",
    description:
      "Nombre total de lignes pouvant être traitées par toutes les opérations DML combinées.",
  },
  {
    id: "cpu-time",
    name: "CPU Time",
    syncLimit: 10000,
    asyncLimit: 60000,
    unit: "ms",
    description:
      "Temps CPU total consommé par le code Apex (hors temps d'attente I/O).",
  },
  {
    id: "heap-size",
    name: "Heap Size",
    syncLimit: 6000000,
    asyncLimit: 12000000,
    unit: "bytes",
    description:
      "Mémoire totale utilisée par les variables et objets dans la transaction Apex.",
  },
  {
    id: "sosl-queries",
    name: "SOSL Queries",
    syncLimit: 20,
    asyncLimit: 20,
    unit: "queries",
    description:
      "Nombre de requêtes SOSL (Salesforce Object Search Language) dans une transaction.",
  },
  {
    id: "callouts",
    name: "Callouts (HTTP/Web Services)",
    syncLimit: 100,
    asyncLimit: 100,
    unit: "callouts",
    description:
      "Nombre d'appels HTTP ou Web Services vers des systèmes externes.",
  },
  {
    id: "future-calls",
    name: "Future Method Calls",
    syncLimit: 50,
    asyncLimit: 0,
    unit: "calls",
    description:
      "Nombre d'invocations de méthodes @future dans une seule transaction (0 depuis async).",
  },
  {
    id: "queueable-jobs",
    name: "Queueable Jobs Queued",
    syncLimit: 50,
    asyncLimit: 1,
    unit: "jobs",
    description:
      "Nombre de jobs Queueable pouvant être enfilés dans une transaction.",
  },
  {
    id: "email-invocations",
    name: "Email Invocations",
    syncLimit: 10,
    asyncLimit: 10,
    unit: "invocations",
    description:
      "Nombre d'appels à Messaging.sendEmail() dans une transaction.",
  },
  {
    id: "describe-calls",
    name: "Describe Calls",
    syncLimit: 100,
    asyncLimit: 100,
    unit: "calls",
    description: "Nombre d'appels à Schema.describeSObjects() ou équivalents.",
  },
];

export const limitScenarios: LimitScenario[] = [
  {
    id: "soql-in-loop",
    title: "SOQL dans une boucle (N+1)",
    description:
      "Une requête SOQL est exécutée à l'intérieur d'une boucle for, générant N requêtes pour N records.",
    difficulty: "beginner",
    triggerRecords: 200,
    badCode: `// MAUVAIS : SOQL dans une boucle
trigger AccountTrigger on Account (before insert) {
    for (Account acc : Trigger.new) {
        // 1 SOQL par record = LimitException à 101 records !
        List<Contact> contacts = [
            SELECT Id, Name
            FROM Contact
            WHERE AccountId = :acc.Id
        ];
        // traitement...
    }
}`,
    goodCode: `// BON : Bulk SOQL hors de la boucle
trigger AccountTrigger on Account (before insert) {
    // Collecter tous les IDs
    Set<Id> accountIds = new Map<Id, Account>(Trigger.new).keySet();

    // 1 seule SOQL pour tous les records
    Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
    for (Contact c : [SELECT Id, Name, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
        if (!contactsByAccount.containsKey(c.AccountId)) {
            contactsByAccount.put(c.AccountId, new List<Contact>());
        }
        contactsByAccount.get(c.AccountId).add(c);
    }

    for (Account acc : Trigger.new) {
        List<Contact> contacts = contactsByAccount.get(acc.Id) ?? new List<Contact>();
        // traitement...
    }
}`,
    explanation: `## Problème : SOQL N+1

Chaque itération de boucle émet une nouvelle requête SOQL. Avec 100 records, tu atteins immédiatement la limite de 100 SOQL en sync.

**Règle d'or** : "Never put SOQL inside a loop."

## Solution : Bulk SOQL

1. Collecter tous les IDs avant la boucle
2. Exécuter **une seule** requête avec \`IN :setOfIds\`
3. Construire une Map pour accès O(1) dans la boucle`,
    limitsConsumed: [
      {
        limitId: "soql-queries",
        perRecord: 1,
        formula: "1 SOQL × {n} records = {n} SOQL",
      },
    ],
    limitsFixed: [
      {
        limitId: "soql-queries",
        total: 1,
        formula: "1 SOQL pour tous les records",
      },
    ],
  },
  {
    id: "dml-in-loop",
    title: "DML dans une boucle",
    description:
      "Une opération DML (insert/update) est exécutée à chaque itération, explosant la limite de 150 statements.",
    difficulty: "beginner",
    triggerRecords: 200,
    badCode: `// MAUVAIS : DML dans une boucle
trigger LeadTrigger on Lead (after insert) {
    for (Lead lead : Trigger.new) {
        Task t = new Task(
            Subject = 'Follow up',
            WhoId = lead.Id,
            Status = 'Not Started'
        );
        insert t; // 1 DML par record !
    }
}`,
    goodCode: `// BON : Bulk DML avec une liste
trigger LeadTrigger on Lead (after insert) {
    List<Task> tasksToInsert = new List<Task>();

    for (Lead lead : Trigger.new) {
        tasksToInsert.add(new Task(
            Subject = 'Follow up',
            WhoId = lead.Id,
            Status = 'Not Started'
        ));
    }

    if (!tasksToInsert.isEmpty()) {
        insert tasksToInsert; // 1 seul DML pour tous !
    }
}`,
    explanation: `## Problème : DML N+1

Chaque \`insert\` / \`update\` dans une boucle compte comme 1 DML statement. La limite est 150 par transaction.

## Solution : Collect & Bulk

1. Accumuler tous les records dans une \`List<SObject>\`
2. Exécuter **un seul** \`insert/update\` à la fin

**Bonus** : Cette approche est aussi bien plus performante (moins d'I/O).`,
    limitsConsumed: [
      {
        limitId: "dml-statements",
        perRecord: 1,
        formula: "1 DML × {n} records = {n} DML",
      },
      {
        limitId: "dml-rows",
        perRecord: 1,
        formula: "1 row × {n} records = {n} rows",
      },
    ],
    limitsFixed: [
      {
        limitId: "dml-statements",
        total: 1,
        formula: "1 DML statement pour tous les records",
      },
      {
        limitId: "dml-rows",
        total: 1,
        formula: "{n} rows en 1 seul DML",
      },
    ],
  },
  {
    id: "unbulkified-trigger",
    title: "Trigger non-bulkifié (SOQL + DML)",
    description:
      "Un trigger qui fait à la fois SOQL et DML dans des boucles — le cas le plus courant en code legacy.",
    difficulty: "intermediate",
    triggerRecords: 150,
    badCode: `// MAUVAIS : Double problème SOQL + DML en boucle
trigger OpportunityTrigger on Opportunity (after update) {
    for (Opportunity opp : Trigger.new) {
        if (opp.StageName == 'Closed Won') {
            // SOQL dans la boucle
            Account acc = [SELECT Id, Type FROM Account WHERE Id = :opp.AccountId];

            if (acc.Type != 'Customer') {
                acc.Type = 'Customer';
                update acc; // DML dans la boucle
            }
        }
    }
}`,
    goodCode: `// BON : Bulk SOQL + DML
trigger OpportunityTrigger on Opportunity (after update) {
    Set<Id> accountIds = new Set<Id>();

    for (Opportunity opp : Trigger.new) {
        if (opp.StageName == 'Closed Won') {
            accountIds.add(opp.AccountId);
        }
    }

    if (accountIds.isEmpty()) return;

    // 1 seule SOQL
    Map<Id, Account> accountMap = new Map<Id, Account>(
        [SELECT Id, Type FROM Account WHERE Id IN :accountIds]
    );

    List<Account> accountsToUpdate = new List<Account>();
    for (Opportunity opp : Trigger.new) {
        if (opp.StageName == 'Closed Won') {
            Account acc = accountMap.get(opp.AccountId);
            if (acc != null && acc.Type != 'Customer') {
                acc.Type = 'Customer';
                accountsToUpdate.add(acc);
            }
        }
    }

    if (!accountsToUpdate.isEmpty()) {
        update accountsToUpdate; // 1 seul DML
    }
}`,
    explanation: `## Double problème

Ce trigger cumule les deux anti-patterns :
- **SOQL dans la boucle** : 1 requête par opportunity
- **DML dans la boucle** : 1 update par compte

Avec 100 opportunities, on atteint 100 SOQL + jusqu'à 100 DML.

## Pattern de correction

1. **Phase collect** : extraire tous les IDs nécessaires
2. **Phase fetch** : 1 SOQL avec \`IN :set\`
3. **Phase process** : travailler avec des Maps en mémoire
4. **Phase commit** : 1 DML à la fin`,
    limitsConsumed: [
      {
        limitId: "soql-queries",
        perRecord: 1,
        formula: "1 SOQL × {n} records = {n} SOQL",
      },
      {
        limitId: "dml-statements",
        perRecord: 1,
        formula: "1 DML × {n} records = {n} DML",
      },
    ],
    limitsFixed: [
      {
        limitId: "soql-queries",
        total: 1,
        formula: "1 SOQL pour tous les records",
      },
      {
        limitId: "dml-statements",
        total: 1,
        formula: "1 DML pour tous les records",
      },
    ],
  },
  {
    id: "callout-from-trigger",
    title: "Callout depuis un trigger synchrone",
    description:
      "Impossible d'appeler un système externe directement depuis un trigger — les callouts sont interdits en contexte synchrone.",
    difficulty: "intermediate",
    triggerRecords: 1,
    badCode: `// MAUVAIS : Callout direct depuis un trigger
trigger ContactTrigger on Contact (after insert) {
    for (Contact c : Trigger.new) {
        // ERREUR : System.CalloutException
        // "You have uncommitted work pending. Please commit or rollback before calling out"
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.example.com/contacts');
        req.setMethod('POST');
        req.setBody(JSON.serialize(c));
        HttpResponse res = http.send(req);
    }
}`,
    goodCode: `// BON : Callout via @future ou Queueable
trigger ContactTrigger on Contact (after insert) {
    // Collecter les IDs, déléguer à une méthode async
    Set<Id> contactIds = new Map<Id, Contact>(Trigger.new).keySet();
    ContactCalloutService.sendToExternalSystem(contactIds);
}

// Dans une classe séparée
public class ContactCalloutService {
    @future(callout=true) // Async = callouts autorisés
    public static void sendToExternalSystem(Set<Id> contactIds) {
        List<Contact> contacts = [SELECT Id, Name, Email FROM Contact WHERE Id IN :contactIds];

        for (Contact c : contacts) {
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.example.com/contacts');
            req.setMethod('POST');
            req.setBody(JSON.serialize(c));
            HttpResponse res = http.send(req);
            // Traiter la réponse...
        }
    }
}`,
    explanation: `## Pourquoi les callouts sont interdits dans les triggers

Salesforce maintient une transaction ouverte pendant l'exécution d'un trigger. Un callout HTTP pendant une transaction ouverte poserait des problèmes de cohérence (que faire si le callout réussit mais que la transaction rollback ?).

## Solutions

1. **@future(callout=true)** : Simple, mais limité à des paramètres primitifs/Set\<Id\>
2. **Queueable** : Plus puissant, peut passer des objets complexes, chaînable
3. **Platform Events** : Pour des architectures event-driven

> La limite de **50 @future calls** par transaction s'applique — ne pas appeler @future dans une boucle non plus !`,
    limitsConsumed: [
      {
        limitId: "callouts",
        perRecord: 1,
        formula:
          "1 callout × {n} records = {n} callouts (+ exception immédiate en sync)",
      },
    ],
    limitsFixed: [
      {
        limitId: "future-calls",
        total: 1,
        formula: "1 @future call pour déléguer le traitement",
      },
      {
        limitId: "callouts",
        total: 1,
        formula: "1 callout HTTP dans le contexte async",
      },
    ],
  },
  {
    id: "heap-overflow",
    title: "Heap Overflow avec grosse collection",
    description:
      "Stocker trop de données en mémoire dans la transaction dépasse le heap limit de 6MB (sync).",
    difficulty: "intermediate",
    triggerRecords: 100,
    badCode: `// MAUVAIS : Charge tous les champs de milliers de records
public class ReportGenerator {
    public static void generateReport() {
        // Récupère TOUS les champs de TOUS les contacts
        // Si 50,000 contacts avec des champs texte longs...
        List<Contact> allContacts = [
            SELECT Id, Name, Email, Phone, MailingStreet,
                   MailingCity, Description, OtherPhone,
                   Department, Title
            FROM Contact
            LIMIT 50000
        ];

        // Stocke tout en mémoire simultanément
        Map<String, List<Contact>> byDepartment = new Map<String, List<Contact>>();
        for (Contact c : allContacts) {
            String dept = c.Department ?? 'Unknown';
            if (!byDepartment.containsKey(dept)) {
                byDepartment.put(dept, new List<Contact>());
            }
            byDepartment.get(dept).add(c);
        }

        // Traitement... mais déjà 6MB dépassés !
    }
}`,
    goodCode: `// BON : Sélectionner uniquement les champs nécessaires + traitement par batch
public class ReportGeneratorBatch implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        // Uniquement les champs nécessaires
        return Database.getQueryLocator(
            'SELECT Id, Name, Department FROM Contact'
        );
    }

    public void execute(Database.BatchableContext bc, List<Contact> scope) {
        // Scope = 200 records max par défaut
        // Heap reset à chaque execute()
        Map<String, Integer> countByDept = new Map<String, Integer>();
        for (Contact c : scope) {
            String dept = c.Department ?? 'Unknown';
            countByDept.put(dept, (countByDept.get(dept) ?? 0) + 1);
        }
        // Sauvegarder les résultats partiels...
    }

    public void finish(Database.BatchableContext bc) {
        // Consolidation finale
    }
}`,
    explanation: `## Heap Size : 6MB sync, 12MB async

Le heap Apex compte tout : les variables locales, les listes, les maps, les strings.

**Problèmes courants** :
- \`SELECT *\` (ou trop de champs) sur de grandes collections
- Stocker les résultats de plusieurs requêtes SOQL en même temps
- Concatenation de strings dans une boucle (utiliser \`String.join()\`)

## Stratégies

1. **SELECT minimal** : Sélectionner uniquement les champs nécessaires
2. **Batch Apex** : Le heap est reset à chaque \`execute()\`
3. **Traitement streaming** : Ne pas stocker ce dont on n'a plus besoin`,
    limitsConsumed: [
      {
        limitId: "heap-size",
        perRecord: 1000,
        formula: "~1KB × {n} records = ~{n}KB de heap",
      },
      {
        limitId: "soql-rows",
        perRecord: 1,
        formula: "1 row × {n} records = {n} rows SOQL",
      },
    ],
    limitsFixed: [
      {
        limitId: "heap-size",
        total: 200000,
        formula: "~200KB max par batch execute (200 records × 1KB)",
      },
    ],
  },
  {
    id: "too-many-futures",
    title: "Trop de @future dans une transaction",
    description:
      "Chaque appel @future depuis un trigger compte dans la limite de 50 future calls par transaction.",
    difficulty: "intermediate",
    triggerRecords: 60,
    badCode: `// MAUVAIS : @future dans une boucle = 1 call par record
trigger AccountTrigger on Account (after insert) {
    for (Account acc : Trigger.new) {
        // 1 future call par record !
        // À 51 records → LimitException
        SyncService.syncToERP(acc.Id);
    }
}

public class SyncService {
    @future(callout=true)
    public static void syncToERP(Id accountId) {
        Account acc = [SELECT Id, Name FROM Account WHERE Id = :accountId];
        // HTTP callout...
    }
}`,
    goodCode: `// BON : 1 seul @future avec une collection d'IDs
trigger AccountTrigger on Account (after insert) {
    Set<Id> accountIds = new Map<Id, Account>(Trigger.new).keySet();
    SyncService.syncToERP(accountIds);
}

public class SyncService {
    @future(callout=true)
    public static void syncToERP(Set<Id> accountIds) {
        // 1 seul future call pour tous les records
        List<Account> accounts = [SELECT Id, Name, Phone FROM Account WHERE Id IN :accountIds];

        for (Account acc : accounts) {
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://erp.example.com/accounts/' + acc.Id);
            req.setMethod('PUT');
            req.setBody(JSON.serialize(acc));
            http.send(req);
        }
    }
}`,
    explanation: `## Limite : 50 @future calls par transaction

Les méthodes \`@future\` sont **asynchrones** mais comptent immédiatement dans les governor limits de la transaction qui les déclenche.

**Autre contrainte** : Les méthodes @future ne peuvent recevoir que des types primitifs ou des collections de primitifs (\`Set<Id>\` est autorisé, mais pas \`List<SObject>\`).

## Alternative : Queueable

\`\`\`apex
// Queueable peut recevoir n'importe quel type
public class SyncQueueable implements Queueable, Database.AllowsCallouts {
    private Set<Id> accountIds;
    public SyncQueueable(Set<Id> ids) { this.accountIds = ids; }
    public void execute(QueueableContext ctx) { /* ... */ }
}
System.enqueueJob(new SyncQueueable(accountIds));
\`\`\``,
    limitsConsumed: [
      {
        limitId: "future-calls",
        perRecord: 1,
        formula: "1 @future × {n} records = {n} future calls",
      },
    ],
    limitsFixed: [
      {
        limitId: "future-calls",
        total: 1,
        formula: "1 seul @future pour tous les records",
      },
    ],
  },
  {
    id: "nested-loops-soql",
    title: "Nested loops avec SOQL",
    description:
      "Des boucles imbriquées avec requêtes SOQL génèrent N×M requêtes — explosion exponentielle.",
    difficulty: "advanced",
    triggerRecords: 50,
    badCode: `// MAUVAIS : O(n²) SOQL queries
public class OrderProcessor {
    public static void processOrders(List<Order> orders) {
        for (Order order : orders) {
            // SOQL #1 par order
            List<OrderItem> items = [
                SELECT Id, Product2Id, Quantity
                FROM OrderItem
                WHERE OrderId = :order.Id
            ];

            for (OrderItem item : items) {
                // SOQL #2 par item (n × m queries !)
                Product2 product = [
                    SELECT Id, Name, ProductCode
                    FROM Product2
                    WHERE Id = :item.Product2Id
                ];
                // traitement...
            }
        }
    }
}`,
    goodCode: `// BON : 2 SOQL pour tout traiter
public class OrderProcessor {
    public static void processOrders(List<Order> orders) {
        Set<Id> orderIds = new Map<Id, Order>(orders).keySet();

        // 1 SOQL pour tous les items
        Map<Id, List<OrderItem>> itemsByOrder = new Map<Id, List<OrderItem>>();
        Set<Id> productIds = new Set<Id>();

        for (OrderItem item : [SELECT Id, OrderId, Product2Id, Quantity FROM OrderItem WHERE OrderId IN :orderIds]) {
            if (!itemsByOrder.containsKey(item.OrderId)) {
                itemsByOrder.put(item.OrderId, new List<OrderItem>());
            }
            itemsByOrder.get(item.OrderId).add(item);
            productIds.add(item.Product2Id);
        }

        // 1 SOQL pour tous les produits
        Map<Id, Product2> productMap = new Map<Id, Product2>(
            [SELECT Id, Name, ProductCode FROM Product2 WHERE Id IN :productIds]
        );

        // Traitement en mémoire uniquement
        for (Order order : orders) {
            for (OrderItem item : itemsByOrder.get(order.Id) ?? new List<OrderItem>()) {
                Product2 product = productMap.get(item.Product2Id);
                // traitement O(1)
            }
        }
    }
}`,
    explanation: `## Complexité SOQL O(n²)

Avec 10 orders et 20 items chacun :
- **Bad code** : 10 + (10 × 20) = 210 SOQL queries
- **Good code** : 2 SOQL queries

## Pattern "Collect → Fetch → Map → Process"

1. **Collect** : Rassembler tous les IDs nécessaires en un seul passage
2. **Fetch** : Exécuter toutes les SOQL d'un coup avec \`IN\`
3. **Map** : Construire des Maps pour accès O(1)
4. **Process** : Logique purement en mémoire`,
    limitsConsumed: [
      {
        limitId: "soql-queries",
        perRecord: 3,
        formula: "1 SOQL + 2 SOQL/item × {n} records ≈ {n}×3 SOQL",
      },
    ],
    limitsFixed: [
      {
        limitId: "soql-queries",
        total: 2,
        formula: "2 SOQL pour tout traiter",
      },
    ],
  },
  {
    id: "update-one-by-one",
    title: "Update records un par un vs bulk",
    description:
      "Mettre à jour des records individuellement dans une boucle vs une seule opération bulk.",
    difficulty: "beginner",
    triggerRecords: 200,
    badCode: `// MAUVAIS : Update un par un
public class PriceUpdater {
    public static void applyDiscount(List<Product2> products, Decimal discountRate) {
        for (Product2 p : products) {
            p.UnitPrice__c = p.UnitPrice__c * (1 - discountRate);
            update p; // 1 DML par product !
        }
    }
}`,
    goodCode: `// BON : Modifier en mémoire, puis 1 seul DML
public class PriceUpdater {
    public static void applyDiscount(List<Product2> products, Decimal discountRate) {
        List<Product2> toUpdate = new List<Product2>();

        for (Product2 p : products) {
            p.UnitPrice__c = p.UnitPrice__c * (1 - discountRate);
            toUpdate.add(p);
        }

        if (!toUpdate.isEmpty()) {
            update toUpdate; // 1 seul DML pour tous
        }
    }
}`,
    explanation: `## DML Statements vs DML Rows

Il y a deux limites distinctes :
- **DML Statements** : 150 opérations (insert, update, delete...)
- **DML Rows** : 10,000 records traités au total

En faisant \`update p\` dans une boucle, chaque itération consomme 1 DML statement ET 1 DML row.
En faisant \`update toUpdate\` une fois, on consomme 1 DML statement et N DML rows.

**Pour 200 records** :
- Bad code : 200 statements + 200 rows
- Good code : 1 statement + 200 rows`,
    limitsConsumed: [
      {
        limitId: "dml-statements",
        perRecord: 1,
        formula: "1 DML statement × {n} records = {n} statements",
      },
      {
        limitId: "dml-rows",
        perRecord: 1,
        formula: "1 DML row × {n} records = {n} rows",
      },
    ],
    limitsFixed: [
      {
        limitId: "dml-statements",
        total: 1,
        formula: "1 DML statement pour {n} records",
      },
      {
        limitId: "dml-rows",
        total: 1,
        formula: "{n} DML rows en 1 statement",
      },
    ],
  },
  {
    id: "soql-without-filter",
    title: "Query sans filtre — too many rows",
    description:
      "Une requête SOQL sans clause WHERE suffisamment sélective peut retourner 50,000+ rows.",
    difficulty: "beginner",
    triggerRecords: 500,
    badCode: `// MAUVAIS : Query sans filtre sur grande table
public class ContactExporter {
    public static List<Contact> getAllContacts() {
        // Si l'org a 60,000 contacts → LimitException !
        return [SELECT Id, Name, Email, Phone FROM Contact];
    }
}

// Encore pire : query dans une boucle sans LIMIT
public class AccountService {
    public static void processAll() {
        List<Account> accounts = [SELECT Id FROM Account]; // Potentiellement 50k+
        for (Account acc : accounts) {
            List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
            // ...
        }
    }
}`,
    goodCode: `// BON : Filtres appropriés + LIMIT défensif
public class ContactExporter {
    public static List<Contact> getRecentContacts() {
        // Filtrer par date + LIMIT de sécurité
        return [
            SELECT Id, Name, Email, Phone
            FROM Contact
            WHERE CreatedDate = LAST_N_DAYS:30
            ORDER BY CreatedDate DESC
            LIMIT 1000
        ];
    }
}

// Pour les gros volumes : Batch Apex
public class ContactBatch implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id, Name, Email FROM Contact');
        // Database.QueryLocator gère la pagination automatiquement
    }

    public void execute(Database.BatchableContext bc, List<Contact> scope) {
        // Traitement par chunks de 200 records
    }

    public void finish(Database.BatchableContext bc) {}
}`,
    explanation: `## SOQL Rows Limit : 50,000

La limite de 50,000 rows s'applique au **total** de toutes les SOQL de la transaction, pas par requête.

**Règles défensives** :
1. Toujours ajouter un \`WHERE\` sélectif
2. Utiliser \`LIMIT\` pour les queries "ad hoc"
3. Pour les gros volumes → **Batch Apex** avec \`Database.QueryLocator\` (pas de limite de rows)

**Database.QueryLocator** contourne la limite de 50,000 — c'est l'outil fait pour les grands volumes.`,
    limitsConsumed: [
      {
        limitId: "soql-rows",
        perRecord: 1,
        formula: "{n} records retournés = {n} SOQL rows consommées",
      },
      {
        limitId: "soql-queries",
        perRecord: 0,
        formula: "1 SOQL (mais {n} rows retournées)",
      },
    ],
    limitsFixed: [
      {
        limitId: "soql-rows",
        total: 200,
        formula: "LIMIT 1000 + filtre = ~200 rows max",
      },
    ],
  },
  {
    id: "cascade-dml-rows",
    title: "Création en cascade dépassant DML rows",
    description:
      "Créer des records enfants pour chaque parent peut dépasser les 10,000 DML rows.",
    difficulty: "advanced",
    triggerRecords: 500,
    badCode: `// MAUVAIS : Crée 10 child records par parent = 5000 DML rows sur 500 records
trigger AccountTrigger on Account (after insert) {
    for (Account acc : Trigger.new) {
        List<Contact> defaultContacts = new List<Contact>();
        // Crée 20 contacts par compte !
        for (Integer i = 0; i < 20; i++) {
            defaultContacts.add(new Contact(
                LastName = 'Default Contact ' + i,
                AccountId = acc.Id
            ));
        }
        insert defaultContacts; // DML dans la boucle + trop de rows !
    }
}`,
    goodCode: `// BON : Bulk insert tout en une fois + garde la limite en tête
trigger AccountTrigger on Account (after insert) {
    List<Contact> allContacts = new List<Contact>();
    Integer CONTACTS_PER_ACCOUNT = 3; // Raisonnable !

    for (Account acc : Trigger.new) {
        for (Integer i = 0; i < CONTACTS_PER_ACCOUNT; i++) {
            allContacts.add(new Contact(
                LastName = 'Default Contact ' + i,
                AccountId = acc.Id
            ));
        }
    }

    // Vérification défensive
    if (allContacts.size() > 9000) {
        // Log un warning ou traiter par batch
        System.debug(LoggingLevel.WARN, 'Warning: ' + allContacts.size() + ' DML rows');
    }

    if (!allContacts.isEmpty()) {
        insert allContacts; // 1 DML, N rows
    }
}`,
    explanation: `## DML Rows : 10,000

La limite de 10,000 DML rows s'applique au **total** de tous les DML de la transaction.

**Calcul** : 500 accounts × 20 contacts = 10,000 rows — exactement la limite ! Et 500 DML statements !

## Considérations design

Créer beaucoup de records en cascade dans un trigger est un signal d'architecture. Alternatives :
1. **Réduire le multiplicateur** (3 contacts max au lieu de 20)
2. **Batch Apex** pour les triggers qui traitent peu de records (1-5)
3. **Platform Events** pour déclencher la création async`,
    limitsConsumed: [
      {
        limitId: "dml-statements",
        perRecord: 1,
        formula: "1 DML × {n} accounts = {n} statements",
      },
      {
        limitId: "dml-rows",
        perRecord: 20,
        formula: "20 contacts × {n} accounts = {n}×20 DML rows",
      },
    ],
    limitsFixed: [
      {
        limitId: "dml-statements",
        total: 1,
        formula: "1 DML statement pour tous les contacts",
      },
      {
        limitId: "dml-rows",
        total: 3,
        formula: "3 contacts × {n} accounts = {n}×3 rows",
      },
    ],
  },
  {
    id: "cpu-string-concat",
    title: "CPU time — concatenation de strings en boucle",
    description:
      "Concaténer des strings avec '+=' dans une boucle crée de nouveaux objets String à chaque itération — très coûteux en CPU.",
    difficulty: "intermediate",
    triggerRecords: 1000,
    badCode: `// MAUVAIS : String concatenation dans une boucle (O(n²) CPU)
public class ReportBuilder {
    public static String buildCsvReport(List<Contact> contacts) {
        String csv = 'Name,Email,Phone\\n';

        for (Contact c : contacts) {
            // Chaque += crée un nouvel objet String en mémoire
            // Pour 10,000 contacts → timeout CPU !
            csv += c.Name + ',' + c.Email + ',' + c.Phone + '\\n';
        }

        return csv;
    }
}`,
    goodCode: `// BON : List<String> + String.join() = O(n) CPU
public class ReportBuilder {
    public static String buildCsvReport(List<Contact> contacts) {
        List<String> lines = new List<String>{'Name,Email,Phone'};

        for (Contact c : contacts) {
            lines.add(
                String.join(new List<String>{
                    c.Name ?? '',
                    c.Email ?? '',
                    c.Phone ?? ''
                }, ',')
            );
        }

        return String.join(lines, '\\n');
        // String.join() fait la concatenation en O(n) avec StringBuilder interne
    }
}`,
    explanation: `## Pourquoi += est catastrophique

En Apex (comme en Java), les \`String\` sont **immutables**. Chaque \`+=\` :
1. Crée un nouveau String de taille (n+m)
2. Copie les n caractères de l'existant
3. Ajoute les m nouveaux caractères

Pour 10,000 lignes de 100 chars → ~500 MB de copies inutiles → timeout CPU.

## Solution : String.join()

Apex utilise un \`StringBuilder\` interne pour \`String.join()\`, qui alloue la mémoire une seule fois.

**Règle** : Jamais de \`String s += ...\` dans une boucle avec plus de ~100 itérations.`,
    limitsConsumed: [
      {
        limitId: "cpu-time",
        perRecord: 5,
        formula: "~5ms × {n} records (O(n²)) = ~{n}×5ms CPU",
      },
      {
        limitId: "heap-size",
        perRecord: 200,
        formula: "~200 bytes × {n} records cumulés en heap",
      },
    ],
    limitsFixed: [
      {
        limitId: "cpu-time",
        total: 100,
        formula: "O(n) avec String.join() = ~100ms pour {n} records",
      },
    ],
  },
];
