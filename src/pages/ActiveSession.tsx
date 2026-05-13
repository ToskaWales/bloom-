import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useApp } from '../lib/AppContext';
import { geminiService } from '../lib/gemini';
import { Exercise } from '../types';
import { Play, Pause, RefreshCw, HelpCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActiveSession: React.FC = () => {
  const { cycle, workout, updateExercises, saveWorkout } = useApp();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [scienceCard, setScienceCard] = useState<string | null>(null);

  const handleNext = () => {
    if (currentIndex < workout.exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentExercise = workout.exercises[currentIndex];

  const handleSwap = async (reason: string) => {
    if (!currentExercise) return;
    setIsSwapping(true);
    const alts = await geminiService.getExerciseSwap(currentExercise, reason);
    if (Array.isArray(alts) && alts.length > 0) {
      const topPick = alts[0];
      const newExercises: Exercise[] = [...workout.exercises];
      newExercises[currentIndex] = {
        ...currentExercise,
        name: topPick.name,
        why: topPick.why,
        sets: topPick.sets,
        reps: topPick.reps
      };
      updateExercises(newExercises);
    }
    setIsSwapping(false);
  };

  const [actualSets, setActualSets] = React.useState<{ weight: string, reps: string }[]>([]);
  const lastExerciseId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (currentExercise && currentExercise.id !== lastExerciseId.current) {
      lastExerciseId.current = currentExercise.id;
      const initialSets = Array.from({ length: currentExercise.sets }, () => ({
        weight: currentExercise.weight || '',
        reps: currentExercise.reps || ''
      }));
      setActualSets(initialSets);
    }
  }, [currentExercise]);

  const updateSet = (index: number, updates: Partial<{ weight: string, reps: string }>) => {
    setActualSets(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  if (workout.isCompleted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-black blur-3xl opacity-10 rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-black text-white flex items-center justify-center shadow-2xl">
             <CheckCircle2 size={48} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-light tracking-tight">Bloom Harvested</h2>
          <p className="text-black/50 leading-relaxed max-w-[280px] mx-auto italic">
            "You have honored your biological potential today. Rest is the final rep."
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-10 py-5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
        >
          Greenhouse
        </button>
      </motion.div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center animate-pulse">
           <RefreshCw size={32} className="text-black/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-light">No Exercises Found</h2>
          <p className="text-black/40 text-sm max-w-[240px]">Complete your Morning Seed or wait for Lumina to generate your plan.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleComplete = () => {
    const newExercises = [...workout.exercises];
    newExercises[currentIndex] = {
      ...currentExercise,
      isCompleted: true,
      actualSets: actualSets
    };
    updateExercises(newExercises);
    
    if (currentIndex < workout.exercises.length - 1) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 },
        colors: [COLORS[cycle.phase], '#ffffff', '#000000']
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: [COLORS[cycle.phase], '#ffffff', '#000000']
      });
      saveWorkout();
      navigate('/growth');
    }
  };

  return (
    <div className="space-y-6 min-h-full flex flex-col pt-2">
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) handleNext();
          if (info.offset.x > 60) handlePrev();
        }}
        className="relative aspect-[4/3] w-full rounded-[32px] overflow-hidden shadow-xl flex items-center justify-center border border-white/10 group cursor-grab active:cursor-grabbing shrink-0"
        style={{ backgroundColor: `${COLORS[cycle.phase]}30` }}
      >
        <motion.div 
          animate={isPlaying ? { scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0.1 }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 blur-3xl"
          style={{ backgroundColor: COLORS[cycle.phase] }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
               animate={isPlaying ? { y: [0, -6, 0] } : {}}
               transition={{ duration: 2, repeat: Infinity }}
               className="text-white"
            >
                <DumbbellIllustration />
            </motion.div>
        </div>

        {/* Floating Why Button */}
        <button 
          onClick={() => setScienceCard(currentExercise.why)}
          className="absolute top-4 right-4 p-3 rounded-full backdrop-blur-md bg-white/20 border border-white/20 text-white hover:scale-110 transition-transform active:bg-white/40"
        >
          <HelpCircle size={18} />
        </button>

        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]"
        >
          {isPlaying ? <Pause size={48} className="text-white" /> : <Play size={48} className="text-white" />}
        </button>
      </motion.div>

      {/* Exercise Info */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{currentExercise.name}</h1>
            <p className="text-black/40 text-xs font-medium uppercase tracking-wider">Target: Growth & Resilience</p>
          </div>
          <button 
            onClick={() => handleSwap('Lack of equipment')}
            disabled={isSwapping}
            className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white px-4 py-2 rounded-full active:scale-95 transition-all shadow-md disabled:opacity-50"
            style={{ backgroundColor: COLORS[cycle.phase] }}
          >
            <RefreshCw size={12} className={isSwapping ? 'animate-spin' : ''} />
            Swap
          </button>
        </div>

        {/* Tracking Sets */}
        <div className="space-y-4">
          <div className="flex justify-between px-2 text-[10px] font-black uppercase tracking-widest text-black/30">
            <div className="w-8">Set</div>
            <div className="flex-1 text-center">Weight (kg)</div>
            <div className="flex-1 text-center">Reps</div>
          </div>
          
          <div className="space-y-3">
            {actualSets.map((set, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 text-center text-sm font-bold text-black/20">{i + 1}</div>
                <div className="flex-1 bg-neutral-50 border border-black/5 rounded-2xl p-4 shadow-inner flex items-center gap-2">
                  <input 
                    type="number" 
                    inputMode="decimal"
                    value={set.weight}
                    onChange={(e) => updateSet(i, { weight: e.target.value })}
                    placeholder={currentExercise.weight || "--"}
                    className="w-full bg-transparent text-xl font-bold focus:outline-none placeholder:text-black/5 text-center"
                  />
                </div>
                <div className="flex-1 bg-neutral-50 border border-black/5 rounded-2xl p-4 shadow-inner flex items-center gap-2">
                  <input 
                    type="number" 
                    inputMode="numeric"
                    value={set.reps}
                    onChange={(e) => updateSet(i, { reps: e.target.value })}
                    placeholder={currentExercise.reps}
                    className="w-full bg-transparent text-xl font-bold focus:outline-none placeholder:text-black/5 text-center"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] text-center bg-black/5 py-2 rounded-full">
            Plan: {currentExercise.sets} × {currentExercise.reps} {currentExercise.weight ? `@ ${currentExercise.weight}` : ''}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-4">
          <button 
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="p-5 rounded-2xl bg-black/5 disabled:opacity-10 active:bg-black/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={handleComplete}
            className="flex-1 text-white py-5 rounded-[28px] font-bold text-base flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
            style={{ backgroundColor: COLORS[cycle.phase], boxShadow: `0 10px 20px -5px ${COLORS[cycle.phase]}60` }}
          >
            {currentIndex === workout.exercises.length - 1 ? 'Finish' : 'Next Set'}
            <CheckCircle2 size={20} />
          </button>

          <button 
            disabled={currentIndex === workout.exercises.length - 1}
            onClick={handleNext}
            className="p-5 rounded-2xl bg-black/5 disabled:opacity-10 active:bg-black/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex gap-1 px-1 pt-2">
            {workout.exercises.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= currentIndex ? 'scale-y-110' : 'bg-black/10'}`} 
                    style={i <= currentIndex ? { backgroundColor: COLORS[cycle.phase] } : {}}
                />
            ))}
        </div>
      </div>

      {/* Science Card Drawer */}
      <AnimatePresence>
        {scienceCard && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" 
              onClick={() => setScienceCard(null)} 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] flex justify-center pointer-events-none"
            >
              <div 
                className="w-full max-w-[390px] bg-white rounded-t-[40px] p-8 space-y-6 shadow-2xl pointer-events-auto border-t border-white/20"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-black/30">
                    <HelpCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Biological Rationale</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Why this movement?</h3>
                  <p className="text-black/80 leading-relaxed italic text-lg">{scienceCard}</p>
                  <div className="pt-6 flex items-center justify-between border-t border-black/5">
                    <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Source Calibration</span>
                    <span className="text-[10px] text-black/30 font-mono underline">{workout.scienceCitation}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setScienceCard(null)}
                  className="w-full py-5 bg-black text-white rounded-3xl font-bold uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
                >
                  Return to Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const DumbbellIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
    <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /><rect width="8" height="2" x="8" y="11" rx="1" /><path d="m15 15 3 3" /><path d="m6 6 3 3" /><path d="M22 12h-4" /><path d="M2 12h4" /><path d="m11 7-3-3" /><path d="m13 17 3 3" /><path d="m2 18 4 4" /><path d="m21 2-4 4" /><path d="m10 21 7-7" /><path d="m7 3 7 7" /><circle cx="12" cy="12" r="10" strokeDasharray="2 4" />
  </svg>
);
