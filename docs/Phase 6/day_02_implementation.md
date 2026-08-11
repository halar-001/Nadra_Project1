# Phase 6: SQL Validation, Security & Query Execution
## Day 2 Implementation: Zero-Trust Policy Engine

---

### 1. Daily Objectives
With the AST parsing foundation established in Day 1, the objective for Day 2 was to implement a rigorous, zero-trust security policy engine. The goal was to intercept the validated AST object and actively scan it for security violations or potentially hazardous query structures before they ever reach the target database.

---

### 2. Key Accomplishments

#### A. RBAC Table Blocking
- **Table Name Extraction**: Integrated `TablesNamesFinder` from the JSqlParser ecosystem to deeply traverse the AST and extract a unified list of every single table referenced in the AI's query (including `JOIN` statements and subqueries).
- **Hardcoded Security Guardrails (`PolicyEngine.java`)**: Implemented a strict rejection policy against sensitive system-level tables. If the AI attempts to query `users`, `roles`, `user_roles`, or `database_connections`, the Policy Engine instantly intercepts the query and throws a `PolicyViolationException` (returning a 403 Forbidden to the client).

#### B. Query Safety Limits
- **Automated Row Limiting**: To prevent accidental "Query of Death" scenarios (e.g., pulling 5 million records and crashing the server's JVM), the engine actively mutates the AST to enforce safety limits.
- **Dynamic LIMIT Injection**: Configured the `PolicyEngine` to intercept any `PlainSelect` object. If the AI forgot to include a `LIMIT` clause, or if the `LIMIT` exceeds 100, the engine forcefully injects or overwrites it with `LIMIT 100`.

---

### 3. Verification & Outcome
- Executed unit tests confirming that malicious queries disguised as nested subqueries attempting to access the `users` table are successfully trapped by the AST scanner.
- Verified that queries are correctly mutated with `LIMIT 100` constraints, ensuring high availability and protection against memory exhaustion.
