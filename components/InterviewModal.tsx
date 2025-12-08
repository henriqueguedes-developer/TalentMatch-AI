
import React, { useState, useRef, useEffect } from 'react';
import { Job, InterviewResult } from '../types';
import { runInterviewTurn, evaluateInterview } from '../services/geminiService';
import { Mic2, Send, X, User, Bot, Loader2, PlayCircle, StopCircle, Award, CheckCircle2 } from 'lucide-react';

interface InterviewModalProps {
  job: Job;
  resumeText: string;
  onClose: (result?: InterviewResult) => void;
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
  const [turnCount, setTurnCount] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalResult, setFinalResult] = useState<InterviewResult | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isEvaluating, finalResult]);

  const startInterview = async () => {
    setLoading(true);
    setHasStarted(true);
    try {
      // Empty message to trigger the greeting based on system instruction
      const response = await runInterviewTurn("Hello, I'm ready to start the interview.", [], job, resumeText);
      setMessages([{ role: 'model', text: response }]);
      setTurnCount(1);
    } catch (error) {
      setMessages([{ role: 'model', text: "Error starting interview. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading || turnCount > 3) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // If we reached 3 turns, we stop asking questions and evaluate
    if (turnCount >= 3) {
        setIsEvaluating(true);
        try {
             // Add user last message to history for evaluation
            const historyForEval = [...messages, { role: 'user', text: userText }].map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.text }]
            }));
            
            const result = await evaluateInterview(historyForEval, job);
            setFinalResult(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setIsEvaluating(false);
        }
        return;
    }

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await runInterviewTurn(userText, history, job, resumeText);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setTurnCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(finalResult || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-geek-dark/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl h-[650px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-geek-border relative">
        
        {/* Header */}
        <div className="bg-geek-dark p-6 flex justify-between items-center text-white border-b border-gray-700">
          <div className="flex items-center gap-4">
             <div className="bg-geek-blue/20 p-2 rounded-xl">
               <Mic2 className="w-6 h-6 text-geek-blue" />
             </div>
             <div>
               <h3 className="font-bold text-lg">Interview Simulator</h3>
               <p className="text-sm text-gray-300">Role: {job.title}</p>
             </div>
          </div>
          <button onClick={() => onClose()} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
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
                 <h2 className="text-2xl font-bold text-geek-dark">Ready to practice?</h2>
                 <p className="text-geek-text max-w-md mx-auto mt-2">
                   The AI will ask <strong>3 questions</strong> based on the job and your resume. At the end, you will receive an instant score and feedback which will be attached to your application.
                 </p>
               </div>
               <button 
                 onClick={startInterview}
                 disabled={loading}
                 className="bg-geek-blue hover:bg-geek-blueHover text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
               >
                 {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <PlayCircle className="w-5 h-5" />}
                 Start Simulation
               </button>
            </div>
          ) : finalResult ? (
             <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-card border border-geek-border text-center max-w-md w-full">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award className="w-10 h-10 text-green-600" />
                   </div>
                   <h2 className="text-2xl font-bold text-geek-dark mb-2">Interview Completed!</h2>
                   <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-4xl font-bold text-geek-blue">{finalResult.score}</span>
                      <span className="text-geek-text text-sm self-end mb-1">/ 100</span>
                   </div>
                   
                   <div className="bg-geek-gray p-4 rounded-xl text-left mb-6">
                      <p className="text-sm text-geek-dark font-medium leading-relaxed">{finalResult.feedback}</p>
                   </div>

                   <button 
                     onClick={handleClose}
                     className="w-full bg-geek-blue hover:bg-geek-blueHover text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 className="w-5 h-5" /> Authorize Submission
                   </button>
                </div>
             </div>
          ) : isEvaluating ? (
            <div className="h-full flex flex-col items-center justify-center">
                 <div className="bg-white p-6 rounded-2xl shadow-soft border border-geek-border flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-geek-blue animate-spin mb-4" />
                    <h3 className="font-bold text-lg text-geek-dark">Calculating Results...</h3>
                    <p className="text-sm text-geek-text">AI is analyzing your answers.</p>
                 </div>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              <div className="flex justify-center sticky top-0 z-10">
                 <span className="bg-geek-dark text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                   Question {turnCount} of 3
                 </span>
              </div>
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
                      <span className="text-xs text-geek-text font-medium">Recruiter is typing...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer Input */}
        {hasStarted && !finalResult && !isEvaluating && (
          <div className="p-4 bg-white border-t border-geek-border">
             <div className="flex gap-3">
               <input
                 type="text"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder={turnCount >= 3 ? "Simulation ended, please wait..." : "Type your answer..."}
                 className="flex-1 bg-geek-gray border-transparent focus:bg-white border focus:border-geek-blue rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-geek-blue/20 transition-all"
                 disabled={loading || turnCount > 3}
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={!inputValue.trim() || loading || turnCount > 3}
                 className="bg-geek-blue hover:bg-geek-blueHover text-white p-3 rounded-xl transition-colors disabled:opacity-50"
               >
                 <Send className="w-5 h-5" />
               </button>
             </div>
             <div className="text-center mt-2">
                <button onClick={() => onClose()} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1 mx-auto">
                   <StopCircle className="w-3 h-3" /> Cancel Simulation
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewModal;
