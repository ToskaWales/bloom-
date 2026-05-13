import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { COLORS } from '../constants';
import { TrendingUp, Award, Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';

const mockData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  score: Math.floor(Math.random() * 40) + 60 + (i > 14 ? -10 : 10),
}));

export const Grove: React.FC = () => {
  const { cycle, history } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-start pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">The Grove</h1>
          <p className="text-black/40 text-sm">Visualizing your growth & alignment</p>
        </div>
      </header>

      {/* Growth Avatar */}
      <div className="relative aspect-[4/5] w-full rounded-[32px] overflow-hidden bg-neutral-100 shadow-inner border border-black/5 group">
        <img 
          src={`https://picsum.photos/seed/bloom-${cycle.phase}/800/1000?grayscale&blur=2`}
          alt="Growth Avatar"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="w-40 h-40 rounded-full border border-black/5 flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm shadow-xl"
          >
             <div 
               className="w-full h-full rounded-full text-white flex flex-col items-center justify-center shadow-2xl transition-colors duration-1000"
               style={{ backgroundColor: COLORS[cycle.phase] }}
             >
                <span className="text-5xl font-black">12</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-white/50">Streak</span>
             </div>
          </motion.div>
          <div className="space-y-1">
             <h3 className="text-xl font-bold">Alignment Crystal</h3>
             <p className="text-black/40 text-xs font-medium leading-relaxed max-w-[200px] mx-auto">Your workout intensity is 92% aligned with your hormonal peaks this week.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-neutral-50/50 border border-black/5 p-5 rounded-[28px] flex flex-col gap-2 shadow-sm">
            <TrendingUp size={20} style={{ color: COLORS[cycle.phase] }} />
            <div className="text-2xl font-bold">92%</div>
            <div className="text-[10px] uppercase tracking-widest font-black text-black/30">Alignment</div>
         </div>
         <div className="bg-neutral-50/50 border border-black/5 p-5 rounded-[28px] flex flex-col gap-2 shadow-sm">
            <Award size={20} style={{ color: COLORS[cycle.phase] }} />
            <div className="text-2xl font-bold">Gold</div>
            <div className="text-[10px] uppercase tracking-widest font-black text-black/30">Consistency</div>
         </div>
      </div>

      {/* Alignment Graph */}
      <div className="bg-white border border-black/5 p-6 rounded-[32px] shadow-sm space-y-4">
        <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold">Alignment wave</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-black/20 tracking-widest uppercase">
                <Calendar size={12} />
                28 DAY CYCLE
            </div>
        </div>
        <div className="h-40 w-full translate-x-[-10px]">
          <ResponsiveContainer width="110%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[cycle.phase]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={COLORS[cycle.phase]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                        {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke={COLORS[cycle.phase]} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History size={18} className="text-black/20" />
          <h3 className="text-lg font-bold tracking-tight">Timeline</h3>
        </div>

        {history.length === 0 ? (
          <div className="bg-neutral-50 border border-dashed border-black/5 rounded-[28px] p-10 text-center text-black/30 italic text-sm">
            Complete your first session to see history.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((workout, index) => (
              <div key={index} className="bg-neutral-50/50 border border-black/5 rounded-[28px] overflow-hidden">
                <button 
                  onClick={() => setExpandedId(expandedId === index.toString() ? null : index.toString())}
                  className="w-full p-5 flex justify-between items-center text-left"
                >
                  <div className="flex gap-4 items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm"
                      style={{ backgroundColor: COLORS[workout.phase] }}
                    >
                      D{workout.day}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{workout.date}</h4>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{workout.phase} • {workout.exercises.length} Exercises</p>
                    </div>
                  </div>
                  {expandedId === index.toString() ? <ChevronUp size={18} className="text-black/20" /> : <ChevronDown size={18} className="text-black/20" />}
                </button>
                
                <AnimatePresence>
                  {expandedId === index.toString() && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5"
                    >
                      <div className="pt-3 space-y-3 border-t border-black/5">
                        {workout.exercises.map((ex, i) => {
                          const actualSets = ex.actualSets || [];
                          const topWeight = Math.max(...actualSets.map(s => parseFloat(s.weight || '0')), 0);
                          const totalReps = actualSets.reduce((sum, s) => sum + parseInt(s.reps || '0'), 0);
                          
                          let isOverload = false;
                          let weightDiff = 0;
                          let repsDiff = 0;

                          for (let j = index + 1; j < history.length; j++) {
                            const prevEx = history[j].exercises.find(p => p.name === ex.name);
                            if (prevEx) {
                              const prevSets = prevEx.actualSets || [];
                              const prevTopWeight = Math.max(...prevSets.map(s => parseFloat(s.weight || '0')), 0);
                              const prevTotalReps = prevSets.reduce((sum, s) => sum + parseInt(s.reps || '0'), 0);
                              
                              if (topWeight > prevTopWeight || (topWeight === prevTopWeight && totalReps > prevTotalReps)) {
                                isOverload = true;
                                weightDiff = topWeight - prevTopWeight;
                                repsDiff = totalReps - prevTotalReps;
                              }
                              break;
                            }
                          }

                          return (
                            <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-black/5">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className="font-bold text-sm text-black/80">{ex.name}</span>
                                  <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Goal: {ex.sets}×{ex.reps}</span>
                                </div>
                                 {isOverload && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                                    style={{ backgroundColor: COLORS[cycle.phase] }}
                                  >
                                    <TrendingUp size={10} strokeWidth={4} />
                                    <span className="text-[8px] font-black tracking-widest text-white/90">
                                      {weightDiff > 0 ? `+${weightDiff}KG` : repsDiff > 0 ? `+${repsDiff}R` : 'UP'}
                                    </span>
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {actualSets.map((s, si) => (
                                  <div key={si} className="text-[9px] font-mono bg-neutral-50 px-2 py-1 rounded-lg border border-black/5">
                                    <span className="opacity-30">{si + 1}:</span> {s.weight || '--'}k × {s.reps || '0'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};
