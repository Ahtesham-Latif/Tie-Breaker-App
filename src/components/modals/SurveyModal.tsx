import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, ChevronDown, MessageSquare } from 'lucide-react';
import { supabase } from '../../db/supabase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredAfter?: string;
}

const LOVED_OPTIONS = [
  "The minimal UI & Design",
  "The AI accuracy & Insights",
  "Structured matrices (Pros/Cons, SWOT)",
  "How fast it is",
  "Other"
];

const EASE_OPTIONS = [
  "Extremely Easy",
  "Somewhat Easy",
  "Neutral",
  "Somewhat Difficult",
  "Very Difficult"
];

const USE_CASE_OPTIONS = [
  "Buying Tech/Gadgets",
  "Professional/Business choices",
  "Everyday life decisions",
  "Academic/Research",
  "Other"
];

const FUTURE_OPTIONS = [
  "Shareable result links",
  "Export to PDF/CSV",
  "Image & Link analysis",
  "Group voting & polls",
  "Other"
];

const NPS_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function SurveyModal({ isOpen, onClose, triggeredAfter = 'unknown' }: SurveyModalProps) {
  const { user } = useAuth();
  
  // States matching the 6 funnel questions
  const [loved, setLoved] = useState("");
  const [ease, setEase] = useState("");
  const [useCase, setUseCase] = useState("");
  const [future, setFuture] = useState("");
  const [nps, setNps] = useState<number | null>(null);
  const [open, setOpen] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Insert into Supabase 'reviews' table with precise columns
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      triggered_after: triggeredAfter,
      loved: loved,
      ease: ease,
      use_case: useCase,
      future: future,
      nps: nps,
      open_feedback: open.trim() || null
    });

    setIsSubmitting(false);
    
    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after animation finishes
        setTimeout(() => {
          setIsSuccess(false);
          setLoved("");
          setEase("");
          setUseCase("");
          setFuture("");
          setNps(null);
          setOpen("");
        }, 500);
      }, 2000);
    }
  };

  const isFormValid = loved && ease && useCase && future && nps !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-bg-surface border-2 border-border-dim rounded-4xl p-6 md:p-10 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden my-8"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-accent to-accent-muted" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-dim hover:text-danger hover:rotate-90 transition-all duration-300 z-10"
            >
              <X size={20} />
            </button>

            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-text-bright mb-2">Thank You!</h2>
                <p className="text-text-muted text-sm font-semibold">Your detailed insights will shape our future updates.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[80vh] overflow-y-auto scrollbar-hide">
                <div className="mb-6 text-center mt-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-text-bright mb-2">
                    Help us <span className="text-accent">Improve</span>
                  </h2>
                  <p className="text-text-muted text-xs font-semibold leading-relaxed">
                    You've broken a few ties now! We'd love your quick thoughts.
                  </p>
                </div>

                <div className="space-y-5 mb-8">
                  {/* Q1: Loved */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">1. What did you love most?</label>
                    <div className="relative">
                      <select 
                        value={loved}
                        onChange={(e) => setLoved(e.target.value)}
                        className="w-full appearance-none bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner cursor-pointer"
                      >
                        <option value="" disabled>Pick the one that stood out...</option>
                        {LOVED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                    </div>
                  </div>

                  {/* Q2: Ease */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">2. How easy was it to get a useful result?</label>
                    <div className="relative">
                      <select 
                        value={ease}
                        onChange={(e) => setEase(e.target.value)}
                        className="w-full appearance-none bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner cursor-pointer"
                      >
                        <option value="" disabled>Be honest — it helps us improve...</option>
                        {EASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Q3: Use Case */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">3. What kind of decision did you just make?</label>
                    <div className="relative">
                      <select 
                        value={useCase}
                        onChange={(e) => setUseCase(e.target.value)}
                        className="w-full appearance-none bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner cursor-pointer"
                      >
                        <option value="" disabled>Helps us understand who uses TieBreaker...</option>
                        {USE_CASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                    </div>
                  </div>

                  {/* Q4: Future */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">4. What should we build next?</label>
                    <div className="relative">
                      <select 
                        value={future}
                        onChange={(e) => setFuture(e.target.value)}
                        className="w-full appearance-none bg-bg-panel border-2 border-transparent rounded-xl px-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner cursor-pointer"
                      >
                        <option value="" disabled>Your vote shapes the roadmap...</option>
                        {FUTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Q5: NPS */}
                  <div className="space-y-2">
                    <div className="flex flex-col gap-0.5 ml-1">
                      <label className="text-xs font-bold text-text-dim uppercase tracking-wider">5. How likely are you to recommend TieBreaker?</label>
                      <span className="text-[10px] font-medium text-text-muted">0 = Never, 10 = Absolutely</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-between bg-bg-panel p-2 sm:p-3 rounded-2xl border-2 border-transparent">
                      {NPS_OPTIONS.map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNps(num)}
                          className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-black transition-all",
                            nps === num 
                              ? "bg-accent text-bg-surface shadow-md scale-110" 
                              : "bg-bg-surface text-text-dim hover:bg-accent/10 hover:text-accent border border-border-dim"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q6: Open Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-dim uppercase tracking-wider ml-1">6. Anything else? (Optional)</label>
                    <div className="relative">
                      <div className="absolute top-4 left-4 text-accent/50 pointer-events-none">
                        <MessageSquare size={16} />
                      </div>
                      <textarea
                        value={open}
                        onChange={(e) => setOpen(e.target.value)}
                        placeholder="One line is enough, but we read every single one..."
                        rows={2}
                        maxLength={500}
                        className="w-full bg-bg-panel border-2 border-transparent rounded-xl pl-11 pr-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={cn(
                    "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 mt-auto shrink-0",
                    isFormValid 
                      ? "bg-accent text-bg-surface hover:scale-[1.02] active:scale-95 shadow-xl shadow-accent/30" 
                      : "bg-bg-panel text-text-dim opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>
                      Submit Feedback <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
