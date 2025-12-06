
import React, { useState, useRef, useEffect } from 'react';
import { Job } from '../types';
import { runInterviewTurn } from '../services/geminiService';
import { Mic2, Send, X, User, Bot, Loader2, PlayCircle, StopCircle } from 'lucide-react';

interface InterviewModalProps {
  job: Job;
  resumeText: string;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ job, resumeText, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setLoading(true);
    setHasStarted(true);
    try {
      // Empty message to trigger the greeting based on system instruction
      const response = await runInterviewTurn("Olá, estou pronto para começar a entrevista.", [], job, resumeText);
      setMessages([{ role: 'model', text: response }]);
    } catch (error) {
      setMessages([{ role: 'model', text: "Erro ao iniciar a entrevista. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await runInterviewTurn(userText, history, job, resumeText);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-geek-dark/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-geek-border">
        
        {/* Header */}
        <div className="bg-geek-dark p-6 flex justify-between items-center text-white border-b border-gray-700">
          <div className="flex items-center gap-4">
             <div className="bg-geek-blue/20 p-2 rounded-xl">
               <Mic2 className="w-6 h-6 text-geek-blue" />
             </div>
             <div>
               <h3 className="font-bold text-lg">Simulador de Entrevista</h3>
               <p className="text-sm text-gray-300">Vaga: {job.title}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-geek-gray overflow-y-auto p-6 relative">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <div className="bg-white p-6 rounded-full shadow-soft mb-2">
                 <Bot className="w-16 h-16 text-geek-blue" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-geek-dark">Pronto para praticar?</h2>
                 <p className="text-geek-text max-w-md mx-auto mt-2">
                   A IA irá atuar como o recrutador da {job.department}. Ela fará perguntas baseadas no seu currículo e nos detalhes técnicos da vaga (incluindo requisitos e diferenciais).
                 </p>
               </div>
               <button 
                 onClick={startInterview}
                 disabled={loading}
                 className="bg-geek-blue hover:bg-geek-blueHover text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <PlayCircle className="w-5 h-5" />}
                 Iniciar Simulação
               </button>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-geek-dark text-white' : 'bg-geek-blue text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
                   </div>
                   <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                     msg.role === 'user' 
                       ? 'bg-white text-geek-dark border border-geek-border rounded-tr-none' 
                       : 'bg-white text-geek-dark border border-geek-blue/30 rounded-tl-none ring-1 ring-geek-blue/10'
                   }`}>
                      {msg.text}
                   </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-geek-blue text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4"/>
                   </div>
                   <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-geek-border flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-geek-blue animate-spin" />
                      <span className="text-xs text-geek-text font-medium">O recrutador está digitando...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer Input */}
        {hasStarted && (
          <div className="p-4 bg-white border-t border-geek-border">
             <div className="flex gap-3">
               <input
                 type="text"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder="Digite sua resposta..."
                 className="flex-1 bg-geek-gray border-transparent focus:bg-white border focus:border-geek-blue rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-geek-blue/20 transition-all"
                 disabled={loading}
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={!inputValue.trim() || loading}
                 className="bg-geek-blue hover:bg-geek-blueHover text-white p-3 rounded-xl transition-colors disabled:opacity-50"
               >
                 <Send className="w-5 h-5" />
               </button>
             </div>
             <div className="text-center mt-2">
                <button onClick={onClose} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1 mx-auto">
                   <StopCircle className="w-3 h-3" /> Encerrar Entrevista
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewModal;
