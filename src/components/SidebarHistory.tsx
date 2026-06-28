import React, { useEffect, useState } from 'react';
import { Clock, Loader2, LogOut, User as UserIcon, Trash2, EyeOff, Shield } from 'lucide-react';
import { supabase } from '../db/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarHistoryProps {
  onLoadDecision: (decisionData: any) => void;
  onShowAuth: () => void;
  onShowLogout: () => void;
}

export function SidebarHistory({ onLoadDecision, onShowAuth, onShowLogout }: SidebarHistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [tiesCount, setTiesCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      
      // Fetch profile to check Pro status, privacy mode, and usage limit
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, privacy_mode, ties_count')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setIsPro(profile.plan === 'pro');
        setPrivacyMode(!!profile.privacy_mode);
        setTiesCount(profile.ties_count || 0);
      }

      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent loading the decision
    setHistory((prev) => prev.filter((item) => item.id !== id));
    
    await supabase
      .from('decisions')
      .update({ is_hidden: true })
      .eq('id', id);
  };

  const togglePrivacyMode = async () => {
    if (!isPro) return;
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    
    await supabase
      .from('profiles')
      .update({ privacy_mode: newMode })
      .eq('id', user.id);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden flex-wrap min-w-0">
      <div className="flex md:hidden items-center justify-between mb-6 shrink-0 flex-wrap min-w-0">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-inner",
            isPro ? "bg-amber-500/20 text-amber-500" : "bg-accent/10 text-accent"
          )}>
            <UserIcon size={16} />
          </div>
          <div className="flex flex-col flex-wrap min-w-0">
            <span className={cn(
              "text-xs font-bold truncate max-w-full max-w-[min(150px,100vw)] min-w-0",
              isPro ? "text-amber-600 dark:text-amber-400" : "text-text-bright"
            )}>
              {user.email?.split('@')[0]}
            </span>
            <span className={cn(
              "text-[clamp(10px,0.9vw,17px)] font-black uppercase tracking-wider opacity-80",
              isPro ? "text-amber-500" : "text-accent"
            )}>
              {isPro ? "Pro Member" : `${tiesCount}/15 Free Ties`}
            </span>
          </div>
        </div>
        <button 
          onClick={onShowLogout}
          className="px-3 py-1.5 text-[clamp(10px,1.0vw,18px)] font-bold uppercase tracking-widest text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all flex items-center gap-2 border border-transparent hover:border-danger/20 flex-wrap min-w-0"
          title="Sign Out"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 shrink-0 flex-wrap min-w-0">
        <h3 className="text-[clamp(10px,1.1vw,19px)] font-bold uppercase tracking-widest text-accent flex items-center gap-2 flex-wrap min-w-0">
          <Clock size={14} /> My History
        </h3>
        {isPro && (
          <button
            onClick={togglePrivacyMode}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[clamp(10px,0.9vw,17px)] font-black uppercase tracking-widest transition-all ${
              privacyMode 
                ? 'bg-accent text-bg-surface shadow-md shadow-accent/20' 
                : 'bg-bg-panel text-text-muted hover:text-text-main border border-border-dim'
            }`}
            title={privacyMode ? "Privacy Mode On: New decisions are hidden" : "Privacy Mode Off: Saving decisions"}
          >
            {privacyMode ? <Shield size={12} /> : <EyeOff size={12} />}
            {privacyMode ? 'Privacy On' : 'Privacy Off'}
          </button>
        )}
      </div>

      <div className="flex-1 relative min-h-[200px]">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-1 pb-3 space-y-2">
          {loading ? (
            <div className="flex justify-center p-3 flex-wrap min-w-0">
              <Loader2 className="animate-spin text-accent" size={16} />
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-text-muted italic text-center p-3 bg-bg-panel rounded-xl">
              No decisions saved yet.
            </p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="w-full relative group flex flex-wrap min-w-0"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onLoadDecision(item)}
                  className="flex-1 text-left p-2 rounded-xl bg-bg-panel border-2 border-transparent hover:border-accent/30 transition-all flex flex-col gap-1 shadow-sm pr-10 flex-wrap min-w-0"
                >
                  <div className="text-xs font-bold text-text-main truncate group-hover:text-accent transition-colors">
                    {item.query}
                  </div>
                  <div className="text-[clamp(10px,1.0vw,18px)] text-text-muted opacity-70">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </motion.button>
                {isPro && (
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-danger opacity-0 group-hover:opacity-100 hover:bg-danger/10 rounded-lg transition-all"
                    title="Delete from history"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
