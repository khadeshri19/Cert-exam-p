# Sarvarth Certificate Platform

An enterprise-grade, full-stack solution for designing, issuing, and verifying digital certificates. This platform emphasizes state serialization, relational integrity, and secure verification workflows.

## 🏗️ System Architecture

The project follows a decoupled architecture with a **React (Vite)** frontend and a **Node.js/Express** backend, utilizing **PostgreSQL** for persistent storage.

### Core Stack
- **Frontend:** React 19, Fabric.js (Canvas Engine), Lucide React, Axios.
- **Backend:** Node.js, Express, PostgreSQL.
- **Auth:** JWT (Access/Refresh Token strategy), bcrypt, Role-Based Access Control (RBAC).

---

## 🧠 Engineering Logic & Design Patterns

### 1. Canvas Serialization Pattern (Fabric.js Integration)
Unlike simple "drawing" apps that save images, this platform treats the certificate as **state**.
- **Logic:** Certificates are serialized into a complex **JSON format** and stored as a `JSONB` column in PostgreSQL.
- **Trade-off:** Saving raw images would consume massive storage and lose editability. By storing the JSON state, we enable non-destructive editing and high-resolution exports on the fly.

### 2. High-Entropy Certificate ID Generation
The generation logic in `canvas.service.ts` avoids predictable sequences.
- **Implementation:** `sarv-${uuid.split('-')[0]}-${uuid.split('-')[1]}`.
- **Logic:** By concatenating two distinct segments from a UUID v4, we generate a 12-character hex string + prefix. This provides **281 trillion ($16^{12}$)** possible combinations, making collisions mathematically improbable while keeping the ID human-readable for verification.

### 3. Persistent State & Debounced Efficiency
In a canvas editor, network traffic can become a bottleneck.
- **Logic:** I implemented a **Debounced Save** strategy (500ms).
- **Benefit:** This ensures the UI feels like a modern "auto-saving" application while preventing the server from being flooded with a new database `UPDATE` on every mouse movement.

### 4. Relational Integrity & Trust Model
The platform uses a strict **Audit Trail** for certificate authorization.
- **Atomic Operations:** Authorization is handled as a **Database Transaction**. We ensure that the `canvas_sessions.is_authorized` flag and the `certificate_authorizations` log entry are committed together or not at all.
- **Logic:** This prevents "Ghost Authorizations" where a certificate appears valid but has no recorded authorizer.

### 5. Frontend Optimization: Code Splitting
The Editor workspace is significantly heavier than the landing pages.
- **Logic:** Used **Dynamic Imports** for the `AdvancedEditor` component in `CanvasEditorPage.tsx`.
- **Reasoning:** This keeps the initial bundle size small, ensuring fast load times for the Landing and Verification pages, only loading the heavy Canvas engine when the user actually starts designing.

---

## 🔒 Security Architecture

- **Stateless Authorization:** Uses JWT with a **Dual Token System** (Access + Refresh).
- **Service Layer Security:** Middlewares like `authenticate` and `requireAdmin` act as guards before any business logic is executed.
- **Data Safety:** All database interactions utilize **Parameterized Queries** through `node-pg` to eliminate SQL Injection risks.

---

## 🎨 Design Philosophy: Modular CSS

Instead of a utility-first framework like Tailwind, this project uses a **Modular CSS approach**.
- **Organization:** Styles are scoped to specific pages (e.g., `src/styles/pages/verification.css`).
- **Logic:** This ensures maximum performance with zero runtime overhead and prevents "Global Namespace Pollution," making the UI highly maintainable for future developers.