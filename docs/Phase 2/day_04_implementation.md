# Phase 2: Day 4 Implementation Summary (Backend)

## Overview
On Day 4, Developer A finalized the backend by building the **User Profile & Auth Routing Logic**, integrating the database, and streamlining the registration flow by removing unnecessary OTP constraints.

## Key Deliverables Completed
1. **User Profile & Registration Logic (`AuthService` & `AuthController`)**:
   - Implemented `POST /api/auth/register` to automatically hash user passwords via `BCrypt` and strictly assign the `ROLE_VIEWER` role upon creation, preventing privilege escalation.
   - Refactored the registration logic to immediately enable user accounts, intentionally discarding the previously planned OTP system to ensure a frictionless user experience.
   - Implemented `POST /api/auth/login` to validate credentials, retrieve the authenticated user, and dispatch JWT tokens back to the frontend.

2. **Account Management Endpoints**:
   - Implemented `GET /api/auth/profile` to seamlessly return the authenticated user's profile details.
   - Implemented `PUT /api/auth/profile` to allow users to update their Full Name and Email safely.
   - Implemented `PUT /api/auth/change-password` allowing users to rotate passwords after proving ownership via their old password hash.

3. **Database Integration & Data Seeding (`DataInitializer`)**:
   - Upgraded `User` and `Role` entities using JPA constraints, carefully removing obsolete `otp` and `otp_expiry` columns.
   - Wired `DataInitializer.java` to auto-seed essential roles (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_VIEWER`).
   - Automatically seeded dedicated admin credentials (`admin1@aidatabaseassistant.com` and `admin2@aidatabaseassistant.com`) to streamline frontend testing workflows.
