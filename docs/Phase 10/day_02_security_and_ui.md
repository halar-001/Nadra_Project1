# Phase 10: Day 02 Security & UI Updates

## Security Fixes & Hardening

1. **JWT Expiration & Server Restart Invalidation**: 
   - Introduced a `SERVER_START_TIME` variable in `JwtService.java`.
   - The backend now rejects any JWTs issued before the current server run, ensuring all sessions are instantly invalidated upon a server restart.

2. **Frontend Session Storage & Timeout**:
   - Replaced all usage of `localStorage` with `sessionStorage` in `AuthContext.jsx` and `api.js`. This guarantees that user sessions are destroyed immediately when the browser tab/window is closed (disabling persistent "Remember Me").
   - Implemented a 5-minute inactivity monitor. If no successful API responses occur within 5 minutes, the frontend automatically logs the user out.

3. **403 Forbidden Login Loop Fix**:
   - Fixed the Axios response interceptor in `api.js`. It now correctly distinguishes between `401 Unauthorized` (which triggers a logout) and `403 Forbidden` (which does not), preventing infinite login loops for new/viewer users.
   - Guarded the `/api/audit` polling in `Dashboard.jsx` to only execute if the user `isAdmin`, avoiding unnecessary 403 errors in the background.

4. **Default Connection Creation Removed**:
   - Removed the automatic creation of the default "ai_db_assistant_v2" database connection in `ChatSessionService.java`. New users will no longer have an automatic database connection created for them.
   - **IDOR Verification**: We verified that `PUT /api/connections/{id}` is secure against IDOR (Insecure Direct Object Reference) attacks. Users cannot modify connections belonging to other users.

## UI/UX Improvements

- **Clickable Logo**: The main logo in the Sidebar (`Sidebar.jsx`) is now fully clickable, routing users back to the Dashboard. Hover and active scaling animations were added for a premium feel.
- **Strict Connection Enforcement (Empty States)**: If a user doesn't have a database connection selected, the sidebar now completely hides the chat history and displays a clean "empty state" instead. If they try to create a new chat anyway, a custom, animated modal popup prevents them rather than a standard browser alert.
