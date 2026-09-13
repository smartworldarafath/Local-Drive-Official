import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List as ListIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrive } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { cn } from '../lib/utils';

export function Recent() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { items, goBack, selectedIds, clearSelection, settings } = useDrive();

  // For Recent, we show all non-trashed files (not folders typically, but let's show all like dummy data had)
  const recentItems = items.filter(item => !item.trashed).slice(0, 10);
  const isSelectionActive = selectedIds.length > 0;
  const isMaterial3 = settings.uiTheme === 'Material 3';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10" onClick={() => { setActiveMenu(null); if (!isSelectionActive) clearSelection(); }}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-slate-100">Recent</h1>
        </div>
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
      </header>

      <section className="space-y-4">
        <div 
          className={view === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6" : "flex flex-col gap-2"}
        >
          {recentItems.map(item => (
            <DriveItemCard 
              key={item.id} 
              item={item} 
              view={view} 
              activeMenu={activeMenu} 
              setActiveMenu={setActiveMenu} 
            />
          ))}
          {recentItems.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No recent items.</p>}
        </div>
      </section>
    </div>
  );
}
