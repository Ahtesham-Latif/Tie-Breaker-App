# 📖 The TieBreaker - User Manual

Welcome to **The TieBreaker**! We built this tool because we believe making big decisions shouldn't mean drowning in endless search results or generic AI chatbot answers.

Whether you're a student picking a major, a developer choosing a tech stack, or an entrepreneur deciding on a business strategy, this guide will walk you through how to use the app to get the best possible results when you're stuck between two tough choices.

---

## 🎯 Who is TieBreaker For? (Use Cases)

TieBreaker is designed to adapt to your specific profession and high-stakes constraints. Here are some examples of how our diverse community leverages the engine:

* **👨‍💻 Software Engineers & Tech Founders:** Deciding between secure roles and bold ventures (`Accept a stable AI engineering job` vs `Continue building Tie-Breaker full-time`).
* **👔 Founders & Entrepreneurs:** Making foundational platform choices (`Stripe` vs `Paypal`).
* **👩‍🎓 Students & Graduates:** Navigating intense academic pathways (`MBBS` vs `CA`), or choosing immediate employment (`Pursue a Master's degree abroad` vs `Work full-time and gain industry experience`).
* **🔬 Researchers & Innovators:** Choosing a core path of impact (`Build AI Products` vs `Become an AI Researcher`).

---

## 1. The Core Interface (The Decision Engine)

When you open the app, you'll see a clean, distraction-free dashboard. Here is how to use the main inputs:

### Option A vs Option B
* **What it is:** The two primary text boxes at the top of your screen.
* **How to use it:** Enter exactly the two concepts, products, or paths you are weighing against each other. 
* *Example:* `Stripe` vs `Paypal`.

### Comparison Factors (Optional)
* **What it is:** The section where you can click **"Add Option"** to define the specific lenses through which you want the AI to judge the options.
* **How to use it:** Add precise criteria like `Financial upside`, `Setup burden`, or `Long-term impact`.
* *Tip:* If you don't add any factors, our intelligent engine will automatically generate the most logical evaluation metrics based on your options!

### Deep Research Toggle
* **What it is:** A strict, deterministic web-search configuration labeled **"Deep Research"**.
* **How to use it:** Turn this ON if your options involve volatile information like current pricing, real-time market data, or recent software updates. The AI agent will actively ping the live web (up to two times) to anchor its analysis in current reality before answering. Keep it OFF for philosophical, historical, or purely strategic comparisons to execute at maximum speed.

### "My Case" / Personalized Context (Member Only)
* **What it is:** A secure, 500-character context injection field. 
* **How to use it:** You must have an account to unlock this feature! This is where you inject your specific constraints into the AI's logic. 
* *Example (Founder):* "I am a solo builder from Pakistan aiming to launch an AI SaaS within 1 week. I have no initial marketing budget and need a payment gateway that minimizes cross-border transaction fees without requiring extensive custom developer integration."
* *Why it matters:* This context completely rewires the "Final Verdict." Without it, the AI gives a generic winner. With it, the AI acts as your personal strategist and picks the optimal winner *specifically for your reality*.

---

## 2. The Analysis Tabs

Once you hit **"Calculate Analysis"**, the AI engine silently processes your dilemma and unlocks four heavily-structured tabs. We explicitly hide the AI's internal scratchpad—you will only see polished data artifacts.

### ⚖️ Comparison
* **The Role:** The objective facts.
* **What it shows:** A side-by-side matrix breaking down both options across all requested factors. It strips away opinions and just gives you the raw, factual delta in a clean grid.

### 👍 Pros & Cons
* **The Role:** The strategic tradeoff.
* **What it shows:** A rapid-fire breakdown of the strategic advantages and potential constraints of each option. Perfect for scanning quickly to see if there are any immediate dealbreakers.

### 🎯 SWOT Analysis
* **The Role:** The comprehensive risk evaluation.
* **What it shows:** A systemic grid detailing the **S**trengths, **W**eaknesses, **O**pportunities, and **T**hreats for each option. 
* *When to use it:* Highly recommended when you are making financial, infrastructural, or long-term strategic decisions.

### 🏆 Final Verdict
* **The Role:** The definitive answer.
* **What it shows:** The AI takes all the data from the previous tabs, heavily weighs it against your **"My Case"** constraints, and explicitly declares a winner. It explains exactly *why* it won and offers tactical next steps.

---

## 3. Navigation & Hidden Features

To keep the interface premium and clean, some features use minimalistic icons.

### 💡 Tooltips 
* **Desktop:** Simply hover your mouse over any icon button (like the Copy icon or Theme Toggle) to see a tooltip explaining what it does.
* **Mobile:** Tap and hold your finger on an icon for half a second. A custom, animated tooltip will pop up to guide you.

### 🌗 Dark Mode / Light Mode
* **Where to find it:** When viewing your results, you'll find the Theme Toggle (Sun/Moon icon) sitting perfectly in the top-left corner, just above the analysis header.
* **How it works:** Tap it instantly to swap between our beautiful Dark and Light color palettes without losing any of your streaming data.

### 🗂️ Split vs. Stack View
* **Where to find it:** Inside the results panel header, there is a `Split/Stack` icon (Columns/Rows).
* **How it works:** This allows you to toggle the layout of your Pros/Cons and Comparisons from a side-by-side view (Split) to a vertically stacked view (Stack). Stacked is often easier to read on mobile devices!

---

## 4. Account Features & History

The TieBreaker is free to try, but creating an account unlocks powerful persistence.

### My History Sidebar
* **The Role:** Your personal decision vault.
* **How it works:** If you are logged in, every dilemma you generate is securely saved to a cloud database. You can click the **My History** button on the left sidebar to open your history.
* **Instant Retrieval:** When you click an old decision, our caching layer instantly pulls the payload without triggering a new AI generation—preventing wait times and saving your quota.

### The Free Tier & Pro Features (Usage Limits)
* **Registered Free Users:** Enjoy up to 15 TieBreaker decisions fully backed by cloud history persistence. Authentication is strictly required to generate analyses.
* **Pro Members:** Level up to Pro for **unlimited decisions**. Pro users also unlock the ability to permanently **delete** items from their history vault, and gain access to **Privacy Mode (Ghost Mode)** which prevents new decisions from appearing in the app UI altogether while still securely hitting our APIs.

### User Feedback Survey Funnel
* **Continuous Improvement:** After you hit 3 successful TieBreaker generations as an authenticated user, you'll be greeted with a beautiful, 6-question UX feedback funnel. It asks targeted questions about what you loved, the ease of use, your use case, and product roadmap features. It’s optional, but highly appreciated!

---

## 💡 Best Practices for Optimal Results
1. **Be Granular:** `Next.js 14 App Router` vs `Remix v2 Single Fetch` yields exponentially better matrix data than just `React Frameworks`.
2. **Inject Aggressive Constraints:** The engine thrives on constraints. Tell it your budget ceilings, your exact technical skill level, or your exact timeline in the "My Case" box.
3. **The Domain-Aware Loading Experience:** When processing, you will see a minimized, subtle fluid AI Loading Orb. Beneath it, the system intelligently analyzes your `My Case` context and streams curated, **domain-aware quotes** (e.g., Tech, Business, Career, Academic) cycling every 9 seconds to make your 10-15 second wait insightful.
4. **Clean UI Focus:** Global browser scrollbars have been completely hidden for a sleek, native app-like experience. Feel free to swipe, scroll, and drag without visual clutter.
