# Phase 2 - Day 1 Implementation Details

## Objective
Establish the foundational infrastructure for a secure Authentication and User Management system using Spring Security and JWT.

## Implemented Features

### 1. Database Entities
- **`User` Entity**: Created to store user data including `fullName`, `email`, `password`, `enabled` status, `otp`, and `otpExpiry`.
- **`Role` Entity**: Implemented to support Role-Based Access Control (RBAC). Utilized an enumeration `RoleName` (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_VIEWER`).
- **Mapping**: Established a Many-To-Many relationship between `User` and `Role` using a join table `user_roles`.

### 2. Repositories
- **`UserRepository`**: Added custom methods like `findByEmail` and `existsByEmail`.
- **`RoleRepository`**: Added custom method `findByRoleName`.

### 3. JWT Security Infrastructure
- **`JwtService`**: Implemented JWT generation, validation, and claim extraction (e.g., extracting the username from the token) using the `io.jsonwebtoken` library with HMAC SHA-256 signing.
- **`JwtAuthenticationFilter`**: Created a custom `OncePerRequestFilter` to intercept incoming HTTP requests, extract the Bearer token, validate it via `JwtService`, and securely populate the Spring `SecurityContextHolder`.

### 4. Security Configuration
- **`SecurityConfig`**: Configured the global `SecurityFilterChain`.
  - Disabled CSRF for stateless API usage.
  - Set `SessionCreationPolicy.STATELESS`.
  - Configured public routes (e.g., `/api/auth/**`, `/api/health`, Swagger docs).
  - Wired in the custom `JwtAuthenticationFilter` before the standard `UsernamePasswordAuthenticationFilter`.
- **`UserDetailsImpl` & `UserDetailsServiceImpl`**: Implemented Spring Security core interfaces to map our custom `User` entity to Spring's internal authentication models.

## Result
A robust security foundation is fully configured. The backend is ready to handle token-based authentication requests and secure endpoints.
