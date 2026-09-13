import React, { useState, useEffect } from 'react';
import { useDrive, DriveItem } from '../contexts/DriveContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Folder, FolderPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface MoveToModalProps {
  item: DriveItem | null;
  onClose: () => void;
}

export function MoveToModal({ item, onClose }: MoveToModalProps) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { items, moveItem, createFolder, currentFolderId: activeFolderId, settings } = useDrive();
  const [currentViewFolderId, setCurrentViewFolderId] = useState<string | null>(null);
  const [isMoved, setIsMoved] = useState(false);
  
  const isMaterial3 = settings.uiTheme === 'Material 3';

  // Reset view when modal opens
  useEffect(() => {
    if (item) {
      setCurrentViewFolderId(null);
      setIsMoved(false);
      setIsCreatingFolder(false);
    }
  }, [item]);

  if (!item) return null;

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), currentViewFolderId);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const getDescendantIds = (folderId: string): string[] => {
    const children = items.filter(i => i.isFolder && i.parentId === folderId);
    let ids = children.map(c => c.id);
    for (const child of children) {
      ids = [...ids, ...getDescendantIds(child.id)];
    }
    return ids;
  };

  const descendants = item.isFolder ? getDescendantIds(item.id) : [];
  const allFolders = items.filter(i => 
    i.isFolder && 
    !i.trashed && 
    i.id !== item.id && 
    !descendants.includes(i.id)
  );
  
  const foldersToDisplay = allFolders.filter(f => f.parentId === currentViewFolderId);

  const goUpOneLevel = () => {
    if (!currentViewFolderId) return;
    const currentFolder = items.find(i => i.id === currentViewFolderId);
    setCurrentViewFolderId(currentFolder?.parentId || null);
  };

  const handleMove = () => {
    moveItem(item.id, currentViewFolderId);
    setIsMoved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const getBreadcrumbs = () => {
    if (!currentViewFolderId) return ['My Drive'];
    const folder = items.find(i => i.id === currentViewFolderId);
    return ['My Drive', folder?.name];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={isMaterial3 ? { scale: 0.8, opacity: 0, y: -20 } : { scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={isMaterial3 ? { scale: 0.8, opacity: 0, y: -20 } : { scale: 0.95, opacity: 0, y: 10 }}
          transition={isMaterial3 ? { type: "spring", stiffness: 400, damping: 28 } : { duration: 0.2 }}
          className={cn(
            "bg-white border flex flex-col max-h-[85vh]",
            isMaterial3 
              ? "dark:bg-[#1C1B1F] border-slate-200 dark:border-white/10 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.25)] w-full max-w-lg overflow-hidden" 
              : "dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            "border-b flex items-center justify-between",
            isMaterial3 ? "p-8 pb-4 border-slate-100 dark:border-white/5" : "px-6 py-4 border-slate-100 dark:border-white/5"
          )}>
            <div className="flex items-center gap-5">
              <div className={cn(
                "rounded-[20px] flex items-center justify-center transition-transform",
                isMaterial3 ? "w-14 h-14 bg-primary-container text-on-primary-container shadow-sm m3-bounce group-hover:rotate-12" : "w-10 h-10 bg-primary/10 text-primary"
              )}>
                {item.isFolder ? <Folder className={isMaterial3 ? "w-8 h-8" : "w-5 h-5"} /> : <Folder className={isMaterial3 ? "w-8 h-8" : "w-5 h-5"} />}
              </div>
              <div>
                <h3 className={cn("font-bold text-slate-900 dark:text-white leading-tight", isMaterial3 ? "text-2xl tracking-tight" : "text-lg")}>Move "{item.name}"</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select destination directory</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumbs / Navigation */}
          <div className={cn(
            "flex items-center gap-2 overflow-x-auto scrollbar-hide text-sm border-b",
            isMaterial3 ? "px-8 py-4 bg-slate-100/50 dark:bg-black/30 border-slate-100 dark:border-white/5" : "px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-white/5"
          )}>
            {currentViewFolderId && (
              <button 
                onClick={goUpOneLevel}
                className={cn(
                  "p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all mr-1 active:scale-90",
                  isMaterial3 && "m3-bounce"
                )}
                title="Go up one level"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 font-bold" />
              </button>
            )}
            <button 
              onClick={() => setCurrentViewFolderId(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-slate-500 hover:bg-white/80 dark:hover:bg-white/5 font-black whitespace-nowrap transition-all uppercase tracking-widest text-[10px]",
                isMaterial3 ? "dark:text-slate-500" : "dark:text-slate-400"
              )}
            >
              My Drive
            </button>
            {currentViewFolderId && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full font-black whitespace-nowrap tracking-wide">
                  {items.find(i => i.id === currentViewFolderId)?.name}
                </span>
              </>
            )}
          </div>

          {/* Folder List */}
          <div className="flex-1 overflow-y-auto p-4 min-h-[350px]">
            {foldersToDisplay.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-12 text-center">
                <div className={cn("bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse", isMaterial3 ? "w-24 h-24" : "w-16 h-16")}>
                  <FolderPlus className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-200">No destination found</p>
                <p className="text-sm mt-1 max-w-[200px] font-medium opacity-60">This folder has no visible subdirectories for relocation.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {foldersToDisplay.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentViewFolderId(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 group transition-all active:scale-[0.98]",
                      isMaterial3 ? "rounded-[28px] hover:bg-slate-50 dark:hover:bg-white/5 m3-bounce" : "rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Folder className="w-5 h-5 text-slate-400" style={{ color: folder.color }} fill={folder.color || "currentColor"} />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-base">{folder.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={cn(
            "p-8 border-t flex flex-col gap-4",
            isMaterial3 ? "border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-black/30" : "p-6 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30"
          )}>
            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex gap-3">
                <input
                  autoFocus
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Name the new directory"
                  className={cn(
                    "flex-1 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all dark:text-white",
                    isMaterial3 ? "rounded-[28px]" : "rounded-xl"
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "px-8 py-4 bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-95",
                    isMaterial3 ? "rounded-[28px] font-black m3-bounce" : "rounded-xl"
                  )}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-4 py-4 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-4 text-sm font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest"
                  >
                    Dismiss
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsCreatingFolder(true)}
                    className={cn(
                      "flex h-14 w-14 sm:w-auto sm:px-6 items-center justify-center gap-3 border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-primary transition-all active:scale-95 shadow-sm",
                      isMaterial3 ? "rounded-[28px] m3-bounce" : "rounded-xl"
                    )}
                    title="New folder"
                  >
                    <FolderPlus className="w-5 h-5 text-primary" />
                    <span className="text-sm font-black hidden sm:inline uppercase tracking-widest">New folder</span>
                  </button>

                  <button
                    onClick={handleMove}
                    disabled={isMoved}
                    className={cn(
                      "h-14 px-10 font-black transition-all flex items-center gap-3 shadow-xl uppercase tracking-widest text-sm",
                      isMaterial3 ? "rounded-[28px] m3-bounce" : "rounded-xl",
                      isMoved 
                        ? 'bg-emerald-500 text-white scale-95 opacity-80' 
                        : 'bg-primary text-white hover:bg-primary-dark active:scale-95 hover:shadow-primary/40'
                    )}
                  >
                    {isMoved ? (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        <span>Relocated</span>
                      </>
                    ) : (
                      <span>Move item</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
