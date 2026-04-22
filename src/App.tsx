import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale,
  CheckCircle2,
  XCircle,
  Columns,
  Zap,
  ArrowRight,
  Loader2,
  Scale as ScaleIcon,
  RefreshCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";

// --- Types ---

type AnalysisType = "pros-cons" | "comparison" | "swot" | "verdict";

interface ComparisonData {
  factor: string;
  options: {
    name: string;
    pros: string[];
    cons: string[];
    impactScore: number;
    notes: string;
  }[];
}

interface AnalysisResult {
  type: AnalysisType;
  content: string; // Markdown or JSON string
  structuredData?: any;
  options?: string[];
}

// --- AI Service ---

/**
 * AI CORE INITIALIZATION
 *
 * If you want to use your personal model:
 * 1. Replace '@google/genai' with your preferred client (e.g., 'openai' or 'axios' for custom API).
 * 2. Update the API key variable (process.env.YOUR_API_KEY).
 * 3. Update the ai.models.generateContent call inside analyzeDecision().
 */
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * CORE LOGIC: PROMPT GENERATION & API INTERACTION
 */
async function analyzeDecision(
  decision: string,
  type: AnalysisType,
  factors: string[],
): Promise<{ content: string; structuredData?: any }> {
  let prompt = "";
  let schema: any = {};

  // Extract entities from decision string (e.g., "Cat and Dog" -> ["Cat", "Dog"])
  const entities = decision
    .split(/\s+and\s+|\s+&\s+|\s+or\s+/i)
    .map((e) => e.trim())
    .filter(Boolean);
  const entitiesText = entities.join(" vs ");
  const factorsText =
    factors.length > 0
      ? `using these specific factors: ${factors.join(", ")}`
      : "by identifying the most relevant comparison factors automatically";

  if (type === "comparison") {
    prompt = `Perform a deep side-by-side comparison of ${entitiesText}. Analyze them ${factorsText}. 
    Focus on specific dimensions like "Cost", "When to use" (scenarios), and "Ease of use". 
    Return a structured comparison table with the identified factors and values for each entity.`;

    schema = {
      type: "object",
      properties: {
        factors: {
          type: "array",
          items: { type: "string" },
          description: "The dimensions or factors used for comparison",
        },
        comparison: {
          type: "array",
          items: {
            type: "object",
            properties: {
              optionName: {
                type: "string",
                description: "The name of the entity being compared",
              },
              values: {
                type: "array",
                items: { type: "string" },
                description: "The performance/value for each factor",
              },
            },
            required: ["optionName", "values"],
            additionalProperties: false,
          },
        },
      },
      required: ["factors", "comparison"],
      additionalProperties: false,
    };
  } else if (type === "pros-cons") {
    prompt = `Analyze the pros and cons of ${entitiesText} ${factorsText}. Provide descriptive summaries for each.`;
    schema = {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              optionName: { type: "string" },
              pros: { type: "array", items: { type: "string" } },
              cons: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
            },
            required: ["optionName", "pros", "cons", "summary"],
            additionalProperties: false,
          },
        },
      },
      required: ["results"],
      additionalProperties: false,
    };
  } else if (type === "swot") {
    prompt = `Generate a SWOT analysis for each of these entities: ${entities.join(", ")} ${factorsText}.`;
    schema = {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              optionName: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } },
            },
            required: [
              "optionName",
              "strengths",
              "weaknesses",
              "opportunities",
              "threats",
            ],
            additionalProperties: false,
          },
        },
      },
      required: ["results"],
      additionalProperties: false,
    };
  } else {
    prompt = `Provide a final, concise verdict between ${entitiesText} ${factorsText}. Who is the winner?`;
    schema = {
      type: "object",
      properties: {
        winner: { type: "string" },
        recommendation: { type: "string" },
        keyTakeaways: { type: "array", items: { type: "string" } },
      },
      required: ["winner", "recommendation", "keyTakeaways"],
      additionalProperties: false,
    };
  }

  const completion = await openai.chat.completions.create({
    model: "google/gemini-2.0-flash-001",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: `${type.replace("-", "_")}_schema`,
        schema: schema,
        strict: true,
      },
    },
  });

  const text = completion.choices[0].message.content || "";
  try {
    let data = JSON.parse(text);
    // Unwrap array from 'results' wrapper when necessary since openai strict standard schemas require objects
    if (data.results && Array.isArray(data.results)) {
      data = data.results;
    }
    return { content: text, structuredData: data };
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return {
      content: "Error processing structured data.",
      structuredData: null,
    };
  }
}

// --- Components ---

export default function App() {
  const [decision, setDecision] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType>("pros-cons");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, AnalysisResult>
  >({});

  const RATE_LIMIT_MS = 10000; // 10 seconds cooldown between AI calls

  // Clear cache if decision or factors change to ensure fresh results for new context
  useEffect(() => {
    setAnalysisCache({});
  }, [decision, options]);

  // Theme Toggler Logic
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log("Toggling theme to:", newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    console.log("Applying theme attribute:", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAnalyze = async (type: AnalysisType = selectedType) => {
    const trimmedDecision = decision.trim();
    // Regex to match "Word Operator Word" where Operator is 'and', '&', or 'or'
    const match = trimmedDecision.match(/^(.+?)\s+(and|&|or)\s+(.+)$/i);

    // 1. INPUT VALIDATION
    if (!trimmedDecision) {
      setValidationError("Please describe the decision you're trying to make.");
      return;
    }

    if (!match) {
      setValidationError(
        "Please enter what you want to compare in a clear format, for example: 'Cat and Dog' or 'Coffee & Tea'.",
      );
      return;
    }

    // 2. CHECK CACHE
    // We only call the API once per unique analysis type for the current input set
    if (analysisCache[type]) {
      setResult(analysisCache[type]);
      setSelectedType(type);
      setValidationError(null);
      return;
    }

    const validFactors = options.filter((o) => o.trim());

    // 3. RATE LIMITING (Client-Side)
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const remaining = Math.ceil(
        (RATE_LIMIT_MS - (now - lastRequestTime)) / 1000,
      );
      setValidationError(
        `Too many requests. Please wait ${remaining}s before analyzing again.`,
      );
      return;
    }

    setValidationError(null);
    setLoading(true);
    setSelectedType(type);
    setLastRequestTime(now);

    try {
      /**
       * CUSTOM MODEL ENTRY POINT
       *
       * This function handles the actual prompt construction and API call.
       * If you change models, ensure it still returns the structuredData needed for the tables.
       */
      const { content, structuredData } = await analyzeDecision(
        trimmedDecision,
        type,
        validFactors,
      );
      const newResult = {
        type,
        content,
        structuredData,
        options: validFactors,
      };

      setAnalysisCache((prev) => ({ ...prev, [type]: newResult }));
      setResult(newResult);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "";
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED")
      ) {
        setResult({
          type,
          content:
            "## Quota Exceeded\n\nThe AI service is currently at its limit. Please wait a moment and try again later. This usually happens when many requests are made in a short time.",
        });
      } else {
        setResult({
          type,
          content:
            "## Connection Error\n\nFailed to connect to the AI. Please check your internet connection or try a different analysis type.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setDecision("");
    setOptions(["", ""]);
  };

  const handleCopy = () => {
    if (result) {
      let textToCopy = "";
      if (result.structuredData) {
        textToCopy = JSON.stringify(result.structuredData, null, 2);
      } else {
        textToCopy = result.content;
      }
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row min-h-screen bg-bg-base text-text-main font-sans selection:bg-accent selection:text-white transition-colors duration-300",
        "md:h-screen md:overflow-hidden", // Locked height only on desktop
      )}
    >
      {/* Sidebar - Inputs */}
      <aside className={cn(
        "w-full md:w-[320px] bg-bg-surface border-b md:border-b-0 md:border-r border-border-dim flex flex-col p-6 flex-shrink-0 shadow-sm z-20 relative transition-all duration-300",
        result && "md:hidden" // Hide sidebar on desktop when result appears
      )}>
        <div className="flex items-center justify-between mb-10">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={reset}
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-bg-surface rotate-12 transition-transform group-hover:rotate-0 shadow-lg shadow-accent/20">
              <ScaleIcon size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tighter text-text-bright uppercase">
              THE TIE<span className="text-accent">BREAKER</span>
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-accent-muted text-accent hover:bg-accent hover:text-bg-surface transition-all shadow-sm"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
          {/* Validation Feedback */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-danger/10 border-2 border-danger/20 p-4 rounded-xl mb-4"
              >
                <p className="text-[11px] font-black text-danger uppercase tracking-wider flex items-center gap-2">
                  <XCircle size={14} /> {validationError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent block">
              The Decision
            </label>
            <textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="What's the dilemma?"
              className="w-full bg-bg-panel border-2 border-transparent rounded-xl p-4 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all resize-none min-h-[120px] placeholder:text-accent/30 font-semibold shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent flex items-center justify-between">
              Analysis Factors
              <span className="opacity-40 lowercase font-medium text-[9px] tracking-normal">
                Optional
              </span>
            </label>
            <p className="text-[9px] font-bold text-text-dim uppercase tracking-wider -mt-2 opacity-60 italic leading-tight">
              Add factors like "Cost" or "Health" to guide the comparison
            </p>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="relative group/opt">
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full bg-bg-panel border-2 border-transparent rounded-lg px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(idx)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-danger opacity-100 md:opacity-0 group-hover/opt:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="w-full flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-accent/20 text-accent hover:border-accent hover:bg-accent-muted transition-all text-xs font-bold"
              >
                <Plus size={16} className="mr-2" />
                Add Option
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleAnalyze(selectedType)}
          disabled={loading || !decision.trim()}
          className="mt-6 w-full py-4 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}
          Calculate Analysis
        </button>
      </aside>

      {/* Main Content - Results */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-base md:overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center p-6 md:p-12"
            >
              <div className="max-w-2xl text-center space-y-8">
                <div className="inline-block px-4 py-1.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest leading-none mb-4 shadow-lg shadow-accent/20">
                  AI Decision Engine
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-text-bright tracking-tighter leading-[0.85] uppercase">
                  Break The <br />
                  <span className="text-accent underline decoration-8 underline-offset-8 decoration-accent/20">
                    Tie
                  </span>{" "}
                  Today 🥴
                </h1>
                <p className="text-lg md:text-xl text-text-main font-semibold leading-relaxed opacity-70">
                  Stuck between two options? Let our AI analyze the pros, cons,
                  and key factors to help you make the best choice with
                  confidence.
                </p>
                <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnalysisButton
                    title="Pros & Cons"
                    icon={<CheckCircle2 size={18} />}
                    onClick={() => handleAnalyze("pros-cons")}
                    disabled={loading || !decision.trim()}
                  />
                  <AnalysisButton
                    title="Comparison"
                    icon={<Columns size={18} />}
                    onClick={() => handleAnalyze("comparison")}
                    disabled={loading || !decision.trim()}
                  />
                  <AnalysisButton
                    title="SWOT"
                    icon={<Zap size={18} />}
                    onClick={() => handleAnalyze("swot")}
                    disabled={loading || !decision.trim()}
                  />
                  <AnalysisButton
                    title="The Verdict"
                    icon={<ArrowRight size={18} />}
                    onClick={() => handleAnalyze("verdict")}
                    disabled={loading || !decision.trim()}
                    highlight
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col p-6 md:p-10 h-full bg-bg-base"
            >
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-accent text-bg-surface rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
                      {selectedType.replace("-", " ")} Mode
                    </span>
                    <button
                      onClick={reset}
                      className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline transition-all"
                    >
                      New Decision
                    </button>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-text-bright tracking-tight max-w-2xl uppercase italic leading-tight">
                    {decision}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:flex bg-accent-muted p-1.5 rounded-2xl border-2 border-accent/10 shadow-sm gap-1">
                  <TypeTab
                    active={selectedType === "pros-cons"}
                    onClick={() => handleAnalyze("pros-cons")}
                    label="PROS & CONS"
                  />
                  <TypeTab
                    active={selectedType === "comparison"}
                    onClick={() => handleAnalyze("comparison")}
                    label="COMPARISON"
                  />
                  <TypeTab
                    active={selectedType === "swot"}
                    onClick={() => handleAnalyze("swot")}
                    label="SWOT"
                  />
                  <TypeTab
                    active={selectedType === "verdict"}
                    onClick={() => handleAnalyze("verdict")}
                    label="VERDICT"
                  />
                </div>
              </div>

              <div className="flex-1 bg-bg-surface rounded-3xl border-2 border-accent/10 overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(117,81,57,0.1)]">
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-3 rounded-xl bg-accent text-bg-surface hover:brightness-110 transition-all flex items-center gap-2 group shadow-lg shadow-accent/20"
                    title="Copy analysis"
                  >
                    {copied ? (
                      <Check size={18} />
                    ) : (
                      <Copy
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                  {loading && (
                    <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-md z-30 flex items-center justify-center flex-col gap-6">
                      <div className="relative">
                        <Loader2
                          className="animate-spin text-accent"
                          size={64}
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-black text-text-bright tracking-tighter uppercase text-lg italic">
                          Populating Analysis...
                        </p>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-[0.2em] animate-pulse whitespace-nowrap">
                          Building decision matrices
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="max-w-7xl mx-auto space-y-12">
                    {result.structuredData ? (
                      <AnalysisDisplay
                        type={result.type}
                        data={result.structuredData}
                      />
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown>{result.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Helper Components ---

function AnalysisDisplay({ type, data }: { type: AnalysisType; data: any }) {
  if (!data) return null;

  switch (type) {
    case "comparison":
      return <ComparisonTable data={data} />;
    case "pros-cons":
      return <ProsConsDescriptive data={data} />;
    case "swot":
      return <SWOTGridView data={data} />;
    case "verdict":
      return <VerdictBullets data={data} />;
    default:
      return null;
  }
}

function ComparisonTable({
  data,
}: {
  data: { factors: string[]; comparison: any[] };
}) {
  return (
    <div className="overflow-x-auto rounded-[2rem] border-4 border-accent shadow-2xl bg-bg-panel overflow-hidden">
      <table className="w-full text-left border-collapse table-auto min-w-[600px]">
        <thead>
          <tr className="bg-accent text-bg-surface">
            <th className="p-8 font-black uppercase tracking-[0.2em] text-[12px] border-b-4 border-accent">
              Factor / Metric
            </th>
            {data.comparison.map((opt, i) => (
              <th
                key={i}
                className="p-8 font-black uppercase tracking-[0.2em] text-[12px] border-b-4 border-accent border-l-4 border-bg-surface/10 text-center"
              >
                {opt.optionName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-4 divide-accent/10">
          {data.factors.map((factor, fIdx) => (
            <tr
              key={fIdx}
              className="hover:bg-accent-muted/10 transition-colors"
            >
              <td className="p-8 font-black text-accent text-sm bg-accent-muted/5 border-r-4 border-accent/10">
                {factor}
              </td>
              {data.comparison.map((opt, oIdx) => (
                <td
                  key={oIdx}
                  className="p-8 align-middle border-l-4 border-accent/5 font-bold text-text-main text-sm text-center"
                >
                  {opt.values[fIdx]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProsConsDescriptive({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-10">
      {data.map((opt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-bg-panel border-4 border-accent/20 rounded-[2.5rem] p-10 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-bg-surface shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-3xl font-black text-text-bright tracking-tighter uppercase">
              {opt.optionName}
            </h2>
          </div>

          <p className="text-lg font-medium leading-relaxed text-text-main mb-10 italic border-l-8 border-accent pl-6 opacity-90">
            {opt.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-accent uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" /> Strategic
                Advantages
              </h3>
              <ul className="space-y-4">
                {opt.pros.map((pro: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-bg-surface border-2 border-accent/5 hover:border-accent/20 transition-all shadow-sm"
                  >
                    <CheckCircle2
                      className="text-accent shrink-0 mt-1"
                      size={18}
                    />
                    <span className="text-sm font-bold text-text-main leading-snug">
                      {pro}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black text-danger uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger" /> Potential
                Constraints
              </h3>
              <ul className="space-y-4">
                {opt.cons.map((con: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-bg-surface border-2 border-danger/5 hover:border-danger/20 transition-all shadow-sm"
                  >
                    <XCircle className="text-danger shrink-0 mt-1" size={18} />
                    <span className="text-sm font-bold text-text-main leading-snug">
                      {con}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SWOTGridView({ data }: { data: any[] }) {
  return (
    <div className="space-y-16">
      {data.map((opt, i) => (
        <div key={i} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="px-6 py-2 bg-accent text-bg-surface font-black rounded-full text-sm uppercase tracking-widest shadow-lg">
              {opt.optionName}
            </div>
            <div className="flex-1 h-1 bg-accent/10 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-panel border-4 border-accent p-8 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  Strengths
                </span>
                <span className="text-4xl font-black text-accent/20">S</span>
              </div>
              <ul className="space-y-2">
                {opt.strengths.map((s: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-danger p-8 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-danger">
                  Weaknesses
                </span>
                <span className="text-4xl font-black text-danger/20">W</span>
              </div>
              <ul className="space-y-2">
                {opt.weaknesses.map((w: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-accent p-8 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  Opportunities
                </span>
                <span className="text-4xl font-black text-accent/20">O</span>
              </div>
              <ul className="space-y-2">
                {opt.opportunities.map((o: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-danger p-8 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-danger">
                  Threats
                </span>
                <span className="text-4xl font-black text-danger/20">T</span>
              </div>
              <ul className="space-y-2">
                {opt.threats.map((t: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VerdictBullets({
  data,
}: {
  data: { winner: string; recommendation: string; keyTakeaways: string[] };
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-3xl mx-auto bg-accent text-bg-surface p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Zap size={160} />
      </div>

      <div className="relative z-10 space-y-10">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">
            The Winning Choice
          </span>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">
            {data.winner}
          </h2>
        </div>

        <p className="text-xl font-bold italic leading-tight">
          "{data.recommendation}"
        </p>

        <div className="space-y-6 pt-8 border-t border-bg-surface/20">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60">
            Analysis Takeaways
          </h3>
          <ul className="space-y-4">
            {data.keyTakeaways.map((point: string, i: number) => (
              <li
                key={i}
                className="flex items-center gap-4 text-base font-black italic"
              >
                <ArrowRight size={20} className="shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function AnalysisButton({
  title,
  icon,
  onClick,
  disabled,
  highlight = false,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-5 md:p-6 rounded-2xl flex items-center gap-4 transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed group border-4",
        highlight
          ? "bg-accent border-accent text-bg-surface hover:brightness-110 shadow-xl shadow-accent/20 active:scale-95"
          : "bg-bg-panel border-accent/10 text-text-main hover:border-accent hover:shadow-lg active:scale-95",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
          highlight ? "bg-white/10" : "bg-accent-muted text-accent",
        )}
      >
        {icon}
      </div>
      <span className="font-black text-xs md:text-sm uppercase tracking-tighter leading-tight">
        {title}
      </span>
    </button>
  );
}

function TypeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 md:px-6 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest border-2",
        active
          ? "bg-accent text-bg-surface border-accent shadow-md shadow-accent/20"
          : "bg-bg-panel text-accent border-transparent hover:bg-accent-muted",
      )}
    >
      {label}
    </button>
  );
}