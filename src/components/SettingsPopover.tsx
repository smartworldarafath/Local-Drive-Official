import React, { useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Monitor, Keyboard, HelpCircle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrive } from '../contexts/DriveContext';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function SettingsPopover({ isOpen, onClose, onOpenSettings }: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useDrive();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        if (!target.closest('#settings-menu-button')) {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-64 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="p-1">
            <button 
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm group"
            >
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  ) }
                </AnimatePresence>
                <span>Theme</span>
              </div>
              <span className="text-xs text-slate-500 capitalize">{theme}</span>
            </button>
            <div className="h-px w-full bg-slate-200/50 dark:bg-slate-800 my-1"></div>
            <button 
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm group"
            >
              <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm group">
              <Monitor className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              Get Drive for desktop
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm group">
              <Keyboard className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              Keyboard shortcuts
            </button>
          </div>
          
          <div className="h-px w-full bg-slate-200/50 dark:bg-white/5 my-1"></div>
          
          <div className="p-1">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-medium text-sm group">
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
              Help
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
