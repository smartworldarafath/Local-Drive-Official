import React, { useRef, useEffect, useState } from 'react';
import { LogOut, Settings as SettingsIcon, Pencil, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useDrive } from '../contexts/DriveContext';
import { getActiveProfilePhone, getProfileName, PROFILE_UPDATED_EVENT } from '../lib/profile';

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenManageAccount: () => void;
}

export function ProfilePopover({ isOpen, onClose, onOpenSettings, onOpenManageAccount }: ProfilePopoverProps) {
  const { settings, tgUser, logoutTg, isTgLoggedIn } = useDrive();
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMaterial3 = settings.uiTheme === 'Material 3';
  
  const [customPhoto, setCustomPhoto] = useState<string | null>(localStorage.getItem("customProfilePic"));
  const [profileVersion, setProfileVersion] = useState(0);
  const [showNotLoggedInAlert, setShowNotLoggedInAlert] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const syncProfile = () => {
      setCustomPhoto(localStorage.getItem("customProfilePic"));
      setProfileVersion((version) => version + 1);
    };
    window.addEventListener('profilePicUpdated', syncProfile);
    window.addEventListener('nicknameUpdated', syncProfile);
    window.addEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    return () => {
      window.removeEventListener('profilePicUpdated', syncProfile);
      window.removeEventListener('nicknameUpdated', syncProfile);
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncProfile);
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem("customProfilePic", base64String);
        setCustomPhoto(base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        if (!target.closest('#profile-menu-button')) {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const activePhone = isTgLoggedIn ? getActiveProfilePhone(tgUser) : "";
  const savedProfileName = activePhone ? getProfileName(activePhone) : "";
  const telegramName = tgUser ? `${tgUser.firstName || ''} ${tgUser.lastName || ''}`.trim() : "";
  const displayName = isTgLoggedIn ? (savedProfileName || telegramName || "Local Drive User") : "Default";
  const displayHandle = isTgLoggedIn
    ? (activePhone || (tgUser?.username ? `@${tgUser.username}` : "No phone number found"))
    : "Not logged in";
  void profileVersion;

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={popoverRef}
          initial={isMaterial3 ? { opacity: 0, scale: 0.8, y: -20, originY: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={isMaterial3 ? { opacity: 0, scale: 0.8, y: -20, originY: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
          transition={isMaterial3 ? { type: "spring", stiffness: 400, damping: 28 } : { duration: 0.2 }}
          className={cn(
            "relative w-[min(calc(100vw-24px),320px)] sm:w-[320px] lg:w-[340px] max-h-[85vh] overflow-y-auto bg-white border border-slate-200 shadow-2xl",
            isMaterial3 
              ? "dark:bg-[#1C1B1F] rounded-[32px] sm:rounded-[40px] p-1 shadow-[0_24px_54px_rgba(0,0,0,0.2)] dark:border-white/10" 
              : "dark:bg-slate-900 rounded-2xl dark:border-white/10"
          )}
        >
          <div className={cn("p-4 sm:p-6 lg:p-8 flex flex-col items-center text-center", !isMaterial3 && "p-3 sm:p-5 pb-2")}>
            <div className="relative mb-4 sm:mb-6">
              <div className={cn(
                "w-16 h-16 sm:w-20 lg:w-24 h-24 rounded-full border-4 border-slate-50 dark:border-white/10 shadow-md flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-white/5",
                isMaterial3 ? "m3-bounce hover:scale-105" : "hover:scale-102"
              )}>
                {customPhoto ? (
                  <img src={customPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-400" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
            <h2 className="text-sm sm:text-lg lg:text-2xl font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1 truncate w-full">{displayName}</h2>
            <p className="text-xs sm:text-xs lg:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 lg:mb-8 font-medium truncate w-full">{displayHandle}</p>
            {isTgLoggedIn && activePhone && (
              <div className="mb-4 w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
                Login number: {activePhone}
              </div>
            )}
            
            <button 
              onClick={() => {
                onOpenManageAccount();
                onClose();
              }}
              className={cn(
                "w-full py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 font-bold text-xs lg:text-sm transition-all active:scale-95 shadow-sm",
                isMaterial3 
                  ? "bg-primary-container text-on-primary-container rounded-full font-black hover:opacity-90" 
                  : "bg-primary text-white rounded-xl hover:bg-primary/90"
              )}
            >
              Manage account
            </button>
          </div>
          
          <div className="h-px w-[calc(100%-32px)] mx-auto bg-slate-100 dark:bg-white/5 my-1 sm:my-2"></div>
          
          <div className="p-1 sm:p-2 space-y-0.5 sm:space-y-1">
            <button 
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-slate-200 font-bold text-xs lg:text-sm active:scale-95",
                isMaterial3 ? "rounded-[24px] sm:rounded-[28px]" : "rounded-xl"
              )}
            >
              <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
              Drive Settings
            </button>
            <button 
              onClick={() => {
                if (!isTgLoggedIn) {
                  setShowNotLoggedInAlert(true);
                } else {
                  setShowLogoutConfirm(true);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-red-600 dark:text-red-400 font-bold text-xs lg:text-sm active:scale-95",
                isMaterial3 ? "rounded-[24px] sm:rounded-[28px] font-black" : "rounded-xl"
              )}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
              Sign out session
            </button>
          </div>
          
          <div className="h-px w-full bg-slate-100 dark:bg-white/5"></div>
          
          <div className="p-4 flex justify-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Not Logged In Alert */}
    <AnimatePresence>
      {showNotLoggedInAlert && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "bg-white dark:bg-slate-900 p-8 w-full max-w-sm text-center shadow-2xl",
              isMaterial3 ? "rounded-[32px] dark:bg-[#1C1B1F]" : "rounded-2xl"
            )}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Account Alert</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">You're not logged in</p>
            <button 
              onClick={() => setShowNotLoggedInAlert(false)}
              className={cn(
                "w-full py-3 font-bold transition-all active:scale-95",
                isMaterial3 ? "bg-primary text-white rounded-full" : "bg-primary text-white rounded-xl"
              )}
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Logout Confirmation Dialog */}
    <AnimatePresence>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "bg-white dark:bg-slate-900 p-8 w-full max-w-sm text-center shadow-2xl",
              isMaterial3 ? "rounded-[32px] dark:bg-[#1C1B1F]" : "rounded-2xl"
            )}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sign Out?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Are you sure you want to end your session?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className={cn(
                  "flex-1 py-3 font-bold text-slate-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-sm",
                  isMaterial3 ? "rounded-full" : "rounded-xl"
                )}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  logoutTg();
                  setShowLogoutConfirm(false);
                  onClose();
                }}
                className={cn(
                  "flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-md active:scale-95 text-sm",
                  isMaterial3 ? "rounded-full" : "rounded-xl"
                )}
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
}
