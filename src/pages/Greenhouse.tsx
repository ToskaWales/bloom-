import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { COLORS } from '../constants';
import { geminiService } from '../lib/gemini';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Exercise, WorkoutState } from '../types';

export const Greenhouse: React.FC = () => {
  const { user, cycle, seed, workout, setWorkout } = useApp();
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      if (seed && workout.briefing === "Loading your proactive briefing...") {
        setIsBriefingLoading(true);
        const data = await geminiService.generateDailyBriefing(cycle.currentDay, cycle.phase, seed, user);
        
        if (data === "QUOTA_EXHAUSTED") {
          setWorkout((prev: WorkoutState) => ({
            ...prev,
            briefing: "I've hit my daily insight limit. Please enjoy your workout based on your scheduled split!",
          }));
          setIsBriefingLoading(false);
          return;
        }

        if (data && typeof data === 'object') {
          setWorkout((prev: WorkoutState) => ({
            ...prev,
            isRestDay: data.is_rest_day,
            briefing: data.briefing_text,
            nutritionTip: data.nutrition_tip,
            scienceCitation: data.science_citation,
            exercises: (data.modified_exercises || []).map((e: Exercise) => ({ ...e, isCompleted: false }))
          }));
        }
        setIsBriefingLoading(false);
      }
    };
    fetchBriefing();
  }, [seed, cycle.currentDay, cycle.phase, user, setWorkout, workout.briefing]);

  const isRestDay = workout.isRestDay;

  return (
    <div className="space-y-6 pt-2">
      {/* Phase Status Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS[cycle.phase] }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">Current Phase</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{cycle.phase}</h1>
        </div>
        <div className="text-right">
          <span className="text-4xl font-light tracking-tighter text-black/10">Day {cycle.currentDay}</span>
        </div>
      </div>

      {/* Main Action Card */}
      <Link to={isRestDay ? "#" : "/workout"}>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className={`relative border p-7 rounded-[40px] shadow-sm overflow-hidden group transition-all duration-500 ${isRestDay ? 'bg-neutral-100/50 border-black/[0.03]' : 'bg-white shadow-xl shadow-black/5 border-transparent'}`}
          style={!isRestDay ? { borderImage: `linear-gradient(to bottom right, ${COLORS[cycle.phase]}, transparent) 1`, border: '1px solid transparent', backgroundImage: `linear-gradient(white, white), linear-gradient(to bottom right, ${COLORS[cycle.phase]}40, transparent)`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' } : {}}
        >
          {/* Animated Glow */}
          {!isRestDay && (
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20 pointer-events-none transition-colors duration-1000"
              style={{ backgroundColor: COLORS[cycle.phase] }}
            />
          )}

          <div className="absolute top-7 right-7">
            <div className={`p-2 rounded-full transition-colors duration-500 ${isRestDay ? 'bg-black/5 text-black/20' : 'text-white'}`} style={!isRestDay ? { backgroundColor: COLORS[cycle.phase] } : {}}>
              <Sparkles size={16} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Today's Pulse</span>
              <h3 className="text-2xl font-bold leading-tight">
                {workout.isCompleted ? 'Harvest Complete' : isRestDay ? 'Stillness & Flow' : 'Suggested Training'}
              </h3>
              {user.trainingPlan?.split && (
                <div className="flex gap-2 pt-1">
                   <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-black/40 border border-black/5" style={{ backgroundColor: `${COLORS[cycle.phase]}10` }}>
                    {user.trainingPlan.split}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2.5">
              {isRestDay ? (
                <p className="text-sm text-black/40 leading-relaxed max-w-[200px]">
                  Honor your recovery. Your bio-rhythm is prioritizing deep cellular regeneration.
                </p>
              ) : (
                <div className="space-y-2">
                  {workout.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/[0.02] p-3 rounded-2xl">
                      <span className="text-sm font-medium text-black/70 truncate mr-2">{ex.name}</span>
                      <span className="text-[10px] font-mono bg-white px-2 py-1 rounded-lg shadow-sm border border-black/5">{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-center pt-1">
                      <span className="text-[10px] text-black/20 font-bold uppercase tracking-widest">+ {workout.exercises.length - 3} more movements</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isRestDay && !workout.isCompleted && (
              <div 
                className="pt-2 flex items-center justify-center w-full text-white py-4 rounded-[24px] text-sm font-bold gap-2 shadow-lg active:scale-95 transition-all"
                style={{ backgroundColor: COLORS[cycle.phase], boxShadow: `0 10px 20px -10px ${COLORS[cycle.phase]}80` }}
              >
                Enter The Grove
                <ChevronRight size={16} />
              </div>
            )}
          </div>
        </motion.div>
      </Link>

      {/* Proactive Insight Section */}
      <div className="space-y-3">
        {!seed ? (
          <Link to="/checkin">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-[32px] flex justify-between items-center shadow-xl shadow-black/10 transition-all duration-500"
              style={{ backgroundColor: COLORS[cycle.phase] }}
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-lg text-white">Morning Seed</h4>
                <p className="text-white/60 text-[11px] font-medium uppercase tracking-wider">Required for AI calibration</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <ChevronRight size={20} />
              </div>
            </motion.div>
          </Link>
        ) : (
          <div className="bg-neutral-50 border border-black/5 p-6 rounded-[32px] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-black/20" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                Synthesis Insight
              </h4>
              {isBriefingLoading && <Loader2 className="w-3 h-3 animate-spin text-black/20" />}
            </div>
            <p className="text-black/60 text-sm leading-relaxed italic font-medium">
              "{workout.briefing}"
            </p>
            {workout.nutritionTip && (
              <div className="pt-3 border-t border-black/5 flex gap-3 items-start">
                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-black mt-1.5" />
                <p className="text-[11px] text-black/40 font-medium leading-normal">{workout.nutritionTip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
