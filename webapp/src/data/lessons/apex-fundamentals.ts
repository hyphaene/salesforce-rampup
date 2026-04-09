export interface Lesson {
  id: string;
  title: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  certRelevance: ("PD1" | "PD2")[];
  content: string; // markdown
  tsAnalogy?: string; // markdown
  gotchas: string[];
}

export const apexLessons: Lesson[] = [
  // ─────────────────────────────────────────────
  // TYPES PRIMITIFS
  // ─────────────────────────────────────────────
  {
    id: "primitives-overview",
    title: "Types primitifs — Vue d'ensemble",
    category: "Types & Variables",
    tags: ["primitifs", "types", "variables"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Types primitifs en Apex

Apex est un langage **fortement typé** et **case-insensitive** (les mots-clés, noms de classes et variables sont insensibles à la casse). Chaque variable doit être déclarée avec son type.

### Tableau des types primitifs

| Type Apex   | Équivalent TS     | Valeur par défaut | Taille / précision                       |
|-------------|-------------------|-------------------|------------------------------------------|
| \`String\`    | \`string\`          | \`null\`            | jusqu'à 18 millions de chars             |
| \`Integer\`   | \`number\` (int)    | \`null\` (0 si champ) | 32 bits, -2^31 à 2^31-1                |
| \`Long\`      | \`number\` (bigint) | \`null\`            | 64 bits                                  |
| \`Double\`    | \`number\`          | \`null\`            | 64-bit float, perte de précision possible |
| \`Decimal\`   | —                 | \`null\`            | Précision arbitraire (monnaie, calculs)  |
| \`Boolean\`   | \`boolean\`         | \`null\`            | true / false                             |
| \`Date\`      | \`Date\` (date only)| \`null\`            | Année/mois/jour seulement                |
| \`Datetime\`  | \`Date\`            | \`null\`            | Date + heure avec timezone               |
| \`Time\`      | —                 | \`null\`            | Heure seule                              |
| \`Id\`        | \`string\`          | \`null\`            | 15 ou 18 caractères Salesforce ID        |
| \`Blob\`      | \`Buffer\`          | \`null\`            | Données binaires                         |

### Déclaration de variables

\`\`\`apex
// Types scalaires
String name = 'Jean Dupont';
Integer age = 30;
Long bigNumber = 9999999999L;
Double price = 19.99;
Decimal precise = 19.9999999999;
Boolean isActive = true;
Date today = Date.today();
Datetime now = Datetime.now();
Time t = Time.newInstance(10, 30, 0, 0);
Id recordId = '001XXXXXXXXXXXXXXX';
Blob data = Blob.valueOf('hello');

// Toutes ces déclarations sont équivalentes (case-insensitive)
STRING myStr = 'test';
string myStr2 = 'test';
String myStr3 = 'test'; // même chose
\`\`\`

### Le type Id — natif Salesforce

\`\`\`apex
// Id est un type natif qui accepte les IDs Salesforce 15 ou 18 chars
Id accountId = '001XXXXXXXXXXXXXXX';

// Conversion implicite String → Id
String s = '001XXXXXXXXXXXXXXX';
Id id1 = s; // OK, conversion automatique

// Mais attention : pas de validation du format à la compilation
Id fakeId = 'notanid'; // compile, échoue au runtime lors d'une DML
\`\`\`
`,
    tsAnalogy: `
En TypeScript tu utilises \`string | number | boolean\` et tu n'as pas de type \`Id\` natif. En Apex :
- \`Decimal\` n'existe pas en TS — utilise \`Decimal\` pour tout calcul financier, jamais \`Double\`
- \`Id\` remplace \`string\` pour les références aux records Salesforce
- Les variables non initialisées valent \`null\` (pas \`undefined\`)
- Tout est nullable par défaut — il n'y a pas de \`string!\` ou de non-nullable natif
`,
    gotchas: [
      "Integer/Long/Double/Decimal non initialisés valent null, pas 0 — une addition null + 5 lève une NullPointerException",
      "Double perd de la précision sur les calculs monétaires — TOUJOURS utiliser Decimal pour la monnaie",
      "Date ≠ Datetime — comparer les deux sans conversion échoue ou donne des résultats inattendus",
      "Id à 15 chars est case-sensitive, à 18 chars est case-insensitive — toujours utiliser les 18 chars",
      "Boolean non initialisé vaut null, pas false — if(myBool) où myBool est null lève une NPE",
    ],
  },

  {
    id: "primitives-string-vs-decimal",
    title: "String vs Integer/Long/Double/Decimal — quand utiliser quoi",
    category: "Types & Variables",
    tags: ["primitifs", "decimal", "string", "integer"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Choisir le bon type numérique

\`\`\`apex
// Integer : compteurs, indices, IDs simples
Integer count = 0;
for (Integer i = 0; i < 10; i++) {
    count++;
}

// Long : grands nombres (timestamps, bytes)
Long fileSize = 1024L * 1024L * 1024L; // 1 GB en bytes

// Double : calculs scientifiques, pourcentages approximatifs
Double pi = 3.14159;
Double ratio = (Double) count / 100; // cast requis si count est Integer

// Decimal : TOUT ce qui touche à l'argent ou requiert une précision exacte
Decimal unitPrice = 9.99;
Decimal taxRate = 0.20;
Decimal totalWithTax = unitPrice * (1 + taxRate); // 11.988 exact
Decimal rounded = totalWithTax.setScale(2, RoundingMode.HALF_UP); // 11.99

// Conversions
Integer i = 42;
Double d = (Double) i;       // cast explicite requis
String s = String.valueOf(i); // Integer → String
Integer back = Integer.valueOf(s); // String → Integer
\`\`\`

## Dates en Apex

\`\`\`apex
// Date — jour uniquement
Date today = Date.today();
Date specific = Date.newInstance(2024, 12, 25);
Date nextWeek = today.addDays(7);
Integer dayOfWeek = today.day(); // 1-31

// Datetime — date + heure
Datetime now = Datetime.now();
Datetime dt = Datetime.newInstance(2024, 12, 25, 10, 30, 0);
Datetime fromDate = Datetime.newInstance(today, Time.newInstance(0, 0, 0, 0));

// Formatage
String formatted = now.format('yyyy-MM-dd HH:mm:ss');
String isoString = now.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');

// Différence entre deux dates
Integer daysDiff = today.daysBetween(Date.newInstance(2025, 1, 1));
Long msDiff = now.getTime() - Datetime.now().addDays(-1).getTime();
\`\`\`
`,
    tsAnalogy: `
En TypeScript il n'y a qu'un seul type \`number\` (64-bit float) — tu perds de la précision sur les grands entiers et les décimales. En Apex :
- \`Integer\` = entier 32-bit garanti (pas de flottant)
- \`Decimal\` = équivalent à \`BigDecimal\` Java — précision exacte, parfait pour la monnaie
- Le type \`Date\` Apex est différent de \`Date\` JS : il n'a PAS d'heure, c'est juste jour/mois/année
`,
    gotchas: [
      "Integer / Integer = Integer (division entière!) — (Integer)5 / 2 = 2, pas 2.5. Caster en Double/Decimal avant",
      "Decimal.setScale() sans RoundingMode lève une exception si le résultat a plus de décimales",
      "Date.today() retourne la date dans le timezone de l'org, pas UTC",
      "Datetime.now() retourne l'heure UTC dans Apex, mais les formules Salesforce utilisent le TZ user",
    ],
  },

  // ─────────────────────────────────────────────
  // COLLECTIONS
  // ─────────────────────────────────────────────
  {
    id: "collections-list",
    title: "Collections — List<T>",
    category: "Collections",
    tags: ["list", "collections", "iteration"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## List<T> — Le tableau dynamique d'Apex

\`List<T>\` est l'équivalent d'un \`Array\` TypeScript mais avec une API Java-like. C'est la collection la plus utilisée en Apex.

### Création et manipulation

\`\`\`apex
// Création
List<String> names = new List<String>();
List<String> withValues = new List<String>{'Alice', 'Bob', 'Charlie'};
List<Account> accounts = new List<Account>(); // liste de SObjects

// Ajout d'éléments
names.add('Dave');
names.add(0, 'Zara'); // insertion à l'index 0
names.addAll(withValues); // fusion de deux listes

// Accès
String first = names.get(0);    // accès par index
names.set(0, 'Updated');        // modification par index
names.remove(0);                // suppression par index

// Informations
Integer size = names.size();    // nombre d'éléments
Boolean empty = names.isEmpty(); // équivalent size() == 0
Boolean has = names.contains('Bob'); // recherche O(n)

// Itération classique
for (Integer i = 0; i < names.size(); i++) {
    System.debug(names.get(i));
}

// Itération for-each (préférée)
for (String name : names) {
    System.debug(name);
}

// Tri
names.sort(); // tri alphabétique pour les primitifs
\`\`\`

### List de SObjects — pattern critique

\`\`\`apex
// CORRECT : bulk DML
List<Account> accountsToInsert = new List<Account>();
for (Integer i = 0; i < 10; i++) {
    accountsToInsert.add(new Account(Name = 'Account ' + i));
}
insert accountsToInsert; // UN seul appel DML

// INCORRECT : DML dans la boucle (Governor Limit violation!)
for (Integer i = 0; i < 10; i++) {
    Account a = new Account(Name = 'Account ' + i);
    insert a; // 10 appels DML = LIMITE EXPLOSÉE
}
\`\`\`

### Conversion List ↔ Set ↔ Array

\`\`\`apex
List<String> list1 = new List<String>{'a', 'b', 'a'};
Set<String> set1 = new Set<String>(list1);    // dédoublonnage
List<String> list2 = new List<String>(set1);  // Set → List (ordre non garanti)
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript
const names: string[] = [];
names.push('Alice');      // → names.add('Alice')
names[0];                 // → names.get(0)
names.length;             // → names.size()
names.includes('Bob');    // → names.contains('Bob')
for (const name of names) {}  // → for (String name : names) {}
\`\`\`

Différences majeures :
- En Apex il n'y a pas de \`[]\` syntax pour accéder aux éléments — utilise \`.get(i)\`
  (sauf pour les tableaux statiques, rarement utilisés)
- \`add()\` au lieu de \`push()\`
- \`contains()\` au lieu de \`includes()\`
- Pas de méthodes fonctionnelles \`map/filter/reduce\` — il faut écrire des boucles
`,
    gotchas: [
      "Itérer sur une List et la modifier en même temps lève une ConcurrentModificationException",
      "List<T>.sort() fonctionne sur les primitifs mais nécessite d'implémenter Comparable pour les objets custom",
      "names[0] fonctionne aussi en Apex (syntaxe tableau), mais .get(0) est plus idiomatique et clair",
      "Une List non initialisée vaut null — appeler .size() dessus lève une NPE. TOUJOURS initialiser.",
    ],
  },

  {
    id: "collections-set",
    title: "Collections — Set<T>",
    category: "Collections",
    tags: ["set", "collections", "deduplication"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Set<T> — Ensemble sans doublons

\`Set<T>\` garantit l'unicité des éléments. Très utilisé pour les collections d'Ids et la déduplication.

### Usage typique

\`\`\`apex
// Création
Set<String> uniqueNames = new Set<String>();
Set<Id> accountIds = new Set<Id>{'001XXX', '002XXX'};

// Opérations
uniqueNames.add('Alice');
uniqueNames.add('Alice'); // ignoré, déjà présent
Boolean has = uniqueNames.contains('Alice'); // true — O(1) !
uniqueNames.remove('Alice');
Integer size = uniqueNames.size();
Boolean empty = uniqueNames.isEmpty();

// Opérations ensemblistes
Set<String> setA = new Set<String>{'a', 'b', 'c'};
Set<String> setB = new Set<String>{'b', 'c', 'd'};

setA.addAll(setB);     // Union : {a, b, c, d}
setA.retainAll(setB);  // Intersection : garde ce qui est dans les deux
setA.removeAll(setB);  // Différence : retire ce qui est dans setB

// Itération (ordre non garanti !)
for (String name : uniqueNames) {
    System.debug(name);
}
\`\`\`

### Pattern courant : extraction d'Ids puis query

\`\`\`apex
// Étape 1 : extraire les Ids depuis une liste de records
List<Opportunity> opps = [SELECT Id, AccountId FROM Opportunity LIMIT 100];
Set<Id> accountIds = new Set<Id>();
for (Opportunity opp : opps) {
    accountIds.add(opp.AccountId);
}

// Étape 2 : requêter les comptes en une fois (bulkifié)
Map<Id, Account> accountsMap = new Map<Id, Account>(
    [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
);

// Étape 3 : enrichir les opps
for (Opportunity opp : opps) {
    Account acc = accountsMap.get(opp.AccountId);
    if (acc != null) {
        System.debug(opp.Id + ' → ' + acc.Name);
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — Set est très similaire
const ids = new Set<string>();
ids.add('001');
ids.has('001');   // → ids.contains('001') en Apex
ids.delete('001'); // → ids.remove('001') en Apex
ids.size;          // → ids.size() en Apex (méthode, pas propriété!)
\`\`\`

La différence principale : en Apex \`contains()\` pour Set est **O(1)** (hash), alors que \`contains()\` sur une List est **O(n)**. Toujours utiliser Set pour les recherches fréquentes.
`,
    gotchas: [
      "Set ne garantit pas l'ordre d'itération — ne jamais se fier à l'ordre",
      "Set<SObject> compare par référence mémoire, pas par champs — peu utile pour les SObjects",
      "Set<String> est case-sensitive : 'Alice' ≠ 'alice'",
      "Pas de get() sur un Set — convertir en List si besoin d'accès par index",
    ],
  },

  {
    id: "collections-map",
    title: "Collections — Map<K,V>",
    category: "Collections",
    tags: ["map", "collections", "key-value"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Map<K,V> — Dictionnaire clé/valeur

\`Map<K,V>\` est le dictionnaire d'Apex. Le pattern \`Map<Id, SObject>\` est OMNIPRÉSENT en Apex pour éviter les SOQL dans les boucles.

### Création et manipulation

\`\`\`apex
// Création
Map<String, Integer> scores = new Map<String, Integer>();
Map<String, Integer> withValues = new Map<String, Integer>{
    'Alice' => 95,
    'Bob'   => 87
};

// Opérations
scores.put('Charlie', 92);         // ajout/mise à jour
Integer s = scores.get('Alice');   // lecture (null si absent)
scores.remove('Bob');              // suppression
Boolean has = scores.containsKey('Alice'); // vérification clé
Boolean hasVal = scores.containsValue(92); // vérification valeur (O(n))

// Navigation
Set<String> keys = scores.keySet();    // toutes les clés
List<Integer> vals = scores.values();  // toutes les valeurs
Integer size = scores.size();
Boolean empty = scores.isEmpty();

// Itération sur les entrées (via keySet)
for (String key : scores.keySet()) {
    Integer value = scores.get(key);
    System.debug(key + ' : ' + value);
}
\`\`\`

### Pattern fondamental : Map<Id, SObject>

\`\`\`apex
// Pattern 1 : construire la map depuis une requête SOQL
Map<Id, Account> accountMap = new Map<Id, Account>(
    [SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds]
);
// → La Map est construite automatiquement avec Account.Id comme clé

// Pattern 2 : lookup rapide O(1) au lieu de boucle O(n)
Account acc = accountMap.get(someId); // null si non trouvé
if (acc != null) {
    System.debug(acc.Name);
}

// Pattern 3 : map de listes (groupement)
Map<String, List<Contact>> contactsByIndustry = new Map<String, List<Contact>>();
for (Contact c : contacts) {
    String key = c.Account.Industry;
    if (!contactsByIndustry.containsKey(key)) {
        contactsByIndustry.put(key, new List<Contact>());
    }
    contactsByIndustry.get(key).add(c);
}
\`\`\`

### Map<Id, SObject> depuis Trigger.newMap

\`\`\`apex
trigger AccountTrigger on Account (before update) {
    // Trigger.newMap et Trigger.oldMap sont des Map<Id, SObject> gratuits
    Map<Id, Account> newMap = (Map<Id, Account>) Trigger.newMap;
    Map<Id, Account> oldMap = (Map<Id, Account>) Trigger.oldMap;

    for (Id accId : newMap.keySet()) {
        Account newAcc = newMap.get(accId);
        Account oldAcc = oldMap.get(accId);
        if (newAcc.Name != oldAcc.Name) {
            System.debug('Name changed: ' + oldAcc.Name + ' → ' + newAcc.Name);
        }
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — Map très similaire
const scores = new Map<string, number>();
scores.set('Alice', 95);  // → scores.put('Alice', 95)
scores.get('Alice');      // identique
scores.has('Alice');      // → scores.containsKey('Alice')
scores.delete('Bob');     // → scores.remove('Bob')
scores.size;              // → scores.size() (méthode!)
for (const [key, val] of scores) {}  // Apex n'a pas de destructuring
\`\`\`

La grande différence : \`Map<Id, SObject>(soqlResult)\` est un **constructeur magique** Apex qui prend le résultat d'une SOQL et crée la Map automatiquement avec l'Id comme clé. Pas d'équivalent natif en TS.
`,
    gotchas: [
      "map.get(key) retourne null si la clé n'existe pas — toujours vérifier avant d'utiliser",
      "containsValue() est O(n) — éviter dans les boucles",
      "Map<Id, SObject>(queryResult) utilise TOUJOURS le champ Id comme clé — s'assurer que Id est dans la requête SELECT",
      "Les clés String sont case-sensitive dans une Map",
      "Modifier une Map pendant l'itération sur keySet() lève une exception",
    ],
  },

  // ─────────────────────────────────────────────
  // CLASSES & INTERFACES
  // ─────────────────────────────────────────────
  {
    id: "classes-basics",
    title: "Classes — Fondamentaux",
    category: "Classes & POO",
    tags: ["classes", "POO", "modificateurs"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Déclaration de classe en Apex

\`\`\`apex
// Classe simple
public class AccountService {
    // Propriété d'instance
    private String serviceName;

    // Propriété statique (partagée entre toutes les instances)
    public static Integer callCount = 0;

    // Constructeur par défaut
    public AccountService() {
        this.serviceName = 'Default';
    }

    // Constructeur avec paramètres
    public AccountService(String name) {
        this.serviceName = name;
    }

    // Méthode d'instance
    public Account getAccountById(Id accountId) {
        callCount++;
        return [SELECT Id, Name FROM Account WHERE Id = :accountId LIMIT 1];
    }

    // Méthode statique
    public static void resetCallCount() {
        callCount = 0;
    }
}
\`\`\`

## Modificateurs d'accès

| Modificateur | Portée |
|---|---|
| \`private\` | Classe courante uniquement |
| \`protected\` | Classe courante + sous-classes (virtual/abstract) |
| \`public\` | Toutes classes dans le même namespace |
| \`global\` | Toutes classes, y compris packages externes (ISV) |

\`\`\`apex
// global : nécessaire pour les méthodes exposées dans des packages managés
// ou dans des Web Services
global class MyWebService {
    global static String hello(String name) {
        return 'Hello ' + name;
    }
}
\`\`\`

## Overloading (surcharge de méthodes)

\`\`\`apex
public class Calculator {
    // Surcharge par type/nombre de paramètres
    public Integer add(Integer a, Integer b) {
        return a + b;
    }

    public Decimal add(Decimal a, Decimal b) {
        return a + b;
    }

    public Integer add(Integer a, Integer b, Integer c) {
        return a + b + c;
    }
}
\`\`\`

## Héritage — virtual et abstract

\`\`\`apex
// Classe de base — doit être virtual ou abstract pour être étendue
public virtual class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    // Méthode virtuelle — peut être overridée
    public virtual String speak() {
        return 'Generic sound';
    }

    // Méthode finale — NE PEUT PAS être overridée
    public String getName() {
        return this.name;
    }
}

// Sous-classe
public class Dog extends Animal {
    public Dog(String name) {
        super(name); // appel au constructeur parent obligatoire
    }

    public override String speak() { // override explicite obligatoire
        return 'Woof!';
    }
}

// Utilisation
Animal myDog = new Dog('Rex');
System.debug(myDog.speak()); // 'Woof!' — polymorphisme
\`\`\`

## Classe abstraite

\`\`\`apex
public abstract class BaseHandler {
    // Méthode abstraite — doit être implémentée par les sous-classes
    public abstract void handle(List<SObject> records);

    // Méthode concrète partagée par toutes les sous-classes
    public void logAction(String msg) {
        System.debug('[Handler] ' + msg);
    }
}

public class AccountHandler extends BaseHandler {
    public override void handle(List<SObject> records) {
        for (SObject rec : records) {
            logAction('Processing: ' + rec.Id);
        }
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript
class AccountService {
  private serviceName: string;
  static callCount = 0;

  constructor(name = 'Default') {
    this.serviceName = name;
  }
}
\`\`\`

Différences Apex vs TS :
- En Apex, \`override\` est un mot-clé **obligatoire** — TypeScript ne le requiert pas
- En Apex, une méthode ne peut être overridée que si la classe est \`virtual\` ou \`abstract\`
- Pas de \`readonly\` en Apex — utiliser une propriété avec getter uniquement
- Pas de \`private constructor\` singleton pattern directement — utiliser une propriété statique
- \`global\` n'a pas d'équivalent TS — c'est pour les packages managés ISV
`,
    gotchas: [
      "Une classe sans modificateur est implicitement private dans une inner class, mais package-private dans une outer class — toujours être explicite",
      "Pour overrider une méthode, la classe DOIT être virtual ou abstract, ET la méthode aussi doit être virtual/abstract",
      "Le mot-clé override est obligatoire — oublier override ne donne pas d'erreur mais ne surcharge pas non plus si la méthode parent n'est pas virtual",
      "Pas de multiple inheritance — Apex n'a qu'une seule classe parent mais peut implémenter plusieurs interfaces",
    ],
  },

  {
    id: "classes-inner",
    title: "Inner Classes et Interfaces",
    category: "Classes & POO",
    tags: ["inner-classes", "interfaces", "POO"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Inner Classes (classes imbriquées)

\`\`\`apex
public class AccountService {
    // Inner class — utile pour les DTOs, les wrappers
    public class AccountWrapper {
        public Account record;
        public Boolean isNew;
        public String statusLabel;

        public AccountWrapper(Account rec, Boolean isNew) {
            this.record = rec;
            this.isNew = isNew;
            this.statusLabel = isNew ? 'Nouveau' : 'Existant';
        }
    }

    // Inner class d'exception custom
    public class AccountNotFoundException extends Exception {}

    public Account findByName(String name) {
        List<Account> results = [SELECT Id, Name FROM Account WHERE Name = :name LIMIT 1];
        if (results.isEmpty()) {
            throw new AccountNotFoundException('Account not found: ' + name);
        }
        return results[0];
    }
}

// Utilisation depuis l'extérieur
AccountService.AccountWrapper wrapper = new AccountService.AccountWrapper(acc, true);
\`\`\`

## Interfaces

\`\`\`apex
// Déclaration d'interface
public interface Serializable {
    String serialize();
    void deserialize(String json);
}

public interface Auditable {
    String getAuditLog();
}

// Implémentation multiple d'interfaces
public class AccountData implements Serializable, Auditable {
    public String name;
    private List<String> logs = new List<String>();

    public String serialize() {
        return JSON.serialize(this);
    }

    public void deserialize(String jsonStr) {
        AccountData deserialized = (AccountData) JSON.deserialize(jsonStr, AccountData.class);
        this.name = deserialized.name;
    }

    public String getAuditLog() {
        return String.join(logs, '\\n');
    }
}
\`\`\`

## Interface Comparable — pour le tri custom

\`\`\`apex
public class Employee implements Comparable {
    public String name;
    public Integer salary;

    public Employee(String name, Integer salary) {
        this.name = name;
        this.salary = salary;
    }

    // Obligatoire pour implémenter Comparable
    public Integer compareTo(Object other) {
        Employee otherEmp = (Employee) other;
        if (this.salary == otherEmp.salary) return 0;
        if (this.salary > otherEmp.salary) return 1;
        return -1;
    }
}

// Utilisation
List<Employee> employees = new List<Employee>{
    new Employee('Bob', 50000),
    new Employee('Alice', 75000),
    new Employee('Charlie', 60000)
};
employees.sort(); // trie par salary grâce à compareTo
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — interface avec implémentation multiple
interface Serializable {
  serialize(): string;
}
interface Auditable {
  getAuditLog(): string;
}
class AccountData implements Serializable, Auditable { ... }
\`\`\`

Les interfaces Apex sont très similaires à TypeScript. Différences :
- Pas de types génériques dans les interfaces Apex (\`interface Repo<T>\` n'existe pas)
- L'interface \`Comparable\` est l'interface STANDARD pour permettre le tri — équivalent à implémenter un comparateur
- Les inner classes sont accessibles via \`OuterClass.InnerClass\` (comme un namespace)
`,
    gotchas: [
      "Les interfaces Apex ne peuvent pas avoir de propriétés — seulement des signatures de méthodes",
      "Comparable.compareTo() prend un Object — toujours caster explicitement et gérer le cas null",
      "Les inner classes ne peuvent pas être static en Apex (contrairement à Java) — elles ont accès aux membres de la classe externe",
      "Une interface ne peut pas étendre plusieurs interfaces en Apex (contrairement à Java/TS)",
    ],
  },

  // ─────────────────────────────────────────────
  // ENUMS
  // ─────────────────────────────────────────────
  {
    id: "enums",
    title: "Enums",
    category: "Types & Variables",
    tags: ["enum", "types"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Enums en Apex

\`\`\`apex
// Déclaration d'enum
public enum Season {
    SPRING, SUMMER, FALL, WINTER
}

// Enum avec utilisation
Season current = Season.SUMMER;

if (current == Season.SUMMER) {
    System.debug('Vacances !');
}

// Switch sur enum
switch on current {
    when SPRING { System.debug('Printemps'); }
    when SUMMER { System.debug('Été'); }
    when FALL   { System.debug('Automne'); }
    when WINTER { System.debug('Hiver'); }
}

// Méthodes disponibles sur les valeurs d'enum
String name = current.name();    // 'SUMMER'
Integer ordinal = current.ordinal(); // 1 (index 0-based)

// Obtenir toutes les valeurs
List<Season> all = Season.values();
\`\`\`

## Enums imbriqués dans une classe

\`\`\`apex
public class OrderService {
    public enum OrderStatus {
        DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
    }

    public void processOrder(OrderStatus status) {
        if (status == OrderStatus.APPROVED) {
            // traitement
        }
    }
}

// Usage externe
OrderService.OrderStatus s = OrderService.OrderStatus.APPROVED;
\`\`\`

## Enum vs Picklist Salesforce

\`\`\`apex
// Apex Enum : pour la logique interne du code
public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }

// Picklist Salesforce : valeur de champ sur un SObject
// Accès : (String) myRecord.Priority__c
// Comparaison : myRecord.Priority__c == 'High'
// ⚠️ Les picklists sont des Strings en Apex, pas des enums natifs

// Pattern pour lier les deux
public enum PriorityLevel { LOW, MEDIUM, HIGH }

public PriorityLevel fromPicklist(String picklistValue) {
    if (picklistValue == 'High') return PriorityLevel.HIGH;
    if (picklistValue == 'Medium') return PriorityLevel.MEDIUM;
    return PriorityLevel.LOW;
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript
enum Season { SPRING, SUMMER, FALL, WINTER }
const s: Season = Season.SUMMER;

// TypeScript enum numérique
Season.SUMMER === 1 // true
\`\`\`

Différences :
- En Apex, les enums n'ont **pas de valeur numérique assignable** (\`enum Color { RED = 1 }\` n'existe pas)
- \`ordinal()\` donne la position (0-based), \`name()\` donne le nom string
- Pas de string enum en Apex — si tu as besoin de valeurs string custom, utilise un map statique
- Les picklists Salesforce (champs sur les objets) sont des **String**, pas des enums — attention à ne pas les confondre
`,
    gotchas: [
      "Les valeurs picklist sur les SObjects sont des String en Apex — myRecord.Status__c == 'Active', pas Status.ACTIVE",
      "Enum.name() est case-sensitive et retourne exactement le nom déclaré : 'SUMMER', pas 'Summer'",
      "Comparer une enum à null est possible (Season current = null) — gérer ce cas",
      "Pas de méthode valueOf() sur les enums Apex contrairement à Java",
    ],
  },

  // ─────────────────────────────────────────────
  // NULL SAFETY
  // ─────────────────────────────────────────────
  {
    id: "null-safety",
    title: "Null Safety — L'absence de sécurité",
    category: "Types & Variables",
    tags: ["null", "NPE", "sécurité"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Apex et le null — un terrain miné

En Apex, **tout peut être null** par défaut. Il n'y a pas d'optional chaining (\`?.\`), pas de nullish coalescing (\`??\`), et pas de types non-nullables natifs.

### NullPointerException (NPE) — les cas courants

\`\`\`apex
// NPE classique 1 : variable non initialisée
String name;
Integer len = name.length(); // BOOM : NullPointerException

// NPE classique 2 : résultat de query vide
Account acc = [SELECT Id FROM Account WHERE Name = 'Inconnu' LIMIT 1];
// Si aucun résultat → QueryException, pas NPE
// Mais si tu fais :
List<Account> accs = [SELECT Id FROM Account WHERE Name = 'Inconnu'];
Account first = accs[0]; // BOOM si liste vide

// NPE classique 3 : relation traversée sans vérification
Contact c = [SELECT Id, Account.Name FROM Contact LIMIT 1];
String accountName = c.Account.Name; // BOOM si c.AccountId est null

// NPE classique 4 : Map.get() retourne null
Map<String, Account> accountMap = new Map<String, Account>();
Account acc2 = accountMap.get('missing');
String n = acc2.Name; // BOOM

// NPE classique 5 : Boolean null dans un if
Boolean isActive;
if (isActive) { // BOOM si isActive est null
    System.debug('active');
}
\`\`\`

### Patterns de protection

\`\`\`apex
// Pattern 1 : vérification explicite
String name = null;
if (name != null) {
    Integer len = name.length(); // sûr
}

// Pattern 2 : initialisation par défaut
String name2 = '';
Boolean flag = false;

// Pattern 3 : null-safe traversal de relations
Contact c = [SELECT Id, AccountId, Account.Name FROM Contact LIMIT 1];
String accountName = (c.AccountId != null && c.Account != null)
    ? c.Account.Name
    : 'Aucun compte';

// Pattern 4 : opérateur ternaire comme nullish coalescing
String value = null;
String safeValue = value != null ? value : 'default'; // équivalent de value ?? 'default'

// Pattern 5 : String.isBlank() / String.isNotBlank()
String input = null;
if (!String.isBlank(input)) { // gère null ET ''
    System.debug(input.toLowerCase()); // sûr
}

// Pattern 6 : liste sûre
List<Account> accounts;
if (accounts == null) {
    accounts = new List<Account>();
}
// ou directement
List<Account> accounts2 = accounts != null ? accounts : new List<Account>();
\`\`\`

### Null et les comparaisons

\`\`\`apex
// null comparé à des primitifs
Integer n = null;
System.debug(n == null);  // true
System.debug(n == 0);     // false (null ≠ 0!)
System.debug(n < 5);      // false (pas d'exception pour les comparaisons numériques)
System.debug(n > 5);      // false

// null et String
String s = null;
System.debug(s == null);       // true
System.debug(s == '');         // false
System.debug(String.isBlank(s)); // true (null ET '' sont "blank")
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// En TypeScript tu as ces outils que l'Apex N'A PAS :
const name: string | null = null;
const len = name?.length;         // optional chaining → undefined si null
const val = name ?? 'default';    // nullish coalescing
const safeName: string = name!;   // non-null assertion (dangereux mais disponible)

// Ce que tu dois faire en Apex à la place :
// → null check explicite à chaque fois
// → String.isBlank() pour les strings (gère null + '')
// → Ternaire pour la valeur par défaut
\`\`\`

En Apex il n'y a **aucun sucre syntaxique** pour gérer null. C'est la principale source de bugs pour les débutants venant de TS/JS moderne.
`,
    gotchas: [
      "String.isBlank(null) retourne true — utilise ça pour vérifier les strings en une fois",
      "Boolean non initialisé = null, pas false. if(myBool) où myBool est null lève une NPE",
      "Accéder à une relation (c.Account.Name) sans vérifier que Account n'est pas null est le bug #1 en Apex",
      "SOQL avec LIMIT 1 sans résultat lève QueryException, pas retourne null — utilise une List si tu n'es pas sûr qu'il y a un résultat",
      "null == null est true en Apex (contrairement à NaN == NaN en JS)",
    ],
  },

  // ─────────────────────────────────────────────
  // STRING MANIPULATION
  // ─────────────────────────────────────────────
  {
    id: "string-manipulation",
    title: "Manipulation de Strings",
    category: "Types & Variables",
    tags: ["string", "manipulation", "format"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Méthodes String essentielles

\`\`\`apex
String s = 'Hello World Salesforce';

// Navigation
Integer len = s.length();              // 22
String sub = s.substring(0, 5);        // 'Hello'
String sub2 = s.substringAfter(' ');   // 'World Salesforce'
String sub3 = s.substringBefore(' ');  // 'Hello'
Integer idx = s.indexOf('World');       // 6
Integer last = s.lastIndexOf('l');      // 14
String first1 = s.left(5);             // 'Hello'
String last1 = s.right(10);            // 'Salesforce'

// Vérifications
Boolean contains = s.contains('World');       // true
Boolean starts = s.startsWith('Hello');       // true
Boolean ends = s.endsWith('force');           // true
Boolean blank = String.isBlank('');           // true
Boolean blank2 = String.isBlank(null);        // true
Boolean notBlank = String.isNotBlank('hi');   // true

// Transformation
String upper = s.toUpperCase();               // 'HELLO WORLD SALESFORCE'
String lower = s.toLowerCase();               // 'hello world salesforce'
String trimmed = '  hello  '.trim();          // 'hello'
String replaced = s.replace('World', 'SFDC'); // 'Hello SFDC Salesforce'
String replaceAll = s.replaceAll('[aeiou]', '*'); // regex supportée

// Split / Join
List<String> parts = s.split(' ');            // ['Hello', 'World', 'Salesforce']
String joined = String.join(parts, '-');       // 'Hello-World-Salesforce'

// Comparaisons
Boolean eq = s.equals('Hello World Salesforce');     // true (case-sensitive)
Boolean eqIgnore = s.equalsIgnoreCase('hello world salesforce'); // true
Integer comp = s.compareTo('Hello');                  // >0 (lexicographique)

// Vérifications de type
Boolean isNum = '123'.isNumeric();    // true
Boolean isAlpha = 'abc'.isAlpha();    // true
\`\`\`

## String.format() — l'équivalent des template literals

\`\`\`apex
// Pas de template literals en Apex — utiliser String.format()
String name = 'Alice';
Integer score = 95;

// String.format() avec placeholders {0}, {1}, ...
String msg = String.format(
    'Bonjour {0}, ton score est {1}/100',
    new List<Object>{name, score}
);
// 'Bonjour Alice, ton score est 95/100'

// Concaténation simple (alternative)
String msg2 = 'Bonjour ' + name + ', ton score est ' + score + '/100';

// String.format() pour les dates
String dateStr = String.format(
    'Date : {0}/{1}/{2}',
    new List<Object>{today.day(), today.month(), today.year()}
);
\`\`\`

## Caractères d'échappement

\`\`\`apex
// Strings avec guillemets simples (attention !)
String s1 = 'It\\'s a test';        // apostrophe échappée
String s2 = 'Line1\\nLine2';         // saut de ligne
String s3 = 'Tab\\there';            // tabulation
String s4 = 'C:\\\\path\\\\to\\\\file'; // backslash

// Pas de guillemets doubles pour les strings en Apex
// "hello" → ERREUR de compilation
// 'hello' → correct
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript
const name = 'Alice';
const score = 95;
const msg = \`Bonjour \${name}, ton score est \${score}/100\`; // template literal

// Apex n'a pas de template literals — String.format() ou concaténation
// String.format('Bonjour {0}, ton score est {1}/100', new List<Object>{name, score})
\`\`\`

Autres différences :
- \`includes()\` → \`contains()\` en Apex
- \`startsWith()\` identique (nom identique)
- \`slice()\` → \`substring()\` en Apex
- \`split()\` similaire mais retourne une \`List<String>\`
- En Apex les strings utilisent des **guillemets simples uniquement**
`,
    gotchas: [
      'Les guillemets doubles ("hello") ne sont PAS valides pour les strings Apex — seulement les guillemets simples',
      "String.format() avec le mauvais nombre d'arguments lève une exception à l'exécution",
      "replace() en Apex supporte les regex (contrairement à replaceFirst implicite) — vérifier le pattern",
      "split() avec un pattern regex peut se comporter différemment — le '.' en regex = n'importe quel char, utiliser '\\\\.' pour un point littéral",
      "String est immutable en Apex (comme en TS/Java) — chaque transformation crée un nouveau String",
    ],
  },

  // ─────────────────────────────────────────────
  // EXCEPTION HANDLING
  // ─────────────────────────────────────────────
  {
    id: "exception-handling",
    title: "Gestion des exceptions",
    category: "Control Flow",
    tags: ["exceptions", "try-catch", "erreurs"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## try/catch/finally en Apex

\`\`\`apex
try {
    // Code susceptible de lever une exception
    Account acc = [SELECT Id FROM Account WHERE Id = :someId LIMIT 1];
    update acc;
} catch (QueryException e) {
    // Aucun résultat retourné par la query
    System.debug('Query failed: ' + e.getMessage());
} catch (DmlException e) {
    // Erreur lors d'une opération DML
    System.debug('DML failed: ' + e.getMessage());
    System.debug('Status code: ' + e.getDmlStatusCode(0));
    System.debug('Field: ' + e.getDmlFieldNames(0));
} catch (Exception e) {
    // Catch-all — toujours en dernier
    System.debug('Unexpected error: ' + e.getMessage());
    System.debug('Stack trace: ' + e.getStackTraceString());
    System.debug('Type: ' + e.getTypeName());
} finally {
    // Toujours exécuté, erreur ou pas
    System.debug('Nettoyage terminé');
}
\`\`\`

## Exceptions standard Apex

\`\`\`apex
// Les exceptions les plus courantes à PD1/PD2

// QueryException : aucun résultat pour une query qui en attend un
try {
    Account a = [SELECT Id FROM Account WHERE Name = 'Missing'];
} catch (QueryException e) { /* ... */ }

// DmlException : erreur lors d'insert/update/delete
try {
    insert new Account(); // Name est obligatoire → DmlException
} catch (DmlException e) {
    // e.getDmlStatusCode(0) → 'REQUIRED_FIELD_MISSING'
    // e.getDmlFieldNames(0) → ['Name']
    // e.getDmlMessage(0) → message lisible
}

// NullPointerException : accès à null
try {
    String s = null;
    Integer len = s.length();
} catch (NullPointerException e) { /* ... */ }

// LimitException : Governor Limit dépassée (NE PEUT PAS être catchée)
// → provoque un arrêt immédiat de l'exécution

// MathException : division par zéro
try {
    Integer result = 10 / 0;
} catch (MathException e) { /* ... */ }

// TypeException : cast invalide
try {
    Object obj = 'hello';
    Integer i = (Integer) obj;
} catch (TypeException e) { /* ... */ }
\`\`\`

## Custom Exceptions

\`\`\`apex
// Déclaration — DOIT étendre Exception
public class AccountValidationException extends Exception {}
public class NotFoundException extends Exception {
    private String entityType;

    public NotFoundException(String entityType, String message) {
        this(message); // appel au constructeur Exception(String)
        this.entityType = entityType;
    }

    public String getEntityType() {
        return entityType;
    }
}

// Usage
try {
    if (accounts.isEmpty()) {
        throw new NotFoundException('Account', 'No accounts found for criteria');
    }
} catch (NotFoundException e) {
    System.debug('Entity: ' + e.getEntityType());
    System.debug('Message: ' + e.getMessage());
}
\`\`\`

## DmlException — méthodes spécifiques

\`\`\`apex
// Lors d'une DML sur une liste, plusieurs records peuvent échouer
try {
    Database.SaveResult[] results = Database.insert(accounts, false); // allOrNone=false
    for (Database.SaveResult sr : results) {
        if (!sr.isSuccess()) {
            for (Database.Error err : sr.getErrors()) {
                System.debug('Error: ' + err.getMessage());
                System.debug('Fields: ' + err.getFields());
                System.debug('Status: ' + err.getStatusCode());
            }
        }
    }
} catch (Exception e) {
    // Catch pour les erreurs inattendues
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — très similaire
try {
  const result = await someOperation();
} catch (e) {
  if (e instanceof QueryError) { /* ... */ }
  else if (e instanceof DmlError) { /* ... */ }
  else throw e; // re-throw si non géré
} finally {
  cleanup();
}
\`\`\`

Différences :
- En Apex on peut catcher par **type d'exception spécifique** avant le catch-all (comme Java)
- \`LimitException\` ne peut **PAS** être catchée — si tu exploses une governor limit, c'est game over
- Les méthodes spécifiques des exceptions DML (\`getDmlMessage\`, \`getDmlFieldNames\`) n'ont pas d'équivalent TS
- Les custom exceptions DOIVENT étendre \`Exception\` — pas de \`throw new Error()\` libre
`,
    gotchas: [
      "LimitException (Governor Limits) NE PEUT PAS être catchée — le code s'arrête immédiatement",
      "Attraper Exception comme catch-all AVANT un catch plus spécifique est une erreur de compilation",
      "Une custom exception doit OBLIGATOIREMENT finir par 'Exception' (ex: AccountException) — convention ET obligation",
      "Ne jamais ignorer silencieusement une DmlException — toujours logger le statusCode et les champs",
      "La LimitException n'est pas catchable, mais on peut prévenir avec la classe Limits (voir lesson Governor Limits)",
    ],
  },

  // ─────────────────────────────────────────────
  // DML OPERATIONS
  // ─────────────────────────────────────────────
  {
    id: "dml-basics",
    title: "DML — insert, update, delete, upsert",
    category: "DML & Base de données",
    tags: ["DML", "insert", "update", "delete", "upsert"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## DML — Data Manipulation Language

Les opérations DML permettent de créer/modifier/supprimer des records Salesforce. Elles consomment des **Governor Limits** (max 150 DML statements par transaction).

### Syntaxe DML directe

\`\`\`apex
// INSERT — créer
Account newAccount = new Account(Name = 'Acme Corp', Industry = 'Technology');
insert newAccount;
// Après insert, newAccount.Id est automatiquement rempli !
System.debug('New ID: ' + newAccount.Id);

// INSERT sur une liste (bulk — une seule DML statement)
List<Account> accounts = new List<Account>{
    new Account(Name = 'Corp A'),
    new Account(Name = 'Corp B')
};
insert accounts; // UN seul DML statement, peu importe la taille de la liste

// UPDATE — modifier
Account acc = [SELECT Id, Name FROM Account WHERE Id = :someId LIMIT 1];
acc.Name = 'New Name';
update acc;

// DELETE — supprimer
Account toDelete = [SELECT Id FROM Account WHERE Name = 'Old Corp' LIMIT 1];
delete toDelete;

// UNDELETE — restaurer depuis la corbeille
Account deleted = [SELECT Id FROM Account WHERE Name = 'Old Corp' LIMIT 1 ALL ROWS];
undelete deleted;

// UPSERT — insert ou update selon une clé externe
Account acc2 = new Account(
    Name = 'Upserted Corp',
    External_Id__c = 'EXT-001'
);
upsert acc2 External_Id__c; // upsert sur le champ External_Id__c
// Si External_Id__c existe déjà → update, sinon → insert
\`\`\`

### Merge — fusionner des records

\`\`\`apex
// MERGE — fusionne deux records en un (le master garde les enfants)
Account master = [SELECT Id FROM Account WHERE Name = 'Corp A' LIMIT 1];
Account duplicate = [SELECT Id FROM Account WHERE Name = 'Corp A (duplicate)' LIMIT 1];
merge master duplicate;
// duplicate est supprimé, ses enfants (Contacts, Opportunities) sont rattachés à master
\`\`\`
`,
    tsAnalogy: `
En TypeScript (avec un ORM comme Prisma ou Drizzle) :
\`\`\`typescript
// Prisma
const account = await prisma.account.create({ data: { name: 'Acme' } });
await prisma.account.update({ where: { id }, data: { name: 'New' } });
await prisma.account.delete({ where: { id } });
\`\`\`

En Apex, la DML est **directement dans le code** sans async/await — elle est synchrone et transactionnelle par défaut. Si un statement DML échoue, TOUTE la transaction est rollbackée.
`,
    gotchas: [
      "Après un insert, l'objet Apex est automatiquement mis à jour avec l'Id — inutile de faire une query ensuite",
      "DML dans une boucle = violation des Governor Limits — TOUJOURS bulk les DML",
      "Un seul DML statement peut traiter des milliers de records — c'est voulu, c'est la force du bulk",
      "upsert sans clé externe spécifiée utilise l'Id comme critère de match",
      "merge est limité aux types d'objets supportés (Account, Contact, Lead, Case) — pas sur tous les objets",
    ],
  },

  {
    id: "dml-database-methods",
    title: "DML — Database.insert() vs insert statement",
    category: "DML & Base de données",
    tags: ["DML", "Database", "allOrNone", "partial success"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Database Methods vs DML Statements

### Différence fondamentale

\`\`\`apex
// DML Statement : tout ou rien
try {
    insert accounts; // si 1 record échoue → TOUTE la liste échoue (rollback)
} catch (DmlException e) {
    System.debug(e.getMessage());
}

// Database.insert() avec allOrNone=false : succès partiel possible
Database.SaveResult[] results = Database.insert(accounts, false);
for (Integer i = 0; i < results.size(); i++) {
    Database.SaveResult sr = results[i];
    if (sr.isSuccess()) {
        System.debug('Inserted: ' + sr.getId());
    } else {
        for (Database.Error err : sr.getErrors()) {
            System.debug('Failed record ' + i + ': ' + err.getMessage());
            System.debug('Fields: ' + err.getFields());
        }
    }
}
\`\`\`

### Toutes les méthodes Database

\`\`\`apex
// Database.insert() → SaveResult[]
Database.SaveResult[] insResults = Database.insert(recordList, false);

// Database.update() → SaveResult[]
Database.SaveResult[] updResults = Database.update(recordList, false);

// Database.upsert() → UpsertResult[]
Database.UpsertResult[] upsResults = Database.upsert(recordList, External_Id__c, false);

// Database.delete() → DeleteResult[]
Database.DeleteResult[] delResults = Database.delete(recordList, false);

// Database.undelete() → UndeleteResult[]
Database.UndeleteResult[] undelResults = Database.undelete(recordList, false);

// Database.merge() → MergeResult
Database.MergeResult mergeResult = Database.merge(masterRecord, duplicateId, false);

// Interroger les résultats
for (Database.SaveResult sr : insResults) {
    if (sr.isSuccess()) {
        Id newId = sr.getId();
    } else {
        List<Database.Error> errors = sr.getErrors();
        for (Database.Error e : errors) {
            System.debug('Code: ' + e.getStatusCode());
            System.debug('Msg: ' + e.getMessage());
            System.debug('Fields: ' + e.getFields());
        }
    }
}
\`\`\`

### Quand utiliser quoi

| Situation | Utiliser |
|---|---|
| Erreur = problème critique | \`insert records;\` (DML statement) |
| Imports en masse avec erreurs partielles OK | \`Database.insert(records, false)\` |
| Log des erreurs record par record | \`Database.insert(records, false)\` |
| Trigger simple | DML statement dans le service |
| Batch / intégration | \`Database.insert(records, false)\` |
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript avec Prisma — équivalent conceptuel
// allOrNone = true (défaut) → transaction atomique
await prisma.$transaction(async (tx) => {
  await tx.account.createMany({ data: accounts });
});

// allOrNone = false → pas d'équivalent natif en Prisma standard
// Il faut faire un try/catch par record
for (const account of accounts) {
  try {
    await prisma.account.create({ data: account });
  } catch (e) {
    console.error('Failed:', e);
  }
}
\`\`\`

Database.insert(records, false) est un concept **unique à Apex/Salesforce** — très puissant pour les intégrations.
`,
    gotchas: [
      "allOrNone=true (défaut) = une erreur rollback tout. allOrNone=false = rollback seulement les records en erreur",
      "Même avec allOrNone=false, une LimitException rollback tout",
      "Database.insert(records, false) compte quand même comme 1 DML statement (pas autant que de records)",
      "Le SaveResult[i].getId() retourne null si le record a échoué — toujours vérifier isSuccess() d'abord",
    ],
  },

  // ─────────────────────────────────────────────
  // TRIGGERS
  // ─────────────────────────────────────────────
  {
    id: "triggers-basics",
    title: "Triggers — Syntaxe et context variables",
    category: "Triggers",
    tags: ["trigger", "context", "DML", "before", "after"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Qu'est-ce qu'un Trigger ?

Un trigger est du code Apex qui s'exécute **automatiquement** avant ou après une opération DML sur un objet Salesforce. C'est l'équivalent d'un event listener sur les opérations de base de données.

### Syntaxe de base

\`\`\`apex
trigger AccountTrigger on Account (
    before insert,
    before update,
    before delete,
    after insert,
    after update,
    after delete,
    after undelete
) {
    // Code ici
}
\`\`\`

### Context Variables — le coeur des triggers

\`\`\`apex
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {

    // Trigger.new : List<SObject> des records NEW (insert, update, undelete)
    // Modifiable dans before triggers
    List<Account> newRecords = Trigger.new;

    // Trigger.old : List<SObject> des records AVANT modification (update, delete)
    // Read-only
    List<Account> oldRecords = Trigger.old;

    // Trigger.newMap : Map<Id, SObject> de Trigger.new (disponible en update/after insert)
    Map<Id, Account> newMap = (Map<Id, Account>) Trigger.newMap;

    // Trigger.oldMap : Map<Id, SObject> de Trigger.old
    Map<Id, Account> oldMap = (Map<Id, Account>) Trigger.oldMap;

    // Détection de l'opération
    if (Trigger.isInsert)  { /* insert */ }
    if (Trigger.isUpdate)  { /* update */ }
    if (Trigger.isDelete)  { /* delete */ }
    if (Trigger.isUndelete){ /* undelete */ }

    // Détection du timing
    if (Trigger.isBefore)  { /* avant la DML */ }
    if (Trigger.isAfter)   { /* après la DML, Id disponible */ }

    // Taille du batch en cours
    Integer batchSize = Trigger.size;
}
\`\`\`

### Disponibilité des variables par opération

| Variable | before insert | before update | before delete | after insert | after update | after delete |
|---|---|---|---|---|---|---|
| Trigger.new | ✅ modifiable | ✅ modifiable | ❌ | ✅ readonly | ✅ readonly | ❌ |
| Trigger.newMap | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Trigger.old | ❌ | ✅ readonly | ✅ readonly | ❌ | ✅ readonly | ✅ readonly |
| Trigger.oldMap | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |

### Exemple concret : before update (modification de champs)

\`\`\`apex
trigger AccountTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);

        // Modification directe du record (avant que Salesforce le sauvegarde)
        if (acc.Name != oldAcc.Name) {
            acc.Description = 'Renommé le ' + Date.today().format();
        }

        // Validation
        if (acc.AnnualRevenue != null && acc.AnnualRevenue < 0) {
            acc.addError('AnnualRevenue cannot be negative');
            // addError marque le record comme invalide → DML échoue pour ce record
        }
    }
}
\`\`\`

### Exemple : after insert (créer des records liés)

\`\`\`apex
trigger AccountTrigger on Account (after insert) {
    // Créer un Contact par défaut pour chaque nouveau compte
    List<Contact> contactsToCreate = new List<Contact>();

    for (Account acc : Trigger.new) {
        contactsToCreate.add(new Contact(
            LastName = 'Contact Principal',
            AccountId = acc.Id  // Id disponible après insert !
        ));
    }

    if (!contactsToCreate.isEmpty()) {
        insert contactsToCreate; // DML bulk
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : un middleware Express ou un hook NestJS
@BeforeInsert()
async beforeInsert(entity: Account) {
  // Équivalent d'un before insert trigger
  entity.description = 'Created ' + new Date();
}

// Ou un event listener :
eventEmitter.on('account.beforeInsert', (records: Account[]) => {
  // Traitement bulk de tous les records
});
\`\`\`

La grande différence : les triggers Apex reçoivent **toujours une liste** (même pour un seul record) — ils sont conçus pour le traitement en masse (bulkification obligatoire).
`,
    gotchas: [
      "Trigger.new est modifiable UNIQUEMENT dans les before triggers — tenter de modifier en after trigger lève une erreur",
      "Trigger.newMap n'est PAS disponible dans before insert (les Id n'existent pas encore)",
      "Ne jamais faire de DML dans une boucle Trigger — bulk toujours",
      "addError() sur un record invalide TOUS les records dans une transaction all-or-none",
      "Trigger.new est casté implicitement en List<SObject> — pour accéder aux champs custom, toujours caster : (List<Account>)Trigger.new ou utiliser directement Account acc : Trigger.new",
    ],
  },

  {
    id: "trigger-handler-pattern",
    title: "Trigger Handler Pattern",
    category: "Triggers",
    tags: ["trigger", "pattern", "handler", "architecture"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Pourquoi le Trigger Handler Pattern ?

### Le problème avec les triggers "fat"

\`\`\`apex
// ❌ MAUVAIS : toute la logique dans le trigger
trigger AccountTrigger on Account (before insert, before update, after insert) {
    // 500 lignes de code ici
    // Impossible à tester unitairement
    // Impossible à réutiliser
    // Impossible à maintenir
}
\`\`\`

### Pattern : One Trigger per Object

\`\`\`apex
// ✅ BON : le trigger délègue à un handler
trigger AccountTrigger on Account (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    AccountTriggerHandler handler = new AccountTriggerHandler();

    if (Trigger.isBefore) {
        if (Trigger.isInsert) handler.onBeforeInsert(Trigger.new);
        if (Trigger.isUpdate) handler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
        if (Trigger.isDelete) handler.onBeforeDelete(Trigger.old);
    }

    if (Trigger.isAfter) {
        if (Trigger.isInsert) handler.onAfterInsert(Trigger.new);
        if (Trigger.isUpdate) handler.onAfterUpdate(Trigger.new, Trigger.oldMap);
        if (Trigger.isDelete) handler.onAfterDelete(Trigger.old);
        if (Trigger.isUndelete) handler.onAfterUndelete(Trigger.new);
    }
}
\`\`\`

### Le Handler

\`\`\`apex
public class AccountTriggerHandler {

    public void onBeforeInsert(List<Account> newAccounts) {
        AccountService.validateAndEnrichAccounts(newAccounts);
    }

    public void onBeforeUpdate(
        List<Account> newAccounts,
        Map<Id, Account> oldMap
    ) {
        AccountService.detectChangesAndValidate(newAccounts, oldMap);
    }

    public void onAfterInsert(List<Account> newAccounts) {
        AccountService.createDefaultContacts(newAccounts);
    }

    public void onAfterUpdate(
        List<Account> newAccounts,
        Map<Id, Account> oldMap
    ) {
        List<Account> renamedAccounts = new List<Account>();
        for (Account acc : newAccounts) {
            if (acc.Name != oldMap.get(acc.Id).Name) {
                renamedAccounts.add(acc);
            }
        }
        if (!renamedAccounts.isEmpty()) {
            AccountService.notifyRename(renamedAccounts);
        }
    }

    public void onBeforeDelete(List<Account> oldAccounts) { /* ... */ }
    public void onAfterDelete(List<Account> oldAccounts) { /* ... */ }
    public void onAfterUndelete(List<Account> newAccounts) { /* ... */ }
}
\`\`\`

## Prévention de la récursion

\`\`\`apex
// Problème : Trigger A modifie Account → déclenche AccountTrigger → qui modifie Account → boucle infinie
// Solution : flag statique (vivant pendant toute la transaction)

public class TriggerUtils {
    // Variable statique = partagée dans toute la transaction
    private static Boolean accountTriggerRunning = false;

    public static Boolean isAccountTriggerRunning() {
        return accountTriggerRunning;
    }

    public static void setAccountTriggerRunning(Boolean value) {
        accountTriggerRunning = value;
    }
}

// Dans le trigger
trigger AccountTrigger on Account (after update) {
    if (!TriggerUtils.isAccountTriggerRunning()) {
        TriggerUtils.setAccountTriggerRunning(true);
        try {
            AccountTriggerHandler handler = new AccountTriggerHandler();
            handler.onAfterUpdate(Trigger.new, Trigger.oldMap);
        } finally {
            TriggerUtils.setAccountTriggerRunning(false);
        }
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie NestJS : un EventListener qui délègue à un Service
@Injectable()
export class AccountEventsListener {
  constructor(private accountService: AccountService) {}

  @OnEvent('account.beforeInsert')
  async handleBeforeInsert(accounts: Account[]) {
    await this.accountService.validateAndEnrich(accounts);
  }
}
\`\`\`

Le Trigger Handler Pattern = **séparation des responsabilités** : le trigger est juste un routeur, la logique métier est dans les services. Exactement comme un controller NestJS qui délègue à un service.
`,
    gotchas: [
      "Les variables statiques persistent pendant TOUTE la transaction Apex (pas seulement l'exécution du trigger) — idéal pour la prévention de récursion mais attention aux side effects",
      "Un seul trigger par objet est la règle — Salesforce permet plusieurs triggers mais l'ordre d'exécution n'est pas garanti",
      "Le handler doit recevoir Trigger.new/old en paramètre, pas y accéder directement (pour les tests)",
      "finally est important dans la récursion guard — sinon le flag reste true en cas d'exception",
    ],
  },

  {
    id: "trigger-bulkification",
    title: "Bulkification des Triggers",
    category: "Triggers",
    tags: ["trigger", "bulk", "governor-limits", "performance"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## La Bulkification — règle fondamentale

Un trigger peut recevoir jusqu'à **200 records** en une seule exécution (taille d'un batch DML). Il DOIT traiter tous ces records efficacement.

### ❌ Code non bulkifié — explosera en production

\`\`\`apex
trigger ContactTrigger on Contact (after insert) {
    for (Contact c : Trigger.new) {
        // ERREUR : SOQL dans la boucle
        Account acc = [SELECT Id, Name FROM Account WHERE Id = :c.AccountId LIMIT 1];

        // ERREUR : DML dans la boucle
        Task t = new Task(
            Subject = 'Follow up with ' + acc.Name,
            WhoId = c.Id
        );
        insert t;
    }
}
// Avec 200 contacts → 200 SOQL + 200 DML = LIMIT EXPLOSÉE
\`\`\`

### ✅ Code bulkifié — correct

\`\`\`apex
trigger ContactTrigger on Contact (after insert) {
    // Étape 1 : collecter tous les Ids en une passe
    Set<Id> accountIds = new Set<Id>();
    for (Contact c : Trigger.new) {
        if (c.AccountId != null) {
            accountIds.add(c.AccountId);
        }
    }

    // Étape 2 : UNE seule SOQL pour tous les comptes
    Map<Id, Account> accountMap = new Map<Id, Account>(
        [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
    );

    // Étape 3 : construire toutes les tasks
    List<Task> tasksToInsert = new List<Task>();
    for (Contact c : Trigger.new) {
        Account acc = accountMap.get(c.AccountId);
        if (acc != null) {
            tasksToInsert.add(new Task(
                Subject = 'Follow up with ' + acc.Name,
                WhoId = c.Id
            ));
        }
    }

    // Étape 4 : UNE seule DML
    if (!tasksToInsert.isEmpty()) {
        insert tasksToInsert;
    }
}
// Avec 200 contacts → 1 SOQL + 1 DML = parfait
\`\`\`

### Règle du Checklist de Bulkification

1. **SOQL** : jamais dans une boucle, toujours avant ou après avec des collections
2. **DML** : jamais dans une boucle, collecter puis insert/update en une fois
3. **Map<Id, SObject>** : ton meilleur ami pour le lookup O(1) après la SOQL unique
4. **Set<Id>** : pour collecter les Ids avant la SOQL unique
5. **Guard isEmpty()** : vérifier avant toute DML (\`if (!list.isEmpty()) insert list;\`)
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : batch processing en Node.js
// ❌ N+1 query problem (même problème qu'en Apex)
for (const contact of contacts) {
  const account = await db.account.findById(contact.accountId); // N queries
  await db.task.create({ subject: 'Follow up with ' + account.name });
}

// ✅ Batch query
const accountIds = contacts.map(c => c.accountId);
const accounts = await db.account.findMany({ where: { id: { in: accountIds } } });
const accountMap = new Map(accounts.map(a => [a.id, a]));
const tasks = contacts.map(c => ({ subject: 'Follow up with ' + accountMap.get(c.accountId)?.name }));
await db.task.createMany({ data: tasks });
\`\`\`

C'est exactement le N+1 query problem — sauf qu'en Apex la limite est strictement enforced par les Governor Limits (100 SOQL max par transaction).
`,
    gotchas: [
      "Les Governor Limits sont par TRANSACTION, pas par trigger — si 3 triggers se déclenchent sur le même record, ils partagent les 100 SOQL disponibles",
      "SOQL dans une boucle est le pattern le plus fréquent qui cause des LimitException en production",
      "isEmpty() check avant DML est crucial — un insert sur une liste vide ne fait rien mais c'est une bonne pratique défensive",
      "Les triggers se déclenchent sur des batches de 200 records maximum — penser toujours batch",
    ],
  },

  // ─────────────────────────────────────────────
  // SOQL
  // ─────────────────────────────────────────────
  {
    id: "soql-basics",
    title: "SOQL — Bases et requêtes inline",
    category: "SOQL & Requêtes",
    tags: ["SOQL", "query", "SELECT", "inline"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## SOQL — Salesforce Object Query Language

SOQL ressemble à SQL mais est spécifique à Salesforce. Il est intégré **directement** dans le code Apex entre crochets.

### Syntaxe de base

\`\`\`apex
// SELECT basique — retourne toujours une List<SObject>
List<Account> accounts = [SELECT Id, Name, Industry FROM Account];

// WHERE clause
List<Account> techAccounts = [
    SELECT Id, Name
    FROM Account
    WHERE Industry = 'Technology'
    AND AnnualRevenue > 1000000
];

// ORDER BY
List<Account> sorted = [
    SELECT Id, Name, CreatedDate
    FROM Account
    ORDER BY CreatedDate DESC
    LIMIT 10
];

// LIMIT et OFFSET
List<Account> page2 = [
    SELECT Id, Name
    FROM Account
    ORDER BY Name
    LIMIT 20
    OFFSET 20
];

// COUNT
Integer total = [SELECT COUNT() FROM Account WHERE Industry = 'Tech'];

// Single record (attention : QueryException si 0 résultat)
Account acc = [SELECT Id, Name FROM Account WHERE Id = :someId LIMIT 1];
\`\`\`

### Bind Variables — inject des variables Apex

\`\`\`apex
// :variableName pour injecter une variable Apex dans SOQL
String industryFilter = 'Technology';
Decimal minRevenue = 500000;
List<Id> specificIds = new List<Id>{'001XXX', '002XXX'};

List<Account> results = [
    SELECT Id, Name, AnnualRevenue
    FROM Account
    WHERE Industry = :industryFilter
    AND AnnualRevenue >= :minRevenue
    AND Id IN :specificIds  // fonctionne avec List et Set
];

// Les bind variables préviennent les injections SOQL (comme les prepared statements SQL)
\`\`\`

### Relationship Queries (Joins)

\`\`\`apex
// Parent-to-Child (sous-requête) — récupère les enfants dans une liste imbriquée
List<Account> accountsWithContacts = [
    SELECT Id, Name,
        (SELECT Id, LastName, Email FROM Contacts)  // child relationship name
    FROM Account
    WHERE Industry = 'Technology'
];

for (Account acc : accountsWithContacts) {
    List<Contact> contacts = acc.Contacts; // accès à la liste des contacts
    System.debug(acc.Name + ' a ' + contacts.size() + ' contacts');
}

// Child-to-Parent (traversal) — accès aux champs du parent
List<Contact> contactsWithAccount = [
    SELECT Id, LastName,
        Account.Name,          // champ du parent
        Account.Industry       // champ du parent
    FROM Contact
    WHERE Account.Industry = 'Technology'
];

for (Contact c : contactsWithAccount) {
    System.debug(c.LastName + ' travaille chez ' + c.Account.Name);
}

// Relation Custom (lookup/master-detail)
// Parent: Account.Custom_Object__r.Field__c
// Child: (SELECT Id FROM Custom_Objects__r)
List<Account> accsWithCustom = [
    SELECT Id, Name, (SELECT Id, Status__c FROM Custom_Objects__r)
    FROM Account
];
\`\`\`

### Aggregate Queries

\`\`\`apex
// COUNT, SUM, AVG, MIN, MAX, GROUP BY
List<AggregateResult> results = [
    SELECT Industry, COUNT(Id) cnt, AVG(AnnualRevenue) avgRevenue
    FROM Account
    WHERE Industry != null
    GROUP BY Industry
    HAVING COUNT(Id) > 5
    ORDER BY COUNT(Id) DESC
];

for (AggregateResult ar : results) {
    String industry = (String) ar.get('Industry');
    Integer count = (Integer) ar.get('cnt');
    Double avg = (Double) ar.get('avgRevenue');
    System.debug(industry + ': ' + count + ' accounts, avg revenue: ' + avg);
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript avec SQL (Drizzle)
const accounts = await db
  .select({ id: account.id, name: account.name })
  .from(account)
  .where(and(eq(account.industry, 'Technology'), gt(account.annualRevenue, 1000000)))
  .orderBy(desc(account.createdDate))
  .limit(10);
\`\`\`

Différences SOQL vs SQL :
- Pas de JOIN traditionnel — traversal de relations par nom de relation
- Sous-requêtes uniquement pour les relations parent/enfant
- Pas de UNION, pas de DELETE/UPDATE en SOQL (c'est de la DML Apex)
- Limité à 100 SOQL par transaction — chaque \`[SELECT...]\` dans le code compte
- Les bind variables (\`:variable\`) sont directement les variables Apex
`,
    gotchas: [
      "Un SOQL inline qui retourne 0 résultat pour une query single-record (sans List<>) lève QueryException — toujours utiliser List<> sauf si tu es CERTAIN qu'il y a un résultat",
      "Les noms de relations child-to-parent sont au singulier (Account.Name), parent-to-child au pluriel (Contacts, Custom_Objects__r)",
      "Les custom lookup fields ont '__r' à la fin pour la traversal (MyLookup__r.Field__c), pas '__c'",
      "LIMIT est obligatoire dans les sous-requêtes (imbriquées) — max 1000 par sous-requête",
      "Pas de wildcard SELECT * en SOQL — toujours lister les champs explicitement",
    ],
  },

  {
    id: "soql-advanced",
    title: "SOQL — Dynamic SOQL et patterns avancés",
    category: "SOQL & Requêtes",
    tags: ["SOQL", "dynamic", "Database.query", "injection"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Dynamic SOQL — Database.query()

\`\`\`apex
// Quand la requête doit être construite dynamiquement
String objectName = 'Account';
String fieldList = 'Id, Name, Industry';
String condition = 'AnnualRevenue > 1000000';

String soql = 'SELECT ' + fieldList +
              ' FROM ' + objectName +
              ' WHERE ' + condition +
              ' LIMIT 100';

List<SObject> results = Database.query(soql);

// Cast vers le bon type
List<Account> accounts = (List<Account>) Database.query(soql);
\`\`\`

### ATTENTION : injection SOQL

\`\`\`apex
// ❌ DANGEREUX — injection possible
String userInput = 'Tech\\'s Corp'; // apostrophe malveillante
String soql = 'SELECT Id FROM Account WHERE Name = \\'' + userInput + '\\'';
// → Injection : Name = 'Tech's Corp' → erreur de parsing ou pire

// ✅ SÉCURISÉ — String.escapeSingleQuotes()
String safeInput = String.escapeSingleQuotes(userInput);
String soql2 = 'SELECT Id FROM Account WHERE Name = \\'' + safeInput + '\\'';

// ✅ ENCORE MIEUX — bind variables dans static SOQL
List<Account> safeResults = [SELECT Id FROM Account WHERE Name = :userInput];
// Les bind variables sont automatiquement échappées
\`\`\`

### Schema Describe pour SOQL dynamique

\`\`\`apex
// Récupérer les infos d'un objet dynamiquement
Schema.SObjectType accType = Schema.getGlobalDescribe().get('Account');
Schema.DescribeSObjectResult describe = accType.getDescribe();
Map<String, Schema.SObjectField> fields = describe.fields.getMap();

// Vérifier si un champ existe avant de l'utiliser en SOQL dynamique
if (fields.containsKey('Industry')) {
    String soql = 'SELECT Id, Industry FROM Account LIMIT 10';
    List<SObject> results = Database.query(soql);
}

// Construire une requête avec tous les champs d'un objet
List<String> fieldNames = new List<String>(fields.keySet());
String soql = 'SELECT ' + String.join(fieldNames, ', ') + ' FROM Account LIMIT 1';
\`\`\`

### ALL ROWS — requêter les records supprimés

\`\`\`apex
// Requêter aussi la corbeille
List<Account> includingDeleted = [
    SELECT Id, Name, IsDeleted
    FROM Account
    ALL ROWS  // inclut les records dans la corbeille
];

// Utile pour l'undelete sélectif
List<Account> deletedOnly = [
    SELECT Id, Name
    FROM Account
    WHERE IsDeleted = true
    ALL ROWS
];
\`\`\`

### FOR UPDATE — verrouillage pessimiste

\`\`\`apex
// Verrouiller les records pour une mise à jour exclusive
List<Account> locked = [
    SELECT Id, Name, AnnualRevenue
    FROM Account
    WHERE Id IN :accountIds
    FOR UPDATE  // verrouille jusqu'à la fin de la transaction
];
// Toute autre transaction tentant de modifier ces records devra attendre
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — requête dynamique avec Drizzle ou raw SQL
const tableName = 'account';
const results = await db.execute(sql\`SELECT id, name FROM \${sql.identifier(tableName)}\`);

// Ou avec Prisma
const results = await (prisma[tableName as keyof typeof prisma] as any).findMany();
\`\`\`

Le dynamic SOQL est l'équivalent du raw SQL en TS — plus flexible mais plus risqué (injection). Toujours sanitiser les inputs utilisateur avec \`String.escapeSingleQuotes()\`.
`,
    gotchas: [
      "Database.query() retourne List<SObject> — caster explicitement vers le bon type",
      "Les bind variables (:var) NE fonctionnent PAS dans le Dynamic SOQL — utiliser String.escapeSingleQuotes() pour les valeurs dynamiques",
      "FOR UPDATE dans une SOQL peut causer des deadlocks si deux transactions se verrouillent mutuellement",
      "ALL ROWS ne peut pas être combiné avec d'autres clauses dans certains contextes",
    ],
  },

  // ─────────────────────────────────────────────
  // GOVERNOR LIMITS
  // ─────────────────────────────────────────────
  {
    id: "governor-limits-overview",
    title: "Governor Limits — Vue d'ensemble critique",
    category: "Governor Limits",
    tags: ["limits", "performance", "governor", "critique"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Pourquoi les Governor Limits ?

Salesforce est une plateforme **multi-tenant** : des milliers d'organisations partagent la même infrastructure. Les Governor Limits garantissent qu'aucun code ne monopolise les ressources.

> ⚠️ **LimitException ne peut PAS être catchée** — quand tu exploises une limite, l'exécution s'arrête immédiatement avec rollback.

### Limites synchrones (Apex classique)

| Ressource | Limite sync | Limite async (batch) |
|---|---|---|
| SOQL queries | **100** | 200 |
| SOQL rows retournés | **50 000** | 50 000 |
| DML statements | **150** | 150 |
| DML rows traités | **10 000** | 10 000 |
| Heap size | **6 MB** | 12 MB |
| CPU time | **10 000 ms** | 60 000 ms |
| Callouts HTTP | **100** | 100 |
| Future methods invoked | **50** | — |
| Queueable jobs chainés | **50** | — |
| Email invocations | **10** | 10 |

### La classe Limits — monitoring en temps réel

\`\`\`apex
// Vérifier les ressources consommées/disponibles
System.debug('SOQL used: ' + Limits.getQueries()); // ex: 5
System.debug('SOQL limit: ' + Limits.getLimitQueries()); // 100
System.debug('SOQL remaining: ' + (Limits.getLimitQueries() - Limits.getQueries()));

System.debug('DML used: ' + Limits.getDmlStatements()); // ex: 2
System.debug('DML limit: ' + Limits.getLimitDmlStatements()); // 150

System.debug('DML rows used: ' + Limits.getDmlRows());
System.debug('CPU time: ' + Limits.getCpuTime() + ' ms');
System.debug('Heap size: ' + Limits.getHeapSize() + ' bytes');

// Pattern de guard avant une opération critique
if (Limits.getQueries() < Limits.getLimitQueries() - 5) {
    // Encore assez de SOQL disponibles
    List<Account> accounts = [SELECT Id FROM Account LIMIT 10];
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Pas d'équivalent en TypeScript — les serveurs Node.js n'ont pas de limites strictes par requête
// C'est l'une des différences fondamentales de Salesforce : chaque transaction est budgétée
\`\`\`

Imagine que chaque endpoint Express a un **budget strict** : max 100 requêtes SQL, max 10 secondes CPU, max 6MB de RAM. Dépasser = arrêt immédiat. C'est la réalité Apex.
`,
    gotchas: [
      "Les limites sont PER TRANSACTION, pas par opération — tous les triggers, classes et méthodes appelés partagent le même budget",
      "LimitException est la seule exception qui ne peut pas être catchée — code défensif obligatoire",
      "Le CPU time inclut la sérialisation JSON, les boucles, tout — pas juste les queries",
      "Les annotations @future et Queueable ont leurs propres limites d'invocations (50 @future par transaction)",
    ],
  },

  {
    id: "governor-limits-patterns",
    title: "Governor Limits — Patterns pour ne pas exploser",
    category: "Governor Limits",
    tags: ["limits", "patterns", "bulk", "optimisation"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Pattern 1 : Éliminer les SOQL dans les boucles

\`\`\`apex
// ❌ EXPLOSERA avec 101+ contacts
trigger ContactTrigger on Contact (before insert) {
    for (Contact c : Trigger.new) {
        Account acc = [SELECT Name FROM Account WHERE Id = :c.AccountId]; // SOQL dans boucle!
        c.Description = 'Works at ' + acc.Name;
    }
}

// ✅ VERSION CORRECTE
trigger ContactTrigger on Contact (before insert) {
    // 1. Collecter les Ids
    Set<Id> accountIds = new Set<Id>();
    for (Contact c : Trigger.new) {
        if (c.AccountId != null) accountIds.add(c.AccountId);
    }

    // 2. Une seule SOQL
    Map<Id, Account> accMap = new Map<Id, Account>(
        [SELECT Id, Name FROM Account WHERE Id IN :accountIds]
    );

    // 3. Utiliser la Map
    for (Contact c : Trigger.new) {
        Account acc = accMap.get(c.AccountId);
        if (acc != null) c.Description = 'Works at ' + acc.Name;
    }
}
\`\`\`

## Pattern 2 : Éviter les DML dans les boucles

\`\`\`apex
// ❌ EXPLOSERA
for (Account acc : accounts) {
    acc.Description = 'Updated';
    update acc; // DML dans boucle!
}

// ✅ VERSION CORRECTE
for (Account acc : accounts) {
    acc.Description = 'Updated';
}
update accounts; // Une seule DML sur toute la liste
\`\`\`

## Pattern 3 : Heap Size — éviter les grandes collections

\`\`\`apex
// ❌ Charger tous les records en mémoire
List<Account> allAccounts = [SELECT Id, Name, Description FROM Account]; // potentiellement 50 000 records!

// ✅ Utiliser LIMIT et traiter par batch
// Ou utiliser Batch Apex pour les gros volumes
// Ou utiliser des SOQL with minimal fields
List<Account> minimalLoad = [SELECT Id FROM Account WHERE Industry = 'Tech'];
// On charge juste les Ids, pas tous les champs
\`\`\`

## Pattern 4 : CPU Time — éviter les calculs coûteux dans les boucles

\`\`\`apex
// ❌ Regex ou opérations lourdes dans une boucle sur 10 000 records
for (Account acc : largeList) {
    Pattern p = Pattern.compile('complex.*regex'); // recompile le pattern à chaque fois!
    Matcher m = p.matcher(acc.Name);
    acc.Description = m.matches() ? 'Match' : 'No match';
}

// ✅ Hisser les opérations coûteuses hors de la boucle
Pattern p = Pattern.compile('complex.*regex'); // compilé UNE FOIS
for (Account acc : largeList) {
    Matcher m = p.matcher(acc.Name);
    acc.Description = m.matches() ? 'Match' : 'No match';
}
\`\`\`

## Pattern 5 : Callouts — faire les HTTP calls en async

\`\`\`apex
// ❌ Callout synchrone depuis un trigger → interdit (erreur de compilation)
// Un trigger NE PEUT PAS faire de callout HTTP directement

// ✅ Déléguer à @future ou Queueable
trigger AccountTrigger on Account (after insert) {
    Set<Id> ids = new Set<Id>(Trigger.newMap.keySet());
    AccountIntegrationService.syncToExternalSystem(ids); // méthode @future
}

public class AccountIntegrationService {
    @future(callout=true)
    public static void syncToExternalSystem(Set<Id> accountIds) {
        // Callout HTTP ici - autorisé en @future
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.external.com/accounts');
        // ...
    }
}
\`\`\`
`,
    tsAnalogy: `
Ces patterns sont exactement les **optimisations N+1** que tu évites en TypeScript avec Prisma/Drizzle. La différence : en TS tu as des warnings dans les logs, en Apex tu as une **erreur fatale en production**. Les Governor Limits rendent obligatoire ce qui est optionnel en TS.
`,
    gotchas: [
      "Les callouts HTTP sont interdits dans les triggers synchrones — utiliser @future(callout=true) ou Queueable",
      "Limits.getCpuTime() inclut le temps de sérialisation — même du JSON.serialize() sur de grandes listes peut exploser le CPU",
      "La limite des DML rows (10 000) est différente des DML statements (150) — 1 DML statement sur 10 001 records échoue",
      "En Batch Apex, les limites sont réinitialisées à chaque execute() — c'est l'intérêt pour les gros volumes",
    ],
  },

  // ─────────────────────────────────────────────
  // ASYNC APEX
  // ─────────────────────────────────────────────
  {
    id: "async-future",
    title: "Async Apex — @future",
    category: "Async Apex",
    tags: ["async", "future", "callout", "fire-and-forget"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## @future — Fire and Forget

\`@future\` permet d'exécuter une méthode de manière **asynchrone**, dans un contexte séparé avec ses propres limites. C'est le plus simple des mécanismes async.

### Syntaxe

\`\`\`apex
public class AccountIntegrationService {

    // Méthode @future — DOIT être static
    // DOIT retourner void
    // Paramètres : seulement les types primitifs, collections de primitifs ou de Ids
    @future
    public static void updateAccountsAsync(List<Id> accountIds, String status) {
        // Exécution asynchrone — contexte propre, nouvelles governor limits
        List<Account> accounts = [SELECT Id, Status__c FROM Account WHERE Id IN :accountIds];
        for (Account acc : accounts) {
            acc.Status__c = status;
        }
        update accounts;
    }

    // @future avec callout HTTP (obligatoire pour HTTP dans un trigger)
    @future(callout=true)
    public static void syncToExternalSystem(Set<Id> accountIds) {
        List<Account> accounts = [SELECT Id, Name, ExternalId__c FROM Account WHERE Id IN :accountIds];

        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.example.com/sync');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(accounts));

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            System.debug('Sync successful');
        }
    }
}

// Appel depuis un trigger ou une classe
trigger AccountTrigger on Account (after insert) {
    Set<Id> ids = new Set<Id>(Trigger.newMap.keySet());
    AccountIntegrationService.syncToExternalSystem(ids);
    // Le trigger retourne immédiatement — la sync se fait en arrière-plan
}
\`\`\`

### Limitations de @future

\`\`\`apex
// ❌ Ces types ne peuvent PAS être passés en paramètre à @future
@future
public static void badMethod(Account account) {} // ERREUR : SObject interdit
@future
public static void badMethod2(Map<String, Account> map) {} // ERREUR : Map<Id, SObject> interdit

// ✅ Passer les Ids, puis recharger dans la méthode @future
@future
public static void goodMethod(List<Id> accountIds) {
    List<Account> accounts = [SELECT Id FROM Account WHERE Id IN :accountIds]; // OK
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : setImmediate() ou un setTimeout(fn, 0) en Node.js
// Ou une tâche dans une queue (Bull/BullMQ)
await queue.add('syncToExternal', { accountIds });

// Différence : @future est fire-and-forget avec AUCUN mécanisme de retry natif
// Queueable est plus puissant pour les besoins de retry ou de chaining
\`\`\`

@future = le worker le plus simple possible. Pas de retry, pas de suivi, pas de paramètres complexes. Si tu as besoin de plus, utilise Queueable.
`,
    gotchas: [
      "Les paramètres @future ne peuvent être QUE des primitifs ou des collections de primitifs/Ids — pas de SObjects",
      "Max 50 appels @future par transaction",
      "Une méthode @future ne peut pas appeler une autre méthode @future (pas de chaînage)",
      "@future n'a pas de mécanisme de retry natif — si ça échoue, c'est perdu",
      "Il est impossible de tester que @future a bien été schedulé depuis un test — Test.stopTest() force l'exécution synchrone pour les tests",
    ],
  },

  {
    id: "async-queueable",
    title: "Async Apex — Queueable",
    category: "Async Apex",
    tags: ["async", "queueable", "chaining", "job"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Queueable — L'async avec superpowers

\`Queueable\` est plus puissant que \`@future\` : il accepte des objets complexes en paramètre, peut être chaîné, et retourne un JobId pour le monitoring.

### Implémentation

\`\`\`apex
public class AccountSyncJob implements Queueable, Database.AllowsCallouts {
    // Contrairement à @future : peut avoir des propriétés d'instance
    private List<Account> accountsToSync;
    private Integer retryCount;

    public AccountSyncJob(List<Account> accounts, Integer retryCount) {
        this.accountsToSync = accounts;
        this.retryCount = retryCount;
    }

    // Méthode obligatoire de l'interface Queueable
    public void execute(QueueableContext context) {
        System.debug('Job ID: ' + context.getJobId());

        try {
            // Logique principale
            for (Account acc : accountsToSync) {
                // Traitement
                HttpRequest req = new HttpRequest();
                req.setEndpoint('https://api.example.com/sync/' + acc.Id);
                req.setMethod('PUT');
                Http http = new Http();
                HttpResponse res = http.send(req);
            }

            // Chaînage : lancer un autre job après celui-ci
            System.enqueueJob(new AccountCleanupJob(accountsToSync));

        } catch (Exception e) {
            // Retry avec compteur
            if (retryCount < 3) {
                System.enqueueJob(new AccountSyncJob(accountsToSync, retryCount + 1));
            } else {
                System.debug('Max retries reached: ' + e.getMessage());
            }
        }
    }
}

// Lancement
List<Account> accounts = [SELECT Id, Name FROM Account WHERE Sync_Needed__c = true];
Id jobId = System.enqueueJob(new AccountSyncJob(accounts, 0));
System.debug('Enqueued job: ' + jobId);

// Monitoring
AsyncApexJob job = [
    SELECT Id, Status, NumberOfErrors, JobType
    FROM AsyncApexJob
    WHERE Id = :jobId
];
\`\`\`

### Queueable sans callouts (plus simple)

\`\`\`apex
public class RecordProcessingJob implements Queueable {
    private Set<Id> recordIds;

    public RecordProcessingJob(Set<Id> ids) {
        this.recordIds = ids;
    }

    public void execute(QueueableContext ctx) {
        List<Account> accounts = [SELECT Id, Status__c FROM Account WHERE Id IN :recordIds];
        for (Account acc : accounts) {
            acc.Status__c = 'Processed';
        }
        update accounts;
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// BullMQ — l'équivalent Queueable en Node.js
class AccountSyncJob {
  constructor(private accountIds: string[], private retryCount: number) {}
}

const worker = new Worker('accountSync', async (job) => {
  const { accountIds, retryCount } = job.data;
  // traitement
  await nextQueue.add('cleanup', { accountIds });
});

const jobId = await queue.add('sync', { accountIds, retryCount: 0 });
\`\`\`

Queueable ≈ BullMQ/Agenda avec chaînage. La différence : Salesforce limite à 50 jobs chaînés max par transaction, et les queues Salesforce ne sont pas aussi configurables que BullMQ.
`,
    gotchas: [
      "Pour faire des callouts, implémenter AUSSI Database.AllowsCallouts (en plus de Queueable)",
      "Max 50 Queueable jobs chainés dans une seule chaîne",
      "Le chaînage de jobs dans un contexte de test ne fonctionne que si un seul niveau de chaînage est testé",
      "Queueable.execute() reçoit un QueueableContext avec getJobId() — utile pour le monitoring et le logging",
      "Les Queueable jobs peuvent avoir des propriétés d'instance complexes (SObjects, Maps) contrairement à @future",
    ],
  },

  {
    id: "async-batch",
    title: "Async Apex — Batch Apex",
    category: "Async Apex",
    tags: ["async", "batch", "batchable", "volume"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Batch Apex — Pour les gros volumes de données

Batch Apex traite des millions de records en les découpant en **chunks** (default: 200). Chaque chunk a ses propres Governor Limits — idéal pour contourner la limite des 50 000 SOQL rows.

### Implémentation des 3 méthodes obligatoires

\`\`\`apex
public class AccountAnnualReviewBatch
    implements Database.Batchable<SObject>, Database.Stateful {

    // Database.Stateful : les propriétés d'instance persistent entre les execute()
    // Sans Stateful : chaque execute() repart de zéro
    public Integer processedCount = 0;
    public List<String> errors = new List<String>();

    // 1. START — appelé UNE FOIS, retourne le Dataset à traiter
    public Database.QueryLocator start(Database.BatchableContext bc) {
        System.debug('Batch started: ' + bc.getJobId());

        // QueryLocator pour les grandes queries (>50 000 records)
        return Database.getQueryLocator(
            'SELECT Id, Name, AnnualRevenue, LastReviewDate__c ' +
            'FROM Account ' +
            'WHERE LastReviewDate__c < LAST_N_YEARS:1 ' +
            'OR LastReviewDate__c = null'
        );

        // Alternative : Iterable pour des sources de données custom
        // return (Iterable<SObject>) myCustomList;
    }

    // 2. EXECUTE — appelé pour CHAQUE CHUNK (200 records par défaut)
    // Chaque execute() a ses propres Governor Limits fraîches !
    public void execute(Database.BatchableContext bc, List<SObject> scope) {
        List<Account> accounts = (List<Account>) scope;
        List<Account> toUpdate = new List<Account>();

        for (Account acc : accounts) {
            acc.LastReviewDate__c = Date.today();
            acc.ReviewStatus__c = 'Reviewed';
            toUpdate.add(acc);
            processedCount++; // persist grâce à Database.Stateful
        }

        try {
            update toUpdate;
        } catch (DmlException e) {
            errors.add('Chunk failed: ' + e.getMessage());
        }
    }

    // 3. FINISH — appelé UNE FOIS après tous les execute()
    public void finish(Database.BatchableContext bc) {
        AsyncApexJob job = [
            SELECT Id, Status, NumberOfErrors, TotalJobItems, JobItemsProcessed
            FROM AsyncApexJob
            WHERE Id = :bc.getJobId()
        ];

        System.debug('Batch finished. Processed: ' + processedCount);
        System.debug('Status: ' + job.Status);
        System.debug('Errors: ' + errors.size());

        // Notifier par email
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setToAddresses(new List<String>{'admin@example.com'});
        email.setSubject('Batch Review Complete');
        email.setPlainTextBody(
            'Processed: ' + processedCount + ' records\n' +
            'Errors: ' + String.join(errors, '\n')
        );
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
    }
}
\`\`\`

### Lancement et monitoring

\`\`\`apex
// Lancement direct
Id jobId = Database.executeBatch(new AccountAnnualReviewBatch());

// Lancement avec taille de chunk personnalisée (max 2000)
Id jobId2 = Database.executeBatch(new AccountAnnualReviewBatch(), 50);
// Chunk plus petit = plus de transactions = plus de Governor Limits fraîches
// Chunk plus grand = moins de transactions = plus efficace (si les limites ne posent pas pb)

// Monitoring
AsyncApexJob job = [
    SELECT Id, Status, JobItemsProcessed, TotalJobItems, NumberOfErrors
    FROM AsyncApexJob
    WHERE Id = :jobId
];
System.debug('Progress: ' + job.JobItemsProcessed + '/' + job.TotalJobItems);
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : processing par chunks avec BullMQ
const accountBatch = await queue.add('annualReview', {});

worker.process('annualReview', async (job) => {
  // start() equivalent : query tous les records
  const allAccounts = await db.account.findMany({ where: { needsReview: true } });

  // execute() equivalent : chunks de 200
  for (let i = 0; i < allAccounts.length; i += 200) {
    const chunk = allAccounts.slice(i, i + 200);
    await processChunk(chunk);
  }

  // finish() equivalent
  await notifyCompletion();
});
\`\`\`

La grande différence : en Apex, **chaque chunk a ses propres Governor Limits fraîches** — c'est pour ça que Batch Apex peut traiter des millions de records. En Node.js, la même chose se ferait avec une queue distribuée.
`,
    gotchas: [
      "Database.Stateful double la consommation de heap — utiliser uniquement si nécessaire pour accumuler des résultats",
      "Sans Database.Stateful, toutes les propriétés d'instance sont réinitialisées entre chaque execute()",
      "Le scope dans execute() est List<SObject> — toujours caster vers le bon type",
      "Max 5 Batch jobs en parallèle par org (limite Salesforce)",
      "Database.getQueryLocator peut traiter jusqu'à 50 millions de records, List<> seulement 50 000",
      "Réduire le chunk size si chaque execute() fait beaucoup de SOQL (pour rester dans les limites)",
    ],
  },

  {
    id: "async-scheduled",
    title: "Async Apex — Scheduled Apex",
    category: "Async Apex",
    tags: ["async", "scheduled", "cron", "schedulable"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Scheduled Apex — Cron jobs Salesforce

Permettent d'exécuter du code à des moments précis, définis par une expression CRON.

### Implémentation

\`\`\`apex
public class WeeklyAccountReviewScheduler implements Schedulable {

    // Méthode obligatoire de l'interface Schedulable
    public void execute(SchedulableContext sc) {
        System.debug('Scheduled job running: ' + sc.getTriggerId());

        // Lancer un batch depuis un scheduled job — pattern courant
        AccountAnnualReviewBatch batch = new AccountAnnualReviewBatch();
        Database.executeBatch(batch, 200);
    }
}
\`\`\`

### Scheduling — Syntaxe CRON

\`\`\`apex
// Format CRON : Seconds Minutes Hours DayOfMonth Month DayOfWeek Year
// Seconds     : 0-59
// Minutes     : 0-59
// Hours       : 0-23
// DayOfMonth  : 1-31 ou ?
// Month       : 1-12 ou JAN-DEC
// DayOfWeek   : 1-7 (1=SUN) ou SUN-SAT ou ?
// Year        : 1970-2099 (optionnel)

// Tous les lundis à 6h du matin
String cronExpr = '0 0 6 ? * MON';
String jobName = 'Weekly Account Review';
Id scheduledJobId = System.schedule(jobName, cronExpr, new WeeklyAccountReviewScheduler());

// Tous les jours à minuit
String daily = '0 0 0 * * ?';
System.schedule('Daily Cleanup', daily, new DailyCleanupScheduler());

// Toutes les heures
String hourly = '0 0 * * * ?';
System.schedule('Hourly Sync', hourly, new HourlySyncScheduler());

// Le 1er de chaque mois à 9h
String monthly = '0 0 9 1 * ?';
System.schedule('Monthly Report', monthly, new MonthlyReportScheduler());
\`\`\`

### Gestion des jobs schedulés

\`\`\`apex
// Lister les jobs schedulés
List<CronTrigger> jobs = [
    SELECT Id, CronJobDetail.Name, State, NextFireTime, CronExpression
    FROM CronTrigger
    WHERE CronJobDetail.JobType = '7' // 7 = Apex Scheduled
];

for (CronTrigger job : jobs) {
    System.debug(job.CronJobDetail.Name + ' → ' + job.NextFireTime);
}

// Supprimer un job schedulé
System.abortJob(scheduledJobId);
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// node-cron ou GitHub Actions cron
import cron from 'node-cron';
cron.schedule('0 6 * * MON', () => {
  runWeeklyAccountReview();
});
\`\`\`

Le format CRON Salesforce a **6 champs** (secondes incluses) là où node-cron en a 5. Attention aussi : Salesforce utilise 1=dimanche, 7=samedi pour DayOfWeek.
`,
    gotchas: [
      "Le format CRON Salesforce a 6 champs obligatoires (secondes en premier) — différent de crontab Unix (5 champs)",
      "Maximum 100 Scheduled Apex jobs par org — nettoyer les jobs obsolètes",
      "Un job Scheduled ne peut pas appeler un autre Scheduled — passer par Queueable ou Batch",
      "DayOfMonth et DayOfWeek sont mutuellement exclusifs — utiliser ? pour celui qu'on n'utilise pas",
      "Les jobs Scheduled utilisent le timezone de l'org, pas UTC",
    ],
  },

  {
    id: "async-decision-tree",
    title: "Async Apex — Quand utiliser quoi",
    category: "Async Apex",
    tags: ["async", "decision", "patterns", "architecture"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Arbre de décision : quel mécanisme async choisir ?

\`\`\`
Besoin d'exécution asynchrone
│
├─ Appel HTTP / Callout externe ?
│   ├─ Simple, fire-and-forget, pas de retry → @future(callout=true)
│   └─ Retry, objets complexes, suivi → Queueable + Database.AllowsCallouts
│
├─ Traitement de millions de records ?
│   └─ Batch Apex (Database.Batchable)
│
├─ Exécution planifiée (cron) ?
│   └─ Scheduled Apex (Schedulable)
│       └─ Si la tâche est lourde → Scheduled lance un Batch
│
├─ Dépasse les Governor Limits sync ?
│   ├─ Pas d'objets complexes, primitifs seulement → @future
│   └─ Objets complexes, chaînage, suivi → Queueable
│
└─ Logique en cascade (job A → job B → job C) ?
    └─ Queueable (chaînable)
\`\`\`

### Tableau comparatif

| Critère | @future | Queueable | Batch | Scheduled |
|---|---|---|---|---|
| Paramètres complexes (SObjects) | ❌ | ✅ | ✅ | ✅ |
| Callouts HTTP | ✅ avec annotation | ✅ + AllowsCallouts | ✅ + AllowsCallouts | ❌ direct |
| Chaînable | ❌ | ✅ (50 max) | ❌ | ❌ |
| Volume de records | Moyen | Moyen | Millions | — |
| Planification temporelle | ❌ | ❌ | ❌ | ✅ |
| Monitoring / JobId | ❌ | ✅ | ✅ | ✅ |
| Retry natif | ❌ | Manuel | Non par défaut | ❌ |
| Facilité d'implémentation | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ |
`,
    tsAnalogy: `
| Apex | Node.js équivalent |
|---|---|
| @future | setImmediate() ou Promise simple |
| Queueable | BullMQ Worker avec chaînage |
| Batch Apex | BullMQ avec chunks + concurrency:1 |
| Scheduled Apex | node-cron ou GitHub Actions schedule |
`,
    gotchas: [
      "On ne peut pas appeler @future depuis un contexte déjà async (batch, future, queueable)",
      "Un Batch Apex peut lancer un Queueable depuis finish(), mais pas depuis execute()",
      "Scheduled Apex est souvent utilisé uniquement pour lancer un Batch — il délègue le vrai travail",
    ],
  },

  // ─────────────────────────────────────────────
  // TESTING
  // ─────────────────────────────────────────────
  {
    id: "testing-basics",
    title: "Testing Apex — @isTest et assertions",
    category: "Tests",
    tags: ["test", "isTest", "assert", "coverage"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Tests Apex — fondamentaux

### Règle des 75% de couverture

Salesforce requiert **75% minimum de couverture de code** pour déployer en production. En pratique, viser 90%+.

### Structure d'un test

\`\`\`apex
@isTest
public class AccountServiceTest {

    // @testSetup : créé une fois pour TOUS les tests de la classe
    // Plus performant que de créer dans chaque test
    @testSetup
    static void setupTestData() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 10; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                Industry = 'Technology',
                AnnualRevenue = 1000000 * (i + 1)
            ));
        }
        insert accounts;
    }

    @isTest
    static void testGetAccountByName_found() {
        // Arrange — récupérer les données créées par @testSetup
        Account expected = [SELECT Id, Name FROM Account WHERE Name = 'Test Account 0' LIMIT 1];

        // Act
        Test.startTest(); // Réinitialise les Governor Limits pour le code testé
        AccountService service = new AccountService();
        Account result = service.getAccountByName('Test Account 0');
        Test.stopTest(); // Force l'exécution des async jobs (@future, Queueable)

        // Assert
        System.assertNotEquals(null, result, 'Should find the account');
        System.assertEquals(expected.Id, result.Id, 'Should return the correct account');
        System.assertEquals('Test Account 0', result.Name, 'Name should match');
    }

    @isTest
    static void testGetAccountByName_notFound() {
        Test.startTest();
        AccountService service = new AccountService();
        Test.stopTest();

        try {
            Account result = service.getAccountByName('Nonexistent');
            System.assert(false, 'Should have thrown AccountNotFoundException');
        } catch (AccountService.AccountNotFoundException e) {
            System.assertEquals('Account not found: Nonexistent', e.getMessage());
        }
    }

    @isTest
    static void testBulkInsert() {
        // Tester avec 200 records — vérifier la bulkification
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            accounts.add(new Account(Name = 'Bulk Account ' + i));
        }

        Test.startTest();
        insert accounts; // déclenche le trigger
        Test.stopTest();

        Integer count = [SELECT COUNT() FROM Account WHERE Name LIKE 'Bulk Account%'];
        System.assertEquals(200, count, 'All 200 accounts should be created');
    }
}
\`\`\`

### Méthodes d'assertion

\`\`\`apex
// assertEquals(expected, actual, message)
System.assertEquals(5, myList.size(), 'Should have 5 elements');
System.assertEquals('Alice', contact.Name, 'Name should be Alice');

// assertNotEquals(notExpected, actual, message)
System.assertNotEquals(null, result, 'Result should not be null');

// assert(condition, message)
System.assert(myList.size() > 0, 'List should not be empty');
System.assert(result.isSuccess(), 'Operation should succeed');

// Depuis API 55.0 (Winter '23) — méthodes plus expressives
Assert.isTrue(condition, 'Should be true');
Assert.isFalse(condition, 'Should be false');
Assert.isNull(value, 'Should be null');
Assert.isNotNull(value, 'Should not be null');
Assert.areEqual(expected, actual, 'Should be equal');
Assert.areNotEqual(notExpected, actual, 'Should not be equal');
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Jest — structure très similaire
describe('AccountService', () => {
  beforeAll(async () => {
    // équivalent @testSetup
    await db.account.createMany({ data: testAccounts });
  });

  test('getAccountByName - found', async () => {
    // Act
    const result = await accountService.getAccountByName('Test Account 0');

    // Assert
    expect(result).not.toBeNull();
    expect(result.name).toBe('Test Account 0');
  });
});
\`\`\`

Différences :
- @testSetup crée des données **dans la base** (pas des mocks) — les tests Apex testent vraiment contre la DB
- Test.startTest() / stopTest() = checkpoint pour les Governor Limits et pour forcer l'exécution async
- Pas de beforeEach — utiliser @testSetup pour le setup global ou créer dans chaque test
`,
    gotchas: [
      "@testSetup crée les données UNE FOIS et chaque test démarre avec un snapshot — les modifications d'un test ne persistent pas pour les autres",
      "Test.startTest() réinitialise les Governor Limits — ce qui est avant compte pour la 'vraie' transaction, ce qui est entre startTest et stopTest a ses propres limites",
      "Test.stopTest() est OBLIGATOIRE pour tester le code async (@future, Queueable) — il force l'exécution synchrone",
      "Les tests Apex ne peuvent pas accéder aux données réelles de l'org par défaut — utiliser @isTest(seeAllData=true) est une mauvaise pratique",
    ],
  },

  {
    id: "testing-mocks",
    title: "Testing — Mocks HTTP et seeAllData",
    category: "Tests",
    tags: ["test", "mock", "callout", "HttpCalloutMock"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Mocker les callouts HTTP

Les tests Apex ne peuvent pas faire de vraies requêtes HTTP — ils doivent utiliser un mock.

### HttpCalloutMock

\`\`\`apex
// 1. Définir le mock
@isTest
public class MockHttpResponse implements HttpCalloutMock {
    private Integer statusCode;
    private String body;

    public MockHttpResponse(Integer statusCode, String body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    // Méthode obligatoire de l'interface
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(statusCode);
        res.setBody(body);
        res.setHeader('Content-Type', 'application/json');
        return res;
    }
}

// 2. Utiliser le mock dans le test
@isTest
static void testSyncToExternalSystem() {
    // Configurer le mock AVANT l'appel
    String mockBody = '{"success": true, "id": "ext-001"}';
    Test.setMock(HttpCalloutMock.class, new MockHttpResponse(200, mockBody));

    // Créer les données
    Account acc = new Account(Name = 'Test Corp');
    insert acc;

    // Act — déclenche un callout via @future ou Queueable
    Test.startTest();
    AccountIntegrationService.syncToExternalSystem(new Set<Id>{acc.Id});
    Test.stopTest(); // Force l'exécution du @future

    // Assert les résultats
    Account updated = [SELECT Id, SyncStatus__c FROM Account WHERE Id = :acc.Id];
    System.assertEquals('Synced', updated.SyncStatus__c, 'Should be synced');
}
\`\`\`

## SeeAllData — Pourquoi c'est mal

\`\`\`apex
// ❌ MAUVAISE pratique
@isTest(seeAllData=true)
public class BadTestClass {
    @isTest
    static void badTest() {
        // Accès aux vraies données de l'org — DANGEREUX
        List<Account> realData = [SELECT Id FROM Account];
        // Ce test peut passer en sandbox et échouer en prod si les données diffèrent
        // Ce test peut modifier des vraies données!
        System.assert(realData.size() > 0);
    }
}

// ✅ BONNE pratique : toujours créer ses propres données de test
@isTest
public class GoodTestClass {
    @testSetup
    static void setup() {
        insert new Account(Name = 'Test Account');
    }

    @isTest
    static void goodTest() {
        Account acc = [SELECT Id FROM Account WHERE Name = 'Test Account' LIMIT 1];
        System.assertNotEquals(null, acc.Id);
    }
}
\`\`\`

## Test Data Factory — Pattern recommandé

\`\`\`apex
@isTest
public class TestDataFactory {

    public static Account createAccount(String name, Boolean doInsert) {
        Account acc = new Account(
            Name = name != null ? name : 'Test Account',
            Industry = 'Technology',
            Phone = '+33 1 23 45 67 89'
        );
        if (doInsert) insert acc;
        return acc;
    }

    public static Contact createContact(Id accountId, String lastName, Boolean doInsert) {
        Contact c = new Contact(
            LastName = lastName != null ? lastName : 'Test Contact',
            Email = lastName + '@test.com',
            AccountId = accountId
        );
        if (doInsert) insert c;
        return c;
    }

    public static List<Account> createAccounts(Integer count, Boolean doInsert) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                Industry = 'Technology'
            ));
        }
        if (doInsert) insert accounts;
        return accounts;
    }
}

// Utilisation dans les tests
@isTest
static void testBulkProcessing() {
    List<Account> accounts = TestDataFactory.createAccounts(200, true);
    // ...
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Jest avec MSW (Mock Service Worker) — équivalent HttpCalloutMock
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('https://api.example.com/sync/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
\`\`\`

La TestDataFactory est l'équivalent des **fixtures** ou **factories** en TypeScript (factory-bot pattern). La différence : en Apex les factories insèrent vraiment en base dans le contexte de test.
`,
    gotchas: [
      "Test.setMock() doit être appelé AVANT d'appeler le code qui fait le callout (pas après)",
      "Un test qui utilise des callouts sans mock lève CalloutException",
      "@isTest(seeAllData=true) est disponible pour certains objets standard qui ne peuvent pas être créés en test (ex: Product2 Pricebook), mais utiliser avec parcimonie",
      "La TestDataFactory DOIT être annotée @isTest pour ne pas compter dans la couverture de code de production",
    ],
  },

  {
    id: "testing-coverage",
    title: "Testing — Couverture de code et bonnes pratiques",
    category: "Tests",
    tags: ["test", "coverage", "75%", "bonnes-pratiques"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## La règle des 75% — Ce que ça veut vraiment dire

\`\`\`
Règle : au moins 75% des lignes de code Apex doivent être couvertes par des tests
AVANT de pouvoir déployer en production.

Important :
- C'est une règle ORG-wide, pas par classe
- Mais viser 90%+ par classe est la norme professionnelle
- Les lignes de code de test (@isTest) ne comptent pas dans le total
\`\`\`

### Ce qui compte et ce qui ne compte pas

\`\`\`apex
// Ces lignes NE COMPTENT PAS dans la couverture :
@isTest
public class MyTest { /* toute la classe */ }

// Lignes vides et commentaires ne comptent pas

// Ces lignes COMPTENT et doivent être couvertes :
public class AccountService { // ← compte
    public Account getById(Id id) { // ← compte
        List<Account> results = [SELECT Id, Name FROM Account WHERE Id = :id]; // ← compte
        if (results.isEmpty()) { // ← compte
            return null; // ← compte (branch non couverte si on ne teste pas le cas vide)
        }
        return results[0]; // ← compte
    }
}
\`\`\`

### Stratégie pour atteindre 90%+

\`\`\`apex
// 1. Tester le happy path
@isTest
static void testGetById_found() {
    Account acc = new Account(Name = 'Test');
    insert acc;
    Test.startTest();
    Account result = new AccountService().getById(acc.Id);
    Test.stopTest();
    System.assertNotEquals(null, result);
}

// 2. Tester les cas limites et les branches
@isTest
static void testGetById_notFound() {
    Test.startTest();
    Account result = new AccountService().getById('001000000000000AAA');
    Test.stopTest();
    System.assertEquals(null, result); // branch isEmpty → null couverte
}

// 3. Tester le bulk (200 records)
@isTest
static void testBulkTrigger() {
    List<Account> accounts = new List<Account>();
    for (Integer i = 0; i < 200; i++) {
        accounts.add(new Account(Name = 'Bulk ' + i));
    }
    Test.startTest();
    insert accounts; // trigger avec 200 records
    Test.stopTest();
    System.assertEquals(200, [SELECT COUNT() FROM Account WHERE Name LIKE 'Bulk%']);
}

// 4. Tester les exceptions
@isTest
static void testException() {
    try {
        new AccountService().methodThatThrows(null);
        System.assert(false, 'Should have thrown');
    } catch (AccountService.ValidationException e) {
        System.assert(e.getMessage().contains('required'));
    }
}
\`\`\`

### Visualiser la couverture

\`\`\`bash
# Dans VS Code avec Salesforce Extension Pack
# Commande : SFDX: Get Apex Test Results
# Ou dans Salesforce Developer Console → Test → View Code Coverage
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Jest coverage — similaire conceptuellement
// jest --coverage → rapport HTML avec % de lignes couvertes
// Seuil configuré dans jest.config.ts :
// coverageThreshold: { global: { lines: 75 } }
\`\`\`

La différence critique : en TypeScript tu choisis ton seuil de couverture. En Salesforce Apex, **75% minimum est une contrainte système** — tu ne peux pas déployer sans. C'est pourquoi les tests font partie de la culture Salesforce dès le départ.
`,
    gotchas: [
      "La couverture est calculée sur l'ensemble de l'org — une seule classe avec 0% peut bloquer un déploiement si la moyenne globale tombe sous 75%",
      "Écrire des tests juste pour la couverture (sans assertions) est une mauvaise pratique — les reviewers Salesforce et les PR reviews le repèrent",
      "Les triggers doivent avoir leurs propres tests — un test de service qui appelle indirectement un trigger ne compte que pour le service, le trigger lui-même doit être déclenché",
      "System.assert() sans message est acceptable mais System.assertEquals(expected, actual, message) est bien meilleur pour le diagnostic",
    ],
  },

  // ─────────────────────────────────────────────
  // DESIGN PATTERNS
  // ─────────────────────────────────────────────
  {
    id: "pattern-selector",
    title: "Design Pattern — Selector (Queries centralisées)",
    category: "Design Patterns",
    tags: ["pattern", "selector", "SOQL", "architecture"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Le Pattern Selector — Pourquoi centraliser les SOQL ?

### Le problème sans Selector

\`\`\`apex
// ❌ Sans Selector : SOQL dispersées dans tout le code
public class AccountService {
    public void processAccounts(Set<Id> ids) {
        List<Account> accs = [SELECT Id, Name FROM Account WHERE Id IN :ids];
        // ...
    }
}

public class ContactService {
    public void linkContacts(Set<Id> accountIds) {
        // Même query dupliquée avec des champs différents...
        List<Account> accs = [SELECT Id, Name, Phone FROM Account WHERE Id IN :accountIds];
    }
}
// → Duplication, incohérence, maintenance difficile
\`\`\`

### Pattern Selector

\`\`\`apex
// ✅ Selector : point d'entrée unique pour les queries sur Account
public class AccountSelector {

    // Champs par défaut — toujours inclus
    private static final Set<String> DEFAULT_FIELDS = new Set<String>{
        'Id', 'Name', 'Industry', 'AnnualRevenue', 'Phone'
    };

    // Query par Ids
    public static List<Account> selectById(Set<Id> accountIds) {
        return [
            SELECT Id, Name, Industry, AnnualRevenue, Phone
            FROM Account
            WHERE Id IN :accountIds
        ];
    }

    // Query avec conditions métier
    public static List<Account> selectActiveByIndustry(String industry) {
        return [
            SELECT Id, Name, Industry, AnnualRevenue
            FROM Account
            WHERE Industry = :industry
            AND IsDeleted = false
            ORDER BY AnnualRevenue DESC NULLS LAST
        ];
    }

    // Query avec relations
    public static List<Account> selectWithContactsById(Set<Id> accountIds) {
        return [
            SELECT Id, Name,
                (SELECT Id, LastName, Email FROM Contacts ORDER BY LastName)
            FROM Account
            WHERE Id IN :accountIds
        ];
    }

    // Map rapide — pattern très utilisé
    public static Map<Id, Account> selectMapById(Set<Id> accountIds) {
        return new Map<Id, Account>(selectById(accountIds));
    }
}

// Usage dans les services
public class AccountService {
    public void processAccounts(Set<Id> ids) {
        List<Account> accs = AccountSelector.selectById(ids); // centralisé
    }
}

public class ContactService {
    public void linkContacts(Set<Id> accountIds) {
        Map<Id, Account> accMap = AccountSelector.selectMapById(accountIds); // réutilisé
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : Repository Pattern (NestJS / Drizzle)
@Injectable()
export class AccountRepository {
  constructor(private db: DrizzleService) {}

  async findByIds(ids: string[]) {
    return this.db.select().from(accounts).where(inArray(accounts.id, ids));
  }

  async findByIndustry(industry: string) {
    return this.db.select().from(accounts).where(eq(accounts.industry, industry));
  }
}
\`\`\`

C'est exactement le **Repository Pattern** de NestJS/TypeORM/Drizzle. Le Selector Pattern en Apex est la version Salesforce du repository — queries centralisées, réutilisables, testables.
`,
    gotchas: [
      "Le Selector ne doit PAS faire de logique métier — seulement des queries",
      "Les méthodes static sont préférables pour éviter l'instanciation inutile",
      "Tester les Selectors séparément des Services — ils méritent leur propre classe de test",
      "Éviter de créer trop de variantes de queries — favoriser la composabilité",
    ],
  },

  {
    id: "pattern-service",
    title: "Design Pattern — Service Layer",
    category: "Design Patterns",
    tags: ["pattern", "service", "architecture", "logique-métier"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Service Layer — La logique métier centralisée

### Rôle du Service

Le Service contient la **logique métier**. Il utilise les Selectors pour les queries, orchestre les opérations, et ne sait pas d'où vient l'appel (trigger, API, batch...).

\`\`\`apex
public class AccountService {

    // Une méthode par cas d'usage métier
    public static void approveAccounts(Set<Id> accountIds) {
        // Utilise le Selector — jamais de SOQL directe ici
        List<Account> accounts = AccountSelector.selectById(accountIds);

        List<Account> toUpdate = new List<Account>();
        List<Task> tasksToCreate = new List<Task>();

        for (Account acc : accounts) {
            // Validation métier
            if (acc.AnnualRevenue == null || acc.AnnualRevenue < 10000) {
                throw new AccountService.ValidationException(
                    'Account ' + acc.Name + ' does not meet revenue criteria'
                );
            }

            // Transformation
            acc.Status__c = 'Approved';
            acc.ApprovedDate__c = Date.today();
            toUpdate.add(acc);

            // Side effects
            tasksToCreate.add(new Task(
                Subject = 'Account Approved - Follow up',
                WhatId = acc.Id,
                ActivityDate = Date.today().addDays(7)
            ));
        }

        // DML groupés à la fin
        if (!toUpdate.isEmpty()) update toUpdate;
        if (!tasksToCreate.isEmpty()) insert tasksToCreate;
    }

    // Exception inner class
    public class ValidationException extends Exception {}
}
\`\`\`

### Utilisation depuis un Trigger

\`\`\`apex
public class AccountTriggerHandler {
    public void onAfterUpdate(List<Account> newAccounts, Map<Id, Account> oldMap) {
        Set<Id> approvedIds = new Set<Id>();
        for (Account acc : newAccounts) {
            Account old = oldMap.get(acc.Id);
            if (acc.Status__c == 'Pending Approval' && old.Status__c != 'Pending Approval') {
                approvedIds.add(acc.Id);
            }
        }
        if (!approvedIds.isEmpty()) {
            AccountService.approveAccounts(approvedIds);
        }
    }
}
\`\`\`

### Utilisation depuis un Batch

\`\`\`apex
public class AccountApprovalBatch implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id FROM Account WHERE Status__c = \'Pending Approval\''
        );
    }

    public void execute(Database.BatchableContext bc, List<SObject> scope) {
        Set<Id> ids = new Set<Id>();
        for (SObject rec : scope) ids.add(rec.Id);
        AccountService.approveAccounts(ids); // Même service, même logique
    }

    public void finish(Database.BatchableContext bc) {}
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// NestJS Service — structure identique
@Injectable()
export class AccountService {
  constructor(
    private accountRepository: AccountRepository,
    private taskRepository: TaskRepository,
  ) {}

  async approveAccounts(accountIds: string[]) {
    const accounts = await this.accountRepository.findByIds(accountIds);

    // Validation + transformation
    const approvedAccounts = accounts.map(acc => {
      if (!acc.annualRevenue || acc.annualRevenue < 10000) {
        throw new ValidationException('Revenue criteria not met');
      }
      return { ...acc, status: 'Approved', approvedDate: new Date() };
    });

    // Persist
    await this.accountRepository.updateMany(approvedAccounts);
  }
}
\`\`\`

Structure identique. La seule différence : en Apex, les DML sont à la fin (bulk pattern), pas dispersées dans les transformations.
`,
    gotchas: [
      "Le Service ne doit JAMAIS faire de query — tout passe par le Selector",
      "Le Service doit être testable sans trigger — on peut l'appeler directement en test avec des données créées manuellement",
      "Grouper TOUS les DML à la fin de la méthode service (collecter d'abord, persister ensuite)",
      "Les méthodes Service peuvent être static si elles n'ont pas d'état — préférer static pour la simplicité",
    ],
  },

  {
    id: "pattern-domain",
    title: "Design Pattern — Domain Layer",
    category: "Design Patterns",
    tags: ["pattern", "domain", "FFLIB", "validation"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Domain Layer — La logique sur les objets

Le Domain Layer encapsule la logique **propre à un type de SObject** : validation des champs, calculs dérivés, règles métier au niveau du record.

### Implémentation simple (sans FFLIB)

\`\`\`apex
public class AccountDomain {
    private List<Account> records;

    public AccountDomain(List<Account> records) {
        this.records = records;
    }

    // Validation — appelée depuis before trigger
    public void validate() {
        for (Account acc : records) {
            if (String.isBlank(acc.Name)) {
                acc.Name.addError('Name is required');
            }
            if (acc.AnnualRevenue != null && acc.AnnualRevenue < 0) {
                acc.AnnualRevenue.addError('Annual Revenue cannot be negative');
            }
            if (acc.Phone != null && !acc.Phone.isNumeric()) {
                // Validation format téléphone
            }
        }
    }

    // Enrichissement — appelée depuis before trigger
    public void setDefaults() {
        for (Account acc : records) {
            if (acc.Type == null) acc.Type = 'Prospect';
            if (acc.Rating == null) acc.Rating = 'Cold';
        }
    }

    // Détection de changements — appelée depuis update trigger
    public List<Account> getChangedRecords(Map<Id, Account> oldMap) {
        List<Account> changed = new List<Account>();
        for (Account acc : records) {
            Account old = oldMap.get(acc.Id);
            if (old != null && (
                acc.Name != old.Name ||
                acc.Industry != old.Industry ||
                acc.AnnualRevenue != old.AnnualRevenue
            )) {
                changed.add(acc);
            }
        }
        return changed;
    }
}

// Usage dans le Handler
public class AccountTriggerHandler {
    public void onBeforeInsert(List<Account> newAccounts) {
        AccountDomain domain = new AccountDomain(newAccounts);
        domain.validate();
        domain.setDefaults();
    }

    public void onBeforeUpdate(List<Account> newAccounts, Map<Id, Account> oldMap) {
        AccountDomain domain = new AccountDomain(newAccounts);
        domain.validate();
        List<Account> changed = domain.getChangedRecords(oldMap);
        if (!changed.isEmpty()) {
            AccountService.notifyChanges(changed);
        }
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Domain Model en TypeScript — Value Object / Entity
class Account {
  constructor(private data: AccountData) {}

  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.data.name) errors.push('Name is required');
    if (this.data.annualRevenue < 0) errors.push('Revenue cannot be negative');
    return { isValid: errors.length === 0, errors };
  }

  setDefaults(): Account {
    return new Account({
      ...this.data,
      type: this.data.type ?? 'Prospect',
      rating: this.data.rating ?? 'Cold',
    });
  }
}
\`\`\`

Le Domain Layer Apex ≈ les **Entities** de DDD ou les modèles avec validation de domaine. La différence : en Apex, la "validation" peut appeler \`addError()\` sur les champs pour afficher des erreurs dans l'UI Salesforce.
`,
    gotchas: [
      "addError() sur un champ (acc.Name.addError()) affiche l'erreur directement sur ce champ dans l'UI",
      "addError() sur le record (acc.addError()) affiche un message global en haut du record",
      "Le Domain reçoit les records par référence — les modifications dans validate() et setDefaults() affectent directement Trigger.new",
      "Le Domain ne doit pas faire de SOQL ni de DML — seulement manipuler les records en mémoire",
    ],
  },

  {
    id: "pattern-unit-of-work",
    title: "Design Pattern — Unit of Work",
    category: "Design Patterns",
    tags: ["pattern", "unit-of-work", "DML", "transaction"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Unit of Work — Gestion centralisée des DML

Le Unit of Work accumule toutes les opérations DML et les exécute en une seule transaction à la fin. Évite les DML dispersés dans les services.

### Implémentation simplifiée

\`\`\`apex
public class UnitOfWork {
    private List<SObject> toInsert = new List<SObject>();
    private List<SObject> toUpdate = new List<SObject>();
    private List<SObject> toDelete = new List<SObject>();

    // Enregistrer les opérations (pas de DML immédiat)
    public void registerNew(SObject record) {
        toInsert.add(record);
    }

    public void registerNew(List<SObject> records) {
        toInsert.addAll(records);
    }

    public void registerDirty(SObject record) {
        toUpdate.add(record);
    }

    public void registerDirty(List<SObject> records) {
        toUpdate.addAll(records);
    }

    public void registerDeleted(SObject record) {
        toDelete.add(record);
    }

    // Committer toutes les opérations en une seule transaction
    public void commitWork() {
        Savepoint sp = Database.setSavepoint();
        try {
            if (!toInsert.isEmpty()) insert toInsert;
            if (!toUpdate.isEmpty()) update toUpdate;
            if (!toDelete.isEmpty()) delete toDelete;
        } catch (Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
}

// Usage dans un service
public class OrderService {
    public static void createOrderWithItems(Order__c order, List<OrderItem__c> items) {
        UnitOfWork uow = new UnitOfWork();

        uow.registerNew(order);
        // items référencent order, besoin d'insert order d'abord...
        // (simplification — FFLIB gère les dépendances automatiquement)

        for (OrderItem__c item : items) {
            item.Order__c = order.Id; // fonctionne si order a déjà un Id (update)
            uow.registerNew(item);
        }

        uow.commitWork(); // UN SEUL endroit avec DML
    }
}
\`\`\`

### Savepoints — Transactions manuelles

\`\`\`apex
// Savepoint = checkpoint de rollback
Savepoint sp = Database.setSavepoint();

try {
    insert account;
    insert contact; // si ça échoue...
    // ... on peut rollback tout
} catch (Exception e) {
    Database.rollback(sp); // rollback jusqu'au savepoint
    throw e; // re-throw pour informer l'appelant
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Prisma Transaction — équivalent du Unit of Work
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({
    data: items.map(item => ({ ...item, orderId: order.id }))
  });
}); // commit ou rollback automatique

// Ou Drizzle transaction
await db.transaction(async (tx) => {
  await tx.insert(orders).values(orderData);
  await tx.insert(orderItems).values(itemsData);
});
\`\`\`

Le Unit of Work Apex ≈ le pattern \`$transaction\` de Prisma. La différence : en Apex, toute la transaction est implicitement une unité de travail (ACID) — le Unit of Work pattern est plus un organisateur de code qu'une vraie gestion de transaction.
`,
    gotchas: [
      "Database.setSavepoint() consomme 1 savepoint — max 5 savepoints par transaction",
      "Les Savepoints ne fonctionnent pas avec les callouts HTTP — si tu as fait un callout, tu ne peux plus rollback",
      "L'ordre des DML dans commitWork() est important si des records ont des dépendances",
      "FFLIB propose une implémentation complète du Unit of Work — l'utiliser en production plutôt que de réimplémenter",
    ],
  },

  // ─────────────────────────────────────────────
  // TOPICS SUPPLEMENTAIRES PD1/PD2
  // ─────────────────────────────────────────────
  {
    id: "sosl-search",
    title: "SOSL — Salesforce Object Search Language",
    category: "SOQL & Requêtes",
    tags: ["SOSL", "search", "full-text"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## SOSL — Recherche full-text cross-objects

SOSL permet de chercher un terme dans **plusieurs objets à la fois** — comme un moteur de recherche.

\`\`\`apex
// Syntaxe SOSL
List<List<SObject>> results = [
    FIND 'Acme*'
    IN ALL FIELDS
    RETURNING
        Account(Id, Name, Industry),
        Contact(Id, LastName, Email),
        Lead(Id, LastName, Company)
    LIMIT 10
];

// Extraction des résultats par type
List<Account> accounts = (List<Account>) results[0];
List<Contact> contacts = (List<Contact>) results[1];
List<Lead> leads = (List<Lead>) results[2];

System.debug('Accounts found: ' + accounts.size());
System.debug('Contacts found: ' + contacts.size());

// SOSL avec bind variable
String searchTerm = 'Acme*';
List<List<SObject>> results2 = [FIND :searchTerm IN NAME FIELDS RETURNING Account(Id, Name)];

// Scope de recherche
// IN ALL FIELDS → tous les champs
// IN NAME FIELDS → champs Name uniquement
// IN EMAIL FIELDS → champs Email uniquement
// IN PHONE FIELDS → champs Phone uniquement
\`\`\`

## SOSL vs SOQL — Quand utiliser quoi

| Critère | SOQL | SOSL |
|---|---|---|
| Recherche sur un seul objet | ✅ Idéal | Possible mais over-engineered |
| Recherche multi-objets | ❌ | ✅ Idéal |
| Recherche par Id exact | ✅ | ❌ |
| Full-text search / wildcards | Limité (\`LIKE\`) | ✅ Natif |
| Limites Governor | 100 queries max | 20 searches max |
| Résultats triés | Avec ORDER BY | Non garanti |
`,
    tsAnalogy: `
SOSL ≈ Elasticsearch ou Algolia intégré. Une seule requête qui cherche dans plusieurs "indices" (objects) simultanément. En SQL pur il faudrait faire N requêtes UNION ALL.
`,
    gotchas: [
      "SOSL retourne List<List<SObject>> — double liste, toujours accéder par index et caster",
      "Max 20 recherches SOSL par transaction (vs 100 SOQL)",
      "Les wildcards (* et ?) fonctionnent en SOSL mais pas au début du terme — '*cme' ne fonctionne pas",
      "SOSL ignore les champs chiffrés et certains champs système",
    ],
  },

  {
    id: "apex-managed-sharing",
    title: "Apex Managed Sharing — Partage programmatique",
    category: "Sécurité & Accès",
    tags: ["sharing", "security", "record-access", "with sharing"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## with sharing vs without sharing vs inherited sharing

\`\`\`apex
// with sharing : respecte les règles de partage de l'utilisateur courant
// → Recommandé par défaut pour la sécurité
public with sharing class AccountService {
    public List<Account> getAccounts() {
        // Retourne UNIQUEMENT les accounts que l'user a le droit de voir
        return [SELECT Id, Name FROM Account];
    }
}

// without sharing : ignore les règles de partage, accès complet
// → Nécessaire pour les opérations admin (ex: jobs de nuit)
public without sharing class AdminAccountService {
    public List<Account> getAllAccounts() {
        // Retourne TOUS les accounts, peu importe les permissions
        return [SELECT Id, Name FROM Account];
    }
}

// inherited sharing : hérite du contexte de l'appelant
// → Bon pour les librairies utilitaires
public inherited sharing class AccountUtils {
    public static Integer countAccounts() {
        return [SELECT COUNT() FROM Account];
    }
}
\`\`\`

## Apex Managed Sharing — Créer des règles de partage par code

\`\`\`apex
// Partager un record Account avec un utilisateur spécifique
public static void shareAccountWithUser(Id accountId, Id userId) {
    AccountShare share = new AccountShare();
    share.AccountId = accountId;
    share.UserOrGroupId = userId;
    share.AccountAccessLevel = 'Edit'; // 'Read', 'Edit', 'All'
    share.OpportunityAccessLevel = 'Edit';
    share.CaseAccessLevel = 'Edit';
    share.RowCause = Schema.AccountShare.RowCause.Manual;

    insert share;
}

// Vérifier l'accès d'un user à un record
Boolean hasAccess = [
    SELECT COUNT()
    FROM AccountShare
    WHERE AccountId = :accountId
    AND UserOrGroupId = :userId
] > 0;

// Supprimer un partage
delete [
    SELECT Id
    FROM AccountShare
    WHERE AccountId = :accountId
    AND UserOrGroupId = :userId
    AND RowCause = 'Manual'
];
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : middleware de permission NestJS
@UseGuards(AccountOwnerGuard) // with sharing
async getAccounts(): Promise<Account[]> { ... }

// Sans guard :
async getAllAccounts(): Promise<Account[]> { ... } // without sharing
\`\`\`

'with sharing' ≈ middleware qui filtre automatiquement les résultats selon les permissions. 'without sharing' = bypass total du middleware. Toujours utiliser 'with sharing' sauf raison valable.
`,
    gotchas: [
      "Une classe sans modificateur de sharing hérite du comportement de la classe appelante — ambiguïté, toujours être explicite",
      "without sharing ne bypass pas la sécurité FLS (Field Level Security) — les champs cachés restent cachés",
      "Apex Managed Sharing fonctionne uniquement pour les objets avec OWD (Org Wide Default) = Private ou Public Read Only",
      "RowCause = 'Manual' est nécessaire pour les partages créés par Apex — utiliser un custom Sharing Reason pour les partages automatisés",
    ],
  },

  {
    id: "apex-callouts",
    title: "HTTP Callouts — Intégration avec des APIs externes",
    category: "Intégrations",
    tags: ["callout", "HTTP", "REST", "intégration"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## HTTP Callouts en Apex

\`\`\`apex
// Classe d'intégration
public class ExternalApiService {

    // Endpoint configuré dans Setup → Remote Site Settings (obligatoire !)
    private static final String BASE_URL = 'https://api.example.com';

    public static HttpResponse getResource(String resourceId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/resources/' + resourceId);
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + getAuthToken());
        req.setHeader('Content-Type', 'application/json');
        req.setTimeout(10000); // 10 secondes max

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() != 200) {
            throw new CalloutException('HTTP Error: ' + res.getStatusCode() + ' - ' + res.getBody());
        }

        return res;
    }

    public static String createResource(Map<String, Object> data) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/resources');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(data));

        Http http = new Http();
        HttpResponse res = http.send(req);

        // Parser la réponse JSON
        Map<String, Object> responseBody = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        return (String) responseBody.get('id');
    }
}
\`\`\`

## JSON Serialization/Deserialization

\`\`\`apex
// Sérialiser un objet Apex en JSON
Account acc = new Account(Name = 'Test', Industry = 'Tech');
String jsonStr = JSON.serialize(acc);
// → '{"Name":"Test","Industry":"Tech"}'

// Désérialiser du JSON vers un type connu
Account deserialized = (Account) JSON.deserialize(jsonStr, Account.class);

// Désérialiser vers Map (pour du JSON dynamique)
String rawJson = '{"id": "123", "name": "Test", "nested": {"key": "value"}}';
Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(rawJson);
String id = (String) parsed.get('id');
Map<String, Object> nested = (Map<String, Object>) parsed.get('nested');

// Classe de wrapper pour JSON typé
public class ApiResponse {
    public String id;
    public String name;
    public Integer status;
    public List<String> tags;
}

ApiResponse response = (ApiResponse) JSON.deserialize(jsonStr, ApiResponse.class);
\`\`\`

## Named Credentials — Alternative sécurisée aux tokens hardcodés

\`\`\`apex
// Au lieu de hardcoder l'URL/token...
// Configurer dans Setup → Named Credentials : 'ExternalAPI'

HttpRequest req = new HttpRequest();
req.setEndpoint('callout:ExternalAPI/resources'); // utilise la Named Credential
req.setMethod('GET');
// L'authentification est gérée automatiquement par Salesforce !

Http http = new Http();
HttpResponse res = http.send(req);
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// fetch / axios en TypeScript
const response = await fetch(\`\${BASE_URL}/resources/\${id}\`, {
  headers: { Authorization: \`Bearer \${token}\` }
});
const data = await response.json();
\`\`\`

Différences :
- En Apex les callouts sont **synchrones** (blocking) — pas d'async/await
- L'URL DOIT être dans Remote Site Settings (liste blanche) ou utiliser Named Credentials
- Max 120 secondes de timeout total, 100 callouts par transaction
- Impossible de faire un callout depuis un trigger synchrone — utiliser @future(callout=true) ou Queueable
`,
    gotchas: [
      "Remote Site Settings doit inclure l'URL exacte — http et https sont des entrées différentes",
      "Les callouts ne sont pas permis après un DML sans rollback — l'ordre callout→DML est requis, pas DML→callout dans la même transaction",
      "JSON.deserialize() échoue si le JSON a des champs que la classe Apex n'a pas — utiliser JSON.deserializeUntyped() pour plus de flexibilité",
      "Named Credentials = sécurité au niveau org — les tokens ne sont jamais dans le code",
    ],
  },

  {
    id: "apex-platform-events",
    title: "Platform Events — Event-driven Architecture",
    category: "Async Apex",
    tags: ["platform-events", "event", "pub-sub", "async"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Platform Events — Pub/Sub natif Salesforce

Les Platform Events permettent une architecture événementielle découplée.

### Définir un Platform Event
\`\`\`
Setup → Platform Events → New Platform Event
Nom : Order_Placed__e (suffixe __e obligatoire)
Champs : OrderId__c (Text), TotalAmount__c (Number), CustomerId__c (Text)
\`\`\`

### Publisher — Publier un événement

\`\`\`apex
public class OrderService {
    public static void placeOrder(Order__c order) {
        // Logique métier...
        update order;

        // Publier un événement
        Order_Placed__e event = new Order_Placed__e(
            OrderId__c = order.Id,
            TotalAmount__c = order.TotalAmount__c,
            CustomerId__c = order.Customer__c
        );

        // EventBus.publish() retourne Database.SaveResult[]
        Database.SaveResult result = EventBus.publish(event);
        if (!result.isSuccess()) {
            System.debug('Failed to publish event: ' + result.getErrors());
        }

        // Ou publier plusieurs événements en bulk
        List<Order_Placed__e> events = new List<Order_Placed__e>();
        // ...
        EventBus.publish(events);
    }
}
\`\`\`

### Subscriber — Trigger sur Platform Event

\`\`\`apex
// Un trigger spécial sur l'objet __e
trigger OrderPlacedTrigger on Order_Placed__e (after insert) {
    // Les événements arrivent toujours en after insert
    List<Id> orderIds = new List<Id>();

    for (Order_Placed__e event : Trigger.new) {
        orderIds.add(event.OrderId__c);
        System.debug('Order placed: ' + event.OrderId__c +
                     ' Amount: ' + event.TotalAmount__c);
    }

    // Traitement asynchrone des commandes
    OrderFulfillmentService.processOrders(orderIds);
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// EventEmitter NestJS ou RabbitMQ
eventEmitter.emit('order.placed', { orderId, totalAmount, customerId });

// Subscriber
@OnEvent('order.placed')
async handleOrderPlaced(event: OrderPlacedEvent) {
  await this.fulfillmentService.processOrder(event.orderId);
}
\`\`\`

Platform Events ≈ RabbitMQ ou Kafka léger intégré à Salesforce. La persistance est assurée par Salesforce (retry automatique), et les subscribers peuvent être des triggers Apex, du LWC, ou des systèmes externes via CometD.
`,
    gotchas: [
      "Les Platform Events sont délivrés de manière asynchrone — le publisher ne peut pas attendre la réponse du subscriber",
      "Pas de rollback des événements publiés si la transaction principale échoue (contrairement aux DML)",
      "Max 250 000 Platform Events par jour par org (édition Enterprise)",
      "Les triggers sur Platform Events ont leur propre Governor Limits fraîches",
    ],
  },

  {
    id: "apex-switch-flow-control",
    title: "Control Flow — Switch, loops, patterns",
    category: "Control Flow",
    tags: ["switch", "loops", "if-else", "flow"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## Switch Statement en Apex

\`\`\`apex
// switch on — plus propre que les if-else chains
String industry = 'Technology';

switch on industry {
    when 'Technology', 'Software' {
        System.debug('Tech sector');
    }
    when 'Finance', 'Banking' {
        System.debug('Finance sector');
    }
    when null {
        System.debug('Industry not set');
    }
    when else {
        System.debug('Other: ' + industry);
    }
}

// switch on Integer
Integer statusCode = 404;
switch on statusCode {
    when 200 { System.debug('OK'); }
    when 404 { System.debug('Not Found'); }
    when 500 { System.debug('Server Error'); }
    when else { System.debug('Unknown: ' + statusCode); }
}

// switch sur SObject type — très puissant !
SObject record = someQuery[0];
switch on record {
    when Account acc {
        System.debug('Account: ' + acc.Name);
    }
    when Contact c {
        System.debug('Contact: ' + c.LastName);
    }
    when Lead l {
        System.debug('Lead: ' + l.LastName);
    }
}
\`\`\`

## Loops complets

\`\`\`apex
// For classique
for (Integer i = 0; i < 10; i++) {
    System.debug(i);
}

// For-each sur List
List<String> names = new List<String>{'Alice', 'Bob', 'Charlie'};
for (String name : names) {
    System.debug(name);
}

// For-each SOQL inline (optimal pour les grandes queries)
for (Account acc : [SELECT Id, Name FROM Account LIMIT 1000]) {
    // Traite chaque record sans charger toute la liste en mémoire
    // → Consomme moins de heap
    System.debug(acc.Name);
}

// While
Integer count = 0;
while (count < 5) {
    System.debug(count);
    count++;
}

// Do-while
Integer attempts = 0;
do {
    System.debug('Attempt: ' + attempts);
    attempts++;
} while (attempts < 3);

// break et continue
for (Integer i = 0; i < 10; i++) {
    if (i == 3) continue; // skip 3
    if (i == 7) break;    // stop à 7
    System.debug(i);
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript switch
switch (industry) {
  case 'Technology':
  case 'Software':
    console.log('Tech sector');
    break;
  default:
    console.log('Other');
}

// Pas d'équivalent au switch-on-SObject-type en TS
// (instanceof existe mais sans le destructuring automatique)
\`\`\`

Le \`switch on SObject type\` est unique à Apex — il détecte dynamiquement le type de SObject et le déstructure automatiquement dans la variable nommée. C'est l'équivalent d'un \`if (record instanceof Account acc)\` Java moderne.
`,
    gotchas: [
      "switch on String : les when values doivent être des literals, pas des variables",
      "Le SOQL for-loop (for (Account a : [SELECT...])) est le seul moyen d'itérer sur plus de 50 000 records sans dépasser le heap",
      "break dans un switch sort du switch, pas d'une boucle englobante — utiliser un booléen flag pour sortir de la boucle depuis un switch imbriqué",
    ],
  },

  {
    id: "apex-debugging",
    title: "Debugging — System.debug et outils",
    category: "Outils & Debug",
    tags: ["debug", "logs", "System.debug", "outils"],
    difficulty: "beginner",
    certRelevance: ["PD1", "PD2"],
    content: `
## System.debug — Le console.log d'Apex

\`\`\`apex
// Niveaux de log
System.debug('Message simple');
System.debug(LoggingLevel.INFO, 'Info level');
System.debug(LoggingLevel.WARN, 'Warning message');
System.debug(LoggingLevel.ERROR, 'Error occurred: ' + e.getMessage());
System.debug(LoggingLevel.DEBUG, 'Debug: ' + someVar);
System.debug(LoggingLevel.FINE, 'Verbose detail');

// Déboguer des objets
Account acc = [SELECT Id, Name FROM Account LIMIT 1];
System.debug(acc); // affiche l'objet sérialisé
System.debug(JSON.serializePretty(acc)); // plus lisible

// Déboguer des collections
List<Account> accounts = [SELECT Id, Name FROM Account LIMIT 10];
System.debug('Count: ' + accounts.size());
for (Account a : accounts) {
    System.debug(a.Id + ' → ' + a.Name);
}

// Déboguer les limites
System.debug('SOQL: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
System.debug('DML: ' + Limits.getDmlStatements() + '/' + Limits.getLimitDmlStatements());
System.debug('CPU: ' + Limits.getCpuTime() + 'ms');
System.debug('Heap: ' + Limits.getHeapSize() + ' bytes');
\`\`\`

## Où voir les logs

\`\`\`
1. Developer Console (Setup → Developer Console)
   → Execute Anonymous Window pour tester du code
   → Logs → ouvrir le log → chercher les DEBUG lines

2. VS Code + Salesforce Extension Pack
   → SFDX: Get Apex Logs
   → SFDX: Turn On Apex Debug Log

3. Setup → Debug Logs
   → Configurer le niveau de log par user/class
\`\`\`

## Execute Anonymous — Tester du code à la volée

\`\`\`apex
// Dans la Developer Console → Execute Anonymous Window
// Ou dans VS Code : SFDX: Execute Anonymous Apex

// Tester une méthode rapidement
AccountService service = new AccountService();
Account result = service.getAccountByName('Acme Corp');
System.debug(result);

// Déclencher un batch manuellement
Database.executeBatch(new AccountAnnualReviewBatch(), 200);

// Tester une SOQL
List<Account> accs = [SELECT Id, Name, Industry FROM Account WHERE Industry = 'Tech' LIMIT 5];
for (Account acc : accs) {
    System.debug(acc.Name + ' - ' + acc.Industry);
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Node.js
console.log('Message');
console.warn('Warning');
console.error('Error');
console.debug('Debug', obj);
\`\`\`

System.debug ≈ console.log mais avec des niveaux configurables dans les Debug Logs. L'Execute Anonymous ≈ Node.js REPL ou les scripts ts-node — idéal pour explorer des données ou tester rapidement.
`,
    gotchas: [
      "System.debug ne fait RIEN si les Debug Logs ne sont pas activés pour l'user/classe — toujours vérifier Setup → Debug Logs",
      "Les logs ont une taille maximale (5 MB) — sur de gros volumes, utiliser LoggingLevel.ERROR seulement pour ne pas saturer",
      "Le CPU time inclut le temps de System.debug — enlever les debug logs en production améliore les performances",
      "JSON.serializePretty() est beaucoup plus lisible que le debug brut d'un SObject pour les objets complexes",
    ],
  },

  {
    id: "apex-metadata-api",
    title: "Schema et Metadata — Describe API",
    category: "Metadata & API",
    tags: ["schema", "describe", "metadata", "dynamic"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Schema Describe — Introspection des objets Salesforce

\`\`\`apex
// Describe un objet
Schema.SObjectType accountType = Account.SObjectType;
Schema.DescribeSObjectResult accountDescribe = accountType.getDescribe();

System.debug('Label: ' + accountDescribe.getLabel());
System.debug('Plural: ' + accountDescribe.getLabelPlural());
System.debug('API Name: ' + accountDescribe.getName());
System.debug('Createable: ' + accountDescribe.isCreateable());
System.debug('Deletable: ' + accountDescribe.isDeletable());
System.debug('Custom: ' + accountDescribe.isCustom());

// Lister tous les champs
Map<String, Schema.SObjectField> fields = accountDescribe.fields.getMap();
for (String fieldName : fields.keySet()) {
    Schema.DescribeFieldResult field = fields.get(fieldName).getDescribe();
    System.debug(fieldName + ' → ' + field.getType() + ' (' + field.getLabel() + ')');
}

// Describe un champ spécifique
Schema.DescribeFieldResult nameField = Account.Name.getDescribe();
System.debug('Name field type: ' + nameField.getType()); // STRING
System.debug('Name required: ' + !nameField.isNillable());
System.debug('Name max length: ' + nameField.getLength());

// Valeurs d'une picklist
Schema.DescribeFieldResult industryField = Account.Industry.getDescribe();
for (Schema.PicklistEntry entry : industryField.getPicklistValues()) {
    if (entry.isActive()) {
        System.debug(entry.getValue() + ' : ' + entry.getLabel());
    }
}
\`\`\`

## getGlobalDescribe — Découvrir tous les objets

\`\`\`apex
// Lister tous les objets de l'org
Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();
for (String objectName : globalDescribe.keySet()) {
    Schema.DescribeSObjectResult desc = globalDescribe.get(objectName).getDescribe();
    if (desc.isCustom() && desc.isQueryable()) {
        System.debug('Custom object: ' + objectName);
    }
}

// Vérifier si un objet/champ existe dynamiquement
Boolean fieldExists = Account.SObjectType.getDescribe().fields.getMap().containsKey('customfield__c');
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — introspection de types (impossible au runtime nativement)
// Équivalent conceptuel avec Drizzle/TypeORM schema introspection
const columns = await db.introspectTable('Account');
\`\`\`

La Describe API est plus puissante que l'introspection TypeScript standard — elle donne accès aux labels, permissions, types de champs, valeurs de picklist, tout dynamiquement au runtime.
`,
    gotchas: [
      "getGlobalDescribe() sur une org avec beaucoup d'objets peut consommer beaucoup de CPU — utiliser avec parcimonie",
      "Les Describe API calls sont coûteuses en CPU — cacher les résultats dans des variables statiques si appelé plusieurs fois dans la même transaction",
      "Schema.getGlobalDescribe() retourne les API names en minuscules sur certaines versions — normaliser avec toLowerCase() si nécessaire",
    ],
  },

  {
    id: "apex-visualforce-controller",
    title: "Visualforce Controllers — Pages web legacy",
    category: "UI & Visualforce",
    tags: ["Visualforce", "controller", "UI", "page"],
    difficulty: "intermediate",
    certRelevance: ["PD1"],
    content: `
## Visualforce — Le système de pages web legacy Salesforce

Visualforce est un framework MVC pour créer des pages web dans Salesforce. Bien que les LWC (Lightning Web Components) soient préférés aujourd'hui, Visualforce reste à l'examen PD1.

### Standard Controller vs Custom Controller

\`\`\`apex
// Custom Controller — logique complète en Apex
public class AccountDetailController {
    // Propriété bindée à la page VF
    public Account account { get; set; }
    public List<Contact> contacts { get; private set; }
    public String statusMessage { get; set; }

    // Constructeur — reçoit le contexte de la page
    public AccountDetailController() {
        Id accountId = ApexPages.currentPage().getParameters().get('id');
        if (accountId != null) {
            account = [SELECT Id, Name, Industry, AnnualRevenue FROM Account WHERE Id = :accountId LIMIT 1];
            contacts = [SELECT Id, LastName, Email FROM Contact WHERE AccountId = :accountId];
        }
    }

    // Action method — appelée depuis un bouton/commandButton VF
    public PageReference saveAccount() {
        try {
            update account;
            statusMessage = 'Saved successfully!';
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.CONFIRM, 'Account updated'
            ));
        } catch (DmlException e) {
            ApexPages.addMessage(new ApexPages.Message(
                ApexPages.Severity.ERROR, e.getMessage()
            ));
        }
        return null; // null = rester sur la même page
    }

    public PageReference cancel() {
        // Rediriger vers la page standard du record
        return new PageReference('/' + account.Id);
    }
}
\`\`\`

### Page VF correspondante (markup)

\`\`\`xml
<apex:page controller="AccountDetailController">
    <apex:messages />
    <apex:form>
        <apex:inputField value="{!account.Name}" />
        <apex:inputField value="{!account.Industry}" />
        <apex:commandButton action="{!saveAccount}" value="Save" />
        <apex:commandButton action="{!cancel}" value="Cancel" immediate="true" />
    </apex:form>
    <apex:dataTable value="{!contacts}" var="contact">
        <apex:column value="{!contact.LastName}" />
        <apex:column value="{!contact.Email}" />
    </apex:dataTable>
</apex:page>
\`\`\`

### Extension Controller

\`\`\`apex
// Extension : ajoute des fonctions à un controller standard
public class AccountExtension {
    private final Account acc;
    private ApexPages.StandardController stdController;

    public AccountExtension(ApexPages.StandardController controller) {
        this.stdController = controller;
        this.acc = (Account) controller.getRecord();
    }

    public PageReference customAction() {
        // Logique custom
        return null;
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Analogie : Controller NestJS + template Vue.js
@Controller('accounts')
export class AccountController {
  // @Get(':id') → consulter le paramètre id
  // @Put(':id') → saveAccount()
}
\`\`\`

Visualforce Controller ≈ un Controller MVC (Nest/Express + template engine). Les {! } sont les bindings (comme {{ }} Vue.js), les action methods sont comme les routes, et PageReference est comme un redirect(). C'est une technologie legacy — LWC est la cible moderne.
`,
    gotchas: [
      "get; set; sur les propriétés VF = getters/setters publics obligatoires pour le binding de la page",
      "ApexPages.addMessage() affiche des messages à l'utilisateur — nécessite <apex:messages/> dans la page",
      "Retourner null depuis une action method reste sur la même page, retourner un PageReference redirige",
      "ViewState limité à 170 KB — éviter les grandes collections dans les propriétés de controller",
    ],
  },

  {
    id: "apex-rest-webservices",
    title: "Apex REST — Exposer des APIs depuis Salesforce",
    category: "Intégrations",
    tags: ["REST", "API", "webservice", "@RestResource"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## Créer des APIs REST en Apex

\`\`\`apex
@RestResource(urlMapping='/accounts/*')
global class AccountRestApi {

    // GET /services/apexrest/accounts/
    // GET /services/apexrest/accounts/001XXXXXX
    @HttpGet
    global static Account getAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);

        if (String.isBlank(accountId) || accountId == 'accounts') {
            // Retourner une liste (simplification)
            // En vrai on utiliserait une classe wrapper
            return null;
        }

        return [SELECT Id, Name, Industry FROM Account WHERE Id = :accountId LIMIT 1];
    }

    // POST /services/apexrest/accounts/
    @HttpPost
    global static String createAccount(String name, String industry, Decimal annualRevenue) {
        Account acc = new Account(
            Name = name,
            Industry = industry,
            AnnualRevenue = annualRevenue
        );
        insert acc;

        RestContext.response.statusCode = 201; // Created
        return acc.Id;
    }

    // PUT /services/apexrest/accounts/001XXXXXX
    @HttpPut
    global static String updateAccount(String name, String industry) {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);

        Account acc = [SELECT Id FROM Account WHERE Id = :accountId];
        acc.Name = name;
        acc.Industry = industry;
        update acc;

        return 'Updated: ' + acc.Id;
    }

    // DELETE /services/apexrest/accounts/001XXXXXX
    @HttpDelete
    global static void deleteAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        Account acc = [SELECT Id FROM Account WHERE Id = :accountId];
        delete acc;
        RestContext.response.statusCode = 204; // No Content
    }
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// NestJS Controller — exactement pareil
@Controller('accounts')
export class AccountsController {
  @Get(':id')
  getAccount(@Param('id') id: string) { ... }

  @Post()
  createAccount(@Body() dto: CreateAccountDto) { ... }

  @Put(':id')
  updateAccount(@Param('id') id: string, @Body() dto: UpdateAccountDto) { ... }

  @Delete(':id')
  deleteAccount(@Param('id') id: string) { ... }
}
\`\`\`

La structure est presque identique. Différences : en Apex la classe doit être \`global\` (pas juste \`public\`), et les méthodes utilisent des annotations \`@HttpGet/Post/Put/Delete\` au lieu de \`@Get()/@Post()\` NestJS.
`,
    gotchas: [
      "La classe DOIT être global (pas public) pour être accessible en tant qu'API REST",
      "Les méthodes REST DOIVENT être global static",
      "L'URL de base est toujours /services/apexrest/ + le urlMapping défini dans @RestResource",
      "RestContext.response.statusCode doit être défini manuellement si tu veux retourner autre chose que 200",
      "Les paramètres @HttpPost sont passés dans le body JSON automatiquement si les noms correspondent",
    ],
  },

  {
    id: "apex-security-fls",
    title: "Sécurité — CRUD, FLS et Strip Inaccessible",
    category: "Sécurité & Accès",
    tags: ["sécurité", "FLS", "CRUD", "permissions"],
    difficulty: "advanced",
    certRelevance: ["PD2"],
    content: `
## CRUD et FLS — Vérifier les permissions avant DML

\`\`\`apex
// Vérifier si l'user peut créer un Account
if (Schema.SObjectType.Account.isCreateable()) {
    insert new Account(Name = 'Test');
} else {
    throw new SecurityException('No permission to create Account');
}

// Vérifier les permissions sur un champ (FLS - Field Level Security)
if (Schema.SObjectType.Account.fields.Industry.isUpdateable()) {
    acc.Industry = 'Technology';
}

// Méthodes disponibles
// isCreateable() → peut créer
// isUpdateable() → peut modifier
// isDeletable() → peut supprimer
// isAccessible() → peut lire (query)

// Vérifier FLS sur plusieurs champs
public static Boolean canReadField(String objectName, String fieldName) {
    Map<String, Schema.SObjectField> fields =
        Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
    if (!fields.containsKey(fieldName)) return false;
    return fields.get(fieldName).getDescribe().isAccessible();
}
\`\`\`

## Security.stripInaccessible() — API moderne

\`\`\`apex
// Retirer automatiquement les champs non accessibles à l'user
List<Account> accounts = [SELECT Id, Name, Industry, AnnualRevenue FROM Account];

// Strippper les champs que l'user ne peut pas lire
SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.READABLE,
    accounts
);
List<Account> safeAccounts = (List<Account>) decision.getRecords();

// Pour les DML
SObjectAccessDecision createDecision = Security.stripInaccessible(
    AccessType.CREATABLE,
    accountsToInsert
);
insert createDecision.getRecords();

// Types d'accès
// AccessType.READABLE → lecture
// AccessType.CREATABLE → création
// AccessType.UPDATABLE → modification
// AccessType.UPSERTABLE → upsert
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// NestJS Guards + @Roles
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async createAccount(@Body() dto: CreateAccountDto) { ... }

// Ou filtrage par champs selon le rôle
const safeData = omit(rawData, user.role === 'viewer' ? ['salary', 'ssn'] : []);
\`\`\`

Security.stripInaccessible() ≈ un DTO transform automatique qui retire les champs selon les permissions utilisateur. C'est beaucoup plus élégant que les vérifications manuelles champ par champ.
`,
    gotchas: [
      "with sharing contrôle QUELS records l'user voit (row-level), FLS contrôle QUELS CHAMPS l'user voit (field-level)",
      "Security.stripInaccessible() est la méthode recommandée depuis API 47.0 — utiliser à la place des isAccessible() manuels",
      "Les vérifications CRUD/FLS ne sont pas faites automatiquement en Apex — le développeur est responsable de les implémenter",
      "stripInaccessible() sur CREATABLE modifie aussi la liste passée en paramètre — utiliser une copie si besoin de garder les données originales",
    ],
  },

  {
    id: "apex-test-async",
    title: "Tester le code Async — @future, Queueable, Batch",
    category: "Tests",
    tags: ["test", "async", "future", "batch", "queueable"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Tester le code asynchrone

### Tester @future

\`\`\`apex
@isTest
static void testFutureMethod() {
    Account acc = new Account(Name = 'Test');
    insert acc;

    Test.startTest();
    // Appeler la méthode @future
    AccountIntegrationService.syncToExternalSystem(new Set<Id>{acc.Id});
    // Test.stopTest() force l'exécution synchrone de TOUS les @future en attente
    Test.stopTest();

    // Vérifier les résultats APRÈS stopTest()
    Account updated = [SELECT Id, SyncStatus__c FROM Account WHERE Id = :acc.Id];
    System.assertEquals('Synced', updated.SyncStatus__c);
}
\`\`\`

### Tester Queueable

\`\`\`apex
@isTest
static void testQueueableJob() {
    List<Account> accounts = new List<Account>();
    for (Integer i = 0; i < 5; i++) {
        accounts.add(new Account(Name = 'Test ' + i));
    }
    insert accounts;

    Test.startTest();
    Id jobId = System.enqueueJob(new AccountSyncJob(accounts, 0));
    Test.stopTest(); // Force l'exécution du Queueable

    // Vérifier
    System.assertNotEquals(null, jobId);
    // Vérifier les side effects...
}
\`\`\`

### Tester Batch

\`\`\`apex
@isTest
static void testBatch() {
    // Créer 200 records de test
    List<Account> accounts = new List<Account>();
    for (Integer i = 0; i < 200; i++) {
        accounts.add(new Account(
            Name = 'Test ' + i,
            LastReviewDate__c = Date.today().addYears(-2) // vieux = à traiter
        ));
    }
    insert accounts;

    Test.startTest();
    // Lancer le batch avec un petit chunk pour le test
    Id batchId = Database.executeBatch(new AccountAnnualReviewBatch(), 200);
    Test.stopTest(); // Force l'exécution complète du batch

    // Vérifier que tous les records ont été traités
    Integer reviewed = [
        SELECT COUNT() FROM Account
        WHERE Name LIKE 'Test%' AND ReviewStatus__c = 'Reviewed'
    ];
    System.assertEquals(200, reviewed, 'All 200 accounts should be reviewed');
}
\`\`\`

### Tester les emails

\`\`\`apex
@isTest
static void testEmailSending() {
    Integer emailsBefore = Limits.getEmailInvocations();

    Test.startTest();
    MyEmailService.sendWelcomeEmail('test@example.com');
    Test.stopTest();

    // Vérifier que l'email a été envoyé (en test, les emails ne sont pas vraiment envoyés)
    System.assertEquals(emailsBefore + 1, Limits.getEmailInvocations());
}
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// Jest avec fake timers pour async
jest.useFakeTimers();

test('async job', async () => {
  jobService.scheduleJob(data);
  jest.runAllTimers(); // équivalent Test.stopTest()
  expect(await db.findRecord(id)).toMatchObject({ status: 'processed' });
});
\`\`\`

Test.startTest()/stopTest() ≈ \`jest.runAllTimers()\` ou \`await queue.drain()\` — ils forcent l'exécution synchrone du code async dans le contexte de test.
`,
    gotchas: [
      "Test.stopTest() est OBLIGATOIRE pour tester @future et Queueable — sans lui, le code async ne s'exécute pas pendant le test",
      "Un seul niveau de chaînage Queueable peut être testé — les jobs chaînés depuis execute() ne s'exécutent pas dans les tests",
      "Database.executeBatch() dans les tests exécute tout de suite (start + execute + finish) en mode synchrone",
      "Les emails envoyés dans les tests ne sont pas réellement envoyés — utiliser Limits.getEmailInvocations() pour vérifier",
    ],
  },

  {
    id: "apex-collections-advanced",
    title: "Collections avancées — tri custom, itérateurs",
    category: "Collections",
    tags: ["collections", "sort", "comparable", "iterator"],
    difficulty: "intermediate",
    certRelevance: ["PD2"],
    content: `
## Tri personnalisé avec Comparable

\`\`\`apex
// Tri multi-critères
public class AccountWrapper implements Comparable {
    public Account record;
    public Integer priority;

    public AccountWrapper(Account acc, Integer priority) {
        this.record = acc;
        this.priority = priority;
    }

    public Integer compareTo(Object other) {
        AccountWrapper otherWrapper = (AccountWrapper) other;

        // D'abord par priority (décroissant)
        if (this.priority != otherWrapper.priority) {
            return otherWrapper.priority - this.priority; // décroissant
        }

        // Ensuite par nom (alphabétique)
        return this.record.Name.compareTo(otherWrapper.record.Name);
    }
}

// Usage
List<AccountWrapper> wrappers = new List<AccountWrapper>();
// ... remplir la liste
wrappers.sort(); // tri selon compareTo()
\`\`\`

## Nested Maps — Structures de données complexes

\`\`\`apex
// Map<String, Map<String, List<Account>>> — groupement à deux niveaux
Map<String, Map<String, List<Account>>> accountsByIndustryAndRating =
    new Map<String, Map<String, List<Account>>>();

for (Account acc : accounts) {
    String industry = acc.Industry != null ? acc.Industry : 'Unknown';
    String rating = acc.Rating != null ? acc.Rating : 'Unrated';

    if (!accountsByIndustryAndRating.containsKey(industry)) {
        accountsByIndustryAndRating.put(industry, new Map<String, List<Account>>());
    }

    Map<String, List<Account>> byRating = accountsByIndustryAndRating.get(industry);
    if (!byRating.containsKey(rating)) {
        byRating.put(rating, new List<Account>());
    }

    byRating.get(rating).add(acc);
}

// Accès
List<Account> techHotAccounts =
    accountsByIndustryAndRating.get('Technology')?.get('Hot') // ??? Apex n'a pas ?. !
    // Vrai code :
    accountsByIndustryAndRating.containsKey('Technology') &&
    accountsByIndustryAndRating.get('Technology').containsKey('Hot')
        ? accountsByIndustryAndRating.get('Technology').get('Hot')
        : new List<Account>();
\`\`\`
`,
    tsAnalogy: `
\`\`\`typescript
// TypeScript — tri avec comparateur
const wrappers = accounts.map((acc, i) => ({ record: acc, priority: i }));
wrappers.sort((a, b) => {
  if (a.priority !== b.priority) return b.priority - a.priority;
  return a.record.name.localeCompare(b.record.name);
});

// Map imbriquée
const grouped = new Map<string, Map<string, Account[]>>();
\`\`\`

En Apex il n'y a pas de méthodes fonctionnelles (map/filter/reduce/sort avec lambda) — tout doit être implémenté avec des classes Comparable ou des boucles explicites.
`,
    gotchas: [
      "compareTo() doit retourner un négatif, 0, ou positif — retourner -1/0/1 est plus lisible que des soustraction",
      "Les nested Maps sont lisibles mais difficiles à maintenir — envisager des classes wrapper après 2 niveaux",
      "Appeler sort() sur une List<SObject> sans Comparable lève une exception — les SObjects ne sont pas Comparable par défaut",
    ],
  },

  {
    id: "apex-certification-recap",
    title: "Recap PD1/PD2 — Ce qui est évalué",
    category: "Certification",
    tags: ["PD1", "PD2", "examen", "recap"],
    difficulty: "intermediate",
    certRelevance: ["PD1", "PD2"],
    content: `
## Ce que l'examen PD1 évalue principalement

### Domaines PD1 (Platform Developer I)

| Domaine | % de l'examen |
|---|---|
| Apex Fundamentals (types, classes, flows) | ~20% |
| Data Modeling & Management (DML, SOQL, SObjects) | ~20% |
| Logic & Process Automation (triggers, flows) | ~20% |
| Testing Apex | ~15% |
| Visualforce Basics | ~10% |
| Governor Limits | ~10% |
| Debug & Deployment | ~5% |

### Questions types PD1

\`\`\`apex
// 1. Quel est le résultat de ce code ?
Integer x = 5;
Integer y = 2;
Decimal result = x / y;
System.debug(result);
// RÉPONSE : 2 (pas 2.5 ! La division entière en Apex = entier)
// Pour avoir 2.5 : (Decimal)x / y

// 2. Quelles variables Trigger sont disponibles en after delete ?
// RÉPONSE : Trigger.old et Trigger.oldMap (Trigger.new et Trigger.newMap ne sont PAS disponibles)

// 3. Quel est le max de SOQL queries par transaction ?
// RÉPONSE : 100

// 4. La différence entre insert et Database.insert() ?
// RÉPONSE : insert = all-or-none, Database.insert(list, false) = partial success

// 5. Quand Test.stopTest() est-il obligatoire ?
// RÉPONSE : Pour tester @future, Queueable, et Batch — pour forcer leur exécution synchrone
\`\`\`

## Ce que l'examen PD2 évalue principalement

### Domaines PD2 (Platform Developer II)

| Domaine | % de l'examen |
|---|---|
| Apex Design Patterns | ~20% |
| Integration Patterns | ~20% |
| Performance & Governor Limits avancés | ~15% |
| Security (with/without sharing, FLS) | ~15% |
| Async Apex avancé | ~15% |
| Testing avancé | ~15% |

### Questions types PD2

\`\`\`apex
// 1. Quel pattern garantit une seule SOQL même si le service est appelé depuis
//    plusieurs endroits dans la même transaction ?
// RÉPONSE : Selector Pattern avec des variables statiques comme cache

// 2. Quand utiliser Queueable vs @future ?
// RÉPONSE : Queueable quand on a besoin de : passer des SObjects, chaîner des jobs,
//           ou suivre le statut du job

// 3. Comment partager des records par code avec des utilisateurs spécifiques ?
// RÉPONSE : Apex Managed Sharing (AccountShare, ContactShare, etc.)

// 4. Quelle interface implémenter pour un batch qui maintient l'état entre execute() ?
// RÉPONSE : Database.Stateful

// 5. Quelle est la différence entre with sharing et without sharing pour la sécurité ?
// RÉPONSE : with sharing = respecte les règles de partage, without sharing = bypass total
//           (mais aucun des deux ne bypass le FLS ou le CRUD)
\`\`\`

## Checklist avant l'examen

### PD1
- [ ] Types primitifs, leurs valeurs par défaut et différences
- [ ] Collections (List, Set, Map) et leurs méthodes
- [ ] Trigger context variables disponibilité
- [ ] Bulkification pattern (pas de SOQL/DML dans les boucles)
- [ ] Governor Limits (100 SOQL, 150 DML, 10 000 DML rows)
- [ ] @isTest, @testSetup, Test.startTest/stopTest
- [ ] Database.insert() vs insert (allOrNone)
- [ ] Async : @future restrictions (pas de SObjects, pas de callout sans annotation)

### PD2
- [ ] Design patterns : Trigger Handler, Selector, Service, Domain, UoW
- [ ] with/without sharing + FLS + Security.stripInaccessible()
- [ ] Batch Apex : start/execute/finish, Database.Stateful, QueryLocator
- [ ] Queueable : chaînage, AllowsCallouts
- [ ] REST APIs avec @RestResource
- [ ] Platform Events
- [ ] SOSL vs SOQL
- [ ] Exception handling avancé (DmlException methods)
`,
    tsAnalogy: `
Pour un développeur TypeScript NestJS, les analogies clés à retenir :
- Trigger = Event Listener sur les opérations DB
- Selector = Repository Pattern
- Service = Service NestJS
- Governor Limits = Budget strict par requête HTTP
- @future = setImmediate / fire-and-forget
- Batch = Worker avec chunks + retry
- with sharing = Guard middleware
`,
    gotchas: [
      "L'examen est en ANGLAIS — apprendre les termes techniques en anglais",
      "Les questions piège portent souvent sur les Governor Limits exactes et les variables Trigger disponibles",
      "La distinction Database.insert(allOrNone=false) vs insert simple est un favori de l'examen",
      "Les questions sur le Trigger Handler Pattern sont fréquentes au PD2",
    ],
  },
];
