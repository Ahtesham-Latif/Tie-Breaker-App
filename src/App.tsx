import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  Loader2, 
  RefreshCcw, 
  Columns, 
  Trash2, 
  Plus, 
  Sun, 
  Moon, 
  Scale as ScaleIcon, 
  Rows, 
  Copy, 
  Check, 
  PanelLeft,
  ChevronRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";
import { AnalysisType, AnalysisResult } from "./types";
import { 
  AnalysisDisplay, 
  TypeTab, 
  AnalysisButton, 
  WelcomeModal,
  SidebarHistory,
  AuthWallModal
} from "./components";
import { AuthModal } from "./components/modals/AuthModal";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./db/supabase";
import { User as UserIcon, LogOut, Clock, ArrowLeft } from "lucide-react";


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
    throw new Error("It seems our AI was a bit lost for words. Please try your analysis again! (Err: AI-EMPTY-01)");
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
  const { user, signOut } = useAuth();
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // --- TOUCH SWIPE LOGIC ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !isMobile || !isSidebarOpen) return;
    const currentTouchX = e.targetTouches[0].clientX;
    const diff = touchStartX - currentTouchX;

    // If user swipes left by more than 50px, close the drawer
    if (diff > 50) {
      setIsSidebarOpen(false);
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  const handleAnalyze = async (type: AnalysisType = selectedType) => {
    setIsSidebarOpen(false);
    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();
    const validFactors = options.filter((o) => o.trim()).map(f => f.toLowerCase()).sort();

    if (!trimmedA || !trimmedB) {
      setValidationError("Please enter both options so I can properly break the tie for you! (Err: VAL-INPUT-01)");
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

    if (!user && usageCount >= 3) {
      setShowAuthWall(true);
      return;
    }

    if (user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, ties_count')
          .eq('id', user.id)
          .single();
          
        if (profile && profile.plan === 'free' && profile.ties_count >= 15) {
          setValidationError("You've reached your limit of 15 ties on the free plan. We hope you've enjoyed the insights! (Err: VAL-PLAN-01)");
          return;
        }
      } catch (err) {
        console.warn("Failed to check plan limits", err);
      }
    }

    if (loadingTypes[type]) {
      setSelectedType(type);
      setHasStarted(true);
      return;
    }

    // 2. Supabase DB Cache Check
    if (user) {
      try {
        const columnName = `${type.replace('-', '_')}_data`;
        const { data: dbData } = await supabase
          .from('decisions')
          .select(columnName)
          .eq('user_id', user.id)
          .eq('query', decisionQuery)
          .single();
          
        const dataRecord = dbData as Record<string, any>;
        if (dataRecord && dataRecord[columnName]) {
          const structuredData = dataRecord[columnName];
          const newResult = {
            type,
            content: "Loaded from your history.",
            structuredData,
            factors: validFactors,
          };
          
          setAnalysisCache((prev) => ({ ...prev, [cacheKey]: newResult }));
          setSelectedType(type);
          setHasStarted(true);
          setValidationError(null);
          return;
        }
      } catch (e) {
        console.warn("DB Cache check failed", e);
      }
    }

    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const remaining = Math.ceil(
        (RATE_LIMIT_MS - (now - lastRequestTime)) / 1000,
      );
      setValidationError(
        `Please give me a moment to breathe! I can analyze again in ${remaining}s. (Err: VAL-RATE-01)`,
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
        throw new Error("I had trouble identifying two distinct options to compare. Could you please clarify your choices? (Err: AI-ENT-01)");
      }

      const newResult = {
        type,
        content,
        structuredData,
        factors: validFactors,
      };

      // 3. Save to Supabase DB in the background
      if (user && structuredData) {
        const columnName = `${type.replace('-', '_')}_data`;
        supabase.from('decisions')
          .select('id')
          .eq('user_id', user.id)
          .eq('query', decisionQuery)
          .single()
          .then(({ data }) => {
            if (data?.id) {
              supabase.from('decisions').update({
                [columnName]: structuredData,
                factors: validFactors,
                my_case: myCase
              }).eq('id', data.id).then();
            } else {
              supabase.from('decisions').insert({
                user_id: user.id,
                query: decisionQuery,
                factors: validFactors,
                my_case: myCase,
                [columnName]: structuredData
              }).then();
            }
          });
      }

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
      
      setHasStarted(true);
      
      // Auto-scroll to results on mobile after calculate
      if (isMobile) {
        setTimeout(() => setIsSidebarOpen(false), 100);
      }

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
  

  const handleLoadDecision = (dbDecision: any) => {
    const [a, b] = dbDecision.query.split(" vs ");
    setOptionA(a || "");
    setOptionB(b || "");
    setOptions(dbDecision.factors?.length ? [...dbDecision.factors, ""] : ["", ""]);
    setMyCase(dbDecision.my_case || "");

    const validFactors = dbDecision.factors || [];
    const canonicalDecision = dbDecision.query
      .toLowerCase()
      .replace(/\b(vs|and|or)\b|&/g, " ")
      .split(/\s+/)
      .sort()
      .join(" ");

    // Pre-populate the local cache with the DB data
    setAnalysisCache(prev => ({
      ...prev,
      [`comparison-${canonicalDecision}-${validFactors.join("|")}`]: { type: "comparison", content: "", structuredData: dbDecision.comparison_data, factors: validFactors },
      [`pros-cons-${canonicalDecision}-${validFactors.join("|")}`]: { type: "pros-cons", content: "", structuredData: dbDecision.pros_cons_data, factors: validFactors },
      [`swot-${canonicalDecision}-${validFactors.join("|")}`]: { type: "swot", content: "", structuredData: dbDecision.swot_data, factors: validFactors },
      [`verdict-${canonicalDecision}-${validFactors.join("|")}`]: { type: "verdict", content: "", structuredData: dbDecision.verdict_data, factors: validFactors },
    }));

    setSelectedType("pros-cons");
    setHasStarted(true);
    setIsSidebarOpen(false);
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
        "flex h-dvh w-full overflow-hidden transition-colors duration-500 text-text-main bg-bg-base font-sans selection:bg-accent/20 selection:text-accent",
        theme === "dark" ? "dark bg-bg-base" : "bg-bg-base",
        !isMobile && "md:h-screen md:overflow-hidden", // Locked height only on desktop
      )}
    >
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
        {showAuthWall && (
          <AuthWallModal 
            onClose={() => setShowAuthWall(false)} 
            onAuthenticate={() => {
              setShowAuthWall(false);
              setShowAuthModal(true);
            }} 
          />
        )}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => setShowAuthModal(false)} 
        />
      </AnimatePresence>



      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Edge Handle (Swipe affordance) */}
      {isMobile && !isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 w-6 h-24 bg-bg-surface border-y border-r border-border-dim rounded-r-xl z-40 flex items-center justify-center cursor-pointer shadow-lg group hover:w-8 transition-all duration-300 flex-col gap-1"
          title="Open Inputs"
        >
          <div className="w-1 h-1.5 bg-border-dim rounded-full group-hover:bg-accent transition-colors" />
          <div className="w-1 h-3 bg-border-dim rounded-full group-hover:bg-accent transition-colors" />
          <div className="w-1 h-1.5 bg-border-dim rounded-full group-hover:bg-accent transition-colors" />
        </div>
      )}

      {/* Main Container */}
      <div className="flex h-full w-full relative">

      {/* Sidebar - Inputs */}
      <motion.aside 
        className={cn(
          "bg-bg-surface border-border-dim flex flex-col shrink-0 z-50",
          
          // --- MOBILE LOGIC ---
          isMobile && !hasStarted && "relative w-full border-b p-4 sm:p-6",
          isMobile && hasStarted && "fixed inset-y-0 left-0 shadow-2xl z-60 h-dvh w-[85vw] max-w-100 border-r p-4 sm:p-6",
          
          // --- LAPTOP LOGIC ---
          !isMobile && "relative h-full border-r shadow-sm",
          !isMobile && isSidebarOpen && "w-1/3 lg:max-w-[450px] p-6 opacity-100",
          !isMobile && !isSidebarOpen && "w-0 p-0 overflow-hidden border-r-0 opacity-0"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={false}
        animate={{
          x: isMobile && hasStarted ? (isSidebarOpen ? "0%" : "-100%") : "0%"
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
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

          <div className="flex items-center gap-3">
            {isMobile && hasStarted && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent hover:text-bg-surface transition-all"
              >
                Results <ChevronRight size={14} />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-accent-muted text-accent hover:bg-accent hover:text-bg-surface transition-all shadow-sm"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {!showHistoryView ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
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

              <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between mb-2">
                The Contenders
              </label>
              <div className="flex flex-col gap-3">
                <textarea
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  maxLength={100}
                  placeholder="Option A (e.g. iPhone 15 Pro Max)"
                  rows={1}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-10"
                />
                <div className="text-center text-[10px] font-black uppercase text-text-dim/50 tracking-widest">
                  VS
                </div>
                <textarea
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  maxLength={100}
                  placeholder="Option B (e.g. Galaxy S24 Ultra)"
                  rows={1}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-10"
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
                  rows={2}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-15"
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
                        className="w-full bg-bg-panel border-2 border-transparent rounded-lg px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner"
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

            <div className="pt-4 shrink-0 mt-auto">
              <button
                onClick={() => handleAnalyze(selectedType)}
                disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
                className="w-full py-3.5 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2"
              >
                {isAnyLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCcw size={16} />
                )}
                Calculate Analysis
              </button>
              
              {user && (
                <button 
                  onClick={() => setShowHistoryView(true)}
                  className="mt-3 w-full py-3 bg-bg-panel border border-border-dim text-accent rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/10 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <Clock size={16} /> My History
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <button 
              onClick={() => setShowHistoryView(false)}
              className="mb-4 w-full py-3 bg-bg-panel border border-border-dim text-text-main rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/10 hover:text-accent transition-colors flex justify-center items-center gap-2 shrink-0 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Inputs
            </button>
            <SidebarHistory 
              onLoadDecision={(decision) => {
                handleLoadDecision(decision);
                setShowHistoryView(false);
              }} 
              onShowAuth={() => setShowAuthModal(true)} 
            />
          </div>
        )}
        </div>
      </motion.aside>

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
        isMobile && !hasStarted && "hidden", // On mobile, hide results area until started
        !isMobile && "overflow-hidden"
      )}>

        {/* Top Right Desktop Auth Button */}
        {!isMobile && (
          <div className="hidden md:flex justify-end pt-6 pr-8 w-full z-40 shrink-0">
            {user ? (
               <div className="flex items-center gap-4 bg-bg-surface/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-accent/20 shadow-lg shadow-accent/5">
                 <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                   <UserIcon size={12} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-bright leading-none">
                     {user.email?.split('@')[0]}
                   </span>
                   <span className="text-[8px] font-bold text-accent uppercase tracking-widest mt-0.5">Pro Member</span>
                 </div>
                 <button 
                   onClick={signOut}
                   className="ml-2 p-1.5 text-text-muted hover:text-danger bg-bg-panel rounded-full transition-colors"
                 >
                   <LogOut size={12} />
                 </button>
               </div>
            ) : (
               <button 
                 onClick={() => setShowAuthModal(true)}
                 className="px-6 py-2.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-accent-muted"
               >
                 <UserIcon size={14} /> Log In / Sign Up
               </button>
            )}
          </div>
        )}
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center p-6 md:p-12"
            >
              <div className="max-w-2xl text-center flex flex-col items-center">
                <div className="inline-block px-4 py-1.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest leading-none mb-6 shadow-lg shadow-accent/20">
                  AI Decision Engine
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-text-bright tracking-tighter leading-[0.85] uppercase mb-6">
                  Break The <br />
                  <span className="text-accent underline decoration-8 underline-offset-8 decoration-accent/20">
                    Tie
                  </span>{" "}
                  Today 🥴
                </h1>
                <p className="text-lg md:text-xl text-text-main font-semibold leading-relaxed opacity-70 mb-8">
                  Stuck between two options? Let our AI analyze the pros, cons,
                  and key factors to help you make the best choice with
                  confidence.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col p-3 md:p-4 h-full bg-bg-base"
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
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="px-1.5 py-1 rounded-md border bg-bg-panel text-accent border-accent/20 hover:bg-accent/10 transition-all flex items-center justify-center gap-1 shadow-sm"
                      title="Toggle Input Drawer"
                    >
                      <PanelLeft size={12} className={cn("transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {isSidebarOpen ? "Hide" : "Input"}
                      </span>
                    </button>
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
    </div>
  );
}

