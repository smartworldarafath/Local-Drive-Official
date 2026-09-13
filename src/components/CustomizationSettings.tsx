import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';
import { cn } from '../lib/utils';

export function CustomizationSettings() {
  const [isFontSelectorOpen, setIsFontSelectorOpen] = useState(false);
  const { settings, updateSettings, theme, setTheme, resetSettings } = useDrive();

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-300">
      <div className="flex justify-end">
        <button 
          onClick={resetSettings}
          className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Reset all to defaults
        </button>
      </div>

      <section className="flex flex-col gap-4">
        <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Typography / Font Style</h4>
        <div className="relative">
          {!isFontSelectorOpen ? (
            <button
              onClick={() => setIsFontSelectorOpen(true)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-[#2C2C2E] rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all shadow-sm"
            >
              <span className="font-sans">{settings.font}</span>
              <span className="text-xs text-primary font-bold uppercase tracking-widest">Change</span>
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-slate-50 dark:bg-[#1C1C1E] p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl"
            >
              <div className="flex flex-col gap-1">
                {['Default', 'Italic', 'Playwrite DE SAS', 'Felipa', 'Nabla', 'Kablammo', 'Matemasie', 'Bitcount Prop Double Ink', 'Rubik Puddles', 'Bungee Outline', 'Shadows Into Light', 'Rubik Burned', 'Turret Road', 'Hanalei', 'Nosifer', 'Limelight'].map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      updateSettings({ font });
                      setIsFontSelectorOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all border-2",
                      settings.font === font 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-[#3A3A3C] text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-white/20"
                    )}
                    style={{ 
                      fontFamily: font === 'Default' ? 'inherit' : font,
                      fontStyle: font === 'Italic' ? 'italic' : 'normal'
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
      
      <section className="flex flex-col gap-4">
        <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Appearance</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={cn(
              "bg-white dark:bg-[#2C2C2E] border-2 transition-all flex flex-col items-center gap-4 text-center cursor-pointer p-6 rounded-2xl shadow-sm hover:translate-y-[-2px]",
              theme === 'light' 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-100 dark:bg-[#3A3A3C]" 
                : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#3A3A3C] opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className={`font-bold text-sm ${theme === 'light' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>Light</div>
            </div>
          </button>
          
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
              "bg-white dark:bg-[#2C2C2E] border-2 transition-all flex flex-col items-center gap-4 text-center cursor-pointer p-6 rounded-2xl shadow-sm hover:translate-y-[-2px]",
              theme === 'dark' 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-100 dark:bg-[#3A3A3C]" 
                : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#3A3A3C] opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-blue-400 shadow-inner">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <div className={`font-bold text-sm ${theme === 'dark' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>Dark</div>
            </div>
          </button>

          <button 
            onClick={() => setTheme('system')}
            className={cn(
              "bg-white dark:bg-[#2C2C2E] border-2 transition-all flex flex-col items-center gap-4 text-center cursor-pointer p-6 rounded-2xl shadow-sm hover:translate-y-[-2px]",
              theme === 'system' 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-100 dark:bg-[#3A3A3C]" 
                : "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#3A3A3C] opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className={`font-bold text-sm ${theme === 'system' ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>System</div>
            </div>
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Background Color</h4>
          {settings.backgroundColor && (
            <button 
              onClick={() => updateSettings({ backgroundColor: null })}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/5 p-6 rounded-2xl">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {[
              { name: 'Light Blue', hex: '#DBEAFE' },
              { name: 'Light Emerald', hex: '#D1FAE5' },
              { name: 'Light Rose', hex: '#FFE4E6' },
              { name: 'Light Amber', hex: '#FEF3C7' },
              { name: 'Light Violet', hex: '#EDE9FE' },
              { name: 'Light Fuchsia', hex: '#FAE8FF' },
              { name: 'Light Indigo', hex: '#E0E7FF' },
              { name: 'Light Teal', hex: '#CCFBF1' },
              { name: 'Light Cyan', hex: '#CFFAFE' },
              { name: 'Light Lime', hex: '#ECFCCB' },
              { name: 'Light Orange', hex: '#FFEDD5' },
              { name: 'Light Slate', hex: '#F1F5F9' },
              { name: 'Deep Purple', hex: '#773EB5' },
              { name: 'Soft Green', hex: '#94C462' },
              { name: 'Vivid Magenta', hex: '#CE4FD1' },
              { name: 'Ocean Cyan', hex: '#43BFC4' },
              { name: 'Deep Pink', hex: '#C4436E' },
            ].map((c) => (
              <button
                key={c.name}
                className="group flex flex-col items-center gap-2"
                onClick={() => updateSettings({ backgroundColor: c.hex })}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full cursor-pointer transition-all hover:scale-110 shadow-lg border backdrop-blur-md",
                  settings.backgroundColor === c.hex
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-[#1C1C1E]"
                    : "border-black/5 dark:border-white/10"
                )} 
                style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <h4 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Theme</h4>
          {settings.uiTheme && settings.uiTheme !== 'Standard' && (
            <button 
              onClick={() => updateSettings({ uiTheme: 'Standard' })}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['IOS UI', 'Material 3', 'True liquid'].map((themeName) => (
            <button
              key={themeName}
              onClick={() => updateSettings({ uiTheme: themeName })}
              className={cn(
                "px-4 py-6 rounded-2xl border-2 transition-all text-sm font-bold text-center",
                settings.uiTheme === themeName
                  ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-[#2C2C2E]"
              )}
            >
              {themeName}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
