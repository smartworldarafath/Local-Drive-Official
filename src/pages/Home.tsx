import React, { useState } from 'react';
import { ArrowLeft, Clock, Send } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

import { LoginBridge } from '../components/LoginBridge';

export function Home() {
  const { goBack, items, isTgLoggedIn, setTgAuthStep, tgUser } = useDrive();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Show active uploaded files, sorted by date (newest first)
  const homeItems = items
    .filter(item => !item.trashed && !item.spam)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  if (!isTgLoggedIn) {
    return (
      <LoginBridge 
        title="Your Cloud. Your Terms."
        description="Connect your Telegram account to use your Saved Messages as infinite, secure, and blazing-fast cloud storage."
        icon="telegram"
      />
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto" onClick={() => setActiveMenu(null)}>
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 pt-4">
        <button 
          onClick={goBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Home</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Logged in as @{tgUser?.username || tgUser?.firstName || 'User'}</p>
        </div>
      </div>
      
      <section className="space-y-4 pb-20 sm:pb-0">
        {homeItems.length > 0 ? (
          <motion.div layout className="flex flex-col gap-2">
            {homeItems.map(item => (
              <DriveItemCard 
                key={item.id} 
                item={item} 
                view="list" 
                activeMenu={activeMenu} 
                setActiveMenu={setActiveMenu} 
              />
            ))}
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:backdrop-blur-[40px] dark:border-white/5 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
               <Clock className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No files yet</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Files you upload will appear here chronologically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
