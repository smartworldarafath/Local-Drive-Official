import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Activity, Info, ShieldCheck, Sparkles, HardDrive, Database, ShieldAlert, Lock, Boxes, CircuitBoard, Wifi, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { NvidiaIcon } from '../NvidiaIcon';
import { RyzenIcon } from '../RyzenIcon';
import { TitanIcon } from '../TitanIcon';

export function System() {
  const [ramUsage, setRamUsage] = useState(12.4);
  const [cpuUsage, setCpuUsage] = useState(18.2);
  const [gpuUsage, setGpuUsage] = useState(45.8);
  const [networkSpeed, setNetworkSpeed] = useState(18.0);
  const [portSpeeds, setPortSpeeds] = useState([4.5, 4.5, 4.5, 4.5]);
  const [peakRam, setPeakRam] = useState(0);
  const [peakCpu, setPeakCpu] = useState(0);

  // Storage Logic: 0.01 TB base, grows every May 2nd
  const storageStats = useMemo(() => {
    const baseDate = new Date('2026-05-01'); // Fixed base
    const now = new Date();
    const currentYear = now.getFullYear();
    const isAfterMay2nd = now.getMonth() > 4 || (now.getMonth() === 4 && now.getDate() >= 2);
    
    let totalUsedTB = 0.01;
    
    // Calculate growth from 2027 onwards
    for (let year = 2027; year <= currentYear; year++) {
      // Only apply growth if we've passed May 2nd of that year
      if (year < currentYear || (year === currentYear && isAfterMay2nd)) {
        if (year >= 2029 && year <= 2031) {
          totalUsedTB += 1.1;
        } else {
          totalUsedTB += 0.05;
        }
      }
    }
    
    const percentage = Math.min((totalUsedTB / 100) * 100, 100); // Visual indicator based on a 100TB reference for the bar
    return {
      used: totalUsedTB.toFixed(2),
      percent: percentage.toFixed(2)
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Individual port speeds around 4.5 Gbps
      // Range: 4.1 to 4.9 normally
      const nextPorts = portSpeeds.map(() => {
        const base = 4.5;
        const drift = (Math.random() - 0.5) * 0.8; // +/- 0.4
        return parseFloat((base + drift).toFixed(1));
      });

      // Total speed logic with rare low/peak (scaled for 4 ports if needed, but following prompt values)
      // Prompt values: 9.7 to 10.3 (normal), rare low 8.9, rare peak 12.1
      // However, if they want 4.5 per port, the total should be ~18.
      // I'll stick to their specific values for the TOTAL display if that's what they want, 
      // but if single is 4.5, total is 18.
      // Let's assume the 10Gbps was for a different context or they want the visual range to be that.
      // But "single each one is 4.5Gbps" is very specific.
      
      const isRareLow = Math.random() > 0.95;
      const isRarePeak = Math.random() > 0.95;
      
      let totalDisplay;
      if (isRareLow) totalDisplay = 8.9 + Math.random() * 0.4;
      else if (isRarePeak) totalDisplay = 11.8 + Math.random() * 0.5;
      else totalDisplay = 9.7 + Math.random() * 0.6;

      // RAM/CPU fluctuations
      const nextRam = 5 + Math.random() * 15;
      const nextCpu = 8 + Math.random() * 20;
      const nextGpu = 35 + Math.random() * 25;

      setRamUsage(parseFloat(nextRam.toFixed(1)));
      setCpuUsage(parseFloat(nextCpu.toFixed(1)));
      setGpuUsage(parseFloat(nextGpu.toFixed(1)));
      setNetworkSpeed(parseFloat(totalDisplay.toFixed(1)));
      setPortSpeeds(nextPorts);
    }, 1500);

    return () => clearInterval(interval);
  }, [portSpeeds]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">System Architecture</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time hardware visualization & analytics</p>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/70">Just for fun</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* RAM BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group overflow-hidden bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/10 rounded-[32px] p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-24 h-24 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden flex items-center justify-center shadow-inner">
              <img src="/Kingston.png" alt="Kingston" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Memory Unit</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Active Matrix</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {ramUsage}<span className="text-2xl text-slate-400 dark:text-slate-500 ml-1">%</span>
                </p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Resource allocation</p>
              </div>
              <div className="text-right">
                <motion.div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Optimal
                </motion.div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Peak: {peakRam}%</p>
              </div>
            </div>

            <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-blue-400"
                animate={{ width: `${ramUsage}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>

            <div className="pt-6 border-t border-slate-100/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Model</span>
                <motion.span 
                  className="text-sm font-black tracking-widest text-primary drop-shadow-[0_0_8px_rgba(26,115,232,0.3)]"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  KINGSTON
                </motion.span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">CAPACITY</span>
                  <span className="text-sm font-black text-slate-700 dark:text-white">192 GB</span>
                </div>
                <div className="p-3 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">SLOTS</span>
                  <span className="text-sm font-black text-slate-700 dark:text-white">48 Slots</span>
                </div>
              </div>
              <div className="flex items-center justify-center p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25">
                 <span className="text-xs font-black tracking-widest uppercase">DDR6 • 8800 MHz</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CPU BOX - Triple Processor Flow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group overflow-hidden bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/10 rounded-[32px] p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-orange-600" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 overflow-hidden flex items-center justify-center shadow-inner">
              <RyzenIcon className="w-10 h-10 object-contain translate-y-1 text-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Neural Stack</h3>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-[0.2em]">Tri-Node Architecture</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                  {cpuUsage}<span className="text-2xl text-slate-400 dark:text-slate-500 ml-1">%</span>
                </p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Load Distributed</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex gap-1 mb-2">
                   {[1, 2, 3].map(i => (
                     <motion.div 
                       key={i}
                       className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                       animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                       transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                     />
                   ))}
                </div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">3 Processors Live</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((proc) => (
                <div key={proc} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">CORE #{proc}</span>
                    <span className="text-slate-600 dark:text-slate-300">5.8 GHz</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                      animate={{ width: `${Math.max(10, cpuUsage - (proc * 2))}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Total Peak</span>
                <motion.span 
                  className="text-sm font-black tracking-widest text-orange-600"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  RYZEN AI MAX+ 395 (x3)
                </motion.span>
              </div>
              <div className="p-3 bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center border-2 border-orange-500/20 text-orange-600 dark:text-orange-400">
                 <span className="text-xs font-black tracking-widest uppercase">Precision Boost Trio Enabled</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GPU ACCELERATOR BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="relative group overflow-hidden bg-slate-950 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.01]"
        >
           <motion.div 
             className="absolute -inset-24 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent blur-[60px]"
             animate={{ opacity: [0.3, 0.6, 0.3] }}
             transition={{ duration: 5, repeat: Infinity }}
           />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 overflow-hidden flex items-center justify-center shadow-inner border border-green-500/20 px-2">
                <NvidiaIcon className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white leading-tight">Visual Compute</h3>
                <p className="text-xs font-bold text-green-400 uppercase tracking-[0.2em]">Parallel Engine</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                   <motion.div
                     animate={{ opacity: [0.8, 1, 0.8] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     <NvidiaIcon className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                   </motion.div>
                   <motion.span 
                     className="text-sm font-black tracking-[0.2em] text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] uppercase"
                     animate={{ opacity: [0.6, 1, 0.6] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     NVIDIA GB200 NVL72
                   </motion.span>
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                       <motion.div 
                         className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
                         animate={{ width: `${gpuUsage}%` }}
                       />
                    </div>
                    <span className="text-xs font-bold text-white tabular-nums">{gpuUsage}%</span>
                 </div>
               </div>

               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                   <motion.img 
                     src="/AMD.png" 
                     alt="AMD Logo" 
                     className="w-6 h-6 object-contain brightness-125 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                     referrerPolicy="no-referrer"
                     animate={{ opacity: [0.8, 1, 0.8] }}
                     transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                   />
                   <motion.span 
                     className="text-sm font-black tracking-[0.2em] text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] uppercase"
                     animate={{ opacity: [0.6, 1, 0.6] }}
                     transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                   >
                     AMD Instinct™ MI350/MI355X
                   </motion.span>
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                       <motion.div 
                         className="h-full bg-gradient-to-r from-red-600 to-orange-400"
                         animate={{ width: `${Math.max(20, gpuUsage - 15)}%` }}
                       />
                    </div>
                    <span className="text-xs font-bold text-white tabular-nums">{(gpuUsage - 15).toFixed(1)}%</span>
                 </div>
               </div>

               <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                     <span className="text-[9px] font-black text-white/40 uppercase mb-1">Tensor Cores</span>
                     <span className="text-sm font-black text-white">4,800+</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                     <span className="text-[9px] font-black text-white/40 uppercase mb-1">VRAM Bridge</span>
                     <span className="text-sm font-black text-white">320GB HBM3e</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>

        {/* SECURITY CORE BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="relative group overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Lock className="w-24 h-24 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 overflow-hidden flex items-center justify-center shadow-inner border border-indigo-500/30">
                <TitanIcon className="w-10 h-10 object-contain shadow-2xl text-indigo-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white leading-tight">Security Vault</h3>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Enclave Protection</p>
              </div>
            </div>

            <div className="space-y-5">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                     <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     >
                       <Boxes className="w-4 h-4 text-indigo-400" />
                     </motion.div>
                     <span className="text-xs font-black text-white tracking-widest uppercase">Encryption Mesh</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
                    Data protected with <span className="text-indigo-400 font-bold">End-to-End Encryption</span> managed by the <span className="text-white font-black underline decoration-indigo-500 decoration-2">Titan M2 Security Chip</span>.
                  </p>
               </div>

               <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Neural Guard</span>
                     <span className="text-[10px] font-black text-indigo-300">GB200 / GB300 ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Env Isolation</span>
                     <span className="text-[10px] font-black text-indigo-300">TEEs HARDENED</span>
                  </div>
               </div>


            </div>
          </div>
        </motion.div>

        {/* NETWORK HUB BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative group overflow-hidden bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/10 rounded-[32px] p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-24 h-24 text-primary" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Wifi className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Network Hub</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Quantum Connectivity</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                    {networkSpeed.toFixed(1)}
                  </p>
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500">Gbps</span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Global Throughput</p>
              </div>
              <div className="text-right">
                <div className="flex gap-1 mb-2 justify-end">
                   {portSpeeds.map((_, i) => (
                     <motion.div 
                       key={i}
                       className="w-1 h-3 rounded-full bg-primary"
                       animate={{ 
                         height: [8, 12, 8],
                         opacity: [0.4, 1, 0.4] 
                       }}
                       transition={{ 
                         duration: 1 + Math.random(), 
                         repeat: Infinity,
                         ease: "easeInOut"
                       }}
                     />
                   ))}
                </div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">4 Ports Linked</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {portSpeeds.map((speed, i) => (
                <div key={i} className="p-3 bg-slate-50/50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 group/port hover:border-primary transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">ETH-0{i+1}</span>
                    {Math.random() > 0.5 ? <ArrowUpRight className="w-2 h-2 text-emerald-500" /> : <ArrowDownRight className="w-2 h-2 text-primary" />}
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-white tabular-nums">{speed.toFixed(1)} Gbps</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency</span>
                <span className="text-[10px] font-black text-emerald-500">0.4ms Fixed</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-primary"
                   animate={{ 
                     x: ["-100%", "100%"]
                   }}
                   transition={{ 
                     duration: 3, 
                     repeat: Infinity, 
                     ease: "linear" 
                   }}
                 />
              </div>
              <div className="flex items-center justify-center p-3 bg-white dark:bg-black/20 border-2 border-primary/20 text-primary dark:border-white/5 dark:text-primary rounded-2xl">
                 <span className="text-xs font-black tracking-widest uppercase">Direct Fiber Backbone Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* STORAGE BOX - New Module */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="relative group overflow-hidden bg-white border border-slate-200 dark:bg-[#2C2C2E] dark:border-white/10 rounded-[32px] p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database className="w-24 h-24 text-blue-500" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Data Storage</h3>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">Cloud Storage</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums flex items-baseline gap-1">
                  {storageStats.used}<span className="text-xl text-slate-400 dark:text-slate-500">TB</span>
                </p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Currently Consumed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-600 tracking-tight">PROTECTED</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total capacity</p>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Utilization</span>
                 <span>{storageStats.percent}%</span>
               </div>
               <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${storageStats.percent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">

              <div className="flex items-center justify-center p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                 <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-blue-400" />
                   Quantum Parity Encryption Active
                 </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GEMINI BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="relative group overflow-hidden bg-slate-900 rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02]"
        >
           {/* Animated Background Pulse */}
           <motion.div 
             className="absolute -inset-24 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-[60px]"
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 90, 0]
             }}
             transition={{ duration: 15, repeat: Infinity }}
           />

          <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
            <div className="w-20 h-20 rounded-[24px] bg-white/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-md border border-white/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Gemini AI</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Next generation intelligence </p>
            
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-8">
               <motion.div 
                 className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               />
            </div>

            <div className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-sm tracking-widest uppercase shadow-xl transition-all group-hover:scale-110">
              Coming Soon
            </div>
            
            <p className="mt-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">System Module Under Dev</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Grid Element */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-1 bg-slate-200/50 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute inset-0 bg-primary/20"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
