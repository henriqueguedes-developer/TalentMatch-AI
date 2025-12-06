import React, { useState, useRef } from 'react';
import { Job, AnalysisResult, Candidate } from '../types';
import { analyzeResume, findBestMatches, JobMatch } from '../services/geminiService';
import AnalysisCard from '../components/AnalysisCard';
import InterviewModal from '../components/InterviewModal';
import { useAppContext } from '../contexts/AppContext';
import { FileText, Loader2, CheckCircle2, UploadCloud, X, ArrowRight, Briefcase, Search, ChevronLeft, Send, Edit2, MapPin, Building2, Mic2 } from 'lucide-react';

const CandidatePortal: React.FC = () => {
  const { jobs, addApplication } = useAppContext();

  // State for flow control
  const [step, setStep] = useState<'upload' | 'results' | 'detail' | 'preferences'>('upload');
  
  // Data state
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Preferences State
  const [preferences, setPreferences] = useState<{workModels: string[], contractTypes: string[]}>({
    workModels: [],
    contractTypes: []
  });

  // UI/Loading state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setLoadingMessage("Processando seu currículo...");

    // Mock extraction delay
    setTimeout(() => {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string);
          setLoading(false);
        };
        reader.readAsText(file);
      } else {
        // Mock extraction for PDF/Docx
        setResumeText(`[SIMULAÇÃO DE CONTEÚDO PARA: ${file.name}]\n\nEste é um ambiente de demonstração.\nSe você fez upload de um PDF/DOC, o conteúdo real não pôde ser extraído no navegador.\n\n>> EDITE ESTE TEXTO << e cole o conteúdo real do seu currículo aqui para uma análise precisa da IA.`);
        setLoading(false);
      }
    }, 1000);
  };

  const handleFindMatches = async () => {
    if (!resumeText) return;
    
    setLoading(true);
    setLoadingMessage(`Analisando compatibilidade com ${jobs.length} vagas...`);
    
    try {
      const results = await findBestMatches(resumeText, jobs);
      setMatches(results);
      setStep('results');
    } catch (error) {
      alert("Erro ao buscar vagas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setSelectedJob(job);
    setApplicationSuccess(false); // Reset app status
    setLoading(true);
    setLoadingMessage(`Calculando aderência para ${job.title}...`);

    try {
      const analysis = await analyzeResume(job, resumeText);
      setAnalysisResult(analysis);
      setStep('detail');
    } catch (error) {
      alert("Erro na análise detalhada.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreApply = () => {
    setStep('preferences');
  }

  const togglePreference = (field: 'workModels' | 'contractTypes', value: string) => {
    setPreferences(prev => {
        const current = prev[field];
        if (current.includes(value)) {
            return { ...prev, [field]: current.filter(i => i !== value) };
        } else {
            return { ...prev, [field]: [...current, value] };
        }
    });
  }

  const handleApply = () => {
    if (!selectedJob || !analysisResult) return;
    setIsApplying(true);
    
    // Simulate network delay then save to context
    setTimeout(() => {
      const newCandidate: Candidate = {
        id: `app-${Date.now()}`,
        name: fileName ? fileName.split('.')[0] : 'Candidato (Portal)',
        email: 'candidato@portal.com',
        fileName: fileName || 'curriculo.pdf',
        resumeText: resumeText,
        analysis: analysisResult,
        jobId: selectedJob.id,
        preferences: preferences // Save preferences
      };
      
      addApplication(newCandidate);
      
      setIsApplying(false);
      setStep('detail'); // Go back to detail to show success
      setApplicationSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const file = e.dataTransfer.files[0];
       setFileName(file.name);
       setLoading(true);
       setLoadingMessage("Processando arquivo...");
       setTimeout(() => {
        if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setResumeText(e.target?.result as string);
            setLoading(false);
          };
          reader.readAsText(file);
        } else {
          setResumeText(`[SIMULAÇÃO DE CONTEÚDO PARA: ${file.name}]\n\nEste é um ambiente de demonstração.\n\n>> EDITE ESTE TEXTO << e cole o conteúdo real do seu currículo aqui.`);
          setLoading(false);
        }
       }, 1000);
    }
  };

  const resetProcess = () => {
    setStep('upload');
    setResumeText('');
    setFileName(null);
    setMatches([]);
    setAnalysisResult(null);
    setApplicationSuccess(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-500 border-red-200 bg-red-50';
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-card border border-geek-border m-4">
        <div className="bg-geek-gray p-4 rounded-full mb-4 animate-bounce">
           <Loader2 className="w-8 h-8 text-geek-blue animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-geek-dark">{loadingMessage}</h3>
        <p className="text-geek-text mt-2 font-medium">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      
      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
          <div className="text-center mb-12 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-geek-dark mb-6 tracking-tight">
              Descubra seu <span className="text-geek-blue">potencial</span> real
            </h1>
            <p className="text-lg text-geek-text leading-relaxed">
              Faça upload do seu currículo e deixe nossa Inteligência Artificial analisar suas competências contra as melhores oportunidades do mercado.
            </p>
          </div>

          <div className="w-full max-w-2xl">
             {!resumeText ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="w-full h-72 border-2 border-dashed border-geek-blue/40 rounded-3xl bg-white hover:bg-geek-gray hover:border-geek-blue transition-all cursor-pointer flex flex-col items-center justify-center gap-5 group shadow-soft"
                >
                  <div className="p-5 bg-geek-gray rounded-2xl group-hover:scale-110 transition-transform duration-300 group-hover:bg-white group-hover:shadow-md">
                    <UploadCloud className="w-12 h-12 text-geek-blue" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-geek-dark">Arraste seu CV ou clique aqui</p>
                    <p className="text-sm text-geek-text mt-2 font-medium">Suportamos PDF, DOCX ou TXT</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
             ) : (
                <div className="w-full bg-white border border-geek-border shadow-soft rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-geek-border">
                       <div className="flex items-center gap-5">
                          <div className="bg-green-100 p-3 rounded-xl border border-green-200">
                             <FileText className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-geek-dark text-lg">{fileName}</p>
                            <p className="text-sm text-green-600 font-bold flex items-center gap-1.5 mt-1">
                              <CheckCircle2 className="w-4 h-4" /> Pronto para análise
                            </p>
                          </div>
                       </div>
                       <button 
                         onClick={() => { setResumeText(''); setFileName(null); }}
                         className="text-geek-text hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                       >
                         <X className="w-6 h-6" />
                       </button>
                    </div>

                    <div className="bg-geek-gray rounded-xl p-1 mb-8 border border-geek-border">
                       <div className="flex items-center justify-between px-3 py-2">
                          <label className="text-xs font-bold text-geek-dark uppercase flex items-center gap-1.5">
                            <Edit2 className="w-3 h-3 text-geek-blue"/> Edite o conteúdo se necessário
                          </label>
                       </div>
                       <textarea 
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="w-full h-48 p-4 text-sm bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-geek-blue/20 text-geek-dark font-mono resize-none leading-relaxed"
                          placeholder="Cole o texto do seu currículo aqui..."
                       />
                    </div>

                    <button
                      onClick={handleFindMatches}
                      className="w-full bg-geek-blue hover:bg-geek-blueHover text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
                    >
                      <Search className="w-6 h-6" />
                      Encontrar Minhas Vagas
                    </button>
                </div>
             )}
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl">
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">1</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">Upload Simples</h3>
                <p className="text-sm text-geek-text leading-relaxed">Não perca tempo preenchendo formulários. Seu CV é tudo que precisamos.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">2</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">IA TalentMatch</h3>
                <p className="text-sm text-geek-text leading-relaxed">Nossa tecnologia cruza suas skills técnicas e comportamentais com o mercado.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">3</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">Feedback Real</h3>
                <p className="text-sm text-geek-text leading-relaxed">Receba um ranking de aderência e dicas para evoluir sua carreira.</p>
             </div>
          </div>
        </div>
      )}

      {/* STEP 2: RESULTS */}
      {step === 'results' && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-geek-dark">Vagas Compatíveis</h2>
                <p className="text-geek-text mt-1">Encontramos as seguintes oportunidades para <span className="font-semibold text-geek-dark">{fileName}</span></p>
              </div>
              <button 
                onClick={resetProcess}
                className="text-sm font-semibold text-geek-text hover:text-geek-blue border border-geek-border bg-white px-5 py-2.5 rounded-lg hover:border-geek-blue transition-colors shadow-sm"
              >
                Analisar outro perfil
              </button>
           </div>

           {matches.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-geek-border shadow-soft">
                <div className="bg-geek-gray w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-geek-text" />
                </div>
                <h3 className="text-2xl font-bold text-geek-dark">Nenhuma vaga encontrada</h3>
                <p className="text-geek-text mt-3 max-w-md mx-auto leading-relaxed">
                  Não encontramos vagas com match acima de 40% no momento. Tente detalhar mais suas experiências no currículo.
                </p>
                <button onClick={resetProcess} className="mt-8 px-6 py-3 bg-geek-blue text-white rounded-xl font-bold hover:bg-geek-blueHover transition-colors">Tentar novamente</button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {matches.map((match, idx) => {
                  const job = jobs.find(j => j.id === match.jobId);
                  if (!job) return null;
                  
                  return (
                    <div 
                      key={job.id} 
                      className="bg-white rounded-2xl shadow-card border border-geek-border p-7 hover:shadow-soft transition-all hover:-translate-y-1 flex flex-col h-full relative overflow-hidden group"
                    >
                      {idx === 0 && match.matchScore > 80 && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl shadow-sm z-10 tracking-wider">
                           RECOMENDADO
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <span className="inline-block px-2.5 py-1 bg-geek-gray rounded-md text-[10px] uppercase tracking-wider text-geek-text font-bold mb-2">{job.department}</span>
                            <h3 className="font-bold text-xl text-geek-dark leading-tight">{job.title}</h3>
                         </div>
                         <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border-2 ${getScoreColor(match.matchScore)} shadow-sm shrink-0 ml-4`}>
                            <span className="text-lg font-bold">{match.matchScore}</span>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-geek-text">
                         <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {job.location.city}, {job.location.state}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" /> {job.type.join('/')}
                         </div>
                      </div>

                      <p className="text-sm text-geek-text mb-6 line-clamp-3 leading-relaxed flex-grow border-t border-geek-border pt-4 mt-2">
                        {match.reason}
                      </p>

                      <div className="mt-auto">
                        <button 
                          onClick={() => handleViewDetail(job.id)}
                          className="w-full py-3 rounded-xl bg-geek-blue text-white font-bold hover:bg-geek-blueHover transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                          Ver Detalhes e Aplicar <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}

      {/* STEP 4: PREFERENCES (New Step) */}
      {step === 'preferences' && selectedJob && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
           <button 
            onClick={() => setStep('detail')}
            className="mb-8 flex items-center gap-2 text-geek-text hover:text-geek-blue transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg border border-geek-border shadow-sm w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          
          <div className="bg-white rounded-2xl shadow-card border border-geek-border p-8">
              <h2 className="text-2xl font-bold text-geek-dark mb-2">Preferências de Trabalho</h2>
              <p className="text-geek-text mb-8">Para finalizar sua candidatura na vaga de <strong>{selectedJob.title}</strong>, selecione o que se encaixa no seu perfil.</p>

              <div className="space-y-6">
                 <div>
                    <label className="block font-bold text-geek-dark mb-3">Quais modelos de trabalho você aceita?</label>
                    <div className="flex flex-wrap gap-3">
                        {['Presencial', 'Híbrido', 'Remoto'].map(option => (
                            <button
                                key={option}
                                onClick={() => togglePreference('workModels', option)}
                                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                    preferences.workModels.includes(option)
                                    ? 'bg-geek-blue text-white border-geek-blue'
                                    : 'bg-white text-geek-text border-geek-border hover:border-geek-blue'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="block font-bold text-geek-dark mb-3">Quais tipos de contrato você aceita?</label>
                    <div className="flex flex-wrap gap-3">
                        {['CLT', 'PJ', 'Cooperado', 'Estágio'].map(option => (
                            <button
                                key={option}
                                onClick={() => togglePreference('contractTypes', option)}
                                className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                    preferences.contractTypes.includes(option)
                                    ? 'bg-geek-blue text-white border-geek-blue'
                                    : 'bg-white text-geek-text border-geek-border hover:border-geek-blue'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleApply}
                disabled={isApplying || preferences.workModels.length === 0 || preferences.contractTypes.length === 0}
                className="mt-10 w-full bg-geek-blue hover:bg-geek-blueHover text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                    </>
                ) : (
                    <>
                      Confirmar Candidatura <Send className="w-5 h-5" />
                    </>
                )}
              </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAIL */}
      {step === 'detail' && selectedJob && analysisResult && (
        <div className="animate-in slide-in-from-right-8 duration-500">
          <button 
            onClick={() => setStep('results')}
            className="mb-8 flex items-center gap-2 text-geek-text hover:text-geek-blue transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg border border-geek-border shadow-sm w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para resultados
          </button>

          {/* Success Application Message */}
          {applicationSuccess && (
             <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 shadow-soft">
                <div className="bg-green-100 p-4 rounded-full mb-4 ring-4 ring-green-50">
                   <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800">Candidatura Enviada!</h3>
                <p className="text-green-700 mt-2 max-w-lg font-medium">
                   Seu perfil foi enviado com sucesso para a vaga de {selectedJob.title}. Boa sorte!
                </p>
             </div>
          )}

          <div className="bg-white rounded-2xl border border-geek-border p-8 mb-8 shadow-card">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-geek-dark mb-2">{selectedJob.title}</h1>
                    <div className="flex items-center gap-4 text-geek-text text-sm">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location.city}, {selectedJob.location.state}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedJob.type.join(' / ')}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="px-4 py-1.5 bg-geek-gray rounded-lg text-sm font-bold text-geek-text border border-geek-border">{selectedJob.department}</span>
                    <div className="flex gap-2">
                        {selectedJob.contractType.map(c => (
                            <span key={c} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold uppercase">{c}</span>
                        ))}
                    </div>
                </div>
             </div>
             <p className="text-geek-text leading-relaxed text-lg max-w-5xl whitespace-pre-line">{selectedJob.description}</p>
          </div>

          <AnalysisCard result={analysisResult} />

          <div className="mt-10 flex flex-col md:flex-row justify-end items-center gap-4 pb-10">
             {!applicationSuccess ? (
               <>
                  <button 
                     onClick={() => setShowInterviewModal(true)}
                     className="bg-white text-geek-blue border-2 border-geek-blue hover:bg-geek-blue/5 px-8 py-4 rounded-xl font-bold shadow-sm transition-all flex items-center gap-3 text-lg w-full md:w-auto justify-center"
                  >
                     <Mic2 className="w-5 h-5" />
                     Simular Entrevista
                  </button>
                  <button 
                    onClick={handlePreApply}
                    className="bg-geek-blue hover:bg-geek-blueHover text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 flex items-center gap-3 text-lg w-full md:w-auto justify-center"
                  >
                     Candidatar-se <ArrowRight className="w-5 h-5" />
                  </button>
               </>
             ) : (
               <button 
                  disabled
                  className="bg-geek-gray text-geek-text border border-geek-border px-8 py-3 rounded-xl font-bold cursor-default flex items-center gap-2"
               >
                  Já Inscrito
               </button>
             )}
          </div>

          {/* Interview Modal */}
          {showInterviewModal && (
            <InterviewModal 
               job={selectedJob} 
               resumeText={resumeText} 
               onClose={() => setShowInterviewModal(false)} 
            />
          )}

        </div>
      )}
    </div>
  );
};

export default CandidatePortal;