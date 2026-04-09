import type { QuizQuestion } from "./types";

export const soqlSecurityQuestions: QuizQuestion[] = [
  // SOQL
  {
    id: "soql-1",
    question:
      "You write a for loop that iterates over 150 Opportunity records and executes a SOQL query inside each iteration. What is the outcome?",
    options: [
      { key: "A", text: "Runs fine — Apex handles it automatically" },
      { key: "B", text: "LimitException: Too many SOQL queries (100)" },
      { key: "C", text: "Silently skips queries after the 100th iteration" },
      { key: "D", text: "Apex auto-batches the queries" },
    ],
    answer: "B",
    explanation:
      "Apex enforces a governor limit of 100 SOQL queries per transaction. A SOQL query inside a for loop over 150 records will trigger a LimitException on the 101st query.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-2",
    question:
      "Which SOQL query correctly retrieves a Contact's name along with its parent Account name (child-to-parent relationship)?",
    options: [
      { key: "A", text: "SELECT Id, Name, Account.Name FROM Contact" },
      {
        key: "B",
        text: "SELECT Id, Name, (SELECT Name FROM Account) FROM Contact",
      },
      {
        key: "C",
        text: "SELECT Id, Name FROM Contact JOIN Account ON AccountId",
      },
      { key: "D", text: "SELECT Id, Name, AccountId.Name FROM Contact" },
    ],
    answer: "A",
    explanation:
      "Child-to-parent traversal in SOQL uses dot notation directly in the SELECT clause: Account.Name. No subquery is needed for parent fields.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-3",
    question:
      "Which query correctly retrieves Accounts with their related Contacts (parent-to-child relationship)?",
    options: [
      { key: "A", text: "SELECT Id, Contacts.Name FROM Account" },
      {
        key: "B",
        text: "SELECT Id, Name, (SELECT Id, Name FROM Contacts) FROM Account",
      },
      {
        key: "C",
        text: "SELECT Id, Name, (SELECT Id, Name FROM Contact) FROM Account",
      },
      {
        key: "D",
        text: "SELECT Id, Name FROM Account JOIN Contact ON AccountId",
      },
    ],
    answer: "B",
    explanation:
      "Parent-to-child subqueries use the relationship name (plural), not the object API name. For Account→Contact, the relationship name is 'Contacts' (not 'Contact').",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-4",
    question:
      "You need to count Accounts grouped by Industry and only show groups with more than 5 records. Which SOQL clause is correct?",
    options: [
      { key: "A", text: "WHERE COUNT(Id) > 5 GROUP BY Industry" },
      { key: "B", text: "GROUP BY Industry HAVING COUNT(Id) > 5" },
      { key: "C", text: "GROUP BY Industry FILTER COUNT(Id) > 5" },
      { key: "D", text: "GROUP BY Industry HAVING Id > 5" },
    ],
    answer: "B",
    explanation:
      "HAVING filters aggregate results after GROUP BY. WHERE cannot be used with aggregate functions. The correct syntax is GROUP BY Industry HAVING COUNT(Id) > 5.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-5",
    question:
      "What is the maximum number of records returned by a single SOQL query in Apex?",
    options: [
      { key: "A", text: "10,000" },
      { key: "B", text: "50,000" },
      { key: "C", text: "200" },
      { key: "D", text: "1,000" },
    ],
    answer: "B",
    explanation:
      "A single SOQL query in Apex can return a maximum of 50,000 records. Exceeding this limit throws a QueryException.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-6",
    question:
      "Which TWO approaches correctly prevent SOQL injection when building dynamic queries?",
    options: [
      { key: "A", text: "Mark the method as @ReadOnly" },
      {
        key: "B",
        text: "Use String.escapeSingleQuotes() to sanitize user input",
      },
      { key: "C", text: "Use a regex to strip special characters" },
      { key: "D", text: "Use bind variables (:variable) in the query string" },
    ],
    answer: ["B", "D"],
    explanation:
      "escapeSingleQuotes() sanitizes string inputs by escaping single quotes. Bind variables (:variable) prevent injection by separating data from the query structure. Both are recommended Salesforce best practices.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "soql-7",
    question:
      "You need to search for a keyword across Account Name, Contact Name, and Opportunity Name simultaneously. What is the best approach?",
    options: [
      { key: "A", text: "Use SOQL with LIKE on each object separately" },
      { key: "B", text: "Use SOSL (Salesforce Object Search Language)" },
      {
        key: "C",
        text: "Execute three separate SOQL queries and merge results",
      },
      { key: "D", text: "Use a report with cross-object filters" },
    ],
    answer: "B",
    explanation:
      "SOSL is designed for full-text search across multiple objects and fields in a single query. It is more efficient than running multiple SOQL LIKE queries and returns results grouped by object.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-8",
    question:
      "You use Database.query() to execute a dynamic SOQL string. How do you ensure sharing rules are enforced?",
    options: [
      {
        key: "A",
        text: "Annotate the method with @AuraEnabled(cacheable=true)",
      },
      {
        key: "B",
        text: "Declare the enclosing class with the 'with sharing' keyword",
      },
      {
        key: "C",
        text: "Database.query() automatically enforces sharing for all users",
      },
      { key: "D", text: "Sharing is always auto-enforced in dynamic SOQL" },
    ],
    answer: "B",
    explanation:
      "Database.query() respects the sharing context of the class it runs in. To enforce sharing rules, the class must be declared 'with sharing'. Without it, the query runs without sharing enforcement.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-9",
    question: "What does a SOSL query return in Apex?",
    options: [
      { key: "A", text: "List<SObject>" },
      { key: "B", text: "Map<String, List<SObject>>" },
      { key: "C", text: "List<List<SObject>>" },
      { key: "D", text: "A single list ordered by relevance score" },
    ],
    answer: "C",
    explanation:
      "A SOSL query returns List<List<SObject>>. Each inner list contains the results for one searched object type. The outer list preserves the order of objects as specified in the RETURNING clause.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "soql-10",
    question:
      "Which static SOQL query correctly and safely uses a bind variable for filtering by country?",
    options: [
      {
        key: "A",
        text: "String query = 'SELECT Id FROM Account WHERE BillingCountry = ' + country; Database.query(query);",
      },
      {
        key: "B",
        text: "Database.query('SELECT Id FROM Account WHERE BillingCountry = :country');",
      },
      {
        key: "C",
        text: "[SELECT Id FROM Account WHERE BillingCountry = :country]",
      },
      {
        key: "D",
        text: "[SELECT Id FROM Account WHERE BillingCountry = country]",
      },
    ],
    answer: "C",
    explanation:
      "Static SOQL (inline bracket syntax) supports bind variables with the colon prefix (:country). This is safe and efficient. Bind variables in Database.query() string literals (option B) are NOT supported — the variable won't be evaluated.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },

  // SECURITY
  {
    id: "sec-1",
    question:
      "OWD for Opportunity is set to Private. Who can see an Opportunity record owned by a Sales Rep?",
    options: [
      { key: "A", text: "All users in the org" },
      { key: "B", text: "Only the record owner" },
      {
        key: "C",
        text: "The owner and all users above them in the Role Hierarchy",
      },
      { key: "D", text: "The owner and their direct manager only" },
    ],
    answer: "C",
    explanation:
      "With OWD set to Private, the record owner and all users above them in the Role Hierarchy can see the record. Role Hierarchy grants implicit access upward, not just to the direct manager.",
    category: "sharing",
    domain: "security",
    difficulty: "PD1",
  },
  {
    id: "sec-2",
    question:
      "Account OWD is set to Public Read Only. A Sales Rep wants to edit an Account they don't own. Which combination allows this?",
    options: [
      { key: "A", text: "Role Hierarchy access alone" },
      { key: "B", text: "A Sharing Rule granting Read/Write access" },
      { key: "C", text: "A Profile with Edit permission on Account" },
      {
        key: "D",
        text: "Both B (Sharing Rule Read/Write) and C (Profile Edit permission)",
      },
    ],
    answer: "D",
    explanation:
      "To edit a non-owned Account when OWD is Read Only, the user needs both: (1) object-level Edit permission via Profile/Permission Set, and (2) record-level access via Sharing Rule or Manual Share. Both are required.",
    category: "sharing",
    domain: "security",
    difficulty: "PD1",
  },
  {
    id: "sec-3",
    question: "Which statement about Sharing Rules is correct?",
    options: [
      { key: "A", text: "Sharing Rules can both grant and restrict access" },
      {
        key: "B",
        text: "Criteria-based Sharing Rules are based on record ownership",
      },
      {
        key: "C",
        text: "Owner-based Sharing Rules are based on field values on the record",
      },
      {
        key: "D",
        text: "Sharing Rules can only expand access, they never restrict it",
      },
    ],
    answer: "D",
    explanation:
      "Sharing Rules only open up access beyond what OWD provides — they cannot restrict access. Owner-based rules share based on who owns the record; criteria-based rules share based on field values.",
    category: "sharing",
    domain: "security",
    difficulty: "PD1",
  },
  {
    id: "sec-4",
    question:
      "An Apex class has no explicit sharing keyword (no 'with sharing' or 'without sharing'). How does it run?",
    options: [
      { key: "A", text: "Defaults to 'with sharing'" },
      { key: "B", text: "Defaults to 'without sharing'" },
      {
        key: "C",
        text: "Inherits the sharing context from the calling code",
      },
      { key: "D", text: "Causes a compile error" },
    ],
    answer: "C",
    explanation:
      "A class without an explicit sharing keyword inherits the sharing context of its caller. If called from a 'with sharing' context, it runs with sharing. This is subtly different from 'inherited sharing', which makes the intent explicit.",
    category: "sharing",
    domain: "security",
    difficulty: "PD2",
  },
  {
    id: "sec-5",
    question:
      "What is the difference between declaring a class 'without sharing' and bypassing Field-Level Security (FLS)?",
    options: [
      {
        key: "A",
        text: "'without sharing' bypasses both record sharing AND FLS",
      },
      {
        key: "B",
        text: "'without sharing' bypasses record-level sharing only, NOT FLS",
      },
      {
        key: "C",
        text: "'without sharing' only affects SOQL queries, not DML",
      },
      {
        key: "D",
        text: "Neither 'with sharing' nor 'without sharing' affects FLS — use stripInaccessible()",
      },
    ],
    answer: "B",
    explanation:
      "'without sharing' removes record-level visibility restrictions. It does NOT bypass FLS. To enforce or strip FLS in Apex, use Schema.DescribeFieldResult.isAccessible() or Security.stripInaccessible().",
    category: "sharing",
    domain: "security",
    difficulty: "PD2",
  },
  {
    id: "sec-6",
    question:
      "You want to create a custom 'Export Data' button visible only to a subset of users (not all users with the same Profile). What is the best approach?",
    options: [
      { key: "A", text: "Create a new Profile for those users" },
      {
        key: "B",
        text: "Create a Custom Permission and assign it via a Permission Set",
      },
      { key: "C", text: "Set the OWD to grant export access" },
      { key: "D", text: "Use a Sharing Rule targeting those users" },
    ],
    answer: "B",
    explanation:
      "Custom Permissions are the correct tool for feature-level access control (like showing/hiding a button). They are assigned via Permission Sets, allowing granular assignment without creating new Profiles.",
    category: "sharing",
    domain: "security",
    difficulty: "PD1",
  },
  {
    id: "sec-7",
    question:
      "A trigger fires on Opportunity update and calls a helper class that runs SOQL. How do you ensure sharing rules are enforced in that SOQL?",
    options: [
      { key: "A", text: "Add 'with sharing' keyword directly to the trigger" },
      {
        key: "B",
        text: "Delegate the query to a helper class declared 'with sharing'",
      },
      {
        key: "C",
        text: "Use Database.query() — it automatically enforces sharing",
      },
      {
        key: "D",
        text: "Triggers always run in user mode so sharing is auto-enforced",
      },
    ],
    answer: "B",
    explanation:
      "Triggers do not support the 'with sharing' or 'without sharing' keywords. To enforce sharing within trigger logic, delegate the SOQL to a helper class explicitly declared 'with sharing'.",
    category: "sharing",
    domain: "security",
    difficulty: "PD2",
  },
  {
    id: "sec-8",
    question:
      "Which TWO statements about Profiles vs Permission Sets are correct?",
    options: [
      { key: "A", text: "Each user has exactly one Profile" },
      { key: "B", text: "A user can have multiple Profiles assigned" },
      {
        key: "C",
        text: "Permission Sets can both grant and revoke permissions",
      },
      {
        key: "D",
        text: "Profiles define baseline permissions; Permission Sets extend them",
      },
    ],
    answer: ["A", "D"],
    explanation:
      "Each user has exactly one Profile (A). Permission Sets are additive — they can only grant additional permissions, not restrict what the Profile grants (D). Option C is incorrect: Permission Sets cannot revoke Profile permissions.",
    category: "sharing",
    domain: "security",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "sec-9",
    question:
      "In Apex, how do you programmatically check whether the running user has read access to the Account.AnnualRevenue field before displaying it?",
    options: [
      { key: "A", text: "Declare the class 'with sharing'" },
      {
        key: "B",
        text: "Use Schema.SObjectType.Account.fields.AnnualRevenue.getDescribe().isAccessible()",
      },
      {
        key: "C",
        text: "Add WITH SECURITY_ENFORCED to the SOQL query for DML",
      },
      {
        key: "D",
        text: "FLS is automatically enforced in all Apex contexts",
      },
    ],
    answer: "B",
    explanation:
      "Field-Level Security must be explicitly checked in Apex using Schema.DescribeFieldResult.isAccessible(). 'with sharing' only controls record visibility, not FLS. WITH SECURITY_ENFORCED applies to SOQL field reads, not DML.",
    category: "sharing",
    domain: "security",
    difficulty: "PD2",
  },
  {
    id: "sec-10",
    question:
      "What is the benefit of using 'inherited sharing' explicitly over simply omitting the sharing keyword?",
    options: [
      { key: "A", text: "It makes the class run faster" },
      {
        key: "B",
        text: "It explicitly documents the intent, making the code auditable and clear",
      },
      {
        key: "C",
        text: "It applies the most restrictive sharing context available",
      },
      {
        key: "D",
        text: "It dynamically switches between 'with' and 'without' sharing at runtime",
      },
    ],
    answer: "B",
    explanation:
      "'inherited sharing' behaves the same as omitting the keyword (inherits caller's context), but makes the intent explicit in the code. This improves auditability during security reviews and clarifies developer intent.",
    category: "sharing",
    domain: "security",
    difficulty: "PD2",
  },

  // DEPLOYMENT
  {
    id: "deploy-1",
    question:
      "What is the minimum code coverage requirement to deploy Apex code to a production org?",
    options: [
      { key: "A", text: "50% overall coverage" },
      {
        key: "B",
        text: "75% overall coverage and at least some coverage for every trigger",
      },
      { key: "C", text: "100% coverage for all newly deployed classes" },
      { key: "D", text: "75% coverage per individual class" },
    ],
    answer: "B",
    explanation:
      "Salesforce requires at least 75% overall code coverage across all Apex code in the org, and every trigger must have at least 1% coverage (i.e., at least one test must execute each trigger). The 75% is org-wide, not per class.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
  },
  {
    id: "deploy-2",
    question:
      "You need to remove a custom field from a target org as part of a deployment. Which tool supports destructive changes?",
    options: [
      { key: "A", text: "Change Sets" },
      {
        key: "B",
        text: "Metadata API with a destructiveChanges.xml manifest",
      },
      { key: "C", text: "Both Change Sets and Metadata API" },
      { key: "D", text: "Only Scratch Orgs support metadata deletion" },
    ],
    answer: "B",
    explanation:
      "Change Sets do not support destructive changes (deleting metadata). The Metadata API supports deletion via a destructiveChanges.xml file (or destructiveChangesPre.xml / destructiveChangesPost.xml) included in the deployment package.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
  },
  {
    id: "deploy-3",
    question:
      "Which sandbox type is most appropriate for User Acceptance Testing (UAT) when you need production-equivalent data volume and fidelity?",
    options: [
      { key: "A", text: "Developer Sandbox" },
      { key: "B", text: "Developer Pro Sandbox" },
      { key: "C", text: "Partial Copy Sandbox" },
      { key: "D", text: "Full Sandbox" },
    ],
    answer: "D",
    explanation:
      "A Full Sandbox is a complete copy of the production org including all data, making it ideal for UAT. Partial Copy includes a subset of data; Developer sandboxes have no production data copy.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
  },
  {
    id: "deploy-4",
    question:
      "When creating a Scratch Org with the Salesforce CLI, which file defines the org shape and features?",
    options: [
      { key: "A", text: "sfdx-project.json" },
      { key: "B", text: "package.xml" },
      { key: "C", text: "project-scratch-def.json" },
      { key: "D", text: "org-metadata.json" },
    ],
    answer: "C",
    explanation:
      "project-scratch-def.json is the Scratch Org definition file. It specifies the org edition, features, settings, and other configuration used when creating a Scratch Org. sfdx-project.json defines the project structure, not the org shape.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
  },
  {
    id: "deploy-5",
    question: "Which TWO are known limitations of Change Sets?",
    options: [
      {
        key: "A",
        text: "Change Sets can only deploy metadata, not data records",
      },
      { key: "B", text: "Change Sets work between any two arbitrary orgs" },
      {
        key: "C",
        text: "Change Sets require a Deployment Connection between orgs",
      },
      { key: "D", text: "Change Sets support destructive changes" },
      { key: "E", text: "Change Sets automatically run all Apex tests" },
    ],
    answer: ["A", "C"],
    explanation:
      "Change Sets have two key limitations: (A) they only move metadata, not data records, and (C) they require an established Deployment Connection between connected orgs (e.g., sandbox to production). They do not support destructive changes and don't automatically run all tests.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
    multiSelect: true,
  },
  {
    id: "deploy-6",
    question:
      "What is the key difference between Unlocked Packages and Managed Packages?",
    options: [
      {
        key: "A",
        text: "Unlocked Packages are for ISVs; Managed Packages are for internal teams",
      },
      {
        key: "B",
        text: "Managed Packages lock and obfuscate components for AppExchange distribution; Unlocked Packages allow post-install modification",
      },
      {
        key: "C",
        text: "Unlocked Packages require a namespace; Managed Packages do not",
      },
      {
        key: "D",
        text: "Both are identical once installed in the target org",
      },
    ],
    answer: "B",
    explanation:
      "Managed Packages lock the source code (for IP protection) and are used for AppExchange distribution. Unlocked Packages are open — subscribers can modify the metadata after installation. Unlocked Packages are the recommended approach for internal org development.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD2",
  },
  {
    id: "deploy-7",
    question:
      "Which Salesforce CLI command deploys source-format metadata from your local project to a connected org?",
    options: [
      { key: "A", text: "sf project retrieve start" },
      { key: "B", text: "sf project deploy start" },
      { key: "C", text: "sf org deploy push" },
      { key: "D", text: "sfdx force:source:convert" },
    ],
    answer: "B",
    explanation:
      "'sf project deploy start' deploys source-format metadata to a target org. 'sf project retrieve start' pulls metadata from the org. 'sfdx force:source:convert' converts to metadata API format. 'sf org push' is used specifically for Scratch Orgs.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD2",
  },
  {
    id: "deploy-8",
    question:
      "What is the primary purpose of wrapping test logic in Test.startTest() and Test.stopTest()?",
    options: [
      { key: "A", text: "To gain access to production data during testing" },
      {
        key: "B",
        text: "To reset governor limits for the tested code and force synchronous execution of async operations",
      },
      { key: "C", text: "To bypass FLS and sharing rules in test context" },
      { key: "D", text: "To enable HTTP callouts in test methods" },
    ],
    answer: "B",
    explanation:
      "Test.startTest() resets all governor limits so the code under test starts fresh. Test.stopTest() forces any asynchronous operations (like @future, queueable, batch) to execute synchronously before the test assertions run.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD1",
  },
  {
    id: "deploy-9",
    question:
      "Which combination of tools forms the foundation of source-driven development in Salesforce?",
    options: [
      {
        key: "A",
        text: "Change Sets + Full Sandbox + manual deployment",
      },
      {
        key: "B",
        text: "Salesforce DX (SFDX) + Git + Unlocked Packages + Scratch Orgs",
      },
      {
        key: "C",
        text: "Managed Packages + Developer Sandbox + ANT Migration Tool",
      },
      {
        key: "D",
        text: "Partial Copy Sandbox + Workflow Rules + Change Sets",
      },
    ],
    answer: "B",
    explanation:
      "Source-driven development relies on: SFDX CLI for metadata management, Git for version control, Unlocked Packages for modular deployment, and Scratch Orgs for isolated, reproducible development environments. This enables CI/CD pipelines.",
    category: "deployment",
    domain: "deployment",
    difficulty: "PD2",
  },

  // INTEGRATION
  {
    id: "int-1",
    question:
      "You need to send order data to a legacy SOAP system asynchronously. No response is needed. Which integration pattern is most appropriate?",
    options: [
      { key: "A", text: "Platform Events" },
      { key: "B", text: "Outbound Messages" },
      { key: "C", text: "REST callout via @future" },
      { key: "D", text: "Streaming API" },
    ],
    answer: "B",
    explanation:
      "Outbound Messages are designed for async, fire-and-forget SOAP integration. They are configured declaratively (no code), triggered by workflow rules, and send a SOAP message to an external endpoint without waiting for a response beyond an ACK.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-2",
    question:
      "An external system needs near-real-time notification whenever an Account record is updated in Salesforce, without writing Apex callout code. What is the best approach?",
    options: [
      { key: "A", text: "Platform Events" },
      { key: "B", text: "Change Data Capture (CDC)" },
      { key: "C", text: "Outbound Messaging via Workflow" },
      { key: "D", text: "Scheduled Batch Apex" },
    ],
    answer: "B",
    explanation:
      "Change Data Capture (CDC) automatically publishes change events whenever a record is created, updated, deleted, or undeleted. External systems subscribe via CometD or Pub/Sub API. No Apex code is needed — it's enabled declaratively.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-3",
    question: "How do you test an Apex class that makes HTTP callouts?",
    options: [
      { key: "A", text: "Real callouts are allowed in test context" },
      {
        key: "B",
        text: "Implement HttpCalloutMock and register it with Test.setMock()",
      },
      {
        key: "C",
        text: "Annotate the method with @future(callout=true) to enable test callouts",
      },
      { key: "D", text: "Call Test.enableCallouts() before the callout" },
    ],
    answer: "B",
    explanation:
      "Salesforce does not allow real HTTP callouts in test methods. You must create a class implementing HttpCalloutMock, define the mock response, and register it with Test.setMock(HttpCalloutMock.class, mockInstance) before the code under test runs.",
    category: "integration",
    domain: "integration",
    difficulty: "PD1",
  },
  {
    id: "int-4",
    question:
      "A trigger needs to make a callout to an external REST API when a record is saved. What is the required approach?",
    options: [
      {
        key: "A",
        text: "Call Http.send() directly inside the trigger body",
      },
      {
        key: "B",
        text: "Use an @future(callout=true) method called from the trigger",
      },
      {
        key: "C",
        text: "Publish a Platform Event from the trigger and handle the callout in a subscriber",
      },
      { key: "D", text: "Both B and C are valid approaches" },
    ],
    answer: "D",
    explanation:
      "Direct callouts from triggers are not allowed because triggers run in the same DML transaction. Both approaches work: @future(callout=true) executes asynchronously after the transaction, and Platform Events decouple the trigger from the callout entirely (processed by a separate subscriber).",
    category: "integration",
    domain: "integration",
    difficulty: "PD1",
  },
  {
    id: "int-5",
    question:
      "What is the primary advantage of using Named Credentials for external callouts?",
    options: [
      {
        key: "A",
        text: "Named Credentials eliminate the need for Remote Site Settings",
      },
      {
        key: "B",
        text: "Named Credentials merge the endpoint URL and authentication in one secure config, with no hardcoded credentials and native OAuth support",
      },
      {
        key: "C",
        text: "Named Credentials are required for all callouts when API version is 50+",
      },
      {
        key: "D",
        text: "Named Credentials automatically retry failed callouts",
      },
    ],
    answer: "B",
    explanation:
      "Named Credentials store the endpoint URL and authentication details (including OAuth flows) securely in Salesforce. Code references the Named Credential name (callout:MyService/path), eliminating hardcoded URLs, usernames, and passwords. They also handle OAuth token refresh automatically.",
    category: "integration",
    domain: "integration",
    difficulty: "PD1",
  },
  {
    id: "int-6",
    question:
      "You need to load 5 million records into Salesforce from an external system. Which API is best suited for this?",
    options: [
      { key: "A", text: "REST API with individual record inserts" },
      { key: "B", text: "SOAP Enterprise WSDL" },
      { key: "C", text: "Bulk API v2" },
      { key: "D", text: "Streaming API" },
    ],
    answer: "C",
    explanation:
      "Bulk API v2 is designed for loading or extracting large volumes of data (millions of records). It processes records asynchronously in batches, is optimized for throughput, and bypasses many single-transaction governor limits that REST/SOAP APIs are subject to.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-7",
    question:
      "Which TWO statements correctly distinguish Platform Events from Change Data Capture (CDC)?",
    options: [
      {
        key: "A",
        text: "Platform Events can be published by any process (Apex, Flow, external); CDC events are auto-generated by Salesforce on record changes",
      },
      {
        key: "B",
        text: "CDC requires a custom Apex trigger to generate change events",
      },
      {
        key: "C",
        text: "Platform Events support two-way communication; CDC is one-way (Salesforce → subscribers)",
      },
      {
        key: "D",
        text: "CDC events are retained for 24 hours; Platform Events for 72 hours",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "Platform Events are custom events publishable from anywhere (A). CDC events are automatically generated by the platform — no custom code required (A). Platform Events support both inbound and outbound messaging (two-way); CDC only streams outbound change notifications (C).",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
    multiSelect: true,
  },
  {
    id: "int-8",
    question:
      "You need to display data from an external ERP system in real-time on a Salesforce page without storing the data in Salesforce. Which integration pattern applies?",
    options: [
      { key: "A", text: "Batch Synchronization" },
      { key: "B", text: "Request and Reply" },
      { key: "C", text: "Data Virtualization" },
      { key: "D", text: "UI Update" },
    ],
    answer: "C",
    explanation:
      "Data Virtualization (also called Remote Call-In or real-time data mashup) retrieves and displays external data on demand without persisting it in Salesforce. Salesforce Connect with External Objects is the declarative implementation of this pattern.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-9",
    question:
      "An order is approved in Salesforce and must be sent to an ERP system. The ERP needs to acknowledge receipt and return an order confirmation number. Which integration pattern is correct?",
    options: [
      { key: "A", text: "Fire and Forget" },
      { key: "B", text: "Batch Synchronization" },
      { key: "C", text: "Request and Reply" },
      { key: "D", text: "UI Update" },
    ],
    answer: "C",
    explanation:
      "Request and Reply is used when Salesforce sends a request to an external system and waits for a synchronous response (the acknowledgment and confirmation number). Fire and Forget is used when no response is needed.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-10",
    question:
      "An enterprise system requires strict SOAP protocol with WS-Security headers and XML payloads. Which Salesforce API should you use?",
    options: [
      { key: "A", text: "REST API with JSON payloads" },
      { key: "B", text: "SOAP API with Enterprise or Partner WSDL" },
      { key: "C", text: "Bulk API" },
      { key: "D", text: "Platform Events" },
    ],
    answer: "B",
    explanation:
      "The SOAP API (Enterprise or Partner WSDL) is the correct choice when the external system requires SOAP protocol, WS-Security, and XML. The Enterprise WSDL is strongly typed to your org's schema; the Partner WSDL is generic and used by ISVs.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
  {
    id: "int-11",
    question:
      "When subscribing to a Platform Event channel, what does setting the ReplayId to -2 mean?",
    options: [
      {
        key: "A",
        text: "Subscribe to new events only (no replayed events)",
      },
      {
        key: "B",
        text: "Replay all retained events from the beginning of the retention window, then continue with new events",
      },
      { key: "C", text: "Resume from the last saved checkpoint" },
      { key: "D", text: "Disable event replay entirely" },
    ],
    answer: "B",
    explanation:
      "ReplayId -2 means 'replay all': the subscriber receives all events retained in the 72-hour retention window, then continues receiving new events. ReplayId -1 means 'new only' (no replay). A specific positive ReplayId replays from that event forward.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },

  // BONUS
  {
    id: "bonus-1",
    question:
      "A developer needs to query all Accounts modified in the last 7 days. Which SOQL date literal is correct?",
    options: [
      { key: "A", text: "WHERE LastModifiedDate > LAST_7_DAYS" },
      { key: "B", text: "WHERE LastModifiedDate = LAST_N_DAYS:7" },
      { key: "C", text: "WHERE LastModifiedDate >= LAST_N_DAYS:7" },
      { key: "D", text: "WHERE LastModifiedDate IN LAST_7_DAYS" },
    ],
    answer: "B",
    explanation:
      "LAST_N_DAYS:7 is the correct SOQL date literal. It evaluates to a range covering the past 7 days. Using '=' with a date literal range is syntactically correct in SOQL and returns records within that range.",
    category: "soql",
    domain: "soql",
    difficulty: "PD1",
  },
  {
    id: "bonus-2",
    question:
      "You are designing a Salesforce integration where an external mobile app needs to authenticate users against Salesforce identity and access Salesforce data via REST. Which authentication flow is recommended?",
    options: [
      { key: "A", text: "Username-Password OAuth Flow" },
      { key: "B", text: "OAuth 2.0 User-Agent Flow" },
      { key: "C", text: "OAuth 2.0 Authorization Code Flow with PKCE" },
      { key: "D", text: "JWT Bearer Token Flow" },
    ],
    answer: "C",
    explanation:
      "The OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange) is the recommended flow for mobile and single-page apps. It prevents authorization code interception attacks without requiring a client secret, unlike the implicit/user-agent flow which is deprecated for security reasons.",
    category: "integration",
    domain: "integration",
    difficulty: "Integration-Arch",
  },
];
