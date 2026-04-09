export interface CheatsheetEntry {
  id: string;
  category: string;
  title: string;
  tsCode: string;
  apexCode: string;
  notes: string;
  gotcha?: string;
}

export const CATEGORIES = [
  "Types & Variables",
  "Collections",
  "Functions & Classes",
  "Async",
  "Error Handling",
  "Testing",
  "Data Access",
  "Apex Specifics",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const cheatsheetData: CheatsheetEntry[] = [
  // ─── Types & Variables ───────────────────────────────────────────────────
  {
    id: "var-declaration",
    category: "Types & Variables",
    title: "Déclaration de variables",
    tsCode: `let count: number = 0;
const name: string = 'Alice';
let active: boolean = true;`,
    apexCode: `Integer count = 0;
String name = 'Alice';
Boolean active = true;`,
    notes:
      "Apex n'a pas de `let`/`const`. Toutes les variables sont mutables par défaut. La convention est de déclarer le type explicitement.",
    gotcha:
      "`const` n'existe pas en Apex — rien n'est techniquement immuable au niveau variable.",
  },
  {
    id: "primitives-number",
    category: "Types & Variables",
    title: "Types numériques",
    tsCode: `const i: number = 42;
const pi: number = 3.14;
const price: number = 19.99; // précision flottante`,
    apexCode: `Integer i = 42;
Double pi = 3.14;
Decimal price = 19.99; // précision exacte`,
    notes:
      "`Integer` = entier 32 bits. `Long` = entier 64 bits. `Double` = flottant 64 bits. `Decimal` = précision arbitraire (obligatoire pour les montants financiers).",
    gotcha:
      "En TS, `number` couvre tout. En Apex, utiliser `Decimal` (pas `Double`) pour les calculs financiers — `Double` perd de la précision.",
  },
  {
    id: "primitives-string",
    category: "Types & Variables",
    title: "Type String",
    tsCode: `const s: string = 'hello';
const multi = \`line1
line2\`;`,
    apexCode: `String s = 'hello';
String multi = 'line1\\nline2';`,
    notes:
      "Apex utilise uniquement les guillemets simples `'`. Les strings multilignes n'existent pas nativement — utiliser `\\n` ou concaténation.",
    gotcha:
      "Les backticks `` ` `` n'existent pas en Apex. Tout template literal doit être converti.",
  },
  {
    id: "null-undefined",
    category: "Types & Variables",
    title: "null / undefined",
    tsCode: `let x: string | null = null;
let y: string | undefined = undefined;
const val = x ?? 'default';`,
    apexCode: `String x = null;
// pas d'undefined
String val = x != null ? x : 'default';`,
    notes:
      "Apex ne connaît que `null`. Il n'y a pas d'`undefined`. L'opérateur `??` (nullish coalescing) n'existe pas — utiliser l'opérateur ternaire.",
    gotcha:
      "En Apex, tout objet non initialisé vaut `null` (pas `undefined`). Les NPE (NullPointerException) sont très courantes.",
  },
  {
    id: "type-casting",
    category: "Types & Variables",
    title: "Type casting",
    tsCode: `const val = someVar as string;
const num = Number('42');
const str = String(42);`,
    apexCode: `String val = (String) someVar;
Integer num = Integer.valueOf('42');
String str = String.valueOf(42);`,
    notes:
      "Le cast Apex utilise la syntaxe C-style `(Type)`. Les conversions de primitives utilisent les méthodes statiques `Type.valueOf()`.",
    gotcha:
      "Un cast invalide en Apex lève une `TypeException` à l'exécution — pas de type guard automatique.",
  },
  {
    id: "string-interpolation",
    category: "Types & Variables",
    title: "Interpolation de strings",
    tsCode: `const name = 'Alice';
const age = 30;
const msg = \`Bonjour \${name}, tu as \${age} ans\`;`,
    apexCode: `String name = 'Alice';
Integer age = 30;
String msg = String.format('Bonjour {0}, tu as {1} ans',
  new List<Object>{ name, age });
// OU concaténation simple :
String msg2 = 'Bonjour ' + name + ', tu as ' + age + ' ans';`,
    notes:
      "`String.format()` utilise des placeholders `{0}`, `{1}`, etc. La concaténation avec `+` est aussi valide mais moins lisible.",
    gotcha:
      "Les template literals `` `${expr}` `` n'existent pas. Penser à `String.format()` ou concaténation.",
  },
  {
    id: "date-handling",
    category: "Types & Variables",
    title: "Dates et heures",
    tsCode: `const now = new Date();
const d = new Date('2024-01-15');
const ts = Date.now(); // timestamp ms`,
    apexCode: `Date today = Date.today();
Date d = Date.newInstance(2024, 1, 15);
DateTime now = DateTime.now();
Time t = Time.newInstance(10, 30, 0, 0);`,
    notes:
      "Apex sépare `Date` (jour uniquement), `DateTime` (date + heure), et `Time` (heure uniquement). Chaque type a son API propre.",
    gotcha:
      "Il n'y a pas d'équivalent à `Date.now()` retournant un timestamp. Utiliser `DateTime.now().getTime()` pour les millisecondes depuis epoch.",
  },

  // ─── Collections ─────────────────────────────────────────────────────────
  {
    id: "array-list",
    category: "Collections",
    title: "Array → List<T>",
    tsCode: `const arr: string[] = ['a', 'b', 'c'];
arr.push('d');
const len = arr.length;
arr[0] = 'z';`,
    apexCode: `List<String> arr = new List<String>{ 'a', 'b', 'c' };
arr.add('d');
Integer len = arr.size();
arr[0] = 'z'; // accès par index OK`,
    notes:
      "`List<T>` est le type collection principal. `.add()` remplace `.push()`. `.size()` remplace `.length`. L'accès par index `[i]` fonctionne.",
    gotcha:
      "`.length` n'existe pas — utiliser `.size()` (sinon erreur de compilation).",
  },
  {
    id: "array-filter-map",
    category: "Collections",
    title: "filter / map (pas natifs)",
    tsCode: `const nums = [1, 2, 3, 4, 5];
const evens = nums.filter(n => n % 2 === 0);
const doubled = nums.map(n => n * 2);`,
    apexCode: `List<Integer> nums = new List<Integer>{ 1, 2, 3, 4, 5 };

// filter — boucle manuelle
List<Integer> evens = new List<Integer>();
for (Integer n : nums) {
  if (Math.mod(n, 2) == 0) evens.add(n);
}

// map — boucle manuelle
List<Integer> doubled = new List<Integer>();
for (Integer n : nums) {
  doubled.add(n * 2);
}`,
    notes:
      "Apex n'a pas de méthodes fonctionnelles `.filter()` / `.map()` / `.reduce()` sur les collections. Tout passe par des boucles `for-each`.",
    gotcha:
      "Réflexe TS : chaîner `.filter().map().reduce()`. En Apex, tout est impératif — prévoir des variables intermédiaires.",
  },
  {
    id: "set",
    category: "Collections",
    title: "Set → Set<T>",
    tsCode: `const s = new Set<string>(['a', 'b', 'a']);
s.add('c');
s.has('a'); // true
s.delete('b');
s.size; // 2`,
    apexCode: `Set<String> s = new Set<String>{ 'a', 'b', 'a' };
s.add('c');
s.contains('a'); // true
s.remove('b');
s.size(); // 2`,
    notes:
      "La sémantique est la même (valeurs uniques). `.has()` → `.contains()`, `.delete()` → `.remove()`, `.size` → `.size()`.",
    gotcha:
      "`.has()` n'existe pas en Apex — utiliser `.contains()`. `.size` (propriété) → `.size()` (méthode).",
  },
  {
    id: "map",
    category: "Collections",
    title: "Map → Map<K,V>",
    tsCode: `const m = new Map<string, number>();
m.set('a', 1);
m.get('a'); // 1
m.has('a'); // true
m.delete('a');
[...m.keys()]; // ['a']
[...m.values()]; // [1]`,
    apexCode: `Map<String, Integer> m = new Map<String, Integer>();
m.put('a', 1);
m.get('a'); // 1
m.containsKey('a'); // true
m.remove('a');
m.keySet(); // Set<String>
m.values(); // List<Integer>`,
    notes:
      "`.set()` → `.put()`. `.has()` → `.containsKey()`. `.delete()` → `.remove()`. `.keys()` → `.keySet()` (retourne un `Set`, pas un itérateur).",
    gotcha:
      "`.get()` sur une clé absente retourne `null` en Apex (pas d'erreur). Toujours vérifier `.containsKey()` avant d'utiliser la valeur.",
  },
  {
    id: "spread-addAll",
    category: "Collections",
    title: "Spread operator → addAll",
    tsCode: `const a = [1, 2, 3];
const b = [4, 5, 6];
const merged = [...a, ...b];

const setA = new Set([1, 2]);
const setB = new Set([2, 3]);
const union = new Set([...setA, ...setB]);`,
    apexCode: `List<Integer> a = new List<Integer>{ 1, 2, 3 };
List<Integer> b = new List<Integer>{ 4, 5, 6 };
List<Integer> merged = new List<Integer>(a);
merged.addAll(b);

Set<Integer> setA = new Set<Integer>{ 1, 2 };
Set<Integer> setB = new Set<Integer>{ 2, 3 };
Set<Integer> union = new Set<Integer>(setA);
union.addAll(setB);`,
    notes: "`.addAll()` est l'équivalent du spread pour les collections Apex.",
    gotcha:
      "Le spread `[...a, ...b]` crée un nouveau tableau. En Apex, créer une copie via `new List<T>(existingList)` puis `.addAll()`.",
  },
  {
    id: "destructuring",
    category: "Collections",
    title: "Destructuring → pas d'équivalent",
    tsCode: `const [first, second, ...rest] = [1, 2, 3, 4, 5];
const { name, age } = person;`,
    apexCode: `// Pas de destructuring en Apex
Integer first = myList[0];
Integer second = myList[1];
// Pour les objets : accès par propriété
String name = person.Name;
Integer age = person.Age__c;`,
    notes:
      "Le destructuring n'existe pas en Apex. Accès explicite par index pour les listes, par propriété pour les objets.",
    gotcha:
      "Réflexe : `const { id, name } = record`. En Apex, chaque champ doit être extrait individuellement.",
  },
  {
    id: "for-of",
    category: "Collections",
    title: "for...of / forEach → for-each",
    tsCode: `const items = ['a', 'b', 'c'];

// for...of
for (const item of items) {
  console.log(item);
}

// forEach
items.forEach(item => console.log(item));`,
    apexCode: `List<String> items = new List<String>{ 'a', 'b', 'c' };

// for-each (seul équivalent)
for (String item : items) {
  System.debug(item);
}`,
    notes:
      "La boucle `for (Type item : collection)` est l'équivalent d'un `for...of`. `.forEach()` avec callback n'existe pas.",
    gotcha:
      "`.forEach()` avec arrow function n'existe pas. Toujours utiliser la boucle `for-each` Apex.",
  },
  {
    id: "array-index-loop",
    category: "Collections",
    title: "Itération avec index",
    tsCode: `const items = ['a', 'b', 'c'];
items.forEach((item, i) => console.log(i, item));
// ou
for (let i = 0; i < items.length; i++) {
  console.log(i, items[i]);
}`,
    apexCode: `List<String> items = new List<String>{ 'a', 'b', 'c' };
for (Integer i = 0; i < items.size(); i++) {
  System.debug(i + ' ' + items[i]);
}`,
    notes:
      "Pour itérer avec l'index, utiliser la boucle `for` classique avec compteur.",
  },

  // ─── Functions & Classes ─────────────────────────────────────────────────
  {
    id: "arrow-functions",
    category: "Functions & Classes",
    title: "Arrow functions → méthodes normales",
    tsCode: `const add = (a: number, b: number): number => a + b;
const greet = (name: string) => \`Hello \${name}\`;
const double = (x: number) => x * 2;`,
    apexCode: `// Pas d'arrow functions — méthodes de classe
public static Integer add(Integer a, Integer b) {
  return a + b;
}
public static String greet(String name) {
  return 'Hello ' + name;
}
public static Integer double(Integer x) {
  return x * 2;
}`,
    notes:
      "Apex n'a pas de fonctions de première classe ni d'arrow functions. Tout le code réutilisable doit être dans des méthodes de classe.",
    gotcha:
      "Les callbacks et fonctions passées en paramètre n'existent pas. Utiliser des interfaces ou des patterns Strategy.",
  },
  {
    id: "default-params",
    category: "Functions & Classes",
    title: "Paramètres par défaut → surcharge",
    tsCode: `function greet(name: string, greeting: string = 'Hello'): string {
  return \`\${greeting}, \${name}!\`;
}`,
    apexCode: `// Surcharge de méthode
public static String greet(String name) {
  return greet(name, 'Hello');
}
public static String greet(String name, String greeting) {
  return greeting + ', ' + name + '!';
}`,
    notes:
      "Apex ne supporte pas les paramètres par défaut. Pattern standard : surcharger la méthode avec moins de paramètres.",
    gotcha:
      "Impossible d'écrire `myMethod(param = 'default')`. Toujours créer une surcharge.",
  },
  {
    id: "rest-params",
    category: "Functions & Classes",
    title: "Rest parameters → pas d'équivalent",
    tsCode: `function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}`,
    apexCode: `// Pas de rest params — passer une List<T>
public static Integer sum(List<Integer> nums) {
  Integer total = 0;
  for (Integer n : nums) {
    total += n;
  }
  return total;
}
// Appel : sum(new List<Integer>{ 1, 2, 3 })`,
    notes:
      "Les rest parameters `...args` n'existent pas. Convention : passer une `List<T>` en argument.",
    gotcha:
      "En TS : `fn(1, 2, 3)`. En Apex : `fn(new List<Integer>{ 1, 2, 3 })`. L'appel est plus verbeux.",
  },
  {
    id: "class-syntax",
    category: "Functions & Classes",
    title: "Syntaxe de classe",
    tsCode: `class Animal {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): string {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {
  speak(): string {
    return \`\${this.name} barks.\`;
  }
}`,
    apexCode: `public class Animal {
  private String name;

  public Animal(String name) {
    this.name = name;
  }

  public virtual String speak() {
    return this.name + ' makes a sound.';
  }
}

public class Dog extends Animal {
  public Dog(String name) {
    super(name);
  }

  public override String speak() {
    return 'barks!';
  }
}`,
    notes:
      "La syntaxe est proche, mais en Apex les méthodes surchargables doivent être `virtual`. Le mot-clé `override` est obligatoire.",
    gotcha:
      "Oublier `virtual` sur la méthode parent provoque une erreur à la compilation si une sous-classe tente de l'overrider.",
  },
  {
    id: "interface",
    category: "Functions & Classes",
    title: "Interface",
    tsCode: `interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

// Type alias (pas d'équivalent Apex)
type ID = string | number;`,
    apexCode: `public interface Serializable {
  String serialize();
  void deserialize(String data);
}

// Pas de type aliases en Apex
// Il faut définir une vraie classe/interface`,
    notes:
      "Les interfaces Apex fonctionnent comme en TS. En revanche, les **type aliases** (`type X = Y`) n'existent pas.",
    gotcha:
      "`type ID = string | number` (union type) n'existe pas en Apex. Les unions doivent être gérées via l'héritage ou des classes wrapper.",
  },
  {
    id: "enum",
    category: "Functions & Classes",
    title: "Enum",
    tsCode: `enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

const s: Status = Status.Active;`,
    apexCode: `public enum Status {
  Active,
  Inactive,
  Pending
}

Status s = Status.Active;`,
    notes:
      "Les enums Apex n'ont pas de valeur associée (pas de `= 'ACTIVE'`). Ils sont des types simples avec des valeurs nommées.",
    gotcha:
      "Impossible d'associer une valeur string/int à un enum Apex. Pour mapper enum → string, utiliser une `Map<Status, String>`.",
  },
  {
    id: "generics",
    category: "Functions & Classes",
    title: "Generics",
    tsCode: `function identity<T>(value: T): T {
  return value;
}

class Box<T> {
  private value: T;
  constructor(value: T) { this.value = value; }
  get(): T { return this.value; }
}`,
    apexCode: `// Les generics en Apex sont limités aux collections
// Pas de méthodes génériques arbitraires

// Seules les collections standard sont génériques :
List<String> strings = new List<String>();
Map<String, Integer> map = new Map<String, Integer>();

// Pour des classes génériques custom → utiliser Object
public class Box {
  private Object value;
  public Box(Object value) { this.value = value; }
  public Object getValue() { return this.value; }
}`,
    notes:
      "Apex supporte les generics uniquement pour les types collection built-in. Impossible de créer ses propres classes/méthodes génériques.",
    gotcha:
      "Les generics custom `class MyClass<T>` ne compilent pas. Utiliser `Object` et caster à l'usage.",
  },
  {
    id: "access-modifiers",
    category: "Functions & Classes",
    title: "Modificateurs d'accès",
    tsCode: `class MyClass {
  private x: number;
  protected y: number;
  public z: number;
  // pas d'équivalent 'global'
}`,
    apexCode: `public class MyClass {
  private Integer x;
  protected Integer y;
  public Integer z;
  global Integer w; // accessible depuis packages externes
}`,
    notes:
      "Apex ajoute `global` (visible depuis les packages managed / AppExchange). Les classes elles-mêmes doivent aussi déclarer leur visibilité (`public`, `global`).",
    gotcha:
      "`global` est plus permissif que `public`. Ne jamais exposer `global` sans raison — un changement de signature `global` est impossible dans un managed package.",
  },

  // ─── Async ───────────────────────────────────────────────────────────────
  {
    id: "async-await",
    category: "Async",
    title: "async/await → @future / Queueable",
    tsCode: `async function fetchUser(id: string) {
  const user = await getUser(id);
  await sendEmail(user.email);
  return user;
}`,
    apexCode: `// @future pour les appels asynchrones simples
@future(callout=true)
public static void fetchUser(String userId) {
  // Exécuté dans un contexte séparé
  // Pas de valeur de retour possible !
}

// Queueable pour le chaînage
public class FetchUserJob implements Queueable, Database.AllowsCallouts {
  public void execute(QueueableContext ctx) {
    // Logique ici
    // System.enqueueJob(new NextJob()); // chaînage
  }
}
// Lancement : System.enqueueJob(new FetchUserJob());`,
    notes:
      "Il n'y a pas d'`async/await` en Apex. Les opérations asynchrones utilisent `@future` (simple) ou `Queueable` (chaînable). Les `@future` ne peuvent pas retourner de valeur.",
    gotcha:
      "Une méthode `@future` ne peut pas appeler une autre méthode `@future`. Pour chaîner, utiliser `Queueable`.",
  },
  {
    id: "promise",
    category: "Async",
    title: "Promise → pas d'équivalent",
    tsCode: `const p = new Promise<string>((resolve, reject) => {
  setTimeout(() => resolve('done'), 1000);
});

Promise.all([fetch('/a'), fetch('/b')])
  .then(([a, b]) => { /* ... */ });`,
    apexCode: `// Pas de Promise en Apex
// Les Queueable peuvent être chaînés mais pas combinés comme Promise.all

// Batch Apex pour traitement parallèle :
Database.executeBatch(new MyBatchClass(), 200);

// Platform Events pour signaler une completion :
MyEvent__e evt = new MyEvent__e(Status__c = 'done');
EventBus.publish(evt);`,
    notes:
      "Apex n'a pas de système de Promises. La parallélisation passe par Batch Apex. La communication asynchrone passe par Platform Events.",
  },
  {
    id: "settimeout",
    category: "Async",
    title: "setTimeout → Scheduled Apex",
    tsCode: `// Exécuter après 5 secondes
setTimeout(() => doSomething(), 5000);

// Exécuter à une heure précise
const job = new CronJob('0 30 * * * *', () => doSomething());`,
    apexCode: `// Scheduled Apex (cron expression)
public class MyScheduledJob implements Schedulable {
  public void execute(SchedulableContext ctx) {
    // Logique ici
  }
}

// Planifier : toutes les heures à H:30
String cron = '0 30 * * * ?';
System.schedule('My Job', cron, new MyScheduledJob());`,
    notes:
      "Salesforce utilise des expressions cron pour planifier des jobs. Le délai minimum est d'1 minute (pas de secondes).",
    gotcha:
      "Impossible d'avoir un délai inférieur à 1 minute. Pour des délais très courts, utiliser `Queueable` (exécution quasi-immédiate).",
  },
  {
    id: "event-emitter",
    category: "Async",
    title: "Event Emitter → Platform Events",
    tsCode: `const emitter = new EventEmitter();
emitter.on('orderCreated', (order) => sendConfirmation(order));
emitter.emit('orderCreated', { id: '123' });`,
    apexCode: `// Définir un Platform Event (objet Salesforce custom)
// OrderCreated__e avec champ OrderId__c

// Publier
OrderCreated__e evt = new OrderCreated__e(OrderId__c = '123');
EventBus.publish(evt);

// S'abonner (Trigger sur l'event)
trigger OrderCreatedTrigger on OrderCreated__e (after insert) {
  for (OrderCreated__e e : Trigger.new) {
    // Logique de traitement
  }
}`,
    notes:
      "Les Platform Events sont des objets Salesforce réels (définis dans le setup). Ils permettent la communication décuplée entre composants.",
  },

  // ─── Error Handling ──────────────────────────────────────────────────────
  {
    id: "try-catch",
    category: "Error Handling",
    title: "try/catch/finally",
    tsCode: `try {
  const result = JSON.parse(badInput);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('JSON invalide', error.message);
  }
} finally {
  cleanup();
}`,
    apexCode: `try {
  Object result = JSON.deserializeUntyped(badInput);
} catch (JSONException e) {
  System.debug('JSON invalide : ' + e.getMessage());
} catch (Exception e) {
  System.debug('Erreur : ' + e.getMessage());
} finally {
  cleanup();
}`,
    notes:
      "La structure `try/catch/finally` est quasi-identique. Apex supporte les multi-catch (types différents). `e.getMessage()` remplace `error.message`.",
    gotcha:
      "Apex a des types d'exceptions spécifiques : `DmlException`, `QueryException`, `CalloutException`, `LimitException`. Toujours catcher le type précis avant `Exception`.",
  },
  {
    id: "custom-errors",
    category: "Error Handling",
    title: "Erreurs custom → Custom Exceptions",
    tsCode: `class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Requis', 'email');`,
    apexCode: `public class ValidationException extends Exception {
  private String field;

  public ValidationException(String message, String field) {
    this(message);
    this.field = field;
  }

  public String getField() {
    return this.field;
  }
}

throw new ValidationException('Requis', 'email');`,
    notes:
      "Les custom exceptions héritent de `Exception`. Le constructeur d'`Exception` accepte un message string. Ajouter des propriétés via le constructeur.",
    gotcha:
      "Appeler `this(message)` dans le constructeur pour setter le message via le constructeur parent.",
  },
  {
    id: "throw",
    category: "Error Handling",
    title: "throw",
    tsCode: `if (!id) throw new Error('ID requis');
throw new ValidationError('Invalide');`,
    apexCode: `if (id == null) throw new IllegalArgumentException('ID requis');
throw new ValidationException('Invalide');`,
    notes:
      "Le `throw` est identique. `Error` générique → `Exception` ou sous-classes built-in comme `IllegalArgumentException`.",
  },

  // ─── Testing ─────────────────────────────────────────────────────────────
  {
    id: "test-describe-it",
    category: "Testing",
    title: "describe/it/expect → @isTest / System.assert",
    tsCode: `describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });
});`,
    apexCode: `@isTest
private class CalculatorTest {
  @isTest
  static void testAdd() {
    System.assertEquals(5, Calculator.add(2, 3));
    System.assertEquals(0, Calculator.add(-1, 1));
  }
}`,
    notes:
      "Pas de describe/it/expect. Chaque test est une méthode `static` annotée `@isTest` dans une classe de test `@isTest`. `expect().toBe()` → `System.assertEquals(expected, actual)`.",
    gotcha:
      "L'ordre des arguments de `System.assertEquals` est `(expected, actual)` — c'est l'inverse de Jest `expect(actual).toBe(expected)`. Erreur très courante !",
  },
  {
    id: "test-before-each",
    category: "Testing",
    title: "beforeEach → @testSetup",
    tsCode: `let db: Database;
beforeEach(() => {
  db = createTestDatabase();
  db.seed([{ id: 1, name: 'Alice' }]);
});

afterEach(() => {
  db.cleanup();
});`,
    apexCode: `@isTest
private class MyTest {
  @testSetup
  static void setupData() {
    // Données créées UNE SEULE FOIS pour toute la classe
    // (pas besoin de cleanup — rollback automatique)
    Account acc = new Account(Name = 'Alice');
    insert acc;
  }

  @isTest
  static void testSomething() {
    Account acc = [SELECT Id, Name FROM Account LIMIT 1];
    // ...
  }
}`,
    notes:
      "`@testSetup` s'exécute une seule fois pour la classe entière (pas avant chaque test). Chaque méthode de test travaille dans une transaction isolée avec rollback automatique.",
    gotcha:
      "`@testSetup` n'est pas un `beforeEach` — les données sont partagées entre tous les tests de la classe. Les modifications dans un test ne persistent pas pour les autres.",
  },
  {
    id: "test-mock",
    category: "Testing",
    title: "Mock → HttpCalloutMock / Test.setMock",
    tsCode: `jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
}));`,
    apexCode: `// Définir le mock
@isTest
global class MockHttpCallout implements HttpCalloutMock {
  global HTTPResponse respond(HTTPRequest req) {
    HTTPResponse res = new HTTPResponse();
    res.setStatusCode(200);
    res.setBody('{"id":"1","name":"Alice"}');
    return res;
  }
}

// Utiliser dans le test
@isTest
static void testFetch() {
  Test.setMock(HttpCalloutMock.class, new MockHttpCallout());
  // ... appeler le code qui fait le callout
}`,
    notes:
      "Les callouts HTTP en Apex doivent être mockés via l'interface `HttpCalloutMock`. `Test.setMock()` enregistre l'implémentation pour le test.",
    gotcha:
      "Sans `Test.setMock()`, tout callout HTTP dans un test lève une exception. Les callouts réels sont interdits dans les tests.",
  },
  {
    id: "test-isolation",
    category: "Testing",
    title: "Isolation des tests",
    tsCode: `// Jest — chaque test dans son propre module
beforeEach(() => jest.clearAllMocks());`,
    apexCode: `// Chaque méthode @isTest est dans sa propre transaction
// Rollback automatique à la fin de chaque test
// Pas besoin de cleanup manuel

@isTest
static void test1() {
  insert new Account(Name = 'Test');
  // rollback après ce test
}

@isTest
static void test2() {
  // aucun résidu de test1
  List<Account> accs = [SELECT Id FROM Account];
  System.assertEquals(0, accs.size()); // true
}`,
    notes:
      "Chaque méthode `@isTest` s'exécute dans sa propre transaction DML avec rollback automatique. Les données d'un test n'affectent pas les autres.",
  },

  // ─── Data Access ─────────────────────────────────────────────────────────
  {
    id: "soql",
    category: "Data Access",
    title: "SQL/ORM → SOQL inline",
    tsCode: `// Prisma / TypeORM
const users = await db.user.findMany({
  where: { isActive: true },
  select: { id: true, name: true, email: true },
  orderBy: { name: 'asc' },
  take: 10,
});`,
    apexCode: `// SOQL écrit directement dans le code Apex
List<Contact> contacts = [
  SELECT Id, Name, Email
  FROM Contact
  WHERE IsActive__c = true
  ORDER BY Name ASC
  LIMIT 10
];`,
    notes:
      "Le SOQL est du SQL inline directement dans le code Apex — pas d'ORM séparé. La syntaxe est proche de SQL mais avec des différences (`LIMIT` à la fin, pas de `*`).",
    gotcha:
      "Le SOQL ne supporte pas `SELECT *`. Toujours lister les champs explicitement. Les champs non sélectionnés valent `null` si on y accède.",
  },
  {
    id: "http-request",
    category: "Data Access",
    title: "fetch → HttpRequest/HttpResponse",
    tsCode: `const res = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
  body: JSON.stringify({ name: 'Alice' }),
});
const data = await res.json();`,
    apexCode: `HttpRequest req = new HttpRequest();
req.setEndpoint('https://api.example.com/users');
req.setMethod('POST');
req.setHeader('Content-Type', 'application/json');
req.setHeader('Authorization', 'Bearer token');
req.setBody(JSON.serialize(new Map<String, String>{ 'name' => 'Alice' }));

Http http = new Http();
HttpResponse res = http.send(req);

if (res.getStatusCode() == 200) {
  Map<String, Object> data =
    (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
}`,
    notes:
      "Apex utilise les classes `HttpRequest`, `Http`, `HttpResponse`. L'endpoint doit être dans la liste des Remote Sites Settings (ou Named Credentials).",
    gotcha:
      "L'URL doit être whitelistée dans Setup > Remote Site Settings sinon erreur `Unauthorized endpoint`. Préférer les Named Credentials en prod.",
  },
  {
    id: "json-parse",
    category: "Data Access",
    title: "JSON.parse → JSON.deserialize",
    tsCode: `const json = '{"name":"Alice","age":30}';
const obj = JSON.parse(json) as { name: string; age: number };
console.log(obj.name); // 'Alice'`,
    apexCode: `String json = '{"name":"Alice","age":30}';

// Option 1 : typage fort (classe Apex)
MyClass obj = (MyClass) JSON.deserialize(json, MyClass.class);
System.debug(obj.name);

// Option 2 : non typé (Map)
Map<String, Object> data =
  (Map<String, Object>) JSON.deserializeUntyped(json);
System.debug((String) data.get('name'));`,
    notes:
      "`JSON.deserialize(json, Type.class)` : désérialise vers une classe Apex. `JSON.deserializeUntyped(json)` : retourne `Object` (Map, List, String, etc.).",
    gotcha:
      "Les noms de champs JSON doivent correspondre exactement aux propriétés de la classe Apex (case-sensitive). Un champ manquant = null, un champ inconnu = ignoré.",
  },
  {
    id: "json-stringify",
    category: "Data Access",
    title: "JSON.stringify → JSON.serialize",
    tsCode: `const obj = { name: 'Alice', age: 30 };
const json = JSON.stringify(obj);
// '{"name":"Alice","age":30}'`,
    apexCode: `// Objet Apex custom
MyClass obj = new MyClass();
obj.name = 'Alice';
obj.age = 30;
String json = JSON.serialize(obj);
// '{"name":"Alice","age":30}'

// Avec une Map
Map<String, Object> data = new Map<String, Object>{
  'name' => 'Alice',
  'age' => 30
};
String json2 = JSON.serialize(data);`,
    notes:
      "`JSON.serialize()` fonctionne sur n'importe quel objet Apex (classes custom, SObjects, Maps, Lists).",
    gotcha:
      "Les champs `null` sont inclus par défaut dans la sérialisation. Utiliser `JSON.serialize(obj, true)` pour les exclure (`suppressApexObjectNulls`).",
  },

  // ─── Apex Specifics ──────────────────────────────────────────────────────
  {
    id: "governor-limits",
    category: "Apex Specifics",
    title: "Governor Limits (pas d'équivalent TS)",
    tsCode: `// En TS/Node.js : aucune limite artificielle
// (limites OS/hardware seulement)
const results = await db.query('SELECT ...');
for (const r of results) {
  await sendEmail(r.email); // 10000 emails ? OK
}`,
    apexCode: `// Apex impose des limites strictes par transaction :
// - 100 requêtes SOQL max
// - 50 000 enregistrements SOQL max
// - 150 instructions DML max
// - 10 callouts HTTP max
// - 10 MB heap max

// Vérifier les limites disponibles :
System.debug(Limits.getQueries()); // SOQL utilisés
System.debug(Limits.getLimitQueries()); // max SOQL

// Pattern correct : bulk (jamais de SOQL/DML en boucle !)
List<String> emails = new List<String>();
for (Contact c : contacts) {
  emails.add(c.Email); // OK — pas de SOQL ici
}
// Traitement externe aux contacts`,
    notes:
      "Les Governor Limits sont la contrainte architecturale N°1 d'Apex. Chaque transaction (déclencheur, batch, etc.) a des quotas stricts.",
    gotcha:
      "SOQL ou DML à l'intérieur d'une boucle = `LimitException` en production avec des volumes réels. Le pattern Bulk est **obligatoire**.",
  },
  {
    id: "trigger-context",
    category: "Apex Specifics",
    title: "Trigger context variables",
    tsCode: `// Pas d'équivalent — les event handlers JS reçoivent
// un objet Event, pas un contexte de transaction
element.addEventListener('click', (event) => {
  const target = event.target;
});`,
    apexCode: `trigger AccountTrigger on Account (before insert, after update) {
  // Variables de contexte automatiques :
  Trigger.new       // nouveaux enregistrements (insert/update)
  Trigger.old       // anciens enregistrements (update/delete)
  Trigger.newMap    // Map<Id, SObject> des nouveaux
  Trigger.oldMap    // Map<Id, SObject> des anciens

  Trigger.isInsert  // true si insert
  Trigger.isUpdate  // true si update
  Trigger.isBefore  // true si before
  Trigger.isAfter   // true si after

  if (Trigger.isInsert && Trigger.isBefore) {
    AccountService.validateAccounts(Trigger.new);
  }
}`,
    notes:
      "Les triggers Apex ont des variables de contexte implicites (`Trigger.*`). La convention est de déléguer la logique à un handler/service (ne jamais mettre de logique dans le trigger).",
    gotcha:
      "Un trigger s'exécute en bulk — `Trigger.new` peut contenir jusqu'à 200 enregistrements. Ne jamais traiter un seul enregistrement à la fois.",
  },
  {
    id: "sharing",
    category: "Apex Specifics",
    title: "with sharing / without sharing",
    tsCode: `// Pas d'équivalent — en Node.js/TS, les permissions
// sont gérées au niveau middleware/auth
app.get('/data', authMiddleware, (req, res) => {
  // L'utilisateur voit toutes les données
});`,
    apexCode: `// with sharing : respecte les règles de partage Salesforce
public with sharing class AccountService {
  public List<Account> getAccounts() {
    // L'utilisateur ne voit que ses enregistrements
    return [SELECT Id, Name FROM Account];
  }
}

// without sharing : ignore les règles de partage
public without sharing class AdminService {
  public List<Account> getAllAccounts() {
    // Voit TOUS les enregistrements
    return [SELECT Id, Name FROM Account];
  }
}`,
    notes:
      "`with sharing` : le SOQL respecte les règles OWD + partage de l'utilisateur courant. `without sharing` : voit tout (attention sécurité). Par défaut (sans mot-clé) : hérite du contexte appelant.",
    gotcha:
      "Oublier `with sharing` sur un service exposé = fuite de données. Toujours déclarer explicitement `with sharing` par défaut.",
  },
  {
    id: "soql-inline",
    category: "Apex Specifics",
    title: "SOQL inline dans le code",
    tsCode: `// En TS, les requêtes sont des strings ou des builders
const result = await prisma.account.findMany({
  where: { name: { contains: 'Acme' } },
});`,
    apexCode: `// SOQL écrit directement dans le code Apex (pas une string !)
String searchTerm = 'Acme%';
List<Account> accounts = [
  SELECT Id, Name, Phone
  FROM Account
  WHERE Name LIKE :searchTerm  // ':' pour les variables Apex
  AND IsActive__c = true
  ORDER BY Name
  LIMIT 50
];

// Variables bindées avec ':'
Integer minRevenue = 1000000;
List<Account> big = [
  SELECT Id FROM Account
  WHERE AnnualRevenue >= :minRevenue
];`,
    notes:
      "Le SOQL n'est pas une string interpolée — c'est du code compilé. Les variables Apex sont injectées avec `:variable` (pas de risque d'injection SQL).",
    gotcha:
      "Ne jamais construire du SOQL dynamique avec des strings concaténées (risque d'injection SOQL). Utiliser `Database.query()` avec des bind variables si le SOQL doit être dynamique.",
  },
  {
    id: "test-coverage",
    category: "Apex Specifics",
    title: "75% test coverage obligatoire",
    tsCode: `// Jest : coverage optionnel (configurable)
// Pas de blocage au déploiement
npm test -- --coverage`,
    apexCode: `// Salesforce BLOQUE le déploiement en production
// si coverage < 75% sur l'ensemble du code Apex

// Vérifier la coverage :
// Developer Console > Test > Run All

// Chaque méthode @isTest doit utiliser Test.startTest() / Test.stopTest()
// pour que les governor limits soient réinitialisés

@isTest
static void testMyMethod() {
  Test.startTest();
  MyClass.myMethod(); // appel réel du code
  Test.stopTest();

  System.assert(true); // au moins une assertion
}`,
    notes:
      "La coverage de 75% est une règle **Salesforce** — sans elle, `sf project deploy start` échoue en production. Sandbox = pas de blocage.",
    gotcha:
      "Atteindre 75% de coverage ne garantit pas la qualité des tests. Les assert sont obligatoires — un test sans assert est un test inutile.",
  },
  {
    id: "bulk-pattern",
    category: "Apex Specifics",
    title: "Bulk pattern (obligatoire)",
    tsCode: `// En TS/Node : traitement record par record OK
async function processUsers(ids: string[]) {
  for (const id of ids) {
    const user = await db.user.findOne(id); // 1 query/iteration
    await updateUser(user); // 1 update/iteration
  }
}`,
    apexCode: `// PATTERN ANTI (interdit) — SOQL/DML dans une boucle
public static void badPattern(List<Id> ids) {
  for (Id id : ids) {
    Account a = [SELECT Id FROM Account WHERE Id = :id]; // SOQL en boucle !
    a.Status__c = 'Updated';
    update a; // DML en boucle !
  }
}

// PATTERN CORRECT — Bulk
public static void goodPattern(List<Id> ids) {
  // 1 seul SOQL
  List<Account> accounts = [SELECT Id FROM Account WHERE Id IN :ids];

  // Traitement en mémoire
  for (Account a : accounts) {
    a.Status__c = 'Updated';
  }

  // 1 seul DML
  update accounts;
}`,
    notes:
      "Le bulk pattern est non-négociable en Apex. Toujours collecter → traiter → sauvegarder. Jamais de SOQL/DML dans une boucle.",
    gotcha:
      "Un code qui fonctionne parfaitement avec 1 enregistrement peut lever une `LimitException` avec 200 enregistrements (taille max d'un batch de trigger). Toujours tester en bulk.",
  },
];
