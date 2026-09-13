import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Moon, Download, Palette, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

interface FeatureShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const featuresList = [
  {
    title: 'Dark & Light Mode',
    description: 'Switch between a beautifully crafted light theme and a deep, eye-friendly dark mode. The UI fully adapts to reduce eye strain.',
    icon: <Moon className="w-12 h-12 text-indigo-500" />
  },
  {
    title: 'Media Compression Downloads',
    description: 'Save bandwidth by compressing photos and videos dynamically up to 25% of their original size when downloading.',
    icon: <Download className="w-12 h-12 text-emerald-500" />
  },
  {
    title: 'Customization Options',
    description: 'Personalize your entire workspace with custom fonts and dynamic background colors that automatically adjust text contrast.',
    icon: <Palette className="w-12 h-12 text-fuchsia-500" />
  },
  {
    title: 'Advanced Security',
    description: 'Keep your files completely protected with our robust security features. Focus on what matters.',
    icon: <Shield className="w-12 h-12 text-blue-500" />
  }
];

export function FeatureShowcaseModal({ isOpen, onClose }: FeatureShowcaseModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const handleNext = () => {
    if (currentIndex < featuresList.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation completes
    setTimeout(() => {
      setCurrentIndex(0);
      setDirection(0);
    }, 300);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="feature-showcase-backdrop" className="fixed inset-0 z-[99999] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 w-[95vw] h-[95vh] max-w-5xl max-h-[800px]"
          >
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col justify-center bg-slate-50/50 dark:bg-[#2C2C2E]/30">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={animationKey}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-[#3A3A3C] border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl flex items-center justify-center mb-8 sm:mb-12">
                    {featuresList[currentIndex].icon}
                  </div>
                  
                  <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                    {featuresList[currentIndex].title}
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {featuresList[currentIndex].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Controls */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#1C1C1E] border-t border-slate-200 dark:border-white/5 flex items-center justify-between z-10">
              <div className="flex-1">
                {currentIndex > 0 ? (
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-3 rounded-full border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                ) : <div />}
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center gap-2 px-4">
                {featuresList.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      idx === currentIndex 
                        ? "bg-primary w-8" 
                        : "bg-slate-200 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>

              <div className="flex-1 flex justify-end gap-3">
                <button 
                  onClick={handleClose}
                  className="px-6 py-3 rounded-full text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-all hidden sm:block"
                >
                  Skip
                </button>
                
                {currentIndex < featuresList.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/25 hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleClose}
                    className="px-8 py-3 rounded-full bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
