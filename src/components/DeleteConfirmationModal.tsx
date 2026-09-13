import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  itemCount: number;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemCount }: DeleteConfirmationModalProps) {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden border border-slate-100"
          >
            <div className="p-8 pb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <AlertCircle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight">Move to Trash?</h3>
              <p className="text-slate-500 font-medium">
                Are you sure you want to delete {itemCount === 1 ? 'this item' : `these ${itemCount} items`}?
              </p>
            </div>

            <div className="px-8 pb-8 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setDontShowAgain(!dontShowAgain)}
                  className={cn(
                    "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                    dontShowAgain ? "bg-primary border-primary" : "border-slate-300"
                  )}
                >
                  {dontShowAgain && <div className="w-2 h-2 bg-white rounded-sm" />}
                </button>
                <span className="text-sm font-semibold text-slate-600 select-none cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
                  Don't show this again
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onConfirm(dontShowAgain)}
                  className="flex-1 py-3.5 px-6 rounded-2xl font-black bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
