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
  AuthWallModal,
  LoaderSkeleton,
  Tooltip
} from "./components";
import { AuthModal } from "./components/modals/AuthModal";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./db/supabase";
import { User as UserIcon, LogOut, Clock, ArrowLeft, Lock } from "lucide-react";


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
  myCase?: string,
  token?: string
): Promise<{ content: string; structuredData?: any }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers,
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

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Failed to initialize stream reader");
  
  const decoder = new TextDecoder();
  let finalResult: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Split by double newline for SSE events, or fallback to single
    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      
      try {
        const payloadStr = line.slice(6).trim();
        if (!payloadStr) continue;
        
        const parsed = JSON.parse(payloadStr);
        
        if (parsed.status === 'error') {
          throw new Error(parsed.error || 'Unknown streaming error');
        } else if (parsed.status === 'complete') {
          finalResult = JSON.parse(parsed.content);
        }
      } catch (e) {
         if (e instanceof Error && e.message !== "Unexpected end of JSON input" && !e.message.includes("Unexpected token")) {
             throw e; // Rethrow actual streaming errors we constructed
         }
      }
    }
  }

  if (!finalResult) {
    throw new Error("Connection closed before analysis completed. (Err: AI-STREAM-01)");
  }
  
  return { content: "Analysis complete.", structuredData: finalResult };
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
  const [loadingTypes, setLoadingTypes] = useState<Record<string, number>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedType, setSelectedType] = useState<AnalysisType>("pros-cons");
  const [copied, setCopied] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setSelectedType(type);
    setIsSidebarOpen(false);
    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();
    const validFactors = options.filter((o) => o.trim()).map(f => f.toLowerCase()).sort();

    if (!trimmedA || !trimmedB) {
      setValidationError("Please enter both options so I can properly break the tie for you! (Err: VAL-INPUT-01)");
      setIsSidebarOpen(true);
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
      setIsSidebarOpen(true);
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
          setIsSidebarOpen(true);
          return;
        }
      } catch (err) {
        console.warn("Failed to check plan limits", err);
      }
    }

    if (loadingTypes[type]) {
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
          .ilike('query', decisionQuery)
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
          setHasStarted(true);
          setValidationError(null);
          return;
        }
      } catch (e) {
        console.warn("DB Cache check failed", e);
      }
    }

    const now = Date.now();
    setHasStarted(true);
    setValidationError(null);
    setLoadingTypes((prev) => ({ ...prev, [type]: Date.now() }));

    try {
      let contextData = null;
      if (type === "verdict") {
        contextData = {
          comparison: analysisCache[`comparison-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
          prosCons: analysisCache[`pros-cons-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
          swot: analysisCache[`swot-${canonicalDecision}-${validFactors.join("|")}`]?.structuredData,
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const { content, structuredData } = await analyzeDecision(
        decisionQuery,
        type,
        validFactors,
        useWebSearch,
        contextData,
        myCase,
        token
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
                [columnName]: structuredData
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
      
      if (errorMessage.includes("Error Code: QUOTA-") || errorMessage.includes("Error Code: AUTH-")) {
        setValidationError(errorMessage.split(" (Status:")[0]);
      } else if (errorMessage.includes("content management policy") || errorMessage.includes("ERR-04-SAFETY")) {
        setValidationError("Oops! It looks like your inputs hit our AI's safety filters. Please try rephrasing your choices or factors to be more family-friendly. (Err: AI-FILTER-01)");
      } else if (errorMessage.includes("Too many requests") || errorMessage.includes("VAL-RATE")) {
        setValidationError("You're moving too fast! Please slow down and try again shortly. (Err: API-RATE-01)");
      } else if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        setValidationError("Our AI engine is currently catching its breath due to high demand. Please give it a few moments and try again! (Err: API-429-01)");
      } else {
        setValidationError(errorMessage.split(" (Status:")[0] || "We ran into a connection issue with the analysis server. Please check your network and try again. (Err: API-NET-01)");
      }
      
      // If the cache is completely empty, it means their very first request failed.
      // We send them back to the Hero screen. Otherwise, they are already in the
      // Dashboard, so keep them there and just open the sidebar to show the error.
      if (Object.keys(analysisCache).length === 0) {
        setHasStarted(false);
      }
      setIsSidebarOpen(true);
      
      // Scroll to the top so the validation error is perfectly visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Enforce an auto-clear for the message
      setTimeout(() => {
        setValidationError(null);
      }, 10000);
      
    } finally {
      setLoadingTypes((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    }
  };

  const reset = () => {
    setHasStarted(false);
    setIsSidebarOpen(true);
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
    const lastVsIndex = dbDecision.query.lastIndexOf(" vs ");
    const a = lastVsIndex !== -1 ? dbDecision.query.substring(0, lastVsIndex) : dbDecision.query;
    const b = lastVsIndex !== -1 ? dbDecision.query.substring(lastVsIndex + 4) : "";
    
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

    // Pre-populate the local cache ONLY with the data that actually exists in the DB
    setAnalysisCache(prev => {
      const next = { ...prev };
      if (dbDecision.comparison_data) {
        next[`comparison-${canonicalDecision}-${validFactors.join("|")}`] = { type: "comparison", content: "", structuredData: dbDecision.comparison_data, factors: validFactors };
      }
      if (dbDecision.pros_cons_data) {
        next[`pros-cons-${canonicalDecision}-${validFactors.join("|")}`] = { type: "pros-cons", content: "", structuredData: dbDecision.pros_cons_data, factors: validFactors };
      }
      if (dbDecision.swot_data) {
        next[`swot-${canonicalDecision}-${validFactors.join("|")}`] = { type: "swot", content: "", structuredData: dbDecision.swot_data, factors: validFactors };
      }
      if (dbDecision.verdict_data) {
        next[`verdict-${canonicalDecision}-${validFactors.join("|")}`] = { type: "verdict", content: "", structuredData: dbDecision.verdict_data, factors: validFactors };
      }
      return next;
    });

    // Intelligently select the first tab that actually has data so the UI doesn't show blank
    let defaultType: AnalysisType = "pros-cons";
    if (dbDecision.pros_cons_data) defaultType = "pros-cons";
    else if (dbDecision.comparison_data) defaultType = "comparison";
    else if (dbDecision.swot_data) defaultType = "swot";
    else if (dbDecision.verdict_data) defaultType = "verdict";

    setSelectedType(defaultType);
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
          onSuccess={(isSignUp) => {
            if (isSignUp) {
              setShowWelcome(true);
            }
            setShowAuthModal(false);
          }}
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
          !isMobile && isSidebarOpen && "w-1/3 lg:max-w-112.5 p-6 opacity-100",
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
                title="Show Analysis Results"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent hover:text-bg-surface transition-all"
              >
                Results <ChevronRight size={14} />
              </button>
            )}
            <Tooltip content="Toggle Theme" position="bottom">
              <button
                aria-label="Toggle Theme"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-accent-muted text-accent hover:bg-accent hover:text-bg-surface transition-all shadow-sm"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </Tooltip>
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
                  title="Enter your first option (Option A)"
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
                  title="Enter your second option (Option B)"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  maxLength={100}
                  placeholder="Option B (e.g. Galaxy S24 Ultra)"
                  rows={1}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-10"
                />
              </div>
              
              {user ? (
                <div className="mt-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between mb-2">
                    My Case / Context
                    <span className="opacity-40 lowercase font-medium text-[9px] tracking-normal">
                      Optional (Max 500 words)
                    </span>
                  </label>
                  <textarea
                    title="Enter personalized context for the AI (My Case)"
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
              ) : (
                <div className="mt-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between mb-2">
                    My Case / Context
                    <span className="opacity-60 font-black text-[9px] tracking-wider text-accent flex items-center gap-1 uppercase bg-accent/10 px-2 py-0.5 rounded-md">
                      <Lock size={10} /> Member Only
                    </span>
                  </label>
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={() => setShowAuthModal(true)}
                  >
                    <textarea
                      disabled
                      placeholder="E.g. I am a student with a tight budget looking for a device that lasts 4 years."
                      rows={2}
                      className="w-full bg-bg-panel border-2 border-dashed border-border-dim rounded-xl px-4 py-2 text-sm text-text-main font-semibold shadow-inner resize-none min-h-15 cursor-pointer group-hover:border-accent/50 transition-colors pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/20 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-accent text-bg-surface px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                        <UserIcon size={12} /> Log In to Unlock
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <label className="flex items-center gap-2 cursor-pointer mt-3 group w-fit">
                <input 
                  title="Enable Deep Web Search for real-time data"
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
                        title={`Comparison Factor ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        maxLength={25}
                        placeholder={`Factor ${idx + 1} (e.g. Cost)`}
                        className="w-full bg-bg-panel border-2 border-transparent rounded-lg px-4 py-2 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner"
                      />
                      {options.length > 2 && (
                        <Tooltip content="Remove this factor" position="top">
                          <button
                            onClick={() => handleRemoveOption(idx)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-danger opacity-100 md:opacity-0 group-hover/opt:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                  {options.length < 6 && (
                    <button
                      title="Add another comparison factor"
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
                title="Calculate Decision Analysis"
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
                  title="View your saved history"
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
              title="Return to input form"
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
                   <span className="text-[8px] font-bold text-accent uppercase tracking-widest mt-0.5">Member Only</span>
                 </div>
                 <Tooltip content="Log Out" position="bottom">
                   <button 
                     onClick={signOut}
                     className="ml-2 p-1.5 text-text-muted hover:text-danger bg-bg-panel rounded-full transition-colors"
                   >
                     <LogOut size={12} />
                   </button>
                 </Tooltip>
               </div>
            ) : (
               <button 
                 title="Log In or Create an Account"
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
                    <Tooltip content="Toggle Theme" position="bottom">
                      <button
                        aria-label="Toggle Theme"
                        onClick={toggleTheme}
                        className="p-1 rounded-md bg-accent-muted text-accent hover:bg-accent hover:text-bg-surface transition-all shadow-sm"
                      >
                        {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                      </button>
                    </Tooltip>
                    <span className="px-3 py-1 bg-accent text-bg-surface rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
                      {selectedType.replace("-", " ")} Mode
                    </span>
                    <button
                      title="Start a new blank decision"
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
                    <Tooltip content={isSidebarOpen ? "Hide" : "Input"} position="bottom">
                      <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="px-1.5 py-1 rounded-md border bg-bg-panel text-accent border-accent/20 hover:bg-accent/10 transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <PanelLeft size={12} className={cn("transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {isSidebarOpen ? "Hide" : "Input"}
                        </span>
                      </button>
                    </Tooltip>
                    
                    <Tooltip content={isSideBySide ? "Show items stacked" : "Show items side by side"} position="bottom">
                      <button
                        onClick={() => setIsSideBySide(!isSideBySide)}
                        className={cn(
                          "px-1.5 py-1 rounded-md border transition-all flex items-center gap-1 shadow-sm",
                          isSideBySide 
                            ? "bg-accent text-bg-surface border-accent/20" 
                            : "bg-bg-panel text-accent border-accent/20 hover:bg-accent/10"
                        )}
                      >
                        {isSideBySide ? <Rows size={12} /> : <Columns size={12} />}
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {isSideBySide ? "Stack" : "Split"}
                        </span>
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Copy to clipboard" position="bottom">
                      <button
                        onClick={handleCopy}
                        className="px-1.5 py-1 rounded-md bg-accent text-bg-surface hover:brightness-110 transition-all flex items-center gap-1 group shadow-sm"
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
                    </Tooltip>
                  </div>
                </div>

                <div className={cn(
                  "flex-1 overflow-y-auto custom-scrollbar",
                  isSideBySide ? "p-1 md:p-4" : "p-4 md:p-12"
                )}>
                  <LoaderSkeleton 
                    isDark={theme === 'dark'} 
                    isLoading={isCurrentTypeLoading && !currentResult} 
                    startTime={loadingTypes[selectedType]}
                  />

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

