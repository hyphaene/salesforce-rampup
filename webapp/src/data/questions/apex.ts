import type { QuizQuestion } from "./types";

export const apexQuestions: QuizQuestion[] = [
  {
    id: "apex-1",
    question:
      'When a Case is closed with Status "Could not fix", an Engineering Review record should be created. What automation should be used?',
    options: [
      { key: "A", text: "before update trigger" },
      { key: "B", text: "after update trigger" },
      { key: "C", text: "after upsert trigger" },
      { key: "D", text: "before upsert trigger" },
    ],
    answer: "B",
    explanation:
      "After triggers are required for creating related records because the parent Id is only available after save.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-2",
    question:
      "Which correctly describes Trigger context variable availability?",
    options: [
      {
        key: "A",
        text: "Trigger.new available in before/after insert, before/after update, after undelete",
      },
      {
        key: "B",
        text: "Trigger.old available in before insert and before delete only",
      },
      { key: "C", text: "Trigger.newMap available in before insert" },
      { key: "D", text: "Trigger.old can be modified in before update" },
    ],
    answer: "A",
    explanation:
      "Trigger.new is available in before/after insert, before/after update, and after undelete. Trigger.old is available in before/after update and before/after delete.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-3",
    question: "How to prevent trigger recursive execution?",
    options: [
      { key: "A", text: "try-catch block" },
      { key: "B", text: "Static Boolean in helper class" },
      { key: "C", text: "Set Trigger.isExecuting to false" },
      { key: "D", text: "System.recursiveCheck()" },
    ],
    answer: "B",
    explanation:
      "A static Boolean variable in a helper class maintains its value across trigger invocations within the same transaction, allowing you to prevent recursive execution.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-4",
    question: "What is the correct order of execution on record save?",
    options: [
      {
        key: "A",
        text: "Before triggers → System validation → Custom validation → After triggers → Workflow",
      },
      {
        key: "B",
        text: "System validation → Before triggers → Custom validation → After triggers → Workflow",
      },
      {
        key: "C",
        text: "Custom validation → Before triggers → System validation → After triggers → Workflow",
      },
      {
        key: "D",
        text: "Before triggers → Custom validation → System validation → Workflow → After triggers",
      },
    ],
    answer: "B",
    explanation:
      "The correct order is: System validation → Before triggers → Custom validation → After triggers → Workflow rules.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-5",
    question:
      "What happens when you try to access Trigger.newMap in a before-insert trigger?",
    options: [
      { key: "A", text: "Contains records keyed by temp Ids" },
      { key: "B", text: "null because no Ids have been assigned yet" },
      { key: "C", text: "Throws NullPointerException" },
      { key: "D", text: "Available with String keys" },
    ],
    answer: "B",
    explanation:
      "Trigger.newMap is null in before-insert triggers because record Ids have not been assigned yet at that point in the execution.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-6",
    question:
      "Two after-update triggers cause a cascade: Account → 50 Contacts each → 1 CampaignMember each. 200 Accounts are updated. What happens?",
    options: [
      { key: "A", text: "Fails — combined DML exceeds 10,000 rows" },
      { key: "B", text: "No error — separate execution contexts" },
      { key: "C", text: "No error — limit is 50,000" },
      { key: "D", text: "Account updates succeed but Contact updates fail" },
    ],
    answer: "A",
    explanation:
      "200 Accounts × 50 Contacts = 10,000 Contacts + 10,000 CampaignMembers = 20,000 total DML rows, exceeding the 10,000 DML rows per transaction limit.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-7",
    question:
      "In an after-insert trigger, Trigger.new records — can they be modified?",
    options: [
      { key: "A", text: "Yes, modifications are saved automatically" },
      { key: "B", text: "Read-only in after triggers" },
      { key: "C", text: "Contains old values" },
      { key: "D", text: "Not available in after insert" },
    ],
    answer: "B",
    explanation:
      "Trigger.new is read-only in after triggers. To modify records in after triggers, you must perform a DML update.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-8",
    question:
      "A SOQL query inside a for loop is processing 200 Accounts. What two changes are needed to avoid governor limit issues?",
    options: [
      {
        key: "A",
        text: "Move SOQL outside the loop and collect Ids first",
      },
      { key: "B", text: "Use Map<Id, List<Contact>> to store results" },
      { key: "C", text: "Add try-catch around the SOQL" },
      { key: "D", text: "Replace SOQL with SOSL" },
    ],
    answer: ["A", "B"],
    explanation:
      "Moving SOQL outside the loop (bulkification) and using a Map to store and access related records efficiently are the two key changes needed to avoid hitting governor limits.",
    category: "DML/SOQL/governor-limits",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-9",
    question:
      "What is the difference between `insert records` and `Database.insert(records, false)`?",
    options: [
      { key: "A", text: "They are identical in behavior" },
      {
        key: "B",
        text: "insert allows partial success; Database rolls back all",
      },
      {
        key: "C",
        text: "insert throws exception on failure and rolls back all; Database.insert(false) allows partial success",
      },
      { key: "D", text: "Database.insert is faster" },
    ],
    answer: "C",
    explanation:
      "The DML statement `insert` throws a DmlException and rolls back all records on any failure. Database.insert() with allOrNone=false allows partial success, returning SaveResult objects with success/failure per record.",
    category: "DML",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-10",
    question:
      "Which two SOQL approaches are safe from injection when a name value comes from user input?",
    options: [
      {
        key: "A",
        text: "Database.query() with direct string concatenation",
      },
      { key: "B", text: "Static SOQL with a bind variable" },
      {
        key: "C",
        text: "Database.query() with String.escapeSingleQuotes()",
      },
      { key: "D", text: "Static SOQL with :name bind variable" },
    ],
    answer: ["B", "C"],
    explanation:
      "Static SOQL with bind variables (e.g., WHERE Name = :name) is safe from injection. Dynamic SOQL using String.escapeSingleQuotes() is also safe. Note that B and D describe the same approach; the safe options are static bind variables and escapeSingleQuotes in dynamic SOQL.",
    category: "SOQL",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-11",
    question:
      "What is the correct SOQL for querying Accounts with their related Contacts in a single query?",
    options: [
      {
        key: "A",
        text: "SELECT Id, Name, Contacts FROM Account",
      },
      {
        key: "B",
        text: "SELECT Id, Name, (SELECT Id, Name FROM Contacts) FROM Account",
      },
      {
        key: "C",
        text: "SELECT Id, Name, (SELECT Id, Name FROM Contact) FROM Account",
      },
      { key: "D", text: "SELECT with JOIN syntax" },
    ],
    answer: "B",
    explanation:
      "Subqueries use the child relationship name (plural), which for Contact is 'Contacts'. The correct syntax is SELECT Id, Name, (SELECT Id, Name FROM Contacts) FROM Account.",
    category: "SOQL",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-12",
    question:
      "Which Apex class is used to track governor limit resources consumed during execution?",
    options: [
      { key: "A", text: "Exception" },
      { key: "B", text: "Messaging" },
      { key: "C", text: "OrgLimits" },
      { key: "D", text: "Limits" },
    ],
    answer: "D",
    explanation:
      "The Limits class provides static methods to check current governor limit usage, such as Limits.getQueries() and Limits.getLimitQueries().",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-13",
    question: "Which TWO statements about Merge DML are true?",
    options: [
      { key: "A", text: "Supports Accounts, Contacts, Cases, and Leads" },
      {
        key: "B",
        text: "Master record values are overwritten by merged record values",
      },
      { key: "C", text: "Supports merging up to 3 records total" },
      { key: "D", text: "External IDs work with the merge statement" },
    ],
    answer: ["A", "C"],
    explanation:
      "The merge statement supports Accounts, Contacts, Cases, and Leads. It allows merging up to 3 records (1 master + 2 duplicates). The master record's values are preserved, not overwritten.",
    category: "DML",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-14",
    question:
      "99 SOQL queries are consumed before Test.startTest(). A query is executed inside startTest()/stopTest() block. What is the total count inside the block?",
    options: [
      { key: "A", text: "100 total (99 + 1)" },
      { key: "B", text: "1 — limits are reset by startTest()" },
      { key: "C", text: "Exception thrown at 99" },
      { key: "D", text: "0" },
    ],
    answer: "B",
    explanation:
      "Test.startTest() resets all governor limits for the code within the startTest/stopTest block, giving a fresh set of limits. The query inside counts as 1.",
    category: "testing/governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-15",
    question: "What is the SOQL query limit per synchronous transaction?",
    options: [
      { key: "A", text: "50" },
      { key: "B", text: "100" },
      { key: "C", text: "200" },
      { key: "D", text: "500" },
    ],
    answer: "B",
    explanation:
      "The maximum number of SOQL queries allowed in a single synchronous Apex transaction is 100.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-16",
    question:
      "What is the maximum number of records returned by all SOQL queries combined per transaction?",
    options: [
      { key: "A", text: "10,000" },
      { key: "B", text: "20,000" },
      { key: "C", text: "50,000" },
      { key: "D", text: "100,000" },
    ],
    answer: "C",
    explanation:
      "The total number of records retrieved by all SOQL queries combined in a single transaction is limited to 50,000.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-17",
    question: "Can a LimitException be caught in Apex?",
    options: [
      { key: "A", text: "Yes, with a try-catch block" },
      {
        key: "B",
        text: "No — it terminates the transaction and cannot be caught",
      },
      { key: "C", text: "Only in asynchronous contexts" },
      { key: "D", text: "Can catch and retry the operation" },
    ],
    answer: "B",
    explanation:
      "LimitException is a special exception type that cannot be caught. When a governor limit is exceeded, the transaction is terminated immediately.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-18",
    question:
      "What is the maximum number of DML statements per synchronous transaction?",
    options: [
      { key: "A", text: "100" },
      { key: "B", text: "150" },
      { key: "C", text: "200" },
      { key: "D", text: "500" },
    ],
    answer: "B",
    explanation:
      "The maximum number of DML statements (insert, update, delete, upsert, merge, undelete) per synchronous transaction is 150.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-19",
    question:
      "You attempt to insert 11,000 Case records in a single DML statement. What happens?",
    options: [
      { key: "A", text: "Fails — governor limit of 10,000 DML rows" },
      {
        key: "B",
        text: "DmlException is thrown and can be caught",
      },
      { key: "C", text: "Succeeds without error" },
      { key: "D", text: "LimitException is thrown and can be caught" },
    ],
    answer: "A",
    explanation:
      "The maximum number of records processed by a single DML statement is 10,000. Attempting to insert 11,000 records will throw a LimitException (which cannot be caught) and terminate the transaction.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-20",
    question: "What is the heap size limit for synchronous Apex?",
    options: [
      { key: "A", text: "2 MB" },
      { key: "B", text: "6 MB" },
      { key: "C", text: "12 MB" },
      { key: "D", text: "50 MB" },
    ],
    answer: "B",
    explanation:
      "The maximum heap size for synchronous Apex transactions is 6 MB. Asynchronous transactions have a 12 MB heap size limit.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-21",
    question: "What is the CPU time limit for synchronous Apex?",
    options: [
      { key: "A", text: "5,000 ms" },
      { key: "B", text: "10,000 ms" },
      { key: "C", text: "30,000 ms" },
      { key: "D", text: "60,000 ms" },
    ],
    answer: "B",
    explanation:
      "The maximum CPU time for synchronous Apex is 10,000 ms (10 seconds). Asynchronous contexts have a 60,000 ms limit.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-22",
    question: "How many SOSL queries are allowed per transaction?",
    options: [
      { key: "A", text: "10" },
      { key: "B", text: "20" },
      { key: "C", text: "50" },
      { key: "D", text: "100" },
    ],
    answer: "B",
    explanation:
      "The maximum number of SOSL queries allowed per Apex transaction is 20.",
    category: "governor-limits",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-23",
    question:
      "What is the correct approach for testing an Apex class that makes HTTP callouts?",
    options: [
      { key: "A", text: "Extends HttpCalloutMock" },
      { key: "B", text: "Implements the HttpCalloutMock interface" },
      { key: "C", text: "Implements the WebserviceMock interface" },
      { key: "D", text: "Call Test.setCalloutMock() without a mock class" },
    ],
    answer: "B",
    explanation:
      "To test HTTP callouts, create a mock class that implements the HttpCalloutMock interface and its respond() method, then register it with Test.setMock().",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-24",
    question: "Which TWO statements about @testSetup are true?",
    options: [
      { key: "A", text: "Records created can be updated by test methods" },
      {
        key: "B",
        text: "Not supported when SeeAllData=true is set",
      },
      {
        key: "C",
        text: "Runs once and data is shared across all test methods",
      },
      {
        key: "D",
        text: "Executes once per test method with separate governor limits",
      },
    ],
    answer: ["B", "D"],
    explanation:
      "@testSetup is incompatible with SeeAllData=true. The setup method executes once per test method (the data is rolled back and recreated), and each test method gets its own governor limits context.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-25",
    question:
      "A test for a Queueable job runs but assertions fail because the job hasn't completed. What is the fix?",
    options: [
      { key: "A", text: "Use @future instead of Queueable" },
      {
        key: "B",
        text: "Wrap the enqueueJob call in Test.startTest()/stopTest(), then assert after stopTest()",
      },
      { key: "C", text: "Use System.sleep() to wait for completion" },
      { key: "D", text: "Query AsyncApexJob to check status" },
    ],
    answer: "B",
    explanation:
      "Test.stopTest() forces all asynchronous jobs (including Queueable) enqueued after startTest() to execute synchronously before returning, ensuring assertions run after the job completes.",
    category: "testing/async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-26",
    question:
      "What is the minimum code coverage percentage required for production deployment?",
    options: [
      { key: "A", text: "50%" },
      { key: "B", text: "65%" },
      { key: "C", text: "75%" },
      { key: "D", text: "80%" },
    ],
    answer: "C",
    explanation:
      "Salesforce requires at least 75% overall code coverage across all Apex classes and triggers to deploy to production.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-27",
    question:
      "A test method fails because it relies on existing org data. Which annotation allows access to real org data in tests?",
    options: [
      { key: "A", text: "@isTest(SeeAllData=true)" },
      { key: "B", text: "@isTest(SeeAllData=false)" },
      { key: "C", text: "@testSetup" },
      { key: "D", text: "@TestVisible" },
    ],
    answer: "A",
    explanation:
      "@isTest(SeeAllData=true) allows a test class or method to access all data in the org. This is generally discouraged as it makes tests dependent on org state.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-28",
    question:
      'A test fails with "Uncommitted work pending" when mixing DML and callouts. What is the correct fix?',
    options: [
      {
        key: "A",
        text: "Move the callout before all DML operations",
      },
      {
        key: "B",
        text: "Insert records before Test.startTest(), put the callout after Test.startTest()",
      },
      { key: "C", text: "Put the DML inside the mock's respond() method" },
      { key: "D", text: "Use Database.setSavepoint() before the callout" },
    ],
    answer: "B",
    explanation:
      "In tests, DML before a callout causes 'Uncommitted work pending'. Moving DML setup before startTest() and the callout after startTest() separates them into different transaction contexts.",
    category: "testing",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-29",
    question: "Which statement about @future methods is TRUE?",
    options: [
      { key: "A", text: "They can accept sObject parameters" },
      { key: "B", text: "They must be static and return void" },
      { key: "C", text: "They can call other @future methods" },
      { key: "D", text: "They execute synchronously when called from tests" },
    ],
    answer: "B",
    explanation:
      "@future methods must be static and return void. They cannot accept sObject types as parameters (use IDs instead), cannot call other @future methods, and execute asynchronously even in tests.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-30",
    question:
      "What is the correct approach to make an HTTP callout from a trigger?",
    options: [
      { key: "A", text: "Call Http.send() directly inside the trigger" },
      {
        key: "B",
        text: "Call a @future(callout=true) method from the trigger",
      },
      { key: "C", text: "Start a Batch Apex job from the trigger" },
      { key: "D", text: "Make the callout in a before trigger" },
    ],
    answer: "B",
    explanation:
      "Triggers cannot make synchronous callouts. You must use @future(callout=true) to perform the callout asynchronously after the trigger transaction completes.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-31",
    question: "What are two ways to check the status of a Queueable Apex job?",
    options: [
      { key: "A", text: "Apex Flex Queue (in Apex code)" },
      { key: "B", text: "Apex Flex Queue in Setup UI" },
      { key: "C", text: "Query AsyncApexJob object" },
      { key: "D", text: "Query CronTrigger object" },
    ],
    answer: ["B", "C"],
    explanation:
      "Queueable job status can be checked via the Apex Flex Queue page in Setup, or by querying the AsyncApexJob sObject with the job ID returned by System.enqueueJob().",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-32",
    question:
      "What is the maximum number of Queueable jobs that can be enqueued per transaction?",
    options: [
      { key: "A", text: "5" },
      { key: "B", text: "10" },
      { key: "C", text: "50" },
      { key: "D", text: "100" },
    ],
    answer: "C",
    explanation:
      "Up to 50 Queueable jobs can be added to the queue per transaction using System.enqueueJob().",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-33",
    question:
      "You need to process 5 million records every night. What is the best asynchronous Apex type?",
    options: [
      { key: "A", text: "@future method" },
      { key: "B", text: "Queueable Apex" },
      { key: "C", text: "Batch Apex" },
      { key: "D", text: "Scheduled Apex alone (without Batch)" },
    ],
    answer: "C",
    explanation:
      "Batch Apex is designed to process large volumes of records by breaking them into manageable chunks, each with its own governor limits. It can process up to 50 million records.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-34",
    question:
      "A Batch Apex job processes 1,234 records with the default batch size of 200. How many times does execute() get called?",
    options: [
      { key: "A", text: "6" },
      { key: "B", text: "7" },
      { key: "C", text: "8" },
      { key: "D", text: "1,234" },
    ],
    answer: "B",
    explanation:
      "1,234 ÷ 200 = 6.17, which rounds up to 7 batches. The batches are: 6 × 200 records + 1 × 34 records = 7 execute() calls.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-35",
    question: "Which TWO statements about Batch Apex governor limits are true?",
    options: [
      {
        key: "A",
        text: "Governor limits are shared across all batch executions",
      },
      { key: "B", text: "Governor limits reset for each execute() call" },
      { key: "C", text: "Limits are relaxed in the start() method" },
      {
        key: "D",
        text: "Can process up to 50 million records using QueryLocator",
      },
    ],
    answer: ["B", "D"],
    explanation:
      "Each execute() invocation runs in its own execution context with fresh governor limits. Database.QueryLocator in start() can return up to 50 million records, bypassing the normal 50,000 SOQL row limit.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-36",
    question:
      "Can a Batch Apex class call Database.executeBatch() from within its execute() method?",
    options: [
      { key: "A", text: "Yes, it is recommended for chaining batches" },
      {
        key: "B",
        text: "No — Database.executeBatch() cannot be called from start(), execute(), or @future methods",
      },
      { key: "C", text: "Yes, if the class implements Database.Stateful" },
      {
        key: "D",
        text: "No, but System.enqueueJob() can be called unlimited times",
      },
    ],
    answer: "B",
    explanation:
      "Database.executeBatch() cannot be called from within Batch Apex start(), execute(), or finish() methods, nor from @future methods. Use finish() to chain batches instead.",
    category: "async",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-37",
    question:
      "What interface must a Batch Apex class implement to maintain a running count across multiple batch executions?",
    options: [
      { key: "A", text: "Database.Batchable" },
      { key: "B", text: "Database.Stateful" },
      { key: "C", text: "Database.AllowsCallouts" },
      { key: "D", text: "Schedulable" },
    ],
    answer: "B",
    explanation:
      "Database.Stateful allows instance variables to maintain their values across execute() invocations. Without it, instance variables reset to their initial values for each batch chunk.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-38",
    question: "Which statement about Scheduled Apex is TRUE?",
    options: [
      { key: "A", text: "Synchronous callouts are allowed" },
      { key: "B", text: "Maximum 100 scheduled jobs simultaneously" },
      { key: "C", text: "Uses the Queueable interface" },
      { key: "D", text: "System.schedule() returns an AsyncApexJob ID" },
    ],
    answer: "B",
    explanation:
      "A maximum of 100 scheduled Apex jobs can exist simultaneously in an org. Scheduled Apex implements the Schedulable interface, not Queueable.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-39",
    question: "What are two advantages of Queueable Apex over @future methods?",
    options: [
      {
        key: "A",
        text: "Accepts sObjects and other complex data types as parameters",
      },
      { key: "B", text: "Returns a job ID that can be monitored" },
      { key: "C", text: "No limit on chaining jobs" },
      { key: "D", text: "Supports callouts without any additional interface" },
    ],
    answer: ["A", "B"],
    explanation:
      "Queueable Apex accepts complex types including sObjects as parameters (unlike @future which only accepts primitives), and System.enqueueJob() returns a job ID for monitoring via AsyncApexJob.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-40",
    question:
      "What happens when you call System.enqueueJob() multiple times within a single Batch Apex execute() method?",
    options: [
      { key: "A", text: "All calls succeed and all jobs are queued" },
      {
        key: "B",
        text: "Only the first call succeeds; subsequent calls throw LimitException",
      },
      { key: "C", text: "Jobs are queued after the batch completes" },
      { key: "D", text: "Compilation error" },
    ],
    answer: "B",
    explanation:
      "Within a Batch Apex execute() method, only one System.enqueueJob() call is allowed. Additional calls will throw a LimitException.",
    category: "async",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-41",
    question:
      "Which two methods can be used to execute unit tests programmatically?",
    options: [
      { key: "A", text: "Tooling API" },
      { key: "B", text: "Developer Console" },
      { key: "C", text: "Bulk API" },
      { key: "D", text: "Metadata API" },
    ],
    answer: ["A", "B"],
    explanation:
      "Tests can be run programmatically via the Tooling API (RunTestsAsynchronous/RunTestsSynchronous endpoints) and interactively through the Developer Console.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "apex-42",
    question:
      "How do you load test data from a CSV file stored as a static resource?",
    options: [
      { key: "A", text: "Anonymous Apex execution" },
      { key: "B", text: "Test.loadData()" },
      { key: "C", text: "SOQL query for existing data" },
      { key: "D", text: "JSON parsing from Documents" },
    ],
    answer: "B",
    explanation:
      "Test.loadData(SObjectType, staticResourceName) loads records from a CSV static resource into the test context, creating records of the specified sObject type.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-43",
    question: "Which of the following is NOT possible in a test method?",
    options: [
      { key: "A", text: "System.setCreatedDate()" },
      { key: "B", text: "Making a live HTTP callout" },
      { key: "C", text: "DML statements" },
      { key: "D", text: "System.runAs()" },
    ],
    answer: "B",
    explanation:
      "Live HTTP callouts are not allowed in test methods unless Test.isRunningTest() is used as a guard in production code. All callouts in tests must use mock implementations.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-44",
    question:
      "Which type of variable maintains its value for an entire transaction and is shared across multiple trigger invocations?",
    options: [
      { key: "A", text: "Member variable directly on the trigger" },
      { key: "B", text: "Private non-static variable on a helper class" },
      { key: "C", text: "Public static variable on a handler class" },
      { key: "D", text: "Static final constant" },
    ],
    answer: "C",
    explanation:
      "Public static variables on a class maintain their value for the entire transaction and are shared across all code executing in that transaction, including multiple trigger invocations.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-45",
    question:
      "What is the output of a do-while loop with i=0 and the condition i<0?",
    options: [
      { key: "A", text: "Outputs 0" },
      { key: "B", text: "Executes once (outputs 1 iteration)" },
      { key: "C", text: "Infinite loop" },
      { key: "D", text: "Compile error" },
    ],
    answer: "B",
    explanation:
      "A do-while loop always executes its body at least once before checking the condition. With i=0 and condition i<0, the body executes once (i becomes 1), then the condition 0<0 is false and the loop exits.",
    category: "DML/SOQL",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-46",
    question:
      "Given: `List<Account> accs = [SELECT Id FROM Account LIMIT 1]; Account a = accs[0];` — what happens on an empty org?",
    options: [
      { key: "A", text: "NullPointerException" },
      { key: "B", text: "QueryException" },
      { key: "C", text: "a is null" },
      {
        key: "D",
        text: "Empty list is returned; accessing index 0 throws ListException",
      },
    ],
    answer: "D",
    explanation:
      "SOQL queries always return a List, never null. On an empty org, accs is an empty list. Accessing accs[0] throws a ListException: List index out of bounds.",
    category: "SOQL",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-47",
    question:
      "A test method fails unexpectedly in the developer sandbox but not in full sandbox. What is a valid reason?",
    options: [
      { key: "A", text: "Syntax error in the test method" },
      { key: "B", text: "Test relies on specific sandbox data" },
      { key: "C", text: "Test calls a @future method" },
      { key: "D", text: "Test doesn't use System.runAs()" },
    ],
    answer: "B",
    explanation:
      "Tests that rely on existing org data (without @isTest(SeeAllData=true) or proper test data setup) may fail in environments where that specific data doesn't exist.",
    category: "testing",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-48",
    question:
      "A test enqueues a chained Queueable job but the second job's work is not reflected after stopTest(). Why?",
    options: [
      {
        key: "A",
        text: "Needs a separate startTest()/stopTest() block",
      },
      {
        key: "B",
        text: "Only the first level of Queueable chaining executes during stopTest()",
      },
      { key: "C", text: "Chained Queueables are not supported in tests" },
      { key: "D", text: "enqueueJob() throws an exception in test context" },
    ],
    answer: "B",
    explanation:
      "Test.stopTest() only forces the first level of queued jobs to execute. Jobs chained from within a Queueable's execute() method do not run during stopTest() in tests.",
    category: "testing/async",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-49",
    question:
      "What happens when you try to call a @future method from another @future method?",
    options: [
      { key: "A", text: "Executes immediately after the first completes" },
      { key: "B", text: "Is queued to run after the first future completes" },
      { key: "C", text: "Throws a CalloutException" },
      { key: "D", text: "Throws an AsyncException at runtime" },
    ],
    answer: "D",
    explanation:
      'Calling a @future method from another @future method throws a System.AsyncException: "Future methods cannot be called from a future or batch method."',
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-50",
    question:
      "What is the best approach to prevent trigger logic from executing during a mass Data Loader operation?",
    options: [
      {
        key: "A",
        text: "Filter using Trigger.size to detect bulk operations",
      },
      { key: "B", text: "Use a Custom Setting Boolean bypass flag" },
      { key: "C", text: "@TestVisible annotation on the trigger handler" },
      { key: "D", text: "Check user profile in the trigger" },
    ],
    answer: "B",
    explanation:
      "A Custom Setting (Hierarchy or List) can store a bypass flag that admins toggle before/after Data Loader operations. The trigger checks this setting and short-circuits when enabled.",
    category: "trigger",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-51",
    question:
      "A class declared `with sharing` queries Accounts. What records does it return?",
    options: [
      { key: "A", text: "All records in the org" },
      { key: "B", text: "Only records the running user has access to" },
      { key: "C", text: "Records based on the admin's sharing rules" },
      { key: "D", text: "Only records owned by the running user" },
    ],
    answer: "B",
    explanation:
      "with sharing enforces the running user's record-level sharing rules (OWD, sharing rules, manual sharing, role hierarchy). The user sees only records they are authorized to access.",
    category: "DML/SOQL",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-52",
    question:
      "When querying a Big Object with SOQL, what requirement applies to indexed fields in the WHERE clause?",
    options: [
      { key: "A", text: "WHERE clause must use LIKE for indexed fields" },
      {
        key: "B",
        text: "Must use exact match (=) on indexed fields in defined index order",
      },
      { key: "C", text: "Must include ORDER BY on indexed fields" },
      { key: "D", text: "Must include LIMIT clause" },
    ],
    answer: "B",
    explanation:
      "Big Object queries require exact equality (=) filters on indexed fields, applied in the order they are defined in the index. Range operators and non-leading index fields are not supported.",
    category: "SOQL",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-53",
    question:
      "A Batch Apex class needs to make HTTP callouts in execute(). What interface(s) must it implement?",
    options: [
      { key: "A", text: "Database.Batchable only" },
      { key: "B", text: "Database.Batchable and Database.Stateful" },
      {
        key: "C",
        text: "Database.Batchable and Database.AllowsCallouts",
      },
      { key: "D", text: "Database.Batchable and Schedulable" },
    ],
    answer: "C",
    explanation:
      "To make HTTP callouts from a Batch Apex execute() method, the class must implement both Database.Batchable and Database.AllowsCallouts.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-54",
    question:
      "What happens when Database.executeBatch() is called from a before-insert trigger?",
    options: [
      { key: "A", text: "The batch job is queued normally" },
      { key: "B", text: "Runs synchronously within the trigger context" },
      {
        key: "C",
        text: 'Throws "Uncommitted work pending" exception',
      },
      { key: "D", text: "Processes only the first record" },
    ],
    answer: "C",
    explanation:
      'Calling Database.executeBatch() from a trigger (or any context with uncommitted DML work) throws a System.AsyncException: "Database.executeBatch cannot be called from a trigger."',
    category: "async/trigger",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-55",
    question:
      "Which cron expression correctly schedules a job for every Monday at 8:00 AM?",
    options: [
      { key: "A", text: "'0 8 * * MON'" },
      { key: "B", text: "'0 0 8 ? * MON'" },
      { key: "C", text: "'0 0 8 * * 2'" },
      { key: "D", text: "'8 0 0 ? * MON'" },
    ],
    answer: "B",
    explanation:
      "Salesforce cron syntax is: Seconds Minutes Hours Day-of-month Month Day-of-week [Year]. '0 0 8 ? * MON' means: second 0, minute 0, hour 8, any day-of-month (?), any month, Monday.",
    category: "async",
    domain: "apex",
    difficulty: "PD1",
  },
  {
    id: "apex-56",
    question:
      "Visualforce ViewState errors appear in production but not sandbox. What is the most likely fix?",
    options: [
      { key: "A", text: "Governor limit differences between environments" },
      {
        key: "B",
        text: "Mark non-essential properties as transient to reduce ViewState size",
      },
      { key: "C", text: "Make properties private instead of public" },
      { key: "D", text: "Check user profile access to the page" },
    ],
    answer: "B",
    explanation:
      "ViewState is limited to 170 KB in production. Properties that don't need to persist across postbacks should be marked `transient` to exclude them from ViewState and reduce its size.",
    category: "DML",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-57",
    question:
      "Code updates records then makes an HTTP callout, causing 'Uncommitted work pending' error. What is the correct fix?",
    options: [
      { key: "A", text: "Remove the savepoint before the callout" },
      { key: "B", text: "Use @InvocableMethod annotation" },
      {
        key: "C",
        text: "Move the callout to a @future(callout=true) method",
      },
      { key: "D", text: "Move the callout below the catch block" },
    ],
    answer: "C",
    explanation:
      "Salesforce does not allow HTTP callouts when there is pending uncommitted DML work. Moving the callout to a @future(callout=true) method defers it to after the current transaction commits.",
    category: "async/DML",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-58",
    question:
      "A test fails with 'Methods defined as TestMethod do not support Web service callouts'. What is the correct fix sequence?",
    options: [
      {
        key: "A",
        text: "Call Test.startTest() before callout, Test.setMock()/stopTest() after",
      },
      {
        key: "B",
        text: "Call Test.startTest() + Test.setMock() before the callout, then Test.stopTest() after",
      },
      {
        key: "C",
        text: "Use Test.isRunningTest() guard in production code",
      },
      { key: "D", text: "Only wrap in Test.startTest()/stopTest()" },
    ],
    answer: "B",
    explanation:
      "Test.setMock() must be called before the code that makes the callout. The correct sequence is: Test.startTest() → Test.setMock() → code that triggers callout → Test.stopTest().",
    category: "testing",
    domain: "apex",
    difficulty: "PD2",
  },
  {
    id: "apex-59",
    question: "Which TWO approaches correctly implement Apex Managed Sharing?",
    options: [
      {
        key: "A",
        text: "Insert __Share records in an after-insert trigger",
      },
      {
        key: "B",
        text: "Insert __Share records in a before-insert trigger",
      },
      {
        key: "C",
        text: "DML share operations on standard object Share records",
      },
      { key: "D", text: "@SharingReason annotation on the class" },
    ],
    answer: ["A", "C"],
    explanation:
      "Apex Managed Sharing requires inserting Share records (__Share for custom objects) in after-insert triggers (parent Id available) and via DML on standard object Share sObjects (e.g., AccountShare).",
    category: "trigger/DML",
    domain: "apex",
    difficulty: "PD2",
    multiSelect: true,
  },
  {
    id: "apex-60",
    question:
      "Which annotation makes an Apex method callable from a Flow that passes in a collection of sObjects?",
    options: [
      { key: "A", text: "@AuraEnabled" },
      { key: "B", text: "@RemoteAction" },
      { key: "C", text: "@InvocableMethod" },
      { key: "D", text: "@future" },
    ],
    answer: "C",
    explanation:
      "@InvocableMethod exposes an Apex method to Flow, Process Builder, and the REST API. It supports List parameters, including List<SObject>, making it suitable for bulk sObject collection processing.",
    category: "DML",
    domain: "apex",
    difficulty: "PD1",
  },
];
