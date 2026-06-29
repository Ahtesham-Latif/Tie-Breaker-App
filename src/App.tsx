import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
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
  ChevronRight,
  ArrowUp,
  ArrowLeft,
  Crown,
  EyeOff,
  Shield
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
  LoaderSkeleton,
  Tooltip,
  SurveyModal,
  AboutUsModal,
  ConfirmLogoutModal,
  PricingModal,
  InteractiveGuide
} from "./components";
import { AuthModal } from "./components/modals/AuthModal";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./db/supabase";
import { User as UserIcon, LogOut, Clock, Lock, Info } from "lucide-react";


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
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last line in the buffer since it might be incomplete
    buffer = lines.pop() || '';
    
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalIsSignUp, setAuthModalIsSignUp] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showHistoryView, setShowHistoryView] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyTriggerType, setSurveyTriggerType] = useState<string>("");
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [analyzingCase, setAnalyzingCase] = useState<string>("");
  const [userProfile, setUserProfile] = useState<{ plan: string; privacy_mode: boolean; ties_count: number } | null>(null);
  
  const lastScrollY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleZoom = () => {
      const zoom = Math.round((window.outerWidth / window.innerWidth) * 100);
      if (zoom <= 50) {
        document.documentElement.setAttribute('data-zoom', 'out');
      } else if (zoom >= 300) {
        document.documentElement.setAttribute('data-zoom', 'in');
      } else {
        document.documentElement.setAttribute('data-zoom', 'normal');
      }
    };

    handleZoom();
    window.addEventListener('resize', handleZoom);
    return () => window.removeEventListener('resize', handleZoom);
  }, []);

  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsScrollingDown(true);
        setShowScrollTop(false);
        if (scrollTopTimeoutRef.current) clearTimeout(scrollTopTimeoutRef.current);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsScrollingDown(false);
        
        // Show button if we're far enough down
        if (currentScrollY > 200) {
          setShowScrollTop(true);
          if (scrollTopTimeoutRef.current) clearTimeout(scrollTopTimeoutRef.current);
          scrollTopTimeoutRef.current = setTimeout(() => {
            setShowScrollTop(false);
          }, 2000);
        } else {
          setShowScrollTop(false);
          if (scrollTopTimeoutRef.current) clearTimeout(scrollTopTimeoutRef.current);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowScrollTop(false);
    if (scrollTopTimeoutRef.current) clearTimeout(scrollTopTimeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (scrollTopTimeoutRef.current) clearTimeout(scrollTopTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('plan, privacy_mode, ties_count')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setUserProfile(data as any);
          }
        });
    } else {
      setUserProfile(null);
    }
  }, [user]);


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
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('ties_count').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUsageCount(data.ties_count);
          if (data.ties_count > 0) {
            supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => {
              if (count === 0) setShowSurveyModal(true);
            });
          }
        }
      });
    }
  }, [user]);

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
    
    // Create a context string for domain awareness during loading
    const caseContext = myCase || `${trimmedA} vs ${trimmedB}`;
    setAnalyzingCase(caseContext);

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

    if (!user) {
      setShowAuthModal(true);
      setIsSidebarOpen(true);
      return;
    }

    let userPrivacyMode = userProfile?.privacy_mode || false;
    let isPro = userProfile?.plan === 'pro';
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, ties_count, privacy_mode')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          userPrivacyMode = !!profile.privacy_mode;
          isPro = profile.plan === 'pro';
          // Sync local state
          setUserProfile(profile as any);
          
          if (profile.plan === 'free' && profile.ties_count >= 15) {
            setShowPricingModal(true);
            setIsSidebarOpen(true);
            return;
          }
          // Note: Pricing modal can also be opened manually via the Go Pro button at any time
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
                [columnName]: structuredData,
                is_hidden: userPrivacyMode
              }).then(() => {
                supabase.from('profiles').select('ties_count').eq('id', user.id).single().then(({ data: profile }) => {
                  if (profile && profile.ties_count >= 1) {
                    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id).then(({ count }) => {
                      if (count === 0) {
                        setSurveyTriggerType(type);
                        setShowSurveyModal(true);
                      }
                    });
                  }
                });
              });
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

      setUsageCount(prev => prev + 1);
      
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
        "flex min-h-dvh w-full transition-colors duration-500 text-text-main bg-bg-base font-sans selection:bg-accent/20 selection:text-accent",
        theme === "dark" ? "dark bg-bg-base" : "bg-bg-base"
      )}
    >
      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={handleCloseWelcome} onOpenAuth={(isSignUp) => {
          setAuthModalIsSignUp(isSignUp);
          setShowAuthModal(true);
        }} />}
        <SurveyModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} triggeredAfter={surveyTriggerType} />
        <AuthModal
          isOpen={showAuthModal}
          initialIsSignUp={authModalIsSignUp}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(isSignUp) => {
            if (isSignUp) {
              setShowWelcome(true);
            }
            setShowAuthModal(false);
          }}
        />
        {showAboutUsModal && <AboutUsModal onClose={() => setShowAboutUsModal(false)} />}
        {showLogoutModal && (
          <ConfirmLogoutModal 
            onConfirm={() => {
              signOut();
              setShowLogoutModal(false);
            }}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
        {showPricingModal && (
          <PricingModal 
            onClose={() => setShowPricingModal(false)}
            onClaim={async () => {
              if (user) {
                // Optimistically update UI
                setUserProfile(prev => prev ? { ...prev, plan: 'pro' } : null);
                setShowPricingModal(false);
                
                // Update DB
                await supabase
                  .from('profiles')
                  .update({ plan: 'pro' })
                  .eq('id', user.id);
                  
                // Re-trigger analysis immediately if they were blocked
                // Or they can just click it again, but user said "they can go for analysis instead of showing the modal again, once claimed"
                // The easiest way is to let them click the button again, or we can trigger it.
                // The user said "and now they can make unlimited ties" - yes, the quota check uses `profile.plan === 'free'`.
              }
            }}
          />
        )}
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
          className="fixed left-0 top-1/2 -translate-y-1/2 w-6 h-24 bg-bg-surface border-y border-r border-border-dim rounded-r-xl z-40 flex items-center justify-center cursor-pointer shadow-lg group hover:w-8 hover:h-28 transition-all duration-300 flex-col gap-1 overflow-hidden"
          title="Open Inputs"
        >
          <span className="hidden group-hover:block -rotate-90 text-[8px] font-black tracking-widest text-accent uppercase whitespace-nowrap">Edit</span>
          <div className="w-1 h-1.5 bg-border-dim rounded-full group-hover:hidden transition-colors" />
          <div className="w-1 h-3 bg-border-dim rounded-full group-hover:hidden transition-colors" />
          <div className="w-1 h-1.5 bg-border-dim rounded-full group-hover:hidden transition-colors" />
        </div>
      )}

      {/* Main Container */}
      <div className="flex w-full relative">

      {/* Sidebar - Inputs */}
      <motion.aside 
        className={cn(
          "sidebar bg-bg-surface border-border-dim flex flex-col shrink-0 z-50",
          
          // --- MOBILE LOGIC ---
          isMobile && !hasStarted && "relative w-full border-b p-3 sm:p-5",
          isMobile && hasStarted && "fixed inset-y-0 left-0 shadow-2xl z-60 h-dvh w-[85vw] max-w-100 border-r p-3 sm:p-5",
          
          // --- LAPTOP LOGIC ---
          !isMobile && "sticky top-0 h-dvh border-r shadow-sm overflow-y-auto",
          !isMobile && isSidebarOpen && "w-1/3 lg:max-w-112.5 p-5 opacity-100",
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
        <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
          <div className="flex flex-col gap-3 mb-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 cursor-pointer group shrink"
                  onClick={reset}
                >
                  <div className="w-8 h-8 shrink-0 bg-accent rounded-lg flex items-center justify-center text-bg-surface rotate-12 transition-transform group-hover:rotate-0 shadow-lg shadow-accent/20">
                    <ScaleIcon size={20} />
                  </div>
                  <span className="font-extrabold text-lg sm:text-xl tracking-tighter text-text-bright uppercase leading-tight flex items-center">
                    THE TIE<span className="text-accent">BREAKER</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Tooltip content="Meet The Creator" position="left">
                  <motion.button
                    initial={{ scale: 1, x: -10, opacity: 0 }}
                    animate={{ 
                      scale: [1, 1.1, 1, 1.1, 1, 1.1, 1],
                      rotate: [0, -5, 5, -5, 5, -5, 0],
                      x: 0,
                      opacity: 1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    aria-label="About Us"
                    onClick={() => setShowAboutUsModal(true)}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg-surface transition-all shadow-sm flex items-center justify-center gap-1.5 group shrink-0"
                  >
                    <Info size={16} />
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">About Us</span>
                  </motion.button>
                </Tooltip>
                
                {isMobile && (
                  user ? (
                    <div className="flex items-center gap-2">
                      {userProfile?.plan === 'pro' ? (
                        <div className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.15)] select-none">
                          <Crown size={14} className="animate-pulse" />
                          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest mt-[1px]">Pro</span>
                        </div>
                      ) : (
                        <div className="px-2 py-1 bg-text-muted/10 text-text-muted border border-border-dim rounded-lg flex items-center gap-1.5 select-none">
                          <UserIcon size={14} />
                          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest mt-[1px]">Free</span>
                        </div>
                      )}
                      <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                        title="Sign Out"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  ) : (
                    <Tooltip content="Log In" position="bottom">
                      <button
                        aria-label="Log In"
                        onClick={() => setShowAuthModal(true)}
                        className="p-1.5 rounded-lg bg-accent text-bg-surface hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                      >
                        <UserIcon size={18} />
                      </button>
                    </Tooltip>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Tooltip content="Toggle Theme" position="right">
                <button
                  aria-label="Toggle Theme"
                  onClick={toggleTheme}
                  className="px-3 py-1.5 rounded-full bg-bg-panel border border-border-dim text-text-main hover:text-accent hover:border-accent/30 transition-all shadow-sm flex items-center gap-1.5 shrink-0 group"
                >
                  {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">Theme</span>
                </button>
              </Tooltip>

              {/* Go Pro Button — visible only to logged-in free users */}
              {user && userProfile?.plan !== 'pro' && (
                <Tooltip content="Continue to Pro" position="right">
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/8 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/30 transition-all duration-200 text-[10px] font-black uppercase tracking-wide shrink-0"
                    title="Continue to Pro"
                  >
                    <Crown size={13} className="group-hover:animate-bounce shrink-0" />
                    <span>Go Pro</span>
                  </button>
                </Tooltip>
              )}

              {isMobile && hasStarted && (
                <button 
                  title="Show Analysis Results"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-accent/90 transition-all group shrink-0"
                >
                  <span className="inline">Show</span> Results <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

        {!showHistoryView ? (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {/* Validation Feedback */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-danger/10 border-2 border-danger/20 p-3 rounded-xl mb-4"
                  >
                    <p className="text-[11px] font-black text-danger uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" /> <span className="leading-relaxed">{validationError}</span>
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
                  placeholder="Option A e.g. Honda City 2024"
                  rows={2}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-3 py-1.5 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-15"
                />
                <div className="text-center text-[10px] font-black uppercase text-text-dim/50 tracking-widest">
                  VS
                </div>
                <textarea
                  title="Enter your second option (Option B)"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  maxLength={100}
                  placeholder="Option B e.g. Toyota Corolla 2024"
                  rows={2}
                  className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-3 py-1.5 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-15"
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
                    placeholder="E.g. I'm a salaried professional in Karachi, budget around 50 lakh, need fuel efficiency for daily commute and long GT Road trips."
                    rows={4}
                    className="w-full bg-bg-panel border-2 border-transparent rounded-xl px-3 py-1.5 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-y min-h-25"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center justify-between mb-2">
                    My Case / Context
                    <span className="opacity-60 font-black text-[9px] tracking-wider text-accent flex items-center gap-1 uppercase bg-accent/10 px-1 py-0 rounded-md">
                      <Lock size={10} /> Member Only
                    </span>
                  </label>
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={() => setShowAuthModal(true)}
                  >
                    <textarea
                      disabled
                      placeholder="E.g. I'm a salaried professional in Karachi, budget around 50 lakh, need fuel efficiency for daily commute and long GT Road trips."
                      rows={4}
                      className="w-full bg-bg-panel border-2 border-dashed border-border-dim rounded-xl px-3 py-1.5 text-sm text-text-main font-semibold shadow-inner resize-none min-h-25 cursor-pointer group-hover:border-accent/50 transition-colors pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/20 backdrop-blur-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-accent text-bg-surface px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
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
                  <span className="bg-accent/10 text-accent px-0.5 py-0 rounded text-[8px] font-black tracking-widest border border-accent/20">SLOWER</span>
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
                  Add factors like "Fuel Economy" or "Resale Value" to guide the comparison
                </p>
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="relative group/opt">
                      <input
                        title={`Comparison Factor ${idx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        maxLength={30}
                        placeholder={`Factor ${idx + 1} e.g. ${['Fuel Economy', 'Resale Value', 'Maintenance Cost', 'Comfort', 'Parts Availability', 'Engine Power'][idx] || 'Custom Factor'}`}
                        className="w-full bg-bg-panel border-2 border-transparent rounded-lg px-3 py-1 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner"
                      />
                      {options.length > 2 && (
                        <Tooltip content="Remove this factor" position="top">
                          <button
                            onClick={() => handleRemoveOption(idx)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-danger opacity-100 md:opacity-0 group-hover/opt:opacity-100 transition-opacity"
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
                      className="w-full flex items-center justify-center p-2 rounded-xl border-2 border-dashed border-accent/20 text-accent hover:border-accent hover:bg-accent-muted transition-all text-xs font-bold"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Option
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 shrink-0 mt-auto">
              {userProfile?.plan === 'pro' && (
                <div className="flex items-center justify-end mb-3">
                  <button
                    onClick={async () => {
                      const newMode = !userProfile.privacy_mode;
                      setUserProfile(prev => prev ? { ...prev, privacy_mode: newMode } : null);
                      await supabase.from('profiles').update({ privacy_mode: newMode }).eq('id', user!.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      userProfile.privacy_mode 
                        ? 'bg-accent text-bg-surface shadow-md shadow-accent/20' 
                        : 'bg-bg-panel text-text-muted hover:text-text-main border border-border-dim'
                    }`}
                    title={userProfile.privacy_mode ? "Privacy Mode On: New decisions are hidden" : "Privacy Mode Off: Saving decisions"}
                  >
                    {userProfile.privacy_mode ? <Shield size={14} /> : <EyeOff size={14} />}
                    {userProfile.privacy_mode ? 'Privacy On' : 'Privacy Off'}
                  </button>
                </div>
              )}



              <button
                title="Calculate Decision Analysis"
                onClick={() => handleAnalyze(selectedType)}
                disabled={isAnyLoading || !optionA.trim() || !optionB.trim()}
                className="w-full py-2.5 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2"
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
                  className="mt-3 w-full py-2 bg-bg-panel border border-border-dim text-accent rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/10 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <Clock size={16} /> My History
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <button 
              title="Return to input form"
              onClick={() => setShowHistoryView(false)}
              className="mb-4 w-full py-2 bg-bg-panel border border-border-dim text-text-main rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/10 hover:text-accent transition-colors flex justify-center items-center gap-2 shrink-0 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to Inputs
            </button>
            <SidebarHistory 
              onLoadDecision={(decision) => {
                handleLoadDecision(decision);
                setShowHistoryView(false);
              }} 
              onShowAuth={() => setShowAuthModal(true)} 
              onShowLogout={() => setShowLogoutModal(true)}
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
              className="bg-accent text-bg-surface px-5 py-2 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/10 backdrop-blur-md"
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
        "result-main-content flex-1 flex flex-col min-w-0 bg-bg-base relative z-10",
        isMobile && !hasStarted && "hidden" // On mobile, hide results area until started
      )}>

        {/* Top Right Desktop Auth Button */}
        {!isMobile && (
           <div className="hidden md:flex justify-end pt-5 pr-7 w-full z-40 shrink-0 gap-4">
             {user ? (
                <div className={cn(
                 "flex items-center gap-4 backdrop-blur-md px-4 py-1.5 rounded-full border shadow-lg transition-colors",
                 userProfile?.plan === 'pro' 
                   ? "bg-amber-500/10 border-amber-500/30 shadow-amber-500/10"
                   : "bg-bg-surface/80 border-accent/20 shadow-accent/5"
               )}>
                 <div className={cn(
                   "w-6 h-6 rounded-full flex items-center justify-center",
                   userProfile?.plan === 'pro'
                     ? "bg-amber-500/20 text-amber-500"
                     : "bg-accent/10 text-accent"
                 )}>
                   <UserIcon size={12} />
                 </div>
                 <div className="flex flex-col">
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-widest leading-none",
                     userProfile?.plan === 'pro' ? "text-amber-600 dark:text-amber-400" : "text-text-bright"
                   )}>
                     {user.email?.split('@')[0]}
                   </span>
                   <span className={cn(
                     "text-[8px] font-bold uppercase tracking-widest mt-0.5",
                     userProfile?.plan === 'pro' ? "text-amber-500" : "text-accent"
                   )}>
                     {userProfile?.plan === 'pro' ? 'Pro Member' : `${userProfile?.ties_count || 0}/15 Free Ties`}
                   </span>
                 </div>
                 <Tooltip content="Log Out" position="bottom">
                   <button 
                     onClick={() => setShowLogoutModal(true)}
                     className="ml-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-all flex items-center gap-1.5 border border-transparent hover:border-danger/20"
                   >
                     <LogOut size={12} /> Sign Out
                   </button>
                 </Tooltip>
               </div>
            ) : (
               <button 
                 title="Log In or Create an Account"
                 onClick={() => setShowAuthModal(true)}
                 className="px-5 py-1.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-accent-muted"
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
              className="flex-1 flex items-center justify-center p-5 md:p-11 min-h-[80vh]"
            >
              <div className="max-w-2xl text-center flex flex-col items-center">
                <div className="inline-block px-3 py-0.5 bg-accent text-bg-surface rounded-full text-[10px] font-black uppercase tracking-widest leading-none mb-6 shadow-lg shadow-accent/20">
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
              className="result-container flex-1 flex flex-col p-4 md:px-8 md:pb-8 md:pt-0 bg-bg-base min-w-0 w-full max-w-[1600px] mx-auto"
            >
              <InteractiveGuide activeType={selectedType} onSelectType={handleAnalyze} />
              
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 shrink-0 mb-4 min-w-0">
                  <div className="space-y-3 min-w-0 w-full xl:w-auto">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="px-2 py-0 bg-accent text-bg-surface rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
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
                  <h2 className="vs-title text-xl md:text-2xl font-black text-text-bright tracking-tight max-w-2xl uppercase italic leading-tight break-words min-w-0">
                    {optionA} <span className="text-accent text-sm mx-2 inline-block">VS</span> {optionB}
                  </h2>
                </div>

                <div className="tab-bar grid grid-cols-2 sm:flex sm:flex-wrap bg-accent-muted p-0 rounded-2xl border-2 border-accent/10 shadow-sm gap-1 shrink-0 w-full xl:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

              <div className="grow shrink-0 bg-bg-surface rounded-3xl border-2 border-accent/10 relative shadow-[0_20px_50px_rgba(117,81,57,0.1)]">
                <div className="flex flex-wrap justify-between items-center p-0 border-b-2 border-accent/5 bg-bg-surface z-20 shadow-sm gap-2">
                  <div className="pl-0 pr-0 font-black text-accent uppercase tracking-wider text-[10px] md:text-xs opacity-80 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-[100px]">
                    {selectedType === "pros-cons" && "Pros & Cons"}
                    {selectedType === "comparison" && "Comparison"}
                    {selectedType === "swot" && "SWOT"}
                    {selectedType === "verdict" && "Verdict"}
                  </div>
                  <div className="toolbar-row flex gap-1 shrink-0">
                    <Tooltip content={isSidebarOpen ? "Hide" : "Input"} position="bottom">
                      <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="px-0.5 py-0 rounded-md border bg-bg-panel text-accent border-accent/20 hover:bg-accent/10 transition-all flex items-center justify-center gap-1 shadow-sm"
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
                          "px-0.5 py-0 rounded-md border transition-all flex items-center gap-1 shadow-sm",
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
                        className="px-0.5 py-0 rounded-md bg-accent text-bg-surface hover:brightness-110 transition-all flex items-center gap-1 group shadow-sm"
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

                <div 
                  className={cn(
                  "rounded-b-3xl flex flex-col",
                  isSideBySide ? "p-0 md:p-1" : "p-1 md:p-5"
                )}>
                  <LoaderSkeleton 
                    isDark={theme === 'dark'} 
                    isLoading={isCurrentTypeLoading && !currentResult} 
                    startTime={loadingTypes[selectedType]}
                    myCase={analyzingCase}
                  />

                  <div className="max-w-7xl mx-auto space-y-6">
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
                         <div className="text-center opacity-20 py-9 font-black uppercase tracking-widest">Select an analysis type to begin</div>
                       )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToTop}
              className="absolute bottom-6 right-6 z-50 p-2 bg-accent text-bg-surface rounded-full shadow-2xl shadow-accent/40 hover:scale-110 active:scale-95 transition-transform"
              title="Scroll to top"
            >
              <ArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}

