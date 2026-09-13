import React, { useState } from 'react';
import { 
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrive } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { cn } from '../lib/utils';
import { LoginBridge } from '../components/LoginBridge';

export function Trash() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { items, emptyTrash, goBack, selectedIds, clearSelection, isTgLoggedIn } = useDrive();

  if (!isTgLoggedIn) {
    return (
      <LoginBridge 
        title="Sanitize Your Space"
        description="Review items marked for deletion. Login with Telegram to manage your trash and reclaim storage."
        icon="lock"
      />
    );
  }

  const trashedItems = items.filter(item => item.trashed);
  const isSelectionActive = selectedIds.length > 0;

  const handleEmptyTrash = () => {
    if (trashedItems.length > 0 && window.confirm("Are you sure you want to permanently delete all items in the trash?")) {
      emptyTrash();
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8" onClick={() => { setActiveMenu(null); if (!isSelectionActive) clearSelection(); }}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Trash
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleEmptyTrash}
            disabled={trashedItems.length === 0}
            className="text-primary font-semibold text-[14px] hover:bg-blue-50/50 dark:hover:bg-white/5 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Empty trash
          </button>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/40 dark:backdrop-blur-[40px] border border-slate-200 dark:border-white/5 p-1 rounded-lg shadow-[0_8px_16px_rgba(26,115,232,0.02)]">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-blue-600/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-blue-600/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm max-w-2xl">
        <AlertCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[14px] text-slate-600 dark:text-slate-300">
          Items in trash are deleted forever after 30 days.
        </p>
      </div>

      <section className="space-y-4">
        <div 
          className={view === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6" : "flex flex-col gap-2"}
        >
          {trashedItems.map(item => (
            <DriveItemCard 
              key={item.id} 
              item={item} 
              view={view} 
              trashed={true}
              activeMenu={activeMenu} 
              setActiveMenu={setActiveMenu} 
            />
          ))}
          {trashedItems.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">Trash is empty.</p>}
        </div>
      </section>
    </div>
  );
}
