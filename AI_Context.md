# 🧠 TieBreaker Project Context & Checkpoint

**Last Updated:** June 24, 2026
**Current Phase:** Transitioning from v2 to v3 (Supabase Integration)

## ✅ Accomplished in v2
1. **Component Modularization:** Dismantled the monolithic `App.tsx` and moved logic into `src/components/` (analysis, modals, ui).
2. **"Auth Wall" Free Limit:** Implemented a 3-call free usage limit using `localStorage`. When the limit is reached, it renders `AuthWallModal.tsx`.
3. **Melinda Schema Lockdown:** Intercepted the backend API (`server.js`) to mathematically pad missing factors and map Melinda's rich JSON objects into exactly ordered arrays for the React frontend, guaranteeing zero hallucinated columns.
4. **README Overhaul:** Rewrote `README.md` entirely. It now includes junior-friendly hooks, tech stack badges, exact component structures, a gallery of 5 UI screenshots, the Melinda architecture explanation, and verbatim technical documentation (Security, Stack, Quick Start).
5. **Git Merge:** All v2 changes successfully pushed via the `v2-Azure_Foundry_Agent_Melinda` branch and merged into `main`.
6. **Azure Production Deployment:** Successfully deployed the Express + React (Vite) bundle to Azure App Service Linux (Basic B1 tier). 
7. **CI/CD & Security:** Built a fully automated CI/CD pipeline via GitHub Actions using artifact uploads. Configured System Assigned Managed Identity for secure, passwordless authentication to the Azure AI Foundry. Added user-friendly error handling with unique debug codes (`ERR-01` to `ERR-07`) in `server.js`. Created a custom `.agents/skills` file to document the optimal deployment architecture.

## 🚧 Next Steps (v3: Supabase)
Now that the app is successfully live in production, we are pivoting to integrate real user authentication and database storage.

### 1. Initial Setup
*   Run `npm install @supabase/supabase-js`.
*   Create a Supabase project and gather the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 2. Implementation Plan
*   **Authentication:** Replace the `localStorage` logic. Users will authenticate via Supabase to bypass the Auth Wall modal.
*   **Database Schema:** Design tables to save generated "Dilemmas", allowing users to view their past decisions and decision matrices.

## 🤖 Context for AI Assistant
*   **Tech Stack:** React 19, Vite, Tailwind CSS v4, Express.js backend, Azure AI Foundry (Melinda Agent).
*   **Philosophy:** Deterministic structure over free-form AI output. The frontend exclusively expects rigid JSON schemas.
*   **Deployment Architecture:** GitHub Actions handles the `npm build` step and packages `node_modules` into the artifact. Azure App Service strictly serves the artifact (no `SCM_DO_BUILD_DURING_DEPLOYMENT` enabled).

**Ready to resume Supabase implementation at any time!**
