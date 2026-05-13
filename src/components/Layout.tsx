import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { COLORS } from '../constants';
import { Home, ClipboardCheck, Dumbbell, MessageCircle, BarChart2, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cycle, logout, user } = useApp();
  const location = useLocation();
  const baseColor = COLORS[cycle.phase];
  const showNav = user.onboarded;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100/50 p-0 md:p-8">
      <div 
        className="app-frame w-full h-screen md:h-[844px] md:w-[390px] transition-colors duration-1000 ease-in-out flex flex-col font-sans overflow-hidden select-none bg-white relative shadow-none md:shadow-2xl"
        style={{ backgroundColor: `${baseColor}15` }}
      >
        {/* Header with Logout */}
        {showNav && (
          <header className="absolute top-6 left-0 right-0 px-6 flex justify-end z-40">
            <button 
              onClick={logout}
              className="p-3 glass rounded-full text-black/30 hover:text-black transition-all hover:scale-110 active:scale-95 shadow-sm"
            >
              <LogOut size={16} />
            </button>
          </header>
        )}

        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -right-1/4 w-[100%] h-[100%] opacity-30 blur-[100px] rounded-full"
            style={{ backgroundColor: baseColor }}
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, -40, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-1/4 -left-1/4 w-[100%] h-[100%] opacity-20 blur-[120px] rounded-full"
            style={{ backgroundColor: baseColor }}
          />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col pt-16 ${showNav ? 'pb-36' : 'pb-10'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="px-6 min-h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none z-50">
            <nav className="glass rounded-[32px] py-3 px-4 flex justify-around items-center shadow-2xl shadow-black/10 pointer-events-auto max-w-[340px] mx-auto border border-white/60">
              <NavItem to="/" icon={<Home size={20} />} label="Home" activeColor={baseColor} />
              <NavItem to="/checkin" icon={<ClipboardCheck size={20} />} label="Seed" activeColor={baseColor} />
              <NavItem to="/workout" icon={<Dumbbell size={20} />} label="Pulse" activeColor={baseColor} />
              <NavItem to="/chat" icon={<MessageCircle size={20} />} label="Ask" activeColor={baseColor} />
              <NavItem to="/growth" icon={<BarChart2 size={20} />} label="Grove" activeColor={baseColor} />
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, activeColor: string }> = ({ to, icon, label, activeColor }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => `
        relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300
        ${isActive ? 'scale-110' : 'text-black/20 hover:text-black/40'}
      `}
      style={({ isActive }) => isActive ? { color: activeColor } : {}}
    >
      {({ isActive }) => (
        <>
          <div className="relative flex flex-col items-center">
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0
              }}
              className="relative z-10"
            >
              {icon}
            </motion.div>
            {isActive && (
              <motion.div 
                layoutId="active-nav-bg"
                className="absolute -inset-2 rounded-xl -z-0"
                style={{ backgroundColor: `${activeColor}15` }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            {isActive && (
              <motion.div 
                layoutId="active-dot"
                className="absolute -bottom-2 w-1 h-1 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
            )}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-wider transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
};
