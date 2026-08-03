# 🤖 Enterprise AI Database Assistant

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)
![React](https://img.shields.io/badge/React-Vite-blue.svg)
![Status](https://img.shields.io/badge/Status-Phase_8_Complete-success.svg)
![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-orange.svg)
![Database](https://img.shields.io/badge/Storage-MySQL-blue.svg)
![Schema Architecture](https://img.shields.io/badge/Metadata-Universal_JDBC-indigo.svg)

An **Enterprise-grade AI Database Assistant** designed to dynamically inspect relational schemas, translate natural language into optimized SQL, validate queries, and securely execute analytical data retrieval across external databases. 

Developed as the inaugural full-stack project for the Nadra Internship Program by **Halar Khan** (Full-Stack / Backend Developer) and **Muhammad Taimoor Ajmal** (Frontend Developer).

---

## 🎯 Project Roadmap & Implementation Milestones

### Phase 1: Foundation & Architecture (COMPLETE)

This phase establishes the core architecture, foundational integrations, and global standards for both the frontend and backend applications over the first 3 days of development.

#### 📅 Day 1: Project Initialization & Persistence Setup
- **Backend Infrastructure:** Set up the foundational Spring Boot 3.x backend with Maven. Configured core dependencies: Spring Web, Spring Data JPA, H2 Database, Spring Security, and SpringDoc OpenAPI.
- **Frontend Infrastructure:** Initialized a fast Vite + React application, integrating TailwindCSS for a utility-first styling architecture.
- **Database Layer:** Designed the initial SQL schemas and created initial seed files (`schema.sql` and `seed.sql`) to prepare the data persistence layer.

#### 📅 Day 2: API Layout & Cross-Origin Handshakes
- **Backend Architecture:** Structured the core backend by implementing the Controller layer and Service layer abstractions.
- **API Documentation:** Successfully configured and verified interactive **Swagger UI** (`/swagger-ui/index.html`) for seamless API testing and exploration.
- **Health Verification:** Built the `GET /api/health` endpoint to verify backend stability and uptime.
- **CORS Integration:** Configured Cross-Origin Resource Sharing in `SecurityConfig.java` to allow the React frontend (`localhost:5173`) to securely interface with the Java backend (`localhost:8080`).
- **Automated Validation:** Ran a full-stack automated browser test verifying that the frontend UI successfully fetched and displayed real-time data from the backend APIs.

#### 📅 Day 3: Standardization & Error Governance
- **Unified API Responses:** Created a standardized `ApiResponse` DTO to securely encapsulate all API responses into predictable `{success, message, data}` blocks for safe frontend consumption.
- **Global Exception Handling:** Developed a `GlobalExceptionHandler` leveraging `@RestControllerAdvice` to seamlessly intercept and format internal Java exceptions, completely preventing stack traces from leaking to the client.
- **Configuration Modularization:** Abstracted configuration logic by establishing `ApplicationConfig` and `CorsConfig`, renamed Swagger to `OpenApiConfig`, and modularized `SecurityConfig`.
- **Framework Stability:** Safely downgraded to Spring Boot 3.3.4 (as per architecture specifications) to resolve compatibility bugs with `springdoc-openapi`.
- **End-to-End Verification:** Conducted rigorous automated testing ensuring that the Swagger UI and React Dashboard communicate seamlessly with backend endpoints.

---

### Phase 2: User Authentication & Security Infrastructure (COMPLETE)

This phase establishes a comprehensive, stateless authentication ecosystem supporting JWT verification filters, cryptographic password ciphering, self-service account governance, and Role-Based Access Control (RBAC).

#### 📅 Day 1: Identity Persistence & RBAC Domain Modeling
- **Database Identity Architecture**: Engineered secure `User` and `Role` JPA entities featuring explicit authorization hierarchies utilizing a formal enum (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_VIEWER`).
- **Many-to-Many Role Mapping**: Implemented bidirectional relational mapping across a junction table (`user_roles`) via `@JoinTable`, enabling dynamic multi-tier privilege assignment.
- **Identity Repositories & Security Bridge**: Developed `UserRepository` and `RoleRepository` equipped with fast email deduplication queries, and connected them directly to Spring Security's internal authentication framework via `UserDetailsServiceImpl`.

#### 📅 Day 2: Stateless Security Architecture, JWT Engine & Exception Governance
- **Cryptographic Password Ciphering**: Integrated Spring Security's `BCryptPasswordEncoder` bean into the core identity pipeline, guaranteeing zero plain-text storage of credentials.
- **JWT Token Ecosystem**: Designed `JwtService` using HMAC SHA-256 digital signing to generate tamper-proof authentication tokens bearing subject identification (`sub`), user IDs, and assigned role claims.
- **Stateless Request Interceptor**: Engineered `JwtAuthenticationFilter` extending `OncePerRequestFilter` to intercept inbound traffic, parse `Bearer` tokens, verify mathematical signatures, and securely populate Spring's `SecurityContextHolder` without persistent server session memory.
- **Domain Exception Translation**: Enhanced `GlobalExceptionHandler` to intercept security denials, failed logins, and email duplicates, transforming them into uniform JSON `ApiResponse` structures.

#### 📅 Day 3: Authentication APIs, Profile Governance & Frontend Integration
- **Frictionless Onboarding & Privilege Separation**: Deployed registration workflows (`POST /api/auth/register`) that immediately enable user accounts and assign default `ROLE_VIEWER` tiers, preventing unauthorized administrative escalation. Built secure login (`POST /api/auth/login`) dispatching JWT authorization packages.
- **Self-Service Account Endpoints**: Deployed endpoints for profile retrieval (`GET /api/auth/profile`), identity modification (`PUT /api/auth/profile`), and cryptographic credential rotation requiring current password verification (`PUT /api/auth/change-password`).
- **CORS Pipeline & Bootstrap Seeding**: Established global CORS policies (`CorsConfig`) and deployed a `DataInitializer` seeder that automatically provisions standard core roles and developer test accounts (`admin1@aidatabaseassistant.com`, etc.) on startup.
- **End-to-End Verification**: Successfully synchronized React `AuthContext` state managers and Axios token interceptors with backend security pipelines, confirming flawless full-stack authentication across browser sessions.

---

### Phase 3: Database Connection Management (Architecture V2) & MySQL Migration (COMPLETE)

This phase transitions central database persistence from H2 to MySQL and implements a zero-trust, completely stateless multi-database connection management architecture. Authenticated users can now test, encrypt, and manage credentials for multiple external databases without storing persistent connection state on the backend server.

#### 📅 Day 1: MySQL Migration & Tenant-Isolated Persistence
- **MySQL Core Transition**: Upgraded `application.yml` and `pom.xml` to point to production MySQL engines (`com.mysql.cj.jdbc.Driver` and `MySQLDialect`), utilizing parameterized environment variables (`${DB_URL}`, `${DB_USERNAME}`, `${DB_PASSWORD}`) for multi-stage deployments.
- **Relational Schema Design**: Engineered the `database_connections` SQL table formatted specifically to store external target database details (`connection_name`, `database_type`, `host`, `port`, `database_name`, `username`, `encrypted_password`) without any session memory columns.
- **JPA Mapping & Cascade Governance**: Implemented the `DatabaseConnection` JPA entity featuring `@CreationTimestamp` and `@UpdateTimestamp`, linked to user profiles via bidirectional One-to-Many cascading rules.
- **Zero-Trust Data Access**: Formulated `DatabaseConnectionRepository` to strictly mandate user ownership directly within query signatures (`findByIdAndUserId`), mathematically preventing Cross-Tenant Unauthorized Access at the data layer.

#### 📅 Day 2: AES-256 Security & Live JDBC Validator
- **Reversible AES-256 Encryption**: Engineered `EncryptionService` deploying symmetric `AES/ECB/PKCS5Padding` ciphering coupled with SHA-256 secret key derivation from `${security.encryption.secret}`. Guarantees raw passwords are never saved in plaintext or irreversibly hashed.
- **Zero-Exposure DTO Layer**: Constructed clean input/output contracts (`CreateConnectionRequest`, `UpdateConnectionRequest`, `ConnectionResponse`, etc.) guaranteed to strip and omit password fields entirely from outbound JSON payloads.
- **Dynamic JDBC Validator**: Implemented multi-dialect connection testing engines in `ConnectionService` supporting MySQL, PostgreSQL, SQL Server, Oracle, and H2. Configured 5-second login timeouts and explicit connection validity checks (`conn.isValid(2)`) to protect worker threads against unreachable endpoints.

#### 📅 Day 3: Stateless REST APIs, Admin Overview & E2E Validation
- **Authenticated CRUD Controller**: Exposed 6 standardized REST endpoints in `ConnectionController` protected by stateless JWT authorization filters and scoped to the authenticated `Principal`.
- **Stateless Dynamic Connection Engine**: Constructed `getDynamicJdbcConnection(Long connectionId, String userEmail)`—a zero-session utility for Phase 4 that extracts user identity, verifies ownership, decrypts passwords strictly in volatile memory, and yields an open JDBC socket on-the-fly.
- **Role-Protected Admin Overview**: Engineered an administrative overview feature (`GET /api/connections/admin/all`) secured via `@PreAuthorize("hasRole('ADMIN')")`, returning global database profiles bound with complete owner user details (`userId`, `userEmail`, and `userFullName`).
- **Automated Integration Testing**: Executed comprehensive automated test suites (`ConnectionManagementIntegrationTest`) completing with **100% BUILD SUCCESS**, validating encryption consistency, JDBC connectivity pings, duplicate name rejections, and strict tenant isolation security rules.

---

### Phase 4: Schema Management Module, Dynamic Inference & AI Selector (COMPLETE)

This critical milestone transforms the backend from simple socket connecting into an intelligent, vendor-neutral relational schema metadata engine. The system connects dynamically across external target databases, extracts architectural metadata without executing vendor-locked SQL queries, caches schemas in server RAM for 0ms retrieval, builds an inverted vocabulary keyword index, and intelligently prunes schemas for large language models (Phase 5).

#### 📅 Day 1: Structured Schema Metadata Domain Modeling
- **Domain Encapsulation over Strings**: Abandoned error-prone string formatting in favor of 6 robust Java domain models in `com.aidatabaseassistant.model.schema` (`DatabaseSchema`, `TableMetadata`, `ColumnMetadata`, `IndexMetadata`, `RelationshipMetadata`, and `RelationshipType`).
- **Table, View & Constraint Attributes**: Formatted structures capable of preserving both physical relational tables and virtual views, complete with helper lookup methods and embedded column/index collections. Column parameters strictly track data types, length boundaries, nullable flags, defaults, and auto-increment behavior.
- **Relational Linkage & Cardinality Taxonomy**: Established formal enumerations categorizing foreign key link dependencies into three cardinality tiers (`ONE_TO_ONE`, `ONE_TO_MANY`, and `MANY_TO_MANY`), tracking primary key parents against child references.

#### 📅 Day 2: Universal JDBC Metadata Reader & Relational Inference Engine
- **Vendor-Neutral Metadata Parser**: Built `SchemaReaderService` utilizing universal JDBC `DatabaseMetaData` across dynamic sockets without ever executing vendor-specific SQL scripts (e.g., zero `SHOW TABLES` or `information_schema` queries). Operates uniformly across MySQL, PostgreSQL, SQL Server, Oracle, and H2.
- **Active Database Catalog Scoping**: Engineered strict active catalog extraction (`jdbcConnection.getCatalog()`) bound directly as the primary filter across all metadata invocations (`getTables`, `getColumns`, `getPrimaryKeys`, `getIndexInfo`, `getImportedKeys`), preventing multi-database table scanning on MySQL engines.
- **Autonomous Cardinality Deduction**: Built intelligent algorithms that analyze imported keys against primary keys and non-unique index constraints to autonomously distinguish between `ONE_TO_ONE` and `ONE_TO_MANY` linkages.
- **Automated M2M Junction Bridge Scanner**: Engineered an advanced scanner that identifies intermediate bridging tables (such as `course_assignment` or `user_roles`) and automatically synthesizes direct `MANY_TO_MANY` relationships connecting parent entities entirely without external AI intervention!

#### 📅 Day 3: Thread-Safe Caching, Vocabulary Indexer, AI Selector & REST APIs
- **Zero-Latency Cache & Zero-Trust Security**: Built `SchemaCacheService` utilizing concurrent memory structures (`ConcurrentHashMap`) to serve repeat schema queries in **0ms** (`fromCache = true`), backed by explicit refresh eviction controls (`refreshSchema`). Embedded zero-trust tenant ownership validation (`connectionService.getConnectionById()`) prior to memory access to thwart Cross-Tenant RAM Inspection.
- **Inverted Vocabulary Keyword Indexer**: Integrated `SchemaIndexService` as an enterprise-grade upgrade. On database ingestion, an inverted dictionary is built mapping normalized word stems and domain synonyms (e.g., `"instructor" -> teachers`, `"pupil" -> students`) directly to target tables, providing an architectural runway for vector embeddings in Phase 5.
- **Intelligent AI Selector & Graph Bridge Finder**: Engineered `SchemaSelectorService` to prevent token exhaustion by pruning large 80+ table enterprise databases down to solely prompt-relevant entities. Features an automated relational graph traverser that ensures whenever two linked parent tables are selected, required intermediate junction tables are automatically attached for valid SQL JOIN generation!
- **Secured Web Controller & E2E Verification**: Exposed 3 stateless REST endpoints in `SchemaController` (`GET /api/schema/{id}`, `POST /api/schema/refresh/{id}`, and `POST /api/schema/select/{id}`) to power the visual Frontend Schema Explorer UI. Executed automated integration test suites (`SchemaManagementIntegrationTest`) achieving **100% BUILD SUCCESS** across metadata discovery, M2M deduction, zero-latency caching, synonym selection, and tenant isolation security.

---

### Phase 5: Dynamic Prompt Builder & AI Engine Integration (COMPLETE)

This final critical milestone transforms the backend into a fully autonomous, AI-driven Database Assistant. The system orchestrates multiple cutting-edge Large Language Models (LLMs) to dynamically translate user natural language queries into optimized, executable SQL operations by injecting the extracted architectural schema context.

#### 📅 Day 1: Multi-Provider LLM Architecture & Secure Identity
- **Vendor-Neutral AI Interfaces**: Created `LLMProvider` API contracts to decouple core business logic from specific AI vendors, allowing for infinite horizontal scalability of future LLMs.
- **Google Gemini & Groq Adapters**: Engineered dedicated HTTP REST adapters using Spring's `RestTemplate` to integrate Google's Gemini (1.5 Flash) and Groq's high-speed inference (Llama 3) models, managing complex JSON serialization and response extraction natively in Java.
- **Zero-Trust Key Management**: Configured Spring Boot `application.yml` to inject critical API secrets directly from external environment variables, satisfying strict GitHub Push Protection security rules and preventing hardcoded leakages.

#### 📅 Day 2: AI Orchestration, Failover Logic & Context Prompting
- **Resilient AI Orchestration**: Developed `LLMService` featuring intelligent, automated failover looping. The service prioritizes the primary LLM (Gemini) and autonomously fails over to the secondary provider (Groq) to ensure 100% uptime against API rate limits and network degradation.
- **Dynamic Context Injection**: Engineered `SqlGeneratorService` as the core Prompt Builder. It dynamically pulls the user's filtered target schema (Phase 4), synthesizes it into a highly token-optimized text block, and injects it into strict behavioral LLM prompts.
- **Regex SQL Sanitization**: Implemented robust regex extractors designed to actively strip unpredictable conversational hallucinations and markdown artifacts (e.g., ````sql...````) from the AI's output, isolating mathematically valid, pure SQL strings.

#### 📅 Day 3: REST API Wiring & End-to-End Test Automation
- **Stateless Chat Controller**: Wired the SQL generation orchestration engines directly into the frontend-facing `/api/chat` REST endpoint, managing inbound natural language queries and safely routing them through the backend security mesh.
- **Global Error Governance**: Enhanced `GlobalExceptionHandler` to safely intercept LLM timeouts and parsing failures, routing them out to the React frontend as sanitized, user-friendly `ApiResponse<T>` objects without stack trace leakages.
- **Mockito E2E Automation**: Delivered `SqlGeneratorServiceIntegrationTest` using custom `@TestConfiguration` and `@Primary` mocking to rigorously validate the entire pipeline (Schema Context -> Prompt -> AI Mock Response -> Regex Parse -> SQL Output). The suite completed with **100% BUILD SUCCESS**, officially concluding the Backend Development Lifecycle.

---

### Phase 6: SQL Validation, Security & Query Execution (COMPLETE)

This milestone introduces a mathematically rigorous Abstract Syntax Tree (AST) engine to validate and secure AI-generated SQL. The zero-trust execution pipeline prevents malicious data mutation, strictly blocks unauthorized access to system tables, and enforces safe execution limits against active tenant databases.

#### 📅 Day 1: JSqlParser & Syntax Validation
- **AST Integration**: Replaced brittle regex patterns by integrating `JSqlParser` (4.7) to build and traverse an Abstract Syntax Tree of the incoming AI-generated SQL.
- **Strict DML Blocking**: Engineered validations to instantly reject any operations that are not strictly `SELECT` statements (blocking `UPDATE`, `DELETE`, `DROP`).
- **Multi-Statement Rejection**: Designed safety checks to intercept and block chained SQL injections, throwing custom `SqlValidationException`s.

#### 📅 Day 2: Zero-Trust Policy Engine
- **RBAC Table Blocking (`PolicyEngine.java`)**: Utilized `TablesNamesFinder` to deeply scan the AST (including nested subqueries and joins) to forcefully reject any attempts to query internal system tables (e.g., `users`, `roles`), returning a 403 Forbidden.
- **Dynamic Safety Limits**: Protected the JVM from memory exhaustion by actively mutating the AST to forcefully inject or overwrite queries with a maximum `LIMIT 100` constraint before execution.

#### 📅 Day 3: Safe Execution & Result Formatting
- **Tenant Execution (`QueryExecutorService.java`)**: Executed the validated SQL against the user's specific external database securely, employing a strict 10-second timeout to kill hanging threads.
- **JSON Result Formatting (`ResultFormatter.java`)**: Engineered an intelligent parser using `ResultSetMetaData` to translate the raw JDBC `ResultSet` into a standardized, dynamic payload (`QueryResponse`) suitable for React Data Grids.
- **E2E Pipeline Orchestration**: Wired the complete end-to-end flow from schema injection, AI generation, AST validation, and policy enforcement to safe execution and JSON formatting, completing the backend lifecycle.

---

### Phase 7: AI Conversation Management & Chat System (COMPLETE)

This phase elevates the AI from a stateless SQL generator to a stateful conversational assistant. By persisting chat sessions and implementing a sliding-window message retention policy, the AI now understands complex conversational context without blowing up LLM token limits.

#### 📅 Day 1: Session Data Models & Repositories
- **Conversational Entities**: Designed `ChatSession` (representing a discrete conversation thread) and `ChatMessage` (storing raw SQL, safe SQL, execution time, and AI reasoning) securely linked to specific users and database connections.
- **Persistence Layer**: Engineered `ChatSessionRepository` and `ChatMessageRepository` with strict tenant-isolation query methods (`findByIdAndUserId`).

#### 📅 Day 2: DTOs & Sliding Window Retention Services
- **Chat Services**: Developed `ChatSessionService` to manage session lifecycles (creation, renaming, deletion).
- **Intelligent Memory Limits**: Programmed `ChatMessageService` to enforce a strict **30-message retention policy** (15 user prompts, 15 AI responses) per session. Older messages are automatically evicted, preventing memory exhaustion and optimizing API token costs.

#### 📅 Day 3: Pipeline Integration & REST APIs
- **Pipeline Orchestration**: Modified `QueryPipelineService` to automatically fetch historical `ChatMessage` logs via the session ID and feed them into `SqlGeneratorService` to preserve contextual continuity for follow-up questions.
- **Stateful Endpoints**: Updated `ChatController` to expose a complete suite of Session CRUD APIs and message history retrieval, backed by robust Spring Security authorization checks.
- **Integration Testing**: Restructured integration tests to support UUID session architectures and mocked persistence services to confirm robust zero-error builds.

---

### Phase 8: Advanced Data Visualization & Interactive Charting (COMPLETE)

This capstone phase transforms the application from a raw data-retrieval engine into an intelligent Business Intelligence (BI) dashboard. The backend presentation layer now dynamically profiles SQL results and generates automated interactive chart configurations for the frontend.

#### 📅 Day 1: Presentation Layer & Data Profiling
- **Strict Presentation DTOs**: Created `ChartConfig` and `VisualizationResponse` models mirroring interactive JSON schemas to completely offload analytical processing from the frontend.
- **Data Profiler Engine**: Engineered an algorithmic scanner utilizing `ResultSetMetaData` to dynamically inspect incoming SQL results, automatically categorizing unknown output columns into functional types (e.g., Dates, Numerics, Texts, Percentages).

#### 📅 Day 2: Intelligent Chart Recommendation & Analysis
- **Result Analyzer**: Developed heuristic logic to spot data patterns across the categorized columns, accurately deducing which column should act as the X-Axis label and which as the Y-Axis measure.
- **Chart Recommendation Engine**: Implemented robust decision trees to autonomously map deduced data patterns to the mathematically optimal visual representation (e.g., Line charts for temporal metrics, Pie charts for distributions, Bar charts for categorizations).

#### 📅 Day 3: Configuration Builder & Pipeline Orchestration
- **Configuration Builder**: Engineered the final data mapper that extracts precise runtime values from the DB payload and injects them into the designated X/Y coordinate arrays.
- **Facade Orchestration**: Consolidated all visualization micro-services under a unified `ResponseFormatter` facade, cleanly injecting it directly into the core `QueryPipelineService`.
- **E2E Result Embedding**: The backend now seamlessly delivers both the raw execution data and the pre-computed BI charting configurations embedded within a single holistic `ChatResponse`.

---

## 🏗️ System Architecture & Workflow

```
                    Natural Language Query
                               │
                               ▼
                Stateless JWT Security Filter
                               │
                               ▼
            Dynamic Tenant-Isolated JDBC Socket (Phase 3)
                               │
                               ▼
           Universal Schema Reader & Cache (Phase 4)
                               │
                               ▼
          AI Schema Selector & Graph Bridge Finder
                               │
                               ▼
          Dynamic Context Injector & Prompt Builder
                               │
                               ▼
        LLM Orchestrator (Gemini Primary / Groq Fallback) (Phase 5)
                               │
                               ▼
          Regex SQL Sanitizer & Executable Extractor
                               │
                               ▼
            JSqlParser AST Security Validation Engine (Phase 6)
                               │
                               ▼
        Zero-Trust Policy Engine (Table Blocking & Safety Limits)
                               │
                               ▼
            JDBC Dynamic Execution with Timeout Guardrails
                               │
                               ▼
         JSON Result Formatting for React Data Grid (Phase 6)
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
