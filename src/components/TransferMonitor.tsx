import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, Download, Maximize2, Minimize2, Upload, X } from 'lucide-react';
import { useDrive } from '../contexts/DriveContext';
import { cn } from '../lib/utils';

interface TransferMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return '0 MB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export function TransferMonitor({ isOpen, onClose }: TransferMonitorProps) {
  const { transfers, removeTransfer, cancelTransfer } = useDrive();
  const [expanded, setExpanded] = useState(false);
  const [large, setLarge] = useState(false);
  const [now, setNow] = useState(Date.now());
  const panelRef = useRef<HTMLDivElement>(null);
  const visibleTransfers = transfers.slice(0, large ? 24 : expanded ? 12 : 4);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target instanceof Element && target.closest('[data-transfer-monitor-root="true"]')) return;
      if (target && panelRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          className={cn(
            'absolute right-0 top-full mt-2 z-[99999] overflow-hidden border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950',
            large
              ? 'w-[min(760px,calc(100vw-48px))] rounded-2xl'
              : expanded
                ? 'w-[min(520px,calc(100vw-24px))] rounded-2xl'
                : 'w-[min(380px,calc(100vw-24px))] rounded-xl'
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Transfers</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {transfers.filter((item) => item.status === 'running').length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((value) => !value)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setLarge((value) => !value);
                  setExpanded(true);
                }}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                title={large ? 'Small window' : 'Large window'}
              >
                {large ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={cn('overflow-y-auto p-3', large ? 'max-h-[70vh]' : expanded ? 'max-h-[520px]' : 'max-h-[320px]')}>
            {visibleTransfers.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No active transfers.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleTransfers.map((item) => {
                  const percent = item.total > 0 ? Math.min(100, (item.loaded / item.total) * 100) : 0;
                  const speedIsFresh = item.status === 'running' && now - (item.updatedAt || 0) < 2500;
                  const displaySpeed = speedIsFresh ? item.speedMbps : 0;
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                            {item.type === 'upload' ? <Upload className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.stage} - {displaySpeed.toFixed(1)} Mbps
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => item.status === 'running' ? cancelTransfer(item.id) : removeTransfer(item.id)}
                          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                          title={item.status === 'running' ? 'Cancel transfer' : 'Remove'}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            item.status === 'failed' || item.status === 'cancelled'
                              ? 'bg-red-500'
                              : item.status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-primary'
                          )}
                          style={{ width: `${item.status === 'completed' ? 100 : percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatBytes(item.loaded)} / {formatBytes(item.total)}</span>
                        <span>{item.status === 'completed' ? 'Done' : `${percent.toFixed(0)}%`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
