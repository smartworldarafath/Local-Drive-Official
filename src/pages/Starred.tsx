import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List as ListIcon,
  Star,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDrive, DriveItem } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { cn } from '../lib/utils';
import { LoginBridge } from '../components/LoginBridge';

export function Starred() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { items, goBack, selectedIds, clearSelection, settings, isTgLoggedIn } = useDrive();

  if (!isTgLoggedIn) {
    return (
      <LoginBridge 
        title="Your Favorites"
        description="Star any file or folder to keep them within reach. Login with Telegram to see your collection."
        icon="shield"
      />
    );
  }

  // Filter items that are starred and not trashed
  const starredItems = items.filter(item => item.starred && !item.trashed);
  const folders = starredItems.filter(item => item.isFolder);
  const files = starredItems.filter(item => !item.isFolder);
  
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center border border-white dark:border-white/10">
               <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 dark:text-slate-100">Starred</h1>
          </div>
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
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
          Folders
        </h2>
        <div 
          className={view === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6" : "flex flex-col gap-2"}
        >
          {folders.map(folder => (
            <DriveItemCard 
              key={folder.id} 
              item={folder} 
              view={view} 
              activeMenu={activeMenu} 
              setActiveMenu={setActiveMenu} 
            />
          ))}
          {folders.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No starred folders.</p>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
          Files
        </h2>
        <div 
          className={view === 'grid' ? "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6" : "flex flex-col gap-2"}
        >
          {files.map(file => (
            <DriveItemCard 
              key={file.id} 
              item={file} 
              view={view} 
              activeMenu={activeMenu} 
              setActiveMenu={setActiveMenu} 
            />
          ))}
          {files.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No starred files.</p>}
        </div>
      </section>
    </div>
  );
}
