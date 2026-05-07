# THE TIEBREAKER 🥴
**AI-Powered Decision Intelligence Engine**

🌍 **Live Demo:** [Experience The TieBreaker Here](https://tie-breaker-fjgrfwbkakakgham.canadacentral-01.azurewebsites.net/)

The TieBreaker is a professional-grade web application designed to help users navigate complex dilemmas. By leveraging advanced Large Language Models (LLMs) via OpenRouter, the app acts as your personal decision-making assistant, generating structured Pros & Cons, Side-by-Side Comparisons, SWOT analyses, and objective final Verdicts.

---

## ✨ Features
* **Pros & Cons Generator:** Instantly weigh the benefits and drawbacks of any choice.
* **Side-by-Side Comparisons:** Evaluate multiple options against each other with structured metrics.
* **SWOT Analysis:** Break down Strengths, Weaknesses, Opportunities, and Threats.
* **The Final Verdict:** Get an AI-driven, objective recommendation to break the tie.

---

## 🚀 Tech Stack

### Core Framework
* **React 19:** Utilizing the latest concurrent rendering and performance improvements.
* **TypeScript 5.8:** Full type safety for AI schemas, components, and server logic.
* **Vite 6:** Next-generation frontend tooling for near-instant HMR and optimized builds.

### AI & Intelligence
* **OpenRouter API:** Unified gateway for LLM access.
* **OpenAI JS Client:** Browser-compatible `openai` SDK with OpenRouter support.
* **Gemini 2.0 Flash:** Default model chosen for high-speed, structured reasoning.

### UI & Styling
* **Tailwind CSS 4.0:** CSS-first configuration using the new `@tailwindcss/vite` engine.
* **Motion:** Animations and transitions powered by the `motion/react` package.
* **Lucide React:** Clean, consistent iconography.

### Server & Deployment
* **Express.js (Node.js):** Custom lightweight backend to serve the compiled Vite static assets and handle React routing.
* **Azure App Service:** Production-ready configuration supporting dynamic port binding.

### Testing Suite
* **Vitest:** Vite-native testing runner.
* **React Testing Library:** User-centric component testing.
* **jsdom:** Browser environment simulation for Node.js.

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Ahtesham-Latif/Tie-Breaker-App
cd tie-breaker
```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Variables Configuration

Create a `.env` file in the root directory and add the following key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 4. Run the Development Server

```bash
npm run dev

```

---

## 🧪 Testing

Run standard tests:

```bash
npm test

```

Run tests with the interactive UI dashboard:

```bash
npm run test -- --ui

```

---

## ☁️ Deployment (Azure Readiness)

The application is currently live and deployed via **Azure App Service (Canada Central)**.

The included `server.js` acts as an Express production server that:

1. Serves the static compiled files from the `dist` folder.
2. Catches all React Router paths and redirects them to `index.html` to prevent 404 errors on refresh.
3. Dynamically listens to Azure's injected `PORT` environment variable (falling back to `8080`).

**To build and test the production server locally:**

```bash
# 1. Build the frontend assets
npm run build

# 2. Start the Express production server
node server.js

```

*You should see: `The TieBreaker is live on port 8080`*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue to discuss potential changes, feature requests, or bug fixes.

## 📄 License

© 2026 Ahtesham-Latif. All rights reserved.

```

```