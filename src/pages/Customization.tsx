import React from 'react';
import { Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomizationSettings } from '../components/CustomizationSettings';

export function Customization() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Palette className="w-10 h-10 text-primary" />
          Customization
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Personalize your Local Drive experience</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 p-10 rounded-[2.5rem] shadow-sm backdrop-blur-3xl"
      >
        <CustomizationSettings />
      </motion.div>
    </div>
  );
}
