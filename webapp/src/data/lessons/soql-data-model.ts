import type { Lesson } from "./types";

export const soqlDataModelLessons: Lesson[] = [
  // ─────────────────────────────────────────────
  // SOQL — 1. SELECT de base
  // ─────────────────────────────────────────────
  {
    id: "soql-01-select-basics",
    title: "SOQL — SELECT de base : WHERE, ORDER BY, LIMIT, OFFSET",
    category: "SOQL",
    tags: ["soql", "select", "where", "order-by", "limit", "offset", "query"],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## SOQL — Salesforce Object Query Language

SOQL est le SQL de Salesforce. Il permet d'interroger la base de données Salesforce (appelée **Salesforce Database** ou **Force.com platform**). Contrairement à SQL standard, SOQL ne supporte **pas les JOINs explicites** — les relations se font par sous-requêtes imbriquées ou notation pointée.

### Syntaxe de base

\`\`\`sql
SELECT fieldName1, fieldName2
FROM ObjectName
WHERE condition
ORDER BY fieldName [ASC | DESC] [NULLS FIRST | NULLS LAST]
LIMIT n
OFFSET n
\`\`\`

### Exemples concrets

\`\`\`apex
// Récupérer les 10 comptes créés récemment, triés par nom
SELECT Id, Name, Industry, AnnualRevenue
FROM Account
WHERE Industry = 'Technology'
ORDER BY Name ASC NULLS LAST
LIMIT 10
OFFSET 20  // pagination : sauter les 20 premiers résultats
\`\`\`

\`\`\`apex
// WHERE avec plusieurs conditions
SELECT Id, FirstName, LastName, Email
FROM Contact
WHERE LastName = 'Dupont'
  AND Email != null
  AND CreatedDate > 2024-01-01T00:00:00Z
ORDER BY LastName ASC, FirstName ASC
LIMIT 50
\`\`\`

### OFFSET — Pagination

\`\`\`apex
// Page 1 : records 1-20
SELECT Id, Name FROM Account ORDER BY Name LIMIT 20 OFFSET 0

// Page 2 : records 21-40
SELECT Id, Name FROM Account ORDER BY Name LIMIT 20 OFFSET 20

// Page 3 : records 41-60
SELECT Id, Name FROM Account ORDER BY Name LIMIT 20 OFFSET 40
\`\`\`

> **Limite critique** : OFFSET maximum = **2000**. Pour paginer au-delà, utiliser **Query Cursors** ou le champ \`Id\` comme curseur.

### Champs spéciaux

- \`Id\` : toujours disponible, jamais besoin de le sélectionner explicitement (mais bonne pratique de le faire)
- \`Name\` : champ label de l'objet (souvent le seul champ indexé par défaut)
- \`CreatedDate\`, \`LastModifiedDate\`, \`CreatedById\`, \`LastModifiedById\` : présents sur **tous** les objets standard
- \`IsDeleted\` : par défaut, les records supprimés (corbeille) sont **exclus** des requêtes SOQL

### Requêter la corbeille

\`\`\`apex
// Inclure les records supprimés
SELECT Id, Name, IsDeleted FROM Account WHERE IsDeleted = true ALL ROWS
\`\`\`
    `,
    tsAnalogy: `
En TypeScript avec un ORM (ex: Prisma ou TypeORM), une requête équivalente serait :

\`\`\`typescript
// Prisma
const accounts = await prisma.account.findMany({
  select: { id: true, name: true, industry: true, annualRevenue: true },
  where: { industry: 'Technology' },
  orderBy: { name: 'asc' },
  take: 10,
  skip: 20,
});

// SOQL équivalent :
// SELECT Id, Name, Industry, AnnualRevenue
// FROM Account
// WHERE Industry = 'Technology'
// ORDER BY Name ASC
// LIMIT 10
// OFFSET 20
\`\`\`

Différence clé : en SOQL, pas de \`SELECT *\` possible (sauf FIELDS(ALL) — voir leçon dédiée). Il faut **lister explicitement** chaque champ.
    `,
    gotchas: [
      "Pas de SELECT * en SOQL standard — utiliser FIELDS(ALL) à la place (limité à 200 champs, API only)",
      "OFFSET max = 2000. Au-delà : utiliser QueryMore/cursors ou pagination par Id",
      "Les champs NULL sont triés en premier par défaut (NULLS FIRST). Utiliser NULLS LAST explicitement",
      "SOQL est case-insensitive pour les mots-clés, mais les valeurs String sont case-sensitive",
      "La corbeille Salesforce (records IsDeleted=true) est exclue par défaut — utiliser ALL ROWS pour les inclure",
      "LIMIT max = 50000 pour une seule requête SOQL synchrone",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 2. Opérateurs
  // ─────────────────────────────────────────────
  {
    id: "soql-02-operators",
    title: "SOQL — Opérateurs : =, !=, IN, NOT IN, LIKE, INCLUDES/EXCLUDES",
    category: "SOQL",
    tags: [
      "soql",
      "operators",
      "in",
      "like",
      "includes",
      "excludes",
      "picklist",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## Opérateurs SOQL

### Comparaison classique

\`\`\`sql
=        égalité stricte
!=       différent de
<        inférieur à
>        supérieur à
<=       inférieur ou égal
>=       supérieur ou égal
\`\`\`

\`\`\`apex
SELECT Id, Name FROM Account WHERE AnnualRevenue >= 1000000
SELECT Id, Name FROM Opportunity WHERE Amount != null
SELECT Id, Name FROM Contact WHERE Birthdate < 1990-01-01
\`\`\`

### IN et NOT IN

\`\`\`apex
// IN : équivalent d'un OR multiple
SELECT Id, Name FROM Account
WHERE Industry IN ('Technology', 'Finance', 'Healthcare')

// NOT IN : exclusion
SELECT Id, Name FROM Contact
WHERE LeadSource NOT IN ('Web', 'Phone Inquiry')

// IN avec une liste Apex (bind variable)
List<String> industries = new List<String>{'Technology', 'Finance'};
SELECT Id, Name FROM Account WHERE Industry IN :industries
\`\`\`

### LIKE — Pattern matching

SOQL \`LIKE\` est **case-insensitive** et supporte deux wildcards :
- \`%\` : n'importe quelle séquence de caractères (équivalent \`.*\` en regex)
- \`_\` : exactement un caractère

\`\`\`apex
// Commence par "Acme"
SELECT Id, Name FROM Account WHERE Name LIKE 'Acme%'

// Contient "tech" (case-insensitive)
SELECT Id, Name FROM Account WHERE Name LIKE '%tech%'

// Exactement 3 caractères
SELECT Id, Name FROM Account WHERE BillingPostalCode LIKE '___'

// Contient "2024" dans le nom
SELECT Id, Subject FROM Task WHERE Subject LIKE '%2024%'
\`\`\`

### INCLUDES / EXCLUDES — Multi-Select Picklists

Ces opérateurs sont **exclusifs aux champs Multi-Select Picklist** (checkboxes multiples). Ils n'existent pas en SQL standard.

\`\`\`apex
// Un objet custom avec un champ multi-picklist "Skills__c"
// Contient au moins "Apex"
SELECT Id, Name, Skills__c FROM Developer__c
WHERE Skills__c INCLUDES ('Apex')

// Contient "Apex" ET "SOQL" simultanément
SELECT Id, Name, Skills__c FROM Developer__c
WHERE Skills__c INCLUDES ('Apex;SOQL')

// Contient "Apex" OU "Java"
SELECT Id, Name, Skills__c FROM Developer__c
WHERE Skills__c INCLUDES ('Apex', 'Java')

// N'inclut PAS "Legacy"
SELECT Id, Name FROM Developer__c
WHERE Skills__c EXCLUDES ('Legacy')
\`\`\`

> **Note** : le séparateur \`;\` dans INCLUDES signifie ET logique. La virgule signifie OU logique.

### AND / OR / NOT

\`\`\`apex
SELECT Id, Name FROM Account
WHERE (Industry = 'Technology' OR Industry = 'Finance')
  AND AnnualRevenue > 500000
  AND NOT (Name LIKE '%Test%')
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// IN → Array.includes()
const industries = ['Technology', 'Finance', 'Healthcare'];
accounts.filter(a => industries.includes(a.industry));
// SOQL : WHERE Industry IN ('Technology', 'Finance', 'Healthcare')

// LIKE → String.includes() ou regex
accounts.filter(a => a.name.toLowerCase().includes('tech'));
// SOQL : WHERE Name LIKE '%tech%'

// INCLUDES (multi-picklist) → Array.some() sur des valeurs séparées
accounts.filter(a => a.skills.split(';').includes('Apex'));
// SOQL : WHERE Skills__c INCLUDES ('Apex')
\`\`\`
    `,
    gotchas: [
      "LIKE est case-insensitive en SOQL (contrairement à SQL Server par défaut)",
      "INCLUDES/EXCLUDES ne fonctionnent QUE sur les champs Multi-Select Picklist — pas sur les Text ou Picklist simples",
      "Dans INCLUDES, le point-virgule (;) = ET logique, la virgule (,) = OU logique — contre-intuitif",
      "NOT IN avec une sous-requête vide retourne TOUS les records (comportement différent de SQL)",
      "Les Null values : WHERE Field = null et WHERE Field != null fonctionnent, mais != null n'est pas indexé",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 3. Date Literals
  // ─────────────────────────────────────────────
  {
    id: "soql-03-date-literals",
    title: "SOQL — Date Literals : TODAY, LAST_N_DAYS, THIS_QUARTER, etc.",
    category: "SOQL",
    tags: [
      "soql",
      "dates",
      "date-literals",
      "today",
      "fiscal",
      "relative-dates",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## Date Literals SOQL

Les date literals permettent d'écrire des filtres temporels **relatifs** sans hardcoder de dates. Ils sont évalués **au moment de l'exécution** de la requête.

### Date Literals absolus

\`\`\`apex
// Date exacte (format ISO 8601 sans heure)
SELECT Id FROM Opportunity WHERE CloseDate = 2024-12-31

// DateTime (avec heure, toujours en UTC)
SELECT Id FROM Task WHERE CreatedDate > 2024-01-01T00:00:00Z
\`\`\`

### Date Literals relatifs — Référence complète

| Literal | Signification |
|---------|--------------|
| \`TODAY\` | Aujourd'hui (minuit à minuit) |
| \`YESTERDAY\` | Hier |
| \`TOMORROW\` | Demain |
| \`THIS_WEEK\` | Semaine en cours (lun-dim) |
| \`LAST_WEEK\` | Semaine précédente |
| \`NEXT_WEEK\` | Semaine prochaine |
| \`THIS_MONTH\` | Mois en cours |
| \`LAST_MONTH\` | Mois précédent |
| \`NEXT_MONTH\` | Mois prochain |
| \`THIS_QUARTER\` | Trimestre fiscal en cours |
| \`LAST_QUARTER\` | Trimestre fiscal précédent |
| \`NEXT_QUARTER\` | Trimestre fiscal prochain |
| \`THIS_YEAR\` | Année fiscale en cours |
| \`LAST_YEAR\` | Année fiscale précédente |
| \`NEXT_YEAR\` | Année fiscale prochaine |
| \`LAST_N_DAYS:n\` | Les n derniers jours (inclut aujourd'hui) |
| \`NEXT_N_DAYS:n\` | Les n prochains jours |
| \`LAST_N_WEEKS:n\` | Les n dernières semaines |
| \`NEXT_N_WEEKS:n\` | Les n prochaines semaines |
| \`LAST_N_MONTHS:n\` | Les n derniers mois |
| \`NEXT_N_MONTHS:n\` | Les n prochains mois |
| \`LAST_N_QUARTERS:n\` | Les n derniers trimestres |
| \`LAST_N_YEARS:n\` | Les n dernières années |
| \`LAST_90_DAYS\` | Raccourci pour LAST_N_DAYS:90 |
| \`NEXT_90_DAYS\` | Raccourci pour NEXT_N_DAYS:90 |

### Exemples pratiques

\`\`\`apex
// Opportunités créées aujourd'hui
SELECT Id, Name, Amount FROM Opportunity
WHERE CreatedDate = TODAY

// Leads des 7 derniers jours
SELECT Id, Name, Status FROM Lead
WHERE CreatedDate >= LAST_N_DAYS:7

// Opportunités à fermer ce trimestre
SELECT Id, Name, Amount, CloseDate FROM Opportunity
WHERE CloseDate = THIS_QUARTER
  AND StageName != 'Closed Won'
  AND StageName != 'Closed Lost'

// Cases ouverts depuis plus de 30 jours
SELECT Id, CaseNumber, Subject FROM Case
WHERE Status != 'Closed'
  AND CreatedDate < LAST_N_DAYS:30

// Activités planifiées pour les 2 prochaines semaines
SELECT Id, Subject, ActivityDate FROM Task
WHERE ActivityDate >= TODAY
  AND ActivityDate <= NEXT_N_DAYS:14
  AND Status != 'Completed'
\`\`\`

### Fiscal Year vs Calendar Year

\`\`\`apex
// THIS_QUARTER et THIS_YEAR se basent sur l'année FISCALE de l'org
// (configurable dans Setup > Company Information)
// Une org avec fiscal year démarrant en février :
// Q1 = Fév-Avr, Q2 = Mai-Jul, etc.

// Pour forcer l'année calendaire :
SELECT Id FROM Opportunity
WHERE CloseDate >= 2024-01-01
  AND CloseDate <= 2024-12-31
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// En TypeScript, on ferait des calculs manuels de dates :
const today = new Date();
const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

leads.filter(l => l.createdDate >= sevenDaysAgo);

// SOQL fait ça nativement avec :
// WHERE CreatedDate >= LAST_N_DAYS:7

// Avantage SOQL : les dates sont évaluées côté serveur SF,
// pas besoin de gérer les fuseaux horaires côté client
\`\`\`
    `,
    gotchas: [
      "LAST_N_DAYS:n INCLUT aujourd'hui — LAST_N_DAYS:7 = 8 jours au total (aujourd'hui + 7 jours avant)",
      "THIS_QUARTER/THIS_YEAR se basent sur l'ANNÉE FISCALE de l'org, pas l'année calendaire",
      "Les DateTimes sont toujours stockés en UTC dans Salesforce — les date literals s'ajustent au timezone de l'utilisateur",
      "Sur les champs Date (sans heure), utiliser LAST_N_DAYS peut inclure plus de records que prévu à cause de la conversion UTC",
      "LAST_90_DAYS et NEXT_90_DAYS existent comme raccourcis mais LAST_N_DAYS:90 est équivalent",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 4. Parent-to-Child (sous-requête imbriquée)
  // ─────────────────────────────────────────────
  {
    id: "soql-04-parent-to-child",
    title:
      "SOQL — Relationship Queries Parent-to-Child (sous-requête imbriquée)",
    category: "SOQL",
    tags: [
      "soql",
      "relationships",
      "parent-to-child",
      "nested-query",
      "subquery",
      "one-to-many",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2", "JS-Dev-I"],
    content: `
## Requêtes Parent-to-Child (One-to-Many)

En SOQL, une relation parent-to-child se fait avec une **sous-requête SELECT imbriquée** dans la clause SELECT principale. Elle retourne une **liste de records enfants** pour chaque parent.

### Syntaxe

\`\`\`sql
SELECT parent_fields, (
  SELECT child_fields
  FROM ChildRelationshipName
  WHERE child_conditions
)
FROM ParentObject
WHERE parent_conditions
\`\`\`

> **Important** : Dans la sous-requête, on utilise le **nom de la relation** (pas le nom de l'objet). Pour les objets standard, c'est le **nom pluriel** de l'objet enfant.

### Exemples — Relations Standard

\`\`\`apex
// Account → Contacts (relation standard : Contacts)
SELECT Id, Name, (
  SELECT Id, FirstName, LastName, Email
  FROM Contacts
  WHERE Email != null
  ORDER BY LastName ASC
)
FROM Account
WHERE Industry = 'Technology'

// Account → Opportunities
SELECT Id, Name, (
  SELECT Id, Name, Amount, StageName, CloseDate
  FROM Opportunities
  WHERE StageName NOT IN ('Closed Lost', 'Closed Won')
)
FROM Account
WHERE AnnualRevenue > 1000000

// Opportunity → OpportunityLineItems (produits)
SELECT Id, Name, Amount, (
  SELECT Id, Quantity, UnitPrice, Product2.Name
  FROM OpportunityLineItems
)
FROM Opportunity
WHERE StageName = 'Proposal/Price Quote'
\`\`\`

### Accéder aux résultats en Apex

\`\`\`apex
List<Account> accounts = [
  SELECT Id, Name, (
    SELECT Id, FirstName, LastName FROM Contacts
  )
  FROM Account
  LIMIT 10
];

for (Account acc : accounts) {
  System.debug('Account: ' + acc.Name);

  // Les contacts sont dans un QueryLocator — accès via la relation
  for (Contact c : acc.Contacts) {
    System.debug('  Contact: ' + c.FirstName + ' ' + c.LastName);
  }
}
\`\`\`

### Limites des sous-requêtes

\`\`\`apex
// Max 20 sous-requêtes par requête SOQL principale
// Max 1 niveau d'imbrication (pas de sous-requête dans une sous-requête)
// Max 2000 records par sous-requête enfant

// INVALIDE — double imbrication interdite :
SELECT Id, (
  SELECT Id, (SELECT Id FROM Tasks) FROM Contacts  // ERREUR
)
FROM Account
\`\`\`

### Relations polymorphiques (What/Who)

\`\`\`apex
// Task.WhoId peut être Contact OU Lead (polymorphique)
// Task.WhatId peut être Account, Opportunity, Case, etc.
SELECT Id, Subject, Who.Name, What.Name
FROM Task
WHERE CreatedDate = TODAY
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// En TypeScript, équivalent d'un include/populate :

// Prisma
const accounts = await prisma.account.findMany({
  include: {
    contacts: {
      where: { email: { not: null } },
      orderBy: { lastName: 'asc' },
    },
    opportunities: {
      where: { stageName: { notIn: ['Closed Lost', 'Closed Won'] } },
    },
  },
  where: { industry: 'Technology' },
});

// SOQL équivalent :
// SELECT Id, Name,
//   (SELECT Id, FirstName, LastName, Email FROM Contacts WHERE Email != null),
//   (SELECT Id, Name, Amount, StageName FROM Opportunities WHERE StageName NOT IN (...))
// FROM Account WHERE Industry = 'Technology'
\`\`\`

La sous-requête SOQL correspond à un JOIN one-to-many qui retourne un tableau imbriqué, exactement comme \`include\` dans Prisma ou \`populate\` dans Mongoose.
    `,
    gotchas: [
      "Le nom dans la sous-requête est le NOM DE RELATION (pluriel pour standard), PAS le nom de l'objet — 'Contacts' pas 'Contact'",
      "Max 2000 records retournés par sous-requête enfant — si un Account a 3000 Contacts, vous n'en aurez que 2000",
      "Les sous-requêtes comptent dans le quota de 100 SOQL par transaction",
      "Impossible d'imbriquer une sous-requête dans une sous-requête (1 seul niveau)",
      "La sous-requête peut avoir son propre WHERE, ORDER BY, LIMIT — mais pas OFFSET ni HAVING",
      "Pour les relations custom, le nom de relation est défini dans la config du champ Lookup/MasterDetail",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 5. Child-to-Parent (notation pointée)
  // ─────────────────────────────────────────────
  {
    id: "soql-05-child-to-parent",
    title: "SOQL — Relationship Queries Child-to-Parent (notation pointée)",
    category: "SOQL",
    tags: [
      "soql",
      "relationships",
      "child-to-parent",
      "dot-notation",
      "many-to-one",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2", "JS-Dev-I"],
    content: `
## Requêtes Child-to-Parent (Many-to-One)

La notation pointée permet de traverser les relations **vers le parent** directement dans le SELECT. Pas besoin de JOIN — on utilise le **nom du champ de relation** suivi d'un point et du champ parent.

### Syntaxe

\`\`\`sql
SELECT RelationshipName.FieldName
FROM ChildObject
\`\`\`

### Exemples — Relations Standard

\`\`\`apex
// Contact → Account (relation : Account)
SELECT Id, FirstName, LastName, Account.Name, Account.Industry, Account.BillingCity
FROM Contact
WHERE Account.Industry = 'Technology'

// Opportunity → Account
SELECT Id, Name, Amount, Account.Name, Account.OwnerId
FROM Opportunity
WHERE Account.AnnualRevenue > 1000000
  AND CloseDate = THIS_QUARTER

// Case → Account → Owner
SELECT Id, CaseNumber, Account.Name, Account.Owner.Name, Account.Owner.Email
FROM Case
WHERE Status = 'Open'
\`\`\`

### Traverser plusieurs niveaux (jusqu'à 5)

\`\`\`apex
// 5 niveaux max de traversée
SELECT Id, Subject,
  Owner.Name,                    // 1 niveau
  Account.Name,                  // 1 niveau
  Account.Owner.Name,            // 2 niveaux
  Account.Owner.Manager.Name,    // 3 niveaux
  Account.Owner.Manager.Profile.Name  // 4 niveaux
FROM Case

// LIMITE : max 5 niveaux de relation traversés par requête
\`\`\`

### Filtrer sur des champs parent

\`\`\`apex
// Très puissant : filtrer les enfants sur les attributs du parent
SELECT Id, Name, Amount
FROM Opportunity
WHERE Account.Industry = 'Technology'
  AND Account.BillingCountry = 'France'
  AND Account.AnnualRevenue >= 5000000
  AND Owner.Profile.Name = 'Sales Manager'
\`\`\`

### Accès en Apex

\`\`\`apex
List<Contact> contacts = [
  SELECT Id, FirstName, LastName, Account.Name, Account.Phone
  FROM Contact
  WHERE Account.Industry = 'Finance'
  LIMIT 100
];

for (Contact c : contacts) {
  // Accès direct à l'objet parent via la relation
  String accountName = c.Account.Name;
  String accountPhone = c.Account.Phone;
  System.debug(c.LastName + ' works at ' + accountName);
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// La notation pointée SOQL est exactement comme accéder à une propriété
// d'un objet imbriqué après un JOIN/include :

// Prisma
const contacts = await prisma.contact.findMany({
  include: { account: { select: { name: true, industry: true } } },
  where: { account: { industry: 'Technology' } },
});
contacts.map(c => c.account.name); // notation pointée côté TS

// SOQL équivalent :
// SELECT Id, Account.Name, Account.Industry
// FROM Contact
// WHERE Account.Industry = 'Technology'

// La différence : en SOQL, la notation pointée est dans la REQUÊTE elle-même,
// pas seulement dans le code d'accès aux données
\`\`\`
    `,
    gotchas: [
      "Max 5 niveaux de traversée parent par requête (Account.Owner.Manager.Profile.Name = 4 niveaux)",
      "Si l'Account d'un Contact est null, Account.Name retourne null (pas d'erreur NPE en SOQL)",
      "En Apex, accéder à c.Account.Name après une requête SANS Account dans le SELECT → NullPointerException",
      "Pour les relations custom, le nom de relation = le nom du champ Lookup sans __c, avec __r à la place",
      "Le WHERE Account.Industry = 'Technology' filtre ET les contacts dont l'Account est null (exclus du résultat)",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 6. Nommage des relations
  // ─────────────────────────────────────────────
  {
    id: "soql-06-relationship-naming",
    title: "SOQL — Nommage des relations : __r, noms pluriels standard",
    category: "SOQL",
    tags: [
      "soql",
      "relationships",
      "__r",
      "naming",
      "custom-objects",
      "standard-objects",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Nommage des Relations SOQL

C'est l'un des points les plus déroutants pour les nouveaux développeurs. Il faut distinguer **deux contextes** :

### Règle 1 : Child-to-Parent (notation pointée)

Le nom utilisé est le **nom du champ Lookup/MasterDetail** :

\`\`\`apex
// Pour un champ standard Lookup sur Contact vers Account
// Le champ API name est : AccountId
// Le nom de relation est : Account (sans "Id")
SELECT Account.Name FROM Contact

// Pour un champ custom __c sur Invoice__c vers Account
// Le champ API name est : Account__c
// Le nom de relation est : Account__r (sans "__c", avec "__r")
SELECT Account__r.Name FROM Invoice__c

// Règle : enlever le suffixe, ajouter __r pour les custom
// Standard : AccountId → Account
// Custom :   Account__c → Account__r
\`\`\`

### Règle 2 : Parent-to-Child (sous-requête)

Le nom utilisé est le **nom de la relation enfant** défini sur l'objet parent :

\`\`\`apex
// Relations STANDARD : nom pluriel de l'objet enfant
SELECT Id, (SELECT Id FROM Contacts) FROM Account         // Contact → Contacts
SELECT Id, (SELECT Id FROM Opportunities) FROM Account    // Opportunity → Opportunities
SELECT Id, (SELECT Id FROM Cases) FROM Account            // Case → Cases
SELECT Id, (SELECT Id FROM Tasks) FROM Contact            // Task → Tasks (via WhoId)
SELECT Id, (SELECT Id FROM OpenActivities) FROM Account   // Activités ouvertes

// Relations CUSTOM : défini dans le champ Lookup/MasterDetail
// (configurable dans Setup, par défaut = nom de l'objet + 's')
// Ex: Invoice__c avec relation vers Account
// → le nom de relation enfant sur Account = Invoices__r (par convention)
SELECT Id, (SELECT Id FROM Invoices__r) FROM Account
\`\`\`

### Récapitulatif

| Direction | Type | Format | Exemple |
|-----------|------|---------|---------|
| Child → Parent | Standard | NomDuChamp sans "Id" | \`Account.Name\` |
| Child → Parent | Custom | NomDuChamp__c → NomDuChamp__r | \`Account__r.Name\` |
| Parent → Child | Standard | Nom pluriel de l'objet | \`FROM Contacts\` |
| Parent → Child | Custom | Défini dans le champ (souvent objet+s+__r) | \`FROM Invoices__r\` |

### Trouver les noms de relation

\`\`\`apex
// En Apex : introspection du schema
Map<String, Schema.SObjectType> globalDesc = Schema.getGlobalDescribe();
Schema.SObjectType accountType = globalDesc.get('Account');
Schema.DescribeSObjectResult accountDesc = accountType.getDescribe();

// Relations enfants (parent-to-child)
List<Schema.ChildRelationship> childRels = accountDesc.getChildRelationships();
for (Schema.ChildRelationship rel : childRels) {
  System.debug('Relation: ' + rel.getRelationshipName()
    + ' → ' + rel.getChildSObject());
}
\`\`\`

### Exemples complets

\`\`\`apex
// Projet custom avec tâches custom
// Order__c a un champ Lookup : Account__c (vers Account)
// Project__c a un champ Lookup : Order__c (vers Order__c)
// La relation enfant sur Order__c s'appelle Projects__r

SELECT Id, Name, Account__r.Name, Account__r.Industry, (
  SELECT Id, Name__c, Status__c FROM Projects__r
  WHERE Status__c = 'Active'
)
FROM Order__c
WHERE Account__r.Industry = 'Technology'
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// En TypeScript avec Prisma, les relations sont définies dans le schema Prisma :
// model Contact {
//   account   Account @relation(fields: [accountId], references: [id])
//   accountId String
// }
// Accès : contact.account.name

// SOQL : même concept, mais le "nom de la relation" est configurable dans SF
// Standard : le nom est conventionnel (pluriel pour les enfants)
// Custom : le nom est défini lors de la création du champ

// Le __r (relationship) est l'équivalent de la propriété de navigation Prisma
// Contact.Account__r.Name ≈ contact.account.name
\`\`\`
    `,
    gotchas: [
      "Account__c (champ) vs Account__r (relation) — confondre les deux est l'erreur la plus fréquente",
      "Dans une sous-requête parent-to-child, c'est le NOM DE LA RELATION ENFANT, pas le nom de l'objet",
      "Le nom de relation enfant pour les custom est configurable — il peut ne PAS être le nom de l'objet + 's' + '__r'",
      "Pour trouver le bon nom : Setup > Object Manager > Account > Relationships & Lookup Fields",
      "Certaines relations standard ont des noms non-intuitifs : OpenActivities, ActivityHistories, FeedItems",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 7. Aggregate Functions
  // ─────────────────────────────────────────────
  {
    id: "soql-07-aggregate-functions",
    title: "SOQL — Aggregate Functions : COUNT, SUM, AVG, MIN, MAX",
    category: "SOQL",
    tags: [
      "soql",
      "aggregate",
      "count",
      "sum",
      "avg",
      "min",
      "max",
      "group-by",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Fonctions d'Agrégation SOQL

### Fonctions disponibles

| Fonction | Description | Null handling |
|----------|-------------|---------------|
| \`COUNT()\` | Nombre de records (inclut nulls) | Inclut les nulls |
| \`COUNT(fieldName)\` | Nombre de valeurs non-null | Exclut les nulls |
| \`COUNT_DISTINCT(fieldName)\` | Nombre de valeurs uniques non-null | Exclut les nulls |
| \`SUM(fieldName)\` | Somme | Ignore les nulls |
| \`AVG(fieldName)\` | Moyenne | Ignore les nulls |
| \`MIN(fieldName)\` | Valeur minimale | Ignore les nulls |
| \`MAX(fieldName)\` | Valeur maximale | Ignore les nulls |

### Exemples

\`\`\`apex
// Nombre total d'Opportunities
SELECT COUNT() FROM Opportunity
// COUNT() sans argument : retourne un entier directement

// COUNT avec champ : exclut les nulls
SELECT COUNT(Amount) FROM Opportunity
// Retourne le nombre d'Opportunities AVEC un Amount non-null

// Statistiques sur les montants
SELECT SUM(Amount), AVG(Amount), MIN(Amount), MAX(Amount)
FROM Opportunity
WHERE StageName = 'Closed Won'
  AND CloseDate = THIS_YEAR

// Count distinct : compter les industries uniques
SELECT COUNT_DISTINCT(Industry) FROM Account
WHERE Industry != null
\`\`\`

### Accès aux résultats en Apex

\`\`\`apex
// COUNT() simple : accès direct comme Integer
Integer total = [SELECT COUNT() FROM Account WHERE Industry = 'Technology'];
System.debug('Total: ' + total);

// Autres agrégats : retournent List<AggregateResult>
List<AggregateResult> results = [
  SELECT SUM(Amount) totalAmount, AVG(Amount) avgAmount, COUNT(Id) cnt
  FROM Opportunity
  WHERE StageName = 'Closed Won'
];

// Accès via get() avec l'alias
AggregateResult result = results[0];
Decimal totalAmount = (Decimal) result.get('totalAmount');
Decimal avgAmount = (Decimal) result.get('avgAmount');
Integer cnt = (Integer) result.get('cnt');
\`\`\`

### AggregateResult avec alias

\`\`\`apex
// Toujours utiliser des ALIAS pour les fonctions d'agrégation
SELECT
  COUNT(Id) recordCount,
  SUM(Amount) totalRevenue,
  AVG(Amount) averageDeal,
  MIN(CloseDate) earliestClose,
  MAX(CloseDate) latestClose
FROM Opportunity
WHERE StageName = 'Closed Won'

// Sans alias, l'accès se fait par "expr0", "expr1", etc. — peu lisible
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Équivalent en JS/TS avec Array methods :
const opportunities = await getOpportunities();

const closedWon = opportunities.filter(o => o.stageName === 'Closed Won');
const totalAmount = closedWon.reduce((sum, o) => sum + (o.amount ?? 0), 0);
const avgAmount = totalAmount / closedWon.length;
const minAmount = Math.min(...closedWon.map(o => o.amount ?? Infinity));

// SOQL fait tout ça côté serveur en une seule requête :
// SELECT SUM(Amount) totalRevenue, AVG(Amount) avgDeal, MIN(Amount) minDeal
// FROM Opportunity WHERE StageName = 'Closed Won'

// Avantage SOQL : aucun transfert de données — calcul côté base de données
\`\`\`
    `,
    gotchas: [
      "COUNT() sans argument est différent de COUNT(Id) — COUNT() est plus rapide (pas de déduplication)",
      "Les fonctions d'agrégation retournent AggregateResult, PAS le type SObject — pas d'accès direct aux champs",
      "Sans GROUP BY, une seule ligne est retournée (AggregateResult avec toutes les valeurs)",
      "L'alias est obligatoire pour accéder aux résultats de façon lisible — sinon c'est expr0, expr1...",
      "SUM, AVG, MIN, MAX ignorent les valeurs NULL — COUNT(field) aussi, mais COUNT() les inclut",
      "Les AggregateResult ne peuvent pas être passés dans un trigger ou utilisés comme SObject — cast explicite requis",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 8. GROUP BY, ROLLUP, HAVING
  // ─────────────────────────────────────────────
  {
    id: "soql-08-group-by-having",
    title: "SOQL — GROUP BY, GROUP BY ROLLUP, HAVING",
    category: "SOQL",
    tags: ["soql", "group-by", "rollup", "having", "aggregate", "pivot"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## GROUP BY, ROLLUP et HAVING

### GROUP BY — Regrouper les résultats

\`\`\`apex
// Nombre d'Opportunities par Stage
SELECT StageName, COUNT(Id) cnt
FROM Opportunity
GROUP BY StageName
ORDER BY COUNT(Id) DESC

// Montant total par Account et Stage
SELECT AccountId, StageName, SUM(Amount) total, COUNT(Id) cnt
FROM Opportunity
WHERE CloseDate = THIS_YEAR
GROUP BY AccountId, StageName
ORDER BY AccountId, StageName
\`\`\`

### Règle fondamentale

> Tout champ dans le SELECT qui n'est PAS une fonction d'agrégation **DOIT** être dans le GROUP BY.

\`\`\`apex
// CORRECT
SELECT Industry, COUNT(Id) cnt FROM Account GROUP BY Industry

// ERREUR — Industry n'est pas dans GROUP BY
SELECT Industry, Name, COUNT(Id) cnt FROM Account GROUP BY Industry
// → Error: field 'Name' does not appear in GROUP BY
\`\`\`

### GROUP BY ROLLUP — Sous-totaux automatiques

ROLLUP génère des lignes de sous-totaux pour chaque niveau de regroupement.

\`\`\`apex
SELECT Industry, BillingCountry, COUNT(Id) cnt
FROM Account
GROUP BY ROLLUP(Industry, BillingCountry)

// Résultat :
// Technology | France | 15
// Technology | USA    | 42
// Technology | null   | 57  ← sous-total Industry='Technology'
// Finance    | France | 8
// Finance    | null   | 8   ← sous-total Industry='Finance'
// null       | null   | 65  ← GRAND TOTAL
\`\`\`

\`\`\`apex
// En Apex, tester si une ligne est un sous-total avec GROUPING()
List<AggregateResult> results = [
  SELECT Industry, BillingCountry, COUNT(Id) cnt,
    GROUPING(Industry) isRollupIndustry,
    GROUPING(BillingCountry) isRollupCountry
  FROM Account
  GROUP BY ROLLUP(Industry, BillingCountry)
];

for (AggregateResult r : results) {
  Integer rollupIndustry = (Integer) r.get('isRollupIndustry');
  Integer rollupCountry = (Integer) r.get('isRollupCountry');
  if (rollupIndustry == 1 && rollupCountry == 1) {
    System.debug('GRAND TOTAL: ' + r.get('cnt'));
  } else if (rollupCountry == 1) {
    System.debug('Subtotal for ' + r.get('Industry') + ': ' + r.get('cnt'));
  }
}
\`\`\`

### HAVING — Filtrer les groupes

HAVING est à GROUP BY ce que WHERE est aux records individuels. Il filtre **après** l'agrégation.

\`\`\`apex
// Seulement les Industries avec plus de 10 comptes
SELECT Industry, COUNT(Id) cnt
FROM Account
GROUP BY Industry
HAVING COUNT(Id) > 10
ORDER BY COUNT(Id) DESC

// Seulement les Accounts avec plus de 5 Opportunities gagnées
SELECT AccountId, COUNT(Id) wonDeals
FROM Opportunity
WHERE StageName = 'Closed Won'
GROUP BY AccountId
HAVING COUNT(Id) >= 5
ORDER BY COUNT(Id) DESC

// Combiner WHERE et HAVING
SELECT Industry, SUM(AnnualRevenue) totalRevenue
FROM Account
WHERE BillingCountry = 'USA'     // filtre avant agrégation
GROUP BY Industry
HAVING SUM(AnnualRevenue) > 10000000  // filtre après agrégation
ORDER BY SUM(AnnualRevenue) DESC
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// GROUP BY équivalent avec Array.reduce() en TypeScript :
const opps = await getOpportunities();

const byStage = opps.reduce((acc, opp) => {
  const stage = opp.stageName;
  if (!acc[stage]) acc[stage] = { count: 0, total: 0 };
  acc[stage].count++;
  acc[stage].total += opp.amount ?? 0;
  return acc;
}, {} as Record<string, { count: number; total: number }>);

// SOQL équivalent (+ performant car côté serveur) :
// SELECT StageName, COUNT(Id) cnt, SUM(Amount) total
// FROM Opportunity
// GROUP BY StageName

// HAVING équivalent avec Array.filter() APRÈS le groupement :
Object.entries(byStage)
  .filter(([, v]) => v.count >= 5) // HAVING COUNT(Id) >= 5
  .sort(([, a], [, b]) => b.count - a.count);
\`\`\`
    `,
    gotchas: [
      "Tout champ SELECT non-agrégé DOIT être dans GROUP BY — contrairement à certains SGBD permissifs (MySQL sans strict mode)",
      "HAVING ne peut contenir que des fonctions d'agrégation ou des champs du GROUP BY",
      "GROUP BY ROLLUP génère des lignes null pour les sous-totaux — à gérer en Apex avec GROUPING()",
      "Pas de GROUP BY CUBE en SOQL (existe en SQL standard) — seulement ROLLUP",
      "Les AggregateResult avec GROUP BY sont limités à 2000 lignes retournées",
      "ORDER BY dans une requête GROUP BY ne peut contenir que des champs présents dans GROUP BY ou des fonctions d'agrégation",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 9. Polymorphic Relationships (TYPEOF)
  // ─────────────────────────────────────────────
  {
    id: "soql-09-polymorphic-typeof",
    title: "SOQL — Relations Polymorphiques et TYPEOF",
    category: "SOQL",
    tags: ["soql", "polymorphic", "typeof", "who", "what", "task", "event"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## Relations Polymorphiques

Certains champs Salesforce peuvent pointer vers **plusieurs types d'objets différents**. Ce sont des relations polymorphiques. Les exemples les plus courants :

- **Task.WhoId** → Contact OU Lead
- **Task.WhatId** → Account, Opportunity, Case, ou tout objet custom activé
- **Event.WhoId** → Contact OU Lead
- **Event.WhatId** → Account, Opportunity, Case, etc.

### Le problème sans TYPEOF

\`\`\`apex
// Sans TYPEOF, on obtient un Name générique
SELECT Id, Subject, Who.Name, Who.Type
FROM Task
WHERE CreatedDate = TODAY

// Who.Type retourne : 'Contact' ou 'Lead'
// Mais on ne peut pas accéder à Who.Email ou Who.Phone directement
// car SF ne sait pas quel type résoudre à compile time
\`\`\`

### TYPEOF — Solution élégante

\`\`\`apex
SELECT Id, Subject,
  TYPEOF Who
    WHEN Contact THEN FirstName, LastName, Email, Phone
    WHEN Lead THEN FirstName, LastName, Company, Status
    ELSE Name  // fallback pour autres types
  END,
  TYPEOF What
    WHEN Account THEN Name, Industry, AnnualRevenue
    WHEN Opportunity THEN Name, Amount, StageName, CloseDate
    WHEN Case THEN CaseNumber, Subject, Status
    ELSE Name
  END
FROM Task
WHERE ActivityDate >= LAST_N_DAYS:30

// Accès en Apex
List<Task> tasks = [
  SELECT Id, Subject,
    TYPEOF Who
      WHEN Contact THEN FirstName, LastName, Email
      WHEN Lead THEN FirstName, LastName, Company
      ELSE Name
    END
  FROM Task
  LIMIT 50
];

for (Task t : tasks) {
  if (t.Who instanceof Contact) {
    Contact c = (Contact) t.Who;
    System.debug('Contact: ' + c.Email);
  } else if (t.Who instanceof Lead) {
    Lead l = (Lead) t.Who;
    System.debug('Lead from: ' + l.Company);
  }
}
\`\`\`

### Limitations de TYPEOF

\`\`\`apex
// TYPEOF ne fonctionne que dans des contextes spécifiques :
// 1. Seulement sur les champs polymorphiques standard (Who, What)
// 2. Ne peut pas être utilisé dans WHERE (utiliser Type à la place)
// 3. SOQL statique uniquement (pas dans Database.query())

// Pour filtrer par type, utiliser Type :
SELECT Id, Subject, Who.Name
FROM Task
WHERE Who.Type = 'Contact'  // filtre uniquement les tâches liées à des Contacts
  AND ActivityDate >= TODAY
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// TYPEOF SOQL ≈ discriminated union en TypeScript + type narrowing

type TaskRelated =
  | { type: 'Contact'; firstName: string; lastName: string; email: string }
  | { type: 'Lead'; firstName: string; lastName: string; company: string };

function processWho(who: TaskRelated) {
  if (who.type === 'Contact') {
    console.log(who.email); // TypeScript sait que email existe ici
  } else {
    console.log(who.company); // TypeScript sait que company existe ici
  }
}

// SOQL TYPEOF fait pareil au niveau de la requête :
// TYPEOF Who
//   WHEN Contact THEN Email    ← champs spécifiques Contact
//   WHEN Lead THEN Company     ← champs spécifiques Lead
// END
\`\`\`
    `,
    gotchas: [
      "TYPEOF ne peut pas être utilisé dans la clause WHERE — utiliser Who.Type = 'Contact' à la place",
      "TYPEOF n'est pas supporté dans Dynamic SOQL (Database.query())",
      "Sans TYPEOF, accéder à Who.Email provoque une erreur car SF ne peut pas garantir que c'est un Contact",
      "Le cast en Apex (Contact) t.Who peut échouer si le type réel est différent — toujours vérifier instanceof",
      "Task.WhatId peut pointer vers des objets custom si 'Track Activities' est activé sur l'objet custom",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 10. SOQL For Loops
  // ─────────────────────────────────────────────
  {
    id: "soql-10-soql-for-loops",
    title: "SOQL — For Loops SOQL et chunking automatique",
    category: "SOQL",
    tags: ["soql", "for-loop", "bulk", "heap", "memory", "governor-limits"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## SOQL For Loops

Un SOQL for loop permet d'itérer sur les résultats d'une requête **sans les charger tous en mémoire** d'un coup. C'est la solution pour traiter de grandes quantités de données sans atteindre les limites de heap (mémoire Apex = 6MB synchrone, 12MB async).

### Trois formes

\`\`\`apex
// ❌ Forme classique (risque heap limit avec >10k records)
List<Account> accounts = [SELECT Id, Name FROM Account WHERE Industry = 'Technology'];
for (Account a : accounts) {
  // process a
}

// ✅ Forme 1 : SOQL for loop (record par record, chunking interne)
for (Account a : [SELECT Id, Name FROM Account WHERE Industry = 'Technology']) {
  // Salesforce charge les records par blocs de 200 en interne
  // process a — mais DML dans une boucle = mauvaise pratique !
}

// ✅ Forme 2 : SOQL for loop avec LIST (recommandé pour DML bulk)
for (List<Account> accountChunk : [SELECT Id, Name FROM Account WHERE Industry = 'Technology']) {
  // accountChunk est une List de MAX 200 records
  // Idéal pour faire du DML par batch de 200 → 1 DML statement par chunk
  update accountChunk; // 1 DML pour 200 records
}
\`\`\`

### Pourquoi utiliser les for loops avec List

\`\`\`apex
// Pattern recommandé pour le bulk processing
for (List<Contact> contacts : [
  SELECT Id, Email, MailingCountry
  FROM Contact
  WHERE MailingCountry = null
    AND Email != null
]) {
  // 200 contacts max par itération
  for (Contact c : contacts) {
    c.MailingCountry = 'France'; // dériver depuis d'autres champs
  }
  update contacts; // 1 seule opération DML pour 200 records
  // → max ceil(total/200) DML statements au lieu de total DML statements
}
\`\`\`

### Comparaison avec Batch Apex

\`\`\`apex
// SOQL for loop : synchrone, max 50000 records récupérés, max 6MB heap
// Batch Apex : asynchrone, peut traiter des millions de records

// Quand utiliser quoi :
// < 50 000 records, synchro : SOQL for loop
// > 50 000 records ou tâche longue : Batch Apex
// Temps réel avec streaming : Platform Events
\`\`\`

### Limites des Governor Limits concernées

\`\`\`apex
// Par transaction Apex :
// - Max 50 000 records retournés par SOQL (toutes requêtes confondues)
// - Max 100 requêtes SOQL
// - Max 150 DML statements
// - Max 6MB heap (12MB async)

// Le SOQL for loop avec List<> RÉDUIT la consommation heap
// mais ne change PAS le nombre de records comptabilisés dans le quota 50k
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Équivalent du SOQL for loop en TypeScript avec une API paginée :

async function* fetchAllContacts() {
  let offset = 0;
  const batchSize = 200;
  while (true) {
    const batch = await db.contact.findMany({ take: batchSize, skip: offset });
    if (batch.length === 0) break;
    yield batch;
    offset += batchSize;
  }
}

// Usage :
for await (const contactChunk of fetchAllContacts()) {
  await db.contact.updateMany({
    where: { id: { in: contactChunk.map(c => c.id) } },
    data: { mailingCountry: 'France' },
  });
}

// SOQL for loop with List fait exactement ça, mais :
// 1. Intégré dans le langage (pas de boilerplate)
// 2. Le chunking de 200 est géré par Salesforce automatiquement
\`\`\`
    `,
    gotchas: [
      "Le SOQL for loop réduit la consommation mémoire mais compte quand même dans le quota de 50 000 records",
      "Faire du DML (insert/update/delete) DANS un for loop record-par-record consomme 1 DML par record — toujours utiliser List<>",
      "La taille des chunks est de 200 records maximum — non configurable",
      "Le SOQL for loop ne résout pas les governor limits de requêtes SOQL (100 max) — il en consomme toujours une",
      "Si l'itération plante au milieu, les DML déjà effectués sont rollback-és (comportement transactionnel Apex)",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 11. Dynamic SOQL
  // ─────────────────────────────────────────────
  {
    id: "soql-11-dynamic-soql",
    title: "SOQL — Dynamic SOQL : Database.query() et injection SOQL",
    category: "SOQL",
    tags: [
      "soql",
      "dynamic",
      "database-query",
      "soql-injection",
      "security",
      "escapeSingleQuotes",
    ],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## Dynamic SOQL

Le Dynamic SOQL permet de construire des requêtes SOQL **sous forme de String** à l'exécution. Indispensable quand les champs ou objets à interroger ne sont pas connus à la compilation.

### Syntaxe de base

\`\`\`apex
// Database.query() — retourne List<SObject>
String objectName = 'Account';
String condition = 'Technology';
String query = 'SELECT Id, Name FROM ' + objectName + ' WHERE Industry = \'' + condition + '\'';

List<SObject> results = Database.query(query);

// Cast si on connaît le type
List<Account> accounts = (List<Account>) Database.query(query);
\`\`\`

### Database.queryWithBinds() — La bonne pratique (API v57.0+)

\`\`\`apex
// Depuis Winter '23, on peut passer des bind variables en Map
Map<String, Object> binds = new Map<String, Object>{
  'industry' => 'Technology',
  'minRevenue' => 1000000
};

List<Account> accounts = (List<Account>) Database.queryWithBinds(
  'SELECT Id, Name FROM Account WHERE Industry = :industry AND AnnualRevenue >= :minRevenue',
  binds,
  AccessLevel.USER_MODE  // respecte les FLS (Field Level Security)
);
\`\`\`

### Risque : SOQL Injection

\`\`\`apex
// ❌ DANGEREUX — l'utilisateur contrôle la String
String userInput = ApexPages.currentPage().getParameters().get('name');
// Si userInput = "' OR Name != '" → toute la table est retournée !
String query = 'SELECT Id FROM Account WHERE Name = \'' + userInput + '\'';
List<SObject> results = Database.query(query);

// ✅ SÉCURISÉ — toujours utiliser String.escapeSingleQuotes()
String safeInput = String.escapeSingleQuotes(userInput);
String query = 'SELECT Id FROM Account WHERE Name = \'' + safeInput + '\'';

// ✅ ENCORE MIEUX — Database.queryWithBinds()
Map<String, Object> binds = new Map<String, Object>{ 'name' => userInput };
List<Account> results = (List<Account>) Database.queryWithBinds(
  'SELECT Id, Name FROM Account WHERE Name = :name',
  binds,
  AccessLevel.USER_MODE
);
\`\`\`

### AccessLevel et FLS

\`\`\`apex
// USER_MODE : respecte les permissions de l'utilisateur courant (FLS, CRUD)
// SYSTEM_MODE : ignore les permissions (comme le code Apex standard sans WITH SECURITY_ENFORCED)

// USER_MODE est la bonne pratique pour les queries exposées aux utilisateurs
List<Account> accounts = (List<Account>) Database.queryWithBinds(
  'SELECT Id, Name, AnnualRevenue FROM Account',
  new Map<String, Object>(),
  AccessLevel.USER_MODE
);

// WITH SECURITY_ENFORCED (alternative pour SOQL statique)
List<Account> accounts2 = [
  SELECT Id, Name, AnnualRevenue
  FROM Account
  WITH SECURITY_ENFORCED  // lève une exception si l'user n'a pas accès à un champ
];
\`\`\`

### Construire dynamiquement des listes de champs

\`\`\`apex
// Pattern : récupérer tous les champs d'un objet dynamiquement
Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Account.fields.getMap();
List<String> fieldNames = new List<String>(fieldMap.keySet());
String fields = String.join(fieldNames, ', ');

String query = 'SELECT ' + fields + ' FROM Account LIMIT 10';
List<SObject> results = Database.query(query);
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Dynamic SOQL ≈ requêtes SQL dynamiques avec paramètres

// ❌ Dangereux (SQL injection) :
const query = \`SELECT * FROM users WHERE name = '\${userInput}'\`;
await db.query(query);

// ✅ Sécurisé avec paramètres liés (équivalent Database.queryWithBinds) :
await db.query('SELECT * FROM users WHERE name = $1', [userInput]);
// ou avec Prisma :
await prisma.user.findMany({ where: { name: userInput } });

// SOQL injection = même principe que SQL injection
// String.escapeSingleQuotes() ≈ échappement des paramètres SQL
// Database.queryWithBinds() ≈ prepared statements

// La règle d'or : JAMAIS de concaténation directe de user input dans une query
\`\`\`
    `,
    gotchas: [
      "SOQL injection est une vulnérabilité réelle — toujours utiliser escapeSingleQuotes() ou queryWithBinds()",
      "Database.query() s'exécute en SYSTEM_MODE par défaut — ignore les FLS/CRUD de l'utilisateur",
      "Les bind variables (:variable) ne fonctionnent PAS dans Database.query() standard — utiliser queryWithBinds()",
      "Dynamic SOQL ne peut pas utiliser TYPEOF — réservé au SOQL statique",
      "Les SOQL statiques sont vérifiés à la compilation (erreur si le champ n'existe pas) — pas les dynamiques",
      "WITH SECURITY_ENFORCED lève une exception silencieuse si un champ est inaccessible — WITH USER_MODE est préférable",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 12. Bind Variables
  // ─────────────────────────────────────────────
  {
    id: "soql-12-bind-variables",
    title: "SOQL — Bind Variables (:variable) dans SOQL statique",
    category: "SOQL",
    tags: ["soql", "bind-variables", "apex", "security", "performance"],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## Bind Variables en SOQL Statique

Les bind variables permettent d'utiliser des variables Apex directement dans une requête SOQL statique en préfixant le nom de variable avec \`:\`.

### Syntaxe

\`\`\`apex
String industry = 'Technology';
Integer minEmployees = 100;
Date startDate = Date.today().addDays(-30);

List<Account> accounts = [
  SELECT Id, Name, Industry, NumberOfEmployees
  FROM Account
  WHERE Industry = :industry              // String variable
    AND NumberOfEmployees >= :minEmployees // Integer variable
    AND CreatedDate >= :startDate          // Date variable
];
\`\`\`

### Types supportés comme bind variables

\`\`\`apex
// Scalaires
String strVar = 'value';
Integer intVar = 42;
Decimal decVar = 99.99;
Date dateVar = Date.today();
DateTime dtVar = DateTime.now();
Boolean boolVar = true;
Id idVar = 'someId';

// Collections — pour opérateur IN
List<String> industries = new List<String>{'Technology', 'Finance'};
Set<Id> accountIds = new Set<Id>{'001...', '001...'};
Map<Id, Account> accountMap = new Map<Id, Account>([SELECT Id FROM Account]);

// Utilisation avec IN
List<Account> accounts = [
  SELECT Id FROM Account
  WHERE Industry IN :industries
    AND Id NOT IN :accountIds
    AND Id IN :accountMap.keySet()  // ← méthodes autorisées !
];
\`\`\`

### Bind variables dans les relations

\`\`\`apex
Account parentAccount = [SELECT Id FROM Account WHERE Name = 'Acme' LIMIT 1];

// Utiliser l'objet directement (SF résout l'Id automatiquement)
List<Contact> contacts = [
  SELECT Id, Name FROM Contact
  WHERE AccountId = :parentAccount.Id  // accès aux champs de l'objet bindé
];

// Ou plus court :
List<Contact> contacts2 = [
  SELECT Id, Name FROM Contact
  WHERE Account = :parentAccount  // SF infère qu'on compare sur Id
];
\`\`\`

### Bind variables et sécurité

\`\`\`apex
// Les bind variables en SOQL statique sont AUTOMATIQUEMENT sécurisées
// contre l'injection SOQL — SF les traite comme des paramètres liés

// ✅ Sécurisé automatiquement :
String userInput = ApexPages.currentPage().getParameters().get('name');
List<Account> accounts = [SELECT Id FROM Account WHERE Name = :userInput];

// ❌ Dangereux — pas de bind variable :
String query = 'SELECT Id FROM Account WHERE Name = \'' + userInput + '\'';
List<SObject> accounts2 = Database.query(query);
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Bind variables SOQL ≈ paramètres liés dans les ORM TypeScript

// Knex
const accounts = await knex('Account')
  .where('Industry', industry)          // paramètre lié automatiquement
  .whereIn('Industry', industries)       // IN avec array
  .where('NumberOfEmployees', '>=', 100);

// Prisma
const accounts = await prisma.account.findMany({
  where: {
    industry: industry,                  // bind variable implicite
    numberOfEmployees: { gte: 100 },
  },
});

// SOQL : WHERE Industry = :industry (même sécurité que les paramètres liés)
\`\`\`
    `,
    gotchas: [
      "Les bind variables ne fonctionnent PAS dans Database.query() — utiliser Database.queryWithBinds() ou escapeSingleQuotes()",
      "On peut binder des méthodes d'objet directement : WHERE Id IN :accountMap.keySet()",
      "La bind variable est résolue au moment de l'exécution de la requête — pas à la déclaration de la variable",
      "Binder un null fonctionne : WHERE Field = :nullVar équivaut à WHERE Field = null",
      "Les Set<Id> peuvent être bindés directement dans IN sans conversion en List",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 13. Semi-joins et Anti-joins
  // ─────────────────────────────────────────────
  {
    id: "soql-13-semi-anti-joins",
    title: "SOQL — Semi-joins et Anti-joins (WHERE Id IN (SELECT...))",
    category: "SOQL",
    tags: [
      "soql",
      "semi-join",
      "anti-join",
      "subquery",
      "in",
      "not-in",
      "correlated",
    ],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## Semi-joins et Anti-joins

Ces patterns permettent de filtrer des records basé sur l'existence (ou l'absence) de records liés, sans charger les records liés en mémoire.

### Semi-join — WHERE Id IN (SELECT ...)

\`\`\`apex
// Contacts qui ont au moins une Opportunity associée (via AccountId)
SELECT Id, Name, Email FROM Contact
WHERE AccountId IN (
  SELECT AccountId FROM Opportunity
  WHERE StageName = 'Closed Won'
    AND CloseDate = THIS_YEAR
)

// Accounts avec au moins un Contact
SELECT Id, Name FROM Account
WHERE Id IN (
  SELECT AccountId FROM Contact
  WHERE Email != null
)

// Leads créés à partir de campagnes actives
SELECT Id, Name, Status FROM Lead
WHERE Id IN (
  SELECT LeadId FROM CampaignMember
  WHERE CampaignId IN (
    SELECT Id FROM Campaign
    WHERE IsActive = true
      AND Type = 'Email'
  )
)
\`\`\`

### Anti-join — WHERE Id NOT IN (SELECT ...)

\`\`\`apex
// Contacts SANS Opportunity associée (leads froids)
SELECT Id, Name, Email FROM Contact
WHERE AccountId NOT IN (
  SELECT AccountId FROM Opportunity
  WHERE CreatedDate >= LAST_N_DAYS:90
)

// Accounts sans aucun Contact
SELECT Id, Name FROM Account
WHERE Id NOT IN (
  SELECT AccountId FROM Contact
  WHERE AccountId != null
)
\`\`\`

### Règles des sous-requêtes de filtrage

\`\`\`apex
// La sous-requête dans IN/NOT IN doit :
// 1. Retourner UN SEUL champ (pas SELECT Id, Name)
// 2. Ce champ doit être compatible avec le champ de la clause principale
// 3. Le champ doit être un Id ou un champ indexé pour les meilleures performances

// ✅ Correct
WHERE AccountId IN (SELECT AccountId FROM Opportunity)
WHERE Id IN (SELECT Id FROM Account WHERE Industry = 'Technology')

// ❌ Erreur — plusieurs champs
WHERE AccountId IN (SELECT AccountId, Name FROM Opportunity)

// Cas particulier — filtrage sur un champ custom
WHERE Account__c IN (SELECT Id FROM Account__c WHERE IsActive__c = true)
\`\`\`

### Semi-join avec des objets non-liés directement

\`\`\`apex
// Pattern avancé : filtrer par records d'un objet de jonction
// Contacts membres d'un groupe spécifique (via un objet junction)
SELECT Id, Name FROM Contact
WHERE Id IN (
  SELECT Contact__c FROM Group_Membership__c
  WHERE Group__r.Name = 'VIP Customers'
    AND IsActive__c = true
)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Semi-join ≈ Array.filter() avec Set pour les performances

// Anti-join en TypeScript :
const accountsWithOpps = new Set(
  opportunities.map(o => o.accountId)
);
const accountsWithoutOpps = accounts.filter(
  a => !accountsWithOpps.has(a.id)
);

// SOQL équivalent (côté serveur, sans charger les données) :
// SELECT Id, Name FROM Account
// WHERE Id NOT IN (SELECT AccountId FROM Opportunity)

// Avantage majeur : en SOQL, AUCUNE donnée n'est transférée vers Apex
// La filtration se fait entièrement dans la base de données SF
// En TypeScript, on chargerait tout en mémoire pour faire le filter()
\`\`\`
    `,
    gotchas: [
      "La sous-requête dans IN ne peut retourner qu'UN SEUL champ — sinon erreur de compilation",
      "NOT IN avec un sous-ensemble incluant des valeurs NULL retourne 0 résultats — comportement SQL standard souvent oublié",
      "Les sous-requêtes de semi-join comptent dans le quota de 100 SOQL par transaction",
      "La sous-requête peut elle-même avoir un WHERE, ORDER BY, LIMIT — mais pas de sous-requête imbriquée",
      "Pour les performances, le champ dans la sous-requête devrait être indexé (Id, champs externaux ID, champs uniques)",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 14. FIELDS()
  // ─────────────────────────────────────────────
  {
    id: "soql-14-fields-function",
    title: "SOQL — FIELDS(ALL), FIELDS(STANDARD), FIELDS(CUSTOM)",
    category: "SOQL",
    tags: [
      "soql",
      "fields",
      "fields-all",
      "fields-standard",
      "fields-custom",
      "api",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## La fonction FIELDS()

FIELDS() permet de sélectionner des groupes de champs sans les lister explicitement. C'est le SELECT * de SOQL — mais avec des nuances importantes.

### Trois variantes

\`\`\`apex
// FIELDS(ALL) — tous les champs (standard + custom)
SELECT FIELDS(ALL) FROM Account LIMIT 200

// FIELDS(STANDARD) — uniquement les champs standard
SELECT FIELDS(STANDARD) FROM Account LIMIT 200

// FIELDS(CUSTOM) — uniquement les champs custom (__c)
SELECT FIELDS(CUSTOM) FROM Account LIMIT 200

// Combinaison avec des champs spécifiques
SELECT FIELDS(STANDARD), CustomField__c, AnotherCustom__c
FROM Account
LIMIT 200
\`\`\`

### Restrictions importantes

\`\`\`apex
// 1. LIMIT est OBLIGATOIRE avec FIELDS() — max 200
SELECT FIELDS(ALL) FROM Account  // ERREUR — LIMIT manquant

// 2. Uniquement disponible via REST API ou Tooling API
//    PAS disponible dans Apex statique ou Dynamic SOQL
//    (sauf depuis Summer '21 en Developer Preview)

// 3. Pas de WHERE possible avec FIELDS(ALL) dans certains contextes
// 4. Pas de relationship queries avec FIELDS()

// En Apex, pour obtenir tous les champs dynamiquement :
Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe()
  .get('Account').getDescribe().fields.getMap();
String allFields = String.join(new List<String>(fieldMap.keySet()), ', ');
List<SObject> results = Database.query(
  'SELECT ' + allFields + ' FROM Account LIMIT 50'
);
\`\`\`

### Cas d'usage

\`\`\`apex
// Via REST API pour l'exploration :
// GET /services/data/v59.0/query?q=SELECT+FIELDS(ALL)+FROM+Account+LIMIT+5

// Excellent pour le debugging et l'exploration d'un objet inconnu
// Mauvaise pratique en production (sur-sélection de champs = performance)

// Bonne pratique en production : toujours lister les champs nécessaires
// SELECT Id, Name, Industry, AnnualRevenue FROM Account
// Pas : SELECT FIELDS(ALL) FROM Account
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// FIELDS(ALL) ≈ SELECT * en SQL — pratique pour explorer, mauvais en prod

// TypeScript Prisma équivalent :
// Prisma sélectionne tous les champs par défaut si aucun 'select' n'est spécifié
const accounts = await prisma.account.findMany({ take: 200 });
// → équivalent FIELDS(ALL)

// Bonne pratique dans les deux cas : sélectionner explicitement les champs
const accounts = await prisma.account.findMany({
  select: { id: true, name: true, industry: true },
  take: 200,
});
// → équivalent SELECT Id, Name, Industry FROM Account LIMIT 200
\`\`\`
    `,
    gotchas: [
      "FIELDS() n'est PAS disponible en Apex standard — seulement via API REST ou en Apex avec des restrictions selon la version SF",
      "LIMIT 200 est obligatoire et c'est le maximum absolu avec FIELDS()",
      "FIELDS(ALL) inclut les champs de relation (AccountId, etc.) mais PAS les champs traversés (Account.Name)",
      "En production, toujours lister les champs explicitement pour les performances et la maintenabilité",
      "FIELDS() ne peut pas être combiné avec des relationship queries (sous-requêtes imbriquées)",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL — 15. Limite 100 SOQL par transaction
  // ─────────────────────────────────────────────
  {
    id: "soql-15-governor-limits-soql",
    title: "SOQL — Limite 100 SOQL par transaction — Patterns pour éviter",
    category: "SOQL",
    tags: [
      "soql",
      "governor-limits",
      "bulk",
      "patterns",
      "trigger",
      "performance",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Gouvernor Limits SOQL — 100 requêtes par transaction

Salesforce limite Apex à **100 requêtes SOQL par transaction synchrone** (200 en asynchrone). Dépasser cette limite lève une exception :
\`System.LimitException: Too many SOQL queries: 101\`

### Les anti-patterns courants

\`\`\`apex
// ❌ SOQL dans une boucle (le pire pattern)
for (Account acc : accounts) {
  // 1 SOQL par itération → 200 accounts = 200 requêtes → BOOM
  List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
  processContacts(contacts, acc);
}

// ❌ SOQL dans un trigger appelé en bulk
trigger ContactTrigger on Contact (after insert) {
  for (Contact c : Trigger.new) {
    // Si 200 contacts insérés → 200 SOQL
    Account acc = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId];
  }
}
\`\`\`

### Pattern 1 : Collecter les Ids, requêter une fois

\`\`\`apex
// ✅ Pattern Map — 1 SOQL au lieu de N
// Collecter tous les AccountIds d'abord
Set<Id> accountIds = new Set<Id>();
for (Contact c : Trigger.new) {
  if (c.AccountId != null) accountIds.add(c.AccountId);
}

// Une seule requête pour tous les accounts
Map<Id, Account> accountMap = new Map<Id, Account>([
  SELECT Id, Name, Industry, AnnualRevenue
  FROM Account
  WHERE Id IN :accountIds
]);

// Traiter sans requête supplémentaire
for (Contact c : Trigger.new) {
  Account acc = accountMap.get(c.AccountId);
  if (acc != null) {
    // process avec acc
  }
}
\`\`\`

### Pattern 2 : Sous-requêtes à la place de multiples queries

\`\`\`apex
// ❌ 2 requêtes séparées
List<Account> accounts = [SELECT Id, Name FROM Account WHERE Industry = 'Technology'];
List<Contact> contacts = [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accounts];

// ✅ 1 requête avec sous-requête parent-to-child
List<Account> accountsWithContacts = [
  SELECT Id, Name, (SELECT Id, FirstName, LastName FROM Contacts)
  FROM Account
  WHERE Industry = 'Technology'
];
\`\`\`

### Pattern 3 : Vérifier les limites en runtime

\`\`\`apex
// Defensive programming
if (Limits.getQueries() >= Limits.getLimitQueries() - 5) {
  // Moins de 5 queries restantes — lever une exception contrôlée ou logguer
  System.debug('WARNING: Approaching SOQL limit. Queries used: ' + Limits.getQueries());
}

// Utile aussi :
System.debug('SOQL queries used: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
System.debug('DML statements used: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
System.debug('Records processed: ' + Limits.getDmlRows() + '/' + Limits.getLimitDmlRows());
\`\`\`

### Pattern 4 : Trigger Handler Pattern

\`\`\`apex
// Séparer la logique en méthodes qui prennent des collections
public class ContactTriggerHandler {
  public static void afterInsert(List<Contact> newContacts) {
    // Collecter les IDs une seule fois
    Set<Id> accountIds = new Set<Id>();
    for (Contact c : newContacts) {
      if (c.AccountId != null) accountIds.add(c.AccountId);
    }

    // 1 requête pour toutes les données nécessaires
    Map<Id, Account> accounts = new Map<Id, Account>([
      SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds
    ]);

    // Traitement bulk sans SOQL supplémentaire
    List<Task> tasksToCreate = new List<Task>();
    for (Contact c : newContacts) {
      Account acc = accounts.get(c.AccountId);
      if (acc != null && acc.Industry == 'Technology') {
        tasksToCreate.add(new Task(
          Subject = 'Welcome call',
          WhoId = c.Id,
          WhatId = acc.Id
        ));
      }
    }

    if (!tasksToCreate.isEmpty()) insert tasksToCreate;
  }
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Le N+1 problem existe en TypeScript aussi — même solution

// ❌ N+1 en TypeScript :
const accounts = await prisma.account.findMany();
for (const account of accounts) {
  // 1 query par account → N+1 !
  const contacts = await prisma.contact.findMany({
    where: { accountId: account.id },
  });
}

// ✅ Solution TypeScript (include ou DataLoader) :
const accounts = await prisma.account.findMany({
  include: { contacts: true }, // 1 seule query avec JOIN
});

// ✅ Solution SOQL : collecte d'IDs + 1 requête
// WHERE AccountId IN :accountIds
// → Même pattern, même raison, même solution
\`\`\`

Le problème N+1 est universel. SOQL le rend impossible à ignorer grâce aux governor limits.
    `,
    gotchas: [
      "100 SOQL synchrone, 200 async — cette limite s'applique à toute la transaction (triggers inclus)",
      "Un seul record inséré peut déclencher des triggers qui consomment des dizaines de SOQL — toujours bulkifier",
      "Les appels de méthodes Apex qui font des SOQL consomment le quota de la transaction appelante",
      "Limits.getQueries() retourne le nombre de SOQL utilisés jusqu'ici dans la transaction courante",
      "Les sous-requêtes parent-to-child comptent comme une requête supplémentaire par sous-requête",
      "Les requêtes dans @future, Batch, Queueable ont leur propre compteur (nouveau contexte de transaction)",
    ],
  },

  // ─────────────────────────────────────────────
  // SOSL — 16. SOSL Find
  // ─────────────────────────────────────────────
  {
    id: "sosl-16-find-syntax",
    title: "SOSL — Syntaxe FIND et RETURNING",
    category: "SOSL",
    tags: ["sosl", "find", "search", "full-text", "in-all-fields", "returning"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## SOSL — Salesforce Object Search Language

SOSL est le moteur de recherche full-text de Salesforce. Là où SOQL cherche dans des champs précis, SOSL cherche dans **l'index de recherche Salesforce** — une solution indexée optimisée pour la recherche textuelle multi-objets.

### Syntaxe complète

\`\`\`sql
FIND 'searchString'
[IN fieldGroup]
[RETURNING objectList]
[WITH options]
[LIMIT n]
\`\`\`

### Groupes de champs disponibles

\`\`\`apex
// IN ALL FIELDS — tous les champs texte indexés (défaut)
FIND 'Acme' IN ALL FIELDS RETURNING Account, Contact

// IN NAME FIELDS — seulement les champs "Name" (plus rapide)
FIND 'Dupont' IN NAME FIELDS RETURNING Account, Contact

// IN EMAIL FIELDS — seulement les champs Email
FIND 'jean@example.com' IN EMAIL FIELDS RETURNING Contact, Lead

// IN PHONE FIELDS — seulement les champs téléphone
FIND '0612345678' IN PHONE FIELDS RETURNING Contact, Lead

// IN SIDEBAR FIELDS — champs affichés dans la barre latérale SF
FIND 'Acme' IN SIDEBAR FIELDS RETURNING Account
\`\`\`

### RETURNING — Filtres sur les objets retournés

\`\`\`apex
// Syntaxe : RETURNING ObjectName(fields WHERE condition ORDER BY field LIMIT n)
List<List<SObject>> results = [
  FIND 'Acme'
  IN ALL FIELDS
  RETURNING
    Account(Id, Name, Industry, AnnualRevenue
      WHERE Industry = 'Technology'
      ORDER BY AnnualRevenue DESC
      LIMIT 5),
    Contact(Id, FirstName, LastName, Email
      WHERE Email != null
      ORDER BY LastName ASC
      LIMIT 10),
    Opportunity(Id, Name, Amount, StageName
      WHERE StageName != 'Closed Lost')
  LIMIT 100
];

// Accès aux résultats
List<Account> accounts = (List<Account>) results[0];
List<Contact> contacts = (List<Contact>) results[1];
List<Opportunity> opportunities = (List<Opportunity>) results[2];
\`\`\`

### Wildcards et opérateurs de recherche

\`\`\`apex
// Wildcard * — zéro ou plusieurs caractères (fin de mot)
FIND 'Acme*' IN ALL FIELDS RETURNING Account  // Acme, AcmeCorp, Acme Inc

// Wildcard ? — exactement un caractère
FIND 'Acm?' IN ALL FIELDS RETURNING Account  // Acme, Acmi, mais pas Acmex

// Phrases exactes entre guillemets
FIND '"Acme Corporation"' IN ALL FIELDS RETURNING Account

// Opérateur AND (par défaut entre mots)
FIND 'Acme Technology' IN ALL FIELDS RETURNING Account  // contient "Acme" ET "Technology"

// Opérateur OR
FIND 'Acme OR Technology' IN ALL FIELDS RETURNING Account

// Opérateur AND NOT
FIND 'Acme AND NOT Corporation' IN ALL FIELDS RETURNING Account

// Pas de wildcard au DÉBUT du mot
FIND '*corp' // ERREUR — wildcard en début non supporté
\`\`\`

### WITH options

\`\`\`apex
// Filtrer par Data Category (Knowledge)
FIND 'reset password'
IN ALL FIELDS
RETURNING KnowledgeArticleVersion(Id, Title)
WITH DATA CATEGORY Security__c AT public

// Respect des permissions utilisateur
FIND 'Acme'
IN ALL FIELDS
RETURNING Account(Id, Name)
WITH USER_MODE  // respecte les permissions de l'utilisateur

// Filtrer par Network (Experience Cloud)
FIND 'product'
IN ALL FIELDS
RETURNING FeedItem(Id, Body)
WITH NETWORK = '...'

// Snippet — extrait de texte autour du terme trouvé
FIND 'Acme'
IN ALL FIELDS
RETURNING Account(Id, Name, SNIPPET(Description))
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// SOSL ≈ Elasticsearch ou Algolia en TypeScript

// SOQL : requête précise sur un champ spécifique
// SELECT Id FROM Account WHERE Name = 'Acme'
// ≈ prisma.account.findFirst({ where: { name: 'Acme' } })

// SOSL : recherche full-text multi-objets
// FIND 'Acme' IN ALL FIELDS RETURNING Account, Contact
// ≈ elasticsearch.search({ query: { multi_match: { query: 'Acme', fields: ['*'] } } })
//   + filtrer par types Account et Contact

// La différence clé : SOSL retourne List<List<SObject>>
// — un tableau par objet dans RETURNING
// Équivalent d'un résultat de recherche multi-index Elasticsearch

const results = [FIND 'term' RETURNING Account, Contact, Opportunity];
// results[0] = List<Account>
// results[1] = List<Contact>
// results[2] = List<Opportunity>
\`\`\`
    `,
    gotchas: [
      "SOSL retourne List<List<SObject>> — un niveau d'imbrication de plus que SOQL",
      "Les mots de moins de 2 caractères sont ignorés par l'index de recherche",
      "Les wildcards ne peuvent pas être au DÉBUT d'un terme — '*corp' est invalide",
      "SOSL ne cherche pas dans les champs Number, Date, Checkbox — seulement les champs texte indexés",
      "Limite : 200 records max par objet dans RETURNING, 2000 records au total par requête SOSL",
      "SOSL ne garantit pas l'ordre des résultats sans ORDER BY dans RETURNING",
    ],
  },

  // ─────────────────────────────────────────────
  // SOSL — 17. SOQL vs SOSL
  // ─────────────────────────────────────────────
  {
    id: "sosl-17-soql-vs-sosl",
    title: "SOSL vs SOQL — Arbre de décision",
    category: "SOSL",
    tags: ["sosl", "soql", "comparison", "decision", "search", "query"],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## SOQL vs SOSL — Quand utiliser lequel ?

### Règle de base

| Critère | SOQL | SOSL |
|---------|------|------|
| Je connais l'objet cible | ✅ | ❌ |
| Je cherche dans plusieurs objets | ❌ | ✅ |
| Je filtre sur un Id spécifique | ✅ | ❌ |
| Recherche full-text libre | ❌ | ✅ |
| Je veux 0 résultats si non trouvé | ✅ | ✅ |
| Je veux des résultats approximatifs | ❌ | ✅ |
| Champs Number, Date, Checkbox | ✅ | ❌ |
| Barre de recherche utilisateur | ❌ | ✅ |

### Arbre de décision

\`\`\`
Tu veux récupérer des données ?
│
├─ Tu connais l'objet ET tu filtres sur des champs précis ?
│   → SOQL : SELECT ... FROM Object WHERE field = 'value'
│
├─ Tu cherches un terme textuel libre dans plusieurs objets ?
│   → SOSL : FIND 'term' IN ALL FIELDS RETURNING Object1, Object2
│
├─ Tu as un Id exact ?
│   → SOQL : SELECT ... FROM Object WHERE Id = :id
│
├─ L'utilisateur tape dans une barre de recherche ?
│   → SOSL (ou SOQL LIKE si sur un seul objet + champ)
│
├─ Tu veux des records liés à d'autres records (JOIN-like) ?
│   → SOQL avec sous-requêtes ou notation pointée
│
└─ Tu veux des articles de Knowledge Base ?
    → SOSL avec RETURNING KnowledgeArticleVersion
\`\`\`

### Exemples comparatifs

\`\`\`apex
// Scénario : "Trouver le client Acme"

// SOQL — tu sais que c'est un Account et tu cherches par Name exact
SELECT Id, Name FROM Account WHERE Name = 'Acme Corp' LIMIT 1

// SOSL — recherche floue, tu ne sais pas si c'est un Account ou un Contact
FIND 'Acme' IN NAME FIELDS
RETURNING Account(Id, Name), Contact(Id, Name)

// Scénario : "Qui a mentionné 'urgent' dans des emails, des cases ou des notes ?"
// → SOSL, car multi-objets et full-text
FIND 'urgent' IN ALL FIELDS
RETURNING Case(Id, CaseNumber, Subject), EmailMessage(Id, Subject, TextBody)

// Scénario : "Toutes les Opportunities avec Amount > 100000 ce trimestre"
// → SOQL, car filtre sur des champs Number et Date
SELECT Id, Name, Amount FROM Opportunity
WHERE Amount > 100000 AND CloseDate = THIS_QUARTER
\`\`\`

### Limites comparées

| Limite | SOQL | SOSL |
|--------|------|------|
| Par transaction | 100 requêtes | 20 requêtes |
| Records retournés | 50 000 | 2 000 |
| Heap impact | Élevé | Faible |
| Coût de performance | Variable | Indexé (rapide) |
    `,
    tsAnalogy: `
\`\`\`typescript
// SOQL ≈ requête SQL précise sur une base de données relationnelle
// SOSL ≈ requête sur un moteur de recherche (Elasticsearch, Algolia)

// SOQL : "donne-moi les utilisateurs où email = 'jean@example.com'"
await prisma.user.findUnique({ where: { email: 'jean@example.com' } });

// SOSL : "cherche 'jean' dans tous les champs de plusieurs entités"
const results = await elasticsearch.search({
  body: {
    query: { multi_match: { query: 'jean', fields: ['*'] } },
    // + filtrer par types User, Company, Order
  }
});

// Règle d'or :
// - Base de données structurée + champs connus → SOQL
// - Moteur de recherche full-text multi-entités → SOSL
\`\`\`
    `,
    gotchas: [
      "SOSL ne cherche PAS dans les champs Number, Date, Boolean — si vous filtrez sur Amount ou CloseDate, c'est SOQL",
      "SOSL a une limite de 20 requêtes par transaction vs 100 pour SOQL",
      "SOSL peut retourner des résultats d'objets pour lesquels l'utilisateur n'a pas de permission — filtrer avec WITH USER_MODE",
      "Les nouveaux records peuvent ne pas apparaître immédiatement dans l'index SOSL (délai d'indexation)",
      "Pour la certification PD1 : retenir que SOSL est utilisé pour la recherche multi-objets full-text",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 18. Objets Standard
  // ─────────────────────────────────────────────
  {
    id: "dm-18-standard-objects",
    title: "Data Model — Objets Standard Essentiels",
    category: "Data Model",
    tags: [
      "data-model",
      "standard-objects",
      "account",
      "contact",
      "lead",
      "opportunity",
      "case",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I", "Integration-Arch"],
    content: `
## Les Objets Standard Salesforce Essentiels

### Schéma de relations

\`\`\`
Lead → (conversion) → Account + Contact + Opportunity
        │
        Account ─────────── Contact (Lookup)
           │                    │
           └─ Opportunity        └─ Case (Lookup)
                  │
                  └─ OpportunityLineItem (Master-Detail)
                              │
                              └─ Product2 (Lookup)

Activity Objects (polymorphiques) :
Task.WhoId → Contact | Lead
Task.WhatId → Account | Opportunity | Case | ...
Event.WhoId → Contact | Lead
Event.WhatId → Account | Opportunity | ...
\`\`\`

### Account

Le cœur du CRM. Représente une **entreprise ou organisation**.

\`\`\`apex
// Champs essentiels :
// Id, Name, Industry, AnnualRevenue, NumberOfEmployees
// BillingAddress (BillingStreet, BillingCity, BillingState, BillingCountry)
// Phone, Website, OwnerId, ParentId (Account parent — hiérarchie)

// Relation parent/enfant pour les groupes d'entreprises
SELECT Id, Name, Parent.Name FROM Account WHERE ParentId != null

// Account Hierarchy
SELECT Id, Name, (SELECT Id, Name FROM ChildAccounts) FROM Account
WHERE ParentId = null  // Comptes racine
\`\`\`

### Contact

Représente une **personne** liée à un Account.

\`\`\`apex
// Champs essentiels :
// Id, FirstName, LastName, Email, Phone, MobilePhone
// AccountId (Lookup vers Account — optionnel)
// Title, Department, Birthdate, MailingAddress
// OwnerId, ReportsToId (Contact manager — self-relation)

SELECT Id, FirstName, LastName, Email, Account.Name, ReportsTo.Name
FROM Contact
WHERE Account.Industry = 'Technology'
\`\`\`

### Lead

Représente un **prospect non qualifié** (pas encore associé à un Account).

\`\`\`apex
// Champs essentiels :
// Id, FirstName, LastName, Company, Email, Phone
// Status (Open, Working, Closed - Converted, Closed - Not Converted)
// LeadSource, Rating, Industry
// IsConverted, ConvertedDate, ConvertedAccountId, ConvertedContactId, ConvertedOpportunityId

// IMPORTANT : quand un Lead est converti, il crée Account + Contact + (optionnel) Opportunity
SELECT Id, Name, Status, IsConverted, ConvertedAccountId FROM Lead
WHERE IsConverted = false AND Status = 'Working'
\`\`\`

### Opportunity

Représente une **opportunité de vente** (deal en cours).

\`\`\`apex
// Champs essentiels :
// Id, Name, Amount, StageName, CloseDate, Probability
// AccountId, OwnerId, Type, LeadSource
// IsClosed, IsWon

// Stages standard : Prospecting, Qualification, Needs Analysis,
// Value Proposition, Id. Decision Makers, Perception Analysis,
// Proposal/Price Quote, Negotiation/Review, Closed Won, Closed Lost

SELECT Id, Name, Amount, StageName, CloseDate, Account.Name
FROM Opportunity
WHERE IsClosed = false
ORDER BY CloseDate ASC
\`\`\`

### Case

Représente une **demande de support client**.

\`\`\`apex
// Champs essentiels :
// Id, CaseNumber (auto-généré), Subject, Description, Status
// AccountId, ContactId, OwnerId, Priority, Origin
// IsClosed, IsEscalated

SELECT Id, CaseNumber, Subject, Status, Priority, Account.Name, Contact.Name
FROM Case
WHERE IsClosed = false AND Priority = 'High'
ORDER BY CreatedDate ASC
\`\`\`

### Task et Event

Activités liées à n'importe quel objet.

\`\`\`apex
// Task : action à faire (appel, email, todo)
SELECT Id, Subject, Status, ActivityDate, Who.Name, What.Name
FROM Task
WHERE OwnerId = :UserInfo.getUserId()
  AND Status != 'Completed'
  AND ActivityDate <= NEXT_N_DAYS:7
ORDER BY ActivityDate ASC

// Event : réunion planifiée avec durée
SELECT Id, Subject, StartDateTime, EndDateTime, Who.Name
FROM Event
WHERE OwnerId = :UserInfo.getUserId()
  AND StartDateTime >= TODAY
ORDER BY StartDateTime ASC
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Les objets Salesforce ≈ modèles Prisma avec relations définies

// schema.prisma équivalent (simplifié) :
// model Account {
//   id           String   @id
//   name         String
//   industry     String?
//   annualRevenue Decimal?
//   contacts     Contact[]
//   opportunities Opportunity[]
//   cases        Case[]
//   parent       Account? @relation("AccountHierarchy", fields: [parentId])
//   children     Account[] @relation("AccountHierarchy")
// }

// model Contact {
//   id        String  @id
//   firstName String
//   lastName  String
//   email     String?
//   account   Account? @relation(fields: [accountId])
//   accountId String?
// }

// La différence : ces modèles sont PRÉ-DÉFINIS dans Salesforce
// Vous ajoutez des champs custom (__c) mais la structure de base est fixe
\`\`\`
    `,
    gotchas: [
      "Lead et Contact sont des objets DISTINCTS — un Lead n'est pas un Contact tant qu'il n'est pas converti",
      "AccountId sur Contact est optionnel — un Contact peut exister sans Account (Contact privé)",
      "Task et Event sont des 'Activity' — ils partagent le même onglet Activités dans l'UI",
      "Case.ContactId est une Lookup optionnelle — il peut y avoir des cases sans contact associé",
      "Opportunity.CloseDate est obligatoire (même si le deal n'est pas encore fermé) — c'est la date de clôture prévue",
      "Le champ 'Name' sur Account est un texte libre, mais sur Contact c'est un champ calculé (FirstName + LastName)",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 19. Custom Objects
  // ─────────────────────────────────────────────
  {
    id: "dm-19-custom-objects",
    title: "Data Model — Custom Objects et convention __c",
    category: "Data Model",
    tags: [
      "data-model",
      "custom-objects",
      "__c",
      "api-name",
      "setup",
      "schema",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## Custom Objects — Créer vos propres tables

### Convention de nommage

Tous les éléments **custom** (créés par vous) dans Salesforce portent le suffixe \`__c\` dans leur API Name.

\`\`\`
Label : "Invoice"
API Name : Invoice__c
\`\`\`

\`\`\`apex
// Requêter un objet custom
SELECT Id, Name, Amount__c, Status__c, Account__c
FROM Invoice__c
WHERE Status__c = 'Pending'
  AND Account__r.Industry = 'Technology'  // champ custom de relation
ORDER BY CreatedDate DESC

// Créer des records
Invoice__c invoice = new Invoice__c(
  Name = 'INV-2024-001',
  Amount__c = 5000.00,
  Status__c = 'Draft',
  Account__c = accountId  // Lookup vers Account
);
insert invoice;

// Mettre à jour
invoice.Status__c = 'Pending';
update invoice;
\`\`\`

### Structure d'un Custom Object

Chaque Custom Object a automatiquement :
- **Id** : Identifiant unique Salesforce (18 caractères)
- **Name** : Champ label (Text ou Auto-Number selon la config)
- **CreatedDate**, **CreatedById**, **LastModifiedDate**, **LastModifiedById**
- **OwnerId** : Propriétaire du record (si "org-wide default" = Private)
- **IsDeleted** : Flag de corbeille

### API Name vs Label

\`\`\`apex
// Label : "Facture de vente" (affiché dans l'UI)
// API Name : Facture_de_vente__c (utilisé dans le code)
// Les espaces deviennent des underscores dans l'API Name

// Accès en Apex
Schema.SObjectType t = Schema.getGlobalDescribe().get('Invoice__c');
Schema.DescribeSObjectResult d = t.getDescribe();
System.debug('Label: ' + d.getLabel());
System.debug('API Name: ' + d.getName());
\`\`\`

### Bonnes pratiques de nommage

\`\`\`
✅ Invoice__c          (simple, clair)
✅ Invoice_Line__c     (compound noun avec underscore)
✅ Sales_Territory__c  (descriptif)

❌ Inv__c              (trop court, peu lisible)
❌ MySuperCoolInvoice__c  (trop long, eviter camelCase)
❌ Invoice2__c         (numéros à éviter)
\`\`\`

### Où créer un Custom Object

\`\`\`
Setup > Object Manager > Create > Custom Object
  → Label (singular)
  → Label (plural)
  → Object Name (→ API Name = ObjectName__c)
  → Data Type for Name field (Text | Auto Number)
  → Deployment Status (In Development | Deployed)
  → Other options (Sharing, Activities, History Tracking...)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Custom Object ≈ créer un nouveau modèle dans votre schema Prisma

// Avant (seulement objets standard) :
// model Account { ... }
// model Contact { ... }

// Après (ajout d'un custom object) :
// model Invoice__c {  ← le __c indique que c'est custom, pas standard
//   id         String   @id    // toujours présent
//   name       String           // champ Name obligatoire
//   amount     Decimal?         // Invoice__c.Amount__c
//   status     String?          // Invoice__c.Status__c
//   accountId  String?          // Invoice__c.Account__c (Lookup)
//   account    Account? @relation(...)
//   createdAt  DateTime @default(now())
//   updatedAt  DateTime @updatedAt
// }

// La différence : en Salesforce, vous ne touchez JAMAIS au DDL SQL
// Tout se fait via l'UI (Setup) ou les Metadata API — SF gère la DB
\`\`\`
    `,
    gotchas: [
      "Le suffixe __c s'applique aux Custom Objects ET aux Custom Fields — toujours __c pour tout ce qui est custom",
      "Le 'Name' d'un Custom Object peut être Text (saisi manuellement) ou Auto-Number (SF génère automatiquement)",
      "Vous ne pouvez pas supprimer un Custom Object s'il est référencé dans du code Apex ou des Flow",
      "Max 3000 Custom Objects par org (edition Unlimited). Enterprise = 2000, Professional = 50",
      "Les Custom Objects héritent automatiquement des champs système (CreatedDate, etc.) — pas besoin de les créer",
      "Deployment Status 'In Development' rend l'objet invisible aux utilisateurs finaux",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 20. Custom Fields
  // ─────────────────────────────────────────────
  {
    id: "dm-20-custom-fields",
    title: "Data Model — Custom Fields et types de champs",
    category: "Data Model",
    tags: [
      "data-model",
      "custom-fields",
      "field-types",
      "formula",
      "roll-up-summary",
      "picklist",
      "lookup",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "JS-Dev-I"],
    content: `
## Types de Custom Fields

### Types de base

| Type | API Type | Description | Exemple |
|------|----------|-------------|---------|
| Text | String | Texte libre (max 255 chars) | Name, Description |
| Text Area | String | Texte multiligne (max 255) | Short description |
| Long Text Area | String | Texte long (max 131072) | Notes, HTML |
| Rich Text Area | String | HTML riche | Body |
| Number | Double | Nombre décimal | Score, Quantité |
| Currency | Double | Montant monétaire | Amount, Price |
| Percent | Double | Pourcentage | Discount__c |
| Checkbox | Boolean | Vrai/Faux | IsActive__c |
| Date | Date | Date sans heure | BirthDate |
| DateTime | DateTime | Date avec heure | EventStart__c |
| Email | String | Email (validé format) | EmailPro__c |
| Phone | String | Téléphone (formaté) | MobilePhone__c |
| URL | String | URL (validé format) | WebsiteURL__c |
| Picklist | String | Liste déroulante simple | Status__c |
| Multi-Select Picklist | String | Sélection multiple | Skills__c |
| Auto Number | String | Numéro auto-incrémenté | InvoiceNumber__c |
| Geolocation | Object | Latitude + Longitude | Location__c |

### Champs spéciaux

**Formula Field** : valeur calculée, jamais stockée en base.

\`\`\`apex
// Exemple Formula Field : FullName__c = FirstName__c + ' ' + LastName__c
// Formula : FirstName__c & ' ' & LastName__c

// En SOQL, on peut interroger les Formula Fields comme n'importe quel champ
SELECT Id, FullName__c, FirstName__c, LastName__c FROM Employee__c

// Mais on ne peut PAS écrire dans un Formula Field !
// emp.FullName__c = 'test'; // ERREUR à la compilation

// Types de formulas : Text, Number, Currency, Date, DateTime, Checkbox
// Fonctions disponibles : IF(), CASE(), TEXT(), VALUE(), DATE(), TODAY(), ...
\`\`\`

**Roll-Up Summary** : agrégation des valeurs enfants (COUNT, SUM, MIN, MAX).

\`\`\`apex
// Roll-Up Summary sur Account :
// TotalOpportunityAmount__c = SUM(Opportunity.Amount WHERE IsClosed = false)
// OpenOpportunityCount__c = COUNT(Opportunity WHERE IsClosed = false)

// Disponible SEULEMENT sur l'objet parent d'une relation Master-Detail
// Pas possible sur les Lookups !

SELECT Id, Name, TotalOpportunityAmount__c, OpenOpportunityCount__c
FROM Account
WHERE TotalOpportunityAmount__c > 100000
\`\`\`

**Lookup Field** : clé étrangère vers un autre objet.

\`\`\`apex
// Champ Account__c sur Invoice__c (Lookup vers Account)
// API Name : Account__c (stocke l'Id de l'Account)
// Relation name : Account__r (pour traversal)

SELECT Id, Account__r.Name, Account__r.Industry FROM Invoice__c
\`\`\`

**Master-Detail** : relation forte (voir leçon dédiée).

### Picklist — Types de valeurs

\`\`\`apex
// Picklist simple — valeur unique
SELECT Id, Status__c FROM Invoice__c WHERE Status__c = 'Pending'
SELECT Id, Status__c FROM Invoice__c WHERE Status__c IN ('Draft', 'Pending')

// Multi-Select Picklist — valeurs séparées par ;
SELECT Id, Skills__c FROM Developer__c
WHERE Skills__c INCLUDES ('Apex', 'SOQL')  // contient Apex OU SOQL
WHERE Skills__c INCLUDES ('Apex;SOQL')      // contient Apex ET SOQL

// Accès en Apex
Developer__c dev = [SELECT Skills__c FROM Developer__c LIMIT 1];
List<String> skills = dev.Skills__c.split(';');  // scinder les valeurs
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Types de champs SF ≈ types TypeScript + Prisma

// TypeScript / Prisma :
interface Employee {
  id: string;          // Auto (Salesforce Id)
  name: string;        // Text field
  salary: number;      // Currency/Number field
  isActive: boolean;   // Checkbox field
  birthDate: Date;     // Date field
  skills: string[];    // Multi-Select Picklist (stocké comme "Apex;SOQL;JS")
  status: 'Draft' | 'Active' | 'Inactive'; // Picklist
  fullName: string;    // Formula field (computed, read-only)
}

// Roll-Up Summary ≈ propriété calculée depuis les relations :
// interface Account {
//   totalAmount: number; // SUM(opportunities.amount WHERE isClosed = false)
//   openOppCount: number; // COUNT(opportunities WHERE isClosed = false)
// }
// Mais en SF, c'est géré par la plateforme — pas de requête supplémentaire
\`\`\`
    `,
    gotchas: [
      "Formula Fields sont calculés à la volée — impossible de les modifier via DML ni de les indexer",
      "Roll-Up Summary n'est disponible que sur l'objet PARENT d'une Master-Detail (pas sur les Lookups)",
      "Text Area (255) vs Long Text Area : seul Long Text Area supporte les retours à la ligne stockés",
      "Les Picklist values sont globalement partagées via des 'Global Value Sets' ou locales à l'objet",
      "Multi-Select Picklist stocke les valeurs séparées par ';' — à splitter en Apex pour traitement",
      "Currency fields utilisent la 'corporate currency' par défaut — multi-currency avec Advanced Currency Management",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 21. Lookup vs Master-Detail
  // ─────────────────────────────────────────────
  {
    id: "dm-21-lookup-vs-master-detail",
    title: "Data Model — Lookup vs Master-Detail : les 7 différences critiques",
    category: "Data Model",
    tags: [
      "data-model",
      "lookup",
      "master-detail",
      "cascade-delete",
      "sharing",
      "roll-up",
      "reparenting",
      "owd",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Lookup vs Master-Detail — Différences Critiques

C'est l'un des sujets les plus importants pour la certification PD1. Ces deux types de relations semblent similaires mais ont des implications très différentes.

### Tableau comparatif complet

| Critère | Lookup | Master-Detail |
|---------|--------|---------------|
| **1. Cascade Delete** | Non (optionnel) | Oui (toujours) |
| **2. Champ requis** | Optionnel | Obligatoire |
| **3. Roll-Up Summary** | Non | Oui |
| **4. Reparenting** | Oui (modifiable) | Non (par défaut) |
| **5. Sharing (OWD)** | Record indépendant | Hérite du parent |
| **6. Nombre max** | 40 par objet | 2 par objet |
| **7. Impact sur OWD** | Aucun | Contrôle le partage |

### 1. Cascade Delete

\`\`\`apex
// Master-Detail : supprimer le parent SUPPRIME automatiquement tous les enfants
// Lookup : par défaut, les enfants NE SONT PAS supprimés

// Configuration Lookup — 3 options sur la suppression du parent :
// a) Clear the value of this field (met AccountId à null)
// b) Don't allow deletion of the lookup record that's part of a lookup relationship
// c) Delete this record also (cascade — comportement Master-Detail)

// Si un Account est supprimé :
// - Ses Contacts (Lookup) → AccountId = null (défaut)
// - Ses Opportunities (Lookup) → AccountId = null (défaut)
// - Un objet custom Invoice__c en Master-Detail → Invoice supprimée
\`\`\`

### 2. Champ requis

\`\`\`apex
// Lookup : le champ peut être null
Contact c = new Contact(LastName = 'Test'); // AccountId non requis
insert c; // OK

// Master-Detail : le champ est TOUJOURS requis
Invoice__c inv = new Invoice__c(Name = 'INV-001'); // Account__c manquant
insert inv; // ERREUR : Account__c is required

// Exception : les records Master-Detail créés via la related list du parent
// ont le ParentId automatiquement défini
\`\`\`

### 3. Roll-Up Summary

\`\`\`apex
// Seulement disponible sur l'objet PARENT d'une Master-Detail

// Exemple : Account (parent) → Invoice__c (enfant, MD)
// On peut créer sur Account :
// TotalInvoiceAmount__c = SUM(Invoice__c.Amount__c)
// PaidInvoiceCount__c = COUNT(Invoice__c WHERE Status__c = 'Paid')

// Sur un Lookup, impossible — il faut utiliser :
// - Apex Trigger pour maintenir un compteur
// - Flow pour calculer et mettre à jour
\`\`\`

### 4. Reparenting

\`\`\`apex
// Lookup : on peut changer le parent librement
Contact c = [SELECT Id, AccountId FROM Contact LIMIT 1];
c.AccountId = newAccountId; // Changer l'Account d'un Contact = OK
update c;

// Master-Detail : par défaut, reparenting INTERDIT
// (configurable via l'option "Allow reparenting" dans la définition du champ)
Invoice__c inv = [SELECT Id, Account__c FROM Invoice__c LIMIT 1];
inv.Account__c = newAccountId; // ERREUR si reparenting non autorisé
update inv;
\`\`\`

### 5. Sharing et OWD

\`\`\`apex
// Master-Detail : les records ENFANTS héritent automatiquement
// du partage (sharing) du parent
// Si un Account est partagé avec Bob, toutes les Invoice__c en MD le sont aussi

// Lookup : les records ont leur propre partage (OWD indépendant)
// Une Opportunity peut être privée même si l'Account est public

// Conséquence pratique : pas de "Owner" sur un objet en Master-Detail
// L'OwnerId appartient au parent
\`\`\`

### 6. Nombre maximum

\`\`\`apex
// Lookup : max 40 relations Lookup par objet (champs)
// Master-Detail : max 2 relations Master-Detail par objet

// Un objet custom peut avoir 2 parents "maîtres" maximum
// Si Invoice__c → Account (MD 1) et Invoice__c → Order__c (MD 2)
// → impossible d'ajouter un 3ème Master-Detail
\`\`\`

### Quand utiliser lequel ?

\`\`\`
Utiliser Master-Detail si :
✅ L'enfant n'a pas de sens sans le parent (ligne de facture sans facture)
✅ Vous avez besoin de Roll-Up Summary
✅ Vous voulez que le partage soit hérité automatiquement
✅ La suppression du parent doit supprimer les enfants

Utiliser Lookup si :
✅ La relation est optionnelle (Contact peut exister sans Account)
✅ L'objet peut changer de parent (reparenting nécessaire)
✅ Vous voulez un contrôle de partage indépendant
✅ Vous avez déjà 2 Master-Detail sur cet objet
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Lookup ≈ Optional Foreign Key avec ON DELETE SET NULL
// Master-Detail ≈ Required Foreign Key avec ON DELETE CASCADE

// Prisma schema :

// Lookup
model Contact {
  accountId String?   // nullable = optionnel
  account   Account? @relation(fields: [accountId], references: [id],
                               onDelete: SetNull)   // pas de cascade
}

// Master-Detail
model InvoiceLine {
  invoiceId String    // NOT NULL = obligatoire
  invoice   Invoice  @relation(fields: [invoiceId], references: [id],
                              onDelete: Cascade)   // cascade delete
}

// Roll-Up Summary ≈ computed property dans Prisma :
// model Invoice {
//   lines       InvoiceLine[]
//   totalAmount Decimal @default(0) // maintenu par trigger SF, pas stocké en DB standard
// }
\`\`\`
    `,
    gotchas: [
      "Max 2 Master-Detail par objet — si vous avez besoin d'un 3ème, c'est forcément un Lookup",
      "Un objet en Master-Detail ne peut PAS avoir d'OWD (Org-Wide Defaults) — il hérite du parent",
      "Roll-Up Summary ne fonctionne PAS sur les Lookups — oubli classique en certification",
      "Le reparenting sur Master-Detail est désactivé par défaut — doit être explicitement activé dans la config",
      "Cascade delete sur Master-Detail peut déclencher des triggers Apex en chaîne — attention aux governor limits",
      "Si le champ Lookup parent a 'Required' coché dans la page layout, ça n'est PAS la même chose que Master-Detail required",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 22. Junction Objects (Many-to-Many)
  // ─────────────────────────────────────────────
  {
    id: "dm-22-junction-objects",
    title: "Data Model — Many-to-Many via Junction Objects",
    category: "Data Model",
    tags: [
      "data-model",
      "junction-object",
      "many-to-many",
      "master-detail",
      "pivot-table",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Many-to-Many avec Junction Objects

Salesforce ne supporte pas les relations Many-to-Many nativement. La solution : créer un **objet de jonction** avec **deux relations Master-Detail**.

### Pattern

\`\`\`
Contact ◄── ContactCourse__c ──► Course__c
  (1)            (M)                 (1)
  MD 1                               MD 2
\`\`\`

\`\`\`apex
// Junction Object : ContactCourse__c
// Champs :
// - Contact__c (Master-Detail vers Contact)
// - Course__c (Master-Detail vers Course__c)
// - EnrollmentDate__c (Date)
// - Grade__c (Number)
// - Status__c (Picklist : Enrolled, Completed, Dropped)

// Créer une inscription
ContactCourse__c enrollment = new ContactCourse__c(
  Contact__c = contactId,
  Course__c = courseId,
  EnrollmentDate__c = Date.today(),
  Status__c = 'Enrolled'
);
insert enrollment;
\`\`\`

### Requêtes sur une relation Many-to-Many

\`\`\`apex
// Tous les cours d'un Contact
SELECT Id, Course__r.Name, Course__r.StartDate__c, Grade__c, Status__c
FROM ContactCourse__c
WHERE Contact__c = :contactId
  AND Status__c = 'Enrolled'
ORDER BY EnrollmentDate__c DESC

// Tous les Contacts d'un cours
SELECT Id, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email, Grade__c
FROM ContactCourse__c
WHERE Course__c = :courseId
  AND Status__c != 'Dropped'
ORDER BY Contact__r.LastName ASC

// Depuis Contact, via sous-requête (nom de relation = Junction__r)
SELECT Id, FirstName, LastName, (
  SELECT Course__r.Name, Grade__c, Status__c
  FROM ContactCourses__r  // nom de relation enfant sur Contact
  WHERE Status__c = 'Completed'
)
FROM Contact
WHERE Id = :contactId

// Depuis Course, trouver les Contacts inscrits
SELECT Id, Name__c, (
  SELECT Contact__r.Name, Contact__r.Email
  FROM ContactCourses__r  // nom de relation enfant sur Course__c
  WHERE Status__c = 'Enrolled'
)
FROM Course__c
\`\`\`

### Exemple standard : CampaignMember

Salesforce a des objets de jonction standard :

\`\`\`apex
// CampaignMember : jonction entre Campaign et Contact/Lead
SELECT Id, Campaign.Name, Lead.Name, Contact.Name, Status
FROM CampaignMember
WHERE Campaign.Type = 'Email'
  AND Status = 'Responded'

// OpportunityContactRole : jonction entre Opportunity et Contact
SELECT Id, Opportunity.Name, Contact.Name, Role, IsPrimary
FROM OpportunityContactRole
WHERE Opportunity.StageName = 'Closed Won'
  AND IsPrimary = true
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Junction Object ≈ table de pivot en base de données relationnelle

// Prisma schema :
// model ContactCourse {
//   id             String   @id
//   contactId      String
//   courseId       String
//   contact        Contact @relation(fields: [contactId], references: [id],
//                                    onDelete: Cascade)
//   course         Course  @relation(fields: [courseId], references: [id],
//                                    onDelete: Cascade)
//   enrollmentDate DateTime
//   grade          Float?
//   status         String   // 'Enrolled' | 'Completed' | 'Dropped'

//   @@unique([contactId, courseId]) // un contact ne peut s'inscrire qu'une fois
// }

// La différence principale : en Salesforce, les DEUX relations du Junction Object
// doivent être des Master-Detail (pas des Lookups) pour que l'objet fonctionne
// correctement en termes de partage et de cascade delete
\`\`\`
    `,
    gotchas: [
      "Les deux relations du Junction Object DOIVENT être Master-Detail — pas Lookup — pour le bon fonctionnement",
      "Max 2 Master-Detail par objet — le Junction Object utilise ses 2 slots pour les deux parents",
      "Supprimer un parent (Contact ou Course) supprime automatiquement les records du Junction Object",
      "Les Roll-Up Summary sur les parents peuvent compter les records du junction (ex: nombre de cours par Contact)",
      "L'ordre des deux Master-Detail sur le Junction Object définit lequel est 'primary master' (important pour le sharing)",
      "Il n'y a pas de contrainte d'unicité automatique — il faut l'ajouter avec une validation rule",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 23. External Objects et Salesforce Connect
  // ─────────────────────────────────────────────
  {
    id: "dm-23-external-objects",
    title: "Data Model — External Objects (__x) et Salesforce Connect",
    category: "Data Model",
    tags: [
      "data-model",
      "external-objects",
      "__x",
      "salesforce-connect",
      "odata",
      "integration",
    ],
    difficulty: "advanced",
    certRelevance: ["PD2", "Integration-Arch"],
    content: `
## External Objects — Données Externes dans Salesforce

Les External Objects permettent d'accéder à des données **stockées hors de Salesforce** (systèmes ERP, bases de données legacy, services REST) directement depuis l'interface SF, sans ETL ni synchronisation.

### Convention de nommage

\`\`\`
Suffixe : __x  (au lieu de __c pour custom, __b pour big, __e pour event)
Exemple : ErpOrder__x, LegacyCustomer__x
\`\`\`

### Architecture

\`\`\`
Salesforce Platform
        │
  Salesforce Connect
        │
  External Data Source  ← connecteur OData 2.0, OData 4.0, ou Custom Adapter
        │
  Système externe (SAP, Oracle, REST API...)
\`\`\`

### Caractéristiques des External Objects

\`\`\`apex
// Les External Objects se comportent comme des objets SF standard :
SELECT Id, Name, OrderNumber__x, TotalAmount__x, Status__x
FROM ErpOrder__x
WHERE CustomerId__x = :accountExternalId
ORDER BY CreatedDate DESC
LIMIT 50

// MAIS avec des limitations importantes :
// - Pas de DML si la source est read-only
// - Performances dépendantes du système externe
// - Pas de Roll-Up Summary
// - Pas de Workflow Rules ou Process Builder
// - Pas de Apex Triggers (sauf sur les Indirect Lookups)
\`\`\`

### Types d'External Data Sources

\`\`\`
OData 2.0 : protocole standard, large support (SAP, Dynamics)
OData 4.0 : version plus récente, meilleures performances
Custom Adapter (Apex Connector Framework) : logique custom en Apex
Files Connect : SharePoint, Box, Dropbox (pour fichiers)
\`\`\`

### Relations avec External Objects

\`\`\`apex
// Indirect Lookup : relier un objet SF standard à un External Object
// via un champ externe (pas l'Id SF)

// Exemple : Account.ExternalId__c → ErpOrder__x.CustomerId__x

// External Lookup : relier un objet SF à un External Object
// (la FK pointe vers l'External Object)

// Lookup dans les deux sens :
SELECT Id, Account.Name, ErpOrders__r.OrderNumber__x
FROM Account
// (si External Lookup configuré)
\`\`\`

### Quand utiliser External Objects ?

\`\`\`
✅ Données doivent rester dans le système source (compliance, gouvernance)
✅ Volume trop important pour être copié dans SF
✅ Données changent trop souvent pour une synchronisation
✅ Accès occasionnel (consultation, pas traitement massif)

❌ Performances critiques (chaque accès = appel réseau vers le système externe)
❌ Calculs complexes nécessitant SF Governor Limits
❌ Volume important de données à afficher dans des listes
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// External Objects ≈ Virtual/Computed entities dans un ORM
// (données qui viennent d'une source externe, pas de la base locale)

// TypeScript avec DataLoader / Repository pattern :
class ExternalOrderRepository {
  async findByCustomerId(customerId: string): Promise<ExternalOrder[]> {
    // Appel vers SAP via REST/OData
    const response = await fetch(\`\${SAP_API}/Orders?\\$filter=CustomerId eq '\${customerId}'\`);
    return response.json();
  }
}

// Salesforce Connect fait exactement ça, mais :
// 1. Transparent dans l'UI (les utilisateurs ne voient pas la différence)
// 2. Les External Objects apparaissent dans les Related Lists standard
// 3. Queryable en SOQL comme n'importe quel objet
// 4. Géré par la plateforme (auth, cache, throttling)
\`\`\`
    `,
    gotchas: [
      "Chaque accès à un External Object = appel réseau vers le système externe → latence potentielle élevée",
      "Les External Objects ne supportent PAS les Apex Triggers standard ni les Roll-Up Summary",
      "Les External Object Ids ne sont pas des Ids Salesforce 18-char — ils proviennent du système source",
      "Salesforce Connect est une licence additionnelle payante — pas inclus dans les éditions standard",
      "SOQL sur External Objects a des limitations : pas de agrégats, pas de GROUP BY dans certains adapters",
      "Les Custom Adapters Apex (Apex Connector Framework) nécessitent de gérer manuellement la pagination et le filtrage",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 24. Big Objects
  // ─────────────────────────────────────────────
  {
    id: "dm-24-big-objects",
    title: "Data Model — Big Objects (__b) pour données massives",
    category: "Data Model",
    tags: [
      "data-model",
      "big-objects",
      "__b",
      "archive",
      "async-soql",
      "high-volume",
    ],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Big Objects — Stockage Massif dans Salesforce

Les Big Objects permettent de stocker et d'accéder à des **milliards de records** directement dans Salesforce. Conçus pour l'archivage et les données historiques volumineuses.

### Convention de nommage

\`\`\`
Suffixe : __b
Exemple : ArchiveLog__b, TransactionHistory__b, AuditEvent__b
\`\`\`

### Caractéristiques clés

\`\`\`apex
// Création d'un record Big Object
ArchiveLog__b log = new ArchiveLog__b(
  AccountId__c = accountId,
  EventDate__c = Datetime.now(),
  Action__c = 'LOGIN',
  Details__c = 'User logged in from IP 192.168.1.1'
);
insert log;  // DML standard fonctionne

// Requête via SOQL standard (avec restrictions)
SELECT AccountId__c, EventDate__c, Action__c, Details__c
FROM ArchiveLog__b
WHERE AccountId__c = :accountId
  AND EventDate__c >= :startDate
ORDER BY EventDate__c DESC
LIMIT 1000
\`\`\`

### Limitations des Big Objects

\`\`\`
Ce qui FONCTIONNE avec les Big Objects :
✅ INSERT (créer des records)
✅ SOQL avec filtre sur les index fields (champs d'index)
✅ Async SOQL (pour les grandes requêtes)
✅ Relations Lookup standard vers objets SF

Ce qui NE FONCTIONNE PAS :
❌ UPDATE / DELETE — pas possible !
❌ Apex Triggers
❌ Workflow Rules / Process Builder
❌ SOQL sans filtrer sur les index fields
❌ Champs de type Relationship (pas de Lookup vers Big Objects)
❌ Reports & Dashboards standard
\`\`\`

### Index Fields — Obligatoire

\`\`\`
Chaque Big Object DOIT avoir un Index composite défini.
Toute requête SOQL DOIT filtrer sur les champs d'index (dans l'ordre).

Index défini : [AccountId__c, EventDate__c, Action__c]

✅ WHERE AccountId__c = :id
✅ WHERE AccountId__c = :id AND EventDate__c >= :date
✅ WHERE AccountId__c = :id AND EventDate__c >= :date AND Action__c = 'LOGIN'

❌ WHERE EventDate__c = :date  // ne commence pas par AccountId__c
❌ WHERE Action__c = 'LOGIN'   // ne commence pas par AccountId__c
\`\`\`

### Async SOQL — Pour les grandes requêtes

\`\`\`apex
// Pour des requêtes sur des billions de records, utiliser Async SOQL
// via l'API (pas disponible en Apex statique)

// REST API :
// POST /services/data/v59.0/async/
// Body :
// {
//   "query": "SELECT AccountId__c, COUNT(Id) cnt FROM ArchiveLog__b
//             WHERE EventDate__c >= LAST_N_DAYS:365
//             GROUP BY AccountId__c",
//   "operation": "query",
//   "targetObject": "AggregatedLog__c",  // stocker les résultats dans un objet SF
//   "targetFieldMap": { "AccountId__c": "AccountId__c", "cnt": "EventCount__c" }
// }
\`\`\`

### Cas d'usage typiques

\`\`\`
✅ Logs d'audit (milliards d'événements)
✅ Historique de transactions financières
✅ Données IoT (capteurs, métriques)
✅ Archivage d'anciennes données pour compliance
✅ Données temporaires de migration
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Big Objects ≈ tables Cassandra ou tables de time-series (InfluxDB)

// Cassandra : optimisé pour l'écriture massive et la lecture par partition key
// CREATE TABLE audit_logs (
//   account_id UUID,
//   event_date TIMESTAMP,
//   action TEXT,
//   details TEXT,
//   PRIMARY KEY ((account_id), event_date, action)  // partition + clustering keys
// );

// Big Objects ont la même contrainte : la clé primaire (index fields)
// doit être utilisée dans les requêtes, et les mises à jour ne sont pas supportées

// L'immutabilité (pas d'UPDATE/DELETE) est identique à un log system event-sourced :
// une fois écrit, un événement ne change pas — on crée des nouveaux événements
\`\`\`
    `,
    gotchas: [
      "Impossible d'UPDATE ou DELETE des records Big Object — uniquement INSERT",
      "Les requêtes SOQL DOIVENT commencer par filtrer le premier champ de l'index (dans l'ordre défini)",
      "Pas de Apex Triggers sur les Big Objects — impossible de réagir à une insertion",
      "Les Big Objects ne sont pas visibles dans les Reports & Dashboards standard — il faut Async SOQL",
      "Async SOQL pour les Big Objects n'est disponible que via REST API, pas en Apex",
      "Les relations (Lookup) vers les Big Objects depuis d'autres objets ne sont pas supportées",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 25. Record Types
  // ─────────────────────────────────────────────
  {
    id: "dm-25-record-types",
    title: "Data Model — Record Types : quand et pourquoi",
    category: "Data Model",
    tags: [
      "data-model",
      "record-types",
      "picklist",
      "page-layout",
      "profiles",
      "business-process",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## Record Types

Les Record Types permettent d'avoir **plusieurs variantes d'un même objet** avec des picklist values différentes et des page layouts différents, selon le profil utilisateur.

### Concept clé

\`\`\`
Un seul objet (Opportunity) peut avoir plusieurs Record Types :
- "New Business" → picklist Stages différents, layout A
- "Renewal" → picklist Stages différents, layout B
- "Partner Deal" → picklist Stages différents, layout C

Chaque profil utilisateur peut accéder à certains Record Types seulement.
\`\`\`

### Utilisation en Apex

\`\`\`apex
// Récupérer l'Id d'un Record Type par son DeveloperName
Id newBizRTId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName()
  .get('New_Business').getRecordTypeId();

// Créer un record avec un Record Type spécifique
Opportunity opp = new Opportunity(
  Name = 'Deal avec Acme',
  AccountId = accountId,
  RecordTypeId = newBizRTId,
  StageName = 'Qualification',
  CloseDate = Date.today().addMonths(3)
);
insert opp;

// Requêter en filtrant par Record Type
List<Opportunity> renewals = [
  SELECT Id, Name, Amount, StageName
  FROM Opportunity
  WHERE RecordType.DeveloperName = 'Renewal'
    AND StageName = 'Renewal Proposal'
  ORDER BY CloseDate ASC
];
\`\`\`

### Méthodes Schema pour les Record Types

\`\`\`apex
// Toutes les méthodes disponibles
Map<String, Schema.RecordTypeInfo> rtMap =
  Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName();

for (String devName : rtMap.keySet()) {
  Schema.RecordTypeInfo rti = rtMap.get(devName);
  System.debug('Name: ' + rti.getName());
  System.debug('Developer Name: ' + devName);
  System.debug('Id: ' + rti.getRecordTypeId());
  System.debug('Active: ' + rti.isActive());
  System.debug('Default: ' + rti.isDefaultRecordTypeMapping());
  System.debug('Master: ' + rti.isMaster()); // true pour le "Master" record type (pas custom)
}
\`\`\`

### Quand utiliser les Record Types ?

\`\`\`
✅ Différentes étapes de processus métier pour le même objet
✅ Différents champs/sections à afficher selon le type de deal
✅ Différentes valeurs de picklist selon le contexte
✅ Contrôle d'accès : certains profils ne peuvent créer que certains types

❌ Si la différence n'est qu'un champ — utiliser une Picklist standard
❌ Si la logique est 100% identique — inutile d'avoir plusieurs RT
❌ Pour séparer des objets vraiment différents — créer un Custom Object
\`\`\`

### Business Process

\`\`\`
Setup > Object Manager > Opportunity > Business Processes
→ Chaque Record Type utilise un Business Process
→ Un Business Process = un sous-ensemble des valeurs du champ Stage/Status
→ Utile pour : Sales Process, Lead Process, Support Process
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Record Types ≈ discriminated union + filtrage conditionnel de champs

type OpportunityRecordType = 'NewBusiness' | 'Renewal' | 'PartnerDeal';

interface Opportunity {
  recordType: OpportunityRecordType;
  stage: NewBusinessStage | RenewalStage | PartnerDealStage; // varie selon RT
  // ... autres champs communs
}

// En React, selon le RecordType on affiche un formulaire différent :
function OpportunityForm({ opportunity }: { opportunity: Opportunity }) {
  switch (opportunity.recordType) {
    case 'NewBusiness':
      return <NewBusinessForm />;  // Layout A
    case 'Renewal':
      return <RenewalForm />;      // Layout B
    case 'PartnerDeal':
      return <PartnerDealForm />; // Layout C
  }
}

// Salesforce gère ça nativement via Record Types + Page Layouts
// sans code — uniquement de la configuration
\`\`\`
    `,
    gotchas: [
      "getRecordTypeInfosByDeveloperName() est plus stable que getRecordTypeInfosByName() — le DeveloperName ne change pas avec les traductions",
      "Le 'Master' Record Type est toujours présent et ne peut pas être supprimé — c'est le RT par défaut quand aucun autre n'est configuré",
      "Les valeurs de picklist disponibles par Record Type sont définies dans le 'Business Process' ou directement sur le RT",
      "Un utilisateur sans accès à un Record Type ne peut pas créer de records de ce type — mais peut voir les records existants",
      "RecordTypeId peut être null si l'org n'a qu'un seul Record Type (le Master) — pas d'erreur mais Id sera null",
      "En triggers, toujours vérifier le RecordTypeId pour appliquer une logique spécifique à un type de record",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 26. Page Layouts vs Lightning Record Pages
  // ─────────────────────────────────────────────
  {
    id: "dm-26-page-layouts-vs-lightning",
    title: "Data Model — Page Layouts vs Lightning Record Pages",
    category: "Data Model",
    tags: [
      "data-model",
      "page-layout",
      "lightning-record-page",
      "app-builder",
      "profiles",
      "sections",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `
## Page Layouts vs Lightning Record Pages

Deux systèmes co-existent dans Salesforce pour définir ce que voit un utilisateur sur un record.

### Page Layout (classique)

**Quoi** : Définit les champs, sections, related lists, boutons, actions rapides affichés sur un record.

**Assignation** : via les Profils utilisateur (et Record Types).

\`\`\`
Setup > Object Manager > Account > Page Layouts
→ Account Layout (défaut)
→ Account Layout - Sales
→ Account Layout - Support

Assignation :
Setup > Object Manager > Account > Page Layouts > Page Layout Assignment
→ Profil "Sales User" → "Account Layout - Sales"
→ Profil "Support Agent" → "Account Layout - Support"
\`\`\`

**Ce qu'on configure dans un Page Layout** :
- Sections et ordre des champs
- Champs obligatoires (required sur le layout, indépendamment du champ lui-même)
- Champs en lecture seule sur le layout
- Related Lists (quelles listes d'enfants afficher)
- Boutons personnalisés
- Actions rapides (Quick Actions)
- Composants Visualforce

### Lightning Record Page (App Builder)

**Quoi** : Définit la structure visuelle de la page entière dans Lightning Experience — composants, onglets, colonnes, etc.

**Assignation** : via App, Profil, ou App + Profil combinés.

\`\`\`
Setup > Lightning App Builder
→ Rechercher "Account Record Page"
→ Drag & drop de composants LWC, Aura, standard SF

Composants disponibles :
- Record Detail (contient le Page Layout !)
- Related Lists
- Chatter
- Kanban
- Composants LWC custom
- Einstein Analytics dashboards
\`\`\`

### La relation entre les deux

\`\`\`
Lightning Record Page
├── Header (Highlights Panel)
├── Colonne gauche
│   ├── Record Detail ← CONTIENT le Page Layout
│   └── Chatter
└── Colonne droite
    ├── Activity Timeline
    └── Related Lists Panel
\`\`\`

> Le **Record Detail** (composant dans la Lightning Record Page) fait le rendu du **Page Layout**. Les deux systèmes sont imbriqués.

### Quand modifier lequel ?

\`\`\`
Ajouter/supprimer un champ dans le formulaire ?
→ Page Layout

Réorganiser les sections du formulaire ?
→ Page Layout

Ajouter un composant LWC custom sur la page ?
→ Lightning Record Page (App Builder)

Changer la structure en colonnes/onglets de la page ?
→ Lightning Record Page (App Builder)

Contrôler qui voit quels champs ?
→ Page Layout (required/readonly) + Field Level Security (Profiles)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Page Layout ≈ schema de formulaire (quels champs, dans quel ordre)
// Lightning Record Page ≈ layout de page entière (structure des colonnes/composants)

// Page Layout :
const accountFormSchema = {
  sections: [
    { label: 'Account Information', fields: ['Name', 'Industry', 'Phone'] },
    { label: 'Billing Address', fields: ['BillingStreet', 'BillingCity'] },
  ],
  relatedLists: ['Contacts', 'Opportunities', 'Cases'],
};

// Lightning Record Page (structure de la page) :
const accountRecordPage = (
  <Page>
    <HighlightsPanel />
    <TwoColumnLayout>
      <Column>
        <RecordDetail schema={accountFormSchema} />  {/* le Page Layout */}
        <Chatter />
      </Column>
      <Column>
        <ActivityTimeline />
        <RelatedLists lists={accountFormSchema.relatedLists} />
      </Column>
    </TwoColumnLayout>
  </Page>
);
\`\`\`
    `,
    gotchas: [
      "Page Layouts et Lightning Record Pages sont des systèmes DISTINCTS — modifier l'un ne modifie pas l'autre",
      "Field Level Security (dans les Profils) prime sur le Page Layout — si le profil n'a pas accès au champ, il n'apparaît pas même si dans le layout",
      "Un champ 'Required' dans le Page Layout est différent de 'Required' dans la définition du champ — l'un est côté UI, l'autre côté données",
      "Les Related Lists dans le Page Layout sont distinctes des Related Lists configurées dans la Lightning Record Page",
      "Pour Lightning Experience, on peut avoir des Lightning Record Pages différentes par App — pas seulement par profil",
      "En Salesforce Classic, il n'y a pas de Lightning Record Pages — seulement des Page Layouts",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 27. Schema Builder
  // ─────────────────────────────────────────────
  {
    id: "dm-27-schema-builder",
    title: "Data Model — Schema Builder : visualisation et création",
    category: "Data Model",
    tags: ["data-model", "schema-builder", "erd", "visual", "setup"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `
## Schema Builder

Le Schema Builder est un outil visuel (ERD interactif) dans Setup qui permet de visualiser et créer les objets et champs Salesforce.

### Accès

\`\`\`
Setup > Schema Builder
\`\`\`

### Fonctionnalités

\`\`\`
1. Vue ERD interactive
   - Drag & drop des objets sur le canvas
   - Zoom in/out
   - Affichage des relations (flèches)
   - Filtrage par objets (cocher/décocher)

2. Création d'objets et de champs DEPUIS le canvas
   - Clic droit → New Object
   - Clic droit sur un objet → New Field
   - Drag pour créer une relation entre deux objets

3. Visualisation des champs
   - Types de champs (icônes distinctes)
   - Champs requis (astérisque)
   - Champs unique (icône)
   - Relations (flèches avec type : MD ou Lookup)
\`\`\`

### Utilité en pratique

\`\`\`
✅ Comprendre le data model d'une org inconnue (audit, reprise de projet)
✅ Documenter les relations pour les nouveaux membres de l'équipe
✅ Créer rapidement plusieurs objets et les relier visuellement
✅ Identifier les dépendances avant de supprimer un champ

❌ Pas adapté aux orgs avec >100 objets (trop de bruit)
❌ Pas de collaboration en temps réel
❌ Pas de versioning / historique des changements
\`\`\`

### Schema Builder en Apex (introspection programmatique)

\`\`\`apex
// L'équivalent programmatique du Schema Builder

// Lister tous les objets de l'org
Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
for (String objectName : globalDescribe.keySet()) {
  Schema.SObjectType sot = globalDescribe.get(objectName);
  Schema.DescribeSObjectResult d = sot.getDescribe();
  System.debug(d.getLabel() + ' (' + d.getName() + ')');
}

// Lister tous les champs d'un objet
Map<String, Schema.SObjectField> fields =
  Schema.SObjectType.Account.fields.getMap();

for (String fieldName : fields.keySet()) {
  Schema.DescribeFieldResult f = fields.get(fieldName).getDescribe();
  System.debug(
    f.getLabel() + ' | ' +
    f.getName() + ' | ' +
    f.getType() + ' | ' +
    'Required: ' + !f.isNillable()
  );
}

// Lister les relations enfants d'un objet
List<Schema.ChildRelationship> rels =
  Schema.SObjectType.Account.getDescribe().getChildRelationships();
for (Schema.ChildRelationship rel : rels) {
  System.debug(rel.getRelationshipName() + ' → ' + rel.getChildSObject());
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Schema Builder ≈ Prisma Studio ou pgAdmin ERD view

// L'introspection programmatique est similaire à Prisma's introspection :
// npx prisma db pull → génère le schema.prisma depuis la DB existante

// En Apex, Schema.getGlobalDescribe() fait la même chose programmatiquement :
const schema = await prisma.$queryRaw\`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
\`;

// Salesforce Schema API =
//   introspection de la "base de données" SF depuis le code Apex lui-même
//   Sans accès direct à la DB, tout passe par cette API
\`\`\`
    `,
    gotchas: [
      "Le Schema Builder n'affiche pas TOUS les objets par défaut — il faut les sélectionner dans le panneau gauche",
      "Les modifications faites dans Schema Builder sont immédiates en prod — pas de preview ni de staging",
      "Schema Builder ne montre pas les Field Level Security ni les Record Types — seulement la structure des données",
      "Pour les grandes orgs, préférer Object Manager (liste) ou l'introspection Apex plutôt que Schema Builder (lent)",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 28. Custom Metadata Types vs Custom Settings
  // ─────────────────────────────────────────────
  {
    id: "dm-28-custom-metadata-vs-settings",
    title: "Data Model — Custom Metadata Types (__mdt) vs Custom Settings",
    category: "Data Model",
    tags: [
      "data-model",
      "custom-metadata",
      "__mdt",
      "custom-settings",
      "configuration",
      "deployment",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Custom Metadata Types (__mdt) vs Custom Settings

Ces deux mécanismes permettent de stocker des données de **configuration** dans Salesforce. Leur différence principale : le comportement lors des déploiements.

### Custom Metadata Types (CMT)

\`\`\`
Suffixe : __mdt
Exemple : TaxRate__mdt, FeatureFlag__mdt, IntegrationConfig__mdt
\`\`\`

\`\`\`apex
// Requêter des Custom Metadata (SOQL standard)
List<TaxRate__mdt> taxRates = [
  SELECT Id, MasterLabel, DeveloperName, Rate__c, Country__c
  FROM TaxRate__mdt
  WHERE IsActive__c = true
  ORDER BY Country__c ASC
];

// Accès rapide par DeveloperName (sans SOQL — depuis le cache)
TaxRate__mdt usTax = TaxRate__mdt.getInstance('US_Tax');
System.debug('US Tax Rate: ' + usTax.Rate__c + '%');

// Accès à tous les records
Map<String, TaxRate__mdt> allTaxRates = TaxRate__mdt.getAll();
\`\`\`

**Caractéristiques CMT** :
- ✅ **Déployable** : les records font partie des métadonnées (Metadata API)
- ✅ Accessible via SOQL et l'API sans SOQL (depuis le cache)
- ✅ Versionnable avec le code (dans les packages)
- ✅ Accessible dans les Formulas et Validation Rules
- ❌ Pas de DML direct en Apex (insert/update interdit en prod sans Metadata API)
- ❌ Pas de test de création de records dans Apex Tests (utiliser mockups)

### Custom Settings

\`\`\`apex
// Deux types : List Custom Settings et Hierarchy Custom Settings

// HIERARCHY CUSTOM SETTINGS : valeurs par Org, Profil, ou Utilisateur
// Exemple : EmailTemplate__c (Hierarchy)

// Récupérer la valeur pour l'utilisateur courant (résolution automatique user > profil > org)
EmailTemplate__c settings = EmailTemplate__c.getInstance();
String templateId = settings.DefaultTemplate__c;

// Récupérer pour un utilisateur spécifique
EmailTemplate__c userSettings = EmailTemplate__c.getInstance(userId);

// Récupérer au niveau Org
EmailTemplate__c orgSettings = EmailTemplate__c.getOrgDefaults();

// LIST CUSTOM SETTINGS : key-value store par nom
AppConfig__c config = AppConfig__c.getValues('MaxRetries');
Integer maxRetries = Integer.valueOf(config.Value__c);
\`\`\`

**Caractéristiques Custom Settings** :
- ✅ DML possible en Apex (modifier les valeurs depuis le code)
- ✅ Hiérarchie Org/Profil/User pour les Hierarchy Custom Settings
- ✅ Accessibles très rapidement (cache automatique)
- ❌ Les DATA ne sont pas déployées avec les métadonnées (contrairement à CMT)
- ❌ Non accessible dans les Formulas et Validation Rules (contrairement aux CMT)

### Tableau comparatif

| Critère | CMT (__mdt) | Custom Settings |
|---------|-------------|-----------------|
| Déploiement des données | ✅ Oui (avec le code) | ❌ Non |
| DML en Apex | ❌ Non (prod) | ✅ Oui |
| Accès dans Formulas | ✅ Oui | ❌ Non |
| Hiérarchie Org/User | ❌ Non | ✅ Oui (Hierarchy) |
| Accès sans SOQL | ✅ getInstance() | ✅ getValues() |
| Package/Version | ✅ Oui | ❌ Non |

### Recommandation moderne

\`\`\`
Custom Metadata Types (CMT) sont la solution RECOMMANDÉE par Salesforce
pour les nouvelles configurations. Les Custom Settings sont legacy.

Utiliser CMT pour :
→ Feature flags
→ Taux de tax, seuils métier
→ Configuration d'intégrations (URLs, modes)
→ Mapping de valeurs

Utiliser Custom Settings uniquement pour :
→ Configuration qui varie par utilisateur/profil (Hierarchy)
→ Configuration qui doit être modifiable par des admins non-techniques via l'UI
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Custom Metadata Types ≈ fichier de configuration JSON versionné avec le code
// (config.json, .env.example, feature-flags.json)

// config/tax-rates.json (versionné dans git)
const taxRates = {
  'US': { rate: 8.5, active: true },
  'FR': { rate: 20.0, active: true },
  'UK': { rate: 20.0, active: true },
};

// Custom Settings ≈ configuration en base de données (modifiable en runtime)
// (table 'settings' dans votre DB, modifiable via un panneau admin)
const setting = await db.settings.findUnique({ where: { key: 'MaxRetries' } });

// Différence clé : les CMT sont déployés AVEC le code (comme git)
//                  les Custom Settings sont dans les DONNÉES (hors git)
// → Pour des valeurs qui changent avec les releases : CMT
// → Pour des valeurs modifiables sans déploiement : Custom Settings
\`\`\`
    `,
    gotchas: [
      "CMT records ne peuvent PAS être créés/modifiés via DML Apex en production — utiliser la Metadata API ou Setup UI",
      "TaxRate__mdt.getInstance() et getAll() ne consomment PAS de SOQL — données en cache côté serveur",
      "Custom Settings Hierarchy : la résolution User > Profil > Org est automatique avec getInstance() sans argument",
      "Les CMT records ne sont PAS visibles dans les Apex Tests sans setup explicite — utiliser des mocks",
      "Custom Settings List vs Hierarchy : List = key-value simple, Hierarchy = peut avoir des valeurs différentes par user/profil",
      "Contrairement aux Custom Objects, les CMT records font partie du package lors d'un déploiement",
    ],
  },

  // ─────────────────────────────────────────────
  // DATA MODEL — 29. Platform Events
  // ─────────────────────────────────────────────
  {
    id: "dm-29-platform-events",
    title: "Data Model — Platform Events (__e) : Event-Driven Architecture",
    category: "Data Model",
    tags: [
      "data-model",
      "platform-events",
      "__e",
      "event-driven",
      "publish-subscribe",
      "streaming",
      "cdc",
    ],
    difficulty: "advanced",
    certRelevance: ["PD2", "Integration-Arch"],
    content: `
## Platform Events — Architecture Event-Driven dans Salesforce

Les Platform Events permettent de construire une architecture **publish/subscribe** (pub/sub) dans et autour de Salesforce. Ils s'appuient sur le Streaming API de Salesforce.

### Convention de nommage

\`\`\`
Suffixe : __e
Exemple : OrderCreated__e, PaymentProcessed__e, InventoryUpdated__e
\`\`\`

### Créer un Platform Event

\`\`\`
Setup > Platform Events > New Platform Event
  → Label: "Order Created"
  → API Name: OrderCreated__e
  → Publish Behavior: Publish After Commit (défaut) | Publish Immediately
  → Champs : OrderId__c, CustomerId__c, Amount__c, Status__c
\`\`\`

### Publish/Subscribe — Publisher

\`\`\`apex
// PUBLISHER : publier un événement depuis Apex

// Méthode 1 : insert (recommandé, respecte les transactions)
OrderCreated__e event = new OrderCreated__e(
  OrderId__c = orderId,
  CustomerId__c = customerId,
  Amount__c = totalAmount,
  Status__c = 'CREATED'
);
EventBus.publish(event);  // Méthode recommandée

// Méthode 2 : avec vérification du résultat
Database.SaveResult result = EventBus.publish(event);
if (result.isSuccess()) {
  System.debug('Event published. ReplayId: ' + result.getId());
} else {
  for (Database.Error err : result.getErrors()) {
    System.debug('Error: ' + err.getMessage());
  }
}

// Publier plusieurs événements en bulk
List<OrderCreated__e> events = new List<OrderCreated__e>();
for (Order__c order : newOrders) {
  events.add(new OrderCreated__e(
    OrderId__c = order.Id,
    CustomerId__c = order.Account__c,
    Amount__c = order.TotalAmount__c,
    Status__c = 'CREATED'
  ));
}
List<Database.SaveResult> results = EventBus.publish(events);
\`\`\`

### Subscribe — Depuis un Apex Trigger

\`\`\`apex
// SUBSCRIBER : trigger sur un Platform Event
trigger OrderCreatedTrigger on OrderCreated__e (after insert) {
  for (OrderCreated__e event : Trigger.new) {
    // Récupérer les détails via l'Id de l'événement
    String orderId = event.OrderId__c;
    String customerId = event.CustomerId__c;
    Decimal amount = event.Amount__c;

    // Logique de traitement
    // Ex: mettre à jour un record, envoyer une notification, appeler une API
    processNewOrder(orderId, customerId, amount);
  }
}
\`\`\`

### Subscribe — Depuis un Flow ou Process Builder

\`\`\`
Setup > Flows > New Flow
→ Type : Record-Triggered Flow → Non
→ Type : Platform Event-Triggered Flow (Start = Platform Event)
→ Événement : OrderCreated__e
→ Logique : actions standard de Flow
\`\`\`

### Subscribe — Depuis un client externe (CometD / Streaming API)

\`\`\`javascript
// JavaScript (Node.js, LWC, Aura) via CometD
const jsforce = require('jsforce');
const conn = new jsforce.Connection({ ... });

conn.streaming.topic('/event/OrderCreated__e').subscribe((event) => {
  console.log('Received event:', event.data.payload);
  console.log('ReplayId:', event.data.event.replayId);
});

// LWC — emprunter le canal Lightning Message Service ou Streaming API
import { subscribe, unsubscribe } from 'lightning/empApi';

const channelName = '/event/OrderCreated__e';
let subscription;

subscribe(channelName, -1, (event) => {
  console.log('Event received:', JSON.stringify(event));
}).then(response => {
  subscription = response;
});
\`\`\`

### Publish Behavior — Timing critique

\`\`\`apex
// "Publish After Commit" (défaut) :
// L'événement est publié SEULEMENT si la transaction Apex réussit
// → Si rollback → l'événement n'est PAS publié
// Utile pour : "NotifyOnOrderCreated" — ne notifier que si l'ordre est bien créé

// "Publish Immediately" :
// L'événement est publié IMMÉDIATEMENT, même si la transaction est rollback-ée
// Utile pour : logging, diagnostics, monitoring (même les erreurs doivent être loguées)

// Configurable par Platform Event dans Setup
\`\`\`

### Change Data Capture (CDC)

\`\`\`apex
// CDC : Salesforce génère automatiquement des événements quand
// des records standard ou custom sont créés/modifiés/supprimés

// Activer CDC : Setup > Change Data Capture > cocher les objets

// S'abonner au stream CDC d'Account :
// Canal : /data/AccountChangeEvent

// L'événement contient :
// - ChangeType : CREATE, UPDATE, DELETE, UNDELETE
// - ChangedFields : liste des champs modifiés
// - TransactionKey : lier plusieurs events d'une même transaction
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Platform Events ≈ Redis Pub/Sub, AWS SNS/SQS, RabbitMQ, ou Kafka

// Publisher (équivalent EventBus.publish) :
await redisClient.publish('order-created', JSON.stringify({
  orderId: order.id,
  customerId: order.customerId,
  amount: order.amount,
}));

// Subscriber (équivalent trigger on OrderCreated__e) :
await redisClient.subscribe('order-created', (message) => {
  const event = JSON.parse(message);
  processNewOrder(event.orderId, event.customerId, event.amount);
});

// Différences clés Salesforce Platform Events vs Kafka/Redis :
// 1. Rétention : SF garde les événements 72h (configurable jusqu'à 3 jours)
// 2. Replay : possibilité de rejouer les événements depuis un ReplayId
// 3. Intégration native : Flows, Triggers, LWC — pas de setup infrastructure
// 4. "Publish After Commit" : publication transactionnelle native
// 5. Max 250 000 événements/jour par org (edition Enterprise)
\`\`\`
    `,
    gotchas: [
      "Platform Events sont asynchrones — la transaction publisher n'attend PAS que les subscribers aient traité l'événement",
      "Avec 'Publish After Commit', si la transaction est rollback-ée, l'événement n'est JAMAIS publié",
      "Les subscribers (triggers sur __e) s'exécutent dans leur PROPRE transaction — pas celle du publisher",
      "Max 2000 records traités par trigger sur Platform Events (Trigger.new.size() <= 2000)",
      "La rétention des événements est de 72 heures par défaut — au-delà, impossibilité de rejouer",
      "Les erreurs dans un subscriber Apex ne retransmettent pas automatiquement l'événement — gérer les erreurs explicitement",
      "Limite : 250 000 événements par jour en Enterprise Edition — vérifier les limites de l'org",
    ],
  },
];
