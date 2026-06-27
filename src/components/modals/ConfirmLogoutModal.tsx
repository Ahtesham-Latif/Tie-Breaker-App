import { motion } from "framer-motion";
import { Power, X } from "lucide-react";

interface ConfirmLogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmLogoutModal({ onConfirm, onCancel }: ConfirmLogoutModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-sm bg-bg-surface border-2 border-border-dim rounded-2xl shadow-2xl overflow-hidden p-6"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-bg-panel hover:text-text-main transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
            <Power size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-bright mb-2">
            Sign Out
          </h2>
          <p className="text-sm text-text-muted mb-6">
            Are you sure you want to sign out of your account?
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border-dim font-bold text-text-main hover:bg-bg-panel transition-colors"
            >
              No, Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-accent text-bg-surface font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20 uppercase tracking-widest text-xs"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
