import React, { useState } from 'react';
import { 
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Plus,
  ChevronRight,
  ArrowLeft,
  X,
  Trash2,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useDrive, DriveItem } from '../contexts/DriveContext';
import { DriveItemCard } from '../components/DriveItemCard';
import { LoginBridge } from '../components/LoginBridge';

export function MyDrive() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { 
    items, 
    currentFolderId, 
    navigateToFolder, 
    goBack, 
    selectedIds, 
    clearSelection,
    batchMoveToTrash,
    setMovingItem
  } = useDrive();

  const isSelectionActive = selectedIds.length > 0;
  
  const currentFolder = currentFolderId ? items.find(i => i.id === currentFolderId) : null;

  const myDriveItems = items.filter(item => {
    if (item.trashed || item.spam) return false;
    
    return (item.parentId || null) === (currentFolderId || null);
  }).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const folders = myDriveItems.filter(item => item.isFolder);
  const files = myDriveItems.filter(item => !item.isFolder);

  const { isTgLoggedIn, setTgAuthStep, tgUser } = useDrive();

  if (!isTgLoggedIn) {
    return (
      <LoginBridge 
        title="Access Your Drive"
        description="Sign in with Telegram to manage your assets, organize folders, and sync across all your devices."
        icon="smartphone"
      />
    );
  }

  const handleMoveSelection = () => {
    const firstItem = items.find(i => i.id === selectedIds[0]);
    if (firstItem) {
      setMovingItem(firstItem); // For now moving first one, we could extend MoveModal for multiple
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-[32px] max-w-7xl mx-auto mb-16 pt-8" onClick={() => { setActiveMenu(null); if (!isSelectionActive) clearSelection(); }}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10">
        <div className="flex items-center gap-2 max-w-full">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 mr-1 sm:mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 
            onClick={() => navigateToFolder(null)}
            className={`text-2xl sm:text-3xl font-bold transition-colors cursor-pointer hover:text-primary whitespace-nowrap ${currentFolderId ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}
          >
            My Drive
          </h1>
          {currentFolder && (
            <>
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-slate-400 shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px] sm:max-w-[300px]">
                {currentFolder.name}
              </h1>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {isSelectionActive && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 bg-white dark:bg-slate-900/40 dark:backdrop-blur-[40px] border border-slate-200 dark:border-white/5 p-1 rounded-lg shadow-sm"
              >
                <div className="px-3 py-2 flex items-center gap-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{selectedIds.length} Selected</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1" />
                <button 
                  onClick={handleMoveSelection}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                  title="Move"
                >
                  <Move className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => batchMoveToTrash(selectedIds)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                  title="Move to trash"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/40 dark:backdrop-blur-[40px] border border-slate-200 dark:border-white/5 p-1 rounded-lg shadow-[0_8px_16px_rgba(26,115,232,0.02)]">
            <AnimatePresence>
              {isSelectionActive && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSelection}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors border-r border-slate-100 dark:border-white/5 pr-3 mr-1"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-blue-600/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-blue-600/10 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mb-10 mt-8">
        <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
          Folders <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
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
          {folders.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No folders here.</p>}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
          Files <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
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
          {files.length === 0 && <p className="text-slate-500 dark:text-slate-400 text-sm">No files here.</p>}
        </div>
      </section>
    </div>
  );
}
