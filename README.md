# 🧠 The TieBreaker
[![Build and deploy Node.js app to Azure Web App](https://github.com/Ahtesham-Latif/Tie-Breaker-App/actions/workflows/main_tie-breaker.yml/badge.svg)](https://github.com/Ahtesham-Latif/Tie-Breaker-App/actions/workflows/main_tie-breaker.yml)

> **Stop guessing. Start deciding.**  
> *A deterministic AI decision engine that transforms ambiguous "A vs B" dilemmas into structured comparison matrices, multi-angle analysis, and context-aware verdicts.*

![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Azure AI Foundry](https://img.shields.io/badge/Azure%20AI%20Foundry-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

---

## 🚀 Overview: Why We Built This

We've all been there. You ask a general-purpose AI to help you choose between two things—say, *“MBBS vs CA”*—and you receive a massive, rambling wall of text that concludes with the incredibly unhelpful: *"It depends on your needs."* 

While technically accurate, it fails to deliver what we actually need: **a structured, actionable decision framework.**

**The TieBreaker** was built with a different, perhaps humbler philosophy: **deterministic structure over free-form AI conversation**. We didn't build a chat interface; we built a strict backend execution pipeline. We believe AI shouldn't just talk to you—it should organize your thoughts so *you* can make the final call.

Every dilemma is transformed into a structured decision artifact:
* ⚖️ **Objective Comparison Matrices**
* 👍 **Fact-based Pros & Cons**
* 🎯 **SWOT Profiles**
* 🏆 **Final Verdicts** tailored exactly to your personal context

### 📺 Watch the User Manual Guide
[![The TieBreaker User Manual](https://img.youtube.com/vi/m__IZkOf2AU/maxresdefault.jpg)](https://youtu.be/m__IZkOf2AU)
> *Click the image above to watch a complete walkthrough of The TieBreaker's features and decision intelligence engine!*

---

## ⚡ At a Glance
> **Sub-second TTFB • Live Web Grounding • Zero Layout Shifts**

* 🚀 **Real-Time SSE Streaming:** Bypasses standard SDKs for raw `text/event-stream` processing.
* 🧠 **Azure AI Engine:** Powered by `gpt-4o-mini` for ultra-low latency execution.
* 🌍 **Live Deep Research:** Autonomously queries Bing to override stale AI assumptions.
* 🗄️ **Supabase Vault:** Non-destructive `jsonb` persistence with instant, zero-latency retrieval.
* 🛡️ **Bulletproof Formatting:** Strict regex sanitization guarantees the React UI never breaks.

---

## 💡 When to Use It

The TieBreaker shines when you are navigating high-stakes dilemmas that require objective clarity and personalized context. Instead of generic "pros and cons," you provide the engine with specific constraints.

**Example 1: Career Architecture**
* **Dilemma:** *Build AI products vs. Become an AI researcher*
* **Factors Evaluated:** Personal fulfillment, Financial upside, Daily work satisfaction, Skill compounding, Long-term impact.
* **Your Context (My Case):** "I am a solo builder from Pakistan. I enjoy turning ideas into real products that people use. I have already built TieBreaker and several portfolio projects, and my long-term dream is to build a billion-dollar AI company inspired by products, not academic research. However, I also love learning how AI works deeply and worry that focusing on products may stop me from reaching frontier AI expertise."

**Example 2: Enterprise Infrastructure**
* **Dilemma:** *Stripe vs. PayPal for a Global SaaS*
* **Factors Evaluated:** Setup burden, Monthly cost, Cross-border payment gateways, Subscription management.
* **Your Context (My Case):** "I am launching an AI-powered SaaS aimed at B2B clients in the US and Europe, but my legal entity is based in a developing market. I need a solution that minimizes cross-border transaction fees while supporting seamless recurring billing APIs."

*Note: The TieBreaker is a deterministic logic engine, not a crystal ball. It thrives on factual comparisons and strategic analysis anchored in your specific reality.*

---

## 🛠️ How to Use It

Getting a definitive answer is a simple 3-step process:

1. **Enter Your Options:** Tell the engine exactly what you are comparing (e.g., Option A vs Option B).
2. **Add Your Factors (Optional):** Tell the engine *how* to judge them (e.g., Cost, Durability, Customer Support). If you leave this blank, the engine will automatically select the best factors for you.
3. **Plead "Your Case" (Member Only):** In 500 characters or less, tell the AI *who you are*. ("I'm a broke college student who needs a laptop for video editing..."). This completely personalizes the Final Verdict. You must create a free account to unlock this engine!

*(For a full breakdown of the UI, check out our newly added [User Manual](USER_MANUAL.md) or click the **About Us** button in the app to meet the creator!)*

---

## 🏗️ Architecture

```mermaid
flowchart LR
    %% =========================
    %% Client Layer
    %% =========================
    U[User]
    FE[React Frontend]
    UI[Decision Dashboard UI]
    LS[(Local Cache / Session State)]

    U -->|Enter Option A vs B, Factors, My Case| FE
    FE -->|Render results, tabs, verdict views| UI
    FE <-->|Cache reads / repeat session checks| LS

    %% =========================
    %% Identity + Persistence
    %% =========================
    SB[(Supabase Auth + Postgres)]
    FE <-->|Auth session, fetch history, save decisions| SB

    %% =========================
    %% Client Access Control
    %% =========================
    FE --> G{Authenticated?}
    G -- Yes --> PRO{Pro Plan?}
    PRO -- Yes --> API
    PRO -- No --> FREE{< 15 Free Ties?}
    FREE -- Yes --> API
    FREE -- No --> UPGRADE[Show Pro Upgrade]
    G -- No --> WALL[Show Auth Modal]

    %% =========================
    %% Backend Orchestration
    %% =========================
    API[Express API Gateway]

    subgraph BACKEND[Backend Orchestration Layer]
        RL[Rate Limiter]
        NORM[Input Validation + Normalization]
        PAD[Factor Padding + Payload Assembly]
        AIREQ[AI Request Builder]
        SAN[Response Sanitization]
        VAL[Schema Validation]
    end

    API --> RL
    RL --> NORM
    NORM --> PAD
    PAD --> AIREQ

    %% =========================
    %% AI Decision Layer
    %% =========================
    subgraph AI[Melinda Decision Engine - Azure AI Foundry]
        MEL[Structured Decision Agent]
        WEB[Optional Live Web Grounding]
    end

    AIREQ --> MEL
    MEL <-->|Optional retrieval for current facts| WEB
    MEL -->|Structured JSON decision payload| SAN

    %% =========================
    %% Contract Enforcement
    %% =========================
    SAN --> VAL
    VAL -->|Validated decision artifact| API

    %% =========================
    %% Return + Persistence
    %% =========================
    API -->|Comparison matrix, SWOT, verdict, reasoning| FE
    FE -->|Persist authenticated decision history| SB
```

### Staged Processing Pipeline
1. **Ingestion:** Enforces `maxLength` bounds and normalizes input strings.
2. **Padding:** Auto-injects universal baseline dimensions if user factors are sparse.
3. **Orchestration:** Dispatches strict schemas to Azure, utilizing a **60-second in-memory token cache** to drop auth overhead.
4. **SSE Streaming:** Processes raw `text/event-stream` chunks, firing live `thinking` pings to the UI while extracting the JSON payload.
5. **Sanitization:** Repairs markdown bleed, validates JSON schemas, and intercepts Azure `ERR-04-SAFETY` filters.
6. **Persistence:** Saves the exact `jsonb` artifact into Supabase PostgreSQL for zero-latency historical retrieval.

---

## 🤖 Why Azure AI Foundry Agents?

Melinda was engineered as an Azure AI Foundry Agent instead of a standard completion endpoint to enforce strict execution constraints over a probabilistic model. 

The TieBreaker relies heavily on:
* **Deep Research Grounding:** Configurable Web Search tool execution (with strict 2-call runtime limits enforced in the prompt) ensures Melinda evaluates current market prices without tanking performance.
* **Low Volatility (0.3 Temperature):** A strict `0.3` temperature setting prevents hallucinated product specifications, ensuring objective and repeatable data artifacts.
* **Enterprise Guardrails:** Azure content safety filters ensure that inappropriate or malformed requests are categorically blocked before compute resources are wasted or bad data enters the Supabase ecosystem.
* **Schema Enforced Output:** Standard conversational APIs are prone to markdown bleed. By streaming text directly into our custom regex extractors and parsing the result via a robust `MarkdownText` layer, we guarantee the React frontend never encounters a layout shift or broken table—even if factors go missing or casing mismatches.

---

## 🧠 Meet Melinda: The Decision Intelligence Engine

![Melinda - The Decision Intelligence Engine](Pictures/Melinda.png)

The backend cognitive engine of TieBreaker is **Melinda**, a specialized decision agent hosted on Azure AI Foundry. Rather than functioning as an open-ended conversationalist, Melinda operates as a strict analytical compiler—transforming ambiguous, emotionally charged dilemmas into objective, strictly-typed data artifacts.

### Engine Specifications & Tooling
* **Core Model:** Powered by Azure's `gpt-4o-mini` (or equivalent ultra-fast deployments). We specifically leverage low-latency mini models without internal reasoning loops to achieve sub-second TTFB (Time to First Byte) while preserving high-tier logical structuring.
* **Grounding Integration:** Equipped with the **Azure Bing Web Search Tool**. When Deep Research is enabled, Melinda autonomously queries the live web to anchor her analysis in current pricing, market realities, and factual specs, completely overriding stale pre-trained assumptions.
* **Context Injection:** She receives layered prompt configurations dynamically assembled by the Express backend. This includes strict XML boundaries around user inputs, historical session memory (ensuring sequential tabs build upon, rather than repeat, past insights), and explicit schema directives.

### Execution Role
Melinda's execution pipeline is entirely silent. She does not interact directly with the user. Instead, she continuously evaluates the dilemma against the user's specific context constraints and requested analysis mode (Comparison, Pros & Cons, SWOT, Verdict), outputting a highly constrained JSON buffer that the backend intercepts and validates.

### Expected JSON Output Contract
Every response must strictly match this schema layout to satisfy the frontend parser:

```json
{
  "entities": ["Build AI products", "Become an AI researcher"],
  "analyticalReasoning": "Given the user's focus on tangible product development, their geographical constraints (solo builder in Pakistan), and their timeline, the financial and impact realities heavily favor immediate product shipping over a multi-year academic diversion...",
  "factors": [
    "Personal fulfillment",
    "Financial upside",
    "Daily work satisfaction",
    "Skill compounding",
    "Long-term impact"
  ],
  "recommendation": "Commit entirely to building AI products. The frontier of applied AI is moving faster than academia, and building aligns perfectly with your proven track record and billion-dollar ambition.",
  "bulletPoints": [
    "You already possess the builder's momentum; pivoting to research would stall this trajectory.",
    "Billion-dollar outcomes in AI are increasingly driven by rapid product iteration, not just base-model research.",
    "Your anxiety about 'frontier expertise' can be mitigated by reading papers while you build, rather than pausing to publish them."
  ]
}
```

---

## 🎯 Key Features

### 🗄️ Cloud Persistence & The Supabase Vault
The TieBreaker isn't just a temporary calculator; it acts as a long-term, cryptographic journal of your strategic pivots. This is achieved through our deep integration with **Supabase PostgreSQL**.

* **What We Store:** Every time you calculate an analysis, the engine securely stores both your constraints (`option_a`, `option_b`, `factors`, `my_case`) and the compiled data artifacts generated by Melinda (`comparison_data`, `pros_cons_data`, `swot_data`, `verdict_data`). 
* **JSONB Column Architecture:** Rather than spawning new database rows every time you click a different tab, we utilize advanced PostgreSQL `jsonb` columns. This allows the Node backend to perform non-destructive, incremental partial updates to a single dilemma record as you explore different lenses.
* **Ironclad Privacy (RLS):** Your strategic decisions—whether they are confidential business pivots or personal life choices—are locked down via Supabase Row Level Security (RLS). Database policies strictly enforce that users can only `SELECT`, `UPDATE`, or `INSERT` rows tied to their specific authenticated UUID.
* **Instant Retrieval:** Because the exact JSON artifacts are preserved in the vault, clicking a past decision in your History Sidebar completely bypasses the Azure AI layer. The React frontend instantly pulls the `jsonb` payload and re-renders the exact matrices you generated days or months ago with zero latency.

### AI Decision Engine
* **No Chatbot UX:** Form-driven data dashboard components.
* **"My Case" Context Engine:** Personalized analysis tailored to 500-word user constraints.
* **Multi-Lens Analytical Views:** Pros & Cons, Comparison Matrices, SWOT, and Final Verdicts.
* **Background Extraction:** The backend performs silent JSON evaluation and formatting; the frontend never displays raw reasoning or "AI thinking" scratchpads.

### 🧠 Intelligent Cache Orchestration
* **Local LRU Cache:** Instantly returns previously generated tabs during an active session.
* **Supabase Pre-population:** History clicks fetch the exact `jsonb` payload to pre-populate the local cache, preventing blank screens.
* **Case-Insensitive Fallback:** `.ilike()` DB queries prevent users from burning AI quota on slightly miscapitalized identical decisions.
* **Smart Auto-Selection:** History links auto-scan the payload to land the user on the first valid, non-empty tab.

### Interface Design
* **Real-time SSE Streaming:** Dynamically reacts to backend streams, instantly establishing a connection instead of showing a static loading screen.
* **Premium Fluid AI Orb & Domain-Aware Quotes:** An Apple/OpenAI-style continuous progress animation pairs with an intelligent text parser that feeds curated, domain-specific quotes (Tech, Business, Career, etc.) dynamically based on your `My Case` constraints while you wait.
* **Native Desktop Scrolling:** Flawlessly transitions between side-by-side data grids and vertical stacked views, leveraging native window scrolling for an incredibly smooth experience across both desktop trackpads and mobile devices.
* **Mobile-First Accessibility:** Minimalist icon-only mobile buttons and edge-handles gracefully expand to reveal descriptive labels upon interaction, keeping the UI perfectly clean without sacrificing usability.
* **Theme Adaptability:** Full Dark/Light structural synchronization.

### UX Messaging Architecture & Quotas
* **Strict Quota Enforcement:** Protects backend resources by requiring authentication for any generation, and locking Free Logged-In users at 15 generations before prompting a seamless upgrade flow.
* **Pro Tier Features:** Upon claiming the Pro Tier, users unlock a golden profile badge, unlimited decisions, the ability to permanently delete history, and an exclusive **Privacy Mode (Ghost Mode)** that saves decisions to the DB but completely hides them from the UI.
* **6-Question Feedback Funnel:** Authenticated users who engage heavily with the app are greeted with a beautiful, 6-question survey matrix designed to capture NPS, core use-cases, and roadmap requests directly into the database.
* **Emotionally Intelligent Feedback:** Rate limits, Azure quota hits, and Guest Auth Walls trigger premium, reassuring messaging layers—not raw markdown.
* **Zero Technical Bleed:** Backend errors and streaming timeouts (`ERR-TIMEOUT`, `ERR-06`) are elegantly abstracted into actionable UI states.

### 🔎 Enterprise SEO Architecture
* **Inline JSON-LD Validation:** Structured schema markup natively embedded for zero-dependency semantic search processing.
* **Dynamic Open Graph & Twitter Cards:** Authentic, dimension-perfect UI assets generated natively for premium social sharing previews.
* **Intelligent Web Crawl Infrastructure:** Fully structured `robots.txt` and priority-weighted `sitemap.xml` mapping.

---

## 🔒 Security & Reliability

| Concern | Protection | Implementation Layer |
| --- | --- | --- |
| **Excessive API Compute Costs** | String length boundaries & 500-word payload enforcement | Frontend Input & Express Router |
| **Rate Limit / API Exhaustion** | Cluster rate limiting via `express-rate-limit` middleware | Node.js Server Ingestion |
| **Anonymous Spam** | Authentication strictly required before API gateway processing | Node.js API Gateway |
| **Prompt Injection** | Hardcoded XML boundaries (`<decision>`, `<user_context>`) with strict Agent execution overrides | AI Orchestration Layer |
| **Free-Tier Abuse** | Mathematical JWT verification checking `ties_count` via Supabase directly at the API layer | Backend Authentication |
| **Cache Corruption** | Non-destructive JSON partial updates prevent wiping previous decision factors | Database State Manager |

### Advanced API Defenses
* **JWT Enforced Execution:** The `/api/analyze` endpoint strictly requires a Supabase Bearer token—eliminating frontend-bypass vulnerabilities.
* **Semantic Prompt Isolation:** User strings are locked inside unexecutable XML tags (`<decision>`, `<user_context>`) to neutralize prompt injection.
* **Safe String Parsing:** Right-to-left `.lastIndexOf(' vs ')` safely parses history strings, preventing crashes when options naturally contain the delimiter.

### Rate Limiting & Cooldowns
* **Server-Side Throttle:** Hard cap of 5 requests per IP every 15 minutes.
* **Frontend Cooldowns:** Strict 10-second penalty blocks on API failures (Quota hits, Rate Limits) with evaluated error priorities.

### Validation & Resiliency Checks
* **Stream Extraction:** Regex parsers intercept and repair markdown bleed directly from the SSE buffer.
* **Schema Contracts:** Express dynamically injects missing matrix rows to ensure payload compliance before hitting React.
* **Universal UI Fallbacks:** `MarkdownText` layer prevents primitive `undefined` crashes when the AI drops a field.
* **Flexible Factor Mapping:** Case-insensitive object matching and array index fallbacks secure the UI against AI capitalization shifts.

---



## ⚙️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express |
| **Database & Auth**| Supabase (PostgreSQL, GoTrue Auth) |
| **AI Platform** | Azure AI Foundry, `@azure/identity` |
| **Language** | TypeScript |
| **Testing** | Vitest |

---

## 📂 Project Structure

```text
📦 Tie-Breaker-App
 ┣ 📂 public/              # Static assets & icons
 ┣ 📂 src/
 ┃ ┣ 📂 __tests__/         # Modular AAA Vitest suites (Smoke, Integration, etc.)
 ┃ ┣ 📂 components/        # Isolated React UI pieces
 ┃ ┃ ┣ 📂 modals/          # Welcome and Auth wall overlays
 ┃ ┃ ┗ 📂 ui/              # Buttons, inputs, and layout wrappers
 ┃ ┣ 📂 context/           # Global React Context (AuthProvider)
 ┃ ┣ 📂 db/                # Supabase PostgreSQL connectivity
 ┃ ┣ 📂 hooks/             # Custom React lifecycle management
 ┃ ┣ 📂 lib/               # Shared utilities and parsers
 ┃ ┣ 📜 App.tsx            # Main application orchestrator & streaming logic
 ┃ ┣ 📜 index.css          # Tailwind v4 root
 ┃ ┗ 📜 main.tsx           # React DOM mounting
 ┣ 📜 server.js            # Node/Express API Gateway & rate limiting
 ┣ 📜 vite.config.ts       # Bundler configuration
 ┣ 📜 vitest.config.ts     # Test runner configuration
 ┗ 📜 package.json         # Dependencies & scripts
```

---

## 🧪 Testing & Quality Assurance

The TieBreaker features a completely modular, **AAA (Arrange-Act-Assert)** test suite powered by Vitest and React Testing Library. By breaking down the monolithic architecture into isolated domains, we guarantee bulletproof resiliency across the entire application lifecycle.

### Test Suite Architecture
The test suite is divided into 5 focused domains located in `src/__tests__/`:

1. **`smoke.test.jsx`** - Validates foundational rendering, zero-crash initialization, and DOM integrity.
2. **`interaction.test.jsx`** - Ensures React state handlers seamlessly track complex user inputs, form mutations, and theme toggling.
3. **`validation.test.jsx`** - Guards against malformed inputs by enforcing edge-case boundary checks (e.g., disabling submission when factors are empty).
4. **`integration.test.jsx`** - Orchestrates mocked API fetch streams, verifying that JSON payloads are correctly extracted, validated, and mapped into the UI. Also enforces correct error messaging for server timeouts/500 codes.
5. **`performance.test.jsx`** - Tests local `localStorage` cache hits to ensure identical requests resolve with zero network overhead.

### Test Results
![Vitest Green Status](./TestResults.png)

```text
 ✓ src/__tests__/validation.test.jsx (1 test)
 ✓ src/__tests__/smoke.test.jsx (1 test)
 ✓ src/__tests__/interaction.test.jsx (3 tests)
 ✓ src/__tests__/performance.test.jsx (1 test)
 ✓ src/__tests__/integration.test.jsx (2 tests)

 Test Files  5 passed (5)
      Tests  8 passed (8)
   Duration  7.80s
```

---

## 🚀 Quick Start

### 1. Clone & Navigate
```bash
git clone https://github.com/Ahtesham-Latif/Tie-Breaker-App.git
cd Tie-Breaker-App
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Populate `.env` with:
```env
FOUNDRY_ENDPOINT=https://your-agent.services.ai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-05-15-preview
Melinda_Agent=your-agent-identifier
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Authenticate Infrastructure
```bash
az login
```

### 5. Launch Local Dev Node
Execute frontend and backend tasks concurrently:
```bash
npm run dev:full
```

---

## 🏆 Google Gemini CLI Workflows

The **Google Gemini CLI** was utilized as an engineering accelerator throughout development to bootstrap system components and refine backend safety configurations.

### Contributions
* Structuring the React interface and Zero-Scroll mobile layout
* Integrating Supabase authentication and PostgreSQL history tracking
* Implementing strict regex sanitizers to parse corrupted JSON output blocks
* Structuring automated UI and integration testing patterns inside Vitest
* Building modular, strictly validated **Agent Skills** natively into `.agents/` for repeatable agentic execution (e.g., SEO checklists, Database mappings).

### Verified Badges
**Build AI Agents with Gemini**
[![Build AI Agents with Gemini](https://img.shields.io/badge/Google_Cloud-Build_AI_Agents-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://developers.google.com/profile/badges/events/cloud/five-day-ai-agents)

---

## 🔮 Future Enhancements
* Develop a backend layout engine to support **PDF Export** for completed decision matrices.
* Introduce cryptographically unique shareable links for cross-user scenario exploration.
* Build advanced surveying modules to capture user feedback on engine accuracy.

---

## 🤝 Contributing
Contributions, suggestions, and feedback are welcome.
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License
MIT License

---

## 👨‍💻 Author

**Ahtesham Latif**  
*Business & IT Scholar — University of the Punjab (IBIT)*  
[LinkedIn](https://www.linkedin.com/in/ahtesham-latif) | [Google Developer Profile](https://me.developers.google.com/u/me)  

*"Turning subjective dilemmas into objective, fact-driven choices through deterministic software architecture."*