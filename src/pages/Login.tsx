import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100/50 p-0 md:p-8">
      <div className="app-frame w-full h-screen md:h-[844px] md:w-[390px] bg-white flex flex-col items-center justify-center p-6 space-y-12 relative shadow-none md:shadow-2xl overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-neutral-50 to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 z-10"
        >
          <div className="w-20 h-20 bg-black rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl relative">
            <Sparkles className="text-white" size={40} />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-black blur-2xl -z-10"
            />
          </div>
          <h1 className="text-5xl font-light tracking-tight">Bloom</h1>
          <p className="text-black/40 text-sm italic font-serif">Proactive Hormonal Architecture</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[320px] space-y-8 z-10"
        >
          <div className="p-8 rounded-[40px] bg-black/5 space-y-6 text-center border border-black/5 backdrop-blur-sm">
            <p className="text-black/60 text-sm leading-relaxed">
              Synchronize your biology. Sync your data. Bloom requires a secure connection to your biological profile.
            </p>
            <button
              onClick={handleLogin}
              className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LogIn size={16} />
              Initialize with Google
            </button>
          </div>
          
          <p className="text-[10px] text-center text-black/20 uppercase tracking-widest font-bold">
            Secure • Encrypted • Private
          </p>
        </motion.div>
      </div>
    </div>
  );
};
