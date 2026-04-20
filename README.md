# THE TIEBREAKER 🥴
### AI-Powered Decision Intelligence Engine

The TieBreaker is a professional-grade web application designed to help users navigate complex dilemmas. By leveraging advanced LLMs via OpenRouter, the app generates structured Pros & Cons, Side-by-Side Comparisons, SWOT analyses, and final Verdicts.

---

## 🚀 Tech Stack

### Core Framework
- **React 19**: Utilizing the latest concurrent rendering and performance improvements.
- **TypeScript 5.8**: Full type safety for AI schemas and component props.
- **Vite 6**: Next-generation frontend tooling for near-instant HMR.

### AI & Intelligence
- **OpenRouter API**: Unified gateway for LLM access.
- **OpenAI SDK**: Implementation client for OpenRouter compatibility.
- **Gemini 2.0 Flash**: Default model for high-speed, structured reasoning.

### UI & Styling
- **Tailwind CSS 4.0**: CSS-first configuration using the new `@tailwindcss/vite` engine.
- **Framer Motion**: Fluid UI transitions and `AnimatePresence` for state changes.
- **Lucide React**: Clean, consistent iconography.

### Testing Suite
- **Vitest**: Vite-native testing runner.
- **React Testing Library**: User-centric component testing.
- **jsdom**: Browser environment simulation for Node.js.

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/tie-breaker.git](https://github.com/your-username/tie-breaker.git)
cd tie-breaker

### 2. Install Dependencies
```bash
npm install

Enivronment Variables Configuration:
OPENROUTER_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:3000


Run Development Server
```bash
npm run dev

# Run tests
npm test

# Run tests with UI dashboard
npm run test -- --ui