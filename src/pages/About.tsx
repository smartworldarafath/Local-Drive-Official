import React, { useState } from 'react';
import { 
  Github,
  Instagram,
  Facebook,
  Send,
  Youtube,
  Mail,
  Info 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useDrive } from '../contexts/DriveContext';

const RELEASE_URL = "https://github.com/smartworldarafath/Local-Drive-Cloud-Storage-/releases/tag/V1.0.7";

export function About() {
  const { setIsFeatureShowcaseOpen } = useDrive();
  const [reportText, setReportText] = useState('');

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Info className="w-10 h-10 text-primary" />
          About Local Drive
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Platform information and developer details</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 border border-slate-200 dark:bg-[#2C2C2E]/80 dark:border-white/5 p-8 rounded-3xl flex flex-col gap-6 backdrop-blur-xl shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 rounded-tr-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 text-center sm:text-left">
            <h5 className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Developer</h5>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">Arafath Rahman</div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto sm:mx-0">
              Crafting premium web experiences with a focus on polished UI details and flawless interactions.
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm" title="Official GitHub page">
              <Github className="w-5 h-5" />
            </a>
            <a href="mailto:arafathrahman711@gmail.com" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-rose-500 dark:hover:text-rose-400 transition-all shadow-sm">
              <Mail className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/arafath_rahman_/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-pink-500 transition-all shadow-sm">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/arafath.rahman.57956" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-500 transition-all shadow-sm">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://t.me/localdrivecommunity" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-sky-500 transition-all shadow-sm">
              <Send className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-red-500 transition-all shadow-sm">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <button 
          onClick={() => setIsFeatureShowcaseOpen(true)}
          className="mt-2 w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
        >
          Learn about features
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm text-center hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
          >
            New release
          </a>
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white rounded-xl font-bold text-sm text-center hover:bg-slate-200 dark:hover:bg-white/15 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
          >
            Official GitHub page
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 border border-slate-200 dark:bg-[#2C2C2E]/80 dark:border-white/5 p-8 rounded-3xl flex flex-col gap-4 backdrop-blur-xl shadow-sm"
      >
        <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Report Bugs</h5>
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Describe the bug you found (max 100 words)..."
          className="w-full p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-32"
        />
        <button 
          onClick={() => {
            const mailto = `mailto:arafathrahman710@gmail.com?subject=Bug Report&body=${encodeURIComponent(reportText)}`;
            window.location.href = mailto;
          }}
          className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          Send Report
        </button>
      </motion.div>
    </div>
  );
}
