import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Github, Linkedin, Mail, Youtube, Video, Info, User, HelpCircle, Award, Zap, BrainCircuit, CheckCircle2, Target, Activity, Layers, ArrowRight, Scale as ScaleIcon, Shield } from "lucide-react";
import meImage from "../../assets/me1.png";
interface AboutUsModalProps {
  onClose: () => void;
}

export function AboutUsModal({ onClose }: AboutUsModalProps) {
  const [activeTab, setActiveTab] = useState<"about" | "what-it-does" | "demo" | "policy">("about");
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date: 1 month from June 28, 2026 (Pakistan time)
    const targetDate = new Date("2026-07-28T03:05:32+05:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-bg-surface border-4 border-accent/20 rounded-3xl w-full max-w-4xl h-[85vh] sm:h-[80vh] shadow-[0_20px_50px_rgba(117,81,57,0.3)] relative overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-5 border-b border-border-dim bg-bg-panel gap-4">
          <div className="flex items-center gap-2">
             <div className="flex gap-2">
                <a href="mailto:bladerunner2049kjoe@gmail.com" target="_blank" rel="noreferrer" title="Email" className="p-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-bg-surface transition-all">
                  <Mail size={18} />
                </a>
                <a href="https://www.linkedin.com/in/ahtesham-latif" target="_blank" rel="noreferrer" title="LinkedIn" className="p-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-bg-surface transition-all">
                  <Linkedin size={18} />
                </a>
                <a href="https://github.com/Ahtesham-Latif" target="_blank" rel="noreferrer" title="GitHub" className="p-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-bg-surface transition-all">
                  <Github size={18} />
                </a>
                <a href="https://www.youtube.com/channel/UCyZvpQFFmpzzQwJPbwRtpGQ" target="_blank" rel="noreferrer" title="YouTube" className="p-1 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-bg-surface transition-all">
                  <Youtube size={18} />
                </a>
             </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
             <button
                onClick={() => setActiveTab("about")}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === 'about' ? 'bg-accent text-bg-surface' : 'bg-transparent text-text-main hover:bg-accent/10 hover:text-accent'}`}
             >
                <User size={16} /> About Us
             </button>
             <button
                onClick={() => setActiveTab("what-it-does")}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === 'what-it-does' ? 'bg-accent text-bg-surface' : 'bg-transparent text-text-main hover:bg-accent/10 hover:text-accent'}`}
             >
                <HelpCircle size={16} /> What it does
             </button>
             <button
                onClick={() => setActiveTab("demo")}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === 'demo' ? 'bg-accent text-bg-surface' : 'bg-transparent text-text-main hover:bg-accent/10 hover:text-accent'}`}
             >
                <Video size={16} /> Demo Video
             </button>
             <button
                onClick={() => setActiveTab("policy")}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${activeTab === 'policy' ? 'bg-accent text-bg-surface' : 'bg-transparent text-text-main hover:bg-accent/10 hover:text-accent'}`}
             >
                <Shield size={16} /> Usage Policy
             </button>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 p-1 rounded-full bg-bg-surface text-text-main hover:text-danger hover:bg-danger/10 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3"
              >
                 <div className="w-32 h-32 shrink-0 rounded-full bg-accent/20 border-4 border-accent shadow-xl overflow-hidden flex items-center justify-center">
                    <img src={meImage} alt="Ahtesham Latif" className="w-full h-full object-cover" loading="lazy" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-text-bright">
                    About The Creator
                 </h2>
                 <p className="text-[15px] text-text-main font-semibold">
                    Ahtesham Latif
                 </p>
                 <div className="flex flex-wrap justify-center gap-4 pt-3">
                    <a href="https://github.com/Ahtesham-Latif" target="_blank" rel="noreferrer" className="px-[19px] py-[7px] text-[15px] bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
                       <Github size={20} /> GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/ahtesham-latif" target="_blank" rel="noreferrer" className="px-[19px] py-[7px] text-[15px] bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
                       <Linkedin size={20} /> LinkedIn
                    </a>
                    <a href="https://www.credly.com/users/f23ba044-ahtesham-latif" target="_blank" rel="noreferrer" className="px-[19px] py-[7px] text-[15px] bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
                       <Award size={20} /> Credly Profile
                    </a>
                 </div>
              </motion.div>
            )}

            {activeTab === "what-it-does" && (
              <motion.div
                key="what-it-does"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-4 pb-4"
              >
                 {/* Hero Section */}
                 <div className="text-center space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-text-bright">
                       THE TIE<span className="text-accent">BREAKER</span>
                    </h2>
                    <p className="text-[15px] text-text-main font-semibold max-w-2xl mx-auto">
                       TieBreaker is an AI Decision Intelligence Platform. Instead of answering questions, it <span className="text-accent font-bold">resolves dilemmas</span>.
                    </p>
                 </div>

                 {/* Problem vs Solution Grid */}
                 <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-bg-panel border-2 border-border-dim rounded-2xl p-3 space-y-2 shadow-sm">
                       <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center">
                          <span className="text-2xl leading-none grayscale" role="img" aria-label="thinking">🤔</span>
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-widest text-text-bright">The Problem</h3>
                       <p className="text-[15px] text-text-main">
                          The most important decisions regarding career, business, money, and relationships are still solved using Google, Reddit, and gut feeling. 
                       </p>
                       <p className="text-danger font-bold text-[13px] uppercase tracking-widest bg-danger/5 py-[3px] px-[11px] rounded-lg inline-block border border-danger/20">
                          Result: Decision Paralysis
                       </p>
                    </div>
                    
                    <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-3 space-y-2 shadow-lg shadow-accent/5">
                       <div className="w-12 h-12 bg-accent text-bg-surface rounded-xl flex items-center justify-center">
                          <ScaleIcon size={24} />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-widest text-accent">The Solution</h3>
                       <p className="text-[15px] text-text-main">
                          Users don't ask: <span className="italic">"Should I pursue a Master's degree abroad?"</span><br/>
                          They ask: <span className="font-bold text-text-bright">"Pursue a Master's degree abroad VS Work full-time and gain industry experience."</span>
                       </p>
                       <p className="text-accent font-bold text-[13px] uppercase tracking-widest bg-bg-surface py-1 px-3 rounded-lg inline-block border border-accent/20 shadow-sm mt-2">
                          Result: Deterministic Verdict
                       </p>
                    </div>
                 </div>

                 {/* Differentiators */}
                 <div className="space-y-3">
                    <h3 className="text-[19px] font-black uppercase tracking-tighter text-text-bright text-center">
                       What Makes Us Different
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                       <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl hover:border-accent/50 transition-colors">
                          <Layers className="text-accent mb-2" size={20} />
                          <h4 className="font-bold text-[14px] text-text-bright mb-1">Structured Engine</h4>
                          <p className="text-[13px] text-text-main leading-tight">Comparison → Pros/Cons → SWOT → Final Verdict.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl hover:border-accent/50 transition-colors">
                          <User className="text-accent mb-2" size={20} />
                          <h4 className="font-bold text-[14px] text-text-bright mb-1">Personalized</h4>
                          <p className="text-[13px] text-text-main leading-tight">Factors in goals, budgets, and constraints via 'My Case'.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl hover:border-accent/50 transition-colors">
                          <Zap className="text-accent mb-2" size={20} />
                          <h4 className="font-bold text-[14px] text-text-bright mb-1">Real-Time Search</h4>
                          <p className="text-[13px] text-text-main leading-tight">Web-grounded verification prevents outdated advice.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl hover:border-accent/50 transition-colors">
                          <Target className="text-accent mb-2" size={20} />
                          <h4 className="font-bold text-[14px] text-text-bright mb-1">Transparent AI</h4>
                          <p className="text-[13px] text-text-main leading-tight">Visible reasoning: why one option won, and why the other failed.</p>
                       </div>
                    </div>
                 </div>

                 {/* Features & Users */}
                 <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl">
                       <h3 className="font-black uppercase tracking-widest text-text-bright mb-3 flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-accent" /> Features
                       </h3>
                       <ul className="grid grid-cols-2 gap-y-2 gap-x-2 text-[13px] text-text-main font-semibold">
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Comparison</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Pros & Cons</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>SWOT Analysis</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Final Verdict</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Web Search</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>History & Auth</li>
                       </ul>
                    </div>
                    <div className="bg-bg-panel border border-border-dim p-3 rounded-2xl flex flex-col justify-center text-center space-y-2">
                       <h3 className="font-black uppercase tracking-widest text-text-bright">Competitive Advantage</h3>
                       <div className="text-[13px] font-semibold space-y-1 text-left w-fit mx-auto bg-bg-surface p-3 rounded-xl border border-border-dim">
                          <p><span className="text-text-dim">ChatGPT</span> answers questions.</p>
                          <p><span className="text-text-dim">Google</span> finds information.</p>
                          <p><span className="text-text-dim">Reddit</span> shares opinions.</p>
                          <p className="text-accent font-black text-[14px] flex items-center gap-2 pt-1 mt-2 border-t border-border-dim">
                             TieBreaker makes decisions. <ArrowRight size={14} />
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Vision Banner */}
                 <div className="bg-linear-to-r from-accent to-accent-muted rounded-2xl p-4 sm:p-5 text-center shadow-2xl text-bg-surface relative overflow-hidden mt-4">
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 p-4 opacity-10 pointer-events-none mix-blend-overlay">
                       <BrainCircuit size={160} />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2">
                          The Vision
                       </h3>
                       <p className="text-[15px] font-semibold opacity-90 max-w-2xl mx-auto">
                          Our goal is to create the world's most trusted AI decision engine, serving as the final voice before a decision gets made.
                       </p>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "demo" && (
              <motion.div
                key="demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center max-w-4xl mx-auto h-full"
              >
                 <div className="w-full space-y-6 pb-6">
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tighter text-text-bright mb-3 text-center">
                          Platform Overview
                       </h2>
                       <div className="w-full aspect-video bg-black rounded-2xl border-4 border-border-dim flex items-center justify-center overflow-hidden shadow-2xl relative">
                          <iframe
                             className="w-full h-full"
                             src="https://www.youtube.com/embed/vZ70JQEDPWY"
                             title="Platform Overview"
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                             referrerPolicy="strict-origin-when-cross-origin"
                             allowFullScreen
                          ></iframe>
                       </div>
                    </div>
                    
                    <div>
                       <h2 className="text-2xl font-black uppercase tracking-tighter text-text-bright mb-4 text-center">
                          User Manual
                       </h2>
                       <div className="w-full aspect-video bg-black rounded-2xl border-4 border-border-dim flex items-center justify-center overflow-hidden shadow-2xl relative">
                          <iframe
                             className="w-full h-full"
                             src="https://www.youtube.com/embed/m__IZkOf2AU"
                             title="The TieBreaker User Manual"
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                             referrerPolicy="strict-origin-when-cross-origin"
                             allowFullScreen
                          ></iframe>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "policy" && (
              <motion.div
                key="policy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-4 pb-4"
              >
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-1">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-text-bright">
                    Usage & Privacy Policy
                  </h2>
                  <p className="text-text-main font-semibold text-[14px]">
                    We believe in full transparency about how your data is used.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-bg-panel border-2 border-border-dim rounded-2xl p-3 shadow-sm space-y-2">
                    <h3 className="text-[17px] font-black uppercase tracking-widest text-text-bright border-b border-border-dim pb-1">Free Plan</h3>
                    <p className="text-[13px] text-text-main font-semibold leading-relaxed">
                      By using the free version of TieBreaker, you agree that your submitted decision prompts, analysis preferences, and generated results may be reviewed and used in an anonymized form to improve TieBreaker, including its prompts, decision engine, features, and overall user experience.
                    </p>
                    <p className="text-[13px] text-text-main font-semibold leading-relaxed">
                      We do <span className="font-bold text-text-bright">not</span> intentionally use your personal identity for this purpose. Where practical, personally identifying information is excluded or anonymized before review.
                    </p>
                  </div>

                  <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-3 shadow-md shadow-accent/5 space-y-2">
                    <h3 className="text-[17px] font-black uppercase tracking-widest text-accent border-b border-accent/20 pb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        Pro Plan
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xl leading-none"
                        >
                          👏
                        </motion.div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-center">
                         <span className="text-[9px] sm:text-[10px] font-black bg-accent text-bg-surface px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm shadow-accent/20 animate-pulse">FREE FOR 1st MONTH</span>
                         <span className="text-[9px] sm:text-[10px] font-black bg-accent text-bg-surface px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">PRIVATE MODE</span>
                      </div>
                    </h3>
                    <p className="text-[13px] font-bold text-text-bright">Your privacy comes first.</p>
                    <p className="text-[13px] text-text-main font-semibold leading-relaxed">
                      Pro users can enable <span className="font-bold text-accent">Private Mode</span>, which excludes their decision history and analyses from being used to improve TieBreaker. Your analyses remain available only for your personal use and account history, subject to our operational requirements.
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-accent/20">
                      <span className="text-[11px] font-black uppercase tracking-widest text-accent">Offer Ends In:</span>
                      <div className="flex gap-1 font-mono text-[12px] font-bold text-text-bright">
                        <span className="bg-bg-surface shadow-sm px-1.5 py-0.5 rounded border border-accent/20">{timeLeft.days}d</span>
                        <span className="bg-bg-surface shadow-sm px-1.5 py-0.5 rounded border border-accent/20">{timeLeft.hours.toString().padStart(2, '0')}h</span>
                        <span className="bg-bg-surface shadow-sm px-1.5 py-0.5 rounded border border-accent/20">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                        <span className="bg-bg-surface shadow-sm px-1.5 py-0.5 rounded border border-accent/20 text-accent">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-panel border border-border-dim rounded-2xl p-3">
                  <h3 className="text-[14px] font-black uppercase tracking-widest text-text-bright mb-2 flex items-center gap-2">
                    <X className="text-danger" size={16} /> What We Don't Do
                  </h3>
                  <ul className="space-y-1 text-[13px] text-text-main font-semibold">
                    <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-danger shrink-0" /> We do not sell your personal data.</li>
                    <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-danger shrink-0" /> We do not share your private decision history with other users.</li>
                    <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-danger shrink-0" /> We do not use your data for advertising.</li>
                  </ul>
                </div>

                <div className="text-center bg-bg-surface p-3 rounded-2xl border-2 border-border-dim">
                  <h3 className="text-[14px] font-black uppercase tracking-widest text-text-bright mb-1">Your Choice</h3>
                  <p className="text-[13px] text-text-main font-semibold">
                    If you prefer complete privacy, upgrading to <span className="font-bold text-accent">TieBreaker Pro</span> with <span className="font-bold text-text-bright">Private Mode</span> allows you to opt out of improvement-related data usage while continuing to enjoy all premium features. <span className="text-accent font-bold">(Good news: Pro is currently completely free for the first month!)</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
