import type { Lesson } from "./types";

export const securityIntegrationFlowsLessons: Lesson[] = [
  // ─────────────────────────────────────────────
  // SECURITY & SHARING MODEL
  // ─────────────────────────────────────────────
  {
    id: "sec-001",
    title:
      "Multi-tenant Security Model — Pourquoi c'est fondamentalement différent du RBAC classique",
    category: "Security & Sharing",
    tags: ["security", "multi-tenant", "rbac", "architecture"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Le problème : tu partages un serveur avec 150 000 autres entreprises

Dans une app Node.js classique, tu héberges **une** entreprise par instance. Tu peux hardcoder des règles, des rôles, des tables. Salesforce, lui, fait tourner **toutes** ses entreprises (orgs) sur la même infrastructure physique.

### L'architecture multi-tenant SF

\`\`\`
┌─────────────────────────────────────────────────────┐
│                  Salesforce Platform                 │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Org A   │  │  Org B   │  │  Org C   │  ...     │
│  │ (Adeo)   │  │(Decathlon│  │ (IKEA)   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  Même DB physique — isolation garantie par OrgId    │
└─────────────────────────────────────────────────────┘
\`\`\`

Chaque enregistrement en base porte un **OrgId** implicite. Les requêtes SQL internes de SF ajoutent automatiquement \`WHERE OrgId = 'xxx'\`. Tu ne vois jamais ça en Apex — c'est transparent.

### Le modèle de sécurité en couches

SF utilise un modèle **additive + restrictif** combiné :

\`\`\`
Layer 1 : OWD (Organization-Wide Defaults)
         → Point de départ le plus restrictif

Layer 2 : Role Hierarchy
         → Ouvre l'accès vers le haut

Layer 3 : Sharing Rules
         → Étend l'accès horizontalement

Layer 4 : Manual Sharing / Teams / Territories
         → Partage granulaire

Layer 5 : Profiles & Permission Sets
         → Permissions objet/champ/fonctionnalité
\`\`\`

### Comparaison avec RBAC classique

| RBAC classique | Salesforce |
|----------------|------------|
| Rôles = permissions | Rôles = hiérarchie d'accès aux données |
| Un utilisateur = un ou plusieurs rôles | Un utilisateur = un profil + N permission sets |
| Accès défini par rôle | Accès défini par 5 couches combinées |
| Pas de notion d'owner | Record owner = concept central |
| Flat | Hiérarchique (Role Hierarchy) |

### Le concept d'Owner

Chaque record SF a un **OwnerId** (User ou Queue). L'owner a par défaut accès à son record. La Role Hierarchy propage cet accès vers le haut. C'est le pivot du modèle.

\`\`\`apex
// En Apex, tu vois l'owner via
Account acc = [SELECT Id, OwnerId, Owner.Name FROM Account WHERE Id = :someId];
\`\`\`
    `,
    tsAnalogy: `
Imagine que ton middleware Express ajoute automatiquement \`WHERE tenant_id = req.user.tenantId\` à **toutes** tes requêtes SQL — sans que tu aies à le faire manuellement. C'est ce que fait SF. Tu ne peux physiquement pas voir les données d'une autre org, même avec une fuite SQL.

Le modèle de sécurité SF est comme un middleware de sécurité à plusieurs couches dans NestJS :

\`\`\`typescript
// Analogie NestJS
@UseGuards(OWDGuard, RoleHierarchyGuard, SharingRulesGuard, FLSGuard)
async findOne(id: string, @CurrentUser() user: User) {
  // SF fait tout ça automatiquement
}
\`\`\`
    `,
    gotchas: [
      "Les rôles SF ne sont PAS des rôles au sens RBAC — ils définissent une hiérarchie d'accès aux données, pas des permissions",
      "L'owner d'un record n'est pas forcément l'utilisateur connecté — c'est un champ modifiable",
      "Le partage SF est **additif** : on ne peut qu'ouvrir l'accès, jamais le restreindre en dessous de ce qu'autorise le profil",
      "Un admin (System Administrator) bypass tout le modèle de partage par défaut",
    ],
  },
  {
    id: "sec-002",
    title: "Organization-Wide Defaults (OWD) — Le plancher de sécurité",
    category: "Security & Sharing",
    tags: ["owd", "sharing", "security", "record-access"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## OWD : le niveau d'accès par défaut pour tous les records

Les OWD définissent **le minimum** d'accès qu'un utilisateur a sur les records qu'il ne possède pas. Configuré dans Setup > Sharing Settings.

### Les 4 niveaux OWD

| Niveau | Accès | Cas d'usage |
|--------|-------|-------------|
| **Private** | Aucun accès aux records des autres | Données sensibles (contrats, salaires) |
| **Public Read Only** | Lecture seule sur tous les records | Catalogues produits partagés |
| **Public Read/Write** | Lecture + écriture sur tous les records | Données collaboratives |
| **Controlled by Parent** | Hérite du parent (Master-Detail uniquement) | Line items d'une commande |

\`\`\`
OWD = Private
┌──────────┐    ┌──────────┐    ┌──────────┐
│  User A  │    │  User B  │    │  User C  │
│ (owner)  │    │          │    │          │
└────┬─────┘    └──────────┘    └──────────┘
     │ ✅ Voit ses records       ❌ Aucun accès
     │
     └─► Account #001
         Account #002
\`\`\`

\`\`\`
OWD = Public Read Only
┌──────────┐    ┌──────────┐    ┌──────────┐
│  User A  │    │  User B  │    │  User C  │
│ (owner)  │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘
  ✅ R+W          ✅ Read only    ✅ Read only
     │               │               │
     └───────────────┴───────────────┘
                 Account #001
\`\`\`

### OWD par objet

Chaque objet standard ou custom peut avoir son propre OWD :

\`\`\`
Account   → Private
Contact   → Controlled by Parent (si lié à Account)
Opportunity → Private
Case      → Public Read Only
\`\`\`

### Controlled by Parent — le cas spécial

Pour les objets en relation Master-Detail, l'enfant peut hériter de l'accès du parent :

\`\`\`
Account (Parent) — OWD: Private
    │
    └─► Opportunity (Child) — OWD: Controlled by Parent
        Si User B a accès au parent Account, il a le même accès sur ses Opportunities
\`\`\`

### Grant Access Using Hierarchies

Option par objet custom : si désactivée, la Role Hierarchy ne propage PAS l'accès pour cet objet. Utile pour les données HR confidentielles.
    `,
    tsAnalogy: `
L'OWD, c'est comme la politique CORS par défaut de ton API : tu définis ce qui est interdit sauf exception. Plutôt que \`Access-Control-Allow-Origin: *\`, tu choisis \`Private\` (rien par défaut) et tu ouvres ensuite avec des règles.

\`\`\`typescript
// OWD = Private → équivalent à
app.use((req, res, next) => {
  if (req.resource.ownerId !== req.user.id) {
    throw new ForbiddenException(); // refusé par défaut
  }
  next();
});

// OWD = Public Read Only → équivalent à
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.resource.ownerId !== req.user.id) {
    throw new ForbiddenException();
  }
  next();
});
\`\`\`
    `,
    gotchas: [
      "OWD = Private ne veut pas dire que personne n'a accès — l'owner et ses supérieurs dans la Role Hierarchy ont toujours accès",
      "Tu ne peux pas descendre en dessous de l'OWD avec une Sharing Rule — les OWD sont un plancher, pas un plafond",
      "Changer l'OWD d'un objet très peuplé déclenche un recalcul asynchrone du sharing qui peut prendre des heures",
      "'Controlled by Parent' n'est disponible que pour les relations Master-Detail, pas Lookup",
      "Pour les Contacts sans Account parent, ils se comportent comme si leur OWD était 'Public Read Only'",
    ],
  },
  {
    id: "sec-003",
    title: "Role Hierarchy — Propagation de l'accès vers le haut",
    category: "Security & Sharing",
    tags: ["role-hierarchy", "sharing", "security"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Role Hierarchy : l'arbre organisationnel qui ouvre l'accès

La Role Hierarchy est un arbre de rôles qui reflète la structure organisationnelle. La règle clé : **les supérieurs hiérarchiques voient les records de leurs subordonnés**.

\`\`\`
                  CEO
                   │
        ┌──────────┴──────────┐
     VP Sales             VP Support
        │                     │
   ┌────┴────┐           ┌────┴────┐
Regional   Regional   Team Lead  Team Lead
Manager    Manager    Support    Support
 West       East       EMEA       APAC
    │           │
  Rep A       Rep B
\`\`\`

**Règle** : VP Sales voit tous les records de Regional Manager West, Regional Manager East, Rep A et Rep B.
Rep A ne voit PAS les records de Rep B (même niveau).

### Ce que la Role Hierarchy ouvre

- Si OWD = Private, un supérieur voit les records de ses subordonnés
- Si OWD = Public Read Only, un supérieur peut **modifier** les records de ses subordonnés
- Propagation automatique, sans configuration supplémentaire

### Role vs Profile

\`\`\`
Profile = CE QUE tu peux faire (CRUD sur les objets, FLS)
Role    = CE QUE tu peux voir (quels records)
\`\`\`

Un User appartient à **exactement un** rôle (optionnel, mais recommandé).

### Queues — alternative pour les records sans owner humain

Les Queues sont des "pseudo-users" qui peuvent posséder des records. Utile pour les leads non assignés, les cases en attente. Les membres de la queue voient les records qu'elle possède.

\`\`\`
Queue "Leads Non Assignés"
    ├── Commercial A (membre)  ✅ voit les leads
    └── Commercial B (membre)  ✅ voit les leads
\`\`\`

### Grant Access Using Hierarchies

Sur les objets custom, tu peux désactiver la propagation via la Role Hierarchy. Cas d'usage : un objet "Salary__c" que même le manager ne doit pas voir.
    `,
    tsAnalogy: `
C'est comme un système de reporting dans une org, où les managers ont un accès en lecture sur le namespace de leurs subordonnés dans une base de données multi-schema :

\`\`\`typescript
function canAccess(viewer: User, record: Record): boolean {
  // L'owner a toujours accès
  if (record.ownerId === viewer.id) return true;

  // Les supérieurs hiérarchiques ont accès
  const ownerRole = getRoleById(record.owner.roleId);
  const viewerRole = getRoleById(viewer.roleId);

  return isAncestorInHierarchy(viewerRole, ownerRole);
  // viewerRole est-il un ancêtre du ownerRole dans l'arbre ?
}
\`\`\`
    `,
    gotchas: [
      "La Role Hierarchy ne fonctionne QUE si OWD n'est pas déjà 'Public Read/Write' (dans ce cas, tout le monde voit déjà tout)",
      "Un utilisateur sans rôle ne bénéficie pas de la propagation hiérarchique — ses supérieurs ne voient pas ses records",
      "Les rôles SF ne correspondent pas forcément aux titres réels — c'est un outil de partage de données, pas un organigramme RH",
      "Le System Administrator bypass la Role Hierarchy — il voit tout, toujours",
    ],
  },
  {
    id: "sec-004",
    title: "Sharing Rules — Accès horizontal entre pairs",
    category: "Security & Sharing",
    tags: ["sharing-rules", "security", "criteria-based", "owner-based"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Sharing Rules : étendre l'accès latéralement

Quand OWD = Private et que la Role Hierarchy ne suffit pas (ex: partage entre équipes parallèles), les Sharing Rules ouvrent l'accès **horizontalement**.

### 2 types de Sharing Rules

#### 1. Owner-Based Sharing Rules
Partage basé sur le **propriétaire** du record.

\`\`\`
"Les records possédés par [Rôle: Sales EMEA]
 sont partagés avec [Rôle: Marketing EMEA]
 en accès Read Only"
\`\`\`

#### 2. Criteria-Based Sharing Rules
Partage basé sur les **valeurs des champs** du record.

\`\`\`
"Les Accounts où Industry = 'Healthcare'
 sont partagés avec [Public Group: Healthcare Team]
 en accès Read/Write"
\`\`\`

### Anatomie d'une Sharing Rule

\`\`\`
Source     : Qui possède / quels records ?
Target     : Avec qui partager ?
Access     : Read Only ou Read/Write (jamais Full Access via Sharing Rule)
\`\`\`

### Public Groups & Queues comme cibles

Les Sharing Rules peuvent cibler :
- Des Rôles (et leurs subordonnés)
- Des Public Groups (ensembles ad-hoc d'utilisateurs)
- Des Territoires (Territory Management)
- Des Queues

### Limites

- Max 300 Sharing Rules par objet
- Les Sharing Rules ne peuvent accorder que Read Only ou Read/Write — jamais modifier/supprimer (ça dépend du profil)
- Elles ne peuvent PAS restreindre l'accès — seulement l'étendre

\`\`\`
OWD = Private
                    Sharing Rule
User A (Owner)  ─────────────────►  User B
Account #001                        Read Only accès
\`\`\`
    `,
    tsAnalogy: `
Les Sharing Rules sont comme des ACL (Access Control Lists) sur des ressources, mais définies de façon déclarative et calculées par SF :

\`\`\`typescript
// Criteria-based Sharing Rule → équivalent à
const sharingRules = [
  {
    condition: (record: Account) => record.industry === 'Healthcare',
    grantTo: 'healthcare-team-group',
    access: 'read-only'
  }
];

// SF maintient une table AccountShare qui matérialise ces règles
// SELECT Id, AccountId, UserOrGroupId, AccountAccessLevel FROM AccountShare
\`\`\`

Dans SF, cette table s'appelle \`AccountShare\` (ou \`ObjectNameShare\` pour les custom objects : \`MonObjet__Share\`).
    `,
    gotchas: [
      "Les Sharing Rules sont asynchrones lors de la création/modification — le recalcul peut prendre du temps sur de gros volumes",
      "Il existe une table \`ObjectName__Share\` pour chaque objet — tu peux la requêter en SOQL pour débugger",
      "Les Sharing Rules ne peuvent pas accorder l'accès à des champs spécifiques — c'est le rôle du FLS",
      "Criteria-based sharing rules ne se recalculent pas automatiquement si tu modifies les champs après création du record — il faut reconfigurer la règle pour forcer le recalcul",
    ],
  },
  {
    id: "sec-005",
    title: "Manual Sharing & Apex Managed Sharing — Le partage au cas par cas",
    category: "Security & Sharing",
    tags: ["manual-sharing", "security", "apex-sharing"],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## Manual Sharing : partager un record spécifique avec un utilisateur spécifique

Quand ni les OWD, ni la Role Hierarchy, ni les Sharing Rules ne couvrent un cas particulier, l'utilisateur (ou le code Apex) peut partager manuellement un record.

### Via l'UI

Le bouton "Sharing" sur un record permet à l'owner (ou admin) de partager manuellement avec :
- Un utilisateur spécifique
- Un groupe public
- Un rôle

### Via Apex (Apex Managed Sharing)

Pour le partage programmatique, on insère des enregistrements dans la table \`ObjectName__Share\` :

\`\`\`apex
// Partager un Account avec un User
AccountShare share = new AccountShare();
share.AccountId = accountId;           // L'enregistrement à partager
share.UserOrGroupId = userId;          // Avec qui
share.AccountAccessLevel = 'Read';     // 'Read', 'Edit', 'All'
share.RowCause = Schema.AccountShare.RowCause.Manual;

insert share;
\`\`\`

Pour un objet custom :

\`\`\`apex
MonObjet__Share share = new MonObjet__Share();
share.ParentId = monObjetId;
share.UserOrGroupId = userId;
share.AccessLevel = 'Edit';
// RowCause = 'Manual' pour manual, ou une cause custom pour Apex Managed Sharing

insert share;
\`\`\`

### Apex Managed Sharing (cause custom)

Pour du partage géré par Apex avec une logique métier, tu crées une **cause de partage custom** :

1. Setup > Custom Object > Sharing Reasons (Apex Sharing Reasons)
2. Crée une cause, ex: \`ProjectMember__c\`
3. Utilise cette cause dans ton code Apex

\`\`\`apex
share.RowCause = Schema.MonObjet__Share.RowCause.ProjectMember__c;
\`\`\`

L'avantage : si tu changes la logique, tu peux supprimer tous les partages avec cette cause et les recréer.

### Suppression du partage manuel

Le Manual Sharing (RowCause = Manual) est supprimé si le record change d'owner. L'Apex Managed Sharing (cause custom) persiste.
    `,
    tsAnalogy: `
C'est comme insérer directement dans une table de jointure user-resource dans une DB relationnelle :

\`\`\`typescript
// Équivalent en Prisma/TypeORM
await prisma.resourceShare.create({
  data: {
    resourceId: accountId,
    userId: userId,
    accessLevel: 'READ',
    cause: 'MANUAL' // ou une cause custom
  }
});

// SF maintient cette table automatiquement (AccountShare, OpportunityShare, etc.)
// et la respecte à chaque requête SOQL
\`\`\`
    `,
    gotchas: [
      "Tu ne peux pas insérer dans ObjectShare si l'OWD est 'Public Read/Write' — SF l'interdit (inutile dans ce cas)",
      "AccessLevel = 'All' donne Full Access (read + edit + delete + transfer) — à utiliser avec précaution",
      "Le Manual Sharing via UI est perdu quand le record change d'owner — l'Apex Managed Sharing avec RowCause custom persiste",
      "Pour requêter les partages : SELECT Id, UserOrGroupId, AccountAccessLevel FROM AccountShare WHERE AccountId = :id",
    ],
  },
  {
    id: "sec-006",
    title: "Profiles — Permissions objet, FLS, login hours, IP ranges",
    category: "Security & Sharing",
    tags: ["profiles", "permissions", "fls", "security"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Profiles : le passeport de l'utilisateur (en voie de dépréciation)

Un Profile définit ce qu'un utilisateur **peut faire** dans SF — indépendamment de ce qu'il peut **voir**. Chaque utilisateur a exactement **un** profil.

### Ce que contrôle un Profile

#### 1. Object Permissions (CRUD)
\`\`\`
Object: Account
  ☑ Read
  ☑ Create
  ☑ Edit
  ☐ Delete
  ☐ View All
  ☐ Modify All
\`\`\`

**View All** : Bypass la sharing model — voit tous les records de cet objet
**Modify All** : Bypass + peut tout modifier/supprimer

#### 2. Field-Level Security (FLS)
Pour chaque champ d'un objet :
\`\`\`
Field: Account.AnnualRevenue
  ☑ Visible
  ☐ Read Only
\`\`\`

#### 3. App Permissions
Accès aux applications, tabs, Visualforce pages, Apex classes.

#### 4. Login Hours
\`\`\`
Lundi - Vendredi : 8h00 - 20h00
Samedi - Dimanche : Pas de connexion
\`\`\`

#### 5. IP Ranges
\`\`\`
192.168.1.0 - 192.168.1.255  (réseau interne uniquement)
\`\`\`
Si un utilisateur tente de se connecter hors de cette plage, SF exige une vérification par email.

### Profils Standard vs Custom

SF livre des profils standard non modifiables (System Administrator, Standard User, etc.). On crée des profils custom en les clonant.

### Pourquoi les Profiles sont en voie de dépréciation

Salesforce pousse vers un modèle **"Minimum Access Profile + Permission Sets"** :
- Un seul profil "Minimum Access" (accès zéro)
- Tout le reste via Permission Sets
- Plus flexible, plus maintenable
    `,
    tsAnalogy: `
Le Profile, c'est comme la combinaison de ton rôle NestJS + le guard global sur tes routes :

\`\`\`typescript
// Profile = l'ensemble des middlewares et guards attachés à un user
@Injectable()
class ProfileGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    const profile = user.profile;

    // Object permissions → accès aux endpoints CRUD
    // FLS → quels champs sont retournés dans les DTOs
    // Login hours → validé au moment du login
    // IP ranges → validé au niveau du middleware réseau
    return profile.hasPermission(context.getHandler());
  }
}
\`\`\`
    `,
    gotchas: [
      "Un utilisateur sans aucune permission FLS sur un champ ne verra pas ce champ en SOQL — le résultat sera null, pas une erreur",
      "View All et Modify All sur un objet bypasse TOUT le modèle de partage pour cet objet — à réserver aux admins",
      "Les profils standard (Standard User, etc.) ne peuvent pas être supprimés ni modifiés sur certains settings",
      "Salesforce a annoncé la dépréciation progressive des profils — migration recommandée vers Permission Sets",
      "Un profil peut être associé à plusieurs utilisateurs mais chaque utilisateur n'a qu'un seul profil",
    ],
  },
  {
    id: "sec-007",
    title:
      "Permission Sets & Permission Set Groups — Le futur du modèle de sécurité",
    category: "Security & Sharing",
    tags: ["permission-sets", "psg", "security", "permissions"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Permission Sets : ajouter des permissions sans changer le profil

Un Permission Set est un **delta de permissions** qu'on ajoute à un utilisateur en plus de son profil. Un utilisateur peut avoir **0 à N** permission sets.

### Cas d'usage typique

\`\`\`
User: Alice
Profile: Minimum Access (quasi aucun droit)
  + Permission Set: "Manage Accounts"    → CRUD sur Account
  + Permission Set: "View Reports"        → Accès aux rapports
  + Permission Set: "Approve Discounts"   → Custom permission
\`\`\`

### Ce qu'un Permission Set peut contenir

- Object CRUD permissions
- Field-Level Security
- Custom Permissions (feature flags)
- App access
- Apex class access
- VF Page access
- Connected App access

### Permission Set Groups (PSG)

Un PSG regroupe plusieurs Permission Sets en un bundle :

\`\`\`
PSG: "Sales Manager Bundle"
  ├── PS: "Account Management"
  ├── PS: "Opportunity Full Access"
  ├── PS: "Sales Reports"
  └── PS: "Forecast Management"

→ Assigner le PSG = assigner les 4 PS d'un coup
\`\`\`

### Muting Permission Sets

Dans un PSG, tu peux "muter" certaines permissions d'un PS inclus :

\`\`\`
PSG: "Junior Sales Manager Bundle"
  ├── PS: "Account Management"
  ├── PS: "Opportunity Full Access"
  │       avec Muting PS: retire "Delete Opportunity"
  └── PS: "Sales Reports" (lecture seule)
\`\`\`

### Le pattern recommandé (Salesforce 2024+)

\`\`\`
1. Profile "Minimum Access" pour tous les users
2. Permission Sets granulaires (1 PS = 1 capacité métier)
3. Permission Set Groups pour les rôles métier
4. Assign PSG aux users, pas les PS directement
\`\`\`
    `,
    tsAnalogy: `
Les Permission Sets sont comme des décorateurs NestJS qu'on empile sur un controller/handler, en plus du guard de base du profil :

\`\`\`typescript
// Profile = guard global minimal
@UseGuards(MinimumAccessGuard)

// Permission Sets = décorateurs additifs
@RequiresPermissions('manage-accounts', 'view-reports')
@ApproveDiscounts()  // Custom Permission
async someEndpoint() { ... }

// Permission Set Group = un décorateur composite
@SalesManagerBundle() // = @RequiresPermissions('accounts', 'opportunities', 'reports', 'forecast')
async salesEndpoint() { ... }
\`\`\`
    `,
    gotchas: [
      "Les Permission Sets NE PEUVENT PAS retirer des permissions accordées par le Profile — ils sont additifs seulement",
      "Les Muting Permission Sets ne fonctionnent QUE dans le contexte d'un PSG — pas en standalone",
      "Assigner le même PS deux fois à un user n'a aucun effet (idempotent) mais SF peut lever une erreur",
      "Les PSG sont récents (2020+) — certains tutoriels ne les mentionnent pas encore",
      "Un Permission Set peut être associé à une licence spécifique (ex: Sales Cloud) — vérifie la compatibilité",
    ],
  },
  {
    id: "sec-008",
    title: "Field-Level Security (FLS) — CRUD/FLS checks en Apex",
    category: "Security & Sharing",
    tags: ["fls", "security", "apex", "schema"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## FLS : contrôler l'accès aux champs individuels

Le FLS détermine quels champs un utilisateur peut voir et modifier. Configuré dans les Profiles et Permission Sets.

### Le problème : Apex s'exécute en System Mode par défaut

\`\`\`apex
// Ce code ignore le FLS — il récupère TOUS les champs
// même si l'utilisateur n'a pas les droits
List<Account> accounts = [SELECT Id, Name, AnnualRevenue FROM Account];
// AnnualRevenue peut être masqué pour l'utilisateur, mais ce code le retourne quand même
\`\`\`

### Vérifier le FLS manuellement

\`\`\`apex
// Vérifier si un champ est accessible en lecture
Schema.DescribeFieldResult fieldDesc =
    Schema.SObjectType.Account.fields.AnnualRevenue;

if (fieldDesc.isAccessible()) {
    Account acc = [SELECT AnnualRevenue FROM Account WHERE Id = :accId];
}

// Pour Create
if (fieldDesc.isCreateable()) {
    acc.AnnualRevenue = 100000;
    insert acc;
}

// Pour Update
if (fieldDesc.isUpdateable()) {
    acc.AnnualRevenue = 200000;
    update acc;
}
\`\`\`

### Vérifier les permissions objet

\`\`\`apex
Schema.DescribeSObjectResult objDesc = Schema.SObjectType.Account;

if (objDesc.isCreateable()) { insert acc; }
if (objDesc.isUpdateable()) { update acc; }
if (objDesc.isDeletable())  { delete acc; }
if (objDesc.isQueryable())  { /* SELECT ... */ }
\`\`\`

### WITH SECURITY_ENFORCED (SOQL)

Depuis Spring '19, tu peux demander à SOQL d'enforcer le FLS automatiquement :

\`\`\`apex
List<Account> accounts = [
    SELECT Id, Name, AnnualRevenue
    FROM Account
    WITH SECURITY_ENFORCED  // Lève une exception si un champ est inaccessible
];
\`\`\`

⚠️ Attention : si **un seul** champ est inaccessible, toute la requête échoue.

### WITH USER_MODE (Winter '23+)

\`\`\`apex
// Respecte FLS + sharing rules en une seule instruction
List<Account> accounts = [
    SELECT Id, Name, AnnualRevenue
    FROM Account
    WITH USER_MODE
];
\`\`\`
    `,
    tsAnalogy: `
C'est comme un middleware qui filtre les colonnes d'une réponse SQL selon les droits de l'utilisateur :

\`\`\`typescript
// Sans FLS check (dangereux — comme Apex en system mode)
const account = await db.query('SELECT * FROM accounts WHERE id = ?', [id]);

// Avec FLS check (ce que tu dois faire)
const allowedFields = await getFLSAllowedFields('Account', currentUser);
const account = await db.query(
  \`SELECT \${allowedFields.join(', ')} FROM accounts WHERE id = ?\`,
  [id]
);

// WITH SECURITY_ENFORCED → comme un middleware strict qui rejette si un champ manque
// au lieu de filtrer silencieusement
\`\`\`
    `,
    gotchas: [
      "APEX en System Mode ignore FLS par défaut — tu dois vérifier manuellement ou utiliser stripInaccessible()",
      "WITH SECURITY_ENFORCED fait échouer toute la query si UN champ est inaccessible — préférer stripInaccessible()",
      "Les champs de formule héritent du FLS des champs source auxquels ils font référence",
      "Les tests Apex s'exécutent en System Mode — les vérifications FLS ne sont pas testées sans runAs()",
      "isAccessible() vérifie la permission de l'utilisateur COURANT (contexte d'exécution), pas du System Administrator",
    ],
  },
  {
    id: "sec-009",
    title: "with sharing / without sharing / inherited sharing — Keywords Apex",
    category: "Security & Sharing",
    tags: ["sharing", "apex", "system-mode", "user-mode"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## Les 3 modes de sharing en Apex

Ces keywords sur la déclaration de classe contrôlent si les requêtes SOQL/DML respectent le modèle de partage de l'utilisateur courant.

### with sharing

\`\`\`apex
public with sharing class AccountController {
    public List<Account> getAccounts() {
        // Ne retourne QUE les records visibles par l'utilisateur courant
        // Respecte OWD + Role Hierarchy + Sharing Rules
        return [SELECT Id, Name FROM Account];
    }
}
\`\`\`

### without sharing

\`\`\`apex
public without sharing class AccountBatchJob {
    public List<Account> getAllAccounts() {
        // Retourne TOUS les records, ignore le modèle de partage
        return [SELECT Id, Name FROM Account];
    }
}
\`\`\`

### inherited sharing

\`\`\`apex
public inherited sharing class AccountService {
    public List<Account> getAccounts() {
        // Hérite du contexte de l'appelant
        // Si appelé depuis une classe "with sharing" → respecte le partage
        // Si appelé depuis "without sharing" → ignore le partage
        return [SELECT Id, Name FROM Account];
    }
}
\`\`\`

### Pas de keyword du tout

\`\`\`apex
public class AccountHelper { // Pas de keyword
    // En pratique : se comporte comme "without sharing"
    // ⚠️ À ÉVITER — toujours spécifier explicitement
}
\`\`\`

### Règles d'héritage

\`\`\`
ClasseA (with sharing)
    └─► appelle ClasseB (without sharing)
        → ClasseB ignore le partage malgré l'appelant

ClasseA (without sharing)
    └─► appelle ClasseB (with sharing)
        → ClasseB respecte quand même le partage

ClasseA (with sharing)
    └─► appelle ClasseB (inherited sharing)
        → ClasseB respecte le partage (hérite de l'appelant)
\`\`\`

**Important** : \`with sharing\` et \`without sharing\` ne sont PAS transitifs. Chaque classe déclare son propre comportement.

### Quand utiliser quoi ?

| Keyword | Cas d'usage |
|---------|-------------|
| \`with sharing\` | Controllers Apex, tout code user-facing |
| \`without sharing\` | Batch jobs, triggers système, Apex appelé depuis Flow |
| \`inherited sharing\` | Services/utilitaires réutilisables |
| (aucun) | À éviter |
    `,
    tsAnalogy: `
C'est comme un middleware qui peut être activé/désactivé par classe, indépendamment du contexte d'appel :

\`\`\`typescript
// with sharing → middleware d'autorisation actif
@Injectable()
@UseGuards(SharingModelGuard) // toujours actif
class AccountController {
  async getAccounts(currentUser: User) {
    return this.accountService.findAll({ filteredBy: currentUser });
  }
}

// without sharing → sudo mode, ignore les restrictions
class AccountBatchJob {
  async processAll() {
    return this.accountRepo.findAll(); // ALL records
  }
}

// inherited sharing → comportement du parent
class AccountService {
  async getAccounts(options?: { filteredBy?: User }) {
    // Si l'appelant passe filteredBy → filtre, sinon → tout retourne
  }
}
\`\`\`
    `,
    gotchas: [
      "Sans keyword, la classe se comporte comme 'without sharing' en pratique — toujours spécifier explicitement",
      "with sharing ne garantit PAS que tous les records de l'utilisateur sont retournés — il peut y avoir d'autres filtres",
      "Les triggers s'exécutent en System Mode (without sharing) par défaut — attention aux bulkifications",
      "Les Apex @AuraEnabled methods doivent ABSOLUMENT utiliser 'with sharing' pour respecter la sécurité côté Lightning",
      "Un test Apex s'exécute en System Mode — pour tester 'with sharing', il faut utiliser runAs()",
    ],
  },
  {
    id: "sec-010",
    title: "System Mode vs User Mode — Quand le code bypass les permissions",
    category: "Security & Sharing",
    tags: ["system-mode", "user-mode", "security", "apex"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## System Mode : le mode sudo d'Apex

Apex peut s'exécuter en deux contextes de sécurité distincts :

### System Mode (défaut)

\`\`\`
- Ignore OWD, Role Hierarchy, Sharing Rules
- Ignore les Object Permissions (CRUD)
- Ignore le FLS
- Voit tous les records de tous les objets
- Analogie : root sur Linux
\`\`\`

**S'exécutent en System Mode :**
- Triggers
- Classes sans keyword sharing (ou \`without sharing\`)
- Batch Apex
- Scheduled Apex
- @future methods
- Processus SF internes

### User Mode

\`\`\`
- Respecte OWD + Role Hierarchy + Sharing Rules
- Respecte les Object Permissions (CRUD)
- Respecte le FLS
- Ne voit que ce que l'utilisateur voit
\`\`\`

**S'exécutent en User Mode :**
- Classes avec \`with sharing\`
- Code Apex exécuté via Anonymous Apex (par un admin)

### User Mode Query (depuis Winter '23)

Nouvelle syntaxe pour forcer User Mode dans une query :

\`\`\`apex
// Force le mode user pour cette query spécifique
List<Account> accounts = Database.query(
    'SELECT Id, Name FROM Account',
    AccessLevel.USER_MODE
);

// Ou avec SOQL inline
List<Account> accounts = [
    SELECT Id, Name FROM Account
    WITH USER_MODE
];
\`\`\`

### Tableau récapitulatif

\`\`\`
                    System Mode    User Mode
CRUD permissions       ❌ ignoré    ✅ respecté
FLS                    ❌ ignoré    ✅ respecté
Sharing (OWD/Rules)    ❌ ignoré    ✅ respecté
Record visibility      Tous         Selon droits
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// System Mode = exécution en tant que service account (pas l'utilisateur)
const systemDb = createConnection({ user: 'service_account' }); // accès total

// User Mode = exécution avec les droits de l'utilisateur courant
const userDb = createConnection({ user: currentUser.dbUser }); // droits limités

// Trigger SF = middleware système qui tourne avec systemDb
// Controller SF = endpoint qui devrait utiliser userDb (with sharing)
\`\`\`
    `,
    gotchas: [
      "Les triggers en System Mode peuvent accéder à des données que l'utilisateur qui a déclenché le trigger ne voit pas",
      "Même avec 'with sharing', FLS n'est PAS automatiquement appliqué — tu dois appeler stripInaccessible() ou vérifier manuellement",
      "Les tests s'exécutent en System Mode — pour simuler User Mode : System.runAs(testUser) { ... }",
      "Les LWC @wire et @AuraEnabled s'exécutent dans le contexte de l'utilisateur connecté — toujours 'with sharing' sur ces classes",
    ],
  },
  {
    id: "sec-011",
    title: "stripInaccessible() — Enforcer FLS proprement",
    category: "Security & Sharing",
    tags: ["fls", "security", "apex", "stripInaccessible"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## stripInaccessible() : la solution élégante au problème FLS en Apex

Plutôt que de vérifier champ par champ avec \`isAccessible()\`, SF fournit une méthode qui **purge automatiquement** les champs inaccessibles d'une liste de records.

### Syntaxe

\`\`\`apex
SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.READABLE,  // Type de vérification
    records               // Les records à nettoyer
);

List<Account> sanitizedAccounts = (List<Account>) decision.getRecords();
\`\`\`

### Les 4 AccessType

| AccessType | Vérifie | Cas d'usage |
|------------|---------|-------------|
| \`READABLE\` | FLS Read | Avant de retourner des données |
| \`CREATABLE\` | FLS Create | Avant un insert |
| \`UPDATABLE\` | FLS Update | Avant un update |
| \`UPSERTABLE\` | FLS Create + Update | Avant un upsert |

### Exemple complet : GET (retourner des données)

\`\`\`apex
@AuraEnabled
public static List<Account> getAccounts() {
    List<Account> rawAccounts = [
        SELECT Id, Name, AnnualRevenue, Phone, BillingCity
        FROM Account
        LIMIT 50
    ];

    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.READABLE,
        rawAccounts
    );

    return (List<Account>) decision.getRecords();
}
\`\`\`

### Exemple : CREATE (vérifier avant insert)

\`\`\`apex
public static void createAccount(Account newAcc) {
    if (!Schema.SObjectType.Account.isCreateable()) {
        throw new SecurityException('No create permission on Account');
    }

    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.CREATABLE,
        new List<Account>{ newAcc }
    );

    insert (List<Account>) decision.getRecords();
}
\`\`\`

### Obtenir les champs supprimés (audit)

\`\`\`apex
SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.READABLE, records
);

Map<String, Set<String>> removedFields = decision.getRemovedFields();
// { 'Account' => { 'AnnualRevenue', 'Phone' } }
\`\`\`

### stripInaccessible vs WITH SECURITY_ENFORCED

| | stripInaccessible() | WITH SECURITY_ENFORCED |
|-|---------------------|----------------------|
| Comportement si champ inaccessible | Supprime silencieusement | Lève une exception |
| Granularité | Par record, configurable | Par query entière |
| Cas d'usage | API, données partielles OK | Strict, tout ou rien |
    `,
    tsAnalogy: `
C'est l'équivalent d'un transformateur de réponse qui filtre les champs selon les droits :

\`\`\`typescript
// Pattern équivalent dans NestJS avec class-transformer
@Injectable()
class FLSInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const user = context.switchToHttp().getRequest().user;
        return stripInaccessibleFields(data, user.fieldPermissions);
      })
    );
  }
}

// stripInaccessible() fait exactement ça, mais côté SF, au niveau record
\`\`\`
    `,
    gotchas: [
      "stripInaccessible() ne vérifie PAS les Object-level permissions (CRUD) — tu dois vérifier séparément avec isCreateable(), etc.",
      "Les champs supprimés ne lèvent pas d'exception — ils sont silencieusement absents du résultat",
      "stripInaccessible() avec CREATABLE sur un champ Required qui est non-créable peut causer un insert qui échoue",
      "getRemovedFields() retourne une Map<String, Set<String>> — le premier niveau est le nom de l'objet (toujours en majuscules)",
    ],
  },
  {
    id: "sec-012",
    title: "Custom Permissions — Feature flags style Salesforce",
    category: "Security & Sharing",
    tags: ["custom-permissions", "security", "feature-flags"],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## Custom Permissions : des feature flags nommés dans le modèle de sécurité SF

Les Custom Permissions permettent de créer des flags de fonctionnalité qui s'intègrent au système de permissions SF (Profile, Permission Sets).

### Création

Setup > Custom Permissions > New

\`\`\`
Label: Approve Discounts Above 20%
API Name: Approve_High_Discounts__c
Description: Allows approving discounts above 20%
\`\`\`

### Assigner via Permission Set

\`\`\`
Permission Set: "Senior Sales Manager"
  Custom Permissions:
    ☑ Approve_High_Discounts__c
\`\`\`

### Vérifier en Apex

\`\`\`apex
if (FeatureManagement.checkPermission('Approve_High_Discounts__c')) {
    opp.DiscountApproved__c = true;
}
\`\`\`

### Vérifier en Formulas / Validation Rules

\`\`\`
$Permission.Approve_High_Discounts__c
\`\`\`

Utilisable dans :
- Formules de champs
- Règles de validation
- Règles de workflow
- Flow Conditions

### Vérifier en LWC (Apex)

\`\`\`apex
@AuraEnabled(cacheable=true)
public static Boolean canApproveHighDiscounts() {
    return FeatureManagement.checkPermission('Approve_High_Discounts__c');
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Custom Permission SF = feature flag lié au système de droits
// Équivalent avec LaunchDarkly/FeatureFlags mais dans SF :

// Au lieu de :
const canApprove = await featureFlags.get('approve-high-discounts', user.id);

// En SF Apex :
const canApprove = FeatureManagement.checkPermission('Approve_High_Discounts__c');
// → vérifie si l'utilisateur a ce flag via son profil/permission sets

// En formule SF :
// $Permission.Approve_High_Discounts__c → true/false directement
\`\`\`
    `,
    gotchas: [
      "FeatureManagement.checkPermission() prend le API name SANS le suffixe __c en paramètre",
      "Les Custom Permissions ne peuvent être vérifiées en SOQL que via la table SetupEntityAccess — requête complexe",
      "Dans les formules, on utilise $Permission.Approve_High_Discounts__c (avec le __c cette fois)",
      "Les Custom Permissions sont déployables via Metadata API — utile pour CI/CD",
    ],
  },
  {
    id: "sec-013",
    title: "Connected Apps — OAuth consumers dans l'écosystème Salesforce",
    category: "Security & Sharing",
    tags: ["connected-apps", "oauth", "security", "integration"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "Integration-Arch"],
    content: `
## Connected Apps : enregistrer une application externe auprès de Salesforce

Une Connected App est l'équivalent SF d'un "OAuth 2.0 Client" — elle représente une application externe qui veut accéder à l'API SF.

### Création dans Setup

\`\`\`
Setup > App Manager > New Connected App

Nom: My External App
Email: admin@company.com
Callback URL: https://myapp.com/oauth/callback
OAuth Scopes:
  ☑ Access and manage your data (api)
  ☑ Access your basic information (id, profile, email, address, phone)
  ☑ Perform requests on your behalf at any time (refresh_token)
\`\`\`

### Ce que SF génère

\`\`\`
Consumer Key    : 3MVG9xxxxxxxxxxxxxxxxxxx  (= client_id)
Consumer Secret : yyyyyyy                   (= client_secret)
\`\`\`

### Les OAuth Scopes principaux

| Scope SF | Description |
|----------|-------------|
| \`api\` | Accès REST/SOAP API |
| \`id\` | OpenID Connect (infos user) |
| \`refresh_token\` | Obtenir des refresh tokens |
| \`web\` | Accès UI web SF |
| \`full\` | Accès complet (éviter en prod) |

### Policies sur une Connected App

- **IP Relaxation** : Relaxer ou enforcer les IP ranges
- **Refresh Token Policy** : Durée de vie des refresh tokens
- **Permitted Users** : All users OR Admin approved users only

### Approuver les utilisateurs (Admin approved)

Quand "Permitted Users = Admin approved users only" :
\`\`\`
Les utilisateurs doivent être explicitement approuvés via :
- Profile (ajouter la Connected App au profil)
- Permission Set (ajouter à un PS)
\`\`\`
    `,
    tsAnalogy: `
Une Connected App SF, c'est exactement un OAuth 2.0 Client Registration dans une implémentation OAuth standard :

\`\`\`typescript
const oauthClient = {
  clientId: '3MVG9xxx',      // Consumer Key SF
  clientSecret: 'yyy',       // Consumer Secret SF
  redirectUri: 'https://myapp.com/oauth/callback',
  scopes: ['api', 'id', 'refresh_token']
};

// Authorization Code Flow
// GET /services/oauth2/authorize?client_id=3MVG9xxx&redirect_uri=...&response_type=code
// POST /services/oauth2/token (échange du code contre le token)
\`\`\`
    `,
    gotchas: [
      "Consumer Key = client_id, Consumer Secret = client_secret — SF utilise des noms différents des standards OAuth",
      "Les Connected Apps survivent aux déploiements et aux sandboxes — Consumer Key et Secret sont différents dans chaque org",
      "Un changement de Consumer Secret invalide immédiatement tous les access tokens existants",
      "Les refresh tokens SF n'expirent jamais par défaut — configure une politique d'expiration en production",
      "Pour les intégrations server-to-server, préférer JWT Bearer Token Flow (pas de callback URL nécessaire)",
    ],
  },
  {
    id: "sec-014",
    title: "Shield Platform Encryption — Chiffrement at rest",
    category: "Security & Sharing",
    tags: ["shield", "encryption", "security", "compliance"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Shield Platform Encryption : chiffrement des données au repos

**Licence supplémentaire requise** (Salesforce Shield). Permet de chiffrer les données stockées dans SF, au-delà du chiffrement standard de l'infrastructure.

### Chiffrement Standard vs Shield

\`\`\`
Standard SF :
  - Chiffrement de l'infrastructure (disques, backups)
  - SF peut déchiffrer vos données (accès support, etc.)

Shield Platform Encryption :
  - Chiffrement au niveau applicatif
  - Clés gérées par le client (BYOK possible)
  - SF ne peut PAS accéder à vos données en clair
\`\`\`

### Ce qui peut être chiffré

- Champs standard spécifiques (certains champs sur Account, Contact, etc.)
- Champs custom de type Text, Email, Phone, URL, TextArea
- Files & Attachments
- Chatter posts

### Ce qui NE peut PAS être chiffré

- Champs ID, formules, roll-up summaries
- Champs utilisés dans les index (SOQL WHERE, ORDER BY)
- External IDs

### Impact sur les fonctionnalités

\`\`\`
❌ Pas de tri SOQL sur les champs chiffrés
❌ Pas de LIKE sur les champs chiffrés (sauf Shield Search)
❌ Pas de roll-up summary depuis un champ chiffré
❌ Pas de matching rules/duplicate rules sur les champs chiffrés
✅ Les champs chiffrés sont lisibles en Apex (déchiffrés transparentement)
\`\`\`

### Key Management

\`\`\`
Tenant Secret  (géré par le client dans SF)
     ×
Master Secret  (géré par SF)
     =
Data Encryption Key (DEK)
\`\`\`

**BYOK** (Bring Your Own Key) : tu fournis ta propre clé maître, SF ne la connaît jamais en clair.
    `,
    tsAnalogy: `
C'est comme chiffrer certaines colonnes de ta base PostgreSQL avec une clé que seul ton app server connaît — même un accès root à la DB ne permet pas de lire ces données :

\`\`\`typescript
// Analogie : column-level encryption dans PostgreSQL
// CREATE TABLE accounts (
//   id uuid PRIMARY KEY,
//   name text,
//   ssn bytea -- chiffré avec pgcrypto ou Vault
// );

// Shield PE = SF fait ça pour toi, avec gestion des clés intégrée
// Mais avec des limitations sur SOQL (pas de WHERE/ORDER sur colonnes chiffrées)
\`\`\`
    `,
    gotchas: [
      "Shield Platform Encryption nécessite une licence supplémentaire — ce n'est pas dans la licence SF de base",
      "Une fois un champ chiffré, la recherche SOQL sur ce champ (WHERE field = 'x') ne fonctionnera plus sans Shield Search",
      "Les champs chiffrés ne peuvent pas être utilisés dans les formules ou roll-up summaries",
      "La rotation des clés peut rendre les données temporairement inaccessibles — planifier des fenêtres de maintenance",
      "Shield Encryption est différent du 'Classic Encryption' (le type de champ 'Encrypted Text') — le Classic est obsolète et basique",
    ],
  },

  // ─────────────────────────────────────────────
  // INTEGRATION
  // ─────────────────────────────────────────────
  {
    id: "int-001",
    title:
      "APIs Salesforce — REST, SOAP, Bulk, Streaming, Metadata — Quelle API pour quel besoin",
    category: "Integration",
    tags: ["api", "rest", "soap", "bulk", "streaming", "metadata"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2", "Integration-Arch"],
    content: `
## L'écosystème d'APIs Salesforce

SF expose plusieurs APIs pour des usages différents. Choisir la mauvaise peut résulter en timeouts ou consommation excessive de limits.

### Vue d'ensemble

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    Salesforce APIs                              │
│                                                                 │
│  REST API           SOAP API          Bulk API 2.0              │
│  └ CRUD records     └ CRUD records    └ Mass data operations    │
│  └ Simple/Mobile    └ Legacy/Java     └ Millions de records     │
│                                                                 │
│  Streaming API      Metadata API      Tooling API               │
│  └ Real-time events └ Déploiement     └ Dev tooling             │
│  └ CometD/SSE       └ package.xml     └ Query logs/coverage     │
│                                                                 │
│  GraphQL API        Connect API       Analytics API             │
│  └ Queries flex     └ Communities     └ Einstein Analytics      │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Tableau de décision

| Besoin | API recommandée |
|--------|-----------------|
| CRUD classique (< 2000 records) | REST API |
| Intégration legacy SOAP | SOAP API |
| Import/export massif (> 2000 records) | Bulk API 2.0 |
| Notifications temps réel | Streaming API (CometD) |
| Déploiement de métadonnées | Metadata API |
| Requêtes mobiles/flexibles | GraphQL API |

### REST API

\`\`\`http
Base URL: https://[instance].my.salesforce.com/services/data/v59.0/

GET    /sobjects/Account/{id}                 → Lire un record
POST   /sobjects/Account                      → Créer un record
PATCH  /sobjects/Account/{id}                 → Mettre à jour
DELETE /sobjects/Account/{id}                 → Supprimer
GET    /query?q=SELECT+Id+FROM+Account        → SOQL query
POST   /composite/batch                       → Batch de requêtes
\`\`\`

### Bulk API 2.0

\`\`\`
1. Créer un Job (type: ingest/query, operation: insert/update/upsert/delete)
2. Uploader les données (CSV)
3. Fermer le Job
4. Polling jusqu'à completion
5. Télécharger les résultats (succès/erreurs)
\`\`\`

### Limites importantes

\`\`\`
REST/SOAP API : 24h rolling limit (15 000 - 1 000 000 selon licence)
Bulk API      : 10 000 jobs/24h, 150 millions records/24h
Streaming API : 200 clients simultanés, 50 000 events/24h
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// REST API SF → comme appeler une API REST classique
const response = await fetch(
  'https://org.salesforce.com/services/data/v59.0/sobjects/Account/001xx',
  { headers: { Authorization: 'Bearer ' + accessToken } }
);

// Bulk API → comme un ETL pipeline avec CSV
// Au lieu de 50 000 requêtes REST individuelles :
// 1. POST /jobs/ingest → créer le job
// 2. PUT /jobs/{id}/batches → upload CSV (50k lignes)
// 3. PATCH /jobs/{id} → fermer (state: UploadComplete)
// 4. GET /jobs/{id} → polling (state: JobComplete)

// Streaming API → comme Server-Sent Events ou WebSocket
const cometd = new CometD();
cometd.subscribe('/data/ChangeEvents', (message) => {
  console.log('Record changed:', message.data);
});
\`\`\`
    `,
    gotchas: [
      "La version de l'API (v59.0) doit être spécifiée — les nouvelles fonctionnalités ne sont disponibles que dans les versions récentes",
      "Bulk API 2.0 est asynchrone — ne pas utiliser pour des opérations qui nécessitent une réponse immédiate",
      "Les limits API sont partagées entre TOUTES les intégrations de l'org — une intégration gourmande peut bloquer les autres",
      "SOAP API nécessite la génération d'un WSDL et des stubs — très verbeux, éviter pour les nouvelles intégrations",
    ],
  },
  {
    id: "int-002",
    title:
      "REST API Salesforce — Endpoints, limites, authentication, response format",
    category: "Integration",
    tags: ["rest-api", "authentication", "limits", "json"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "Integration-Arch"],
    content: `
## REST API : l'API principale pour les intégrations modernes

### Base URL et versioning

\`\`\`
https://[MyDomain].my.salesforce.com/services/data/v59.0/
\`\`\`

### Authentication Flow (OAuth 2.0 avec access token)

\`\`\`http
POST https://login.salesforce.com/services/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=3MVG9xxxxx
&client_secret=yyyyy
&username=user@company.com
&password=password+security_token

Response:
{
  "access_token": "00D...",
  "instance_url": "https://acme.my.salesforce.com",
  "token_type": "Bearer"
}
\`\`\`

### Endpoints principaux

\`\`\`http
GET    /sobjects/Account/{id}
POST   /sobjects/Account
PATCH  /sobjects/Account/{id}
DELETE /sobjects/Account/{id}

# Upsert par External ID
PATCH  /sobjects/Account/ExternalId__c/{value}

# SOQL Query
GET /query?q=SELECT+Id,Name+FROM+Account

# SOQL avec pagination (queryMore)
GET /query/{queryLocator}
\`\`\`

### Response format

\`\`\`json
// GET /query?q=SELECT Id, Name FROM Account
{
  "totalSize": 150,
  "done": false,
  "nextRecordsUrl": "/services/data/v59.0/query/01gxx...",
  "records": [
    { "Id": "001...", "Name": "Acme", "attributes": { "type": "Account", "url": "..." } }
  ]
}
\`\`\`

### Composite API — plusieurs opérations en 1 requête

\`\`\`json
POST /services/data/v59.0/composite
{
  "allOrNone": true,
  "compositeRequest": [
    {
      "method": "POST",
      "url": "/services/data/v59.0/sobjects/Account",
      "referenceId": "refAccount",
      "body": { "Name": "Test Corp" }
    },
    {
      "method": "POST",
      "url": "/services/data/v59.0/sobjects/Contact",
      "referenceId": "refContact",
      "body": {
        "LastName": "Doe",
        "AccountId": "@{refAccount.id}"
      }
    }
  ]
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
class SalesforceClient {
  async query<T>(soql: string): Promise<T[]> {
    let results: T[] = [];
    let url = \`\${this.baseUrl}/query?q=\${encodeURIComponent(soql)}\`;

    do {
      const { records, done, nextRecordsUrl } = await this.get(url);
      results.push(...records);
      url = done ? null : this.baseUrl + nextRecordsUrl;
    } while (url);

    return results;
  }
}
// La pagination SF : itérer jusqu'à done=true
\`\`\`
    `,
    gotchas: [
      "La pagination SOQL : done=false signifie qu'il y a plus de records — itérer avec nextRecordsUrl",
      "La taille max d'une page SOQL est 2000 records — utiliser Sforce-Query-Options: batchSize=200 pour ajuster",
      "L'access token expire après 2h par défaut — implémenter le refresh token flow ou utiliser JWT Bearer",
      "Le champ 'attributes' est toujours présent dans les réponses SF — le filtrer si tu sérialises vers tes types",
      "PATCH et non PUT pour les updates — SF ne supporte pas PUT sur les sobjects",
    ],
  },
  {
    id: "int-003",
    title: "Apex HTTP Callouts — HttpRequest, HttpResponse, Named Credentials",
    category: "Integration",
    tags: ["callouts", "http", "apex", "named-credentials"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Apex HTTP Callouts : appeler des APIs externes depuis Apex

### Syntaxe de base

\`\`\`apex
public class ExternalAPIService {
    public static String callExternalAPI(String endpoint) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + getToken());
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(10000); // 10 secondes max

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new CalloutException(
                'Error ' + res.getStatusCode() + ': ' + res.getBody()
            );
        }
    }
}
\`\`\`

### Contraintes importantes

\`\`\`
- Timeout max : 120 secondes
- Taille réponse max : 6 MB
- Max 100 callouts par transaction
- L'URL doit être whitelistée (Remote Site Settings ou Named Credentials)
- Impossible de faire un callout APRÈS un DML non commité dans la même transaction
\`\`\`

### POST avec body JSON

\`\`\`apex
Map<String, Object> payload = new Map<String, Object>{
    'name' => 'Test',
    'email' => 'test@example.com',
    'amount' => 1000
};

HttpRequest req = new HttpRequest();
req.setEndpoint('https://api.myservice.com/create');
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');
req.setBody(JSON.serialize(payload));

HttpResponse res = new Http().send(req);
\`\`\`

### Callout depuis un Trigger — la règle du @future

\`\`\`apex
// ❌ IMPOSSIBLE — callout dans un trigger APRÈS un DML
trigger AccountTrigger on Account (after insert) {
    Http http = new Http();
    http.send(req); // ERREUR : "You have uncommitted work pending"
}

// ✅ CORRECT — déléguer à une méthode @future
trigger AccountTrigger on Account (after insert) {
    Set<Id> ids = Trigger.newMap.keySet();
    ExternalAPIService.notifyExternalSystem(ids);
}

public class ExternalAPIService {
    @future(callout=true)
    public static void notifyExternalSystem(Set<Id> ids) {
        // Ici le callout est OK — transaction séparée
    }
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// La contrainte "pas de callout après DML" ≈
// "pas de requête HTTP dans une transaction DB en cours"

// ❌ Problématique
async createAndNotify(data: CreateDto) {
  await this.prisma.$transaction(async (tx) => {
    const record = await tx.account.create({ data });
    await this.httpService.post('https://api.ext.com/notify', record); // problème
  });
}

// ✅ Correct
async createAndNotify(data: CreateDto) {
  const record = await this.accountService.create(data);
  await this.httpService.post('https://api.ext.com/notify', record);
}
\`\`\`
    `,
    gotchas: [
      "Impossible de faire un callout dans la même transaction qu'un DML non commité — utiliser @future(callout=true)",
      "Les callouts Apex ne fonctionnent pas dans les méthodes synchrones appelées depuis un trigger — toujours @future ou Queueable",
      "Le timeout maximum est 120 secondes, mais les bonnes pratiques recommandent 10-30 secondes",
      "Les Named Credentials sont préférables aux Remote Site Settings — elles gèrent aussi l'authentification",
      "En tests, tous les callouts doivent être mockés — SF lève une exception si un vrai callout est tenté dans un test",
    ],
  },
  {
    id: "int-004",
    title: "Named Credentials & External Credentials — Le pattern moderne",
    category: "Integration",
    tags: [
      "named-credentials",
      "external-credentials",
      "security",
      "integration",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2", "Integration-Arch"],
    content: `
## Named Credentials : gestion centralisée des endpoints et credentials

### Architecture

\`\`\`
External Credential (Authentification)
    │ référencé par
    ▼
Named Credential (URL + paramètres)
    │ utilisé par
    ▼
Apex Callout
\`\`\`

### Nouveau modèle (2022+) — External Credentials + Named Credentials

#### 1. External Credential (l'authentification)

\`\`\`
Setup > Named Credentials > External Credentials > New

Label: My Service OAuth
Authentication Protocol: OAuth 2.0 Client Credentials
  Client ID: xxxxx
  Client Secret: yyyyy
  Token URL: https://auth.myservice.com/token
\`\`\`

#### 2. Named Credential (l'endpoint)

\`\`\`
Setup > Named Credentials > Named Credentials > New

Label: My External Service
URL: https://api.myservice.com
External Credential: My_Service_OAuth
\`\`\`

### Utilisation en Apex

\`\`\`apex
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:My_External_Service/users/123');
req.setMethod('GET');
// PLUS BESOIN de gérer les tokens — SF gère l'auth automatiquement

HttpResponse res = new Http().send(req);
\`\`\`

### Types d'authentification disponibles

| Protocol | Cas d'usage |
|----------|-------------|
| No Authentication | APIs publiques |
| Password | HTTP Basic Auth |
| OAuth 2.0 Client Credentials | Server-to-server |
| OAuth 2.0 Authorization Code | User-level auth |
| AWS Signature V4 | AWS services |

### Avantages

\`\`\`
✅ Pas de credentials dans le code Apex
✅ Rotation des secrets sans redéploiement
✅ Gestion des tokens automatique (refresh)
✅ Différents credentials par sandbox/prod
✅ Pas besoin de Remote Site Settings
\`\`\`
    `,
    tsAnalogy: `
Les Named Credentials sont comme un service de secrets (Vault, AWS Secrets Manager) combiné à un HTTP client pre-configuré :

\`\`\`typescript
// Sans Named Credentials (mauvaise pratique)
const token = process.env.EXTERNAL_API_TOKEN;
await fetch(\`https://api.service.com/\${path}\`, {
  headers: { Authorization: \`Bearer \${token}\` }
});

// Avec Named Credentials SF (équivalent conceptuel)
// En Apex, tu fais juste :
req.setEndpoint('callout:My_External_Service/' + path);
// SF injecte automatiquement le token approprié

// Équivalent Node.js avec un HttpClient pre-configuré depuis Vault :
const client = secretsManager.getHttpClient('My_External_Service');
await client.get('/users/123');
\`\`\`
    `,
    gotchas: [
      "Les Legacy Named Credentials sont dépréciées depuis Winter '23 — utiliser le nouveau modèle EC + NC",
      "Le nom de la Named Credential est case-sensitive dans 'callout:MyCredential'",
      "Les Named Credentials ne sont pas synchronisées entre orgs lors des changements — chaque org a ses propres credentials",
      "Pour les tests, SF ne fait pas de vrais callouts — les tests doivent utiliser HttpCalloutMock même avec Named Credentials",
    ],
  },
  {
    id: "int-005",
    title: "@RestResource — Exposer des REST endpoints custom en Apex",
    category: "Integration",
    tags: ["rest-resource", "apex", "api", "endpoints"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## @RestResource : créer des APIs REST custom dans SF

### Syntaxe de base

\`\`\`apex
@RestResource(urlMapping='/orders/*')
global class OrderController {

    @HttpGet
    global static OrderResponse getOrder() {
        RestRequest req = RestContext.request;
        String orderId = req.requestURI.substringAfterLast('/');

        Order__c order = [SELECT Id, Name, Amount__c FROM Order__c WHERE Id = :orderId];
        return new OrderResponse(order);
    }

    @HttpPost
    global static OrderResponse createOrder() {
        OrderRequest body = (OrderRequest) JSON.deserialize(
            RestContext.request.requestBody.toString(),
            OrderRequest.class
        );

        Order__c newOrder = new Order__c(
            Name = body.name,
            Amount__c = body.amount
        );
        insert newOrder;

        RestContext.response.statusCode = 201;
        return new OrderResponse(newOrder);
    }

    global class OrderRequest {
        global String name;
        global Decimal amount;
    }

    global class OrderResponse {
        global String id;
        global String name;
        global Decimal amount;

        global OrderResponse(Order__c o) {
            this.id = o.Id;
            this.name = o.Name;
            this.amount = o.Amount__c;
        }
    }
}
\`\`\`

### URL d'accès

\`\`\`
https://[org].my.salesforce.com/services/apexrest/orders/
https://[org].my.salesforce.com/services/apexrest/orders/123
\`\`\`

### RestContext — L'objet contexte

\`\`\`apex
RestContext.request.requestURI     // URL complète
RestContext.request.httpMethod     // GET, POST, etc.
RestContext.request.params         // Query params (Map<String, String>)
RestContext.request.headers        // Headers (Map<String, String>)
RestContext.request.requestBody    // Blob du body
RestContext.response.statusCode    // Set le status code
RestContext.response.responseBody  // Set le body (Blob)
\`\`\`

### Retourner des erreurs HTTP

\`\`\`apex
@HttpGet
global static Order__c getOrder() {
    String orderId = RestContext.request.requestURI.substringAfterLast('/');
    List<Order__c> orders = [SELECT Id, Name FROM Order__c WHERE Id = :orderId];

    if (orders.isEmpty()) {
        RestContext.response.statusCode = 404;
        RestContext.response.responseBody = Blob.valueOf(
            JSON.serialize(new Map<String, String>{ 'error' => 'Not found' })
        );
        return null;
    }

    return orders[0];
}
\`\`\`
    `,
    tsAnalogy: `
@RestResource est comme un contrôleur Express/NestJS, mais dans SF :

\`\`\`typescript
// NestJS Controller = @RestResource Apex
@Controller('orders')
export class OrderController {

  @Get(':id')  // = @HttpGet en Apex
  async getOrder(@Param('id') id: string) {
    const order = await this.orderService.findById(id);
    if (!order) throw new NotFoundException();
    return order;
  }

  @Post()  // = @HttpPost en Apex
  @HttpCode(201)
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }
}

// URL SF: /services/apexrest/orders/123
// URL NestJS: /orders/123
\`\`\`
    `,
    gotchas: [
      "La classe DOIT être 'global', pas juste 'public' — sinon SF refuse de l'exposer comme endpoint REST",
      "Les méthodes HTTP doivent aussi être 'global static' — pas d'instance methods",
      "Le wildcard '*' dans urlMapping matche UN segment d'URL, pas plusieurs",
      "Pas de versioning natif dans @RestResource — gérer dans l'URL ou les headers manuellement",
      "L'authentification SF (OAuth token) s'applique toujours — pas de endpoints publics via @RestResource",
    ],
  },
  {
    id: "int-006",
    title:
      "Connected Apps & OAuth 2.0 — Authorization Code, Client Credentials, JWT Bearer",
    category: "Integration",
    tags: ["oauth", "connected-apps", "jwt", "authentication"],
    difficulty: "advanced",
    certRelevance: ["PD1", "Integration-Arch"],
    content: `
## Les 3 flux OAuth principaux avec Salesforce

### 1. Authorization Code Flow — Pour les apps avec utilisateurs

\`\`\`http
Step 1: Rediriger vers SF
GET https://login.salesforce.com/services/oauth2/authorize
  ?client_id=3MVG9xxx
  &redirect_uri=https://myapp.com/callback
  &response_type=code
  &scope=api+id+refresh_token

Step 2: L'utilisateur se connecte et consent

Step 3: SF redirige vers callback avec code

Step 4: Échanger le code contre un token
POST https://login.salesforce.com/services/oauth2/token
  grant_type=authorization_code
  &client_id=3MVG9xxx
  &client_secret=yyy
  &code=aPrx...
\`\`\`

### 2. Client Credentials Flow — Server-to-server sans utilisateur

\`\`\`http
POST https://login.salesforce.com/services/oauth2/token
  grant_type=client_credentials
  &client_id=3MVG9xxx
  &client_secret=yyy
\`\`\`

⚠️ Nécessite d'activer "Client Credentials Flow" sur la Connected App et d'assigner un "Run As" user.

### 3. JWT Bearer Token Flow — Server-to-server avec certificat

\`\`\`
JWT Payload:
{
  "iss": "3MVG9xxx",           // client_id (Consumer Key)
  "sub": "user@company.com",   // l'utilisateur SF impersonné
  "aud": "https://login.salesforce.com",
  "exp": now + 3 minutes
}

POST https://login.salesforce.com/services/oauth2/token
  grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
  &assertion=eyJhbGciOi...
\`\`\`

### Comparaison des flows

| Flow | Cas d'usage | Avantages | Inconvénients |
|------|-------------|-----------|---------------|
| Auth Code | App avec login utilisateur | UX native SF | Redirect nécessaire |
| Client Credentials | Intégration backend | Simple | Secret dans le code |
| JWT Bearer | CI/CD, Intégration enterprise | Pas de secret, cert-based | Setup plus complexe |

### Refresh Token

\`\`\`http
POST https://login.salesforce.com/services/oauth2/token
  grant_type=refresh_token
  &client_id=3MVG9xxx
  &client_secret=yyy
  &refresh_token=5Aep...
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// JWT Bearer Flow - implémentation TypeScript
import jwt from 'jsonwebtoken';
import fs from 'fs';

async function getSFAccessToken(): Promise<string> {
  const privateKey = fs.readFileSync('./sf-private.key');

  const jwtPayload = {
    iss: process.env.SF_CLIENT_ID,
    sub: process.env.SF_USERNAME,
    aud: 'https://login.salesforce.com',
    exp: Math.floor(Date.now() / 1000) + 180, // 3 minutes
  };

  const assertion = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });

  const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const { access_token } = await response.json();
  return access_token;
}
\`\`\`
    `,
    gotchas: [
      "JWT Bearer : le certificat public doit être uploadé dans la Connected App AVANT d'utiliser le flow",
      "JWT Bearer : l'exp ne peut pas dépasser 5 minutes depuis l'heure actuelle (souvent 3 minutes recommandé)",
      "Client Credentials : nécessite que 'Client Credentials Flow' soit coché dans la Connected App — pas activé par défaut",
      "Pour Sandbox : test.salesforce.com au lieu de login.salesforce.com pour les token endpoints",
    ],
  },
  {
    id: "int-007",
    title: "Platform Events — Publish/Subscribe, EventBus, CometD",
    category: "Integration",
    tags: ["platform-events", "pub-sub", "eventbus", "cometd", "streaming"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2", "Integration-Arch"],
    content: `
## Platform Events : le bus d'événements de Salesforce

Les Platform Events sont des événements structurés, publiés/consommés en asynchrone. C'est l'implémentation SF du pattern pub/sub.

### Créer un Platform Event

\`\`\`
Setup > Platform Events > New Platform Event

Label: Order Created
API Name: Order_Created__e   ← Le suffixe __e est obligatoire !

Champs custom:
  Order_Id__c       : Text(18)
  Customer_Email__c : Email
  Amount__c         : Number
\`\`\`

### Publier depuis Apex (EventBus.publish)

\`\`\`apex
Order_Created__e event = new Order_Created__e(
    Order_Id__c = orderId,
    Customer_Email__c = 'customer@email.com',
    Amount__c = 1500.00
);

Database.SaveResult result = EventBus.publish(event);

// Publier en masse
List<Order_Created__e> events = new List<Order_Created__e>();
for (Order__c order : orders) {
    events.add(new Order_Created__e(Order_Id__c = order.Id));
}
List<Database.SaveResult> results = EventBus.publish(events);
\`\`\`

### Consommer avec un Trigger Apex

\`\`\`apex
trigger OrderCreatedTrigger on Order_Created__e (after insert) {
    for (Order_Created__e event : Trigger.new) {
        OrderProcessingService.processOrder(event.Order_Id__c);
    }
}
\`\`\`

### Consommer depuis une app externe (CometD)

\`\`\`javascript
const cometd = new org.cometd.CometD();

cometd.configure({
    url: instanceUrl + '/cometd/59.0/',
    requestHeaders: { Authorization: 'Bearer ' + accessToken }
});

cometd.handshake((handshakeReply) => {
    if (handshakeReply.successful) {
        cometd.subscribe('/event/Order_Created__e', (message) => {
            const payload = message.data.payload;
            const replayId = message.data.event.replayId;
        });
    }
});
\`\`\`

### Replay — reprendre depuis un événement passé

\`\`\`javascript
// -1 = seulement les nouveaux events
// -2 = events des dernières 72h (rétention par défaut)
// replayId spécifique = reprendre depuis cet event
cometd.subscribe('/event/Order_Created__e', callback, {
    ext: { replay: { '/event/Order_Created__e': -2 } }
});
\`\`\`

### Limites

\`\`\`
Rétention  : 72 heures (par défaut)
Livraison  : At-least-once (duplicates possibles)
Volume max : 250 000 events/heure (Orgs Enterprise+)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Platform Events = Redis Pub/Sub ou Kafka, mais dans SF

// Publier (SF Apex) ≈ Redis PUBLISH
// EventBus.publish(event) ≈ redisClient.publish('order-created', JSON.stringify(data))

// Consommer (Trigger Apex) ≈ subscriber Redis
// trigger on Order_Created__e ≈ redisClient.subscribe('order-created', handler)

// Consommer (externe via CometD) ≈ Kafka consumer avec offset
// Le replayId ≈ l'offset Kafka
// replayId = -2 → 'earliest' (72h max)
// replayId = -1 → 'latest' (nouveaux seulement)
// replayId = N  → 'resume from N' (comme --offset N dans Kafka)
\`\`\`
    `,
    gotchas: [
      "Le suffixe __e est OBLIGATOIRE pour les Platform Events — Order_Created__e et non Order_Created__c",
      "At-least-once delivery : un événement peut être livré plusieurs fois — rendre les consumers idempotents",
      "La rétention est de 72h seulement — pas fait pour l'event sourcing à long terme",
      "Un trigger sur Platform Event ne peut PAS faire de callout HTTP directement — utiliser @future(callout=true)",
      "Les Platform Events publiés dans une transaction Apex ne sont livrés que si la transaction est committée",
    ],
  },
  {
    id: "int-008",
    title:
      "Change Data Capture (CDC) — Événements automatiques sur data changes",
    category: "Integration",
    tags: ["cdc", "change-data-capture", "streaming", "integration"],
    difficulty: "advanced",
    certRelevance: ["Integration-Arch"],
    content: `
## Change Data Capture : notifications automatiques sur les modifications de records

CDC génère automatiquement des événements pour les changements (create, update, delete, undelete) sur les records SF — sans code Apex.

### Activation

\`\`\`
Setup > Change Data Capture > Sélectionner les objets à surveiller
\`\`\`

### Channel CometD

\`\`\`
/data/AccountChangeEvent       → Changements sur Account
/data/MyObject__ChangeEvent    → Custom object
/data/ChangeEvents             → TOUS les changements (channel universel)
\`\`\`

### Structure d'un événement CDC

\`\`\`json
{
  "data": {
    "payload": {
      "ChangeEventHeader": {
        "entityName": "Account",
        "recordIds": ["001xx000003GYk7AAG"],
        "changeType": "UPDATE",
        "changedFields": ["Name", "Phone", "LastModifiedDate"],
        "commitTimestamp": 1234567890,
        "commitUser": "005xx000001SwSiAAK"
      },
      "Name": "New Account Name",
      "Phone": "0123456789"
    },
    "event": { "replayId": 8 }
  }
}
\`\`\`

### CDC vs Platform Events

| | CDC | Platform Events |
|-|-----|-----------------|
| Déclenchement | Automatique sur DML | Manuel (EventBus.publish) |
| Structure | ChangeEventHeader + champs modifiés | Champs custom définis |
| Rétention | 3 jours | 3 jours |
| Cas d'usage | Sync de données | Événements métier |

### Trigger Apex sur CDC

\`\`\`apex
trigger AccountCDCTrigger on AccountChangeEvent (after insert) {
    for (AccountChangeEvent event : Trigger.new) {
        EventBus.ChangeEventHeader header = event.ChangeEventHeader;

        if (header.changeType == 'CREATE') {
            System.debug('New account: ' + header.recordIds[0]);
        } else if (header.changeType == 'UPDATE') {
            System.debug('Updated fields: ' + header.changedFields);
        }
    }
}
\`\`\`

### Gap events — quand SF est débordé

\`\`\`
GAP_CREATE, GAP_UPDATE, GAP_DELETE, GAP_UNDELETE :
SF signale qu'il y a eu des changements mais ne peut pas les détailler
→ Le consumer doit faire une requête API complète pour se resynchroniser
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// CDC SF ≈ PostgreSQL LISTEN/NOTIFY ou Debezium sur MySQL

// PostgreSQL LISTEN/NOTIFY
// CREATE TRIGGER account_change_trigger AFTER INSERT OR UPDATE OR DELETE
//   ON accounts FOR EACH ROW EXECUTE FUNCTION notify_account_change();

// SF CDC fait exactement ça automatiquement pour les objets activés
// + rétention 72h + replay + gap events + changedFields

cometd.subscribe('/data/AccountChangeEvent', (message) => {
  const { ChangeEventHeader, ...changedData } = message.data.payload;
  if (ChangeEventHeader.changeType === 'UPDATE') {
    // Seulement les champs modifiés sont dans changedData
    syncToExternalDB(ChangeEventHeader.recordIds[0], changedData);
  }
});
\`\`\`
    `,
    gotchas: [
      "CDC ne retourne que les champs MODIFIÉS dans le payload — les autres champs sont absents (pas null)",
      "Les Gap Events indiquent une perte de données dans le stream — prévoir un mécanisme de resync complet",
      "CDC ne capture pas les changements via les API Metadata — seulement les changements de données",
      "Le channel /data/ChangeEvents (universel) reçoit les events de TOUS les objets activés — filtrer côté client",
    ],
  },
  {
    id: "int-009",
    title: "Les 6 patterns d'intégration Salesforce",
    category: "Integration",
    tags: ["integration-patterns", "architecture", "design-patterns"],
    difficulty: "advanced",
    certRelevance: ["Integration-Arch"],
    content: `
## Les 6 patterns d'intégration canoniques

SF et MuleSoft ont formalisé 6 patterns d'intégration. La certification Integration Architect les demande par cœur.

### 1. Remote Process Invocation — Request & Reply

\`\`\`
SF → Système Externe → Réponse immédiate → SF
(Synchrone — SF attend la réponse)

Cas d'usage : Validation de TVA en temps réel, vérification de solvabilité
Implémentation : Apex HTTP Callout depuis un Trigger/Flow
Risque : Timeout du système externe → l'opération SF échoue
\`\`\`

### 2. Remote Process Invocation — Fire & Forget

\`\`\`
SF → Notification au Système Externe → Pas d'attente de réponse
(Asynchrone — SF n'attend pas)

Cas d'usage : Notifier un ERP d'une commande créée, envoyer un email via Mailgun
Implémentation : Platform Events, Outbound Messaging, @future callout
\`\`\`

### 3. Batch Data Synchronization

\`\`\`
Synchronisation en lot, planifiée, bidirectionnelle ou unidirectionnelle
(Non temps-réel)

Cas d'usage : Sync nightly SF → ERP, import hebdo de prix depuis un PIM
Implémentation : Bulk API 2.0, Scheduled Apex, Batch Apex + HTTP Callouts, MuleSoft
\`\`\`

### 4. Remote Call-In

\`\`\`
Système Externe → SF
(SF est le récepteur)

Cas d'usage : ERP pousse des confirmations de commande vers SF
Implémentation : @RestResource, SOAP API, REST API standard
\`\`\`

### 5. UI Update Based on Data Changes

\`\`\`
Données SF changent → Interface utilisateur se met à jour en temps réel
(Push de SF vers le browser)

Cas d'usage : Dashboard temps réel, statut live d'une commande
Implémentation : Platform Events + LWC @wire, CDC + CometD
\`\`\`

### 6. Data Virtualization

\`\`\`
Données dans SF sans être stockées dans SF (External Objects)
(Accès en temps réel depuis la source sans copie)

Cas d'usage : Afficher les données d'un ERP directement dans SF sans ETL
Implémentation : Salesforce Connect + External Data Sources, OData adapters
\`\`\`

### Matrice de décision

\`\`\`
                        Temps réel?  SF initie?  Réponse nécessaire?
Request & Reply          ✅ Oui       ✅ Oui      ✅ Oui
Fire & Forget            ✅ Oui*      ✅ Oui      ❌ Non
Batch Sync               ❌ Non       ✅/❌ Deux   ❌ Non
Remote Call-In           ✅/❌        ❌ Non       ✅/❌
UI Update                ✅ Oui       ❌ Non       ❌ Non
Data Virtualization      ✅ Oui       ✅ Oui      ✅ Oui

*Événement temps réel, mais le traitement est asynchrone
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// 1. Request & Reply = HTTP request-response synchrone
const result = await axios.post('https://external-api.com/validate', data);

// 2. Fire & Forget = Event emission sans await
eventEmitter.emit('order-created', { orderId });

// 3. Batch Sync = ETL job/cron
cron.schedule('0 2 * * *', async () => {
  const records = await sfBulkExport('SELECT Id FROM Order__c');
  await erpBulkImport(records);
});

// 4. Remote Call-In = endpoint REST reçu
app.post('/orders/confirm', async (req, res) => { /* traiter */ });

// 5. UI Update = Server-Sent Events ou WebSocket
const eventSource = new EventSource('/events/order-status');
eventSource.onmessage = (e) => updateUI(JSON.parse(e.data));

// 6. Data Virtualization = federated query / virtual table
// → ne lit pas en DB locale, appelle la source à la volée
\`\`\`
    `,
    gotchas: [
      "Request & Reply depuis un trigger : risque de timeout — les triggers ont une limite de temps stricte",
      "Fire & Forget ne garantit pas la livraison — prévoir des mécanismes de retry et d'idempotence",
      "Data Virtualization (Salesforce Connect) : les queries SOQL complexes peuvent être lentes",
      "Batch Sync via Bulk API : respecter les rate limits (10 000 jobs/24h) et gérer les partial failures",
      "Pour la certification Integration-Arch, mémoriser le nom exact des 6 patterns + leur implémentation recommandée",
    ],
  },
  {
    id: "int-010",
    title:
      "Mock Callouts en tests Apex — HttpCalloutMock, StaticResourceCalloutMock",
    category: "Integration",
    tags: ["testing", "mock", "callouts", "apex-tests"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Mocker les HTTP Callouts dans les tests Apex

SF interdit les vrais callouts HTTP dans les tests. Tu dois implémenter l'interface HttpCalloutMock.

### Interface HttpCalloutMock

\`\`\`apex
global interface HttpCalloutMock {
    HttpResponse respond(HttpRequest request);
}
\`\`\`

### Implémentation d'un Mock simple

\`\`\`apex
@IsTest
global class ExternalApiMock implements HttpCalloutMock {

    global HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(200);
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"id": "123", "status": "success"}');
        return res;
    }
}
\`\`\`

### Utilisation dans un test

\`\`\`apex
@IsTest
class ExternalAPIServiceTest {

    @IsTest
    static void testCallExternalAPI_Success() {
        Test.setMock(HttpCalloutMock.class, new ExternalApiMock());

        Test.startTest();
        String result = ExternalAPIService.callExternalAPI('https://api.test.com/data');
        Test.stopTest();

        System.assertNotEquals(null, result);
        Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(result);
        System.assertEquals('123', (String) parsed.get('id'));
    }
}
\`\`\`

### Mock conditionnel selon l'URL

\`\`\`apex
@IsTest
global class MultiEndpointMock implements HttpCalloutMock {

    global HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        String endpoint = req.getEndpoint();

        if (endpoint.contains('/orders')) {
            res.setStatusCode(200);
            res.setBody('{"orders": [{"id": "ORD-001"}]}');
        } else if (endpoint.contains('/error')) {
            res.setStatusCode(500);
            res.setBody('{"error": "Internal Server Error"}');
        } else {
            res.setStatusCode(404);
            res.setBody('{"error": "Not Found"}');
        }

        return res;
    }
}
\`\`\`

### StaticResourceCalloutMock — Mock depuis un fichier JSON

\`\`\`apex
@IsTest
static void testWithStaticResource() {
    StaticResourceCalloutMock mock = new StaticResourceCalloutMock();
    mock.setStaticResource('OrdersApiResponse');  // Nom de la Static Resource
    mock.setStatusCode(200);
    mock.setHeader('Content-Type', 'application/json');

    Test.setMock(HttpCalloutMock.class, mock);

    Test.startTest();
    String result = ExternalAPIService.getOrders();
    Test.stopTest();

    System.assertNotEquals(null, result);
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// HttpCalloutMock SF ≈ nock ou MSW (Mock Service Worker) en Node.js

// Avec nock :
nock('https://api.external.com')
  .get('/orders')
  .reply(200, { orders: [{ id: 'ORD-001' }] });

// Ou avec Jest :
jest.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({ id: '123', status: 'success' }),
} as Response);

// L'équivalent SF :
Test.setMock(HttpCalloutMock.class, new ExternalApiMock());
// → intercepte tous les new Http().send(req) dans la transaction de test
\`\`\`
    `,
    gotchas: [
      "Test.setMock() doit être appelé AVANT Test.startTest() — sinon le mock n'est pas actif",
      "Un seul HttpCalloutMock peut être enregistré par test — pour plusieurs endpoints, utiliser un mock conditionnel",
      "SF lève une exception si un callout réel est tenté sans mock : 'Please use Test.setMock to register a mock'",
      "Le mock intercepte ALL callouts, y compris ceux vers les Named Credentials",
      "StaticResourceCalloutMock : le nom de la Static Resource est case-sensitive",
    ],
  },
  {
    id: "int-011",
    title: "Outbound Messaging & External Services",
    category: "Integration",
    tags: ["outbound-messaging", "external-services", "soap", "flow"],
    difficulty: "intermediate",
    certRelevance: ["Integration-Arch"],
    content: `
## Outbound Messaging — Notifications SOAP automatiques

Outbound Messaging envoie des notifications XML/SOAP vers un endpoint externe quand des champs changent.

### Configuration

\`\`\`
Setup > Process Automation > Workflow Rules > New
  → Objet: Account
  → Critères: Account.Status__c CHANGED

Setup > Process Automation > Outbound Messages > New
  → Endpoint URL: https://yourservice.com/sf-notifications
  → Fields to Send: Id, Name, Status__c
\`\`\`

### Payload XML envoyé

\`\`\`xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <notifications xmlns="http://soap.sforce.com/2005/09/outbound">
      <Notification>
        <sObject xsi:type="sf:Account">
          <sf:Id>001xx000003GYk7</sf:Id>
          <sf:Name>Acme Corp</sf:Name>
          <sf:Status__c>Active</sf:Status__c>
        </sObject>
      </Notification>
    </notifications>
  </soapenv:Body>
</soapenv:Envelope>
\`\`\`

### Accusé de réception attendu

\`\`\`xml
<notificationsResponse>
  <Ack>true</Ack>  ← Si false, SF retentera pendant 24h
</notificationsResponse>
\`\`\`

---

## External Services — Appels REST déclaratifs via Flow

External Services permet d'invoquer des APIs REST depuis des Flows **sans code Apex**.

### Configuration

\`\`\`
Setup > External Services > Add an External Service
  → API Name: My_Payment_API
  → Service Schema: OpenAPI 3.0 JSON/YAML
  → Named Credential: My_Payment_Service
\`\`\`

SF analyse le schéma OpenAPI et génère automatiquement des **actions invocables** pour les opérations.

### Utilisation dans un Flow

\`\`\`
Flow Element: Action
  → Category: External Service
  → Action: My_Payment_API - createPayment
  → Inputs:  amount = {!orderAmount}
  → Outputs: paymentId = {!paymentResult.id}
\`\`\`

### Limitations

\`\`\`
✅ Supporte REST + JSON
✅ Fonctionne dans Screen Flows, Record-Triggered Flows
❌ Pas de contrôle fin sur les headers HTTP
❌ Schéma OpenAPI doit être correct (validation stricte)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Outbound Messaging = Webhooks SOAP automatiques
// Ton endpoint doit répondre avec Ack=true pour confirmer réception
app.post('/sf-notifications', (req, res) => {
  const payload = parseSOAP(req.body);
  processAccountChange(payload.sObject);
  res.send(buildSOAPAck(true)); // Important : répondre !
});

// External Services = OpenAPI → client auto-généré pour Flow
// Comme swagger-codegen mais pour les Flows SF :
// swagger-codegen → génère un SDK TypeScript
// External Services → génère des "Invocable Actions" pour Flow
\`\`\`
    `,
    gotchas: [
      "Outbound Messaging utilise SOAP — ton endpoint doit accepter et répondre en XML/SOAP",
      "Si ton endpoint ne répond pas Ack=true dans 30 secondes, SF retentera — implémenter l'idempotence",
      "Outbound Messaging est attaché aux Workflow Rules (LEGACY) — SF recommande Platform Events à la place",
      "External Services : le schéma OpenAPI est validé strictement par SF — les schémas mal formés sont rejetés",
    ],
  },
  {
    id: "int-012",
    title: "MuleSoft & Heroku Connect — Intégrations avancées",
    category: "Integration",
    tags: ["mulesoft", "heroku-connect", "integration", "postgresql"],
    difficulty: "advanced",
    certRelevance: ["Integration-Arch"],
    content: `
## MuleSoft : la plateforme d'intégration de Salesforce

MuleSoft est une plateforme d'intégration (iPaaS) acquise par SF en 2018.

### Concepts clés MuleSoft

\`\`\`
Anypoint Studio  : IDE pour développer les intégrations
Mule Application : Un projet d'intégration deployable
Flow             : Un pipeline de traitement de messages
Connector        : Intégration pré-construite (SF Connector, SAP Connector, etc.)
DataWeave        : Langage de transformation de données (JSON↔XML↔CSV↔Object)
API Manager      : Gestion des APIs (throttling, security, analytics)
Exchange         : Marketplace d'assets MuleSoft
\`\`\`

### SF Connector MuleSoft — Exemple de Flow

\`\`\`xml
<flow name="sync-sf-accounts">
    <scheduler>
        <scheduling-strategy>
            <fixed-frequency frequency="1" timeUnit="HOURS"/>
        </scheduling-strategy>
    </scheduler>

    <sfdc:query config-ref="Salesforce_Config"
        query="SELECT Id, Name, Phone FROM Account
               WHERE LastModifiedDate > LAST_N_HOURS:1"/>

    <ee:transform>
        <ee:set-payload><![CDATA[%dw 2.0
        output application/json
        ---
        payload map (account) -> {
            external_id: account.Id,
            name: account.Name,
            phone: account.Phone default null
        }]]></ee:set-payload>
    </ee:transform>

    <db:bulk-insert config-ref="PostgreSQL_Config">
        <db:sql>INSERT INTO accounts VALUES (:external_id, :name, :phone)
                ON CONFLICT (external_id) DO UPDATE SET name = :name</db:sql>
    </db:bulk-insert>
</flow>
\`\`\`

---

## Heroku Connect : sync bidirectionnel SF ↔ PostgreSQL

Heroku Connect synchronise en temps quasi-réel entre Salesforce et une base PostgreSQL sur Heroku.

### Tables créées dans PostgreSQL

\`\`\`sql
CREATE TABLE salesforce.account (
    _hc_lastop text,         -- Dernière opération HC
    _hc_err text,            -- Erreur de synchronisation
    id text PRIMARY KEY,     -- SF ID
    name text,
    phone text,
    lastmodifieddate timestamp
);

-- Pour créer un record SF depuis Heroku :
INSERT INTO salesforce.account (name, phone)
VALUES ('New Corp', '0123456789');
-- Heroku Connect synchronisera vers SF automatiquement
\`\`\`

### Cas d'usage

\`\`\`
✅ App web/mobile qui doit lire/écrire dans SF via SQL
✅ Analytics sur données SF via PostgreSQL
✅ Réduire les API calls SF (lire depuis PG, pas SF)

⚠️ Latence de 2-10 minutes (pas temps réel)
⚠️ Attention aux conflits de sync bidirectionnelle
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// MuleSoft ≈ Apache Camel ou NestJS EventBus dans le monde Enterprise
// DataWeave ≈ JSONata ou jq pour transformer des données

// Heroku Connect ≈ Debezium + PostgreSQL change data capture
// mais dans l'autre sens : PostgreSQL → Salesforce

// Équivalent conceptuel avec Prisma + SF :
const syncFromSF = async () => {
  const sfAccounts = await sf.query('SELECT Id, Name FROM Account WHERE LastModifiedDate > ...');
  await prisma.$transaction(
    sfAccounts.map(acc => prisma.account.upsert({
      where: { sfId: acc.Id },
      create: { sfId: acc.Id, name: acc.Name },
      update: { name: acc.Name }
    }))
  );
};
// Heroku Connect fait exactement ça, mais déclaratif et temps quasi-réel
\`\`\`
    `,
    gotchas: [
      "Heroku Connect n'est pas temps-réel — latence de 2-10 minutes — ne pas utiliser pour des features nécessitant de l'instantané",
      "Les conflits de sync bidirectionnelle sont possibles — prévoir une stratégie de résolution (SF wins vs Heroku wins)",
      "MuleSoft est une licence séparée, très coûteuse — ne pas l'utiliser pour des intégrations simples qui peuvent être faites en Apex",
      "DataWeave a une syntaxe unique — ce n'est ni du JavaScript ni du SQL",
    ],
  },

  // ─────────────────────────────────────────────
  // FLOWS & AUTOMATION
  // ─────────────────────────────────────────────
  {
    id: "flow-001",
    title:
      "Types de Flows — Screen, Auto-launched, Record-Triggered, Scheduled, Platform Event-Triggered",
    category: "Flows & Automation",
    tags: ["flow", "automation", "types"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Les 5 types de Flows

Flow Builder est l'outil no-code/low-code central de SF pour l'automatisation.

### 1. Screen Flow

\`\`\`
Déclenché par : Un utilisateur (clic sur bouton, link, utility bar)
Interface    : Screens interactifs (formulaires, wizards multi-étapes)
Embedding    : Lightning Page, Community, LWC

Cas d'usage :
- Wizard de création de commande en plusieurs étapes
- Formulaire de prise en charge d'un case
\`\`\`

### 2. Auto-launched Flow (sans déclencheur)

\`\`\`
Déclenché par : Code Apex, Process Builder, autre Flow, ou via REST API
Interface    : Aucune (headless)

// Lancer depuis Apex :
Map<String, Object> inputs = new Map<String, Object>{ 'accountId' => accId };
Flow.Interview interview = Flow.Interview.createInterview('My_Auto_Flow', inputs);
interview.start();
String result = (String) interview.getVariableValue('outputVariable');
\`\`\`

### 3. Record-Triggered Flow

\`\`\`
Déclenché par : Insert/Update/Delete sur un objet SF
Mode         : Before Save ou After Save
Cas d'usage  : Remplacer les triggers Apex pour la logique simple
\`\`\`

### 4. Scheduled Flow

\`\`\`
Déclenché par : Planification (quotidien, hebdomadaire, etc.)
Mode         : Batch sur une collection de records

Cas d'usage :
- Rappels automatiques (opportunités inactives depuis 30 jours)
- Nettoyage de données périodique
\`\`\`

### 5. Platform Event-Triggered Flow

\`\`\`
Déclenché par : Publication d'un Platform Event
Mode         : Traitement asynchrone de l'événement

Cas d'usage :
- Réagir aux Platform Events sans code Apex
- Découpler la publication d'un event de son traitement
\`\`\`

### Tableau récapitulatif

\`\`\`
Type                    | Déclenché par        | Interface | Sync/Async
Screen Flow             | User action          | ✅ Screens  | Sync
Auto-launched           | Apex/autre Flow      | ❌          | Sync
Record-Triggered Before | DML Before Save      | ❌          | Sync
Record-Triggered After  | DML After Save       | ❌          | Async*
Scheduled               | Schedule (time)      | ❌          | Async
Platform Event          | Event publication    | ❌          | Async
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Screen Flow = Wizard multi-étapes côté frontend → React multi-step form

// Auto-launched = Fonction utilitaire callable
// → Une function TypeScript appelée depuis du code

// Record-Triggered = Middleware/Hook de base de données
// → Prisma middleware, Mongoose pre/post hooks

// Scheduled = Cron job
// → @nestjs/schedule @Cron('0 0 * * *')

// Platform Event-Triggered = Message queue consumer
// → kafka.consumer.subscribe(['my-topic'], handler)
\`\`\`
    `,
    gotchas: [
      "Un Record-Triggered Flow Before Save ne peut PAS interroger la DB (SOQL) ni créer des records (DML) — uniquement modifier les champs du record en cours",
      "Un Record-Triggered Flow After Save PEUT faire des SOQL et DML, mais dans la même transaction — attention aux limits",
      "Les Scheduled Flows ont une limite de 250 000 éléments traités par 24h",
      "Les Platform Event-Triggered Flows s'exécutent en mode 'system context' — comme 'without sharing'",
    ],
  },
  {
    id: "flow-002",
    title: "Record-Triggered Flows — Before Save vs After Save",
    category: "Flows & Automation",
    tags: ["record-triggered", "before-save", "after-save", "automation"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Record-Triggered Flows : les triggers déclaratifs

### Before Save Flow

\`\`\`
Timing    : Avant que le record soit sauvegardé en DB
Objectif  : Modifier les champs du record en cours
DML       : ❌ Interdit (tu travailles sur le record en mémoire)
SOQL      : ❌ Interdit
Avantage  : Très performant (pas de DML séparé)
\`\`\`

\`\`\`
Flow Before Save :
  Objet en mémoire (pas encore en DB)
    Score__c = 0
      ↓ Flow Before Save
    Score__c = calculer(Revenue, Deals)
  → Sauvegardé en DB avec Score calculé

Vs Trigger Apex équivalent :
trigger AccountTrigger on Account (before insert, before update) {
    for (Account acc : Trigger.new) {
        acc.Score__c = calculateScore(acc);
        // Pas de DML update séparé ici
    }
}
\`\`\`

### After Save Flow

\`\`\`
Timing    : Après que le record soit sauvegardé en DB
Objectif  : Créer/modifier des records LIÉS
DML       : ✅ Autorisé (Create/Update/Delete Records)
SOQL      : ✅ Autorisé (Get Records)
Apex      : ✅ Actions Apex invocables
Risque    : DML supplémentaire → consomme des limits
\`\`\`

\`\`\`
Flow After Save :
  Opportunité créée (Deal fermé)
      ↓ After Save Flow
  Créer une tâche de suivi (Task)
  Envoyer une notification email
  Mettre à jour des records liés
\`\`\`

### Optimisation : Entry Conditions

\`\`\`
⚠️ TOUJOURS définir des Entry Conditions !
Sans conditions → le Flow s'exécute sur CHAQUE insert/update de l'objet
→ Consomme inutilement des limits et ralentit les opérations

Option "Only when a record is updated to meet the condition requirements"
→ Le Flow ne s'exécute QUE si les conditions passent de false à true
→ Évite les re-exécutions si le record est modifié sans changer les champs pertinents
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Before Save Flow ≈ Prisma middleware "before" (synchrone, même objet)
prisma.$use(async (params, next) => {
  if (params.model === 'Account' && params.action === 'create') {
    params.args.data.score = calculateScore(params.args.data);
  }
  return next(params);
});

// After Save Flow ≈ Prisma middleware "after" (post-sauvegarde)
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (params.model === 'Account' && result.type === 'Customer') {
    await prisma.task.create({ data: { accountId: result.id } });
  }
  return result;
});
\`\`\`
    `,
    gotchas: [
      "Before Save Flow : NE PAS essayer de faire un SOQL ou DML — Flow Builder l'interdit",
      "After Save Flow : si le Flow crée un record qui déclenche lui-même un autre Flow, attention à la récursion (SF limite à 5 niveaux)",
      "Les Before Save Flows s'exécutent AVANT les Validation Rules — ne pas compter dessus pour remplacer les validations",
      "'Only when updated to meet conditions' est crucial pour les performances — toujours activer sauf besoin explicite",
    ],
  },
  {
    id: "flow-003",
    title: "Flow vs Apex — Arbre de décision",
    category: "Flows & Automation",
    tags: ["flow", "apex", "best-practices", "decision"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Quand utiliser Flow, quand coder en Apex ?

### L'arbre de décision

\`\`\`
Besoin d'automatisation ?
├─ Logique simple sur un objet
│   ├─ Modifier des champs → Before Save Flow
│   ├─ Créer des records liés → After Save Flow
│   └─ Envoyer emails/notifications → Flow + Email Action
│
├─ Logique complexe
│   ├─ Loops complexes, Maps, Sets → Apex
│   ├─ Calculs intensifs → Apex
│   ├─ Callouts HTTP conditionnels → Apex (@future)
│   └─ Queries complexes (agrégats) → Apex
│
├─ Intégration externe
│   ├─ API REST simple → External Services + Flow
│   └─ API REST complexe → Named Credentials + Apex
│
└─ Performance critique
    ├─ > 1000 records en batch → Batch Apex
    └─ Logique planifiée complexe → Scheduled Apex
\`\`\`

### Capacités Flow vs Apex

| Capacité | Flow | Apex |
|----------|------|------|
| CRUD sur records | ✅ | ✅ |
| Logique conditionnelle | ✅ | ✅ |
| Loops sur collections | ✅ (limité) | ✅ (pleine puissance) |
| HTTP Callouts | ✅ (External Services) | ✅ |
| Gestion d'erreurs fine | ⚠️ (Fault paths) | ✅ try/catch |
| Unit tests | ❌ | ✅ |
| Complex data structures | ❌ | ✅ (Maps, Sets, nested) |
| Maintenance business | ✅ (UI visuelle) | ❌ (nécessite dev) |

### Règle de base Salesforce

\`\`\`
1. Essayer avec Validation Rules / Formulas
2. Si ça ne suffit pas → Flow
3. Si Flow ne peut pas → Apex

"If you can do it with a Flow, do it with a Flow"
\`\`\`

### Exposer une méthode Apex à Flow avec @InvocableMethod

\`\`\`apex
public class CalculationService {
    @InvocableMethod(label='Calculate Score' description='Calculates account score')
    public static List<Decimal> calculateScore(List<Id> accountIds) {
        // Logique complexe Apex
        return results;
    }
}
// → Disponible comme "Action" dans Flow Builder
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Flow vs Apex ≈ Infrastructure-as-Code vs Script personnalisé

// Flow = Terraform / Infrastructure déclarative
//   → Décris CE QUE tu veux, pas COMMENT le faire
//   → Maintenable par non-devs

// Apex = Script impératif
//   → Contrôle total, nécessite un développeur

// @InvocableMethod ≈ une Lambda / Custom Resource Terraform
// → Code personnalisé appelable depuis l'outil déclaratif
export async function calculateScore(accountIds: string[]): Promise<number[]> {
  return accountIds.map(id => complexCalculation(id));
}
\`\`\`
    `,
    gotchas: [
      "Les Flows n'ont pas de tests unitaires — vrai problème pour la regression testing, préférer Apex quand la logique est critique",
      "Un Flow trop complexe devient impossible à maintenir — à partir de ~50 éléments, envisager Apex",
      "@InvocableMethod doit prendre List<T> et retourner List<T> — même pour un seul élément (bulkification Flow)",
      "Les Flows s'exécutent dans la même transaction que le DML qui les a déclenchés — les limits sont partagées",
    ],
  },
  {
    id: "flow-004",
    title: "Validation Rules — Syntaxe, fonctions courantes",
    category: "Flows & Automation",
    tags: ["validation-rules", "formulas", "automation"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `
## Validation Rules : valider les données côté serveur (et client)

Les Validation Rules définissent des conditions qui, si elles sont TRUE, empêchent la sauvegarde du record.

> ⚠️ Logique inversée : la règle décrit la condition d'ÉCHEC, pas de succès.

### Fonctions courantes

\`\`\`
ISBLANK(field)           → true si vide (texte vide ou null)
ISNULL(field)            → true si null (pour les champs numériques)
ISNEW()                  → true si c'est une création
ISCHANGED(field)         → true si le champ a changé lors de cet update
PRIORVALUE(field)        → la valeur avant la modification en cours

TODAY()                  → date du jour
NOW()                    → datetime courant
YEAR(date) / MONTH(date) / DAY(date)

LEN(text)                → longueur
CONTAINS(text, search)   → contient
REGEX(text, pattern)     → match regex
ISPICKVAL(field, value)  → est-ce que le picklist vaut cette valeur ?
NOT(cond) / AND(c1, c2) / OR(c1, c2)
\`\`\`

### Exemples courants

\`\`\`
// Empêcher la fermeture d'une opportunité sans probability = 100%
AND(
  ISCHANGED(StageName),
  ISPICKVAL(StageName, "Closed Won"),
  Probability < 100
)

// Empêcher la modification d'un champ après fermeture
AND(
  NOT(ISNEW()),
  ISCHANGED(Amount),
  ISPICKVAL(StageName, "Closed Won")
)

// Champ conditionnel requis
AND(
  ISPICKVAL(Type, "Customer"),
  ISBLANK(AccountNumber)
)

// Valider un numéro de téléphone français
NOT(REGEX(Phone, "^(\\+33|0)[1-9]([ .-]?[0-9]{2}){4}$"))
\`\`\`

### Cross-object formulas dans Validation Rules

\`\`\`
// Dans une Validation Rule sur Contact :
ISPICKVAL(Account.Industry, "Healthcare") && ISBLANK(MedicalId__c)
\`\`\`

### Bypass des Validation Rules

\`\`\`
- System Administrator : bypass en option (désactivé par défaut)
- Apex : DML options avec allOrNone=false
- Custom Permission : $Permission.Bypass_Validations__c
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Validation Rules SF ≈ class-validator dans NestJS
import { IsNotEmpty, IsEmail, Min, ValidateIf } from 'class-validator';

class CreateAccountDto {
  @IsNotEmpty()  // ≈ ISBLANK(Phone) → erreur
  phone: string;

  @IsEmail()     // ≈ REGEX(Email, ...) → erreur
  email: string;

  @Min(0)        // ≈ Amount < 0 → erreur
  amount: number;

  @ValidateIf((o) => o.type === 'Customer')  // ≈ ISPICKVAL(Type, "Customer")
  @IsNotEmpty()
  accountNumber: string;
}

// Différence clé : Validation Rules SF sont évaluées CÔTÉ SERVEUR
// TOUJOURS exécutées, même via API, Data Loader, Apex
\`\`\`
    `,
    gotchas: [
      "ISBLANK vs ISNULL : ISBLANK vérifie null ET string vide, ISNULL vérifie seulement null — utiliser ISBLANK pour les champs texte",
      "ISCHANGED et PRIORVALUE ne fonctionnent PAS lors d'une création (ISNEW() = true) — toujours combiner avec NOT(ISNEW())",
      "Les Validation Rules s'appliquent MÊME via API, Data Loader, Apex — elles ne sont pas bypassables facilement",
      "Les Validation Rules sont évaluées APRÈS les Before Triggers/Flows — le record peut avoir été modifié avant la validation",
    ],
  },
  {
    id: "flow-005",
    title: "Formula Fields & Roll-Up Summary Fields",
    category: "Flows & Automation",
    tags: ["formula-fields", "rollup-summary", "automation"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `
## Formula Fields : calculs déclaratifs sur les records

### Syntaxe Formula Fields

\`\`\`
Type de retour : Text, Number, Currency, Date, Datetime, Boolean, Percent

Exemple — Score calculé :
  IF(
    AND(AnnualRevenue > 1000000, NumberOfEmployees > 100),
    "High Value",
    IF(AnnualRevenue > 100000, "Medium", "Low")
  )

Exemple — Cross-object formula :
  // Sur Contact, afficher le nom de l'account
  Account.Name

  // Sur Opportunity, afficher le type de l'account
  Account.Type

  // Sur OpportunityLineItem, afficher le prix du produit
  PricebookEntry.UnitPrice
\`\`\`

### Limites Formula Fields

\`\`\`
- Max 3 900 caractères (compiled : ~5 000 chars selon SF)
- Max 10 niveaux de cross-object references
- Max 10 unique relationships par objet dans les formulas
- Recalculé à chaque affichage (pas stocké, sauf certains contextes)
- Pas d'accès aux champs d'objets enfants (seulement parents)
\`\`\`

---

## Roll-Up Summary Fields : agréger les données des enfants

Les Roll-Up Summary Fields permettent d'agréger des valeurs depuis des records enfants vers le parent.

### Types de Roll-Up

\`\`\`
COUNT   : Nombre d'enregistrements enfants
SUM     : Somme d'un champ numérique
MIN     : Valeur minimum
MAX     : Valeur maximum
\`\`\`

### Prérequis : relation Master-Detail

\`\`\`
❌ Lookup → pas de Roll-Up Summary
✅ Master-Detail → Roll-Up Summary disponible
\`\`\`

### Exemple

\`\`\`
Object parent : Order__c (Master)
Object enfant : OrderLine__c (Detail)

Roll-Up Summary sur Order__c :
  Nom: Total_Amount__c
  Type: SUM
  Champ à agréger: OrderLine__c.Amount__c
  Filtre: OrderLine__c.Status__c = 'Active'
\`\`\`

### Limites Roll-Up Summary

\`\`\`
- Max 25 Roll-Up Summary Fields par objet
- Pas disponible sur les Lookup relationships
- Recalcul asynchrone possible sur de grands volumes
- Pas de formulas complexes dans le filtre
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Formula Field ≈ Colonne calculée (computed column) dans PostgreSQL
// CREATE TABLE accounts (
//   ...,
//   score TEXT GENERATED ALWAYS AS (
//     CASE
//       WHEN annual_revenue > 1000000 AND employees > 100 THEN 'High Value'
//       WHEN annual_revenue > 100000 THEN 'Medium'
//       ELSE 'Low'
//     END
//   ) STORED
// );

// Roll-Up Summary ≈ Vue agrégée ou trigger qui maintient un total
// SELECT order_id, SUM(amount) as total_amount
// FROM order_lines
// WHERE status = 'Active'
// GROUP BY order_id;

// SF maintient ce total automatiquement quand les enfants changent
\`\`\`
    `,
    gotchas: [
      "Les Formula Fields ne sont PAS indexés — ne pas les utiliser dans des WHERE clauses SOQL sur des objets avec > 100k records",
      "Cross-object formulas : SF ne supporte que les parents (Account d'un Contact), pas les enfants",
      "Roll-Up Summary : disponible UNIQUEMENT sur les relations Master-Detail, pas Lookup",
      "Le recalcul d'un Roll-Up Summary est asynchrone pour les grandes orgs — possible délai",
      "Les Roll-Up Summary ne supportent pas les champs de formula des objets enfants comme source",
    ],
  },
  {
    id: "flow-006",
    title: "Order of Execution — L'ordre complet de A à Z",
    category: "Flows & Automation",
    tags: ["order-of-execution", "triggers", "flows", "critical"],
    difficulty: "advanced",
    certRelevance: ["PD1", "PD2"],
    content: `
## Order of Execution : LE sujet le plus critique de Salesforce

Quand un record est créé/modifié dans SF, de nombreux processus s'enchaînent dans un ordre précis et garanti. C'est probablement le sujet le plus demandé aux certifications.

### L'ordre complet

\`\`\`
1.  Load record (ou valeurs par défaut pour insertion)

2.  System Validations
    ├─ Required fields
    ├─ Field format checks
    └─ Foreign key checks

3.  Before Flow (Record-Triggered Flow — Before Save)

4.  Before Triggers (Apex before insert / before update)

5.  Custom Validation Rules

6.  Duplicate Rules

7.  After Triggers (Apex after insert / after update)

8.  Assignment Rules

9.  Auto-Response Rules

10. Workflow Rules (LEGACY)
    ├─ Immediate actions (Field Updates, Emails, Tasks)
    └─ Si Field Update → re-évaluation des Before Triggers (une fois)

11. Escalation Rules

12. Entitlement Rules

13. Flow Automation (After Save Record-Triggered Flows + Process Builder)

14. Roll-Up Summary Field recalculation

15. Cross-Object Formula Field recalculation

16. Sharing rule recalculation

17. COMMIT to Database
    ← C'est ici que les données sont définitivement sauvegardées

18. Post-commit logic (exécuté APRÈS le commit)
    ├─ Platform Events (publiés avec EventBus.publish dans un trigger)
    ├─ Outbound Messages
    ├─ @future methods
    └─ Emails (sendEmail)
\`\`\`

### Ce que ça implique concrètement

\`\`\`
After Save Flows (Step 13) s'exécutent APRÈS les After Triggers (Step 7)
→ Confusion courante à l'examen

Workflow Field Update (Step 10) re-exécute les Before Triggers (Step 4)
→ Un Before Trigger peut s'exécuter DEUX fois lors d'une update
→ Toujours rendre les Before Triggers idempotents

Platform Events (Step 18) ne sont livrés QUE si la transaction commit
→ Si rollback → l'événement n'est PAS publié
\`\`\`

### Le piège de la récursion

\`\`\`apex
// Un After Trigger qui fait un DML sur le même objet → re-déclenche les triggers
// Risque de récursion infinie → utiliser un flag statique

public class TriggerHelper {
    public static Boolean hasExecuted = false;
}

trigger AccountTrigger on Account (after update) {
    if (!TriggerHelper.hasExecuted) {
        TriggerHelper.hasExecuted = true;
        // logique
    }
}
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Order of Execution ≈ le cycle de vie d'une opération de base de données
// avec de nombreux middleware

async function saveRecord(data: AccountData) {
  // Step 2: System validations
  validateSchema(data);

  // Step 3: Before Flow
  data = await runBeforeFlows(data);

  // Step 4: Before Triggers (Apex before)
  data = await runBeforeTriggers(data);

  // Step 5: Validation Rules
  await checkValidationRules(data);

  // Step 7: After Triggers — record déjà en DB
  const savedRecord = await db.save(data);
  await runAfterTriggers(savedRecord);

  // Step 13: After Save Flows (APRÈS les After Triggers !)
  await runAfterSaveFlows(savedRecord);

  // Step 17: COMMIT
  await db.commit();

  // Step 18: Post-commit (fire & forget)
  publishPlatformEvents();  // asynchrone
  scheduleFutureMethods();  // asynchrone
}
\`\`\`
    `,
    gotchas: [
      "MÉMORISER L'ORDRE : Before Flow → Before Trigger → Validation → After Trigger → After Flow → Commit → Platform Events",
      "Workflow Field Update re-exécute les Before Triggers — rendre les Before Triggers idempotents",
      "Les Platform Events publiés dans une transaction ne sont livrés QUE si la transaction commit",
      "@future methods s'exécutent en Step 18, APRÈS le commit, dans une transaction séparée",
      "After Save Flows s'exécutent en Step 13, APRÈS les After Triggers (Step 7) — confusion courante à l'examen",
    ],
  },
  {
    id: "flow-007",
    title: "Approval Processes — Étapes, approbateurs, actions",
    category: "Flows & Automation",
    tags: ["approval-process", "automation", "workflow"],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## Approval Processes : workflows d'approbation structurés

Les Approval Processes gèrent des chaînes d'approbation multi-étapes avec des actions automatiques.

### Structure d'un Approval Process

\`\`\`
Approval Process: "Discount Approval"
│
├─ Entry Criteria : Opportunity.DiscountPercent > 20
│
├─ Initial Submission Actions :
│   ├─ Email Alert: "Discount Request Submitted"
│   └─ Field Update: Status__c = "Pending Approval"
│
├─ Step 1: Manager Approval
│   ├─ Assigned Approver: User's Manager (hiérarchie)
│   ├─ Approval Actions: Field Update: ManagerApproved__c = true
│   └─ Rejection Actions: Field Update: Status__c = "Rejected"
│
├─ Step 2: VP Approval (si remise > 30%)
│   └─ Assigned Approver: [Queue: VP Sales]
│
├─ Final Approval Actions :
│   └─ Field Update: Status__c = "Approved"
│
└─ Final Rejection Actions :
    └─ Field Update: Status__c = "Rejected"
\`\`\`

### Types d'approbateurs

\`\`\`
User                 : Utilisateur spécifique
Queue                : File d'attente (premier qui approuve)
Related User Field   : Champ sur le record (ex: Owner's Manager)
Approver Field       : Champ sur le record pointant vers un User
\`\`\`

### Approuver depuis Apex

\`\`\`apex
// Soumettre un record à approbation
Approval.ProcessSubmitRequest request = new Approval.ProcessSubmitRequest();
request.setObjectId(opportunityId);
request.setSubmitterId(userId);
request.setComments('Needs approval for large discount');
Approval.ProcessResult result = Approval.process(request);

// Approuver/Rejeter via Apex
Approval.ProcessWorkitemRequest approvalRequest =
    new Approval.ProcessWorkitemRequest();
approvalRequest.setWorkitemId(workItemId);
approvalRequest.setAction('Approve'); // ou 'Reject', 'Recall'
Approval.process(approvalRequest);
\`\`\`

### Lock de record

\`\`\`
Pendant l'approbation, le record est LOCKÉ :
- Seul l'approbateur et les admins peuvent le modifier
- Les triggers/flows qui tentent de modifier ce record peuvent échouer

Boolean isLocked = Approval.isLocked(recordId);
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Approval Process ≈ un workflow d'approbation comme dans GitHub PR reviews
// ou un système BPMN simplifié

// Soumission ≈ créer une PR GitHub qui déclenche des reviewers obligatoires
// Approbation ≈ review approuvée
// Rejet ≈ request-changes sur une PR
// Lock ≈ branch protection rules empêchant les pushes directs
\`\`\`
    `,
    gotchas: [
      "Un record locké durant une approbation bloque les mises à jour via Apex aussi — gérer les exceptions",
      "Les étapes d'approbation sont séquentielles — une étape ne commence que si la précédente est approuvée",
      "Un seul Approval Process par objet peut être actif à la fois pour le même record",
      "Recall (rappel) = annuler une soumission en cours — possible uniquement si 'Allow Submitters to Recall' est coché",
    ],
  },
  {
    id: "flow-008",
    title:
      "Workflow Rules & Process Builder (LEGACY) — Pourquoi migrer vers Flow",
    category: "Flows & Automation",
    tags: ["workflow-rules", "process-builder", "legacy", "migration"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `
## Legacy Automation : Workflow Rules et Process Builder

Ces outils sont officiellement en fin de vie — Salesforce a annoncé leur dépréciation progressive.

### Workflow Rules (END OF LIFE planifié)

\`\`\`
Capacités :
✅ Field Updates (immédiat ou time-based)
✅ Email Alerts
✅ Tasks
✅ Outbound Messages

Limitations :
❌ Une seule condition de déclenchement
❌ Pas de branchement (if/else)
❌ Pas de création de records
\`\`\`

### Process Builder (no new customers depuis Spring '23)

\`\`\`
Capacités :
✅ Multiple conditions (if/else branching)
✅ Créer des records
✅ Appeler des Apex classes

Limitations :
❌ Performances médiocres
❌ Pas de loops natives
❌ Bugs connus non corrigés (Salesforce a arrêté l'investissement)
\`\`\`

### Migration recommandée

\`\`\`
Workflow Rule → Record-Triggered Flow (Before/After Save)

Process Builder → Record-Triggered Flow
  Process Builder "If/Then" → Flow Decision element
  Process Builder "Create Record" → Flow Create Records element
  Process Builder "Call Apex" → Flow Apex Action element
\`\`\`

### Outil de migration SF

\`\`\`
Setup > Process Automation > Migrate to Flow
→ Analyse automatique des Workflow Rules + Process Builder
→ Génère un Flow équivalent (vérifier le résultat)
\`\`\`

### Pourquoi Flow est meilleur

\`\`\`
Performance :
  Flow Before Save = pas de DML supplémentaire
  Workflow Field Update = DML séparé + re-exécution des triggers

Fonctionnalités :
  Flow = Loops, Subflows, Error Handling, Screens, External Services

Maintenance :
  Flow = outil unique, investissement SF actif
  WR/PB = plus d'évolution, bugs non corrigés
\`\`\`
    `,
    tsAnalogy: `
\`\`\`typescript
// Workflow Rules/Process Builder → Flow
// C'est comme migrer de jQuery + callbacks vers React + hooks

// Workflow Rules ≈ jQuery
$(document).on('change', '#field', function() {
  updateOtherField(); // Action simple, pas de branchement
});

// Process Builder ≈ jQuery avec plugins
// Mieux, mais limité et vieillissant

// Flow ≈ React/Vue
// Déclaratif, powerful, activement maintenu
// C'est la direction recommandée par l'éditeur

// À l'examen : si tu vois WR ou PB dans les réponses
// ET que Flow est une option → choisir Flow
\`\`\`
    `,
    gotchas: [
      "Workflow Rules sont planifiés pour être désactivés — ne PAS créer de nouveaux WR, migrer vers Flow",
      "Process Builder est en 'maintenance mode' — pas de nouvelles fonctionnalités, bugs connus non corrigés",
      "L'outil 'Migrate to Flow' de SF génère parfois des Flows non optimaux — toujours vérifier",
      "Les Workflow Field Updates re-exécutent les Before Triggers — comportement différent des Flows",
    ],
  },

  // ─────────────────────────────────────────────
  // DEPLOYMENT & DEVOPS
  // ─────────────────────────────────────────────
  {
    id: "devops-001",
    title: "Sandbox Types — Developer, Developer Pro, Partial Copy, Full",
    category: "Deployment & DevOps",
    tags: ["sandbox", "environments", "devops"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Les 4 types de Sandboxes Salesforce

### Comparaison détaillée

\`\`\`
┌────────────────────┬──────────────┬───────────────┬───────────────┬──────────────────┐
│                    │  Developer   │ Developer Pro │ Partial Copy  │      Full        │
├────────────────────┼──────────────┼───────────────┼───────────────┼──────────────────┤
│ Storage Config     │ 200 MB       │ 1 GB          │ 5 GB          │ = Production     │
│ Storage Data       │ 200 MB       │ 1 GB          │ 5 GB          │ = Production     │
│ Données prod       │ ❌           │ ❌            │ ✅ Échantillon │ ✅ Toutes        │
│ Refresh minimum    │ 1 jour       │ 1 jour        │ 5 jours       │ 29 jours         │
│ Nb inclus (EE)     │ 25           │ 5             │ 1             │ 1                │
└────────────────────┴──────────────┴───────────────┴───────────────┴──────────────────┘
\`\`\`

### Developer Sandbox

\`\`\`
Usage   : Développement isolé d'un développeur
Données : Aucune donnée de prod (seulement les metadata)
Refresh : 1 jour
Cas d'usage : Écrire du code Apex, créer des objets custom, tester des Flows
\`\`\`

### Partial Copy Sandbox

\`\`\`
Usage   : Tests avec données réelles (sous-ensemble)
Données : Échantillon de prod (selon un Sandbox Template)
Refresh : 5 jours
Sandbox Template : définit quels objets et combien de records copier
\`\`\`

### Full Sandbox

\`\`\`
Usage   : Tests de non-régression complets, UAT, tests de performances
Données : TOUTES les données de prod (mirror complet)
Refresh : 29 jours minimum

⚠️ Données sensibles : les Full Sandboxes contiennent les vraies données
→ Configurer Data Mask pour anonymiser les données sensibles
\`\`\`

### Scratch Orgs vs Sandboxes

\`\`\`
Scratch Org :
  - Org temporaire créée depuis une définition JSON
  - Durée max : 30 jours
  - Usage : Développement SFDX, CI/CD
  - Avantage : reproductible, version-controlled

Sandbox :
  - Copie de la prod
  - Données optionnelles
  - Durée : indéfinie (existe jusqu'au refresh)
  - Usage : Dev, UAT, recette
\`\`\`
    `,
    tsAnalogy: `
\`\`\`
Developer Sandbox = environnement local de développement
→ npm run start:dev (données de test, pas de prod)

Partial Copy Sandbox = staging avec données anonymisées
→ Base de données staging avec 10% des données prod

Full Sandbox = environment de recette (mirror prod)
→ Clone complet de la base de production

Scratch Org = container Docker éphémère
→ docker run --rm -p 3000:3000 my-app:latest
Reproductible, jetable, version-controlled via docker-compose.yml
≈ project-scratch-def.json + sf org create scratch
\`\`\`
    `,
    gotchas: [
      "Le refresh d'un sandbox le remet à l'état de la prod — toutes les customisations spécifiques au sandbox sont perdues",
      "Les Full Sandboxes contiennent les vraies données utilisateurs — utiliser Data Mask pour RGPD/CCPA",
      "Le refresh d'un sandbox peut prendre de quelques heures (Developer) à plusieurs jours (Full)",
      "Le nom du sandbox est ajouté à l'email des utilisateurs : user@company.com.sandboxname — éviter les envois d'email en sandbox",
    ],
  },
  {
    id: "devops-002",
    title: "Salesforce DX & Scratch Orgs — Source Format, project structure",
    category: "Deployment & DevOps",
    tags: ["sfdx", "scratch-orgs", "dx", "source-format"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `
## Salesforce DX : le modèle de développement moderne

### Structure d'un projet SFDX

\`\`\`
my-sf-project/
├── sfdx-project.json             ← Configuration du projet
├── .forceignore                  ← Équivalent .gitignore pour SF
├── config/
│   └── project-scratch-def.json ← Définition de la Scratch Org
└── force-app/
    └── main/
        └── default/
            ├── classes/
            │   ├── AccountService.cls
            │   └── AccountService.cls-meta.xml
            ├── triggers/
            │   ├── AccountTrigger.trigger
            │   └── AccountTrigger.trigger-meta.xml
            ├── flows/
            │   └── Account_Record_Trigger.flow-meta.xml
            ├── objects/
            │   └── Account/
            │       ├── fields/
            │       │   └── CustomField__c.field-meta.xml
            │       └── validationRules/
            │           └── MyRule.validationRule-meta.xml
            ├── permissionsets/
            │   └── My_Permission_Set.permissionset-meta.xml
            └── lwc/
                └── myComponent/
                    ├── myComponent.html
                    ├── myComponent.js
                    └── myComponent.js-meta.xml
\`\`\`

### sfdx-project.json

\`\`\`json
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true,
      "package": "My Project",
      "versionName": "Spring '24",
      "versionNumber": "1.2.0.NEXT"
    }
  ],
  "sourceApiVersion": "59.0",
  "sfdcLoginUrl": "https://login.salesforce.com"
}
\`\`\`

### project-scratch-def.json

\`\`\`json
{
  "orgName": "My Development Org",
  "edition": "Developer",
  "features": ["EnableSetPasswordInApi", "Communities", "ServiceCloud"],
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true
    }
  },
  "hasSampleData": false
}
\`\`\`

### Source Format vs Metadata Format

\`\`\`
Metadata Format (ancien)        Source Format (SFDX)
─────────────────────────       ─────────────────────────
objects/Account.object          objects/Account/
                                  fields/CustomField__c.field-meta.xml
                                  validationRules/MyRule.validationRule-meta.xml

Avantage Source Format :
- 1 fichier = 1 composant
- Git diff lisible
- Merge conflicts plus faciles
\`\`\`
    `,
    tsAnalogy: `
\`\`\`
sfdx-project.json       ≈ package.json + tsconfig.json
.forceignore            ≈ .gitignore
project-scratch-def.json ≈ docker-compose.yml
force-app/              ≈ src/
  classes/              ≈ services/
  lwc/                  ≈ components/
  objects/              ≈ entities/
  flows/                ≈ workflows/ déclaratifs

Source Format = 1 fichier TypeScript par classe
vs Metadata Format = 1 énorme fichier XML monolithique par objet
\`\`\`
    `,
    gotchas: [
      "Chaque fichier SF en Source Format a un fichier -meta.xml correspondant — ne pas l'oublier dans git",
      "La conversion entre Metadata Format et Source Format : 'sf project convert source'",
      "Les Scratch Orgs ne peuvent pas être utilisées comme environnement de production",
      "sfdcLoginUrl doit être 'https://test.salesforce.com' pour les sandboxes dans sfdx-project.json",
    ],
  },
  {
    id: "devops-003",
    title: "Unlocked Packages vs Managed Packages vs Unmanaged Packages",
    category: "Deployment & DevOps",
    tags: ["packages", "deployment", "unlocked-packages", "appexchange"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `
## Les 3 types de Packages Salesforce

### Unmanaged Packages

\`\`\`
Usage : Partager des templates/exemples
  ✅ Code source visible dans l'org cible
  ✅ Modifiable après installation
  ❌ Pas de versioning après installation
  ❌ Pas de mise à jour supportée

⚠️ NE PAS utiliser pour des déploiements d'entreprise
\`\`\`

### Managed Packages

\`\`\`
Usage : Applications ISV sur AppExchange
  ✅ Code source CACHÉ (propriété intellectuelle protégée)
  ✅ Namespace obligatoire (ex: mynamespace__CustomObject__c)
  ✅ Versioning sémantique (1.0, 1.1, 2.0...)
  ✅ Mises à jour supportées (push upgrades possibles)
  ❌ Ne peut jamais supprimer des champs déployés dans des versions précédentes
\`\`\`

### Unlocked Packages ✅ Recommandé pour les entreprises

\`\`\`
Usage : Déploiements d'entreprise modernes (2nd gen packaging)
  ✅ Code source visible (modifiable)
  ✅ Namespace optionnel
  ✅ Versioning sémantique intégré
  ✅ Dépendances entre packages gérées
  ✅ Deployable via sf CLI (sf package install)
  ✅ Rollback possible (version précédente)

Avantages vs Change Sets :
  ✅ Version-controlled
  ✅ Dépendances gérées
  ✅ Deployable via CLI/CI
  ✅ Reproductible
\`\`\`

### Workflow Unlocked Packages

\`\`\`bash
# 1. Créer le package (une fois)
sf package create --name "My Core Package" --type Unlocked --path force-app

# 2. Créer une version
sf package version create --package "My Core Package" --installation-key test1234 --wait 10

# 3. Promouvoir la version (release candidate → released)
sf package version promote --package 04txx000000000X@1.2.0-1

# 4. Installer dans une org
sf package install --package 04txx000000000X@1.2.0-1 --target-org prod
\`\`\`
    `,
    tsAnalogy: `
\`\`\`
Unmanaged Package  ≈ Copier-coller du code (éditable, pas de versioning)
Managed Package    ≈ npm package publié avec code minifié (node_modules non éditables)
                     → comme installer react, lodash
Unlocked Package   ≈ npm workspace / monorepo package
                     → comme @company/my-lib dans un monorepo

sfdx-project.json  ≈ package.json
sf package install ≈ npm install
sf package version create ≈ npm publish
\`\`\`
    `,
    gotchas: [
      "Les Managed Packages ne peuvent jamais supprimer de champs dans une mise à jour — planifier la structure en avance",
      "Un Unlocked Package installé dans une org cible peut être modifié localement — mais ces modifications seront écrasées à la prochaine installation",
      "Les packages 2nd gen nécessitent SFDX — les packages 1st gen sont créés via l'UI",
      "Les dépendances entre Unlocked Packages : Package A doit être installé avant Package B qui en dépend",
      "Installation Key protège contre l'installation non autorisée — stocker en secret",
    ],
  },
  {
    id: "devops-004",
    title: "sf CLI — Commandes essentielles",
    category: "Deployment & DevOps",
    tags: ["sf-cli", "sfdx", "cli", "devops"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `
## sf CLI : l'interface en ligne de commande Salesforce DX

Anciennement \`sfdx\`, maintenant \`sf\` (Salesforce CLI v2).

### Authentification

\`\`\`bash
# Login interactif (browser OAuth)
sf org login web --alias my-dev-sandbox --instance-url https://test.salesforce.com

# Login JWT (pour CI/CD)
sf org login jwt \\
  --client-id $SF_CLIENT_ID \\
  --jwt-key-file $SF_JWT_KEY_FILE \\
  --username $SF_USERNAME \\
  --alias production

# Lister les orgs connectées
sf org list
\`\`\`

### Gestion des Scratch Orgs

\`\`\`bash
sf org create scratch \\
  --definition-file config/project-scratch-def.json \\
  --alias my-scratch \\
  --duration-days 30 \\
  --set-default

sf org open --target-org my-scratch
sf org delete scratch --target-org my-scratch --no-prompt
\`\`\`

### Déploiement & Retrieve

\`\`\`bash
# Déployer vers une org
sf project deploy start \\
  --source-dir force-app \\
  --target-org production \\
  --test-level RunAllTestsInOrg \\
  --wait 30

# Retrieve (pull depuis une org)
sf project retrieve start \\
  --source-dir force-app \\
  --target-org my-sandbox

# Valider sans déployer (dry run)
sf project deploy validate \\
  --source-dir force-app \\
  --target-org production \\
  --test-level RunAllTestsInOrg
\`\`\`

### Apex

\`\`\`bash
# Exécuter du code Apex anonymement
sf apex run --file scripts/apex/setup-data.apex --target-org my-scratch

# Lancer les tests Apex
sf apex test run \\
  --class-names AccountServiceTest,OrderServiceTest \\
  --target-org my-sandbox \\
  --result-format human \\
  --wait 10

# Lancer tous les tests avec coverage
sf apex test run \\
  --test-level RunAllTestsInOrg \\
  --target-org production \\
  --code-coverage \\
  --result-format json
\`\`\`

### Test levels

\`\`\`
NoTestRun         : Pas de tests (DEV seulement, interdit en prod)
RunSpecifiedTests : Seulement les classes spécifiées
RunLocalTests     : Tous les tests de l'org (pas les managed packages)
RunAllTestsInOrg  : Tous les tests (y compris managed packages)
\`\`\`
    `,
    tsAnalogy: `
\`\`\`bash
# sf CLI ≈ npm/yarn + heroku CLI + prisma CLI combinés

sf org login web       ≈ heroku auth:login
sf project deploy      ≈ npm publish / heroku git:push
sf project retrieve    ≈ git pull
sf apex run            ≈ npx ts-node script.ts
sf apex test run       ≈ npm test
sf data query          ≈ psql -c "SELECT ..."
sf org create scratch  ≈ docker run --rm my-app  (éphémère)
\`\`\`
    `,
    gotchas: [
      "sf est le nouveau nom de la CLI (remplace sfdx) — certains tutoriels anciens utilisent encore 'sfdx force:source:deploy'",
      "Le flag --target-org accepte un alias ou un username — si omis, utilise l'org par défaut",
      "sf project deploy validate = dry run — ne déploie PAS",
      "NoTestRun n'est pas autorisé en production (SF l'interdit) — utiliser au minimum RunLocalTests",
    ],
  },
  {
    id: "devops-005",
    title: "Metadata API & package.xml — deploy/retrieve",
    category: "Deployment & DevOps",
    tags: ["metadata-api", "deployment", "package-xml"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Metadata API : déployer des configurations et du code

### package.xml — Le manifeste de déploiement

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">

    <types>
        <members>AccountService</members>
        <members>AccountServiceTest</members>
        <name>ApexClass</name>
    </types>

    <types>
        <members>AccountTrigger</members>
        <name>ApexTrigger</name>
    </types>

    <types>
        <members>Account_Record_Trigger</members>
        <name>Flow</name>
    </types>

    <types>
        <members>Order__c</members>
        <members>Order__c.Status__c</members>
        <name>CustomObject</name>
    </types>

    <types>
        <members>Sales_Manager_PS</members>
        <name>PermissionSet</name>
    </types>

    <!-- Wildcard : tous les composants d'un type -->
    <types>
        <members>*</members>
        <name>CustomLabel</name>
    </types>

    <version>59.0</version>
</Package>
\`\`\`

### Types de Metadata courants

\`\`\`
ApexClass              → Classes Apex
ApexTrigger            → Triggers Apex
LightningComponentBundle → LWC
Flow                   → Flows (automatisations)
CustomObject           → Objets custom
CustomField            → Champs custom
ValidationRule         → Règles de validation
Profile                → Profils
PermissionSet          → Permission Sets
CustomLabel            → Labels custom
StaticResource         → Static Resources
\`\`\`

### Déployer avec package.xml

\`\`\`bash
# Retrieve (récupérer depuis l'org)
sf project retrieve start \\
  --manifest manifest/package.xml \\
  --target-org source-org

# Deploy (déployer vers une org)
sf project deploy start \\
  --manifest manifest/package.xml \\
  --target-org production \\
  --test-level RunLocalTests

# Destructive changes (supprimer des composants)
sf project deploy start \\
  --manifest manifest/package.xml \\
  --pre-destructive-changes manifest/destructiveChangesPre.xml \\
  --target-org production
\`\`\`

### destructiveChanges.xml

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>OldApexClass</members>
        <name>ApexClass</name>
    </types>
    <version>59.0</version>
</Package>
\`\`\`

### Change Sets vs Metadata API vs Packages

\`\`\`
Change Sets :
  ✅ Simple, UI-based
  ❌ Pas de version control, rollback, CLI

Metadata API (package.xml) :
  ✅ Scriptable, CLI, version-controlled
  ❌ Gestion manuelle des dépendances

Unlocked Packages :
  ✅ Versioning intégré, dépendances gérées, rollback
  ❌ Setup plus complexe
\`\`\`
    `,
    tsAnalogy: `
\`\`\`xml
<!-- package.xml ≈ manifeste Terraform ou .dockerignore inversé -->
<!-- C'est le manifeste qui décrit CE QUI sera déployé -->

<!-- Équivalent Terraform :
resource "salesforce_apex_class" "account_service" {
  name = "AccountService"
}
resource "salesforce_custom_object" "order" {
  api_name = "Order__c"
}
-->

<!-- sf project deploy ≈ terraform apply -->
<!-- sf project retrieve ≈ terraform import -->
<!-- destructiveChanges.xml ≈ terraform destroy -target=... -->
\`\`\`
    `,
    gotchas: [
      "Le wildcard * dans package.xml récupère TOUS les composants du type — peut être très lent sur les grandes orgs",
      "Les dépendances : si tu déploies un champ, tu dois déployer l'objet parent dans le même package",
      "Les destructiveChanges s'appliquent APRÈS le déploiement du package principal — utiliser destructiveChangesPre pour avant",
      "Les tests doivent passer à 75% de code coverage globalement ET par classe déployée en production",
    ],
  },
  {
    id: "devops-006",
    title:
      "CI/CD avec Salesforce — GitHub Actions, scratch org, test run, deploy",
    category: "Deployment & DevOps",
    tags: ["cicd", "github-actions", "devops", "automation"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## CI/CD Salesforce : automatiser le déploiement

### Pipeline typique

\`\`\`
Developer → Push to feature branch
    ↓
PR Created → CI Pipeline (GitHub Actions)
    ├─ Create Scratch Org
    ├─ Push Source
    ├─ Run All Apex Tests
    ├─ Check Code Coverage (>= 75%)
    └─ Delete Scratch Org
    ↓
PR Merged to main
    ↓
CD Pipeline
    ├─ Validate against Production (dry run)
    ├─ Approval gate (manual)
    └─ Deploy to Production
\`\`\`

### GitHub Actions — PR Validation

\`\`\`yaml
# .github/workflows/pr-validation.yml
name: PR Validation
on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Salesforce CLI
        run: npm install -g @salesforce/cli

      - name: Authenticate to SF
        run: |
          echo "\${​{ secrets.SF_JWT_KEY }}" > server.key
          sf org login jwt \\
            --client-id \${​{ secrets.SF_CLIENT_ID }} \\
            --jwt-key-file server.key \\
            --username \${​{ secrets.SF_USERNAME }} \\
            --alias ci-org

      - name: Create Scratch Org
        run: |
          sf org create scratch \\
            --definition-file config/project-scratch-def.json \\
            --alias scratch-ci \\
            --duration-days 1 \\
            --target-dev-hub ci-org

      - name: Push Source
        run: sf project deploy start --target-org scratch-ci --wait 20

      - name: Run Apex Tests
        run: |
          sf apex test run \\
            --target-org scratch-ci \\
            --test-level RunLocalTests \\
            --code-coverage \\
            --result-format json \\
            --output-dir test-results \\
            --wait 20

      - name: Delete Scratch Org
        if: always()  # Toujours nettoyer même si erreur
        run: sf org delete scratch --target-org scratch-ci --no-prompt
\`\`\`

### GitHub Actions — Deploy to Production

\`\`\`yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Protection gate avec approbation manuelle
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @salesforce/cli

      - name: Authenticate to Production
        run: |
          echo "\${​{ secrets.SF_PROD_JWT_KEY }}" > server.key
          sf org login jwt \\
            --client-id \${​{ secrets.SF_PROD_CLIENT_ID }} \\
            --jwt-key-file server.key \\
            --username \${​{ secrets.SF_PROD_USERNAME }} \\
            --alias production

      - name: Validate Deployment
        run: |
          sf project deploy validate \\
            --source-dir force-app \\
            --target-org production \\
            --test-level RunLocalTests \\
            --wait 30

      - name: Deploy to Production
        run: |
          sf project deploy start \\
            --source-dir force-app \\
            --target-org production \\
            --test-level RunLocalTests \\
            --wait 30
\`\`\`

### Branching Strategy recommandée

\`\`\`
feature/* → Developer Sandbox (dev individuel)
    ↓ PR merge
develop   → Integration Sandbox
    ↓ PR merge
staging   → UAT/QA Sandbox
    ↓ PR merge (avec approbation)
main      → Production
\`\`\`
    `,
    tsAnalogy: `
\`\`\`yaml
# CI/CD SF ≈ Pipeline Node.js/TypeScript classique

# Équivalent pour une app NestJS :
# on: pull_request → branches: [main]
#   npm ci → npm run lint → npm run build → npm run test:unit → npm run test:e2e
# on: push → branches: [main] → deploy to production

# Différences clés SF :
# Create Scratch Org ≈ docker run (environnement éphémère)
# Push Source ≈ deploy code to container
# apex test run ≈ npm test (mais dans l'org SF, pas en local)
# sf project deploy validate ≈ terraform plan (dry run)
# sf project deploy start ≈ terraform apply
\`\`\`
    `,
    gotchas: [
      "La Connected App utilisée pour CI/CD doit avoir 'JWT Bearer Flow' activé + certificat configuré",
      "Le username dans le JWT doit être PRE-APPROVED pour la Connected App — activer 'Admin approved users only'",
      "sf org create scratch nécessite un Dev Hub connecté — l'org de production est souvent le Dev Hub",
      "Le 'if: always()' sur la suppression de Scratch Org est CRUCIAL — sinon les orgs s'accumulent si la CI échoue",
      "Les Scratch Orgs ont une limite (20-40 actives selon l'édition) — les pipelines concurrent peuvent épuiser la limite",
    ],
  },
];
