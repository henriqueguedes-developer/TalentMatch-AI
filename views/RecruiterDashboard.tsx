
import React, { useState, useRef, useEffect } from 'react';
import { Job, Candidate } from '../types';
import { analyzeResume, extractTextFromFile } from '../services/geminiService';
import AnalysisCard from '../components/AnalysisCard';
import { useAppContext } from '../contexts/AppContext';
import { BRAZIL_STATES } from '../constants';
import { Search, Users, Loader2, Filter, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, History, Sparkles, Plus, Save, X, UploadCloud, FileText, Mail, MapPin, Briefcase, ListChecks, Star, BrainCircuit, Clock, DollarSign } from 'lucide-react';

const RecruiterDashboard: React.FC = () => {
  const { jobs, addJob, applications, addApplication } = useAppContext();
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View States
  const [analysisView, setAnalysisView] = useState<Candidate | null>(null);
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  // Filter & Sort States
  const [filterTerm, setFilterTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'Alta Prioridade', 'Considerar', 'Baixa Prioridade'
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Form state for new job
  const [newJobData, setNewJobData] = useState<{
    title: string;
    department: string;
    city: string;
    state: string;
    type: string[];
    contractType: string[];
    description: string;
    schedule: string;
  }>({
    title: '',
    department: '',
    city: '',
    state: '',
    type: [],
    contractType: [],
    description: '',
    schedule: ''
  });
  
  // Text area inputs for lists
  const [requirementsInput, setRequirementsInput] = useState('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('');
  const [differentialsInput, setDifferentialsInput] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');

  // Form state for manual candidate
  const [manualCandidate, setManualCandidate] = useState({
    name: '',
    email: '',
    resumeText: '',
    fileName: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to load real applications when selected job changes
  useEffect(() => {
    if (selectedJob) {
      // Filter real applications for this job
      const realApps = applications.filter(app => app.jobId === selectedJob.id);
      
      // If we have existing candidates (simulated), merge them. 
      setCandidates(prev => {
        // Keep simulated ones that are NOT in realApps (by ID check or logic)
        const currentIds = new Set(realApps.map(r => r.id));
        const keptSimulated = prev.filter(p => !currentIds.has(p.id) && p.jobId === selectedJob.id); 
        
        return [...realApps, ...keptSimulated];
      });
      
      // Reset filters
      setFilterTerm('');
      setFilterStatus('all');
      setSortDirection('desc');
    }
  }, [selectedJob, applications]);

  // Derived state for filtered and sorted candidates
  const filteredAndSortedCandidates = React.useMemo(() => {
    let result = [...candidates];

    // 1. Filter by Search Term (Name or Email)
    if (filterTerm) {
      const lowerTerm = filterTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lowerTerm) || 
        c.email.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter by Status/Recommendation
    if (filterStatus !== 'all') {
      result = result.filter(c => c.analysis?.recommendation === filterStatus);
    }

    // 3. Sort by Score
    result.sort((a, b) => {
      const scoreA = a.analysis?.overallScore || 0;
      const scoreB = b.analysis?.overallScore || 0;
      return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

    return result;
  }, [candidates, filterTerm, filterStatus, sortDirection]);

  const handleCreateJob = () => {
    if (!newJobData.title || !newJobData.description || !newJobData.state) return;

    const parseList = (text: string) => text.split('\n').filter(r => r.trim() !== '');

    const newJob: Job = {
      id: Date.now().toString(),
      title: newJobData.title,
      department: newJobData.department || 'Geral',
      location: {
        city: newJobData.city,
        state: newJobData.state
      },
      type: newJobData.type.length > 0 ? newJobData.type : ['Presencial'],
      contractType: newJobData.contractType.length > 0 ? newJobData.contractType : ['CLT'],
      description: newJobData.description,
      schedule: newJobData.schedule,
      requirements: parseList(requirementsInput),
      responsibilities: parseList(responsibilitiesInput),
      differentials: parseList(differentialsInput),
      softSkills: parseList(softSkillsInput),
    };

    addJob(newJob);
    setIsCreatingJob(false);
    setSelectedJob(newJob);
    setCandidates([]);
    
    // Reset form
    setNewJobData({ title: '', department: '', city: '', state: '', type: [], contractType: [], description: '', schedule: '' });
    setRequirementsInput('');
    setResponsibilitiesInput('');
    setDifferentialsInput('');
    setSoftSkillsInput('');
  };

  const toggleSelection = (field: 'type' | 'contractType', value: string) => {
    setNewJobData(prev => {
      const current = prev[field];
      const exists = current.includes(value);
      if (exists) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setManualCandidate(prev => ({ ...prev, fileName: file.name }));
    setLoading(true);

    try {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setManualCandidate(prev => ({ ...prev, resumeText: e.target?.result as string }));
          setLoading(false);
        };
        reader.readAsText(file);
      } else {
        // Use Gemini to extract text real time
        const extractedText = await extractTextFromFile(file);
        setManualCandidate(prev => ({ 
          ...prev, 
          resumeText: extractedText
        }));
        setLoading(false);
      }
    } catch (error) {
      alert("Erro ao ler arquivo. Verifique se é um formato suportado.");
      setLoading(false);
    }
  };

  const handleManualCandidateSubmit = async () => {
    if (!selectedJob || !manualCandidate.resumeText) return;

    setLoading(true);
    try {
      const analysis = await analyzeResume(selectedJob, manualCandidate.resumeText);
      const newCandidate: Candidate = {
        id: `m${Date.now()}`,
        name: manualCandidate.name,
        email: manualCandidate.email,
        fileName: manualCandidate.fileName,
        resumeText: manualCandidate.resumeText,
        analysis,
        jobId: selectedJob.id
      };
      
      // Use function from context that is now passed as prop or imported
      addApplication(newCandidate);

      setIsAddingCandidate(false);
      setManualCandidate({ name: '', email: '', resumeText: '', fileName: '' });
    } catch (error) {
      alert("Erro na análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const simulateBatchProcessing = async () => {
    if (!selectedJob) return;
    setLoading(true);
    
    const realApps = applications.filter(app => app.jobId === selectedJob.id);

    // Mock candidates but now we will re-analyze them to get dynamic results if needed
    // Or just static mock with correct jobId
    const rawCandidates: Candidate[] = [
      {
        id: 'c1',
        name: 'Carlos Silva',
        email: 'carlos.silva@email.com',
        fileName: 'CV_Carlos_Silva_2024.pdf',
        resumeText: `Desenvolvedor Full Stack com 6 anos de experiência. Forte em React, Node.js e PostgreSQL. Liderei migração de monólito para microsserviços. Inglês fluente.`,
        history: [
          { date: '15/01/2024', overallScore: 72, recommendation: 'Considerar' },
          { date: '10/03/2024', overallScore: 78, recommendation: 'Considerar' }
        ],
        jobId: selectedJob.id
      },
      {
        id: 'c2',
        name: 'Ana Souza',
        email: 'ana.souza@email.com',
        fileName: 'Ana_Souza_Resume.docx',
        resumeText: `Formada em Marketing. Fiz um bootcamp de React há 6 meses. Tenho experiência com vendas e atendimento ao cliente. Busco primeira oportunidade como dev junior.`,
        jobId: selectedJob.id
      }
    ];

    try {
      const analyzedSimulations = await Promise.all(
        rawCandidates.map(async (candidate) => {
          const analysis = await analyzeResume(selectedJob, candidate.resumeText);
          return { ...candidate, analysis };
        })
      );
      
      setCandidates([...realApps, ...analyzedSimulations]);
    } catch (error) {
      alert("Erro ao processar candidatos. Verifique sua API Key.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeColor = (rec: string) => {
      switch(rec) {
          case 'Alta Prioridade': return 'bg-green-100 text-green-800 border-green-200';
          case 'Considerar': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-red-100 text-red-800 border-red-200';
      }
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (analysisView && analysisView.analysis) {
      return (
          <div className="animate-in fade-in duration-300">
              <button 
                onClick={() => setAnalysisView(null)}
                className="mb-6 text-geek-text hover:text-geek-blue font-medium flex items-center gap-2 transition-colors"
              >
                  &larr; Voltar para lista
              </button>
              
              <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-geek-dark mb-2">Análise de {analysisView.name}</h2>
                    <div className="flex items-center gap-2 text-geek-text">
                       <span className="bg-white px-3 py-1 rounded-full border border-geek-border text-sm font-medium shadow-sm">
                         {selectedJob?.title}
                       </span>
                    </div>
                </div>
              </div>

              <AnalysisCard result={analysisView.analysis} />
              
              {/* History Table */}
              {analysisView.history && analysisView.history.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-card border border-geek-border overflow-hidden">
                   <div className="p-6 border-b border-geek-border">
                    <h3 className="text-lg font-bold text-geek-dark flex items-center gap-2">
                      <History className="w-5 h-5 text-geek-blue" />
                      Histórico de Análises
                    </h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-geek-gray">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Data</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Classificação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {analysisView.history.map((item, idx) => (
                          <tr key={idx} className="hover:bg-geek-gray/30">
                            <td className="px-6 py-4 text-sm text-geek-dark font-medium">{item.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-geek-text">{item.overallScore}%</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getBadgeColor(item.recommendation)}`}>
                                {item.recommendation}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Preferences Section (New) */}
              {analysisView.preferences && (
                <div className="mt-8 bg-white p-6 rounded-xl border border-geek-border shadow-card">
                  <h3 className="font-bold mb-4 text-geek-dark flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-geek-blue" />
                    Preferências do Candidato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-xs font-bold text-geek-text uppercase">Modelos de Trabalho</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysisView.preferences.workModels.map(m => (
                          <span key={m} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-geek-text uppercase">Tipos de Contrato</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {analysisView.preferences.contractTypes.map(c => (
                          <span key={c} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{c}</span>
                        ))}
                      </div>
                    </div>
                     {analysisView.preferences.salaryExpectation && (
                       <div>
                          <span className="text-xs font-bold text-geek-text uppercase">Pretensão Salarial</span>
                          <p className="flex items-center gap-1 mt-2 text-geek-dark font-bold text-lg">
                             <span className="text-xs text-geek-text">R$</span> {analysisView.preferences.salaryExpectation}
                          </p>
                       </div>
                     )}
                  </div>
                </div>
              )}

              <div className="mt-8 bg-white p-6 rounded-xl border border-geek-border shadow-card">
                  <h3 className="font-bold mb-4 text-geek-dark flex items-center gap-2">
                    <FileText className="w-5 h-5 text-geek-blue" />
                    Currículo Original
                  </h3>
                  <div className="bg-geek-gray/50 rounded-lg p-6 border border-geek-border">
                    <p className="text-geek-text font-mono text-sm whitespace-pre-line leading-relaxed">
                      {analysisView.resumeText}
                    </p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-140px)]">
      
      {/* Modal Style Detail */}
      {modalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-geek-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-all border border-geek-border">
            <div className="flex justify-between items-center p-6 border-b border-geek-border bg-gray-50/50">
               <h3 className="text-lg font-bold text-geek-dark">Detalhes do Candidato</h3>
               <button 
                 onClick={() => setModalCandidate(null)}
                 className="text-gray-400 hover:text-geek-dark hover:bg-gray-200 p-2 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-5">
                 <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-geek-blue to-blue-400 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-200">
                    {modalCandidate.name.charAt(0)}
                 </div>
                 <div>
                   <h4 className="text-2xl font-bold text-geek-dark">{modalCandidate.name}</h4>
                   <p className="text-sm text-geek-text font-mono mt-1">ID: {modalCandidate.id}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-geek-gray rounded-xl border border-geek-border">
                    <div className="bg-white p-2 rounded-lg text-geek-blue">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs text-geek-text uppercase font-bold tracking-wider">Email</p>
                       <p className="text-geek-dark font-medium">{modalCandidate.email}</p>
                    </div>
                 </div>
                 
                 {modalCandidate.preferences && (
                   <div className="p-4 bg-geek-gray rounded-xl border border-geek-border">
                      <p className="text-xs text-geek-text uppercase font-bold tracking-wider mb-2">Preferências</p>
                      <div className="flex flex-wrap gap-2">
                        {modalCandidate.preferences.workModels.map(m => (
                          <span key={m} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{m}</span>
                        ))}
                        {modalCandidate.preferences.contractTypes.map(c => (
                          <span key={c} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{c}</span>
                        ))}
                      </div>
                      {modalCandidate.preferences.salaryExpectation && (
                         <div className="mt-3 pt-3 border-t border-geek-border/50">
                            <span className="text-xs font-bold text-geek-text uppercase">Pretensão Salarial</span>
                            <p className="font-bold text-geek-dark text-lg flex items-center gap-1">
                               <span className="text-xs text-geek-text">R$</span>
                               {modalCandidate.preferences.salaryExpectation}
                            </p>
                         </div>
                      )}
                   </div>
                 )}

                 {modalCandidate.analysis && (
                   <div className="pt-2">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-geek-text uppercase">Score de Aderência</span>
                        <span className={`text-2xl font-bold ${getScoreColor(modalCandidate.analysis.overallScore)}`}>
                          {modalCandidate.analysis.overallScore}%
                        </span>
                      </div>
                      <div className="w-full bg-geek-border rounded-full h-3">
                         <div 
                           className={`h-3 rounded-full transition-all duration-1000 ${modalCandidate.analysis.overallScore >= 80 ? 'bg-green-500' : modalCandidate.analysis.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                           style={{ width: `${modalCandidate.analysis.overallScore}%` }}
                         ></div>
                      </div>
                   </div>
                 )}
              </div>
            </div>

            <div className="p-6 border-t border-geek-border bg-gray-50/50 flex justify-end gap-3">
               <button 
                  onClick={() => setModalCandidate(null)}
                  className="px-5 py-2.5 text-geek-text hover:bg-geek-gray rounded-lg font-semibold text-sm transition-colors"
               >
                 Fechar
               </button>
               <button 
                  onClick={() => {
                    setAnalysisView(modalCandidate);
                    setModalCandidate(null);
                  }}
                  className="px-5 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors shadow-soft"
               >
                 Ver Análise Completa <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Job List */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-card border border-geek-border p-5 sticky top-24">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-geek-dark">Vagas Abertas</h2>
             <button 
                onClick={() => { setIsCreatingJob(true); setIsAddingCandidate(false); setSelectedJob(null); }}
                className="p-2 rounded-lg bg-geek-blue text-white hover:bg-geek-blueHover transition-colors shadow-sm"
                title="Nova Vaga"
             >
               <Plus className="w-5 h-5" />
             </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-geek-text" />
            <input 
              type="text" 
              placeholder="Buscar vagas..." 
              className="w-full pl-9 pr-4 py-2.5 bg-geek-gray border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-geek-blue focus:ring-1 focus:ring-geek-blue transition-all"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {jobs.map(job => (
              <div 
                key={job.id}
                onClick={() => { setSelectedJob(job); setIsCreatingJob(false); setIsAddingCandidate(false); setCandidates([]); }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedJob?.id === job.id 
                  ? 'bg-alice-blue border-geek-blue shadow-sm ring-1 ring-geek-blue/10' 
                  : 'bg-white border-transparent hover:bg-geek-gray hover:border-geek-border'
                }`}
              >
                <h3 className={`font-semibold text-sm ${selectedJob?.id === job.id ? 'text-geek-blue' : 'text-geek-dark'}`}>{job.title}</h3>
                <p className="text-xs text-geek-text mt-1 font-medium">{job.department} • {job.location.city}/{job.location.state}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                   {job.type.map(t => (
                      <span key={t} className="text-[10px] uppercase font-bold bg-geek-gray text-geek-text px-2 py-1 rounded-md">{t}</span>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {isCreatingJob ? (
          <div className="bg-white rounded-xl shadow-card border border-geek-border p-8 animate-in fade-in slide-in-from-bottom-4">
             {/* ... Creating Job Form ... */}
             <div className="flex justify-between items-center mb-8 border-b border-geek-border pb-4">
              <h2 className="text-2xl font-bold text-geek-dark">Cadastrar Nova Vaga</h2>
              <button onClick={() => setIsCreatingJob(false)} className="text-geek-text hover:text-geek-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-geek-dark border-l-4 border-geek-blue pl-3">Informações Básicas</h3>
                
                <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Título da Vaga</label>
                  <input 
                    type="text" 
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="Ex: Desenvolvedor(a) Full Stack Sênior"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-geek-dark mb-2">Departamento</label>
                    <input 
                      type="text" 
                      value={newJobData.department}
                      onChange={(e) => setNewJobData({...newJobData, department: e.target.value})}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                      placeholder="Ex: Engenharia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-geek-dark mb-2">Horário de Trabalho</label>
                    <input 
                      type="text" 
                      value={newJobData.schedule}
                      onChange={(e) => setNewJobData({...newJobData, schedule: e.target.value})}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                      placeholder="Ex: Seg-Sex, 08h às 17h"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-bold text-geek-dark mb-2">Cidade</label>
                     <input 
                        type="text" 
                        value={newJobData.city}
                        onChange={(e) => setNewJobData({...newJobData, city: e.target.value})}
                        className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                        placeholder="São Paulo"
                      />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-geek-dark mb-2">Estado</label>
                     <select
                        value={newJobData.state}
                        onChange={(e) => setNewJobData({...newJobData, state: e.target.value})}
                        className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                      >
                        <option value="">Selecione...</option>
                        {BRAZIL_STATES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-sm font-bold text-geek-dark mb-2">Modelo de Trabalho</label>
                      <div className="space-y-2 bg-geek-gray p-3 rounded-lg border border-geek-border">
                         {['Presencial', 'Híbrido', 'Remoto'].map(option => (
                           <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newJobData.type.includes(option)}
                                onChange={() => toggleSelection('type', option)}
                                className="w-4 h-4 text-geek-blue rounded border-geek-border focus:ring-geek-blue"
                              />
                              <span className="text-sm text-geek-dark">{option}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-geek-dark mb-2">Tipo de Contrato</label>
                      <div className="space-y-2 bg-geek-gray p-3 rounded-lg border border-geek-border">
                         {['CLT', 'PJ', 'Cooperado', 'Estágio'].map(option => (
                           <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newJobData.contractType.includes(option)}
                                onChange={() => toggleSelection('contractType', option)}
                                className="w-4 h-4 text-geek-blue rounded border-geek-border focus:ring-geek-blue"
                              />
                              <span className="text-sm text-geek-dark">{option}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Descrição da Vaga</label>
                  <textarea 
                    rows={4}
                    value={newJobData.description}
                    onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="Visão geral e contexto da oportunidade..."
                  />
                </div>
              </div>

              {/* Requirements & Details Section */}
              <div className="space-y-6 pt-6 border-t border-geek-border">
                <h3 className="text-lg font-bold text-geek-dark border-l-4 border-geek-blue pl-3">Detalhes Técnicos & Perfil</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                       <ListChecks className="w-4 h-4 text-geek-blue" /> Responsabilidades (um por linha)
                    </label>
                    <textarea 
                      rows={5}
                      value={responsibilitiesInput}
                      onChange={(e) => setResponsibilitiesInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Liderar equipe&#10;- Desenvolver APIs"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <BrainCircuit className="w-4 h-4 text-red-500" /> Requisitos Obrigatórios (um por linha)
                    </label>
                    <textarea 
                      rows={5}
                      value={requirementsInput}
                      onChange={(e) => setRequirementsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Angular 12+&#10;- C# Avançado"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <Star className="w-4 h-4 text-yellow-500" /> Diferenciais / Bônus (um por linha)
                    </label>
                    <textarea 
                      rows={5}
                      value={differentialsInput}
                      onChange={(e) => setDifferentialsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Conhecimento em AWS&#10;- Redis"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <Users className="w-4 h-4 text-purple-500" /> Soft Skills / Comportamental (um por linha)
                    </label>
                    <textarea 
                      rows={5}
                      value={softSkillsInput}
                      onChange={(e) => setSoftSkillsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Proatividade&#10;- Boa comunicação"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-geek-border flex justify-end gap-4">
                <button 
                  onClick={() => setIsCreatingJob(false)}
                  className="px-6 py-2.5 text-geek-text bg-white border border-geek-border hover:bg-geek-gray rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateJob}
                  disabled={!newJobData.title || !newJobData.description}
                  className="px-6 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 shadow-soft"
                >
                  <Save className="w-4 h-4" />
                  Salvar Vaga
                </button>
              </div>
            </div>
          </div>
        ) : isAddingCandidate ? (
          <div className="bg-white rounded-xl shadow-card border border-geek-border p-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Same candidate form, just keeping the structure correct */}
            <div className="flex justify-between items-center mb-8 border-b border-geek-border pb-4">
              <div>
                <h2 className="text-2xl font-bold text-geek-dark">Adicionar Candidato</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-geek-text">para a vaga:</span>
                  <span className="text-sm font-semibold text-geek-blue bg-geek-blue/10 px-2 py-0.5 rounded">{selectedJob?.title}</span>
                </div>
              </div>
              <button onClick={() => setIsAddingCandidate(false)} className="text-geek-text hover:text-geek-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
               {/* ... (Keep existing candidate input fields) ... */}
              <div className="grid grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    value={manualCandidate.name}
                    onChange={(e) => setManualCandidate({...manualCandidate, name: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="João Silva"
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Email</label>
                  <input 
                    type="email" 
                    value={manualCandidate.email}
                    onChange={(e) => setManualCandidate({...manualCandidate, email: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="joao@email.com"
                  />
                 </div>
              </div>
               
               {/* Upload Section */}
              <div>
                <label className="block text-sm font-bold text-geek-dark mb-3">Upload do Currículo</label>
                {!manualCandidate.fileName ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-geek-blue/30 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-geek-blue/5 hover:border-geek-blue transition-all group"
                  >
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-8 h-8 text-geek-blue" />
                    </div>
                    <p className="text-base text-geek-dark font-semibold">Clique para fazer upload</p>
                    <p className="text-sm text-geek-text mt-1">PDF, DOCX ou TXT</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </div>
                ) : (
                  <div className="bg-geek-gray border border-geek-border rounded-xl p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg text-geek-blue border border-geek-border">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-geek-dark">{manualCandidate.fileName}</p>
                          <p className="text-xs text-geek-text">Pronto para análise</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setManualCandidate({...manualCandidate, fileName: '', resumeText: ''})}
                       className="p-2 hover:bg-white rounded-lg text-geek-text hover:text-red-500 transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                )}
              </div>
               
               {/* Extracted Text */}
              {manualCandidate.resumeText && !loading && (
                 <div>
                    <label className="block text-sm font-bold text-geek-dark mb-2">Conteúdo Extraído (Editável)</label>
                    <textarea 
                      value={manualCandidate.resumeText}
                      onChange={(e) => setManualCandidate({...manualCandidate, resumeText: e.target.value})}
                      className="w-full h-40 p-4 text-sm bg-geek-gray border border-geek-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-geek-blue/20"
                    />
                 </div>
              )}
              
              {loading && (
                <div className="bg-geek-gray border border-geek-border rounded-xl p-6 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-geek-blue animate-spin mb-2" />
                    <p className="text-geek-dark font-semibold">Lendo documento...</p>
                </div>
              )}

              <div className="pt-6 border-t border-geek-border flex justify-end gap-4">
                <button 
                  onClick={() => setIsAddingCandidate(false)}
                  className="px-6 py-2.5 text-geek-text bg-white border border-geek-border hover:bg-geek-gray rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleManualCandidateSubmit}
                  disabled={loading || !manualCandidate.resumeText || !manualCandidate.name}
                  className="px-6 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 shadow-soft"
                >
                   {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                   Analisar Candidato
                </button>
              </div>
            </div>
          </div>
        ) : !selectedJob ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-card border border-geek-border min-h-[400px]">
            <div className="bg-geek-gray p-6 rounded-full mb-6">
               <Filter className="w-10 h-10 text-geek-text opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-geek-dark">Nenhuma vaga selecionada</h3>
            <p className="text-geek-text mt-2 max-w-sm">Selecione uma vaga no menu lateral para visualizar e gerenciar os candidatos ou crie uma nova oportunidade.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card border border-geek-border flex flex-col h-full min-h-[600px]">
            {/* Header Vaga */}
            <div className="p-8 border-b border-geek-border bg-white rounded-t-xl">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="text-2xl font-bold text-geek-dark">{selectedJob.title}</h1>
                       <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Ativa</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-geek-text text-sm mb-4">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location.city}, {selectedJob.location.state}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedJob.type.join(' / ')}</span>
                        {selectedJob.schedule && (
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedJob.schedule}</span>
                        )}
                    </div>
                    
                    <p className="text-geek-text max-w-3xl whitespace-pre-line mb-6">{selectedJob.description}</p>
                    
                    {/* Collapsible or Grid for extra details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-geek-gray/30 p-4 rounded-lg border border-geek-border">
                       <div>
                          <h4 className="font-bold text-geek-dark mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> Requisitos</h4>
                          <ul className="list-disc pl-4 text-geek-text space-y-0.5">
                             {selectedJob.requirements.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                             {selectedJob.requirements.length > 3 && <li>...e mais {selectedJob.requirements.length - 3}</li>}
                          </ul>
                       </div>
                       {selectedJob.responsibilities && (
                        <div>
                            <h4 className="font-bold text-geek-dark mb-1 flex items-center gap-1"><ListChecks className="w-3 h-3"/> Responsabilidades</h4>
                            <ul className="list-disc pl-4 text-geek-text space-y-0.5">
                              {selectedJob.responsibilities.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                              {selectedJob.responsibilities.length > 3 && <li>...e mais {selectedJob.responsibilities.length - 3}</li>}
                            </ul>
                        </div>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0 flex-col md:flex-row">
                    <button 
                      onClick={() => setIsAddingCandidate(true)}
                      className="flex items-center justify-center gap-2 bg-white border border-geek-border hover:bg-geek-gray text-geek-dark px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Candidato
                    </button>
                    <button 
                      onClick={simulateBatchProcessing}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-geek-dark hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-soft"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Users className="w-4 h-4" />}
                      {loading ? "Processando..." : "Simular Processo"}
                    </button>
                  </div>
               </div>
            </div>
            
            {/* Toolbar: Filters */}
            <div className="px-6 py-4 border-b border-geek-border bg-gray-50 flex flex-wrap gap-4 items-center">
               <div className="relative flex-1 min-w-[200px]">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-geek-text" />
                 <input 
                   type="text" 
                   value={filterTerm}
                   onChange={(e) => setFilterTerm(e.target.value)}
                   placeholder="Filtrar por nome ou email..." 
                   className="w-full pl-9 pr-4 py-2 bg-white border border-geek-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-geek-blue transition-all"
                 />
               </div>
               
               <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-geek-text" />
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                   className="py-2 pl-3 pr-8 bg-white border border-geek-border rounded-lg text-sm text-geek-dark focus:outline-none focus:ring-1 focus:ring-geek-blue cursor-pointer"
                 >
                   <option value="all">Todas as Classificações</option>
                   <option value="Alta Prioridade">Alta Prioridade</option>
                   <option value="Considerar">Considerar</option>
                   <option value="Baixa Prioridade">Baixa Prioridade</option>
                 </select>
               </div>
            </div>

            {/* Content Table */}
            <div className="flex-1 p-0 overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                   <div className="bg-geek-blue/10 p-4 rounded-full mb-4">
                     <Loader2 className="w-10 h-10 text-geek-blue animate-spin" />
                   </div>
                   <h3 className="text-lg font-bold text-geek-dark">Processando Candidatos...</h3>
                   <p className="text-geek-text text-sm mt-1">Nossa IA está analisando cada perfil.</p>
                </div>
              )}

              {candidates.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                   <Users className="w-16 h-16 text-geek-gray mb-4" />
                   <h3 className="text-lg font-bold text-geek-dark">Ainda não há candidatos</h3>
                   <p className="text-geek-text mt-2">Comece adicionando candidatos manualmente ou simulando o processo.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-geek-gray">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Candidato</th>
                        <th 
                          scope="col" 
                          onClick={toggleSort}
                          className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider cursor-pointer hover:text-geek-dark transition-colors group select-none"
                        >
                          <div className="flex items-center gap-1">
                            Score 
                            {sortDirection === 'desc' 
                              ? <ArrowDown className="w-3 h-3 text-geek-blue"/> 
                              : <ArrowUp className="w-3 h-3 text-geek-blue"/>
                            }
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Fit Técnico</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Fit Cultural</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredAndSortedCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-geek-text text-sm">
                            Nenhum candidato encontrado com os filtros atuais.
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedCandidates.map((candidate, idx) => {
                          const isTopMatch = idx === 0 && (candidate.analysis?.overallScore || 0) > 85 && sortDirection === 'desc' && filterTerm === '' && filterStatus === 'all';

                          return (
                            <tr 
                              key={candidate.id} 
                              onClick={() => setModalCandidate(candidate)}
                              className={`cursor-pointer transition-all hover:bg-geek-gray/40 border-l-4 ${
                                isTopMatch 
                                  ? 'bg-green-50/30 border-l-green-500' 
                                  : 'border-l-transparent'
                              }`}
                            >
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${idx === 0 && sortDirection === 'desc' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-geek-text'}`}>
                                    {candidate.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-bold text-geek-dark">{candidate.name}</div>
                                      {isTopMatch && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 tracking-wide">
                                          <Sparkles className="w-3 h-3 mr-1 fill-green-500" />
                                          Top
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-geek-text mt-0.5">{candidate.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span className={`text-lg font-bold ${getScoreColor(candidate.analysis?.overallScore || 0)}`}>
                                  {candidate.analysis?.overallScore}%
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex flex-col gap-1 w-28">
                                    <div className="flex justify-between text-xs font-medium text-geek-text">
                                      <span>Técnico</span>
                                      <span>{candidate.analysis?.technicalFit}%</span>
                                    </div>
                                    <div className="w-full bg-geek-border rounded-full h-1.5">
                                      <div className="bg-geek-blue h-1.5 rounded-full" style={{ width: `${candidate.analysis?.technicalFit}%` }}></div>
                                    </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex flex-col gap-1 w-28">
                                    <div className="flex justify-between text-xs font-medium text-geek-text">
                                      <span>Cultural</span>
                                      <span>{candidate.analysis?.culturalFit}%</span>
                                    </div>
                                    <div className="w-full bg-geek-border rounded-full h-1.5">
                                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${candidate.analysis?.culturalFit}%` }}></div>
                                    </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${getBadgeColor(candidate.analysis?.recommendation || '')}`}>
                                  {candidate.analysis?.recommendation}
                                </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-geek-text hover:text-geek-blue transition-colors bg-white p-2 rounded-lg border border-transparent hover:border-geek-border shadow-sm">
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
