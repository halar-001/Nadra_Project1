# AI Database Assistant

Enterprise-grade AI Database Assistant that translates natural language into SQL, validates queries, and securely retrieves data from relational databases.

## Implementation Progress

### Day 1
- **Backend**: Set up the foundational Spring Boot 3.x backend with Maven, configuring dependencies such as Spring Web, Spring Data JPA, H2 Database, Spring Security, and SpringDoc OpenAPI.
- **Frontend**: Initialized a Vite + React application, integrating TailwindCSS for utility-first styling.
- **Database**: Designed the initial SQL schemas and created seed files (`schema.sql` and `seed.sql`) to prepare the data layer.

### Day 2
- **Backend Architecture**: Structured the backend by adding the Controller layer and Service layer.
- **API Documentation**: Successfully configured and verified Swagger UI (`/swagger-ui/index.html`) for interactive API testing.
- **Health Check Endpoint**: Built the `GET /api/health` endpoint returning `{"status":"UP"}` to verify backend stability.
- **Frontend-Backend Integration**: Configured Cross-Origin Resource Sharing (CORS) in `SecurityConfig.java` to allow the React frontend on `localhost:5173` to securely connect to the Java backend on `localhost:8080`.
- **Automated Validation**: Ran a full-stack automated browser test verifying that the frontend UI successfully fetched and displayed real-time data from the backend.
