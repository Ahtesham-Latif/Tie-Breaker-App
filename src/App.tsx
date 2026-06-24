import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale,
  CheckCircle2,
  XCircle,
  Columns,
  Rows,
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
import { AnalysisType, AnalysisResult } from "./types";
import { 
  AnalysisDisplay, 
  TypeTab, 
  AnalysisButton, 
  WelcomeModal, 
  AuthWallModal 
} from "./components";


// --- AI Service ---

/**
 * Updated to call the backend proxy instead of direct OpenRouter access
 */
async function analyzeDecision(
  decision: string,
  type: AnalysisType,
  factors: string[],
  useWebSearch: boolean,
  contextData?: any,
  myCase?: string
): Promise<{ content: string; structuredData?: any }> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, type, factors, useWebSearch, contextData, myCase }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch analysis from server';
    const contentType = response.headers.get("content-type");
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorBody = await response.json();
        if (errorBody && errorBody.error) {
          errorMessage = errorBody.error;
        }
      } else {
        errorMessage = await response.text();
      }
    } catch (jsonError) {
      console.warn('Server error response was not JSON:', jsonError);
    }
    throw new Error(`${errorMessage} (Status: ${response.status})`);
  }

  const { content } = await response.json();
  const text = content?.trim() || "";

  if (!text) {
    throw new Error('The AI engine returned an empty response. Please try again.');
  }

  // Robust parsing logic to handle potential markdown wrappers or thinking blocks
  try {
    const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                      cleanedText.match(/{[\s\S]*}/);
    
    const jsonToParse = jsonMatch ? (jsonMatch[1] || jsonMatch[0]).trim() : cleanedText;
    const data = JSON.parse(jsonToParse);

    return { content: text, structuredData: data };
  } catch (e) {
    console.error("Failed to parse JSON", e, text);
    return { content: text, structuredData: null };
  }
}

/**
 * Utility to format analysis results for human-readable clipboard copying.
 */
function formatForClipboard(result: AnalysisResult): string {
  const { type, structuredData, content } = result;
  if (!structuredData) return content;

  let text = "";

  switch (type) {
    case "pros-cons":
      text = "Pros & Cons Analysis\n\n";
      const prosConsResults = structuredData.results || structuredData;
      prosConsResults.forEach((opt: any) => {
        text += `${opt.optionName}\n\n`;
        text += `Summary\n${opt.summary}\n\n`;
        text += "Pros\n";
        opt.pros.forEach((p: string) => (text += `• ${p}\n`));
        text += "\nCons\n";
        opt.cons.forEach((c: string) => (text += `• ${c}\n`));
        text += "\n";
      });
      break;

    case "comparison":
      text = "Comparison Analysis\n\n";
      const { factors, comparison } = structuredData;
      factors.forEach((factor: string, i: number) => {
        text += `${factor}\n`;
        comparison.forEach((opt: any) => {
          text += `• ${opt.optionName}: ${opt.values[i]}\n`;
        });
        text += "\n";
      });
      break;

    case "swot":
      text = "SWOT Analysis\n\n";
      const swotResults = structuredData.results || structuredData;
      swotResults.forEach((opt: any) => {
        text += `${opt.optionName}\n\n`;
        text += "Strengths\n";
        opt.strengths.forEach((s: string) => (text += `• ${s}\n`));
        text += "\nWeaknesses\n";
        opt.weaknesses.forEach((w: string) => (text += `• ${w}\n`));
        text += "\nOpportunities\n";
        opt.opportunities.forEach((o: string) => (text += `• ${o}\n`));
        text += "\nThreats\n";
        opt.threats.forEach((t: string) => (text += `• ${t}\n`));
        text += "\n";
      });
      break;

    case "verdict":
      text = "The Final Verdict\n\n";
      text += `Winner: ${structuredData.winner}\n\n`;
      text += `Recommendation\n${structuredData.recommendation}\n\n`;
      text += "Key Takeaways\n";
      structuredData.keyTakeaways.forEach((t: string) => (text += `• ${t}\n`));
      break;

    default:
      text = content;
  }

  return text.trim();
}

// --- Components ---

export default function App() {
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [myCase, setMyCase] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState<Record<string, boolean>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedType, setSelectedType] = useState<AnalysisType>("pros-cons");
  const [copied, setCopied] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  const [analysisCache, setAnalysisCache] = useState<
    Record<string, AnalysisResult>
  >({});

  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    const welcomed = localStorage.getItem("tiebreaker_welcomed");
    if (!welcomed) {
      setShowWelcome(true);
    }
    const count = parseInt(localStorage.getItem("tiebreaker_usage_count") || "0", 10);
    setUsageCount(count);
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("tiebreaker_welcomed", "true");
    setShowWelcome(false);
  };

  const RATE_LIMIT_MS = 10000;
  const MAX_CACHE_SIZE = 30;

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

  const handleAddFactor = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };
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

  const addNotification = (text: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    // Auto-remove after 4 seconds
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleAnalyze = async (type: AnalysisType = selectedType) => {
    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();
    const validFactors = options.filter((o) => o.trim()).map(f => f.toLowerCase()).sort();

    if (!trimmedA || !trimmedB) {
      setValidationError("Please enter both options to break the tie.");
      return;
    }

    const decisionQuery = `${trimmedA} vs ${trimmedB}`;
    // Canonical normalization of the decision for the cache key
    const canonicalDecision = decisionQuery
      .toLowerCase()
      .replace(/\b(vs|and|or)\b|&/g, " ")
      .split(/\s+/)
      .sort()
      .join(" ");
    const cacheKey = `${type}-${canonicalDecision}-${validFactors.join("|")}`;

    if (analysisCache[cacheKey]) {
      setSelectedType(type);
      setHasStarted(true);
      setValidationError(null);
      // Promote to end of object (LRU behavior)
      setAnalysisCache((prev) => {
        const { [cacheKey]: hit, ...rest } = prev;
        return { ...rest, [cacheKey]: hit };
      });
      return;
    }

    if (usageCount >= 3) {
      setShowAuthWall(true);
      return;
    }

    if (loadingTypes[type]) {
      setSelectedType(type);
      setHasStarted(true);
      return;
    }

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

    setSelectedType(type);
    setHasStarted(true);
    setValidationError(null);
    setLoadingTypes((prev) => ({ ...prev, [type]: true }));
    setLastRequestTime(now);

    try {
      let contextData = null;
      if (type === "verdict") {
        contextData = {
          comparison: analysisCache[`comparison-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
          prosCons: analysisCache[`pros-cons-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
          swot: analysisCache[`swot-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
        };
      }

      const { content, structuredData } = await analyzeDecision(
        decisionQuery,
        type,
        validFactors,
        useWebSearch,
        contextData,
        myCase
      );

      if (structuredData?.entities?.length < 2 && (type === "comparison" || type === "verdict")) {
        throw new Error("Analysis failed: Could not identify multiple entities for comparison.");
      }

      const newResult = {
        type,
        content,
        structuredData,
        factors: validFactors,
      };

      setAnalysisCache((prev) => {
        // Implementation of LRU via Map-like object behavior
        const next = { ...prev };
        if (next[cacheKey]) delete next[cacheKey];
        next[cacheKey] = newResult;

        const keys = Object.keys(next);
        if (keys.length > MAX_CACHE_SIZE) {
          delete next[keys[0]];
        }
        return next;
      });
      
      addNotification(`${type.replace("-", " ").toUpperCase()} analysis ready!`);

      setUsageCount(prev => {
        const next = prev + 1;
        localStorage.setItem("tiebreaker_usage_count", next.toString());
        return next;
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "";
      const errorContent = (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED"))
        ? "## Quota Exceeded\n\nThe AI service is currently at its limit. Please wait a moment and try again later."
        : errorMessage.includes("Too many requests") // Check for server-side rate limit message
          ? "## Rate Limit Exceeded\n\n" + errorMessage
          : `## Connection Error\n\nFailed to connect to the analysis server. ${errorMessage || "Please ensure your backend server is running on port 8080."}`;

      setAnalysisCache(prev => ({
        ...prev, 
        [cacheKey]: { type, content: errorContent, structuredData: null }
      }));
    } finally {
      setLoadingTypes((prev) => ({ ...prev, [type]: false }));
    }
  };

  const reset = () => {
    setHasStarted(false);
    setAnalysisCache({});
    setLoadingTypes({});
    setOptionA("");
    setOptionB("");
    setMyCase("");
    setOptions(["", ""]);
  };

  const handleCopy = async () => {
    const validFactors = options.filter((o) => o.trim()).map((f) => f.toLowerCase()).sort();
    const canonicalDecision = `${optionA.trim()} vs ${optionB.trim()}`
      .toLowerCase()
      .replace(/\b(vs|and|or)\b|&/g, " ")
      .split(/\s+/)
      .sort()
      .join(" ");
    const currentCacheKey = `${selectedType}-${canonicalDecision}-${validFactors.join("|")}`;
    const currentResult = analysisCache[currentCacheKey];
    if (currentResult) {
      const textToCopy = formatForClipboard(currentResult);
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for non-HTTPS local network testing (e.g., 192.168.x.x)
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
          } catch (err) {
            console.error('Fallback copy failed', err);
          }
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };
  

  const validFactorsForSearch = options.filter((o) => o.trim()).map((f) => f.toLowerCase()).sort();
  const canonicalSearchDecision = `${optionA.trim()} vs ${optionB.trim()}`
    .toLowerCase()
    .replace(/\b(vs|and|or)\b|&/g, " ")
    .split(/\s+/)
    .sort()
    .join(" ");
  const activeCacheKey = `${selectedType}-${canonicalSearchDecision}-${validFactorsForSearch.join("|")}`;
  const currentResult = analysisCache[activeCacheKey];
  const isCurrentTypeLoading = !!loadingTypes[selectedType];
  const isAnyLoading = Object.values(loadingTypes).some(Boolean);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row min-h-screen bg-bg-base text-text-main font-sans selection:bg-accent selection:text-white transition-colors duration-300",
        "md:h-screen md:overflow-hidden", // Locked height only on desktop
      )}
    >
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
        {showAuthWall && <AuthWallModal onClose={() => setShowAuthWall(false)} />}
      </AnimatePresence>

      {/* Sidebar - Inputs */}
      <aside className={cn(
        "w-full md:w-1/3 lg:max-w-[450px] bg-bg-surface border-b md:border-b-0 md:border-r border-border-dim flex flex-col p-6 shrink-0 shadow-sm z-20 relative transition-all duration-300",
        hasStarted && "hidden md:flex" // Hide sidebar on mobile when result appears
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
            <label className="text-[11px] font-bold uppercase tracking-widest text-accent block">
              The Contenders
            </label>
            <div className="flex flex-col gap-3">
              <textarea
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                maxLength={100}
                placeholder="Option A (e.g. iPhone 15 Pro Max)"
                rows={2}
                className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-[60px]"
              />
              <div className="text-center text-[10px] font-black uppercase text-text-dim/50 tracking-widest">
                VS
              </div>
              <textarea
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                maxLength={100}
                placeholder="Option B (e.g. Galaxy S24 Ultra)"
                rows={2}
                className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-[60px]"
              />
            </div>
            
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between mb-2">
                My Case / Context
                <span className="opacity-40 lowercase font-medium text-[9px] tracking-normal">
                  Optional (Max 500 words)
                </span>
              </label>
              <textarea
                value={myCase}
                maxLength={3000}
                onChange={(e) => {
                  // Limit to ~500 words simply by counting spaces
                  const words = e.target.value.trim().split(/\s+/).length;
                  if (words <= 500 || e.target.value.length < myCase.length) {
                    setMyCase(e.target.value);
                  }
                }}
                placeholder="E.g. I am a student with a tight budget looking for a device that lasts 4 years."
                rows={3}
                className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-[80px]"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer mt-3 group w-fit">
              <input 
                type="checkbox" 
                checked={useWebSearch} 
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-main opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                🌐 Deep Web Search 
                <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest border border-accent/20">SLOWER</span>
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between">
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
                    maxLength={25}
                    placeholder={`Factor ${idx + 1} (e.g. Cost)`}
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
              {options.length < 6 && (
                <button
                  onClick={handleAddFactor}
                  className="w-full flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-accent/20 text-accent hover:border-accent hover:bg-accent-muted transition-all text-xs font-bold"
                >
                  <Plus size={16} className="mr-2" />
                  Add Option
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => handleAnalyze(selectedType)}
          disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
          className="mt-6 w-full py-4 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2"
        >
          {isAnyLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}
          Calculate Analysis
        </button>
      </aside>

      {/* Floating Notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-accent text-bg-surface px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/10 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {n.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Content - Results */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 bg-bg-base relative z-10",
        !hasStarted && "hidden md:flex", // On mobile, hide results area until started
        "md:overflow-hidden"
      )}>
        <AnimatePresence mode="wait">
          {!hasStarted ? (
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
                    disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
                  />
                  <AnalysisButton
                    title="Comparison"
                    icon={<Columns size={18} />}
                    onClick={() => handleAnalyze("comparison")}
                    disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
                  />
                  <AnalysisButton
                    title="SWOT"
                    icon={<Zap size={18} />}
                    onClick={() => handleAnalyze("swot")}
                    disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
                  />
                  <AnalysisButton
                    title="The Verdict"
                    icon={<ArrowRight size={18} />}
                    onClick={() => handleAnalyze("verdict")}
                    disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
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
              className="flex-1 flex flex-col p-3 md:p-10 h-full bg-bg-base"
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
                    {optionA} <span className="text-accent text-sm mx-2">VS</span> {optionB}
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
                <div className="flex justify-between items-center p-2 border-b-2 border-accent/5 bg-bg-surface z-20 shadow-sm">
                  <div className="pl-1 pr-2 font-black text-accent uppercase tracking-wider text-[10px] md:text-xs opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">
                    {selectedType === "pros-cons" && "Pros & Cons"}
                    {selectedType === "comparison" && "Comparison"}
                    {selectedType === "swot" && "SWOT"}
                    {selectedType === "verdict" && "Verdict"}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={toggleTheme}
                      className="px-1.5 py-1 rounded-md border bg-bg-panel text-accent border-accent/20 hover:bg-accent/10 transition-all flex items-center gap-1 shadow-sm"
                      title="Toggle Theme"
                    >
                      {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {theme === "light" ? "Dark" : "Light"}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsSideBySide(!isSideBySide)}
                      className={cn(
                        "px-1.5 py-1 rounded-md border transition-all flex items-center gap-1 shadow-sm",
                        isSideBySide 
                          ? "bg-accent text-bg-surface border-accent/20" 
                          : "bg-bg-panel text-accent border-accent/20 hover:bg-accent/10"
                      )}
                      title={isSideBySide ? "Show items stacked" : "Show items side by side"}
                    >
                      {isSideBySide ? <Rows size={12} /> : <Columns size={12} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {isSideBySide ? "Stack" : "Split"}
                      </span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-1.5 py-1 rounded-md bg-accent text-bg-surface hover:brightness-110 transition-all flex items-center gap-1 group shadow-sm"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check size={12} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "flex-1 overflow-y-auto custom-scrollbar",
                  isSideBySide ? "p-1 md:p-4" : "p-4 md:p-12"
                )}>
                  {isCurrentTypeLoading && !currentResult && (
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
                    {currentResult ? (
                      currentResult.structuredData ? (
                        <AnalysisDisplay
                          type={currentResult.type}
                          data={currentResult.structuredData}
                          isSideBySide={isSideBySide}
                        />
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown>{currentResult.content}</ReactMarkdown>
                        </div>
                      )
                    ) : (
                       !isCurrentTypeLoading && (
                         <div className="text-center opacity-20 py-20 font-black uppercase tracking-widest">Select an analysis type to begin</div>
                       )
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

