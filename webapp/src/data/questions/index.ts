import { apexQuestions } from "./apex";
import { javascriptLwcQuestions } from "./javascript-lwc";
import { soqlSecurityQuestions } from "./soql-security";
import { declarativeScenariosQuestions } from "./declarative-scenarios";
import type { QuizQuestion } from "./types";

export { type QuizQuestion, type QuizDomain, domainInfos } from "./types";

export const allQuestions: QuizQuestion[] = [
  ...apexQuestions,
  ...javascriptLwcQuestions,
  ...soqlSecurityQuestions,
  ...declarativeScenariosQuestions,
];
