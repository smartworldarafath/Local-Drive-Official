import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';
import { cn, getContrastColor } from '../lib/utils';

interface ActionMenuProps {
  id: string;
  isFolder?: boolean;
  trashed?: boolean;
  activeMenu: string | null;
  onToggle: (id: string | null) => void;
}

const COLORS = [
  '#ea4335', // red
  '#f28b82', // light red
  '#fbbc04', // yellow
  '#fde293', // light yellow
  '#34a853', // green
  '#81c995', // light green
  '#4285f4', // blue
  '#aecbfa', // light blue
  '#8e24aa', // purple
  '#d7aefb', // light purple
  '#e8eaed', // grey
  '#5f6368', // dark grey
];

export function ActionMenu({ id, isFolder, trashed, activeMenu, onToggle }: ActionMenuProps) {
  const isOpen = activeMenu === id;
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<'left' | 'right'>('right');
  const [menuPosition, setMenuPosition] = useState<'left' | 'right'>('right');
  
  const { 
    items, 
    moveToTrash, 
    restoreFromTrash,
    deletePermanently,
    renameItem, 
    changeFolderColor, 
    toggleStarred, 
    viewItemInfo,
    setMovingItem,
    setRenamingItem,
    downloadItem,
    showToast,
    settings
  } = useDrive();

  const currentItem = items.find(item => item.id === id);
  const isItemTrashed = trashed || currentItem?.trashed;
  const isMaterial3 = settings.uiTheme === 'Material 3';
  const isColored = currentItem?.isFolder && !!currentItem?.color;
  const contrast = getContrastColor(currentItem?.color);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const menuWidth = 256;
      setMenuPosition(rect.right + menuWidth + 12 < window.innerWidth ? 'left' : 'right');
    }
  }, [isOpen]);

  useEffect(() => {
    if (showColorPicker && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      // If the menu is on the right half of the screen, show picker on the left
      if (rect.left > screenWidth / 2) {
        setPickerPosition('left');
      } else {
        setPickerPosition('right');
      }
    }
  }, [showColorPicker]);

  useEffect(() => {
    const parentGroup = menuRef.current?.closest('.group') as HTMLElement;
    if (isOpen && parentGroup) {
      parentGroup.style.zIndex = '9999';
    } else if (parentGroup) {
      parentGroup.style.zIndex = '';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Allow clicking specifically if it's outside our menu and we're open
      if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle(null);
        setShowColorPicker(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    onToggle(null);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://localdrive.app/file/${id}`);
    showToast('Link copied');
    onToggle(null);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentItem) {
      setRenamingItem(currentItem);
      onToggle(null);
    }
  };

  if (!currentItem) return null;

  return (
    <>
      <div 
        className="relative" 
        ref={menuRef} 
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <button 
          id={`action-menu-button-${id}`}
          onClick={(e) => { e.stopPropagation(); onToggle(isOpen ? null : id); setShowColorPicker(false); e.preventDefault(); }}
          onPointerDown={(e) => { e.stopPropagation(); }}
          onPointerUp={(e) => { e.stopPropagation(); }}
          onMouseDown={(e) => { e.stopPropagation(); }}
          onMouseUp={(e) => { e.stopPropagation(); }}
          onTouchStart={(e) => { e.stopPropagation(); }}
          onTouchEnd={(e) => { e.stopPropagation(); }}
          className={cn(
            "p-2 rounded-full transition-all focus:opacity-100",
            isOpen 
              ? (isColored && contrast === 'white' ? 'opacity-100 bg-white/20 text-white' : 'opacity-100 bg-black/5 text-slate-800')
              : (isColored && contrast === 'white' ? 'opacity-0 group-hover:opacity-100 text-white/70 hover:text-white' : 'opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-800'),
            isMaterial3 && "m3-bounce"
          )}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={isMaterial3 ? { opacity: 0, scale: 0.8, y: -20 } : { opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={isMaterial3 ? { opacity: 0, scale: 0.8, y: -20 } : { opacity: 0, scale: 0.95, y: -10 }}
              transition={isMaterial3 ? { type: "spring", stiffness: 400, damping: 25 } : { duration: 0.15 }}
              className={cn(
                "absolute top-12 mt-2 w-64 bg-white border border-slate-200 shadow-xl z-[100] py-3 dark:bg-slate-900/95 dark:backdrop-blur-xl dark:border-white/10",
                menuPosition === 'left' ? 'left-0' : 'right-0',
                isMaterial3 ? "rounded-[28px] backdrop-blur-2xl border-slate-200/60 shadow-[0_24px_54px_rgba(0,0,0,0.15)]" : "rounded-xl"
              )}
            >
              {isItemTrashed ? (
                <>
                  <button 
                    onClick={(e) => handleAction(e, () => restoreFromTrash(id))} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Restore
                  </button>
                  <div className="h-px bg-slate-200/50 dark:bg-white/5 w-[calc(100%-48px)] mx-auto my-2"></div>
                  <button 
                    onClick={(e) => handleAction(e, () => {
                      if (window.confirm("Permanently delete this item?")) {
                        deletePermanently(id);
                      }
                    })} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-between transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Delete permanently <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className={cn(
                    "px-6 py-2 pb-1 text-[11px] font-black uppercase tracking-widest",
                    isMaterial3 ? "text-slate-400" : "sr-only"
                  )}>Options</div>
                  
                  <button 
                    onClick={(e) => handleCopyLink(e)} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Copy link
                  </button>
                  
                  <button 
                    onClick={(e) => handleAction(e, () => toggleStarred(id))} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    {currentItem.starred ? 'Remove from starred' : 'Add to starred'}
                  </button>
                  
                  <button 
                    onClick={handleRenameClick} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Rename
                  </button>
                  
                  <button 
                    onClick={(e) => handleAction(e, () => setMovingItem(currentItem))} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Move to
                  </button>
                  
                  {!isFolder && (
                    <button 
                      onClick={(e) => handleAction(e, () => downloadItem(currentItem))} 
                      className={cn(
                        "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                        isMaterial3 ? "rounded-2xl" : "rounded-lg"
                      )}
                    >
                      Download
                    </button>
                  )}
                  
                  <div className="h-px bg-slate-200/50 dark:bg-white/5 w-[calc(100%-48px)] mx-auto my-2"></div>
                  
                  {isFolder ? (
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }} 
                        className={cn(
                          "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                          isMaterial3 ? "rounded-2xl" : "rounded-lg"
                        )}
                      >
                        Change color
                      </button>
                      {showColorPicker && (
                        <motion.div 
                          initial={isMaterial3 ? { opacity: 0, x: pickerPosition === 'right' ? -10 : 10 } : { opacity: 0, scale: 0.9 }}
                          animate={isMaterial3 ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1 }}
                          className={cn(
                            "absolute top-0 p-4 bg-white border border-slate-200 shadow-xl z-[999] dark:bg-slate-900 border-slate-200/60 dark:border-white/10",
                            isMaterial3 ? "rounded-[28px] shadow-[0_24px_54px_rgba(0,0,0,0.2)] w-[184px]" : "rounded-xl w-[164px]",
                            pickerPosition === 'right' ? 'left-full ml-4' : 'right-full mr-4'
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Select Theme</p>
                          <div className="grid grid-cols-4 gap-2">
                            {COLORS.map(color => (
                              <button
                                key={color}
                                onClick={(e) => handleAction(e, () => changeFolderColor(id, color))}
                                className={cn(
                                  "w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 active:scale-90 flex items-center justify-center",
                                  currentItem.color === color ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent shadow-sm'
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                              >
                                {currentItem.color === color && (
                                  <div className={cn("w-2 h-2 rounded-full bg-white shadow-sm", isMaterial3 && "animate-pulse")} />
                                )}
                              </button>
                            ))}
                            <button
                              onClick={(e) => handleAction(e, () => changeFolderColor(id, undefined))}
                              className={cn(
                                "w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 active:scale-90 flex items-center justify-center bg-slate-100 dark:bg-white/10",
                                !currentItem.color ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent shadow-inner'
                              )}
                              title="Reset to default"
                            >
                              <div className="w-4 h-0.5 bg-slate-400 rounded-full" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleAction(e, () => viewItemInfo(currentItem))} 
                      className={cn(
                        "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all active:scale-95",
                        isMaterial3 ? "rounded-2xl" : "rounded-lg"
                      )}
                    >
                      View information
                    </button>
                  )}
                  
                  <div className="h-px bg-slate-200/50 dark:bg-white/5 w-[calc(100%-48px)] mx-auto my-2"></div>
                  <button 
                    onClick={(e) => handleAction(e, () => moveToTrash(id, !!isFolder))} 
                    className={cn(
                      "w-[calc(100%-16px)] mx-2 text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold text-red-600 dark:text-red-400 flex items-center justify-between transition-all active:scale-95",
                      isMaterial3 ? "rounded-2xl" : "rounded-lg"
                    )}
                  >
                    Move to trash <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
