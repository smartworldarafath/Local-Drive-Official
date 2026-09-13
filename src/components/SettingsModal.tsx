import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Bell, 
  LayoutGrid, 
  Cloud,
  Globe,
  Mail,
  BellRing,
  Users,
  FileText,
  FileSpreadsheet,
  Presentation,
  Plus,
  AlertCircle,
  Sun,
  Moon,
  Sliders,
  Github,
  Instagram,
  Facebook,
  Send,
  Youtube
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useDrive } from '../contexts/DriveContext';
import { CustomizationSettings } from './CustomizationSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'notifications' | 'manage-apps' | 'customization' | 'advanced';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { settings, updateSettings, theme, setTheme } = useDrive();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 py-7">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={onClose}
          ></motion.div>
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white border border-slate-200 w-full max-w-[1000px] h-[calc(100vh-56px)] max-h-[800px] rounded-xl flex overflow-hidden relative z-10 shadow-2xl flex-col md:flex-row dark:bg-[#1C1C1E] dark:border-white/10"
          >
        
        {/* Sidebar */}
        <aside className="w-full md:w-[280px] border-r border-slate-200 dark:border-white/5 flex flex-col pt-8 bg-slate-50 dark:bg-[#222224] shrink-0">
          <div className="px-8 pb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
          </div>
          
          <nav className="flex-1 flex flex-col gap-2 px-4">
            <button 
              onClick={() => setActiveTab('general')}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left group",
                activeTab === 'general' ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Settings className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === 'general' && "fill-primary/20")} />
              <span className="font-semibold">General</span>
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left group",
                activeTab === 'notifications' ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Bell className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === 'notifications' && "fill-primary/20")} />
              <span className="font-semibold">Notifications</span>
            </button>
            <button 
              onClick={() => setActiveTab('customization')}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left group",
                activeTab === 'customization' ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <LayoutGrid className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === 'customization' && "fill-primary/20")} />
              <span className="font-semibold">Customization</span>
            </button>
            <button 
              onClick={() => setActiveTab('manage-apps')}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left group",
                activeTab === 'manage-apps' ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <LayoutGrid className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === 'manage-apps' && "fill-primary/20")} />
              <span className="font-semibold">Manage Apps</span>
            </button>
            <button 
              onClick={() => setActiveTab('advanced')}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 text-left group",
                activeTab === 'advanced' ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Sliders className={cn("w-6 h-6 transition-transform group-hover:scale-110", activeTab === 'advanced' && "fill-primary/20")} />
              <span className="font-semibold">Advanced</span>
            </button>
          </nav>
          
          <div className="p-8 mt-auto hidden md:block">
            <div className="p-6 rounded-xl bg-primary-container/5 border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">PRO PLAN</p>
              <p className="text-sm text-slate-600">Active until Oct 2024</p>
            </div>
          </div>
        </aside>
        
        {/* Main Area */}
        <main className="flex-1 flex flex-col relative bg-white dark:bg-[#1C1C1E] mx-auto w-full h-full overflow-hidden">
          <header className="flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-white/5 shrink-0">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
              {activeTab.replace('-', ' ')}
            </h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400"
            >
              <X className="w-6 h-6" />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
            {activeTab === 'general' && (
              <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Account</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNrVMv0RJTMndQl2MRAQBrEv37Yd74iBH4Z6297ifcGqVHRzwnEAuRaxXVakQJmKzHQLc84cwyZl_PH7vtsVcAZk1GhjVtX2xcs3_ZXe16nb0S71zYh4vczuGq_OmB8-JqqImhwfNH4yKUSrPxhJK6qFHQrWq2IhiTz0VcIgP4uWABaPDMq-1lAPKKgcXl2UIqnBYu1hdXeVH8boIHdZLD4u8TA6VvMlMuKvnNc9RP1aJxFLd7hyUCIl3P7CiuOzLSdv69pN1rnRkS" 
                          className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md"
                          alt="Alex Morgan"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">Alex Morgan</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">alex.morgan@localdrive.app</div>
                      </div>
                    </div>
                    <button className="px-6 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary/5 transition-all">
                      Manage Profile
                    </button>
                  </div>
                </section>
                
                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Storage Usage</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 p-6 rounded-xl flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          Unlimited (200TB)
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">Enterprise</span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Used of 200 TB available space</div>
                      </div>
                      <Cloud className="text-primary w-8 h-8" fill="currentColor" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-3 bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/30 dark:border-white/5">
                        <div className="h-full bg-primary rounded-full relative shadow-[0_0_12px_rgba(26,115,232,0.4)]" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
                        <span>90 TB used</span>
                        <span>110 TB free</span>
                      </div>
                    </div>
                  </div>
                </section>
                
                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Preferences</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-[#3A3A3C] transition-colors border-b border-slate-200 dark:border-white/5">
                      <div className="flex items-center gap-4">
                        <Globe className="text-slate-400 w-6 h-6" />
                        <div>
                          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold">Language</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">English (United States)</div>
                        </div>
                      </div>
                      <select className="bg-black/5 border-transparent text-sm text-slate-800 dark:text-slate-100 dark:bg-black/20 rounded-lg px-4 py-2 outline-none cursor-pointer focus:ring-0">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Alert Settings</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold">Email alerts</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Get notified about security and account activity.</div>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 h-6">
                        <input type="checkbox" id="email-toggle" className="peer sr-only" defaultChecked />
                        <label htmlFor="email-toggle" className="block w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer peer-checked:bg-primary transition-colors"></label>
                        <div className="absolute left-1 top-1 bg-white dark:bg-slate-200 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 border-b border-white/30 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                          <BellRing className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold">Desktop notifications</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Show real-time popups for incoming files.</div>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 h-6">
                        <input type="checkbox" id="desktop-toggle" className="peer sr-only" />
                        <label htmlFor="desktop-toggle" className="block w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer peer-checked:bg-primary transition-colors"></label>
                        <div className="absolute left-1 top-1 bg-white dark:bg-slate-200 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 border-b border-white/30 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold">Sharing activity</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Notify when someone edits a shared folder.</div>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 h-6">
                        <input type="checkbox" id="sharing-toggle" className="peer sr-only" defaultChecked />
                        <label htmlFor="sharing-toggle" className="block w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer peer-checked:bg-primary transition-colors"></label>
                        <div className="absolute left-1 top-1 bg-white dark:bg-slate-200 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base text-slate-800 dark:text-slate-100 font-semibold">Show warning before delete</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Confirm before moving items to trash.</div>
                        </div>
                      </div>
                      <div className="relative inline-block w-10 h-6">
                        <input 
                          type="checkbox" 
                          id="delete-warning-toggle" 
                          className="peer sr-only" 
                          checked={settings.showDeleteWarning}
                          onChange={(e) => updateSettings({ showDeleteWarning: e.target.checked })} 
                        />
                        <label htmlFor="delete-warning-toggle" className="block w-10 h-6 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer peer-checked:bg-primary transition-colors"></label>
                        <div className="absolute left-1 top-1 bg-white dark:bg-slate-200 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
            
            {activeTab === 'customization' && (
              <CustomizationSettings />
            )}
            
            {activeTab === 'manage-apps' && (
              <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                <section className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Connected Applications</h4>
                    <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Browse App Store
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-white/5 p-6 rounded-xl flex items-center justify-between border-white/80 transition-all group dark:bg-white/5">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileText className="text-blue-600 dark:text-blue-400 w-8 h-8" fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">Local Docs</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Word processing and native document editing</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-white/40 dark:bg-white/10 border border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold transition-all shadow-sm">
                        Options
                      </button>
                    </div>
                    
                    <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 p-6 rounded-xl flex items-center justify-between transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <FileSpreadsheet className="text-green-700 dark:text-green-400 w-8 h-8" fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">Local Sheets</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Powerful spreadsheet analysis and visualization</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-[#3A3A3C] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#48484A] text-slate-800 dark:text-white font-semibold transition-all shadow-sm">
                        Options
                      </button>
                    </div>
                    
                    <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 p-6 rounded-xl flex items-center justify-between transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Presentation className="text-orange-600 dark:text-orange-400 w-8 h-8" fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">Local Slides</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Interactive presentations and deck builder</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-[#3A3A3C] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#48484A] text-slate-800 dark:text-white font-semibold transition-all shadow-sm">
                        Options
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="flex flex-col gap-10 animate-in fade-in duration-300">
                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Video Player</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 rounded-xl overflow-hidden p-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-800 dark:text-slate-100">Forward / Backward Seek Duration</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Choose how many seconds the video player jumps when you tap the seek buttons.
                        </div>
                      </div>
                      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#1C1C1E] rounded-xl self-start">
                        {[5, 10, 15].map((seconds) => (
                          <button
                            key={seconds}
                            onClick={() => updateSettings({ videoSeekSeconds: seconds })}
                            className={cn(
                              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                              settings.videoSeekSeconds === seconds
                                ? "bg-white dark:bg-[#3A3A3C] text-primary shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#2C2C2E]"
                            )}
                          >
                            {seconds}s{seconds === 5 ? " (Default)" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Media Downloads</h4>
                  <div className="bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/5 rounded-xl overflow-hidden p-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-base font-semibold text-slate-800 dark:text-slate-100">Media Download Quality</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Compress photos and videos on download to save bandwidth. Documents and archives are always downloaded at 100%.
                        </div>
                      </div>
                      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#1C1C1E] rounded-xl self-start">
                        {[25, 50, 75, 100].map((quality) => (
                          <button
                            key={quality}
                            onClick={() => updateSettings({ mediaDownloadQuality: quality })}
                            className={cn(
                              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                              settings.mediaDownloadQuality === quality
                                ? "bg-white dark:bg-[#3A3A3C] text-primary shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#2C2C2E]"
                            )}
                          >
                            {quality === 100 ? '100% (Default)' : `${quality}%`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
