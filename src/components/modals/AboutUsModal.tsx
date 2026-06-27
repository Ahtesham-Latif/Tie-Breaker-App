import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Github, Linkedin, Mail, Youtube, Video, Info, User, HelpCircle, Award, Zap, BrainCircuit, CheckCircle2, Target, Activity, Layers, ArrowRight, Scale as ScaleIcon } from "lucide-react";
interface AboutUsModalProps {
  onClose: () => void;
}

export function AboutUsModal({ onClose }: AboutUsModalProps) {
  const [activeTab, setActiveTab] = useState<"about" | "what-it-does" | "demo">("about");

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
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 p-1 rounded-full bg-bg-surface text-text-main hover:text-danger hover:bg-danger/10 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6"
              >
                 <div className="w-32 h-32 shrink-0 rounded-full bg-accent/20 border-4 border-accent shadow-xl overflow-hidden flex items-center justify-center">
                    <img src="/me1.png" alt="Ahtesham Latif" className="w-full h-full object-cover" loading="lazy" />
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-text-bright">
                    About The Creator
                 </h2>
                 <p className="text-text-main font-semibold">
                    Ahtesham Latif
                 </p>
                 <div className="flex flex-wrap justify-center gap-4 pt-3">
                    <a href="https://github.com/Ahtesham-Latif" target="_blank" rel="noreferrer" className="px-5 py-2 bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
                       <Github size={20} /> GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/ahtesham-latif" target="_blank" rel="noreferrer" className="px-5 py-2 bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
                       <Linkedin size={20} /> LinkedIn
                    </a>
                    <a href="https://www.credly.com/users/f23ba044-ahtesham-latif" target="_blank" rel="noreferrer" className="px-5 py-2 bg-bg-panel border-2 border-border-dim rounded-xl font-bold flex items-center gap-2 hover:border-accent hover:text-accent transition-all">
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
                className="max-w-5xl mx-auto space-y-12 pb-11"
              >
                 {/* Hero Section */}
                 <div className="text-center space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-text-bright">
                       THE TIE<span className="text-accent">BREAKER</span>
                    </h2>
                    <p className="text-lg text-text-main font-semibold max-w-2xl mx-auto">
                       TieBreaker is an AI Decision Intelligence Platform. Instead of answering questions, it <span className="text-accent font-bold">resolves dilemmas</span>.
                    </p>
                 </div>

                 {/* Problem vs Solution Grid */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-bg-panel border-2 border-border-dim rounded-2xl p-5 sm:p-7 space-y-4 shadow-sm">
                       <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center">
                          <span className="text-2xl leading-none grayscale" role="img" aria-label="thinking">🤔</span>
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-widest text-text-bright">The Problem</h3>
                       <p className="text-text-main">
                          The most important decisions regarding career, business, money, and relationships are still solved using Google, Reddit, and gut feeling. 
                       </p>
                       <p className="text-danger font-bold text-sm uppercase tracking-widest bg-danger/5 py-1 px-3 rounded-lg inline-block border border-danger/20">
                          Result: Decision Paralysis
                       </p>
                    </div>
                    
                    <div className="bg-accent/10 border-2 border-accent/20 rounded-2xl p-5 sm:p-7 space-y-4 shadow-lg shadow-accent/5">
                       <div className="w-12 h-12 bg-accent text-bg-surface rounded-xl flex items-center justify-center">
                          <ScaleIcon size={24} />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-widest text-accent">The Solution</h3>
                       <p className="text-text-main">
                          Users don't ask: <span className="italic">"Should I pursue a Master's degree abroad?"</span><br/>
                          They ask: <span className="font-bold text-text-bright">"Pursue a Master's degree abroad VS Work full-time and gain industry experience."</span>
                       </p>
                       <p className="text-accent font-bold text-sm uppercase tracking-widest bg-bg-surface py-1 px-3 rounded-lg inline-block border border-accent/20 shadow-sm mt-2">
                          Result: Deterministic Verdict
                       </p>
                    </div>
                 </div>

                 {/* Differentiators */}
                 <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-text-bright text-center">
                       What Makes Us Different
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="bg-bg-panel border border-border-dim p-4 rounded-2xl hover:border-accent/50 transition-colors">
                          <Layers className="text-accent mb-3" size={24} />
                          <h4 className="font-bold text-text-bright mb-2">Structured Engine</h4>
                          <p className="text-sm text-text-main">Comparison → Pros/Cons → SWOT → Final Verdict.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-4 rounded-2xl hover:border-accent/50 transition-colors">
                          <User className="text-accent mb-3" size={24} />
                          <h4 className="font-bold text-text-bright mb-2">Personalized</h4>
                          <p className="text-sm text-text-main">Factors in goals, budgets, and constraints via 'My Case'.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-4 rounded-2xl hover:border-accent/50 transition-colors">
                          <Zap className="text-accent mb-3" size={24} />
                          <h4 className="font-bold text-text-bright mb-2">Real-Time Search</h4>
                          <p className="text-sm text-text-main">Web-grounded verification prevents outdated advice.</p>
                       </div>
                       <div className="bg-bg-panel border border-border-dim p-4 rounded-2xl hover:border-accent/50 transition-colors">
                          <Target className="text-accent mb-3" size={24} />
                          <h4 className="font-bold text-text-bright mb-2">Transparent AI</h4>
                          <p className="text-sm text-text-main">Visible reasoning: why one option won, and why the other failed.</p>
                       </div>
                    </div>
                 </div>

                 {/* Features & Users */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-bg-panel border border-border-dim p-5 rounded-2xl">
                       <h3 className="font-black uppercase tracking-widest text-text-bright mb-4 flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-accent" /> Features
                       </h3>
                       <ul className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-text-main font-semibold">
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Comparison</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Pros & Cons</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>SWOT Analysis</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Final Verdict</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>Web Search</li>
                          <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0"/>History & Auth</li>
                       </ul>
                    </div>
                    <div className="bg-bg-panel border border-border-dim p-5 rounded-2xl flex flex-col justify-center text-center space-y-4">
                       <h3 className="font-black uppercase tracking-widest text-text-bright">Competitive Advantage</h3>
                       <div className="text-sm font-semibold space-y-2 text-left w-fit mx-auto bg-bg-surface p-3 rounded-xl border border-border-dim">
                          <p><span className="text-text-dim">ChatGPT</span> answers questions.</p>
                          <p><span className="text-text-dim">Google</span> finds information.</p>
                          <p><span className="text-text-dim">Reddit</span> shares opinions.</p>
                          <p className="text-accent font-black text-base flex items-center gap-2 pt-2 mt-3 border-t border-border-dim">
                             TieBreaker makes decisions. <ArrowRight size={16} />
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Vision Banner */}
                 <div className="bg-linear-to-r from-accent to-accent-muted rounded-2xl p-7 sm:p-11 text-center shadow-2xl text-bg-surface relative overflow-hidden mt-8">
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 p-7 opacity-10 pointer-events-none mix-blend-overlay">
                       <BrainCircuit size={160} />
                    </div>
                    <div className="relative z-10">
                       <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4">
                          The Vision
                       </h3>
                       <p className="text-lg font-semibold opacity-90 max-w-2xl mx-auto">
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
                 <div className="w-full space-y-8 pb-8">
                    <div>
                       <h2 className="text-2xl font-black uppercase tracking-tighter text-text-bright mb-4 text-center">
                          Platform Overview
                       </h2>
                       <div className="w-full aspect-video bg-black rounded-2xl border-4 border-border-dim flex items-center justify-center overflow-hidden shadow-2xl relative">
                          <video src="/Tie_Breaker_Launch.mp4" controls className="w-full h-full object-contain" preload="metadata" />
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
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
