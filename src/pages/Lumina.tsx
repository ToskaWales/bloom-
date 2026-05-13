import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../lib/AppContext';
import { geminiService } from '../lib/gemini';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { COLORS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const Lumina: React.FC = () => {
  const { user, cycle, updateUser, firebaseUser } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    if (!firebaseUser) return;
    
    const loadHistory = async () => {
      try {
        const snap = await getDocs(
          collection(db, 'users', firebaseUser.uid, 'chat')
        );
        const historyData = snap.docs
          .map(d => d.data() as ChatMessage)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .slice(-50);
        
        if (historyData.length === 0) {
          // Initial greeting if no history
          const greeting: ChatMessage = {
            id: '1',
            role: 'model',
            content: `Hello ${user.name}. I'm Lumina. As you are in your ${cycle.phase} phase, I'm here to help you optimize your training and nutrition. How are you feeling today?`,
            timestamp: new Date().toISOString()
          };
          setMessages([greeting]);
        } else {
          setMessages(historyData);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadHistory();
  }, [firebaseUser, user.name, cycle.phase]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading || !firebaseUser) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Persist user message
      await addDoc(collection(db, 'users', firebaseUser.uid, 'chat'), userMsg);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}/chat`);
    }

    const history = messages.map(m => ({
      role: m.role as 'user' | 'model',
      parts: [{ text: m.content }]
    }));

    const result = await geminiService.chatWithLumina(history, text, user);

    if (result.newPlan) {
      updateUser({ trainingPlan: result.newPlan });
    }

    const modelMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: result.text || "I'm processing that. One moment.",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);

    try {
      // Persist model response
      await addDoc(collection(db, 'users', firebaseUser.uid, 'chat'), modelMsg);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}/chat`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-3 pb-4 shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 transition-colors duration-500" style={{ backgroundColor: COLORS[cycle.phase] }}>
          <Sparkles size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-medium truncate">Lumina</h1>
          <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold truncate">AI Physiological Coach</p>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-hide py-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[90%] p-4 rounded-[24px] text-[15px] leading-relaxed
                ${msg.role === 'user' 
                   ? 'text-white rounded-tr-none shadow-md' 
                   : 'bg-white border border-black/5 text-black/80 rounded-tl-none shadow-sm'}
              `}
              style={msg.role === 'user' ? { backgroundColor: COLORS[cycle.phase] } : {}}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-black/5 p-4 rounded-[24px] rounded-tl-none shadow-sm">
                  <motion.div 
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex gap-1.5"
                  >
                      <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                  </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Quick Taps */}
      <div className="py-4 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
        <QuickTap label="Why this weight?" onClick={() => handleSend("Why did you suggest this weight?")} />
        <QuickTap label="Need a snack idea?" onClick={() => handleSend("What's a good snack for my current phase?")} />
        <QuickTap label="I'm feeling tired" onClick={() => handleSend("I'm feeling extra tired today, should I adjust?")} />
      </div>

      {/* Input Area */}
      <div className="relative mt-2 pb-4 shrink-0">
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask Lumina..."
          className="w-full bg-white border border-black/10 rounded-full py-5 pl-6 pr-14 text-[15px] focus:outline-none focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-[calc(50%-8px)] -translate-y-1/2 p-3 text-white rounded-full active:scale-95 disabled:opacity-50 transition-all shadow-lg"
          style={{ backgroundColor: COLORS[cycle.phase] }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const QuickTap: React.FC<{ label: string, onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="px-5 py-2.5 rounded-full border border-black/5 bg-white/30 backdrop-blur-sm text-xs font-medium text-black/60 hover:bg-white/50 active:scale-95 transition-all shadow-sm"
  >
    {label}
  </button>
);
