import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { ChevronRight, ChevronLeft, Sparkles, User, Activity, Calendar, Zap, Check, Info, Clock3 } from 'lucide-react';
import { UserProfile, CycleState } from '../types';

type Step = 'Basic' | 'Training' | 'Hormonal' | 'Cycle' | 'Finished';

const FOCUS_AREAS = ['Glutes', 'Core', 'Upper Body', 'Mobility', 'Full Body Conditioning', 'Stability'];

const CycleValueCard = ({ label, value, min, max, onChange, unit = "days" }: { label: string, value: number, min: number, max: number, onChange: (v: number) => void, unit?: string }) => (
  <div className="bg-white border border-black/5 rounded-[32px] p-6 space-y-4 shadow-sm">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">{label}</span>
      <span className="text-2xl font-bold font-mono">{value}<span className="text-[10px] font-bold text-black/20 ml-1 uppercase">{unit}</span></span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
    />
    <div className="flex justify-between text-[10px] font-bold text-black/10 uppercase tracking-widest">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

export const Onboarding: React.FC = () => {
  const { user, cycle, updateUser, updateCycle } = useApp();
  const [step, setStep] = useState<Step>('Basic');
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: user.name,
    age: user.age,
    trainingExperience: user.trainingExperience,
    primaryGoal: user.primaryGoal,
    daysPerWeek: user.daysPerWeek,
    workoutDuration: user.workoutDuration,
    focusAreas: user.focusAreas,
    contraception: user.contraception,
    cycleRegularity: user.cycleRegularity,
  });

  const [cycleData, setCycleData] = useState<Partial<CycleState>>({
    averageCycleLength: cycle.averageCycleLength,
    periodDuration: cycle.periodDuration,
    lastPeriodDate: cycle.lastPeriodDate.split('T')[0],
  });

  const handleComplete = () => {
    updateUser({
      ...profile,
      onboarded: true
    } as UserProfile);
    updateCycle({
      ...cycleData,
      currentDay: 1, // Will be recalculated based on lastPeriodDate if we wanted true accuracy, but keeping it simple for now
    } as CycleState);
  };

  const toggleFocusArea = (area: string) => {
    const current = profile.focusAreas || [];
    if (current.includes(area)) {
      setProfile({ ...profile, focusAreas: current.filter(a => a !== area) });
    } else {
      setProfile({ ...profile, focusAreas: [...current, area] });
    }
  };

  return (
    <div className="min-h-full flex flex-col pt-8">
      <AnimatePresence mode="wait">
        {step === 'Basic' && (
          <motion.div 
            key="basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 flex-1"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-[24px] bg-black text-white flex items-center justify-center shadow-2xl">
                <User size={32} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-black">First, the <span className="italic font-light">essentials</span>.</h1>
              <p className="text-black/40 text-sm">Lumina needs your baseline to begin alignment.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">What should we call you?</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white border border-black/5 rounded-2xl p-5 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/5 transition-all"
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Age</label>
                <input 
                   type="number"
                   value={profile.age}
                   onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) })}
                   className="w-full bg-white border border-black/5 rounded-2xl p-5 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-black/5 transition-all"
                />
              </div>
            </div>

            <div className="flex-1" />
            <button 
              onClick={() => setStep('Training')}
              className="w-full py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
            >
              Next Step <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 'Training' && (
          <motion.div 
            key="training"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 flex-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Training Profile</h1>
              <p className="text-black/40 text-sm">Quantifying your current workload.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Sessions per week</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setProfile({ ...profile, daysPerWeek: n })}
                      className={`py-4 rounded-xl font-bold text-sm transition-all ${profile.daysPerWeek === n ? 'bg-black text-white shadow-lg scale-105' : 'bg-neutral-50 text-black/40'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Average Session length</label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setProfile({ ...profile, workoutDuration: m })}
                      className={`py-4 rounded-xl font-bold text-sm transition-all ${profile.workoutDuration === m ? 'bg-black text-white shadow-lg scale-105' : 'bg-neutral-50 text-black/40'}`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map(area => (
                    <button
                      key={area}
                      onClick={() => toggleFocusArea(area)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${profile.focusAreas?.includes(area) ? 'bg-black text-white' : 'bg-neutral-50 text-black/40 border border-black/5'}`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1" />
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('Basic')}
                className="p-5 bg-neutral-100 text-black/40 rounded-3xl"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setStep('Hormonal')}
                className="flex-1 py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'Hormonal' && (
          <motion.div 
            key="hormonal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 flex-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Hormonal Profile</h1>
              <p className="text-black/40 text-sm">Aligning Lumina's logic with your endocrinology.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Hormonal Contraception?</label>
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map(v => (
                    <button
                      key={v ? 'y' : 'n'}
                      onClick={() => setProfile({ ...profile, contraception: v })}
                      className={`p-6 rounded-[28px] border transition-all text-center ${profile.contraception === v ? 'bg-black text-white border-black shadow-lg scale-105' : 'bg-white border-black/5 text-black/40'}`}
                    >
                      <span className="text-lg font-bold">{v ? 'Yes' : 'No'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/30">Cycle Regularity</label>
                <div className="grid gap-3">
                  {[
                    { id: 'Regular', desc: 'Predictable and consistent' },
                    { id: 'Irregular', desc: 'Varies month to month' },
                    { id: 'Not Tracking', desc: 'First time syncing' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setProfile({ ...profile, cycleRegularity: r.id as 'Regular' | 'Irregular' | 'Not Tracking' })}
                      className={`p-5 rounded-[24px] border transition-all text-left group ${profile.cycleRegularity === r.id ? 'bg-black text-white border-black' : 'bg-white border-black/5 text-black/60'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{r.id}</span>
                        <Info size={16} className={`opacity-20 group-hover:opacity-100 transition-opacity ${profile.cycleRegularity === r.id ? 'text-white' : 'text-black'}`} />
                      </div>
                      <p className={`text-xs mt-1 ${profile.cycleRegularity === r.id ? 'text-white/40' : 'text-black/30'}`}>{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1" />
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('Training')}
                className="p-5 bg-neutral-100 text-black/40 rounded-3xl"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setStep('Cycle')}
                className="flex-1 py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'Cycle' && (
          <motion.div 
            key="cycle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 flex-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                <Clock3 size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">The Bio-Clock</h1>
              <p className="text-black/40 text-sm">Fine-tuning your internal rhythm.</p>
            </div>

            <div className="space-y-4">
              <CycleValueCard 
                label="Typical Cycle Length" 
                value={cycleData.averageCycleLength || 28} 
                min={21} 
                max={40} 
                onChange={(v) => setCycleData({ ...cycleData, averageCycleLength: v })}
              />

              <CycleValueCard 
                label="Period Duration" 
                value={cycleData.periodDuration || 5} 
                min={2} 
                max={10} 
                onChange={(v) => setCycleData({ ...cycleData, periodDuration: v })}
              />

              <div className="bg-white border border-black/5 rounded-[32px] p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">When did your last period start?</span>
                  <div className="p-2 bg-black/5 rounded-full">
                    <Calendar size={14} className="text-black/40" />
                  </div>
                </div>
                <input 
                  type="date"
                  value={cycleData.lastPeriodDate}
                  onChange={e => setCycleData({ ...cycleData, lastPeriodDate: e.target.value })}
                  className="w-full bg-neutral-50/50 border-none rounded-2xl p-4 text-lg font-bold focus:outline-none accent-black"
                />
                <p className="text-[9px] text-black/20 font-bold uppercase tracking-[0.1em] text-center">Tap to select from calendar</p>
              </div>
            </div>

            <div className="flex-1" />
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('Hormonal')}
                className="p-5 bg-neutral-100 text-black/40 rounded-3xl"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setStep('Finished')}
                className="flex-1 py-5 bg-black text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl"
              >
                Complete Profile <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'Finished' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-12 flex flex-col items-center justify-center flex-1"
          >
            <div className="relative">
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 rounded-full border border-dashed border-black/10"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white shadow-2xl">
                    <Check size={48} />
                  </div>
               </div>
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="absolute -top-4 -right-4 w-12 h-12 bg-black/5 rounded-full flex items-center justify-center"
               >
                 <Sparkles size={20} className="text-black/20" />
               </motion.div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Sync Complete.</h1>
              <p className="text-black/40 max-w-[280px] mx-auto text-base leading-relaxed">
                Your biological data is secured. Your first <span className="text-black font-bold">Training Harvest</span> will generate after your morning check-in.
              </p>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full py-5 bg-black text-white rounded-[32px] font-bold text-lg shadow-xl active:scale-95 transition-all"
            >
              Enter The Grove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
