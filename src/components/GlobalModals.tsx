import React, { useRef, useEffect, useState } from 'react';
import { useDrive } from '../contexts/DriveContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Check } from 'lucide-react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { FeatureShowcaseModal } from './FeatureShowcaseModal';
import { formatBytes } from '../lib/utils';

export function GlobalModals() {
  const { 
    infoItem, 
    viewItemInfo, 
    toastMessage, 
    showToast, 
    undoTrash,
    renamingItem,
    setRenamingItem,
    renameItem,
    isDeleteModalOpen,
    setDeleteModalOpen,
    confirmDelete,
    selectedIds,
    isFeatureShowcaseOpen,
    setIsFeatureShowcaseOpen
  } = useDrive();
  
  const [newName, setNewName] = useState('');
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renamingItem) {
      setNewName(renamingItem.name);
    }
  }, [renamingItem]);

  const handleRenameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (renamingItem && newName.trim() && newName !== renamingItem.name) {
      renameItem(renamingItem.id, newName.trim());
      showToast('Item renamed');
    }
    setRenamingItem(null);
  };

  useEffect(() => {
    let timer: any;
    if (toastMessage) {
      timer = setTimeout(() => {
        showToast(''); // clear after 2.5s (handled inside context mostly, but just in case)
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleInfoClose = () => {
    viewItemInfo(null);
  };

  return (
    <>
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedIds.length}
      />
      <FeatureShowcaseModal 
        isOpen={isFeatureShowcaseOpen} 
        onClose={() => setIsFeatureShowcaseOpen(false)} 
      />
      <AnimatePresence>
        {infoItem && !infoItem.isFolder && (
          <motion.div
            key="info-modal"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-[72px] bottom-0 w-[300px] bg-white shadow-[-8px_0_16px_rgba(0,0,0,0.04)] border-l border-slate-200 z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 truncate" title={infoItem.name}>{infoItem.name}</h3>
              <button 
                onClick={handleInfoClose}
                className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {infoItem.imageUrl && (
                <div className="w-full h-32 bg-slate-100 rounded-lg mb-4 overflow-hidden shadow-sm flex items-center justify-center">
                  <img src={infoItem.imageUrl} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Item Details</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-transparent">
                      <tr>
                        <td className="py-2 text-slate-500 w-1/3">Type</td>
                        <td className="py-2 text-slate-800 capitalize font-medium">{infoItem.type}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Location</td>
                        <td className="py-2 text-slate-800 font-medium">{infoItem.location || 'My Drive'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-slate-500">Created</td>
                        <td className="py-2 text-slate-800 font-medium">{infoItem.created || 'Unknown'}</td>
                      </tr>
                      {infoItem.size && (
                        <tr>
                          <td className="py-2 text-slate-500">Size</td>
                          <td className="py-2 text-slate-800 font-medium">{formatBytes(infoItem.size)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Who has access</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Only me</p>
                      <p className="text-xs text-slate-500">Private</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast-message"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between min-w-[280px] z-[100]"
          >
            <span className="text-sm font-medium">{toastMessage}</span>
            {toastMessage.includes('trash') && (
              <button 
                onClick={undoTrash}
                className="text-primary-300 hover:text-white text-sm font-bold ml-4 transition-colors p-1"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Rename Modal */}
      <AnimatePresence mode="wait">
        {renamingItem && (
          <div key="rename-modal-backdrop" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setRenamingItem(null)} 
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }} 
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }} 
              exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }} 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] p-8 w-full max-w-sm relative z-10 border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Rename</h3>
              <p className="text-sm text-slate-500 mb-6">Enter a new name for this item</p>
              
              <form onSubmit={handleRenameSubmit}>
                <div className="relative mb-8">
                  <input 
                    autoFocus
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setRenamingItem(null); }}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-primary focus:bg-white text-lg font-semibold transition-all shadow-inner placeholder:text-slate-300"
                    placeholder="Item name"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setRenamingItem(null)} 
                    className="flex-1 px-4 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3.5 text-sm font-bold bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all shadow-[0_8px_20px_-4px_rgba(26,115,232,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(26,115,232,0.5)] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
