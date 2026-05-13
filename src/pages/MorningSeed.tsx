import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { geminiService } from '../lib/gemini';
import { SYMPTOMS, COLORS } from '../constants';
import { Zap, Smile, Thermometer, Check, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MorningSeed: React.FC = () => {
  const { seed, setSeed, user, updateUser, cycle } = useApp();
  const navigate = useNavigate();
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [physical, setPhysical] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (seed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-black blur-3xl opacity-10 rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-black text-white flex items-center justify-center shadow-2xl">
             <Check size={48} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-light tracking-tight">Already Bloomed</h2>
          <p className="text-black/50 leading-relaxed max-w-[280px] mx-auto italic">
            "Your Morning Seed has been planted. Your training plan is now synchronized with your bio-rhythm."
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

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    // If no plan, generate it now
    if (!user.trainingPlan) {
      setIsGenerating(true);
      const plan = await geminiService.generateTrainingPlan(user);
      
      if (plan === "QUOTA_EXHAUSTED" || !plan) {
         // Fallback or alert
         alert("Lumina is slightly delayed. We've recorded your seed, but your plan generation will be retried in your next check-in.");
      } else {
         updateUser({ trainingPlan: plan });
      }
      setIsGenerating(false);
    }

    setSeed({
      energyScore: energy,
      moodScore: mood,
      symptoms: selectedSymptoms,
      timestamp: new Date().toISOString()
    });
    navigate('/');
  };

  if (isGenerating) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center text-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border-4 border-dashed border-black/10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={64} className="text-black animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 max-w-[300px]">
          <h2 className="text-3xl font-bold tracking-tight italic">Initial Harvesting...</h2>
          <p className="text-black/40 text-sm leading-relaxed">
            Lumina is mapping your hormonal blueprint to your training goals for the first time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/20">
          <Loader2 className="animate-spin" size={12} />
          Establishing Neural Links
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col pt-4 pb-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium tracking-tight">Morning Seed</h1>
        <p className="text-black/40 text-sm">Synchronizing with your bio-rhythm</p>
      </header>

      {/* Fluid Sliders */}
      <div className="flex justify-between items-end h-[240px] gap-3">
        <VerticalSlider 
          value={energy} 
          onChange={setEnergy} 
          label="Energy" 
          icon={<Zap size={16} />} 
          color="#FFD54F"
        />
        <VerticalSlider 
          value={mood} 
          onChange={setMood} 
          label="Mood" 
          icon={<Smile size={16} />} 
          color="#4FC3F7"
        />
        <VerticalSlider 
          value={physical} 
          onChange={setPhysical} 
          label="Feel" 
          icon={<Thermometer size={16} />} 
          color="#FF8A65"
        />
      </div>

      {/* Symptoms Cloud */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/30">Symptoms Cloud</h3>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSymptom(s)}
              className={`
                px-4 py-2 rounded-full text-[13px] transition-all duration-300
                ${selectedSymptoms.includes(s) 
                  ? 'text-white shadow-md' 
                  : 'bg-white/40 border border-white/50 text-black/60'}
              `}
              style={selectedSymptoms.includes(s) ? { backgroundColor: COLORS[cycle.phase] } : {}}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <button 
        onClick={handleSubmit}
        className="w-full text-white py-5 rounded-[28px] font-bold text-base flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
        style={{ backgroundColor: COLORS[cycle.phase] }}
      >
        Complete Check-in
        <Check size={20} />
      </button>
    </div>
  );
};

const VerticalSlider: React.FC<{ 
  value: number, 
  onChange: (v: number) => void, 
  label: string, 
  icon: React.ReactNode, 
  color: string 
}> = ({ value, onChange, label, icon, color }) => {
  return (
    <div className="flex flex-col items-center gap-3 flex-1 h-full">
      <div 
        className="relative w-16 flex-1 bg-white/20 border border-white/40 rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const newVal = 5 - Math.floor((y / rect.height) * 5);
          onChange(Math.max(1, Math.min(5, newVal)));
        }}
      >
        <motion.div 
          initial={false}
          animate={{ height: `${(value / 5) * 100}%` }}
          className="absolute bottom-0 left-0 w-full rounded-full transition-colors"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}88`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/40 mix-blend-overlay">
          {icon}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">{label}</span>
      <span className="text-xl font-medium">{value}</span>
    </div>
  );
};
