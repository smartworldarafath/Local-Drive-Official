import React, { useState, useRef, useEffect } from 'react';
import { Cloud, Search, Settings as SettingsIcon, LayoutGrid, FileText, Image as ImageIcon, Video, FileSpreadsheet, Menu, Folder, Download } from 'lucide-react';
import { ProfilePopover } from './ProfilePopover';
import { SettingsPopover } from './SettingsPopover';
import { TransferMonitor } from './TransferMonitor';

import { cn } from '../lib/utils';
import { useDrive } from '../contexts/DriveContext';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleProfile: () => void;
  onOpenManageAccount: () => void;
  onToggleSidebar?: () => void;
  isTransferMonitorOpen: boolean;
  onToggleTransferMonitor: () => void;
  onCloseTransferMonitor: () => void;
  profileOpen: boolean;
}

type SearchResult = {
  id: string;
  title: string;
  type: string;
  location?: string;
  itemId?: string;
};

const SETTINGS_SEARCH_RESULTS: SearchResult[] = [
  { id: 'setting-general', title: 'General Settings', type: 'setting' },
  { id: 'setting-notifications', title: 'Notification Preferences', type: 'setting' },
  { id: 'setting-customization', title: 'Customization', type: 'setting' },
];

export function Header({ onOpenSettings, onToggleProfile, onOpenManageAccount, onToggleSidebar, isTransferMonitorOpen, onToggleTransferMonitor, onCloseTransferMonitor, profileOpen }: HeaderProps) {
  const { settings, currentPage, currentFolderId, items, isTgLoggedIn, transfers, openItem, navigateToFolder, setCurrentPage } = useDrive();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isAnimatingBlob, setIsAnimatingBlob] = useState(false);
  const [isActuallyExpanded, setIsActuallyExpanded] = useState(false);
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [customPhoto, setCustomPhoto] = useState<string | null>(localStorage.getItem("customProfilePic"));

  useEffect(() => {
    const syncProfile = () => {
      setCustomPhoto(localStorage.getItem("customProfilePic"));
    };
    window.addEventListener('profilePicUpdated', syncProfile);
    return () => {
      window.removeEventListener('profilePicUpdated', syncProfile);
    };
  }, []);
  
  const isMaterial3 = settings.uiTheme === 'Material 3';

  // Check if we are on a large screen
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSearchExpanded = isSearchFocused || isActuallyExpanded || searchQuery.length > 0;

  // Handle blob animation sequence
  const startBlobSequence = () => {
    setIsAnimatingBlob(true);
    setTimeout(() => {
      setIsActuallyExpanded(true);
      setIsAnimatingBlob(false);
    }, 450);
  };

  const endBlobSequence = () => {
    setIsActuallyExpanded(false);
    setIsAnimatingBlob(true);
    setTimeout(() => {
      setIsAnimatingBlob(false);
    }, 450);
  };

  useEffect(() => {
    if (isSearchHovered && !isActuallyExpanded && !isAnimatingBlob && !isSearchFocused) {
      startBlobSequence();
    } else if (!isSearchHovered && isActuallyExpanded && !isSearchFocused) {
      endBlobSequence();
    }
  }, [isSearchHovered, isSearchFocused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        if (!isSearchHovered) {
          setIsActuallyExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchHovered]);

  const filteredResults: SearchResult[] = searchQuery.trim() === '' ? [] : (() => {
    const query = searchQuery.trim().toLowerCase();
    const driveResults = items
      .filter(item => !item.trashed && !item.spam)
      .filter(item => {
        const haystack = [
          item.name,
          item.type,
          item.location,
          item.modified,
          item.created,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12)
      .map(item => ({
        id: `item-${item.id}`,
        itemId: item.id,
        title: item.name,
        type: item.isFolder ? 'folder' : item.type,
        location: item.location,
      }));

    const settingResults = SETTINGS_SEARCH_RESULTS.filter(result =>
      result.title.toLowerCase().includes(query),
    );

    return [...driveResults, ...settingResults].slice(0, 15);
  })();

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    if (result.type === 'setting') {
      onOpenSettings();
      return;
    }

    const item = items.find((driveItem) => driveItem.id === result.itemId);
    if (item) {
      setCurrentPage('my-drive');
      if (!item.isFolder) {
        navigateToFolder(item.parentId || null);
      }
      openItem(item);
    }
  };

  const getPageTitle = () => {
    if (currentFolderId) {
      const folder = items.find(i => i.id === currentFolderId);
      if (folder) return folder.name;
    }

    const titles: Record<string, string> = {
      'home': 'Home',
      'my-drive': 'My Drive',
      'computers': 'Computers',
      'shared': 'Shared with me',
      'recent': 'Recent',
      'starred': 'Starred',
      'spam': 'Spam',
      'trash': 'Trash',
      'system': 'System',
      'about': 'About',
      'customization': 'Customization'
    };
    return titles[currentPage] || 'Drive';
  };

  const getIcon = (item: any) => {
    switch (item.type) {
      case 'setting': return <SettingsIcon className="w-4 h-4 text-slate-400" />;
      case 'folder': return <Folder className="w-4 h-4" style={{ color: item.color || '#94a3b8' }} fill="currentColor" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-red-500" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 z-[110] border-b flex items-center justify-between px-4 sm:px-6 transition-all duration-300",
      isLargeScreen ? 'left-[280px]' : 'left-0',
      isMaterial3 
        ? "bg-white dark:bg-[#1C1B1F] border-slate-200 dark:border-white/5 h-[80px]" 
        : "bg-white dark:bg-slate-900/40 dark:backdrop-blur-[40px] border-slate-200 dark:border-white/5 h-[72px]"
    )}>
      <div className="flex items-center gap-3">
        {!isLargeScreen && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {/* Placeholder title for mobile if needed, or just left space */}
        {!isActuallyExpanded && <span className="font-bold text-slate-800 dark:text-slate-100">{getPageTitle()}</span>}
      </div>

      <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3" ref={searchRef}>
        {isTgLoggedIn && (
          <div 
            className={cn(
              "relative flex items-center justify-end h-full transition-all duration-500",
              isSearchExpanded ? 'flex-1 max-w-[720px]' : (isMaterial3 ? 'w-12' : 'w-10')
            )}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
          >
            <div 
              className={cn(
                "relative flex items-center h-11 transition-all duration-500 origin-right overflow-hidden",
                isAnimatingBlob ? 'animate-blob' : '',
                isMaterial3 ? "h-14 rounded-[28px]" : "h-11 rounded-full",
                isSearchExpanded 
                  ? (isMaterial3 
                      ? 'w-full bg-[#F3F3F3] dark:bg-[#2C2C2E] z-30 ring-2 ring-primary/20 border-none shadow-[0_4px_12px_rgba(0,0,0,0.05)]' 
                      : 'w-full bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 dark:border-white/10 ring-4 ring-primary/5 backdrop-blur-md z-30'
                    )
                  : (isMaterial3 
                      ? 'w-14 bg-[#F3F3F3] dark:bg-[#2C2C2E] border border-transparent hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer shadow-sm' 
                      : 'w-10 bg-transparent border border-transparent hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer'
                    )
              )}
               style={{
                 transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
               }}
            >
              <div 
                className={cn(
                  "absolute left-0 flex items-center justify-center pointer-events-none transition-colors",
                  isMaterial3 ? "w-14 h-14" : "w-10 h-10",
                  isSearchExpanded ? 'text-primary' : 'text-slate-600 dark:text-slate-400'
                )}
              >
                <Search className={cn("transition-transform duration-500", isMaterial3 ? "w-6 h-6" : "w-5 h-5", isAnimatingBlob ? 'scale-110 rotate-12' : 'scale-100')} />
              </div>
              <input 
                type="text" 
                placeholder="Search Cloud"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (!isActuallyExpanded) startBlobSequence();
                }}
                onBlur={() => {
                  if (!isSearchHovered && searchQuery.length === 0) {
                    setIsSearchFocused(false);
                    endBlobSequence();
                  }
                }}
                className={cn(
                  "w-full h-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300",
                  isMaterial3 ? "text-base font-semibold pl-14 pr-4" : "text-sm pl-10 pr-4",
                  isSearchExpanded ? 'opacity-100' : 'opacity-0 cursor-pointer'
                )}
              />
            </div>
            
            {/* Search Results Dropdown */}
            <div className={cn(
              "absolute top-16 right-0 w-full transition-all duration-300 origin-top",
              isMaterial3 
                ? "bg-white dark:bg-[#1C1B1F] border border-slate-200/60 dark:border-white/10 rounded-[28px] shadow-[0_24px_54px_rgba(0,0,0,0.15)] overflow-hidden z-20 duration-500"
                : "sm:w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden z-20",
              isSearchFocused && searchQuery ? 'opacity-100 translate-y-2 pointer-events-auto' : 'opacity-0 translate-y-0 pointer-events-none'
            )}>
              <div className="max-h-96 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <ul className="py-2">
                    {filteredResults.map(result => (
                      <li key={result.id}>
                        <button 
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors text-slate-800 dark:text-slate-200"
                        >
                          {getIcon(result)}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{result.title}</div>
                            <div className="truncate text-xs text-slate-500 capitalize">
                              {result.location ? `${result.type} - ${result.location}` : result.type}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative" data-transfer-monitor-root="true">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleTransferMonitor();
            }}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 ${
              isTransferMonitorOpen ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Transfers"
          >
            <Download className="w-5 h-5" />
            {transfers.some((item) => item.status === 'running') && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          <TransferMonitor isOpen={isTransferMonitorOpen} onClose={onCloseTransferMonitor} />
        </div>

        <div className="relative">
          <button 
            id="settings-menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsPopoverOpen(!isSettingsPopoverOpen);
            }}
            className={`w-10 h-10 ml-2 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0 ${
              isSettingsPopoverOpen ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2" style={{ zIndex: 99999 }}>
            <SettingsPopover 
              isOpen={isSettingsPopoverOpen} 
              onClose={() => setIsSettingsPopoverOpen(false)} 
              onOpenSettings={() => onOpenSettings()}
            />
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-95 hidden sm:flex shrink-0">
          <LayoutGrid className="w-5 h-5" />
        </button>
        <div className="relative ml-2 shrink-0">
          <button 
            id="profile-menu-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleProfile();
            }}
            className={`w-10 h-10 rounded-full border-2 ${profileOpen ? 'border-primary' : 'border-white'} shadow-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface cursor-pointer active:scale-95 transition-all`}
          >
            {customPhoto ? (
              <img 
                src={customPhoto} 
                alt="User profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
          <div className="absolute right-0 max-w-[calc(100vw-16px)] sm:right-0 top-full mt-2" style={{ zIndex: 99999 }}>
            <ProfilePopover 
              isOpen={profileOpen} 
              onClose={() => onToggleProfile()} 
              onOpenSettings={() => onOpenSettings()}
              onOpenManageAccount={() => onOpenManageAccount()}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
