import React from 'react';
import { Send, Smartphone, ShieldCheck, Lock } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';

const localDriveLogo = new URL('../../3d-telegram-paper-airplane-icon.jpg', import.meta.url).href;

interface LoginBridgeProps {
  title: string;
  description: string;
  icon?: 'telegram' | 'smartphone' | 'shield' | 'lock';
}

export function LoginBridge({ title, description, icon = 'telegram' }: LoginBridgeProps) {
  const { setTgAuthStep } = useDrive();

  const renderIcon = () => {
    const iconClass = "w-12 h-12 text-white";
    const containerClass = "w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20";
    
    switch (icon) {
      case 'smartphone':
        return (
          <div className={`${containerClass} bg-indigo-500 -rotate-3`}>
            <Smartphone className={iconClass} />
          </div>
        );
      case 'shield':
        return (
          <div className={`${containerClass} bg-emerald-500 rotate-6`}>
            <ShieldCheck className={iconClass} />
          </div>
        );
      case 'lock':
        return (
          <div className={`${containerClass} bg-slate-800 -rotate-6`}>
            <Lock className={iconClass} />
          </div>
        );
      default:
        return (
          <div className={`${containerClass} overflow-hidden bg-white rotate-3`}>
            <img 
              src={localDriveLogo}
              alt="Local Drive Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      {renderIcon()}
      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 text-lg font-medium leading-relaxed">
        {description}
      </p>
      <button 
        onClick={() => setTgAuthStep('phone')}
        className="px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-full shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 text-lg"
      >
        Connect Telegram Account
      </button>

    </div>
  );
}
