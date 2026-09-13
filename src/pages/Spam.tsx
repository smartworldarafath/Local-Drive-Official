import React, { useState } from 'react';
import { AlertTriangle, Trash2, MailX, AlertCircle, ArrowLeft } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { LoginBridge } from '../components/LoginBridge';

export function Spam() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { goBack, items, emptyTrash, isTgLoggedIn } = useDrive();

  if (!isTgLoggedIn) {
     return (
       <LoginBridge 
         title="Security Shield"
         description="Filter out noise and suspicious activity. Login with Telegram to review and clean up your spam folder."
         icon="shield"
       />
     );
  }

  const spamItems = items.filter(item => item.spam);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8" onClick={() => setActiveMenu(null)}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            Spam
          </h1>
        </div>
        <button className="text-primary font-semibold text-[14px] hover:bg-blue-50 dark:hover:bg-white/5 px-4 py-2 rounded-lg transition-colors">
          Empty spam
        </button>
      </header>

      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[14px] text-slate-700 dark:text-slate-300">
          Items in spam will be deleted forever after 30 days. <a href="#" className="text-primary hover:underline">Learn more</a>
        </p>
      </div>

      <section className="space-y-4">
        {spamItems.length > 0 ? (
          <div 
            className="flex flex-col gap-2"
          >
            {spamItems.map(item => (
              <DriveItemCard 
                key={item.id} 
                item={item} 
                view="list" 
                activeMenu={activeMenu} 
                setActiveMenu={setActiveMenu} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:backdrop-blur-[40px] dark:border-white/5 rounded-2xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
               <MailX className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Hooray, no spam here!</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Any sketchy files or folders shared with you will appear here so you can review them safely.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
