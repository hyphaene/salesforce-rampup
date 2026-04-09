import type { QuizQuestion } from "./types";

export const javascriptLwcQuestions: QuizQuestion[] = [
  // ─── JAVASCRIPT QUESTIONS ────────────────────────────────────────────────
  {
    id: "js-1",
    question: "What does `typeof null` return in JavaScript?",
    options: [
      { key: "A", text: '"null"' },
      { key: "B", text: '"undefined"' },
      { key: "C", text: '"object"' },
      { key: "D", text: '"boolean"' },
    ],
    answer: "C",
    explanation:
      '`typeof null` returns "object" — this is a well-known JavaScript bug that has been kept for backward compatibility since the language\'s first version.',
    category: "variables-types",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-2",
    question: "Which of the following expressions evaluates to `true`?",
    options: [
      { key: "A", text: "NaN === NaN" },
      { key: "B", text: "NaN == NaN" },
      { key: "C", text: "Object.is(NaN, NaN)" },
      { key: "D", text: 'typeof NaN === "undefined"' },
    ],
    answer: "C",
    explanation:
      "`NaN` is the only value in JavaScript not equal to itself. `Object.is(NaN, NaN)` returns `true` because it uses the SameValue algorithm, which handles NaN specially.",
    category: "variables-types-coercion",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-3",
    question:
      "What is the output of: `typeof undefined`, `typeof null`, `typeof function(){}`?",
    options: [
      { key: "A", text: '"undefined", "null", "function"' },
      { key: "B", text: '"undefined", "object", "function"' },
      { key: "C", text: '"object", "object", "function"' },
      { key: "D", text: '"undefined", "undefined", "object"' },
    ],
    answer: "B",
    explanation:
      '`typeof undefined` is "undefined", `typeof null` is "object" (legacy bug), and `typeof function(){}` is "function" (functions are a special subtype of object).',
    category: "variables-types",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-4",
    question:
      "Which of the following are valid ways to convert the number `1982` to a string? (Select all that apply)",
    options: [
      { key: "A", text: "numValue.toText()" },
      { key: "B", text: "String(numValue)" },
      { key: "C", text: '"" + numValue' },
      { key: "D", text: "numValue.toString()" },
      { key: "E", text: "(String)numValue" },
    ],
    answer: ["B", "C", "D"],
    explanation:
      '`String(numValue)`, `"" + numValue` (implicit coercion), and `numValue.toString()` all convert a number to string. `toText()` does not exist, and `(String)numValue` is not valid JavaScript syntax.',
    category: "variables-types-coercion",
    domain: "javascript",
    difficulty: "JS-Dev-I",
    multiSelect: true,
  },
  {
    id: "js-5",
    question:
      "What is the output of the following code?\n```js\nvar x = 1;\nfunction test() {\n  console.log(x);\n  var x = 2;\n}\ntest();\n```",
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
      { key: "C", text: "undefined" },
      { key: "D", text: "ReferenceError" },
    ],
    answer: "C",
    explanation:
      "Due to hoisting, the `var x` declaration inside `test()` is hoisted to the top of the function scope. The variable exists but is `undefined` at the time `console.log(x)` runs.",
    category: "hoisting-scope",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-6",
    question:
      "What happens when you run the following code?\n```js\nconsole.log(myLet);\nlet myLet = 'hello';\n```",
    options: [
      { key: "A", text: "undefined" },
      { key: "B", text: '"hello"' },
      { key: "C", text: "null" },
      { key: "D", text: "ReferenceError" },
    ],
    answer: "D",
    explanation:
      "`let` declarations are hoisted but not initialized — they exist in a Temporal Dead Zone (TDZ) from the start of the block until the declaration is reached. Accessing them before declaration throws a `ReferenceError`.",
    category: "hoisting-tdz",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-7",
    question:
      "Given a `makeCounter` closure that returns a `counter` function incrementing an internal count starting at 0, what does calling `counter()` twice output?",
    options: [
      { key: "A", text: "1, 1" },
      { key: "B", text: "0, 1" },
      { key: "C", text: "1, 2" },
      { key: "D", text: "undefined, undefined" },
    ],
    answer: "C",
    explanation:
      "The closure retains a reference to the `count` variable in the outer scope. Each call increments and returns the updated count, so successive calls return 1, then 2.",
    category: "closures",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-8",
    question: "What is a closure in JavaScript?",
    options: [
      { key: "A", text: "An Immediately Invoked Function Expression (IIFE)" },
      {
        key: "B",
        text: "A function that retains access to its outer scope variables even after the outer function has returned",
      },
      {
        key: "C",
        text: "A function that prevents access to the global scope",
      },
      { key: "D", text: "A function that executes only once" },
    ],
    answer: "B",
    explanation:
      "A closure is a function that 'closes over' its lexical environment — it retains references to variables from its enclosing scope even after that scope has finished executing.",
    category: "closures",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-9",
    question:
      "Given `obj = { name: 'Salesforce', greet() { return this.name; } }`, if you extract `const fn = obj.greet` and call `fn()`, what does it return?",
    options: [
      { key: "A", text: '"Salesforce"' },
      { key: "B", text: "undefined" },
      { key: "C", text: "TypeError" },
      { key: "D", text: "null" },
    ],
    answer: "B",
    explanation:
      "When a method is extracted and called as a standalone function, `this` loses its binding and defaults to `undefined` in strict mode (or the global object in sloppy mode), so `this.name` returns `undefined`.",
    category: "this-binding",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-10",
    question:
      "Which method creates a new function with a permanent `this` binding without invoking it immediately?",
    options: [
      { key: "A", text: "call()" },
      { key: "B", text: "apply()" },
      { key: "C", text: "bind()" },
      { key: "D", text: "assign()" },
    ],
    answer: "C",
    explanation:
      "`bind()` returns a new function with a permanently bound `this` context. Unlike `call()` and `apply()`, it does not invoke the function immediately.",
    category: "this-binding",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-11",
    question:
      "In an object literal, an arrow function `getValue` references `this.value`. What does `this.value` return inside that arrow function?",
    options: [
      { key: "A", text: "42" },
      { key: "B", text: "undefined" },
      { key: "C", text: "null" },
      { key: "D", text: "TypeError" },
    ],
    answer: "B",
    explanation:
      "Arrow functions do not have their own `this` — they inherit `this` from the surrounding lexical context at definition time. In an object literal (not a class), the surrounding `this` is typically the global object or `undefined` in strict mode, not the object itself.",
    category: "this-binding-arrow",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-12",
    question: "What is the difference between `call()` and `apply()`?",
    options: [
      {
        key: "A",
        text: "`call()` takes an array of arguments; `apply()` takes individual arguments",
      },
      {
        key: "B",
        text: "`call()` takes individual arguments; `apply()` takes an array of arguments",
      },
      {
        key: "C",
        text: "`call()` creates a permanent binding; `apply()` is temporary",
      },
      { key: "D", text: "They are identical in behavior" },
    ],
    answer: "B",
    explanation:
      "Both `call()` and `apply()` invoke a function with a specified `this`, but differ in how arguments are passed: `call(thisArg, arg1, arg2)` takes individual arguments, while `apply(thisArg, [arg1, arg2])` takes an array.",
    category: "this-binding",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-13",
    question:
      "A `speak` method is defined on `Animal.prototype`. After creating `const dog = new Animal('Rex')`, what are the results of `dog.speak()` and `dog.hasOwnProperty('speak')`?",
    options: [
      { key: "A", text: "Outputs the speech, true" },
      { key: "B", text: "Outputs the speech, false" },
      { key: "C", text: "undefined, true" },
      { key: "D", text: "TypeError" },
    ],
    answer: "B",
    explanation:
      "`dog.speak()` works via prototype chain lookup, so it outputs the speech. But `hasOwnProperty('speak')` returns `false` because `speak` belongs to `Animal.prototype`, not to the `dog` instance itself.",
    category: "prototypal-inheritance",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-14",
    question: "Classes in JavaScript are best described as:",
    options: [
      { key: "A", text: "A new, fundamentally different OOP model" },
      {
        key: "B",
        text: "Syntactic sugar over JavaScript's prototypal inheritance",
      },
      {
        key: "C",
        text: "A system where methods become own properties of each instance",
      },
      {
        key: "D",
        text: "A construct that allows arrow functions as constructors",
      },
    ],
    answer: "B",
    explanation:
      "ES6 classes are syntactic sugar over the existing prototype-based inheritance model. Under the hood, they still use prototypes — `class` just provides a cleaner, more familiar syntax.",
    category: "prototypal-inheritance-classes",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-15",
    question:
      "What is the output order of the following code?\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```",
    options: [
      { key: "A", text: "1, 2, 3, 4" },
      { key: "B", text: "1, 4, 2, 3" },
      { key: "C", text: "1, 4, 3, 2" },
      { key: "D", text: "1, 3, 4, 2" },
    ],
    answer: "C",
    explanation:
      "Synchronous code runs first (1, 4). Then microtasks (Promise callbacks) run before macrotasks (setTimeout), so 3 comes before 2. Final order: 1, 4, 3, 2.",
    category: "promises-event-loop",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-16",
    question: "Which statement about `async/await` is true?",
    options: [
      { key: "A", text: "It runs asynchronous code in a separate thread" },
      {
        key: "B",
        text: "It blocks the JavaScript engine until the promise resolves",
      },
      {
        key: "C",
        text: "It allows asynchronous code to be written and read like synchronous code",
      },
      { key: "D", text: "An async function returns undefined by default" },
    ],
    answer: "C",
    explanation:
      "`async/await` is syntactic sugar over Promises. It does not block the engine or run in a separate thread — it simply makes asynchronous code appear sequential, improving readability.",
    category: "promises-async-await",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-17",
    question: "What does `Promise.race()` return?",
    options: [
      { key: "A", text: "A promise that resolves when all promises resolve" },
      {
        key: "B",
        text: "A promise that settles (resolves or rejects) as soon as the first promise settles",
      },
      { key: "C", text: "An array of all resolved values" },
      { key: "D", text: "A promise that rejects only if all promises reject" },
    ],
    answer: "B",
    explanation:
      "`Promise.race()` returns a promise that settles with the value or reason of the first promise in the iterable to settle, regardless of whether it resolves or rejects.",
    category: "promises",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-18",
    question:
      "A generator function yields 1, 2, 3 in sequence. After calling `.next()` three times, what is the `value` of the third call and is `.done` true or false?",
    options: [
      { key: "A", text: "value: 1, value: 2, third call: done is false" },
      { key: "B", text: "value: 1, value: 2, third call: done is true" },
      { key: "C", text: "[1], [2], done is true" },
      { key: "D", text: "value: 1, undefined, done is true" },
    ],
    answer: "A",
    explanation:
      "Each `.next()` call resumes the generator until the next `yield`. The third `.next()` yields 3 with `{ value: 3, done: false }`. The generator is only `done: true` after the function body has returned (a fourth call).",
    category: "generators-iterators",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-19",
    question: "What is the primary use case of `WeakMap` over `Map`?",
    options: [
      { key: "A", text: "WeakMap can use primitive values as keys" },
      {
        key: "B",
        text: "WeakMap holds weak references to keys, allowing garbage collection when no other references exist",
      },
      { key: "C", text: "WeakMap is iterable, unlike Map" },
      { key: "D", text: "WeakMap preserves insertion order" },
    ],
    answer: "B",
    explanation:
      "A `WeakMap` holds weak references to its keys (which must be objects). If the key object has no other references, it can be garbage collected, making `WeakMap` ideal for associating metadata with objects without preventing their cleanup.",
    category: "weakmap-weakset",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-20",
    question: "What does the `Proxy` object allow you to do?",
    options: [
      { key: "A", text: "Create a shallow copy of an object" },
      {
        key: "B",
        text: "Define custom behavior (traps) for fundamental operations on an object",
      },
      { key: "C", text: "Freeze an object to prevent mutations" },
      { key: "D", text: "Serialize an object to JSON" },
    ],
    answer: "B",
    explanation:
      "A `Proxy` wraps an object and intercepts fundamental operations (property lookup, assignment, enumeration, function invocation, etc.) via handler traps, enabling custom behavior like validation, logging, or reactivity.",
    category: "proxy-reflect",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-21",
    question: "How do event bubbling and capturing differ?",
    options: [
      {
        key: "A",
        text: "Bubbling: event travels from target up to root; Capturing: event travels from root down to target",
      },
      {
        key: "B",
        text: "Bubbling: event travels from root down to target; Capturing: event travels from target up to root",
      },
      {
        key: "C",
        text: "Bubbling is for mouse events; Capturing is for keyboard events",
      },
      { key: "D", text: "They use the same syntax and behave identically" },
    ],
    answer: "A",
    explanation:
      "In the capture phase, the event travels from the document root down to the target element. In the bubble phase, it travels back up from the target to the root. Most event listeners use the bubble phase by default.",
    category: "dom-events",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-22",
    question: "How do you register an event listener during the CAPTURE phase?",
    options: [
      { key: "A", text: "element.addEventListener('click', handler)" },
      { key: "B", text: "element.addEventListener('click', handler, false)" },
      { key: "C", text: "element.addEventListener('click', handler, true)" },
      { key: "D", text: "element.attachEvent('onclick', handler)" },
    ],
    answer: "C",
    explanation:
      "Passing `true` as the third argument to `addEventListener` registers the listener in the capture phase. The default value is `false` (bubble phase). `attachEvent` is an old IE-only API.",
    category: "dom-events",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-23",
    question:
      "You have a module with multiple utility functions. Which export style is most appropriate?",
    options: [
      { key: "A", text: "Default export (export default)" },
      { key: "B", text: "Named exports (export const fn = ...)" },
      { key: "C", text: "CommonJS (module.exports = {})" },
      { key: "D", text: "UMD (Universal Module Definition)" },
    ],
    answer: "B",
    explanation:
      "Named exports are ideal for modules containing multiple utilities, as consumers can import only what they need (tree-shaking friendly) and the names are explicit at the import site.",
    category: "es-modules",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-24",
    question:
      "What is the key difference between named exports and default exports?",
    options: [
      {
        key: "A",
        text: "Named imports must use the same name as exported; default imports can use any name",
      },
      { key: "B", text: "Default exports are processed faster at runtime" },
      { key: "C", text: "Named exports are deprecated in ES2020" },
      { key: "D", text: "A module can have multiple default exports" },
    ],
    answer: "A",
    explanation:
      "Named exports must be imported using the same name (or aliased with `as`). Default exports can be imported with any name chosen by the consumer. A module can only have one default export.",
    category: "es-modules",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-25",
    question:
      "In an `async` function `fetchData` with a `try/catch` block, if the awaited promise rejects and you `throw` inside the catch, what happens?",
    options: [
      { key: "A", text: "The catch block never executes for async errors" },
      {
        key: "B",
        text: "The catch block catches the rejection and re-throwing causes the returned promise to reject",
      },
      { key: "C", text: "The thrown error is swallowed by the async function" },
      { key: "D", text: "The function returns undefined silently" },
    ],
    answer: "B",
    explanation:
      "In an `async` function, `await`ed promise rejections are caught by `try/catch`. Re-throwing inside `catch` causes the async function's returned promise to reject with that error, propagating it to the caller.",
    category: "error-handling",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-26",
    question: "What is the primary use of `Symbol` in JavaScript?",
    options: [
      { key: "A", text: "Creating immutable string constants" },
      {
        key: "B",
        text: "Creating unique, guaranteed-non-colliding property keys",
      },
      { key: "C", text: "Encrypting object properties" },
      { key: "D", text: "Generating numeric IDs" },
    ],
    answer: "B",
    explanation:
      "Every `Symbol()` call returns a unique value. Symbols are primarily used as unique property keys to avoid name collisions, especially in libraries or when adding properties to objects you don't own.",
    category: "symbol-generators",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },
  {
    id: "js-27",
    question:
      "What is the output of the following code?\n```js\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n```",
    options: [
      { key: "A", text: "3, 3, 3" },
      { key: "B", text: "0, 1, 2" },
      { key: "C", text: "undefined, undefined, undefined" },
      { key: "D", text: "ReferenceError" },
    ],
    answer: "B",
    explanation:
      "Using `let` creates a new binding for each loop iteration. Each arrow function closes over its own distinct `i`. If `var` were used instead, all callbacks would share the same `i` and output 3, 3, 3.",
    category: "closures-hoisting",
    domain: "javascript",
    difficulty: "JS-Dev-I",
  },

  // ─── LWC QUESTIONS ───────────────────────────────────────────────────────
  {
    id: "lwc-1",
    question:
      "Which decorator exposes a property as part of a LWC component's public API?",
    options: [
      { key: "A", text: "@track" },
      { key: "B", text: "@wire" },
      { key: "C", text: "@api" },
      { key: "D", text: "@public" },
    ],
    answer: "C",
    explanation:
      "`@api` marks a property or method as public, allowing parent components to pass values into the component or call its methods. `@public` does not exist in LWC.",
    category: "lwc-decorators",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-2",
    question:
      "Which decorator do you use to track changes in nested object properties and arrays?",
    options: [
      { key: "A", text: "@api" },
      { key: "B", text: "@wire" },
      { key: "C", text: "No decorator needed (reactive by default)" },
      { key: "D", text: "@track" },
    ],
    answer: "D",
    explanation:
      "`@track` makes an object or array deeply reactive — the component re-renders when nested properties change. Without `@track`, only reassignment of the top-level reference triggers reactivity.",
    category: "lwc-decorators",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-3",
    question:
      "What is the correct lifecycle order when a parent LWC renders a child LWC?",
    options: [
      {
        key: "A",
        text: "Parent constructor → Parent connectedCallback → Child constructor → Child connectedCallback → Child renderedCallback → Parent renderedCallback",
      },
      {
        key: "B",
        text: "Parent constructor → Child constructor → Parent connectedCallback → Child connectedCallback → Parent renderedCallback → Child renderedCallback",
      },
      {
        key: "C",
        text: "Child constructor → Child connectedCallback → Parent constructor → Parent connectedCallback",
      },
      {
        key: "D",
        text: "Parent constructor → Child constructor → Parent renderedCallback → Child renderedCallback",
      },
    ],
    answer: "A",
    explanation:
      "LWC follows a top-down construction and bottom-up rendering pattern. Parent initializes first (constructor, connectedCallback), then child initializes (constructor, connectedCallback), then child renders first (renderedCallback), then parent renders (renderedCallback).",
    category: "lwc-lifecycle",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-4",
    question:
      "In which lifecycle hook should you perform DOM manipulation in LWC?",
    options: [
      { key: "A", text: "constructor()" },
      { key: "B", text: "connectedCallback()" },
      { key: "C", text: "renderedCallback()" },
      { key: "D", text: "disconnectedCallback()" },
    ],
    answer: "C",
    explanation:
      "`renderedCallback()` fires after every render cycle, once the component's DOM is fully available. It is the appropriate hook for DOM queries and third-party library initialization that require rendered elements.",
    category: "lwc-lifecycle",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-5",
    question:
      "How many times does `connectedCallback()` fire in a LWC component?",
    options: [
      {
        key: "A",
        text: "Only once, when the component is first inserted into the DOM",
      },
      { key: "B", text: "Every time the component re-renders" },
      {
        key: "C",
        text: "Multiple times — once each time the component is inserted into the DOM (e.g., toggled with if:true/false)",
      },
      { key: "D", text: "After all child components have rendered" },
    ],
    answer: "C",
    explanation:
      "`connectedCallback()` fires each time the component is connected to the DOM. If the component is conditionally rendered (e.g., toggled via `lwc:if`), it fires again each time it is re-inserted.",
    category: "lwc-lifecycle",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-6",
    question:
      "What is the correct pattern for a child LWC component to send data to its parent?",
    options: [
      {
        key: "A",
        text: "Directly set an @api property on the parent component from the child",
      },
      { key: "B", text: "Use a shared @wire adapter to Apex" },
      {
        key: "C",
        text: "Dispatch a CustomEvent from the child; the parent listens with an oneventname handler",
      },
      {
        key: "D",
        text: "Import the parent component and call its methods directly",
      },
    ],
    answer: "C",
    explanation:
      "Child-to-parent communication uses the CustomEvent API. The child dispatches `this.dispatchEvent(new CustomEvent('eventname', { detail: data }))` and the parent listens with `oneventname` in the template or `addEventListener`.",
    category: "lwc-events",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-7",
    question:
      "What is the recommended way for sibling LWC components to communicate?",
    options: [
      { key: "A", text: "Dispatch CustomEvents directly between siblings" },
      { key: "B", text: "Lightning Message Service (LMS)" },
      { key: "C", text: "Mark properties @api on both components" },
      { key: "D", text: "Use @track on a shared property" },
    ],
    answer: "B",
    explanation:
      "Lightning Message Service (LMS) enables communication between components that don't have a direct parent-child relationship — including siblings, components across DOM trees, and even Aura/Visualforce components.",
    category: "lwc-events-lms",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-8",
    question:
      "For a CustomEvent to cross shadow DOM boundaries (e.g., be heard by a grandparent), which configuration is required?",
    options: [
      { key: "A", text: "{ bubbles: true } only" },
      { key: "B", text: "{ composed: true } only" },
      { key: "C", text: "{ bubbles: true, composed: true }" },
      {
        key: "D",
        text: "No special configuration — all events cross shadow boundaries automatically",
      },
    ],
    answer: "C",
    explanation:
      "`bubbles: true` makes the event propagate up the DOM tree; `composed: true` allows it to cross shadow DOM boundaries. Both are needed for the event to reach ancestors outside the component's shadow root.",
    category: "lwc-events-shadow-dom",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-9",
    question: "When should you use `@wire` instead of an imperative Apex call?",
    options: [
      { key: "A", text: "When the Apex method performs DML operations" },
      {
        key: "B",
        text: "When the Apex method is cacheable and you want automatic data refresh when reactive properties change",
      },
      {
        key: "C",
        text: "When you need to chain multiple Apex calls sequentially",
      },
      { key: "D", text: "When you need try/catch error handling" },
    ],
    answer: "B",
    explanation:
      "`@wire` works with `@AuraEnabled(cacheable=true)` methods and automatically re-fetches data when reactive properties change. Imperative calls are better for DML, sequential calls, or when you need fine-grained control over timing.",
    category: "lwc-wire",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-10",
    question: "What does `refreshApex()` do in LWC?",
    options: [
      { key: "A", text: "Clears all @track reactive properties" },
      {
        key: "B",
        text: "Forces the @wire adapter to re-fetch data from the server, bypassing the cache",
      },
      { key: "C", text: "Reloads the entire page" },
      { key: "D", text: "Cancels all pending Apex requests" },
    ],
    answer: "B",
    explanation:
      "`refreshApex()` is used to refresh the data cached by a `@wire` call. You pass it the wired property (the provisioned value), and it triggers a fresh server request, updating the component.",
    category: "lwc-wire",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-11",
    question: "What is the primary purpose of Shadow DOM in LWC?",
    options: [
      { key: "A", text: "Improving rendering performance" },
      {
        key: "B",
        text: "Providing CSS and JavaScript encapsulation to prevent style and DOM leakage",
      },
      { key: "C", text: "Enabling two-way data binding" },
      { key: "D", text: "Replacing Locker Service entirely" },
    ],
    answer: "B",
    explanation:
      "Shadow DOM creates an encapsulated DOM subtree. Styles defined inside a component don't leak out, and external styles don't leak in. JavaScript cannot directly access elements inside another component's shadow root.",
    category: "lwc-shadow-dom",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-12",
    question: "Which statement about Locker Service in Salesforce is correct?",
    options: [
      { key: "A", text: "Locker Service applies to LWC components only" },
      {
        key: "B",
        text: "Locker Service allows unrestricted cross-namespace DOM access",
      },
      {
        key: "C",
        text: "Locker Service provides namespace-level isolation and enforces secure JavaScript coding patterns",
      },
      {
        key: "D",
        text: "Locker Service has been fully replaced by Shadow DOM",
      },
    ],
    answer: "C",
    explanation:
      "Locker Service is a Salesforce security architecture that isolates components by namespace, restricts access to global objects, and enforces secure coding patterns. It applies to Aura components; LWC uses a similar but distinct mechanism.",
    category: "lwc-security",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-13",
    question: "How does data binding in LWC differ from Aura components?",
    options: [
      { key: "A", text: "LWC uses two-way data binding by default" },
      {
        key: "B",
        text: "Aura uses two-way binding with `{!v.attribute}` syntax; LWC uses one-way binding with `{property}` syntax",
      },
      { key: "C", text: "Both frameworks use the same binding syntax" },
      { key: "D", text: "LWC does not support data binding" },
    ],
    answer: "B",
    explanation:
      "Aura components use `{!v.attribute}` for two-way binding. LWC uses `{property}` for one-way (parent-to-child) binding. In LWC, child-to-parent communication requires explicit event dispatch.",
    category: "lwc-vs-aura",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-14",
    question:
      "Can you embed LWC components inside Aura components, and vice versa?",
    options: [
      {
        key: "A",
        text: "No — LWC and Aura components are completely incompatible",
      },
      {
        key: "B",
        text: "Yes, you can embed LWC inside Aura, but you cannot embed Aura inside LWC",
      },
      { key: "C", text: "Yes, both directions work without restrictions" },
      {
        key: "D",
        text: "Only if both components belong to the same namespace",
      },
    ],
    answer: "B",
    explanation:
      "LWC components can be used inside Aura components. However, Aura components cannot be embedded inside LWC components — the interoperability is one-directional.",
    category: "lwc-vs-aura",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-15",
    question: "What is the correct pattern for an imperative Apex call in LWC?",
    options: [
      {
        key: "A",
        text: "Use @wire with an if:true/else to handle errors imperatively",
      },
      {
        key: "B",
        text: "Import the Apex method and call it as a function returning a Promise: `getAccounts({ param }).then(...).catch(...)`",
      },
      {
        key: "C",
        text: "Import and call the method without passing parameters — parameters are not supported imperatively",
      },
      {
        key: "D",
        text: "Call the Apex method synchronously inside connectedCallback",
      },
    ],
    answer: "B",
    explanation:
      "Imperative Apex calls return a Promise. You import the method, call it with an options object containing parameters, and handle results with `.then()` / `.catch()` or `async/await`.",
    category: "lwc-wire-imperative",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-16",
    question:
      "Which lifecycle hook should be used for cleanup tasks (e.g., clearing timers, unsubscribing) in LWC?",
    options: [
      { key: "A", text: "renderedCallback()" },
      { key: "B", text: "connectedCallback()" },
      { key: "C", text: "errorCallback()" },
      { key: "D", text: "disconnectedCallback()" },
    ],
    answer: "D",
    explanation:
      "`disconnectedCallback()` fires when the component is removed from the DOM. It is the correct place to clean up subscriptions, event listeners, and timers to prevent memory leaks.",
    category: "lwc-lifecycle",
    domain: "lwc",
    difficulty: "PD1",
  },
  {
    id: "lwc-17",
    question:
      "What is the correct pattern to subscribe to a Lightning Message Channel in LWC?",
    options: [
      {
        key: "A",
        text: "Import the channel + use `@wire MessageContext` + call `subscribe()` inside `connectedCallback()`",
      },
      { key: "B", text: "Use `dispatchEvent()` with the channel name" },
      { key: "C", text: "Decorate a property with `@api messageChannel`" },
      { key: "D", text: "Use `window.addEventListener('message', handler)`" },
    ],
    answer: "A",
    explanation:
      "To subscribe to an LMS channel: (1) import the channel, (2) wire `MessageContext`, (3) call `subscribe(this.messageContext, CHANNEL, handler)` in `connectedCallback()`, and (4) unsubscribe in `disconnectedCallback()`.",
    category: "lwc-events-lms",
    domain: "lwc",
    difficulty: "PD2",
  },
  {
    id: "lwc-18",
    question:
      "Which statements about `@api` property restrictions are correct? (Select all that apply)",
    options: [
      { key: "A", text: "Cannot be combined with @track on the same property" },
      {
        key: "B",
        text: "Should be treated as read-only inside the child component",
      },
      { key: "C", text: "Can hold function references (methods)" },
      {
        key: "D",
        text: "Triggers a re-render of the child when the parent passes a new value",
      },
    ],
    answer: ["A", "B", "C", "D"],
    explanation:
      "@api properties cannot be combined with @track. They are owned by the parent, so mutating them inside the child is an anti-pattern (read-only in child). @api can expose methods. Assigning a new value from the parent triggers reactivity.",
    category: "lwc-decorators",
    domain: "lwc",
    difficulty: "PD2",
    multiSelect: true,
  },
  {
    id: "lwc-19",
    question:
      "How do you prevent a CustomEvent from crossing the shadow root boundary?",
    options: [
      {
        key: "A",
        text: "Use `{ composed: false }` (the default) — the event stays within the shadow root",
      },
      { key: "B", text: "Call `event.preventDefault()` on the event" },
      { key: "C", text: "Remove the `bubbles` option from the event" },
      { key: "D", text: "Call `event.stopPropagation()` in the child" },
    ],
    answer: "A",
    explanation:
      "`composed: false` is the default for CustomEvents. With this setting, the event bubbles within the shadow DOM but does not cross the shadow boundary into the outer DOM. `composed: true` is required to cross boundaries.",
    category: "lwc-shadow-dom-events",
    domain: "lwc",
    difficulty: "PD2",
  },
  {
    id: "lwc-20",
    question:
      "What does `getRecordNotifyChange()` do in the context of LWC wire adapters?",
    options: [
      { key: "A", text: "Creates a new Salesforce record" },
      {
        key: "B",
        text: "Notifies the Lightning Data Service (LDS) cache to refresh data for the specified record IDs",
      },
      {
        key: "C",
        text: "Sends an in-app notification email to the record owner",
      },
      { key: "D", text: "Triggers a Change Data Capture (CDC) platform event" },
    ],
    answer: "B",
    explanation:
      "`getRecordNotifyChange([{ recordId }])` tells LDS that a record has been updated externally (e.g., via imperative Apex DML). Any component using `@wire getRecord` for those IDs will automatically re-fetch, keeping the UI in sync.",
    category: "lwc-wire",
    domain: "lwc",
    difficulty: "PD2",
  },
];
