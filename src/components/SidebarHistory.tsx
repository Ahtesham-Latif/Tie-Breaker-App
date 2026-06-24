import React, { useEffect, useState } from 'react';
import { Clock, Loader2, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '../db/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

interface SidebarHistoryProps {
  onLoadDecision: (decisionData: any) => void;
  onShowAuth: () => void;
}

export function SidebarHistory({ onLoadDecision, onShowAuth }: SidebarHistoryProps) {
  const { user, signOut } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex md:hidden items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-inner">
            <UserIcon size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-bright truncate max-w-[150px]">
              {user.email?.split('@')[0]}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-accent opacity-80">
              Pro Member
            </span>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>

      <h3 className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-2 mb-3 shrink-0">
        <Clock size={14} /> My History
      </h3>

      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-accent" size={16} />
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-text-muted italic text-center p-4 bg-bg-panel rounded-xl">
            No decisions saved yet.
          </p>
        ) : (
          history.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onLoadDecision(item)}
              className="w-full text-left p-3 rounded-xl bg-bg-panel border-2 border-transparent hover:border-accent/30 transition-all group flex flex-col gap-1 shadow-sm"
            >
              <div className="text-xs font-bold text-text-main truncate group-hover:text-accent transition-colors">
                {item.query}
              </div>
              <div className="text-[10px] text-text-muted opacity-70">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
