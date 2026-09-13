import React from 'react';
import { 
  Folder, 
  FolderSync as FolderShared, 
  Image as ImageIcon, 
  FileText, 
  FileSpreadsheet, 
  Video,
  LayoutGrid,
  Check,
  Play,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DriveItem, useDrive } from '../contexts/DriveContext';
import { getContrastColor, cn } from '../lib/utils';
import { ActionMenu } from './ActionMenu';
import { useLongPress } from '../hooks/useLongPress';

interface DriveItemCardProps {
  item: DriveItem;
  view: 'grid' | 'list';
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  trashed?: boolean;
  key?: string | number;
}

export function DriveItemCard({ item, view, activeMenu, setActiveMenu, trashed }: DriveItemCardProps) {
  const { openItem, selectedIds, toggleSelection, settings } = useDrive();
  const isSelected = selectedIds.includes(item.id);
  const isSelectionActive = selectedIds.length > 0;
  const isMaterial3 = settings.uiTheme === 'Material 3';
  const isItemTrashed = trashed || item.trashed;
  const sessionString = localStorage.getItem("tgSession") || "";
  const [imageError, setImageError] = React.useState(false);
  const [videoPreviewError, setVideoPreviewError] = React.useState(false);

  const onLongPress = () => {
    if (!isSelectionActive) {
      toggleSelection(item.id);
    }
  };

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectionActive || e.metaKey || e.ctrlKey) {
      toggleSelection(item.id);
    } else {
      openItem(item);
    }
  };

  const longPressProps = useLongPress(onLongPress, onClick as any, { 
    delay: 1200, // Reduced again: 1.2 seconds
    shouldPreventDefault: true 
  });

  const renderIcon = () => {
    const iconColor = item.color || '#64748b';
    const isColored = !!item.color;
    const contrast = getContrastColor(item.color);
    
    const iconStyle = isColored && contrast === 'white' && view === 'grid' && item.isFolder
      ? { color: '#fff' }
      : { color: iconColor };

    if (item.isFolder) {
      const folderIconClass = cn(
        "w-6 h-6",
        isMaterial3 && "m3-bounce"
      );
      return item.shared ? 
        <FolderShared className={folderIconClass} style={iconStyle} fill="currentColor" /> : 
        <Folder className={folderIconClass} style={iconStyle} fill="currentColor" />;
    }

    const fileIconClass = cn(
      "w-5 h-5 shrink-0 mt-0.5",
      isMaterial3 && "m3-bounce"
    );

    switch (item.type) {
      case 'image': return <ImageIcon className={cn(fileIconClass, "text-red-500")} />;
      case 'pdf': 
      case 'document': return <FileText className={cn(fileIconClass, "text-blue-500")} />;
      case 'spreadsheet': return <FileSpreadsheet className={cn(fileIconClass, "text-emerald-500")} />;
      case 'video': return <Video className={cn(fileIconClass, "text-red-500")} />;
      default: return <FileText className={cn(fileIconClass, "text-slate-500")} />;
    }
  };

  const isColored = item.isFolder && !!item.color;
  const contrast = getContrastColor(item.color);
  const thumbnailUrl = sessionString
    ? `/api/tg/download/${item.id}?session=${encodeURIComponent(sessionString)}&thumb=1`
    : "";
  const mediaUrl = sessionString
    ? `/api/tg/download/${item.id}?inline=true&session=${encodeURIComponent(sessionString)}`
    : "";

  const cardStyles = isColored 
    ? { backgroundColor: item.color, borderColor: contrast === 'white' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' } 
    : {};

  return (
    <motion.div
      {...longPressProps}
      className={cn(
        "group cursor-pointer relative border",
        isMaterial3 ? "rounded-[28px]" : "rounded-xl",
        view === 'list' ? 'flex items-center p-3 gap-6 h-auto' : 'flex flex-col h-full',
        isSelected && "ring-2 ring-primary ring-offset-2 scale-[0.97]",
        !isColored && "bg-white border-slate-200 shadow-sm hover:shadow-md dark:glass-card dark:bg-slate-900/40 dark:border-white/5 dark:hover:bg-white/5",
        isColored && "shadow-md",
        view === 'grid' && !item.isFolder && "h-[240px]",
        view === 'grid' && item.isFolder && (isMaterial3 ? "h-[88px] rounded-[28px]" : "h-auto"),
        isItemTrashed && "opacity-70 grayscale-[0.5] cursor-default pointer-events-none"
      )}
      style={cardStyles}
    >
      {/* Selection Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-2 left-2 z-20 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <Check className="w-4 h-4 stroke-[3px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {item.starred && !isItemTrashed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute top-2 z-20 w-6 h-6 rounded-full bg-amber-400 text-white shadow-lg shadow-amber-400/30 flex items-center justify-center",
              isSelected ? "left-10" : "left-2"
            )}
            title="Starred"
          >
            <Star className="w-3.5 h-3.5 fill-current stroke-[3px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Content for Folders */}
      {view === 'grid' && item.isFolder && (
        <div className="flex items-center gap-4 p-4">
          <motion.div 
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10 dark:border-white/5",
              isColored ? (contrast === 'white' ? 'bg-white/20' : 'bg-black/5') : 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            {renderIcon()}
          </motion.div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <motion.p 
              className={cn(
                "font-semibold text-[15px] truncate mb-0.5",
                isColored && contrast === 'white' ? 'text-white' : 'text-slate-800 dark:text-slate-100',
                isItemTrashed && "line-through text-slate-500"
              )}
            >
              {item.name}
            </motion.p>
            <motion.p 
              className={cn(
                "text-xs truncate",
                isColored && contrast === 'white' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {item.modified}
            </motion.p>
          </div>
        </div>
      )}

      {/* Grid Content for Files */}
      {view === 'grid' && !item.isFolder && (
        <>
          <motion.div 
            className="h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-white/60 dark:border-white/5 relative flex items-center justify-center shrink-0 rounded-t-xl"
          >
            {item.type === 'image' && (
              !imageError ? (
                <img 
                  src={thumbnailUrl} 
                  className="w-full h-full object-cover" 
                  onError={() => setImageError(true)}
                  alt={item.name}
                />
              ) : (
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-red-500" />
                </div>
              )
            )}
            {(item.type === 'document' || item.type === 'pdf') && (
              <div className="w-full h-full bg-white/50 dark:bg-slate-900/50 p-6 flex flex-col justify-center text-slate-800 dark:text-slate-100">
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
                <div className="w-3/4 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
                <div className="w-5/6 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
              </div>
            )}
            {item.type === 'spreadsheet' && (
              <LayoutGrid className="w-16 h-16 text-emerald-400 opacity-60 group-hover:scale-110 transition-transform duration-300" />
            )}
            {item.type === 'video' && (
              !videoPreviewError ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    src={mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (Number.isFinite(video.duration) && video.duration > 1) {
                        video.currentTime = Math.min(1, video.duration / 8);
                      }
                    }}
                    onError={() => setVideoPreviewError(true)}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="z-10 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-red-500" fill="currentColor" />
                </div>
              )
            )}
          </motion.div>
          <div className="p-4 flex items-start gap-3 flex-1 min-w-0">
            <motion.div>
              {renderIcon()}
            </motion.div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <motion.p className={cn("font-semibold text-sm text-slate-800 dark:text-slate-100 truncate mb-1", isItemTrashed && "line-through text-slate-500")}>{item.name}</motion.p>
              <motion.p className="text-xs text-slate-500 dark:text-slate-400">{item.size && `${item.size} • `}{item.modified}</motion.p>
            </div>
          </div>
        </>
      )}

      {/* List Content */}
      {view === 'list' && (
        <>
          {!item.isFolder && (item.type === 'image' || item.type === 'video') ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-white/10 relative">
              {item.type === 'video' && !videoPreviewError ? (
                <>
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      if (Number.isFinite(video.duration) && video.duration > 1) {
                        video.currentTime = Math.min(1, video.duration / 8);
                      }
                    }}
                    onError={() => setVideoPreviewError(true)}
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                </>
              ) : !imageError ? (
                <>
                  <img
                    src={thumbnailUrl}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    alt={item.name}
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {renderIcon()}
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors shadow-inner border border-white/10 dark:border-white/5 bg-slate-100 dark:bg-slate-800"
            >
              {renderIcon()}
            </motion.div>
          )}
          <motion.div 
            className="hidden"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <motion.p 
              className={cn(
                "font-semibold text-base truncate mb-0.5",
                isColored && contrast === 'white' ? 'text-white' : 'text-slate-800 dark:text-slate-100',
                isItemTrashed && "line-through text-slate-500"
              )}
            >
              {item.name}
            </motion.p>
            <motion.p 
              className={cn(
                "text-xs truncate",
                isColored && contrast === 'white' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {item.size && `${item.size} • `}{item.modified}
            </motion.p>
          </div>
        </>
      )}

      {/* Action Menu */}
      <div 
        className={cn(
          "relative z-30 pointer-events-auto",
          view === 'grid' ? (item.isFolder && isMaterial3 ? 'absolute top-1/2 -translate-y-1/2 right-4' : 'absolute top-2 right-2') : ''
        )}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        onPointerUp={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
      >
        <ActionMenu 
          id={item.id} 
          isFolder={item.isFolder} 
          trashed={isItemTrashed}
          activeMenu={activeMenu} 
          onToggle={setActiveMenu} 
        />
      </div>
    </motion.div>
  );
}
