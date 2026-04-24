import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// The system prompt
const SYSTEM_INSTRUCTION = `You are CampusBot, the official AI assistant for the Campus One platform.
Campus One is a comprehensive platform for students to manage notes, events, internships, complaints, announcements, and clubs.
Help students navigate the platform, draft proposals, and answer questions concisely and politely. Keep your responses short.`;


const CuteBotLogo = ({ className }: { className?: string }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      animate={{ y: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="visorGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id="flameGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Thruster Flame */}
      <motion.path
        d="M 40 70 Q 50 100 60 70 Z"
        fill="#38bdf8"
        filter="url(#flameGlow)"
        animate={{ d: ["M 40 70 Q 50 95 60 70 Z", "M 42 70 Q 50 105 58 70 Z", "M 40 70 Q 50 95 60 70 Z"] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
      />

      {/* Ears */}
      <rect x="15" y="40" width="10" height="20" rx="4" fill="#64748b" />
      <rect x="75" y="40" width="10" height="20" rx="4" fill="#64748b" />

      {/* Antenna Line */}
      <rect x="48" y="15" width="4" height="15" rx="2" fill="#94a3b8" />
      
      {/* Antenna Bulb */}
      <motion.circle
        cx="50" cy="15" r="5" fill="#f43f5e"
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />

      {/* Body / Head */}
      <rect x="22" y="30" width="56" height="46" rx="20" fill="url(#bodyGrad)" stroke="#cbd5e1" strokeWidth="2" />

      {/* Visor */}
      <rect x="28" y="40" width="44" height="24" rx="12" fill="url(#visorGrad)" stroke="#334155" strokeWidth="1" />

      {/* Blinking Eyes (Ellipses) */}
      <motion.ellipse
        cx="40" cy="52" rx="4"
        fill="#38bdf8"
        animate={{ ry: [4, 0.5, 4, 4, 4] }}
        transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1, 0.5, 1] }}
      />
      <motion.ellipse
        cx="60" cy="52" rx="4"
        fill="#38bdf8"
        animate={{ ry: [4, 0.5, 4, 4, 4] }}
        transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1, 0.5, 1] }}
      />
      
      {/* Little cheeks */}
      <circle cx="34" cy="58" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="66" cy="58" r="2.5" fill="#f43f5e" opacity="0.4" />

      {/* Hover Ring underneath */}
      <motion.ellipse
        cx="50" cy="90" rx="15" ry="3"
        fill="#38bdf8" opacity="0.3" filter="url(#flameGlow)"
        animate={{ rx: [15, 20, 15], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </motion.svg>
  );
};

export default function CampusBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hello! I am CampusBot. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured.');
      }

      // Initialize the Gen AI SDK
      const ai = new GoogleGenAI({ apiKey: apiKey });

      // Build history for the API
      const contents = messages
        .filter(msg => msg.text.trim()) // filter out empty messages
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));
      
      contents.push({ role: 'user', parts: [{ text: userText }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.text || "I'm sorry, I couldn't generate a response." }
      ]);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `Error: ${error.message || 'Something went wrong.'}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ zIndex: 9999 }}
        className="fixed bottom-6 right-6 transition-transform hover:scale-110 drop-shadow-2xl"
      >
        <CuteBotLogo className="w-16 h-16" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ zIndex: 10000 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-2">
                <CuteBotLogo className="w-8 h-8 drop-shadow-md" />
                <h3 className="font-semibold">CampusBot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary/90 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <CuteBotLogo className="w-9 h-9 shrink-0 drop-shadow-md" />
                  )}
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted rounded-tl-sm prose prose-sm dark:prose-invert max-w-none border'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <CuteBotLogo className="w-9 h-9 shrink-0 drop-shadow-md" />
                  <div className="px-4 py-2 rounded-2xl max-w-[80%] text-sm bg-muted rounded-tl-sm flex items-center gap-2 border">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-background border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CampusBot..."
                  className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-muted/50"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
