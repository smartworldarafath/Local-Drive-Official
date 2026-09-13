import React, { useState, useRef } from 'react';
import { PageType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  HardDrive, 
  Monitor, 
  Users, 
  Clock, 
  Star, 
  AlertTriangle, 
  Trash2,
  Cloud,
  Plus,
  Upload,
  FolderPlus,
  Cpu,
  Info,
  Palette,
  Send,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useDrive } from '../contexts/DriveContext';

const localDriveLogo = new URL('../../3d-telegram-paper-airplane-icon.jpg', import.meta.url).href;

interface SidebarProps {
  currentPage: PageType;
  onChangePage: (page: PageType) => void;
  isOpen?: boolean;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'my-drive', label: 'My Drive', icon: HardDrive },
  { id: 'computers', label: 'Computers', icon: Monitor },
  { id: 'shared', label: 'Shared with me', icon: Users },
  { divider: true, id: 'd1' },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'starred', label: 'Starred', icon: Star },
  { divider: true, id: 'd2' },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
  { id: 'trash', label: 'Trash', icon: Trash2 },
  { id: 'system', label: 'System', icon: Cpu },
  { id: 'about', label: 'About', icon: Info },
  { divider: true, id: 'd3' },
  { id: 'customization', label: 'Customization', icon: Palette },
];

export function Sidebar({ currentPage, onChangePage, isOpen }: SidebarProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('New Folder');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, createFolder, navigateToFolder, isTgLoggedIn, tgUser, setTgAuthStep, logoutTg } = useDrive();

  const handlePageChange = (page: PageType) => {
    onChangePage(page);
    // updatePageAndHistory (passed as onChangePage) already handles clearing folder selection and saving history
  };

  const handleUploadClick = () => {
    setAddMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleCreateFolderClick = () => {
    setAddMenuOpen(false);
    setCreateFolderOpen(true);
  };

  const handleCreateFolderConfirm = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
    }
    setCreateFolderOpen(false);
    setNewFolderName('New Folder');
  };

  return (
    <aside className={cn(
      "h-full w-[280px] bg-white dark:bg-slate-900/40 dark:backdrop-blur-[40px] border-r border-slate-200 dark:border-white/5 shadow-sm dark:shadow-[0_8px_16px_rgba(26,115,232,0.02)] flex flex-col z-[100]",
      "fixed inset-y-0 left-0 transform transition-transform duration-300",
      "lg:static lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-[72px] flex items-center gap-4 px-6 shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
          <img 
            src={localDriveLogo}
            alt="Local Drive Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">Local Drive</span>
      </div>
      <div className="p-6 pt-2 shrink-0 relative h-16">
        <AnimatePresence mode="wait">
          {!['trash', 'system', 'about', 'spam', 'recent'].includes(currentPage) && (
            <motion.button 
              key="add-button"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => setAddMenuOpen(!addMenuOpen)}
              className="flex items-center justify-center bg-primary-container text-on-primary-container w-14 h-14 rounded-2xl hover:opacity-90 transition-all shadow-sm active:scale-95 absolute"
            >
              <motion.div animate={{ rotate: addMenuOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                <Plus className="w-6 h-6" />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {addMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0, originX: 0, originY: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute left-6 top-20 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] z-50 py-2"
            >
              <button 
                onClick={handleUploadClick}
                className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Upload</span>
              </button>
              
              {currentPage === 'my-drive' && (
                <button 
                  onClick={handleCreateFolderClick}
                  className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                  <FolderPlus className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Create Folder</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={(e) => {
            if (e.target.files?.length) {
              uploadFiles(e.target.files);
            }
            e.currentTarget.value = '';
          }} 
          className="hidden" 
        />
      </div>

      <AnimatePresence>
        {createFolderOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-6 top-20 mt-2 w-[240px] bg-white shadow-xl border border-slate-200 rounded-xl p-4 z-50"
          >
            <h3 className="text-sm font-medium text-slate-800 mb-3">New folder</h3>
            <input 
              autoFocus
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderConfirm()}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setCreateFolderOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolderConfirm}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
              >
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 pr-4 pl-2 scrollbar-hide pb-4">
        {isTgLoggedIn ? (
          <div className="mx-4 mb-4 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-200 dark:ring-blue-900/40">
                <Send className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 truncate">
                  {tgUser?.firstName || 'Telegram User'}
                </p>
                <p className="text-[10px] text-blue-700/70 dark:text-blue-300/60 truncate">
                  Connected to Saved Messages
                </p>
              </div>
            </div>
            <button 
              onClick={logoutTg}
              className="w-full py-1.5 flex items-center justify-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm border border-blue-200/50 dark:border-blue-800/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="w-3 h-3" />
              LOGOUT TELEGRAM
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setTgAuthStep('phone')}
            className="mx-4 mb-6 mt-2 p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex flex-col items-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white ring-4 ring-white/10 group-hover:rotate-12 transition-transform">
              <Send className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white mb-0.5">Connect Telegram</p>
              <p className="text-[10px] text-white/70">Store files in Saved Messages</p>
            </div>
          </button>
        )}

        {NAV_ITEMS.map((item) => {
          if (item.divider) {
            return <div key={item.id} className="h-px bg-slate-200/50 dark:bg-white/5 w-full my-2 ml-4"></div>;
          }
          
          const Icon = item.icon!;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id as PageType)}
              className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-r-full transition-colors cursor-pointer w-full text-left focus:outline-none border-l-4",
                isActive 
                  ? "text-primary border-primary font-semibold" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border-transparent font-medium"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-blue-600/10 rounded-r-full -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon 
                className={cn("w-5 h-5 relative z-10", isActive && "fill-current text-primary")} 
                fill={isActive ? "currentColor" : "none"} 
              />
              <span className="text-[14px] relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
