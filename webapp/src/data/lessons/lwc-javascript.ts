import type { Lesson } from "./types";

export const lwcJsLessons: Lesson[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // LWC FONDAMENTAUX
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-01-architecture",
    title: "Architecture LWC — Web Components standards",
    category: "LWC Fondamentaux",
    tags: [
      "lwc",
      "web-components",
      "shadow-dom",
      "custom-elements",
      "es-modules",
    ],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Architecture LWC

LWC (Lightning Web Components) est un framework UI basé sur les **standards Web Components** modernes — pas une abstraction propriétaire. Salesforce a choisi de construire sur le navigateur natif.

### Les trois piliers des Web Components

| Standard | Rôle | Support navigateur |
|---|---|---|
| **Custom Elements v1** | Définit de nouveaux tags HTML (\`<my-component>\`) | Tous les navigateurs modernes |
| **Shadow DOM** | Encapsulation CSS et DOM | Tous les navigateurs modernes |
| **ES Modules** | Chargement et partage de code JS | Tous les navigateurs modernes |

LWC ajoute une **couche de compilation** (transform Babel-like) et une **plateforme de déploiement** (Salesforce), mais le code produit est du Web Components standard.

### Ce que LWC apporte en plus des standards

\`\`\`
LWC = Custom Elements + Shadow DOM + ES Modules
    + Réactivité déclarative (inspirée React/Angular)
    + Décorators TypeScript-like (@api, @track, @wire)
    + Binding bidirectionnel dans les templates
    + Intégration Salesforce (Apex, LDS, NavigationMixin)
\`\`\`

### Shadow DOM — l'encapsulation native

Le Shadow DOM crée un **sous-arbre DOM isolé** pour chaque composant. Les styles et les sélecteurs JS du monde extérieur ne peuvent pas pénétrer dans ce sous-arbre.

\`\`\`html
<!-- DOM principal -->
<c-my-component>
  #shadow-root (closed par défaut dans LWC)
    <div class="container">  <!-- inaccessible depuis l'extérieur -->
      <slot></slot>
    </div>
</c-my-component>
\`\`\`

**Conséquence importante** : \`document.querySelector('.container')\` **ne trouvera rien** depuis l'extérieur du composant. Il faut passer par \`this.template.querySelector('.container')\` depuis l'intérieur.

### Synthetic vs Native Shadow DOM

LWC supporte deux modes :
- **Synthetic Shadow** (défaut legacy) : polyfill Salesforce qui simule le Shadow DOM pour compatibilité IE11 (obsolète mais encore présent dans certains orgs)
- **Native Shadow** (recommandé) : Shadow DOM natif du navigateur — meilleur support, meilleures performances

### Namespace LWC

Chaque composant LWC a un **namespace** qui forme son tag HTML :
\`\`\`
namespace/componentName → <namespace-component-name>
c/myButton → <c-my-button>
lightning/button → <lightning-button>  (composants Salesforce base)
\`\`\`

Le \`c\` est le namespace par défaut pour le code custom dans un org Salesforce.`,
    tsAnalogy: `## Analogie React/Vue

Si tu connaissais React/Vue, LWC est comparable à :

\`\`\`
React + Vite build → LWC + SFDX compile
React Components   → LWC Custom Elements
React Shadow DOM ? → LWC Shadow DOM (natif, pas simulé)
React Context      → LWC Lightning Message Service
React hooks        → LWC @wire / reactive properties
\`\`\`

La principale différence conceptuelle : **le navigateur comprend nativement les Web Components**. Un composant React sans son runtime ne fait rien. Un Web Component compilé peut fonctionner sans framework runtime.`,
    gotchas: [
      "LWC utilise le Shadow DOM — document.querySelector() ne traverse PAS le shadow boundary. Toujours utiliser this.template.querySelector()",
      "Le namespace 'c' est automatique en développement local, mais peut différer en managed packages (namespace de l'org)",
      "Synthetic Shadow vs Native Shadow : les comportements CSS diffèrent — certains sélecteurs qui marchent en synthetic échouent en native",
      "Les Custom Elements ont des noms avec au moins un tiret (obligatoire W3C) : 'mycomponent' est invalide, 'my-component' est valide",
    ],
  },

  {
    id: "lwc-02-structure-composant",
    title: "Structure d'un composant LWC — .js + .html + .css + .js-meta.xml",
    category: "LWC Fondamentaux",
    tags: ["lwc", "structure", "sfc", "metadata", "html-template"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Structure d'un composant LWC

Un composant LWC est un **dossier** dont le nom correspond au nom du composant. Tous les fichiers partagent le même nom de base.

\`\`\`
force-app/main/default/lwc/
└── monComposant/
    ├── monComposant.js        # Logique JS (obligatoire)
    ├── monComposant.html      # Template (obligatoire)
    ├── monComposant.css       # Styles (optionnel)
    ├── monComposant.js-meta.xml  # Metadata (obligatoire pour déployer)
    └── __tests__/
        └── monComposant.test.js  # Tests Jest (optionnel)
\`\`\`

### Le fichier .html — le template

\`\`\`html
<!-- monComposant.html -->
<template>
  <div class="container">
    <h1>{title}</h1>
    <p if:true={isVisible}>Contenu conditionnel</p>
    <button onclick={handleClick}>Cliquer</button>
  </div>
</template>
\`\`\`

**Règles importantes du template LWC :**
- Doit avoir **exactement un** élément racine \`<template>\`
- Les bindings utilisent \`{expression}\` (une seule accolade, pas double comme Mustache/Vue)
- Pas de JS arbitraire dans le template (pas comme JSX) — seulement des références à des propriétés/méthodes

### Le fichier .js — la classe du composant

\`\`\`javascript
// monComposant.js
import { LightningElement, track, api, wire } from 'lwc';

export default class MonComposant extends LightningElement {
  // Propriété réactive (public)
  @api title = 'Bonjour';

  // Propriété réactive (privée)
  isVisible = false;

  // Handler d'événement
  handleClick() {
    this.isVisible = !this.isVisible;
  }
}
\`\`\`

**Points clés :**
- Toujours \`export default class\`
- Extend \`LightningElement\` (jamais \`HTMLElement\` directement)
- Les imports viennent du module virtuel \`'lwc'\`

### Le fichier .css — styles scopés

\`\`\`css
/* monComposant.css */
/* Ces styles sont AUTOMATIQUEMENT scopés au composant */
/* Pas besoin de BEM, CSS Modules, ou scoped attribute */
.container {
  padding: 1rem;
}

h1 {
  color: navy;
  /* N'affecte QUE les h1 dans CE composant */
}

/* Pour styler depuis l'extérieur : CSS custom properties */
:host {
  display: block; /* LWC components sont inline par défaut ! */
  background: var(--my-bg-color, white);
}
\`\`\`

### Le fichier .js-meta.xml — metadata de déploiement

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
  <apiVersion>59.0</apiVersion>
  <isExposed>true</isExposed>
  <masterLabel>Mon Composant</masterLabel>
  <description>Description visible dans App Builder</description>
  <targets>
    <target>lightning__AppPage</target>
    <target>lightning__RecordPage</target>
    <target>lightning__HomePage</target>
  </targets>
  <targetConfigs>
    <targetConfig targets="lightning__RecordPage">
      <property name="title" type="String" label="Titre" default="Bonjour"/>
    </targetConfig>
  </targetConfigs>
</LightningComponentBundle>
\`\`\``,
    tsAnalogy: `## Analogie avec Vue Single File Component (SFC)

Un composant Vue \`.vue\` et un composant LWC ont la même philosophie de colocating :

\`\`\`
Vue SFC (.vue)           │  LWC (dossier)
────────────────────────  │  ──────────────────────────────
<template>...</template>  │  monComposant.html
<script>...</script>      │  monComposant.js
<style scoped>...</style> │  monComposant.css (toujours scoped)
                          │  monComposant.js-meta.xml (pas d'équivalent Vue)
\`\`\`

La **différence principale** : Vue compile tout en un bundle JS. LWC maintient des fichiers séparés — le template HTML est compilé en render function par le compilateur LWC.

**Différence avec React** : Dans React, le template est du JSX dans le fichier JS. LWC sépare obligatoirement HTML et JS. Tu ne peux pas écrire de HTML inline dans le .js.`,
    gotchas: [
      "Le nom du dossier DOIT correspondre exactement au nom des fichiers (camelCase pour le dossier, kebab-case pour le tag HTML)",
      "Les composants LWC sont 'inline' par défaut — ajouter :host { display: block; } dans le CSS si tu veux un comportement block",
      "isExposed: false = le composant n'apparaît pas dans Lightning App Builder mais reste utilisable programmatiquement",
      "Sans le fichier .js-meta.xml, le composant ne peut pas être déployé dans un org Salesforce",
      "Un seul élément racine dans le template — contrairement à React (Fragments) ou Vue 3 (multiple root elements)",
    ],
  },

  {
    id: "lwc-03-meta-xml",
    title: "Le fichier XML de metadata — targets, isExposed, masterLabel",
    category: "LWC Fondamentaux",
    tags: ["lwc", "metadata", "xml", "app-builder", "targets"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Le fichier .js-meta.xml en détail

Ce fichier est l'**interface entre ton composant et la plateforme Salesforce**. Il contrôle où et comment ton composant peut être utilisé.

### Structure complète

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">

  <!-- Version API Salesforce (obligatoire) -->
  <apiVersion>59.0</apiVersion>

  <!-- Visible dans Lightning App Builder ? -->
  <isExposed>true</isExposed>

  <!-- Nom affiché dans App Builder -->
  <masterLabel>Mon Super Composant</masterLabel>

  <!-- Description dans App Builder -->
  <description>Composant pour afficher les commandes</description>

  <!-- Où peut-il être glissé ? -->
  <targets>
    <target>lightning__AppPage</target>
    <target>lightning__RecordPage</target>
    <target>lightning__HomePage</target>
    <target>lightning__FlowScreen</target>
    <target>lightningCommunity__Page</target>
  </targets>

  <!-- Configuration spécifique par target -->
  <targetConfigs>
    <targetConfig targets="lightning__RecordPage">
      <property
        name="maxItems"
        type="Integer"
        label="Nombre max d'items"
        default="10"
        min="1"
        max="100"
      />
      <objects>
        <object>Account</object>
        <object>Contact</object>
      </objects>
      <supportedFormFactors>
        <supportedFormFactor type="Large"/>
      </supportedFormFactors>
    </targetConfig>

    <targetConfig targets="lightning__FlowScreen">
      <property name="selectedId" type="String" role="inputOutput"/>
    </targetConfig>
  </targetConfigs>

</LightningComponentBundle>
\`\`\`

### Les targets disponibles

| Target | Description |
|---|---|
| \`lightning__AppPage\` | Pages d'application (App Builder) |
| \`lightning__RecordPage\` | Pages de record (Account, Contact...) |
| \`lightning__HomePage\` | Page d'accueil |
| \`lightning__FlowScreen\` | Écrans de Flow Builder |
| \`lightning__MailApp\` | Application Outlook/Gmail |
| \`lightningCommunity__Page\` | Experience Cloud (portails) |

### Variables spéciales injectées automatiquement

Certaines propriétés sont **injectées automatiquement** par la plateforme si tu les déclares avec @api :

\`\`\`javascript
@api recordId;       // ID du record courant (Record Page)
@api objectApiName;  // API name de l'objet (Account, Contact...)
@api flexipageRegionWidth; // Largeur de la région (SMALL, MEDIUM, LARGE)
\`\`\``,
    tsAnalogy: `## Analogie conceptuelle

Il n'y a pas d'équivalent direct dans React/Vue pur, mais si tu as utilisé :

- **Storybook \`*.stories.ts\`** : déclare les "knobs" (props configurables) d'un composant
- **VS Code \`package.json\` contributes** : déclare où et comment une extension s'intègre

Le \`.js-meta.xml\` joue ce rôle : il **déclare les capacités** du composant auprès de la plateforme Salesforce (où il peut être placé, quelles props sont configurables par un admin non-technique via drag & drop).`,
    gotchas: [
      "isExposed: false ne signifie pas que le composant est privé — il est juste absent de App Builder. Il peut quand même être utilisé dans d'autres composants",
      "Les propriétés déclarées dans targetConfig DOIVENT avoir un @api correspondant dans le .js, sinon erreur de déploiement",
      "apiVersion doit être >= la version où le composant a été créé — réduire la version peut casser des features",
      "Sans target lightning__RecordPage, recordId ne sera pas injecté automatiquement même si tu déclares @api recordId",
      "Pour les Flow Screens, il faut explicitement déclarer role='inputOutput' pour l'intégration avec les variables de Flow",
    ],
  },

  {
    id: "lwc-04-api-decorator",
    title: "@api decorator — props publiques",
    category: "LWC Fondamentaux",
    tags: ["lwc", "@api", "props", "decorator", "reactive"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Le decorator @api

\`@api\` marque une propriété ou une méthode comme **publique** — accessible depuis le composant parent.

### Import et usage basique

\`\`\`javascript
import { LightningElement, api } from 'lwc';

export default class MonBouton extends LightningElement {
  @api label = 'Cliquer';      // prop avec valeur par défaut
  @api variant = 'neutral';    // prop string
  @api disabled = false;       // prop boolean
  @api record;                 // prop objet (pas de valeur par défaut)

  // Méthode publique appelable par le parent
  @api focus() {
    this.template.querySelector('button').focus();
  }
}
\`\`\`

\`\`\`html
<!-- Template parent -->
<c-mon-bouton
  label="Sauvegarder"
  variant="brand"
  disabled={isLoading}
  record={currentRecord}
></c-mon-bouton>
\`\`\`

### Règles de @api

**1. Les props @api sont réactives**
Quand le parent change la valeur, le composant enfant se re-render automatiquement.

**2. Les props @api sont en lecture seule dans l'enfant**
\`\`\`javascript
// ❌ INTERDIT — mutation directe d'une prop @api
this.label = 'nouveau label'; // throws error en dev mode

// ✅ Correct — émettre un événement pour demander au parent de changer
this.dispatchEvent(new CustomEvent('labelchange', { detail: 'nouveau label' }));
\`\`\`

**3. Nommage : camelCase en JS, kebab-case en HTML**
\`\`\`javascript
@api maxItems = 10;
\`\`\`
\`\`\`html
<c-mon-composant max-items="20"></c-mon-composant>
\`\`\`

**4. Getter/Setter @api pour validation**
\`\`\`javascript
import { LightningElement, api } from 'lwc';

export default class MonComposant extends LightningElement {
  _items = [];

  @api
  get items() {
    return this._items;
  }
  set items(value) {
    this._items = Array.isArray(value) ? value : [];
  }
}
\`\`\`

**5. @api sur les méthodes**
\`\`\`javascript
@api reset() {
  this.internalState = null;
  this.errorMessage = '';
}

// Dans le parent
handleReset() {
  this.template.querySelector('c-mon-enfant').reset();
}
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`
React                     │  Vue 3                    │  LWC
───────────────────────── │  ──────────────────────── │  ──────────────────────
function Btn({ label })   │  defineProps<{            │  @api label = '';
                          │    label: string          │
                          │  }>()                     │
                          │                           │
// pas de méthodes        │  defineExpose({ reset })  │  @api reset() {...}
// exposées par défaut    │                           │
\`\`\`

**Différence clé avec React** : Dans React, les props sont simplement des arguments de fonction — tu n'as pas à "déclarer" qu'une prop est publique, elles le sont toutes. En LWC, tu dois **explicitement marquer** avec @api ce qui est public. Tout le reste est privé par défaut.`,
    gotchas: [
      "Muter une prop @api directement lève une erreur en dev mode LWC — toujours émettre un événement",
      "Les propriétés @api ne peuvent PAS commencer par 'on' (ex: @api onChange est interdit — ça ressemble trop à un handler d'événement)",
      "Passer un objet par @api et le muter dans l'enfant modifie l'objet original du parent — même référence. Utiliser le spread pour cloner",
      "Une méthode @api ne peut pas être async dans certaines versions de LWC — vérifier la version API",
      "Les propriétés @api ne peuvent PAS être des Symbol — uniquement des noms de propriétés string standards",
    ],
  },

  {
    id: "lwc-05-track-decorator",
    title: "@track decorator — réactivité et état interne",
    category: "LWC Fondamentaux",
    tags: ["lwc", "@track", "reactive", "state", "rendering"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Le decorator @track — contexte historique

**@track est aujourd'hui largement obsolète**, mais il est encore fréquent dans le code legacy et dans les questions de certification.

### L'évolution de la réactivité LWC

**Avant Spring '20 (API 40-47) :**
- \`@track\` était **obligatoire** pour la réactivité des propriétés privées
- Sans \`@track\`, une propriété n'était pas réactive

**Depuis Spring '20 (API 48+) :**
- **Toutes les propriétés sont réactives par défaut** (sans @track)
- \`@track\` subsiste mais avec une sémantique réduite : il active la **réactivité profonde** (deep reactivity)

### Le problème avec les objets et arrays

\`\`\`javascript
export default class MonComposant extends LightningElement {
  // SANS @track
  profil = { nom: 'Alice', age: 30 };
  items = ['a', 'b', 'c'];

  changerNom() {
    // ❌ Mutation d'objet → PAS de re-render (LWC ne détecte pas)
    this.profil.nom = 'Bob';

    // ❌ Mutation d'array → PAS de re-render
    this.items.push('d');

    // ✅ Réassignation complète → déclenche re-render
    this.profil = { ...this.profil, nom: 'Bob' };
    this.items = [...this.items, 'd'];
  }
}
\`\`\`

### @track — active la réactivité profonde

\`\`\`javascript
import { LightningElement, track } from 'lwc';

export default class MonComposant extends LightningElement {
  @track profil = { nom: 'Alice', age: 30 };
  @track items = ['a', 'b', 'c'];

  changerNom() {
    // ✅ Mutation d'objet → déclenche re-render (grâce à @track)
    this.profil.nom = 'Bob';

    // ✅ Mutation d'array → déclenche re-render
    this.items.push('d');
  }
}
\`\`\`

### Comparaison des comportements

| Opération | Sans @track | Avec @track |
|---|---|---|
| \`this.name = 'Bob'\` (primitive) | ✅ Re-render | ✅ Re-render |
| \`this.obj = { ...this.obj }\` (réassignation) | ✅ Re-render | ✅ Re-render |
| \`this.obj.prop = 'x'\` (mutation) | ❌ Pas de re-render | ✅ Re-render |
| \`this.arr.push(x)\` (mutation) | ❌ Pas de re-render | ✅ Re-render |`,
    tsAnalogy: `## Analogie React / Vue

\`\`\`javascript
// LWC @track ≈ Vue 3 reactive()
import { reactive, ref } from 'vue';

// Vue ref — réassignation uniquement (comme LWC sans @track)
const count = ref(0);
count.value++; // réactif ✅

// Vue reactive — mutations profondes (comme LWC @track)
const state = reactive({ name: 'Alice', items: [] });
state.name = 'Bob';    // réactif ✅
state.items.push('x'); // réactif ✅
\`\`\`

**Pattern recommandé aujourd'hui** : éviter @track, préférer l'immutabilité (spread) pour la cohérence et la prévisibilité — exactement comme en React.`,
    gotchas: [
      "@track ne force plus la réactivité des primitives depuis Spring '20 — il est inutile sur string/number/boolean",
      "Même avec @track, si tu réassignes complètement l'objet, le re-render se produit (pas besoin de @track pour ça)",
      "Les questions de certification peuvent encore mentionner @track comme nécessaire — dans ce contexte, la bonne réponse est 'pour les mutations d'objets profonds'",
      "Ne pas confondre @track (private reactive) et @api (public reactive) — @api est aussi réactif mais expose au parent",
    ],
  },

  {
    id: "lwc-06-reactivite",
    title: "Réactivité LWC — quand le DOM se re-render",
    category: "LWC Fondamentaux",
    tags: ["lwc", "reactivity", "rendering", "dom", "performance"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Le système de réactivité LWC

### Déclencheurs de re-render

Un composant LWC se re-render dans ces cas :

1. **Une propriété @api change** (le parent pousse une nouvelle valeur)
2. **Une propriété primitive est réassignée** (\`this.count++\`, \`this.name = 'x'\`)
3. **Un objet/array avec @track est muté**
4. **Un objet/array est réassigné** (\`this.items = [...this.items]\`)
5. **Une wire property reçoit de nouvelles données**

### Ce qui NE déclenche PAS de re-render

\`\`\`javascript
// ❌ Variables locales — pas de réactivité
const localVar = 'ignored';

// ❌ Propriétés d'objet (sans @track)
this.user.name = 'Bob'; // silencieux

// ❌ Push/splice/sort sur array (sans @track)
this.items.splice(0, 1); // silencieux
\`\`\`

### Batch de mises à jour

\`\`\`javascript
handleClick() {
  // LWC batche ces 3 changements en UN seul re-render
  this.name = 'Bob';
  this.age = 31;
  this.active = true;
  // → un seul DOM update
}
\`\`\`

### getters réactifs

\`\`\`javascript
export default class MonComposant extends LightningElement {
  firstName = 'Alice';
  lastName = 'Dupont';

  // Getter = calculé à chaque render (pas de cache)
  get fullName() {
    return \`\${this.firstName} \${this.lastName}\`;
  }
}
\`\`\`

**Attention** : Les getters dans LWC ne sont PAS mémoïsés (comme useMemo en React). Ils sont recalculés à chaque render.

### Pattern immutable recommandé

\`\`\`javascript
// ✅ Toujours créer une nouvelle référence pour les objets/arrays
addItem(item) {
  this.items = [...this.items, item];
}

updateUser(name) {
  this.user = { ...this.user, name };
}
\`\`\``,
    tsAnalogy: `## Analogie React

\`\`\`javascript
// React — toujours immutable
const [user, setUser] = useState({ name: 'Alice' });
setUser({ ...user, name: 'Bob' }); // nouvelle référence = re-render

// LWC équivalent SANS @track
this.user = { ...this.user, name: 'Bob' }; // même pattern
\`\`\`

| Framework | Règle de réactivité |
|---|---|
| React | Toujours immutable — nouvelle référence obligatoire |
| Vue 3 reactive | Mutations profondes détectées |
| LWC sans @track | Même règle que React — immutable |
| LWC avec @track | Mutations OK — comme Vue reactive |`,
    gotchas: [
      "Les getters dans les templates LWC sont recalculés à chaque render — ne pas y mettre de logique coûteuse",
      "LWC batche les updates dans un même synchronous block — plusieurs this.prop = x dans la même méthode = un seul re-render",
      "Ne jamais modifier le DOM directement (this.template.querySelector().style = ...) sauf dans renderedCallback — LWC peut écraser ces modifications",
    ],
  },

  {
    id: "lwc-07-template-syntax",
    title:
      "Template syntax — if:true, for:each, iterator, lwc:if/lwc:elseif/lwc:else",
    category: "LWC Fondamentaux",
    tags: ["lwc", "template", "directives", "conditional", "iteration"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## Syntaxe des templates LWC

### Directives conditionnelles

#### Ancienne syntaxe (API < 58) — encore très présente dans les exams

\`\`\`html
<template>
  <div if:true={isLoading}>
    <lightning-spinner></lightning-spinner>
  </div>
  <div if:false={isLoading}>
    Contenu chargé
  </div>
</template>
\`\`\`

#### Nouvelle syntaxe (API 58+ = Winter '24) — recommandée

\`\`\`html
<template>
  <template lwc:if={isLoading}>
    <lightning-spinner></lightning-spinner>
  </template>
  <template lwc:elseif={hasError}>
    <p>Erreur: {errorMessage}</p>
  </template>
  <template lwc:else>
    <p>Données: {data}</p>
  </template>
</template>
\`\`\`

**Règle critique** : \`lwc:elseif\` et \`lwc:else\` doivent être des **frères directs** de l'élément \`lwc:if\`. Aucun élément entre eux.

### Itération — for:each

\`\`\`html
<template>
  <ul>
    <template for:each={contacts} for:item="contact">
      <li key={contact.id}>
        {contact.name} — {contact.email}
      </li>
    </template>
  </ul>
</template>
\`\`\`

**Règles for:each :**
- \`key\` est **obligatoire** et doit être sur l'élément **enfant direct** du \`<template for:each>\`
- \`key\` doit être une **string** (pas un number)
- \`for:index\` est disponible pour l'index : \`for:index="idx"\`

### Itération — iterator (accès first/last)

\`\`\`html
<template>
  <ul>
    <template iterator:it={contacts}>
      <li key={it.value.id}>
        <span if:true={it.first}>→ Premier : </span>
        {it.value.name}
        <span if:true={it.last}> ← Dernier</span>
      </li>
    </template>
  </ul>
</template>
\`\`\`

### Expressions dans les templates

\`\`\`html
<!-- ❌ IMPOSSIBLE dans LWC — pas d'expressions complexes -->
<p>{items.length}</p>    <!-- NE FONCTIONNE PAS -->
<p>{a + b}</p>           <!-- NE FONCTIONNE PAS -->
<p>{item.name.toUpperCase()}</p> <!-- NE FONCTIONNE PAS -->

<!-- ✅ Solution : utiliser des getters dans le .js -->
<p>{itemCount}</p>       <!-- getter dans le .js -->
\`\`\`

\`\`\`javascript
get itemCount() {
  return this.items.length;
}
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`jsx
// React — JSX expression complète
{isLoading ? <Spinner /> : <Content />}
{items.map(item => <li key={item.id}>{item.name}</li>)}

// Vue 3 — directives
<div v-if="isLoading"><Spinner /></div>
<div v-else-if="hasError">Erreur</div>
<div v-else>OK</div>
<li v-for="item in items" :key="item.id">{{ item.name }}</li>

// LWC — hybride directives + template tags
<template lwc:if={isLoading}><lightning-spinner /></template>
<template lwc:elseif={hasError}><p>{errorMessage}</p></template>
<template lwc:else><p>{data}</p></template>
<template for:each={items} for:item="item">
  <li key={item.id}>{item.name}</li>
</template>
\`\`\`

**Limitation majeure par rapport à React** : Pas de logique arbitraire dans les templates LWC. Tout calcul → getter dans le JS.`,
    gotchas: [
      "key doit être une string — si ton ID Salesforce est un number, faire key={String(item.id)} ou utiliser un getter",
      "key doit être sur l'enfant DIRECT de <template for:each>, pas sur le <template> lui-même",
      "lwc:elseif/lwc:else ne marchent que si l'élément frère précédent a lwc:if ou lwc:elseif — un commentaire HTML entre eux casse le tout",
      "Pas de nested ternaires dans les templates — tout conditionnel complexe doit être un getter JS",
      "for:each ne peut pas itérer sur des Maps ou Sets — convertir en Array d'abord",
    ],
  },

  {
    id: "lwc-08-slots",
    title: "Slots LWC — composition de composants",
    category: "LWC Fondamentaux",
    tags: ["lwc", "slots", "composition", "content-projection"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Les Slots dans LWC

Les slots permettent à un composant parent d'**injecter du contenu** dans un composant enfant — c'est le mécanisme de composition.

### Slot par défaut et slots nommés

\`\`\`html
<!-- card.html — composant enfant -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">Titre par défaut</slot>
    </div>
    <div class="card-body">
      <slot>Contenu par défaut si rien fourni</slot>
    </div>
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
\`\`\`

\`\`\`html
<!-- page.html — composant parent utilisant la card -->
<template>
  <c-card>
    <span slot="header">Ma super carte</span>

    <!-- Contenu pour le slot par défaut (unnamed) -->
    <p>Corps de la carte avec du contenu dynamique.</p>
    <lightning-button label="Action"></lightning-button>

    <div slot="footer">
      <span>Pied de page</span>
    </div>
  </c-card>
</template>
\`\`\`

### Slots et Shadow DOM

\`\`\`javascript
// Dans l'enfant, pour accéder aux éléments slottés
connectedCallback() {
  // ❌ Ne fonctionne pas — le contenu slotté est dans le light DOM du parent
  this.template.querySelector('p');

  // ✅ Pour le contenu slotté, utiliser querySelector sur l'élément host
  this.querySelector('p'); // accède au light DOM enfant
}
\`\`\`

### Limitation importante : pas de scoped slots

Contrairement à Vue, LWC **ne supporte pas les scoped slots** (slot props). Tu ne peux pas passer des données du composant enfant vers le contenu slotté du parent.

\`\`\`html
<!-- ❌ IMPOSSIBLE en LWC (équivalent Vue scoped slot) -->
<template>
  <c-liste>
    <template #item="{ item }">  <!-- n'existe pas en LWC -->
      <p>{{ item.name }}</p>
    </template>
  </c-liste>
</template>

<!-- ✅ Alternative en LWC : @api prop + for:each dans l'enfant -->
<c-liste items={contacts}></c-liste>
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`jsx
// React — children props
function Card({ header, children, footer }) {
  return (
    <div>
      <header>{header}</header>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}

// Vue 3 — named slots (le plus proche de LWC)
<slot name="header">Titre par défaut</slot>
<slot>Contenu par défaut</slot>
<slot name="footer"></slot>
\`\`\`

**LWC ≈ Vue slots en syntaxe** mais sans les scoped slots. React est plus puissant (render props), Vue est plus expressif (scoped slots), LWC est le plus limité mais standard Web Components.`,
    gotchas: [
      "Le contenu slotté par défaut (entre les balises <slot>) n'est affiché que si aucun contenu n'est fourni par le parent",
      "LWC ne supporte pas les scoped slots — si tu as besoin de passer des données de l'enfant au contenu slotté, repenser l'architecture",
      "this.template.querySelector() ne trouve PAS les éléments slottés — utiliser this.querySelector() pour le contenu light DOM",
      "Les slots sont 'named' avec l'attribut slot (lowercase) sur l'élément enfant, pas sur le <slot> lui-même",
    ],
  },

  {
    id: "lwc-09-css-scoping",
    title: "CSS dans LWC — Shadow DOM scoping et custom properties",
    category: "LWC Fondamentaux",
    tags: [
      "lwc",
      "css",
      "shadow-dom",
      "scoping",
      "custom-properties",
      "theming",
    ],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## CSS dans LWC — encapsulation par défaut

### Scoping automatique

\`\`\`css
/* monComposant.css */
/* Ces sélecteurs sont SCOPED — n'affectent que les éléments de CE composant */
.container { padding: 1rem; }
h2 { color: navy; }
\`\`\`

### :host — styler le composant lui-même

\`\`\`css
:host {
  display: block; /* ⚠️ ESSENTIEL — LWC elements sont inline par défaut */
  width: 100%;
  background-color: white;
}

/* :host avec condition */
:host([variant="compact"]) {
  padding: 0.5rem;
}
\`\`\`

### CSS Custom Properties — le seul pont de theming

Le Shadow DOM bloque les sélecteurs mais **laisse passer les CSS custom properties** (variables CSS).

\`\`\`css
/* Dans le composant enfant : consommer des variables */
:host {
  background: var(--mon-composant-bg, #ffffff);
  color: var(--mon-composant-color, #333333);
}

.title {
  font-size: var(--mon-composant-title-size, 1.2rem);
}
\`\`\`

\`\`\`css
/* Dans le parent ou CSS global : définir les variables */
c-mon-composant {
  --mon-composant-bg: #f0f8ff;
  --mon-composant-color: #001f5b;
}
\`\`\`

### Styling des composants base lightning

\`\`\`css
/* Override le style d'un lightning-button dans MON composant */
lightning-button {
  --sds-c-button-brand-color-background: #ff6b6b;
  --sds-c-button-brand-color-background-hover: #ff5252;
}
\`\`\``,
    tsAnalogy: `## Analogie avec les CSS solutions modernes

\`\`\`
Technologie               │ Scoping   │ API externe
──────────────────────────┼───────────┼────────────────────────
CSS Modules (React)       │ Classes   │ Pas de standard
Vue <style scoped>        │ Attribut  │ :deep() selector
Styled Components         │ Classes   │ Props → styles
LWC Shadow DOM            │ Natif     │ CSS custom properties
\`\`\`

**La différence clé** : CSS Modules et Vue scoped sont des polyfills. LWC utilise le vrai Shadow DOM natif — plus robuste mais aussi plus strict (pas de \`:deep()\` par défaut).`,
    gotchas: [
      "Oublier :host { display: block } est le bug CSS #1 en LWC — les composants sont inline par défaut et ignorent width/height",
      "Il est impossible de styler les éléments INTERNES d'un composant enfant depuis le parent (sauf avec CSS custom properties)",
      "Les classes CSS Salesforce (SLDS) comme 'slds-button' doivent être réappliquées dans chaque composant — elles ne traversent pas le shadow boundary",
      "LWC ne supporte pas :deep() (Vue) — ces patterns ne fonctionnent pas",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC EVENTS & COMMUNICATION
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-10-custom-events",
    title: "CustomEvent + dispatchEvent — communication child→parent",
    category: "LWC Events & Communication",
    tags: ["lwc", "events", "customevent", "dispatchevent", "child-parent"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `## CustomEvent dans LWC

La communication enfant → parent se fait via des **événements DOM personnalisés**. C'est le pattern standard Web Components.

### Émettre un événement depuis l'enfant

\`\`\`javascript
import { LightningElement, api } from 'lwc';

export default class ContactCard extends LightningElement {
  @api contactId;
  @api contactName;

  handleSelectClick() {
    const event = new CustomEvent('contactselect', {
      detail: {
        id: this.contactId,
        name: this.contactName,
      },
      bubbles: false,
      composed: false,
    });
    this.dispatchEvent(event);
  }

  handleDeleteClick() {
    this.dispatchEvent(new CustomEvent('delete'));
  }
}
\`\`\`

### Recevoir l'événement dans le parent

\`\`\`html
<!-- parent.html -->
<template>
  <c-contact-card
    contact-id={contact.id}
    contact-name={contact.name}
    oncontactselect={handleContactSelect}
    ondelete={handleDelete}
  ></c-contact-card>
</template>
\`\`\`

\`\`\`javascript
// parent.js
export default class ContactList extends LightningElement {
  handleContactSelect(event) {
    const { id, name } = event.detail;
    this.selectedContactId = id;
  }
}
\`\`\`

### Règles de nommage des événements

\`\`\`javascript
// ✅ Correct — lowercase, alphanumérique
new CustomEvent('select')
new CustomEvent('contactselect')
new CustomEvent('datachange')

// ❌ Interdit — camelCase ou tirets
new CustomEvent('contactSelect')     // PAS de camelCase
new CustomEvent('contact-select')    // PAS de tirets en LWC

// Dans le template, préfixer avec 'on' :
// 'contactselect' → oncontactselect={handler}
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`javascript
// Vue 3 — defineEmits
const emit = defineEmits<{
  contactselect: [{ id: string; name: string }];
}>();
emit('contactselect', { id: contactId, name: contactName });

// LWC équivalent
this.dispatchEvent(new CustomEvent('contactselect', {
  detail: { id: this.contactId, name: this.contactName }
}));

// React — callback props (pattern différent)
// function ContactCard({ onContactSelect }) { ... }
// Pas d'événements DOM — props callbacks directement
\`\`\`

**Différence principale** : React passe des callbacks comme props. Vue et LWC utilisent un système d'événements. LWC utilise les **CustomEvents DOM natifs**.`,
    gotchas: [
      "Les noms d'événements LWC doivent être en LOWERCASE — 'contactSelect' ne fonctionnera pas dans le template (handler = oncontactselect)",
      "Ne pas utiliser de tirets dans les noms d'événements LWC custom",
      "detail doit être sérialisable si bubbles:true + composed:true — éviter les fonctions dans detail",
      "dispatchEvent est synchrone — l'événement est traité immédiatement, pas dans un tick suivant",
    ],
  },

  {
    id: "lwc-11-event-bubbling",
    title: "Event bubbling & composed — traverser le Shadow DOM",
    category: "LWC Events & Communication",
    tags: ["lwc", "events", "bubbling", "composed", "shadow-dom"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## bubbles et composed dans LWC

### Les 3 modes de propagation

\`\`\`javascript
// Mode 1 : Événement local (défaut)
new CustomEvent('change', { bubbles: false, composed: false })

// Mode 2 : Bubbles dans le light DOM
new CustomEvent('change', { bubbles: true, composed: false })

// Mode 3 : Traversée complète
new CustomEvent('change', { bubbles: true, composed: true })
\`\`\`

### Visualisation de la propagation

\`\`\`
Structure DOM :
  <c-page>
    <c-section>
      <c-button>
        <button onclick="...">  ← dispatche l'event

bubbles:false, composed:false  → event reste dans <c-button>
bubbles:true,  composed:false  → event remonte dans <c-button> shadow DOM seulement
bubbles:true,  composed:true   → event traverse tout : <c-button> → <c-section> → <c-page>
\`\`\`

### Retargeting — sécurité du Shadow DOM

Quand un événement traverse un shadow boundary, son \`event.target\` est **retargeté** :

\`\`\`javascript
// Dans c-section, si tu écoutes 'buttonactivated'
handleButtonActivated(event) {
  // event.target pointe vers c-button (le composant)
  // PAS vers le <button> interne de c-button (masqué par le shadow)
  console.log(event.target); // <c-button>
}
\`\`\`

### Événements natifs et composed

Les événements natifs du navigateur (click, input, change...) ont \`composed: true\` par défaut — ils traversent les shadow boundaries.`,
    tsAnalogy: `## Analogie React / Vue

React n'a pas de Shadow DOM, tous les événements remontent simplement dans la hiérarchie React. Vue — les événements custom (emit) ne bubblent PAS par défaut. Le concept de shadow boundary qui stoppe la propagation est **unique à LWC/Web Components**.`,
    gotchas: [
      "composed: true sans bubbles: true ne fait rien — composed n'a de sens que si l'événement bubble d'abord",
      "event.target est retargeté automatiquement quand un événement traverse un shadow boundary",
      "Les événements natifs (click, input) ont composed: true par défaut — ils traversent les shadow boundaries sans configuration",
      "stopPropagation() dans un enfant bloque la remontée même avec bubbles:true",
    ],
  },

  {
    id: "lwc-12-parent-to-child-api",
    title: "Communication parent→enfant via @api methods",
    category: "LWC Events & Communication",
    tags: ["lwc", "@api", "parent-child", "imperative", "template-ref"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Communication parent → enfant

### Via les @api props (déclaratif — recommandé)

\`\`\`javascript
// enfant.js
export default class SearchBar extends LightningElement {
  @api searchTerm = '';
  @api placeholder = 'Rechercher...';
  @api disabled = false;
}
\`\`\`

\`\`\`html
<!-- parent.html -->
<c-search-bar
  search-term={currentSearch}
  placeholder="Chercher un contact"
  disabled={isLoading}
></c-search-bar>
\`\`\`

### Via les @api methods (impératif)

\`\`\`javascript
// enfant.js
export default class FormComponent extends LightningElement {
  @api
  reset() {
    this.template.querySelectorAll('input').forEach(input => {
      input.value = '';
    });
  }

  @api
  validate() {
    const inputs = this.template.querySelectorAll('lightning-input');
    const allValid = [...inputs].every(input => input.reportValidity());
    return { isValid: allValid };
  }
}
\`\`\`

\`\`\`javascript
// parent.js
export default class Wizard extends LightningElement {
  handleNext() {
    const form = this.template.querySelector('c-form-component');
    const { isValid } = form.validate();
    if (isValid) {
      this.goToNextStep();
    }
  }

  handleCancel() {
    this.template.querySelector('c-form-component').reset();
  }
}
\`\`\`

### Timing : accès aux enfants dans le lifecycle

\`\`\`javascript
connectedCallback() {
  // ❌ Trop tôt — les enfants ne sont pas encore renderés
  const child = this.template.querySelector('c-child'); // null
}

renderedCallback() {
  // ✅ Après le premier render — les enfants existent
  const child = this.template.querySelector('c-child');
  child.focus();
}
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`javascript
// Vue 3 — defineExpose + template ref
// Dans l'enfant
defineExpose({ reset, validate });

// Dans le parent
const form = ref(null); // <c-form ref="form">
form.value.validate();

// LWC — @api methods + querySelector (le plus proche de Vue)
const form = this.template.querySelector('c-form-component');
form.validate();
\`\`\`

**LWC ≈ Vue template ref** : en Vue tu nommes la ref, en LWC tu utilises un sélecteur CSS.`,
    gotchas: [
      "querySelector ne fonctionne qu'après le premier render — ne jamais appeler dans constructor() ou connectedCallback()",
      "Si plusieurs instances du même composant existent, querySelector retourne la PREMIÈRE — utiliser data-id pour distinguer",
      "this.template.querySelector('c-mon-composant') cherche dans le shadow, this.querySelector() cherche dans le light DOM",
      "Appeler une méthode @api sur un composant non rendu (lwc:if=false) retourne null — toujours vérifier avant l'appel",
    ],
  },

  {
    id: "lwc-13-lms",
    title: "Lightning Message Service (LMS) — communication cross-component",
    category: "LWC Events & Communication",
    tags: ["lwc", "lms", "message-service", "cross-component", "pubsub"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Lightning Message Service (LMS)

LMS est le mécanisme de communication entre **composants non-liés hiérarchiquement**.

### Étape 1 : Créer un Message Channel

\`\`\`xml
<!-- force-app/main/default/messageChannels/ContactSelected__c.messageChannel-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningMessageChannel xmlns="http://soap.sforce.com/2006/04/metadata">
  <masterLabel>Contact Selected</masterLabel>
  <isExposed>true</isExposed>
  <lightningMessageFields>
    <fieldName>contactId</fieldName>
  </lightningMessageFields>
  <lightningMessageFields>
    <fieldName>contactName</fieldName>
  </lightningMessageFields>
</LightningMessageChannel>
\`\`\`

### Étape 2 : Publisher (émetteur)

\`\`\`javascript
import { LightningElement, wire } from 'lwc';
import { MessageContext, publish } from 'lightning/messageService';
import CONTACT_SELECTED_CHANNEL from '@salesforce/messageChannel/ContactSelected__c';

export default class ContactList extends LightningElement {
  @wire(MessageContext)
  messageContext;

  handleContactClick(event) {
    const { contactId, contactName } = event.currentTarget.dataset;
    publish(this.messageContext, CONTACT_SELECTED_CHANNEL, { contactId, contactName });
  }
}
\`\`\`

### Étape 3 : Subscriber (récepteur)

\`\`\`javascript
import { LightningElement, wire } from 'lwc';
import { MessageContext, subscribe, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import CONTACT_SELECTED_CHANNEL from '@salesforce/messageChannel/ContactSelected__c';

export default class ContactDetail extends LightningElement {
  @wire(MessageContext)
  messageContext;

  subscription = null;

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext,
      CONTACT_SELECTED_CHANNEL,
      (message) => this.handleMessage(message),
      { scope: APPLICATION_SCOPE }
    );
  }

  handleMessage(message) {
    this.selectedContactId = message.contactId;
  }

  disconnectedCallback() {
    // ⚠️ OBLIGATOIRE — se désabonner pour éviter les memory leaks
    unsubscribe(this.subscription);
    this.subscription = null;
  }
}
\`\`\`

### Scopes LMS

| Scope | Comportement |
|---|---|
| \`DEFAULT_SCOPE\` | Composants dans le même "espace actif" (même onglet) |
| \`APPLICATION_SCOPE\` | TOUS les composants abonnés, tous contextes |`,
    tsAnalogy: `## Analogie React / Vue

\`\`\`javascript
// Vue 3 — Event Bus avec mitt
import mitt from 'mitt';
const emitter = mitt();

emitter.emit('contact-selected', { contactId, contactName });
emitter.on('contact-selected', ({ contactId }) => { ... });

// OU Pinia (state management)
// LMS ≈ Event Bus typé + scope configurable + compatibilité Aura
\`\`\`

**LMS ≈ Event Bus** (mitt, EventEmitter) mais avec un Message Channel typé (déclaré en XML), scope configurable, et compatibilité Aura ↔ LWC.`,
    gotchas: [
      "Toujours unsubscribe dans disconnectedCallback — sinon memory leak",
      "APPLICATION_SCOPE permet de recevoir les messages de TOUS les contextes — peut causer des effets inattendus",
      "Le Message Channel doit être déployé dans l'org avant d'être utilisable",
      "@wire(MessageContext) est obligatoire — on ne peut pas créer un MessageContext manuellement",
    ],
  },

  {
    id: "lwc-14-pubsub-legacy",
    title: "Pub/Sub pattern legacy — l'alternative avant LMS",
    category: "LWC Events & Communication",
    tags: ["lwc", "pubsub", "legacy", "events", "pattern"],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `## Pub/Sub Pattern Legacy

Avant LMS (API < 44), la communication cross-composant en LWC se faisait via un module utilitaire Pub/Sub custom.

### Le module pubsub

\`\`\`javascript
// pubsub.js — utilitaire à copier dans le projet
const events = {};

const register = (eventName, callback) => {
  if (!events[eventName]) events[eventName] = [];
  events[eventName].push(callback);
};

const unregister = (eventName, callback) => {
  if (events[eventName]) {
    events[eventName] = events[eventName].filter(cb => cb !== callback);
  }
};

const fire = (eventName, payload) => {
  if (events[eventName]) {
    events[eventName].forEach(cb => cb(payload));
  }
};

export { register, unregister, fire };
\`\`\`

### Usage (legacy)

\`\`\`javascript
// Publisher
import { fire } from 'c/pubsub';
fire('CONTACT_SELECTED', { contactId: '001xxx' });

// Subscriber
import { register, unregister } from 'c/pubsub';

connectedCallback() {
  register('CONTACT_SELECTED', this.handleContactSelected);
}
disconnectedCallback() {
  unregister('CONTACT_SELECTED', this.handleContactSelected);
}
handleContactSelected = (payload) => {
  this.contactId = payload.contactId;
};
\`\`\`

### Pourquoi migrer vers LMS

| Critère | Pub/Sub custom | LMS |
|---|---|---|
| Types des messages | Non typée | Message Channel XML typé |
| Scoping | Global | Configurable |
| Interop Aura | Non | Oui |
| Support Salesforce | Non (open source) | Oui (plateforme native) |`,
    tsAnalogy: `Le Pub/Sub Salesforce est identique à un simple EventEmitter Node.js ou à mitt/tiny-emitter. Pattern universel, rien de spécifique à Salesforce.`,
    gotchas: [
      "Ne pas oublier unregister dans disconnectedCallback — sinon les handlers s'accumulent",
      "Les événements Pub/Sub ne sont pas typés — risque d'erreurs silencieuses",
      "En production, préférer LMS — le Pub/Sub custom n'est plus maintenu activement par Salesforce",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC DATA
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-15-wire-decorator",
    title: "@wire decorator — reactive data fetching déclaratif",
    category: "LWC Data",
    tags: ["lwc", "@wire", "reactive", "data-fetching", "apex"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Le decorator @wire

\`@wire\` est le mécanisme de **data fetching déclaratif** de LWC. Il connecte un composant à une source de données et re-render automatiquement quand les données changent.

### Syntaxe de base

\`\`\`javascript
import { LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';

export default class AccountInfo extends LightningElement {
  @api recordId;

  @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
  account;
  // account.data → les données si succès
  // account.error → l'erreur si échec

  get accountName() {
    return this.account.data?.fields?.Name?.value ?? 'Chargement...';
  }
}
\`\`\`

### Wire sur une fonction — pour contrôler le traitement

\`\`\`javascript
@wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
wiredAccount({ data, error }) {
  if (data) {
    this.name = data.fields.Name.value;
    this.isLoading = false;
  } else if (error) {
    this.error = error;
    this.isLoading = false;
  }
}
\`\`\`

### Réactivité des paramètres wire — le préfixe '$'

\`\`\`javascript
export default class SearchComponent extends LightningElement {
  searchTerm = '';

  // '$searchTerm' → wire se re-déclenche quand searchTerm change
  @wire(searchContacts, { searchKey: '$searchTerm' })
  contacts;

  // Sans '$' → valeur statique, ne change jamais
  @wire(getAccount, { recordId: 'somehardcodedId' })
  staticAccount;

  handleSearch(event) {
    this.searchTerm = event.target.value; // → déclenche re-fetch automatique
  }
}
\`\`\`

### Quand wire ne se déclenche pas

\`\`\`javascript
// Si un paramètre réactif est undefined → wire NE s'exécute PAS
@api recordId; // si recordId est undefined au départ

@wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
account;
// Si recordId = undefined → pas de fetch
// Dès que recordId a une valeur → fetch déclenché
\`\`\``,
    tsAnalogy: `## Analogie TanStack Query

\`\`\`javascript
// React — useQuery
const { data: account, error } = useQuery({
  queryKey: ['account', recordId],
  queryFn: () => fetchAccount(recordId),
  enabled: !!recordId,
});

// LWC @wire
@wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
account;
\`\`\`

**LWC @wire ≈ useQuery** : déclaratif, réactif, cache intégré (via LDS), état loading/error/data géré automatiquement.`,
    gotchas: [
      "Le préfixe '$' dans les paramètres wire est OBLIGATOIRE pour la réactivité — sans '$', la valeur est figée",
      "wire ne se déclenche PAS si un paramètre avec '$' est undefined ou null",
      "wire sur une property → this.account est l'objet { data, error } — wire sur une fonction → data et error sont directement disponibles",
      "On ne peut PAS appeler dispatchEvent dans une wire function — l'accès au template n'est pas garanti",
    ],
  },

  {
    id: "lwc-16-wire-adapters",
    title:
      "Wire adapters built-in — getRecord, getFieldValue, getRecordNotifyChange",
    category: "LWC Data",
    tags: ["lwc", "wire", "getRecord", "lds", "uiRecordApi"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Wire Adapters Built-in — lightning/uiRecordApi

### getRecord — lire un record Salesforce

\`\`\`javascript
import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_PHONE from '@salesforce/schema/Account.Phone';

export default class AccountDetail extends LightningElement {
  @api recordId;

  @wire(getRecord, {
    recordId: '$recordId',
    fields: [ACCOUNT_NAME, ACCOUNT_PHONE]
  })
  account;

  get name() {
    return getFieldValue(this.account.data, ACCOUNT_NAME);
  }

  get phone() {
    return getFieldValue(this.account.data, ACCOUNT_PHONE);
  }
}
\`\`\`

### getRecord avec optionalFields

\`\`\`javascript
// fields → obligatoires, wire échoue si inaccessibles (FLS)
// optionalFields → optionnels, wire réussit même si inaccessibles
@wire(getRecord, {
  recordId: '$recordId',
  fields: [ACCOUNT_NAME],
  optionalFields: [ACCOUNT_PHONE]
})
account;
\`\`\`

### getRecordNotifyChange — invalider le cache LDS

\`\`\`javascript
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

handleSave() {
  updateRecordViaApex({ recordId: this.recordId, data: this.formData })
    .then(() => {
      // Force LDS à refetcher et notifier tous les composants
      getRecordNotifyChange([{ recordId: this.recordId }]);
    });
}
\`\`\`

### Autres wire adapters utiles

\`\`\`javascript
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';

@wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
accountInfo;

@wire(getPicklistValues, {
  recordTypeId: '$accountInfo.data.defaultRecordTypeId',
  fieldApiName: ACCOUNT_RATING
})
ratingPicklistValues;
\`\`\``,
    tsAnalogy: `\`getRecordNotifyChange\` ≈ \`queryClient.invalidateQueries()\` de TanStack Query — invalide le cache et force un refetch pour tous les composants qui observent ce record.`,
    gotchas: [
      "Toujours importer les champs via @salesforce/schema/Object.Field — éviter les strings hardcodées 'Account.Name' qui cassent si le champ est renommé",
      "getFieldValue retourne undefined (pas null) si la donnée n'est pas encore chargée",
      "fields vs optionalFields : avec fields, si un champ est inaccessible pour le profil, toute la requête échoue",
      "getRecordNotifyChange est crucial après un Apex impératif — sans ça, les autres composants gardent les données obsolètes",
    ],
  },

  {
    id: "lwc-17-wire-to-apex",
    title: "Wire to Apex — @wire(apexMethod, { params })",
    category: "LWC Data",
    tags: ["lwc", "wire", "apex", "cacheable", "server"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## @wire avec les méthodes Apex

### Configuration côté Apex (obligatoire)

\`\`\`apex
public class ContactController {
  // @AuraEnabled(cacheable=true) OBLIGATOIRE pour utiliser @wire
  @AuraEnabled(cacheable=true)
  public static List<Contact> getContactsByAccount(Id accountId) {
    return [
      SELECT Id, Name, Email, Phone
      FROM Contact
      WHERE AccountId = :accountId
      ORDER BY Name
    ];
  }
}
\`\`\`

### Import et usage dans LWC

\`\`\`javascript
import { LightningElement, api, wire } from 'lwc';
import getContactsByAccount from '@salesforce/apex/ContactController.getContactsByAccount';

export default class ContactList extends LightningElement {
  @api recordId;

  @wire(getContactsByAccount, { accountId: '$recordId' })
  contacts;
  // contacts.data → List<Contact> si succès
  // contacts.error → error object si échec
}
\`\`\`

\`\`\`html
<template>
  <template lwc:if={contacts.data}>
    <ul>
      <template for:each={contacts.data} for:item="contact">
        <li key={contact.Id}>{contact.Name} — {contact.Email}</li>
      </template>
    </ul>
  </template>
  <template lwc:elseif={contacts.error}>
    <p class="error">{contacts.error.body.message}</p>
  </template>
  <template lwc:else>
    <lightning-spinner alternative-text="Chargement..."></lightning-spinner>
  </template>
</template>
\`\`\`

### Rafraîchir un wire Apex

\`\`\`javascript
import { refreshApex } from '@salesforce/apex';

export default class ContactList extends LightningElement {
  @api recordId;
  wiredContactsResult;

  @wire(getContactsByAccount, { accountId: '$recordId' })
  wiredContacts(result) {
    this.wiredContactsResult = result;
    if (result.data) this.contacts = result.data;
  }

  handleRefresh() {
    return refreshApex(this.wiredContactsResult);
  }
}
\`\`\``,
    tsAnalogy: `\`refreshApex()\` ≈ \`refetch()\` de useQuery (TanStack) — invalide le cache et force un nouveau fetch vers le serveur.`,
    gotchas: [
      "@AuraEnabled(cacheable=true) est OBLIGATOIRE pour @wire — une méthode sans cacheable=true avec @wire génère une erreur",
      "cacheable=true interdit les DML (insert/update/delete) dans la méthode Apex",
      "refreshApex nécessite de stocker la référence wire dans une variable de classe",
      "Le cache Apex via @wire est stocké côté client — appeler refreshApex après une mutation pour voir les changements",
      "Les paramètres undefined ne déclenchent pas le wire Apex",
    ],
  },

  {
    id: "lwc-18-imperative-apex",
    title: "Appels Apex impératifs — import et call direct",
    category: "LWC Data",
    tags: ["lwc", "apex", "imperative", "promise", "async"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Appels Apex impératifs

Contrairement à @wire (déclaratif), les appels impératifs permettent de contrôler **quand** l'appel Apex se produit.

### Avec async/await (recommandé)

\`\`\`javascript
import { LightningElement } from 'lwc';
import createContact from '@salesforce/apex/ContactController.createContact';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

export default class ContactCreator extends LightningElement {
  isLoading = false;
  error = null;

  async handleSave() {
    this.isLoading = true;
    this.error = null;

    try {
      const contact = await createContact({
        name: this.name,
        accountId: this.recordId,
      });

      getRecordNotifyChange([{ recordId: contact.Id }]);

      this.dispatchEvent(new CustomEvent('contactcreated', {
        detail: { contactId: contact.Id }
      }));
    } catch (error) {
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }
}
\`\`\`

### Gestion d'erreurs Apex

\`\`\`javascript
.catch((error) => {
  if (error.body) {
    // Erreur Apex (AuraHandledException, etc.)
    const message = error.body.message;
    const fieldErrors = error.body.fieldErrors; // validation rules
  } else {
    // Erreur réseau ou autre
    console.error('Erreur inattendue:', error);
  }
})
\`\`\``,
    tsAnalogy: `Les appels Apex impératifs sont exactement comme des appels API REST — asynchrones, retournent une Promise, à gérer avec try/catch ou .then/.catch.`,
    gotchas: [
      "Les méthodes Apex pour appels impératifs NE NÉCESSITENT PAS cacheable=true — contrairement à @wire",
      "Les paramètres Apex sont passés comme un objet JS { paramName: value } — les noms doivent correspondre exactement aux noms Apex",
      "Ne pas oublier de gérer le finally pour remettre isLoading = false",
      "error.body.message pour les AuraHandledException Apex — error.message pour les erreurs JS — ne pas confondre",
    ],
  },

  {
    id: "lwc-19-wire-vs-imperative",
    title: "Wire vs Imperative Apex — arbre de décision",
    category: "LWC Data",
    tags: ["lwc", "wire", "apex", "decision", "pattern"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Wire vs Appels Impératifs — quand utiliser quoi

### Arbre de décision

\`\`\`
Besoin d'appeler Apex ?
│
├─ READ (lecture de données) ?
│   ├─ Les données doivent se rafraîchir quand des @api props changent ?
│   │   └─ OUI → @wire (réactif automatiquement avec '$param')
│   │
│   └─ L'appel doit se produire sur une action utilisateur (clic, recherche) ?
│       └─ OUI → Impératif (tu contrôles le déclenchement)
│
└─ WRITE (create/update/delete) ?
    └─ TOUJOURS Impératif (cacheable=true interdit le DML)
\`\`\`

### Tableau comparatif

| Critère | @wire | Impératif |
|---|---|---|
| **Déclenchement** | Automatique (au mount + quand params changent) | Manuel (sur action/événement) |
| **DML (insert/update/delete)** | ❌ Interdit | ✅ Oui |
| **Cache LDS** | ✅ Automatique | ❌ Manuel |
| **Réactivité aux props** | ✅ Via '$param' | ❌ Manuel |
| **Compatibilité** | cacheable=true requis | @AuraEnabled suffisant |

### Pattern hybride (recommandé)

\`\`\`javascript
export default class ContactManager extends LightningElement {
  @api recordId;

  // @wire pour le chargement initial et réactivité
  @wire(getContactsByAccount, { accountId: '$recordId' })
  wiredContacts;

  // Impératif pour les modifications
  async handleDelete(event) {
    const contactId = event.detail.contactId;
    await deleteContactApex({ contactId });
    await refreshApex(this.wiredContacts);
  }
}
\`\`\``,
    tsAnalogy: `\`\`\`javascript
// @wire ≈ useQuery (TanStack) — déclaratif, cache, réactif
// Impératif ≈ useMutation (TanStack) — contrôle total
// Pattern hybride : useQuery + useMutation + invalidateQueries
// C'est exactement le pattern @wire + Apex impératif + refreshApex
\`\`\``,
    gotchas: [
      "@wire avec cacheable=true peut retourner des données obsolètes — appeler refreshApex après une mutation",
      "Ne jamais mettre de logique de mutation dans une méthode Apex marquée cacheable=true",
      "refreshApex est asynchrone — toujours await pour éviter les race conditions",
    ],
  },

  {
    id: "lwc-20-lds",
    title:
      "Lightning Data Service (LDS) — createRecord, updateRecord, deleteRecord",
    category: "LWC Data",
    tags: ["lwc", "lds", "cache", "uiRecordApi", "crud"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Lightning Data Service (LDS)

LDS est le **cache client-side** de Salesforce. Quand un composant modifie un record via LDS, tous les composants qui ont wired ce record voient les données mises à jour automatiquement.

### createRecord

\`\`\`javascript
import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Contact.LastName';
import ACCOUNT_FIELD from '@salesforce/schema/Contact.AccountId';

export default class ContactCreator extends LightningElement {
  @api accountId;

  async handleCreate() {
    const fields = {};
    fields[NAME_FIELD.fieldApiName] = this.lastName;
    fields[ACCOUNT_FIELD.fieldApiName] = this.accountId;

    const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };

    try {
      const record = await createRecord(recordInput);
      console.log('Créé:', record.id);
    } catch (error) {
      console.error('Erreur:', error.body.message);
    }
  }
}
\`\`\`

### updateRecord

\`\`\`javascript
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Contact.Id';

async handleUpdate() {
  const fields = {};
  fields[ID_FIELD.fieldApiName] = this.recordId; // ID obligatoire
  fields[NAME_FIELD.fieldApiName] = this.newName;

  try {
    await updateRecord({ fields });
  } catch (error) {
    console.error(error.body.fieldErrors);
  }
}
\`\`\`

### deleteRecord

\`\`\`javascript
import { deleteRecord } from 'lightning/uiRecordApi';

async handleDelete() {
  try {
    await deleteRecord(this.recordId);
    this.dispatchEvent(new CustomEvent('recorddeleted'));
  } catch (error) {
    console.error('Suppression impossible:', error.body.message);
  }
}
\`\`\``,
    tsAnalogy: `**LDS est le TanStack Query de Salesforce** — cache normalisé, invalidation automatique, partage entre composants. La différence : LDS est spécifique aux records Salesforce.`,
    gotchas: [
      "LDS respecte les FLS (Field-Level Security) — si l'user n'a pas accès à un champ, LDS ne le retourne pas",
      "updateRecord nécessite l'ID dans fields — oublier fields[ID_FIELD.fieldApiName] génère une erreur",
      "LDS a une limite de taille de cache — dans les pages complexes, le cache peut être vidé (LRU eviction)",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC NAVIGATION & UI
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-21-navigation-mixin",
    title: "NavigationMixin — navigation programmatique",
    category: "LWC Navigation & UI",
    tags: ["lwc", "navigation", "mixin", "routing"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## NavigationMixin

NavigationMixin permet de naviguer programmatiquement dans Salesforce.

### Setup

\`\`\`javascript
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class MyComponent extends NavigationMixin(LightningElement) {
  navigateToAccount() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.accountId,
        objectApiName: 'Account',
        actionName: 'view',
      },
    });
  }
}
\`\`\`

### Types de page courants

\`\`\`javascript
// Record Page
this[NavigationMixin.Navigate]({
  type: 'standard__recordPage',
  attributes: { recordId: '001xxx', objectApiName: 'Account', actionName: 'view' },
});

// Object Home Page (liste)
this[NavigationMixin.Navigate]({
  type: 'standard__objectPage',
  attributes: { objectApiName: 'Contact', actionName: 'list' },
  state: { filterName: 'Recent' },
});

// URL externe
this[NavigationMixin.Navigate]({
  type: 'standard__webPage',
  attributes: { url: 'https://salesforce.com' },
});

// Named Page
this[NavigationMixin.Navigate]({
  type: 'standard__namedPage',
  attributes: { pageName: 'home' },
});
\`\`\`

### GenerateUrl — obtenir l'URL sans naviguer

\`\`\`javascript
async getAccountUrl() {
  const url = await this[NavigationMixin.GenerateUrl]({
    type: 'standard__recordPage',
    attributes: { recordId: this.accountId, objectApiName: 'Account', actionName: 'view' },
  });
  this.accountUrl = url;
}
\`\`\``,
    tsAnalogy: `\`\`\`javascript
// React Router
navigate('/accounts/' + accountId);

// Vue Router
router.push({ name: 'account-detail', params: { id: accountId } });

// LWC NavigationMixin — navigue dans l'application Salesforce complète
this[NavigationMixin.Navigate]({ type: 'standard__recordPage', ... });
\`\`\``,
    gotchas: [
      "NavigationMixin doit wrapper LightningElement — class Foo extends NavigationMixin(LightningElement)",
      "this[NavigationMixin.Navigate] utilise des bracket notation (propriété symbolique) — erreur de syntaxe courante",
      "GenerateUrl retourne une Promise — toujours await ou .then()",
    ],
  },

  {
    id: "lwc-22-toast",
    title: "Toast messages — ShowToastEvent",
    category: "LWC Navigation & UI",
    tags: ["lwc", "toast", "notification", "ui"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `## ShowToastEvent — notifications utilisateur

\`\`\`javascript
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MyComponent extends LightningElement {

  showSuccess() {
    this.dispatchEvent(new ShowToastEvent({
      title: 'Succès !',
      message: 'Le record a été sauvegardé.',
      variant: 'success', // 'success', 'error', 'warning', 'info'
      mode: 'dismissable', // 'dismissable', 'sticky', 'pester'
    }));
  }

  showWithLink() {
    this.dispatchEvent(new ShowToastEvent({
      title: 'Record créé',
      message: 'Voir le record {0}',
      messageData: [{
        url: '/lightning/r/Contact/' + this.newContactId + '/view',
        label: 'ici',
      }],
      variant: 'success',
    }));
  }
}
\`\`\`

### Variants et modes

| Variant | Usage |
|---|---|
| \`success\` | Opération réussie |
| \`error\` | Erreur |
| \`warning\` | Attention |
| \`info\` (défaut) | Information neutre |

| Mode | Comportement |
|---|---|
| \`dismissable\` (défaut) | Disparaît après quelques secondes |
| \`sticky\` | Reste jusqu'à click sur X |
| \`pester\` | Disparaît automatiquement, pas de X |`,
    tsAnalogy: `C'est l'équivalent de \`toast.success('Message')\` dans react-toastify, vue-sonner, ou Chakra UI toast — mais via un événement DOM plutôt qu'un appel direct.`,
    gotchas: [
      "ShowToastEvent bubble jusqu'à la page Salesforce — il n'est pas nécessaire de le catcher dans le parent",
      "ShowToastEvent ne fonctionne pas dans les tests unitaires Jest sans mock de 'lightning/platformShowToastEvent'",
      "Le mode 'sticky' est intrusif — réserver aux erreurs critiques",
    ],
  },

  {
    id: "lwc-23-modal",
    title: "Modal — LightningModal (nouveau pattern)",
    category: "LWC Navigation & UI",
    tags: ["lwc", "modal", "dialog", "lightningmodal"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `## LightningModal — le nouveau pattern de modales (API 55+)

### Créer un composant modal

\`\`\`javascript
// confirmModal.js
import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ConfirmModal extends LightningModal {
  @api message = 'Êtes-vous sûr ?';
  @api confirmLabel = 'Confirmer';
  @api cancelLabel = 'Annuler';

  handleConfirm() {
    this.close('confirm'); // ferme et retourne la valeur
  }

  handleCancel() {
    this.close('cancel');
  }
}
\`\`\`

\`\`\`html
<!-- confirmModal.html -->
<template>
  <lightning-modal-header label="Confirmation"></lightning-modal-header>
  <lightning-modal-body>
    <p>{message}</p>
  </lightning-modal-body>
  <lightning-modal-footer>
    <lightning-button label={cancelLabel} onclick={handleCancel}></lightning-button>
    <lightning-button label={confirmLabel} variant="brand" onclick={handleConfirm}></lightning-button>
  </lightning-modal-footer>
</template>
\`\`\`

### Ouvrir la modale depuis le parent

\`\`\`javascript
import { LightningElement } from 'lwc';
import ConfirmModal from 'c/confirmModal';

export default class DeleteButton extends LightningElement {
  async handleDeleteClick() {
    const result = await ConfirmModal.open({
      size: 'small', // 'small', 'medium', 'large', 'full'
      message: 'Supprimer ce contact définitivement ?',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
    });

    if (result === 'confirm') {
      await this.deleteRecord();
    }
  }
}
\`\`\``,
    tsAnalogy: `C'est le pattern de \`dialog.open()\` ou de modales promise-based comme \`sweetalert2\` — la modale retourne une Promise qui se résout quand l'user prend une décision.`,
    gotchas: [
      "LightningModal extends LightningModal (pas LightningElement) — erreur courante",
      "this.close(value) ferme la modale ET résout la Promise dans l'appelant avec 'value'",
      "LightningModal.open() retourne une Promise — toujours await",
      "Le composant modal doit avoir isExposed: false dans son .js-meta.xml",
    ],
  },

  {
    id: "lwc-24-base-components",
    title:
      "Lightning base components — lightning-input, lightning-datatable, lightning-card",
    category: "LWC Navigation & UI",
    tags: ["lwc", "lightning", "base-components", "ui", "slds"],
    difficulty: "beginner",
    certRelevance: ["PD1"],
    content: `## Lightning Base Components

Salesforce fournit +150 composants LWC prêts à l'emploi — tout commence par \`lightning-\`.

### Composants d'input courants

\`\`\`html
<lightning-input
  label="Nom"
  type="text"
  value={name}
  required
  max-length="80"
  onchange={handleNameChange}
></lightning-input>

<!-- Types disponibles : text, number, email, phone, date, datetime, time,
     checkbox, toggle, search, url, color, range -->

<lightning-combobox
  label="Statut"
  value={selectedStatus}
  options={statusOptions}
  onchange={handleStatusChange}
></lightning-combobox>
\`\`\`

\`\`\`javascript
get statusOptions() {
  return [
    { label: 'Actif', value: 'active' },
    { label: 'Inactif', value: 'inactive' },
  ];
}
\`\`\`

### lightning-card — conteneur avec header

\`\`\`html
<lightning-card title="Mes Contacts" icon-name="standard:contact">
  <div slot="actions">
    <lightning-button label="Nouveau" onclick={handleNew}></lightning-button>
  </div>
  <div class="slds-var-p-around_medium">
    <!-- contenu de la card -->
  </div>
</lightning-card>
\`\`\`

### lightning-datatable — table de données

\`\`\`javascript
export default class ContactTable extends LightningElement {
  columns = [
    { label: 'Nom', fieldName: 'Name', type: 'text', sortable: true },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    {
      type: 'action',
      typeAttributes: {
        rowActions: [
          { label: 'Voir', name: 'view' },
          { label: 'Éditer', name: 'edit' },
          { label: 'Supprimer', name: 'delete' },
        ]
      }
    },
  ];

  handleRowAction(event) {
    const { action, row } = event.detail;
    switch (action.name) {
      case 'view':   this.navigateToRecord(row.Id); break;
      case 'delete': this.handleDelete(row.Id); break;
    }
  }
}
\`\`\`

\`\`\`html
<lightning-datatable
  key-field="Id"
  data={contacts}
  columns={columns}
  onrowaction={handleRowAction}
></lightning-datatable>
\`\`\``,
    tsAnalogy: `Les \`lightning-*\` composants sont l'équivalent d'une design system library comme MUI pour React ou Vuetify pour Vue — préconfigurés pour l'UX Salesforce (SLDS design system) et avec accessibilité WCAG intégrée.`,
    gotchas: [
      "lightning-input onchange donne event.target.value pour les inputs texte mais event.detail.value pour certains types",
      "lightning-datatable key-field doit être unique — oublier key-field = erreur console",
      "Les lightning-* components ne peuvent pas être stylés avec des sélecteurs CSS directs — utiliser les CSS custom properties SLDS",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-26-lifecycle",
    title:
      "Lifecycle LWC — constructor → connectedCallback → renderedCallback → disconnectedCallback",
    category: "LWC Lifecycle",
    tags: ["lwc", "lifecycle", "hooks", "constructor", "connectedCallback"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `## Lifecycle des composants LWC

### Séquence complète

\`\`\`
1. constructor()           → Création de l'instance (avant insertion dans le DOM)
2. @api props setters      → Les props publiques sont set par le parent
3. connectedCallback()     → Insertion dans le DOM (comparable à mount)
4. render()                → Génération du VDOM (implicite)
5. [Rendu des enfants]     → Les composants enfants passent par leur lifecycle
6. renderedCallback()      → Après chaque render (initial + updates)
7. disconnectedCallback()  → Retrait du DOM (comparable à unmount)
\`\`\`

### Implémentation

\`\`\`javascript
import { LightningElement, api } from 'lwc';

export default class LifecycleDemo extends LightningElement {
  @api recordId;
  isInitialized = false;

  constructor() {
    super(); // OBLIGATOIRE — toujours la première ligne
    // ❌ PAS d'accès au DOM (this.template est null)
    // ❌ PAS d'accès aux @api props (pas encore set)
    // ✅ Initialiser des propriétés privées
  }

  connectedCallback() {
    // ✅ DOM existe MAIS les enfants ne sont pas encore renderés
    // ✅ Accès aux @api props ici
    // ✅ Ajouter des event listeners
    // ✅ Appels Apex impératifs d'initialisation
    this.loadInitialData();
  }

  renderedCallback() {
    // ✅ Accès au DOM et aux enfants renderés
    // ⚠️ S'exécute après CHAQUE render
    // ⚠️ Ne jamais changer des propriétés réactives ICI sans guard (boucle infinie !)

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.template.querySelector('.scroll-container')?.scrollTo(0, 0);
    }
  }

  disconnectedCallback() {
    // ✅ Nettoyer les event listeners ajoutés dans connectedCallback
    // ✅ Annuler les timers/intervals
    // ✅ Unsubscribe LMS, Pub/Sub
    clearInterval(this.refreshInterval);
    this.unsubscribeFromLMS();
  }
}
\`\`\`

### Ordre dans une hiérarchie parent-enfant

\`\`\`
Parent constructor
Parent connectedCallback
  Enfant constructor
  Enfant connectedCallback
  Enfant renderedCallback
Parent renderedCallback

// Déconnexion :
Enfant disconnectedCallback
Parent disconnectedCallback
\`\`\`

### Piège courant : boucle infinie dans renderedCallback

\`\`\`javascript
// ❌ BOUCLE INFINIE
renderedCallback() {
  this.count++; // change une propriété réactive → re-render → renderedCallback → ...
}

// ✅ Correct — un flag pour les opérations one-shot
renderedCallback() {
  if (this.isInitialized) return;
  this.isInitialized = true;
  // logique d'init DOM
}
\`\`\``,
    tsAnalogy: `## Analogie React / Vue

\`\`\`
LWC                      │ React Hooks              │ Vue 3 Composition API
─────────────────────────┼──────────────────────────┼──────────────────────────
constructor()            │ useState init            │ setup() début
connectedCallback()      │ useEffect(fn, [])        │ onMounted()
renderedCallback()       │ useEffect(fn)            │ onUpdated()
disconnectedCallback()   │ useEffect cleanup return │ onUnmounted()
\`\`\``,
    gotchas: [
      "super() OBLIGATOIRE dans constructor() et doit être la PREMIÈRE ligne",
      "this.template est null dans constructor() — ne jamais accéder au DOM dans constructor",
      "Les @api props NE SONT PAS disponibles dans constructor() — elles sont setées après la construction",
      "renderedCallback s'exécute après CHAQUE render — utiliser un flag isInitialized pour les effets one-shot",
      "Ne jamais modifier des propriétés réactives directement dans renderedCallback sans guard — boucle infinie garantie",
    ],
  },

  {
    id: "lwc-28-error-callback",
    title: "errorCallback — error boundary LWC",
    category: "LWC Lifecycle",
    tags: ["lwc", "error", "errorcallback", "error-boundary", "lifecycle"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `## errorCallback — gestion des erreurs de rendu

\`errorCallback\` capture les erreurs qui se produisent dans les composants **descendants** pendant le lifecycle de rendu.

### Implémentation

\`\`\`javascript
import { LightningElement } from 'lwc';

export default class ErrorBoundary extends LightningElement {
  hasError = false;
  errorMessage = '';

  errorCallback(error, stack) {
    this.hasError = true;
    this.errorMessage = error.message;
    console.error('Erreur capturée:', error);
    console.error('Stack:', stack);
  }

  handleRetry() {
    this.hasError = false;
    this.errorMessage = '';
  }
}
\`\`\`

\`\`\`html
<template>
  <template lwc:if={hasError}>
    <div class="error-state">
      <p>Quelque chose s'est mal passé : {errorMessage}</p>
      <lightning-button label="Réessayer" onclick={handleRetry}></lightning-button>
    </div>
  </template>
  <template lwc:else>
    <slot></slot>
  </template>
</template>
\`\`\`

### Limitations

- Capture uniquement les erreurs de **render lifecycle** dans les descendants
- N'attrape PAS les erreurs dans les handlers d'événements
- N'attrape PAS les erreurs dans les Promises non-catchées
- Le composant lui-même ne peut pas catcher ses propres erreurs de render`,
    tsAnalogy: `\`\`\`javascript
// React — componentDidCatch (class component)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
// LWC errorCallback est EXACTEMENT le même concept avec les mêmes limitations
\`\`\``,
    gotchas: [
      "errorCallback ne capture que les erreurs de RENDER (lifecycle) — pas les erreurs d'événements ou de Promises",
      "Le composant qui implémente errorCallback doit être un ANCÊTRE du composant en erreur",
      "Après capture d'une erreur, le composant descendant est retiré du DOM",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC AVANCÉ
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-29-dynamic-components",
    title: "Création dynamique de composants — lwc:component et lwc:is",
    category: "LWC Avancé",
    tags: ["lwc", "dynamic", "lazy-loading", "lwc:is", "lwc:component"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `## Composants Dynamiques en LWC (API 55+)

### lwc:is — composant dynamique

\`\`\`javascript
// dashboard.js
import { LightningElement } from 'lwc';

export default class Dashboard extends LightningElement {
  widgetComponent = null;

  async connectedCallback() {
    const module = await import('c/chartWidget');
    this.widgetComponent = module.default;
  }

  async switchToTable() {
    const module = await import('c/tableWidget');
    this.widgetComponent = module.default;
  }
}
\`\`\`

\`\`\`html
<template>
  <template lwc:if={widgetComponent}>
    <lwc:component lwc:is={widgetComponent} title={widgetTitle}></lwc:component>
  </template>
</template>
\`\`\`

### Cas d'usage

- **Dashboards configurables** : différents widgets selon les préférences user
- **Step wizard** : chaque étape est un composant différent
- **Feature flags** : charger différents composants selon les permissions`,
    tsAnalogy: `\`\`\`jsx
// React — dynamic component
const DynamicComponent = componentMap[widgetType];
return <DynamicComponent data={data} />;

// React — lazy loading
const LazyChart = React.lazy(() => import('./ChartWidget'));

// Vue 3 — component dynamique
<component :is="currentComponent" :data="widgetData" />

// LWC équivalent
<lwc:component lwc:is={widgetComponent}></lwc:component>
\`\`\``,
    gotchas: [
      "lwc:is doit recevoir un constructeur de classe LWC (la valeur par défaut d'un module), pas une string",
      "Changer lwc:is d'un composant à un autre détruit l'ancien et crée le nouveau — disconnectedCallback/connectedCallback sont appelés",
      "les imports dynamiques dans LWC sont bundlés différemment selon le contexte org vs LWC OSS",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LWC TESTING
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "lwc-33-testing",
    title: "@salesforce/sfdx-lwc-jest — tests unitaires LWC",
    category: "LWC Testing",
    tags: ["lwc", "jest", "testing", "unit-tests", "mock"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `## Tests Jest pour LWC

### Structure d'un test LWC

\`\`\`javascript
// __tests__/monComposant.test.js
import { createElement } from 'lwc';
import MonComposant from 'c/monComposant';

describe('c-mon-composant', () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('affiche le titre correctement', () => {
    const element = createElement('c-mon-composant', { is: MonComposant });
    element.title = 'Test Titre'; // setter @api prop
    document.body.appendChild(element);

    const titleEl = element.shadowRoot.querySelector('h1');
    expect(titleEl.textContent).toBe('Test Titre');
  });

  it('émet un événement au clic', () => {
    const element = createElement('c-mon-composant', { is: MonComposant });
    document.body.appendChild(element);

    const mockHandler = jest.fn();
    element.addEventListener('monEvent', mockHandler);

    element.shadowRoot.querySelector('button').click();

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

### Flush promises — tester l'asynchrone

\`\`\`javascript
import { flushPromises } from '@salesforce/sfdx-lwc-jest';

it('affiche les données après chargement', async () => {
  const element = createElement('c-contact-list', { is: ContactList });
  document.body.appendChild(element);

  await flushPromises();

  const items = element.shadowRoot.querySelectorAll('li');
  expect(items.length).toBe(3);
});
\`\`\`

### Mock des imports Apex

\`\`\`javascript
jest.mock('@salesforce/apex/ContactController.getContacts', () => {
  return jest.fn();
}, { virtual: true });

import getContacts from '@salesforce/apex/ContactController.getContacts';

it('affiche les contacts', async () => {
  getContacts.mockResolvedValue([
    { Id: '1', Name: 'Alice' },
    { Id: '2', Name: 'Bob' },
  ]);

  const element = createElement('c-contact-list', { is: ContactList });
  document.body.appendChild(element);
  await flushPromises();

  const items = element.shadowRoot.querySelectorAll('.contact-item');
  expect(items.length).toBe(2);
});
\`\`\`

### Mock des wire adapters

\`\`\`javascript
import { registerLdsTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import { getRecord } from 'lightning/uiRecordApi';

const getRecordAdapter = registerLdsTestWireAdapter(getRecord);

it('affiche le nom du compte via wire', async () => {
  const element = createElement('c-account-info', { is: AccountInfo });
  element.recordId = '001xxx';
  document.body.appendChild(element);

  getRecordAdapter.emit({
    fields: { Name: { value: 'Acme Corp' } }
  });

  await Promise.resolve();

  const nameEl = element.shadowRoot.querySelector('.account-name');
  expect(nameEl.textContent).toBe('Acme Corp');
});
\`\`\``,
    tsAnalogy: `\`\`\`javascript
// React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
render(<MonComposant title="Test" />);
screen.getByText('Test');

// LWC Jest — différences clés :
// - Accès via shadowRoot (pas de RTL queries par texte)
// - flushPromises requis pour async
// - mock des wire adapters spécifique LWC
\`\`\``,
    gotchas: [
      "Toujours nettoyer le DOM dans afterEach — sinon les composants des tests précédents persistent",
      "element.shadowRoot.querySelector — ne pas oublier .shadowRoot",
      "flushPromises est nécessaire après tout code asynchrone (wire, Apex mock, setTimeout)",
      "Les wire adapters nécessitent registerLdsTestWireAdapter — pas un simple jest.mock",
      "Pour tester les événements, écouter sur l'élément (element.addEventListener), pas sur element.shadowRoot",
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // JAVASCRIPT DEVELOPER I
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "js-38-var-let-const",
    title: "var / let / const — hoisting, TDZ, scope",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "var", "let", "const", "hoisting", "scope", "tdz"],
    difficulty: "beginner",
    certRelevance: ["JS-Dev-I"],
    content: `## var, let, const — les différences fondamentales

### Scope

\`\`\`javascript
// var — function scope (ou global scope)
function exemple() {
  if (true) {
    var x = 'je suis var';
    let y = 'je suis let';
    const z = 'je suis const';
  }
  console.log(x); // ✅ 'je suis var' — var fuit hors du bloc if
  console.log(y); // ❌ ReferenceError — let est block-scoped
  console.log(z); // ❌ ReferenceError — const est block-scoped
}

// var dans un for loop — PIÈGE CLASSIQUE
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Affiche : 3, 3, 3 (pas 0, 1, 2 !)

// let dans un for loop — comportement attendu
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Affiche : 0, 1, 2 ✅
\`\`\`

### Hoisting

\`\`\`javascript
// var — hoisted et initialisé à undefined
console.log(a); // undefined (pas d'erreur !)
var a = 5;

// let/const — hoisted mais PAS initialisés → Temporal Dead Zone (TDZ)
console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 5;
\`\`\`

### Temporal Dead Zone (TDZ)

\`\`\`javascript
{
  // TDZ pour 'c' commence ici
  console.log(c); // ❌ TDZ → ReferenceError
  let c = 10;     // TDZ se termine ici
  console.log(c); // ✅ 10
}

// Cas piège avec typeof
typeof undeclaredVar; // ✅ 'undefined' (pas d'erreur pour var non déclarées)
typeof letVar;        // ❌ ReferenceError si letVar est dans la TDZ !
\`\`\`

### const — immuabilité de la liaison, pas de la valeur

\`\`\`javascript
const obj = { name: 'Alice' };
obj.name = 'Bob'; // ✅ OK — la LIAISON est const, pas l'objet
obj = {};         // ❌ TypeError — réassignation interdite

// Pour vraiment freezer un objet :
const frozen = Object.freeze({ name: 'Alice' });
frozen.name = 'Bob'; // Silencieux en non-strict, TypeError en strict
\`\`\``,
    tsAnalogy: `TypeScript ajoute des types mais le comportement var/let/const reste identique en runtime. La transpilation TS → JS conserve var/let/const selon ta config target.`,
    gotchas: [
      "var dans un for loop avec setTimeout — le piège classique. let crée un nouveau binding par itération, var non",
      "typeof avec let/const dans la TDZ lève une ReferenceError — contrairement à typeof avec var non-déclarée",
      "const ne rend pas un objet ou array immutable — utiliser Object.freeze() pour ça",
      "var peut être re-déclaré multiple fois dans le même scope — let/const non (SyntaxError)",
      "Le hoisting de var ne lève que la DÉCLARATION, pas l'initialisation — la valeur est undefined jusqu'à la ligne d'assignation",
    ],
  },

  {
    id: "js-39-closures",
    title: "Closures — capture du scope lexical",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "closure", "scope", "lexical", "memory"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Closures en JavaScript

Une closure est la combinaison d'une **fonction** et de son **scope lexical**.

### Définition et exemple basique

\`\`\`javascript
function makeCounter(startValue = 0) {
  let count = startValue;

  return {
    increment() { count++; },
    decrement() { count--; },
    getValue() { return count; },
  };
}

const counter = makeCounter(10);
counter.increment();
counter.increment();
console.log(counter.getValue()); // 12

const counter2 = makeCounter(0);
counter2.increment();
console.log(counter2.getValue()); // 1 (indépendant de counter !)
\`\`\`

### Le piège classique de l'examen : closure + boucle

\`\`\`javascript
// ❌ Piège — var dans la boucle
const funcs = [];
for (var i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}
console.log(funcs[0]()); // 3 (pas 0 !)
console.log(funcs[1]()); // 3
console.log(funcs[2]()); // 3
// Toutes les fonctions capturent la MÊME variable 'i'
// À l'exécution, la boucle est terminée, i === 3

// ✅ Solution 1 : let (block-scoped, nouveau binding par itération)
for (let i = 0; i < 3; i++) {
  funcs.push(function() { return i; });
}

// ✅ Solution 2 : IIFE
for (var i = 0; i < 3; i++) {
  funcs.push((function(j) {
    return function() { return j; };
  })(i));
}
\`\`\`

### Module pattern — closures pour l'encapsulation

\`\`\`javascript
const userModule = (function() {
  let users = [];
  let nextId = 1;

  return {
    addUser(name) { users.push({ id: nextId++, name }); },
    getUsers() { return [...users]; },
    getUserCount() { return users.length; }
  };
})();

userModule.addUser('Alice');
console.log(userModule.users); // undefined — privé !
\`\`\``,
    tsAnalogy: `Les closures fonctionnent identiquement en TypeScript. Le compilateur TS analyse les captures de scope, mais le runtime JS gère les closures.`,
    gotchas: [
      "var dans une boucle avec callbacks asynchrones = TOUTES les fonctions voient la valeur FINALE de la variable",
      "let dans une boucle crée un nouveau binding par itération — chaque closure a son propre 'i'",
      "Les closures gardent en mémoire tout le scope parent — peut causer des memory leaks si de gros objets sont capturés",
      "Une closure n'est pas une copie de la variable — c'est une RÉFÉRENCE au scope. Si la variable change, la closure voit le changement",
    ],
  },

  {
    id: "js-40-prototypal-inheritance",
    title: "Héritage prototypal — __proto__, Object.create, prototype chain",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "prototype", "inheritance", "object", "class"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Héritage prototypal en JavaScript

JavaScript n'a PAS de classes au sens traditionnel. Les classes ES6 sont du **sucre syntaxique sur les prototypes**.

### La chaîne prototype

\`\`\`javascript
const alice = { name: 'Alice', age: 30 };

// Quand tu accèdes à une propriété :
// 1. JS cherche dans l'objet lui-même
// 2. Si non trouvé → cherche dans [[Prototype]]
// 3. ... jusqu'à null (fin de chaîne)

alice.toString(); // pas défini sur alice → trouvé sur Object.prototype
\`\`\`

### Object.create — héritage explicite

\`\`\`javascript
const animal = {
  speak() { return \`\${this.name} fait du bruit\`; },
  breathe() { return 'inhale... exhale...'; }
};

const dog = Object.create(animal);
dog.name = 'Rex';
dog.bark = function() { return 'Wouf !'; };

console.log(dog.speak()); // 'Rex fait du bruit' (trouvé sur animal via __proto__)
// La chaîne : dog → animal → Object.prototype → null
\`\`\`

### Classes ES6 — sucre syntaxique

\`\`\`javascript
class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }

  speak() { return \`\${this.name} fait "\${this.sound}"\`; }

  static create(name, sound) { return new Animal(name, sound); }
}

class Dog extends Animal {
  constructor(name) {
    super(name, 'Wouf'); // OBLIGATOIRE avant this
  }

  fetch() { return \`\${this.name} ramène la balle\`; }
}

// Identique sous le capot à la version Function constructor
\`\`\`

### Vérifier la chaîne prototype

\`\`\`javascript
const rex = new Dog('Rex');

rex instanceof Dog;    // true
rex instanceof Animal; // true

Animal.prototype.isPrototypeOf(rex); // true

rex.hasOwnProperty('name');  // true (propre)
rex.hasOwnProperty('speak'); // false (hérité du prototype)
\`\`\``,
    tsAnalogy: `TypeScript ajoute du typage sur les classes mais compile vers des prototypes JS. Les classes TypeScript sont des classes ES6 avec des annotations de type.`,
    gotchas: [
      "__proto__ est déprécié — utiliser Object.getPrototypeOf() et Object.setPrototypeOf()",
      "Les méthodes définies dans le constructor (this.method = function(){}) sont copiées sur CHAQUE instance — coûteux en mémoire",
      "super() doit être appelé AVANT tout accès à 'this' dans un constructeur qui extends — sinon ReferenceError",
      "Object.create(null) crée un objet sans prototype — pas de toString, hasOwnProperty, etc.",
      "instanceof vérifie la chaîne prototype — peut donner des résultats surprenants avec des iframes différentes",
    ],
  },

  {
    id: "js-41-this-binding",
    title: "this — les 4 règles de binding + arrow functions",
    category: "JavaScript Fondamentaux",
    tags: [
      "javascript",
      "this",
      "binding",
      "arrow-function",
      "call",
      "apply",
      "bind",
    ],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Le this en JavaScript — les 4 règles

### Règle 1 : Binding implicite (appel de méthode)

\`\`\`javascript
const user = {
  name: 'Alice',
  greet() { console.log(\`Bonjour, je suis \${this.name}\`); }
};

user.greet(); // 'Bonjour, je suis Alice' — this = user

// PIÈGE : extraction de méthode
const greet = user.greet;
greet(); // 'Bonjour, je suis undefined' — this = global (ou undefined en strict)
\`\`\`

### Règle 2 : Binding explicite (call, apply, bind)

\`\`\`javascript
function greet(greeting, punctuation) {
  return \`\${greeting}, je suis \${this.name}\${punctuation}\`;
}
const user = { name: 'Alice' };

greet.call(user, 'Bonjour', '!');    // args individuels
greet.apply(user, ['Salut', '?']);   // args en array
const fn = greet.bind(user, 'Hey'); // retourne une nouvelle fonction
fn('.');  // 'Hey, je suis Alice.'
\`\`\`

### Règle 3 : new binding

\`\`\`javascript
function User(name) {
  // new : 1) crée {} 2) [[Prototype]] = User.prototype 3) this = cet objet 4) retourne this
  this.name = name;
}
const alice = new User('Alice');
\`\`\`

### Règle 4 : Default binding

\`\`\`javascript
function whoAmI() { console.log(this); }
whoAmI(); // En non-strict : window/global — En strict mode : undefined
\`\`\`

### Priorité : new > bind/call/apply > implicite > default

### Arrow functions — this lexical

\`\`\`javascript
const timer = {
  count: 0,
  start() {
    setInterval(function() {
      this.count++; // ❌ this = window
    }, 1000);

    setInterval(() => {
      this.count++; // ✅ this = timer (arrow function capture le this de start())
    }, 1000);
  }
};

// Arrow function comme propriété de classe — this TOUJOURS bindé à l'instance
class Component {
  name = 'Alice';

  handleClickArrow = () => {
    console.log(this.name); // toujours 'Alice' ✅
  };
}
\`\`\``,
    tsAnalogy: `TypeScript doit inférer le type de \`this\` — tu peux annoter \`this\` comme premier paramètre faux : \`function fn(this: User, ...) {}\`. Mais le comportement runtime est identique au JS.`,
    gotchas: [
      "Extraire une méthode d'un objet et l'appeler sans contexte = perte de 'this' — toujours bind ou utiliser arrow function",
      "Les arrow functions ne peuvent PAS être utilisées comme constructeurs — new arrowFn() → TypeError",
      "bind() retourne une NOUVELLE fonction — ne pas oublier d'assigner le résultat",
      "call/apply/bind sur une arrow function n'ont AUCUN effet sur son 'this'",
      "En strict mode, default binding retourne undefined (pas global)",
    ],
  },

  {
    id: "js-42-coercion",
    title: "Coercion — == vs ===, truthy/falsy, typeof null",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "coercion", "equality", "truthy", "falsy", "typeof"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Coercion de type en JavaScript

### == (Abstract Equality) vs === (Strict Equality)

\`\`\`javascript
// === — pas de coercion
1 === '1';  // false — types différents
null === undefined; // false

// == — coercion appliquée
1 == '1';     // true — '1' converti en number
0 == '';      // true — '' converti en 0
0 == false;   // true — false converti en 0
null == undefined; // true (cas spécial de la spec)
null == 0;    // false
null == '';    // false
\`\`\`

### Les 8 valeurs falsy

\`\`\`javascript
// En JavaScript, UNIQUEMENT ces valeurs sont falsy :
false, 0, -0, 0n, '', null, undefined, NaN

// TOUT le reste est truthy
Boolean([])   // true ← PIÈGE — [] est truthy !
Boolean({})   // true
Boolean('0')  // true (string non-vide)

if ([]) { console.log('truthy') } // s'exécute !
[] == false  // true (!) — [] est truthy mais coercé en '' puis 0
\`\`\`

### typeof — résultats à connaître

\`\`\`javascript
typeof undefined   // 'undefined'
typeof null        // 'object' ← BUG HISTORIQUE JS (depuis 1995, jamais corrigé)
typeof true        // 'boolean'
typeof 42          // 'number'
typeof 'hello'     // 'string'
typeof Symbol()    // 'symbol'
typeof {}          // 'object'
typeof []          // 'object' (pas 'array' !)
typeof function(){} // 'function'
typeof class {}    // 'function' (les classes sont des fonctions)

// Détecter null correctement
value === null       // ✅ seul moyen fiable
Array.isArray([])    // ✅ détecter un array
\`\`\`

### NaN — Not a Number

\`\`\`javascript
typeof NaN // 'number' ← surprenant !
NaN === NaN // false ← NaN n'est JAMAIS égal à lui-même

Number.isNaN(NaN)     // ✅ true
Number.isNaN('hello') // ✅ false
isNaN('hello')        // true ← PIÈGE (coerce 'hello' en NaN)
\`\`\``,
    tsAnalogy: `TypeScript interdit les comparaisons avec == dans certaines configs (strict). Mais le runtime JS reste le même — les coercions existent toujours.`,
    gotchas: [
      "typeof null === 'object' — bug historique non corrigé. Toujours vérifier null === null explicitement",
      "[] est TRUTHY mais [] == false est TRUE — l'un des cas les plus trompeurs de JS",
      "NaN !== NaN — utiliser Number.isNaN() (pas isNaN global qui coerce les strings)",
      "null == undefined est true, mais null == 0 et null == '' sont false — cas spécial de la spec",
    ],
  },

  {
    id: "js-43-symbols",
    title: "Symbols — well-known symbols et usage",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "symbol", "well-known", "iterator", "toPrimitive"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Symbols en JavaScript

Un Symbol est une **valeur primitive unique et immutable**.

### Création et unicité

\`\`\`javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');
sym1 === sym2; // false — toujours différent !

// Symbol.for — registry global (shared)
const s1 = Symbol.for('shared');
const s2 = Symbol.for('shared');
s1 === s2; // true
\`\`\`

### Usage : clés de propriétés privées-ish

\`\`\`javascript
const _userId = Symbol('userId');

class User {
  constructor(id, name) {
    this[_userId] = id;
    this.name = name;
  }
  getId() { return this[_userId]; }
}

const user = new User(42, 'Alice');
Object.keys(user);        // ['name'] — pas le symbol
JSON.stringify(user);     // '{"name":"Alice"}' — symbol ignoré
\`\`\`

### Well-Known Symbols — personnaliser le comportement

\`\`\`javascript
// Symbol.iterator — rendre un objet itérable
class Range {
  constructor(start, end) { this.start = start; this.end = end; }

  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current <= end) return { value: current++, done: false };
        return { value: undefined, done: true };
      }
    };
  }
}

[...new Range(1, 5)]; // [1, 2, 3, 4, 5]

// Symbol.toPrimitive — contrôle la coercion
class Temperature {
  constructor(celsius) { this.celsius = celsius; }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.celsius;
    if (hint === 'string') return \`\${this.celsius}°C\`;
    return this.celsius;
  }
}

const temp = new Temperature(25);
+temp; // 25 (hint = 'number')
\`\`\``,
    tsAnalogy: `TypeScript supporte les Symbols comme clés d'objets avec typage complet. Les well-known symbols peuvent être utilisés pour implémenter les interfaces Iterator et Iterable.`,
    gotchas: [
      "Symbol() sans description crée un symbol valide mais harder to debug — toujours mettre une description",
      "Les symbols ne sont PAS inclus dans JSON.stringify",
      "typeof Symbol() === 'symbol' — les symbols sont primitifs (pas des objets)",
      "new Symbol() → TypeError — les symbols ne peuvent pas être construits avec new",
    ],
  },

  {
    id: "js-44-iterators-generators",
    title: "Iterators & Generators — function*, yield, for...of",
    category: "JavaScript Fondamentaux",
    tags: [
      "javascript",
      "iterator",
      "generator",
      "yield",
      "for-of",
      "protocol",
    ],
    difficulty: "advanced",
    certRelevance: ["JS-Dev-I"],
    content: `## Iterators et Generators

### Le protocole Iterator

\`\`\`javascript
// Iterator manuel
function makeRangeIterator(start, end) {
  let current = start;

  return {
    [Symbol.iterator]() { return this; },
    next() {
      if (current <= end) return { value: current++, done: false };
      return { value: undefined, done: true };
    }
  };
}

for (const n of makeRangeIterator(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}
\`\`\`

### Generators — simplification des iterators

\`\`\`javascript
function* rangeGenerator(start, end) {
  for (let i = start; i <= end; i++) {
    yield i; // pause et retourne une valeur
  }
}

const gen = rangeGenerator(1, 3);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

[...rangeGenerator(1, 5)]; // [1, 2, 3, 4, 5]
\`\`\`

### Generators infinis

\`\`\`javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function take(gen, n) {
  const result = [];
  for (const val of gen) {
    result.push(val);
    if (result.length >= n) break;
  }
  return result;
}

take(fibonacci(), 10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\`

### Communication bidirectionnelle

\`\`\`javascript
function* calculator() {
  let result = 0;
  while (true) {
    const input = yield result;
    if (input === null) break;
    result += input;
  }
  return result;
}

const calc = calculator();
calc.next();     // { value: 0, done: false }
calc.next(5);    // { value: 5, done: false } — envoie 5
calc.next(3);    // { value: 8, done: false }
calc.next(null); // { value: 8, done: true }
\`\`\``,
    tsAnalogy: `TypeScript supporte les generators avec le type \`Generator<Yield, Return, Next>\`. Les async generators avec \`AsyncGenerator<T>\`. Le compilateur infère souvent ces types automatiquement.`,
    gotchas: [
      "Un generator ne s'exécute pas à la création — il faut appeler next() pour démarrer",
      "Le premier next() ne peut pas envoyer de valeur (elle est ignorée)",
      "return dans un generator donne { value: x, done: true } — mais for...of ignore la valeur du return",
      "Les generators sont à la fois iterateurs et itérables — ils implémentent les deux protocoles",
    ],
  },

  {
    id: "js-45-proxy-reflect",
    title: "Proxy & Reflect — interception et métaprogrammation",
    category: "JavaScript Fondamentaux",
    tags: ["javascript", "proxy", "reflect", "metaprogramming", "trap"],
    difficulty: "advanced",
    certRelevance: ["JS-Dev-I"],
    content: `## Proxy & Reflect

Proxy permet d'**intercepter et personnaliser les opérations fondamentales** sur les objets.

### Proxy basique

\`\`\`javascript
const handler = {
  get(target, property, receiver) {
    console.log(\`GET \${String(property)}\`);
    return Reflect.get(target, property, receiver);
  },

  set(target, property, value, receiver) {
    if (typeof value !== 'string') {
      throw new TypeError(\`\${String(property)} doit être une string\`);
    }
    return Reflect.set(target, property, value, receiver);
  },
};

const user = new Proxy({ name: 'Alice' }, handler);
user.name;         // log: GET name → 'Alice'
user.name = 'Bob'; // OK
user.age = 42;     // TypeError: age doit être une string
\`\`\`

### Use cases pratiques

\`\`\`javascript
// 1. Validation de données
function createValidated(target, validators) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (validators[prop] && !validators[prop](value)) {
        throw new Error(\`Valeur invalide pour \${String(prop)}: \${value}\`);
      }
      return Reflect.set(obj, prop, value);
    }
  });
}

const user = createValidated({}, {
  age: (v) => Number.isInteger(v) && v > 0 && v < 150,
  email: (v) => /^[^@]+@[^@]+\.[^@]+$/.test(v),
});

// 2. Propriétés par défaut
const withDefaults = (target, defaults) => new Proxy(target, {
  get(obj, prop) {
    return prop in obj ? obj[prop] : defaults[prop];
  }
});

const config = withDefaults({}, { timeout: 5000, retries: 3 });
config.timeout; // 5000 (default)
\`\`\`

### Reflect — API complémentaire

\`\`\`javascript
Reflect.get(obj, 'prop');              // équivalent obj.prop
Reflect.set(obj, 'prop', value);       // équivalent obj.prop = value
Reflect.has(obj, 'prop');              // équivalent 'prop' in obj
Reflect.deleteProperty(obj, 'prop');   // équivalent delete obj.prop
Reflect.apply(fn, thisArg, args);      // équivalent fn.apply(thisArg, args)
Reflect.construct(Cls, args);          // équivalent new Cls(...args)
\`\`\``,
    tsAnalogy: `TypeScript peut typer les Proxy avec des génériques, mais les traps eux-mêmes restent non-typés. Vue 3 utilise Proxy en interne pour son système de réactivité (reactive()).`,
    gotchas: [
      "Toujours retourner Reflect.set()/Reflect.get() dans les traps — sinon les invariants sont violés",
      "Proxy ne peut pas intercepter les opérations sur les primitives — seulement sur les objets",
      "Les Proxy sur les classes peuvent causer des problèmes avec les méthodes privées (#field)",
      "Reflect.set retourne un boolean — le trap set doit retourner ce boolean sinon TypeError en strict mode",
    ],
  },

  {
    id: "js-46-weakmap-weakset",
    title: "WeakMap, WeakSet, WeakRef — garbage collection implications",
    category: "JavaScript Fondamentaux",
    tags: [
      "javascript",
      "weakmap",
      "weakset",
      "weakref",
      "garbage-collection",
      "memory",
    ],
    difficulty: "advanced",
    certRelevance: ["JS-Dev-I"],
    content: `## Weak Collections et Garbage Collection

### Map vs WeakMap

\`\`\`javascript
// Map — référence FORTE — empêche le GC
const map = new Map();
let obj = { name: 'Alice' };
map.set(obj, 'metadata');
obj = null; // obj n'est PAS GC'd — Map garde une référence forte

// WeakMap — référence FAIBLE — n'empêche pas le GC
const weakMap = new WeakMap();
let obj2 = { name: 'Bob' };
weakMap.set(obj2, 'metadata');
obj2 = null; // obj2 PEUT être GC'd
// Quand obj2 est GC'd, l'entrée WeakMap est automatiquement supprimée
\`\`\`

### Contraintes WeakMap

\`\`\`javascript
const wm = new WeakMap();

// Clés : objets uniquement
wm.set({}, 'valeur');   // ✅
wm.set('clé', 'val');   // ❌ TypeError

// Non itérable — design intentionnel
wm.size;     // undefined

// API limitée
wm.set(key, value);
wm.get(key);
wm.has(key);
wm.delete(key);
\`\`\`

### Use cases WeakMap

\`\`\`javascript
// 1. Données privées pour des classes
const _private = new WeakMap();

class SecureUser {
  constructor(name, password) {
    _private.set(this, { password });
    this.name = name;
  }
  authenticate(pwd) {
    return _private.get(this).password === pwd;
  }
}

// 2. Cache lié à la vie d'un objet DOM
const domCache = new WeakMap();

function getElementData(element) {
  if (!domCache.has(element)) {
    domCache.set(element, computeExpensiveData(element));
  }
  return domCache.get(element);
}
// Quand l'élément DOM est retiré et GC'd → le cache est vidé automatiquement

// 3. Marqueurs "visited" pour éviter les cycles infinis
function deepClone(obj, visited = new WeakMap()) {
  if (visited.has(obj)) return visited.get(obj);
  const clone = Array.isArray(obj) ? [] : {};
  visited.set(obj, clone);
  for (const key of Object.keys(obj)) {
    clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key], visited) : obj[key];
  }
  return clone;
}
\`\`\`

### WeakRef — référence faible explicite (ES2021)

\`\`\`javascript
let cache = new WeakRef(bigExpensiveObject);
bigExpensiveObject = null; // peut être GC'd

const obj = cache.deref(); // undefined si GC'd, sinon l'objet
if (obj) { /* Utiliser obj */ }
else { /* Recalculer */ }
\`\`\``,
    tsAnalogy: `TypeScript supporte WeakMap<KeyType extends object, ValueType> avec typage fort. Utile pour les patterns de données privées dans les classes TS.`,
    gotchas: [
      "WeakMap/WeakSet ne sont PAS itérables — si tu as besoin d'itérer sur les clés, utilise Map/Set ordinaires",
      "WeakRef.deref() peut retourner undefined à tout moment — ne jamais cacher la valeur déréférencée",
      "Le timing du GC est non-déterministe — ne pas compter sur la suppression immédiate après nullification",
      "WeakMap n'a pas .size — tu ne peux pas savoir combien d'entrées il contient",
    ],
  },

  {
    id: "js-47-promises",
    title: "Promises en profondeur — states, chaining, error propagation",
    category: "JavaScript Avancé",
    tags: ["javascript", "promise", "async", "error-handling", "chaining"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Promises en JavaScript

### Les 3 états

\`\`\`
pending → fulfilled (resolved) avec une valeur
pending → rejected avec une raison
\`\`\`

Une fois settled, une Promise **ne change plus d'état**.

### Chaining — then/catch/finally

\`\`\`javascript
fetch('/api/user')
  .then(response => {
    if (!response.ok) throw new Error('HTTP Error ' + response.status);
    return response.json(); // retourner une Promise → le then suivant attend
  })
  .then(user => {
    return user.id; // retourner une valeur → propagée au then suivant
  })
  .then(userId => fetch(\`/api/orders/\${userId}\`))
  .then(response => response.json())
  .catch(error => {
    // Attrape TOUTES les erreurs des then précédents
    console.error('Erreur:', error.message);
    return []; // retourner une valeur = "récupération" — la chaîne continue
  })
  .finally(() => {
    this.isLoading = false; // toujours exécuté
  });
\`\`\`

### Promise statiques

\`\`\`javascript
// Promise.all — attend TOUTES, rejette si une rejette
const [users, orders] = await Promise.all([fetchUsers(), fetchOrders()]);

// Promise.allSettled — attend TOUTES, ne rejette jamais
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
results.forEach(result => {
  if (result.status === 'fulfilled') console.log(result.value);
  else console.error(result.reason);
});

// Promise.race — retourne la première settlee (fulfilled OU rejected)
const firstResponse = await Promise.race([
  fetch('/api/primary'),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000)),
]);

// Promise.any — retourne la première FULFILLED
const fastest = await Promise.any([fetchA(), fetchB(), fetchC()]);
\`\`\``,
    tsAnalogy: `TypeScript type les Promises avec Promise<T>. async/await est pleinement supporté avec inférence de type. Le comportement runtime est identique au JS.`,
    gotchas: [
      "Ne pas oublier return dans un .then() — sans return, le then suivant reçoit undefined",
      "throw dans un .then() rejette la Promise résultante — propagé au .catch() suivant",
      "Promise.all rejette immédiatement si UNE Promise rejette",
      "await sans try/catch laisse une Promise rejected non-catchée — UnhandledPromiseRejection",
      "async function retourne toujours une Promise — même si elle retourne une valeur primitive",
    ],
  },

  {
    id: "js-48-event-loop",
    title: "Event Loop — call stack, task queue, microtask queue",
    category: "JavaScript Avancé",
    tags: [
      "javascript",
      "event-loop",
      "call-stack",
      "microtask",
      "macrotask",
      "async",
    ],
    difficulty: "advanced",
    certRelevance: ["JS-Dev-I"],
    content: `## L'Event Loop JavaScript

JavaScript est **single-threaded**. L'event loop coordonne les différentes queues de tâches.

### Les composants

\`\`\`
Call Stack         → exécution synchrone (LIFO)
Microtask Queue    → Promises (.then), queueMicrotask, MutationObserver
Macrotask Queue    → setTimeout, setInterval, I/O events, UI events
rAF                → requestAnimationFrame (avant le prochain repaint)
\`\`\`

### Ordre d'exécution

\`\`\`
1. Exécuter tout le code synchrone (vider la call stack)
2. Vider COMPLÈTEMENT la microtask queue
   (si une microtask ajoute d'autres microtasks → elles s'exécutent aussi)
3. requestAnimationFrame + Repaint
4. Prendre UNE macrotask de la macrotask queue
5. Retour à l'étape 2
\`\`\`

### Démonstration de l'ordre

\`\`\`javascript
console.log('1 — synchrone');

setTimeout(() => console.log('2 — macrotask (setTimeout 0)'), 0);

Promise.resolve()
  .then(() => console.log('3 — microtask (Promise.then)'))
  .then(() => console.log('4 — microtask chaîné'));

queueMicrotask(() => console.log('5 — microtask (queueMicrotask)'));

console.log('6 — synchrone');

// Ordre d'affichage :
// 1 — synchrone
// 6 — synchrone
// 3 — microtask (Promise.then)
// 4 — microtask chaîné
// 5 — microtask (queueMicrotask)
// 2 — macrotask (setTimeout 0)
\`\`\`

### async/await et l'event loop

\`\`\`javascript
async function example() {
  console.log('A');
  await Promise.resolve(); // yield → remet en microtask queue
  console.log('B');
}

console.log('C');
example();
console.log('D');

// Sortie : C, A, D, B
// - C : synchrone
// - A : synchrone (dans example())
// - await : suspend example, retour dans le code parent
// - D : synchrone (suite du code parent)
// - B : microtask (await reprend)
\`\`\``,
    tsAnalogy: `L'event loop est identique en TypeScript — TypeScript transpile async/await vers des Promises, qui utilisent l'event loop. Aucune différence runtime.`,
    gotchas: [
      "setTimeout(fn, 0) ne signifie pas 'exécuter immédiatement' — toutes les microtasks en attente s'exécutent avant",
      "Les microtasks s'exécutent TOUTES avant la prochaine macrotask",
      "await crée implicitement une microtask — le code après await reprend dans la microtask queue",
      "Une boucle while(true) avec des microtasks internes peut starver l'event loop — les events UI ne s'exécutent jamais",
      "Node.js a process.nextTick() qui s'exécute AVANT les Promises dans la microtask queue",
    ],
  },

  {
    id: "js-49-modules",
    title: "Modules ES — import/export, default, namespace, dynamic import()",
    category: "JavaScript Avancé",
    tags: ["javascript", "modules", "esm", "import", "export", "dynamic"],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Modules ES (ESM)

### Export

\`\`\`javascript
// math.js

// Named exports
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// Default export (un seul par module)
export default function multiply(a, b) { return a * b; }

// Export après déclaration
const SECRET = 'xyz';
export { SECRET };
export { SECRET as KEY }; // renommer à l'export
\`\`\`

### Import

\`\`\`javascript
// Named import
import { add, PI } from './math.js';
import { add as addition } from './math.js'; // renommer

// Default import (nom libre)
import multiply from './math.js';

// Namespace import
import * as MathUtils from './math.js';
MathUtils.add(1, 2);
MathUtils.default(3, 4);

// Side-effect import
import './polyfills.js';
\`\`\`

### Comportements spécifiques ESM

\`\`\`javascript
// Les exports sont des bindings LIVE (pas des copies)
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 — c'est le même binding, pas une copie !
\`\`\`

### Dynamic import() — chargement lazy

\`\`\`javascript
// import() retourne une Promise
async function loadChart() {
  const { Chart, defaultConfig } = await import('./chartLib.js');
  return new Chart(defaultConfig);
}

// Import conditionnel
if (isDarkMode) {
  const { darkTheme } = await import('./themes/dark.js');
  applyTheme(darkTheme);
}
\`\`\`

### CommonJS vs ESM

\`\`\`javascript
// CommonJS (Node.js historique)
const path = require('path');       // synchrone
module.exports = { myFunction };

// ESM (standard moderne)
import path from 'path';            // asynchrone, statique, hoisted
export { myFunction };

// Différences clés :
// CJS : require() synchrone, peut être conditionnel
// ESM : import statique, analysable statiquement (tree-shaking)
// ESM : import() dynamique pour le conditionnel
\`\`\``,
    tsAnalogy: `TypeScript utilise la même syntaxe ESM. Les imports TypeScript sont effacés à la compilation pour les types (\`import type\`). Les path aliases TypeScript (\`@/*\`) sont résolus par le bundler.`,
    gotchas: [
      "Les modules ESM sont en strict mode par défaut",
      "Les exports ESM sont des bindings LIVE (pas des copies) — si la valeur exportée change, l'import voit le changement",
      "import() dynamique retourne une Promise — toujours await",
      "Les imports statiques sont hoistés et résolus avant l'exécution — pas conditionnels",
    ],
  },

  {
    id: "js-50-error-handling",
    title:
      "Error handling — try/catch/finally, custom errors, unhandledrejection",
    category: "JavaScript Avancé",
    tags: [
      "javascript",
      "error",
      "try-catch",
      "custom-error",
      "promise",
      "async",
    ],
    difficulty: "intermediate",
    certRelevance: ["JS-Dev-I"],
    content: `## Gestion des erreurs en JavaScript

### try/catch/finally

\`\`\`javascript
function divide(a, b) {
  try {
    if (b === 0) throw new Error('Division par zéro');
    return a / b;
  } catch (error) {
    console.error('Erreur:', error.message);
    return null;
  } finally {
    // S'exécute TOUJOURS — même si try retourne
    console.log('finally toujours exécuté');
  }
}

// PIÈGE : finally avec return
function example() {
  try {
    return 'try value';
  } finally {
    return 'finally value'; // ÉCRASE le return du try !!!
  }
}
example(); // 'finally value'
\`\`\`

### Custom Errors — étendre Error

\`\`\`javascript
class NetworkError extends Error {
  constructor(message, statusCode, url) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

class ValidationError extends Error {
  constructor(fields) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.fields = fields; // { fieldName: 'error message' }
  }
}

// Usage
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new NetworkError(\`HTTP \${response.status}\`, response.status, url);
  }
} catch (error) {
  if (error instanceof NetworkError) {
    if (error.statusCode === 401) redirectToLogin();
    if (error.statusCode === 404) showNotFound();
  } else if (error instanceof ValidationError) {
    showFieldErrors(error.fields);
  } else {
    throw error; // Re-throw si non géré
  }
}
\`\`\`

### Gestion des erreurs asynchrones

\`\`\`javascript
// Écouter les unhandled rejections globalement
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée non catchée:', event.reason);
  event.preventDefault(); // Empêche l'affichage dans la console
});

// Node.js
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
\`\`\`

### Pattern wrapper

\`\`\`javascript
async function safeExecute(fn, fallback = null) {
  try {
    return await fn();
  } catch (error) {
    console.error('Caught in safeExecute:', error);
    return fallback;
  }
}

const data = await safeExecute(() => fetchData(url), []);
\`\`\``,
    tsAnalogy: `TypeScript peut typer les custom errors avec des discriminated unions. Utiliser \`error instanceof NetworkError\` avec les classes TS fonctionne identiquement.`,
    gotchas: [
      "finally avec un return ÉCRASE le return du try et du catch",
      "instanceof Error peut échouer si l'erreur vient d'un iframe différent — vérifier error.name comme alternative",
      "Les Promises rejetées sans .catch() génèrent un UnhandledPromiseRejection — peut crasher le process en Node.js",
      "catch(error) attrape TOUT — Error, string, number, null — toujours vérifier le type de l'erreur catchée",
      "Object.setPrototypeOf(this, NetworkError.prototype) est nécessaire quand TypeScript transpile les classes ES6 vers ES5",
    ],
  },
];
