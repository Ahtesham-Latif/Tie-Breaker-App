import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '../../db/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (isSignUp: boolean) => void;
  initialIsSignUp?: boolean;
}

export function AuthModal({ isOpen, onClose, onSuccess, initialIsSignUp = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialIsSignUp);
    }
  }, [isOpen, initialIsSignUp]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [professionType, setProfessionType] = useState('Student');
  const [customProfession, setCustomProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Age Validation
        if (age) {
          const parsedAge = parseInt(age, 10);
          if (isNaN(parsedAge) || parsedAge <= 10 || parsedAge >= 63) {
            setError("Please enter a valid age between 11 and 62 so we can tailor the experience for you. (Err: AUTH-AGE-01)");
            setLoading(false);
            return;
          }
        }

        // Basic validations
        if (password.length < 8) {
          throw new Error("For your security, please use a password that is at least 8 characters long. (Err: AUTH-PWD-01)");
        }
        if (!/\d/.test(password)) {
          throw new Error("To keep your account safe, please include at least one number in your password. (Err: AUTH-PWD-02)");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          throw new Error("For extra security, please add at least one special character (like ! or @) to your password. (Err: AUTH-PWD-03)");
        }

        const safeEmail = email.trim().toLowerCase();
        let safeProfession = professionType === 'Other' ? customProfession.trim() : professionType;
        
        // Basic length limitation to prevent oversized inputs
        if (safeProfession.length > 50) {
            safeProfession = safeProfession.substring(0, 50);
        }

        // Sign Up Flow
        if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL === "https://dummy.supabase.co") {
          throw new Error("We're currently experiencing a slight issue connecting to our authentication servers. Please try again in a moment. (Err: AUTH-ENV-01)");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: safeEmail,
          password,
          options: {
            data: {
              age: age ? parseInt(age, 10) : null,
              profession: safeProfession,
            }
          }
        });
        
        if (signUpError) throw signUpError;

        if (!data.session) {
          setError("We've sent a confirmation link to your email! Please click it to securely activate your account.");
          setLoading(false);
          return;
        }

      } else {
        // Log In Flow
        if (import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL === "https://dummy.supabase.co") {
          throw new Error("We're currently experiencing a slight issue connecting to our authentication servers. Please try again in a moment. (Err: AUTH-ENV-02)");
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
      }
      
      onSuccess?.(isSignUp);
      onClose();
    } catch (err: any) {
      setError(err.message || "We ran into an unexpected hiccup while logging you in. Please give it another try! (Err: AUTH-GEN-01)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base/80 md:bg-black/60 backdrop-blur-md md:p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full md:h-auto md:max-w-md flex flex-col overflow-y-auto bg-bg-surface md:border-2 border-accent/20 md:rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-start p-5 pb-1 md:p-5 md:pb-0">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-text-main transition-colors uppercase tracking-widest bg-bg-panel px-2 py-0.5 rounded-lg border border-border-dim"
            >
              <X size={14} /> Back
            </button>
          </div>

          <div className="p-5 md:p-7 flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-bright mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-text-muted mb-8">
              {isSignUp 
                ? 'Join TieBreaker to save your decisions and unlock unlimited analyses.' 
                : 'Log in to view your past analyses and continue your session.'}
            </p>

            {error && (
              <div className="p-2 mb-6 text-sm font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-panel border-2 border-bg-panel focus:border-accent rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-panel border-2 border-bg-panel focus:border-accent rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-1 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 ml-1">Age</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full bg-bg-panel border-2 border-bg-panel focus:border-accent rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors"
                          placeholder="e.g. 25"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Profession</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <select
                          value={professionType}
                          onChange={(e) => setProfessionType(e.target.value)}
                          className="w-full bg-bg-panel border-2 border-bg-panel focus:border-accent rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors"
                        >
                          {['Student', 'Developer', 'Designer', 'Marketer', 'Manager', 'Entrepreneur', 'Other'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <AnimatePresence>
                        {professionType === 'Other' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative mt-1"
                          >
                            <input
                              type="text"
                              value={customProfession}
                              onChange={(e) => setCustomProfession(e.target.value)}
                              className="w-full bg-bg-panel border-2 border-bg-panel focus:border-accent rounded-xl py-1 px-3 text-sm font-medium outline-none transition-colors"
                              placeholder="Type your profession..."
                              required
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-bg-surface font-black uppercase tracking-widest py-2.5 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : 'Log In')}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-text-muted hover:text-accent transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Log In' 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
