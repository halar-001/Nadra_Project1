# 🤖 Enterprise AI Database Assistant

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)
![React](https://img.shields.io/badge/React-Vite-blue.svg)
![Status](https://img.shields.io/badge/Status-Phase_1_Complete-success.svg)

An **Enterprise-grade AI Database Assistant** designed to translate natural language into SQL, validate queries, and securely retrieve data from relational databases. 

Developed as the inaugural full-stack project for the Nadra Internship Program by **Halar Khan** and **Muhammad Taimoor Ajmal**.

---

## 🎯 Project Roadmap

### Phase 1: Foundation & Architecture (COMPLETE)

This phase establishes the core architecture, foundational integrations, and global standards for both the frontend and backend applications over the first 3 days of development.

#### 📅 Day 1: Project Initialization
- **Backend Infrastructure:** Set up the foundational Spring Boot 3.x backend with Maven. Configured core dependencies: Spring Web, Spring Data JPA, H2 Database, Spring Security, and SpringDoc OpenAPI.
- **Frontend Infrastructure:** Initialized a blazing fast Vite + React application, integrating TailwindCSS for a utility-first styling architecture.
- **Database Layer:** Designed the initial SQL schemas and created initial seed files (`schema.sql` and `seed.sql`) to prepare the data persistence layer.

#### 📅 Day 2: API & Integration Setup
- **Backend Architecture:** Structured the core backend by implementing the Controller layer and Service layer abstractions.
- **API Documentation:** Successfully configured and verified interactive **Swagger UI** (`/swagger-ui/index.html`) for seamless API testing and exploration.
- **Health Verification:** Built the `GET /api/health` endpoint to verify backend stability and uptime.
- **CORS Integration:** Configured Cross-Origin Resource Sharing in `SecurityConfig.java` to allow the React frontend (`localhost:5173`) to securely interface with the Java backend (`localhost:8080`).
- **Automated Validation:** Ran a full-stack automated browser test verifying that the frontend UI successfully fetched and displayed real-time data from the backend APIs.

#### 📅 Day 3: Standardization & Error Handling
- **Unified API Responses:** Created a standardized `ApiResponse` DTO to securely encapsulate all API responses into predictable `{success, message, data}` blocks for safe frontend consumption.
- **Global Exception Handling:** Developed a `GlobalExceptionHandler` leveraging `@RestControllerAdvice` to seamlessly intercept and format internal Java exceptions, completely preventing ugly stack traces from leaking to the client.
- **Configuration Modularization:** Abstracted configuration logic by establishing `ApplicationConfig` and `CorsConfig`, renamed Swagger to `OpenApiConfig`, and modularized `SecurityConfig`.
- **Framework Stability:** Safely downgraded to Spring Boot 3.3.4 (as per architecture specifications) to seamlessly resolve compatibility bugs with `springdoc-openapi` that caused documentation endpoint crashes.
- **End-to-End Verification:** Conducted a rigorous automated browser test ensuring that the Swagger UI and React Dashboard flawlessly communicate with the newly formatted backend endpoints.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
