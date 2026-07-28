# 🤖 Enterprise AI Database Assistant

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)
![React](https://img.shields.io/badge/React-Vite-blue.svg)
![Status](https://img.shields.io/badge/Status-Phase_4_Complete-success.svg)
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

## 🏗️ System Architecture & Workflow

```
                    Chat & Schema Request
                              │
                              ▼
                Stateless JWT Security Filter
                              │
                              ▼
                     Connection Manager (Phase 3)
                              │
                              ▼
            Dynamic Tenant-Isolated JDBC Socket
                              │
                              ▼
               Universal Schema Reader (Phase 4)
                              │
                              ▼
            Thread-Safe Schema RAM Cache (0ms)
                              │
                              ▼
          Inverted Vocabulary Keyword Indexer
                              │
                              ▼
         AI Schema Selector + Graph Bridge Finder
                              │
                              ▼
         Ready for AI Natural Language Prompt (Phase 5)
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
