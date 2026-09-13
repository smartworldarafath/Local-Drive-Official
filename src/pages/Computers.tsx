import React, { useState } from 'react';
import { 
  Monitor, 
  Link, 
  RefreshCw, 
  Folder, 
  ArrowLeft, 
  Smartphone, 
  Laptop, 
  Share2, 
  QrCode, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Cpu,
  Globe,
  Wifi,
  ShieldCheck,
  X,
  Trash2,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ActionMenu } from '../components/ActionMenu';
import { useDrive } from '../contexts/DriveContext';
import { useLongPress } from '../hooks/useLongPress';

interface Device {
  id: string;
  name: string;
  type: 'pc' | 'phone';
  status: 'online' | 'syncing' | 'offline';
  folders: string[];
  os?: string;
  lastSync?: string;
}

export function Computers() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState<string | null>(null);
  const { goBack, selectedIds, clearSelection, batchMoveToTrash, toggleSelection, settings } = useDrive();

  const isSelectionActive = selectedIds.length > 0;
  const isMaterial3 = settings.uiTheme === 'Material 3';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pt-8 flex-1 w-full h-full min-h-screen relative overflow-hidden" onClick={() => { setActiveMenu(null); if (!isSelectionActive) clearSelection(); }}>
      {/* Background Continuous Animations (Only for M3) */}
      {isMaterial3 && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 60, 0],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" 
          />
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={goBack}
            className={cn(
              "group p-3 transition-all active:scale-95",
              isMaterial3 ? "rounded-[20px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10" : "p-2 rounded-lg hover:bg-slate-100"
            )}
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-primary" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Connected Devices</h1>
               {isMaterial3 && (
                 <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                   Secure Link Active
                 </div>
               )}
            </div>
            <p className="text-slate-500 font-medium">Manage and sync assets across your ecosystem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isSelectionActive && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "flex items-center gap-2 border shadow-xl",
                  isMaterial3 ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-slate-200/60 p-1.5 rounded-[28px]" : "bg-white dark:bg-slate-800 border-slate-200 p-1 rounded-xl"
                )}
              >
                <div className="px-4 py-2 flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">{selectedIds.length} Selected</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 mx-1" />
                <button 
                   onClick={() => {/* Mock move */}}
                   className="p-2.5 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                >
                  <Move className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => batchMoveToTrash(selectedIds)}
                  className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={clearSelection}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowConnectModal('general')}
            className={cn(
              "px-6 py-3.5 bg-slate-900 text-white font-bold flex items-center gap-2.5 hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/20 active:scale-95",
              isMaterial3 ? "rounded-full" : "rounded-2xl"
            )}
          >
            <Plus className="w-5 h-5" />
            Connect New Device
          </button>
        </div>
      </header>

      {/* QUICK CONNECT ACTIONS */}
      <div className={cn("grid grid-cols-1 gap-8", isMaterial3 ? "mb-16" : "mb-12")}>
        <div className="p-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-2xl flex items-center gap-3 border border-yellow-500/20">
           <span className="text-xl">⚠️</span>
           <p className="font-medium text-sm">
             This feature is currently unavailable. We are actively working on it and it will be available in a future update. Stay tuned!
           </p>
        </div>
        <motion.button 
          whileHover={isMaterial3 ? { y: -8, scale: 1.01 } : { y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowConnectModal('general')}
          className={cn(
            "group relative text-left transition-all overflow-hidden border",
            isMaterial3 
              ? "p-10 bg-white dark:bg-[#1C1C1E] border-slate-200/60 dark:border-white/5 rounded-[48px] hover:shadow-2xl hover:shadow-primary/10"
              : "p-8 bg-white dark:bg-[#2C2C2E] border-slate-100 rounded-[32px] hover:border-primary"
          )}
        >
          {isMaterial3 && <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors" />}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={cn(
                "flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform",
                isMaterial3 
                  ? "w-20 h-20 bg-primary-container text-on-primary-container rounded-[28px] m3-bounce shadow-lg" 
                  : "w-16 h-16 bg-primary/10 text-primary rounded-2xl"
              )}>
                 <Monitor className={isMaterial3 ? "w-10 h-10" : "w-8 h-8"} />
              </div>
              <div>
                <h3 className={cn("font-black text-slate-900 dark:text-white mb-2", isMaterial3 ? "text-2xl" : "text-xl")}>Connect Devices</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg">Sync phones, tablets, or computers instantly via secure Cloud Link or Desktop Sync clients.</p>
              </div>
            </div>
            <div className={cn(
              "px-8 py-4 bg-primary text-white font-black rounded-full shadow-lg shadow-primary/25 flex items-center gap-3 self-start md:self-center transition-all group-hover:px-10",
              isMaterial3 ? "text-sm tracking-widest uppercase" : "text-xs"
            )}>
              Get Started <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </motion.button>
      </div>

      {devices.length === 0 ? (
        <div className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed",
          isMaterial3 
            ? "py-24 bg-slate-50/30 dark:bg-white/5 rounded-[56px] border-slate-200 dark:border-white/10 m3-bounce" 
            : "py-20 bg-slate-50/50 rounded-3xl border-slate-200"
        )}>
          <div className={cn(
            "bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl relative",
            isMaterial3 ? "w-32 h-32 mb-8" : "w-24 h-24 mb-6"
          )}>
            {isMaterial3 && (
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border-[6px] border-dashed border-primary/20 rounded-full scale-110" 
              />
            )}
            <Monitor className={isMaterial3 ? "w-12 h-12 text-slate-300 dark:text-slate-600" : "w-10 h-10 text-slate-300"} />
          </div>
          <h2 className={cn("font-black text-slate-900 dark:text-white mb-3", isMaterial3 ? "text-3xl" : "text-2xl")}>No Connected Bridges</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-sm text-center">Your storage ecosystem is currently isolated. Connect a device to begin synchronization.</p>
          <button 
            onClick={() => setShowConnectModal('pc')}
            className={cn(
              "bg-primary text-white font-black shadow-lg hover:shadow-primary/30 transition-all active:scale-95",
              isMaterial3 ? "px-10 py-4 rounded-full m3-bounce" : "px-8 py-3 rounded-2xl"
            )}
          >
            Connect Machine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {devices.map(device => {
            const isSelected = selectedIds.includes(device.id);
            const onLongPress = () => { if (selectedIds.length === 0) toggleSelection(device.id); };
            const onClick = () => { if (selectedIds.length > 0) toggleSelection(device.id); };
            const longPressProps = useLongPress(onLongPress, onClick, { delay: 1200 });

            return (
              <motion.article 
                key={device.id} 
                layout
                {...longPressProps}
                className={cn(
                  "bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/10 rounded-[32px] p-8 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-500",
                  isSelected && "ring-4 ring-primary ring-offset-4 scale-[0.98]"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-4 left-4 z-20 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              {/* Card Animation Header Accent */}
              <motion.div 
                animate={{ width: ["0%", "100%", "0%"], left: ["0%", "0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 h-1.5 bg-gradient-to-r from-primary/50 via-blue-400 to-primary/50 blur-sm opacity-30" 
              />
              
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-inner border border-white/20",
                     device.status === 'online' 
                       ? (isMaterial3 ? 'bg-primary text-white shadow-[0_8px_24px_rgba(26,115,232,0.3)]' : 'bg-primary/10 text-primary') 
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                   )}>
                     {device.type === 'pc' ? <Monitor className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{device.name}</h3>
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                           {device.type === 'pc' ? <Laptop className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                           {device.os}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{device.lastSync}</span>
                     </div>
                   </div>
                </div>
                <ActionMenu id={device.id} isFolder={false} activeMenu={activeMenu} onToggle={setActiveMenu} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                   <Wifi className="w-5 h-5 text-primary mb-2" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network</span>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">Gigabit Fiber</span>
                </div>
                <div className="p-4 bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</span>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">Encrypted P2P</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 mb-4">Bridged Folders</p>
                {device.folders.map((folder, idx) => (
                  <div key={idx} className={cn(
                    "group/item flex items-center justify-between p-4 transition-all duration-300 cursor-pointer",
                    isMaterial3 
                      ? "bg-slate-50 dark:bg-white/5 rounded-[24px] hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5" 
                      : "bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-primary"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center transition-colors",
                        isMaterial3 
                          ? "bg-primary text-white rounded-full shadow-lg shadow-primary/20" 
                          : "bg-slate-50 dark:bg-black/20 rounded-xl text-slate-500 group-hover/item:bg-primary/10 group-hover/item:text-primary"
                      )}>
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white">{folder}</p>
                         <p className="text-[10px] font-bold text-slate-400">Continuous Sync Active</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover/item:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              
              {device.status === 'syncing' && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
                   <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="h-full bg-primary"
                      />
                   </div>
                   <span className="text-[10px] font-black text-primary uppercase">Syncing Meta...</span>
                </div>
              )}
            </motion.article>
          )})}
        </div>
      )}

      {/* CONNECT MODAL OVERLAY */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowConnectModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 40 }} 
              className={cn(
                "bg-white dark:bg-[#1C1C1E] rounded-[40px] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] w-full max-w-lg relative z-10 border border-white/20 overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[85vh]",
                showConnectModal === 'phone' ? "px-6 py-8 sm:px-10" : "p-6 sm:p-10"
              )}
            >
              {/* Modal Background glow */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              
              <button 
                onClick={() => setShowConnectModal(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 bg-white/50"
              >
                <Plus className="w-6 h-6 text-slate-400 rotate-45" />
              </button>

              {showConnectModal === 'phone' ? (
                <div className="text-center">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary mx-auto mb-4 sm:mb-6">
                      <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" />
                   </div>
                   <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Connect Mobile</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 sm:mb-8 text-sm sm:text-base">Scan this code with your phone camera to link your device instantly</p>
                   
                   <div className="relative p-6 sm:p-8 bg-slate-50 dark:bg-white/10 rounded-[28px] border-2 border-slate-100 dark:border-white/5 inline-block mb-6 sm:mb-8 group">
                      <QrCode className="w-32 h-32 sm:w-48 sm:h-48 text-slate-900 opacity-80" />
                      {/* Scanning Animation */}
                      <motion.div 
                        animate={{ y: [0, 128, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-6 right-6 h-0.5 bg-primary shadow-[0_0_15px_rgba(26,115,232,1)]"
                      />
                   </div>
                   
                   <div className="flex flex-col gap-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports iOS & Android</p>
                      <div className="flex items-center justify-center gap-2 text-primary font-bold">
                         <Link className="w-4 h-4" />
                         ais-secure-link.com/7xf92
                      </div>
                   </div>
                </div>
              ) : (
                <div>
                   <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Connection Center</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Select a method to extend your storage ecosystem</p>
                   
                   <div className="space-y-4">
                      <button 
                         onClick={() => setShowConnectModal('phone')}
                         className="w-full p-6 bg-slate-50 dark:bg-white/5 hover:bg-primary hover:text-white rounded-3xl text-left transition-all duration-300 group flex items-center justify-between border border-transparent dark:border-white/5"
                      >
                         <div className="flex items-center gap-4">
                            <Smartphone className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
                            <div>
                               <p className="font-bold text-slate-900 dark:text-white group-hover:text-white">Connect Mobile Device</p>
                               <p className="text-xs opacity-60 text-slate-500 dark:text-slate-400 group-hover:text-white/80">iOS and Android Integration</p>
                            </div>
                         </div>
                         <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 text-slate-700 dark:text-white" />
                      </button>

                      <button className="w-full p-6 bg-slate-50 dark:bg-white/5 hover:bg-primary hover:text-white rounded-3xl text-left transition-all duration-300 group flex items-center justify-between border border-transparent dark:border-white/5">
                         <div className="flex items-center gap-4">
                            <Laptop className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
                            <div>
                               <p className="font-bold text-slate-900 dark:text-white group-hover:text-white">Automated Desktop Sync</p>
                               <p className="text-xs opacity-60 text-slate-500 dark:text-slate-400 group-hover:text-white/80">Windows and macOS Installer</p>
                            </div>
                         </div>
                         <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 text-slate-700 dark:text-white" />
                      </button>

                      <button className="w-full p-6 bg-slate-50 dark:bg-white/5 hover:bg-purple-600 hover:text-white rounded-3xl text-left transition-all duration-300 group flex items-center justify-between border border-transparent dark:border-white/5">
                         <div className="flex items-center gap-4">
                            <Share2 className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-white" />
                            <div>
                               <p className="font-bold text-slate-900 dark:text-white group-hover:text-white">Nearby Sharing Portal</p>
                               <p className="text-xs opacity-60 text-slate-500 dark:text-slate-400 group-hover:text-white/80">P2P Ad-hoc connections</p>
                            </div>
                         </div>
                         <ArrowUpRight className="w-5 h-5 opacity-40 group-hover:opacity-100 text-slate-700 dark:text-white" />
                      </button>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
