
import React, { useState, useRef, useEffect } from 'react';
import { Job, Candidate, CandidatePreferences } from '../types';
import { analyzeResume, extractTextFromFile } from '../services/geminiService';
import AnalysisCard from '../components/AnalysisCard';
import { useAppContext } from '../contexts/AppContext';
import { BRAZIL_STATES } from '../constants';
import { Search, Users, Loader2, Filter, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, History, Sparkles, Plus, Save, X, UploadCloud, FileText, Mail, MapPin, Briefcase, ListChecks, Star, BrainCircuit, Clock, DollarSign, MessageSquare } from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all', 'High Priority', 'Consider', 'Low Priority'
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
    salaryRange: string;
    interviewRequired: boolean;
  }>({
    title: '',
    department: '',
    city: '',
    state: '',
    type: [],
    contractType: [],
    description: '',
    schedule: '',
    salaryRange: '',
    interviewRequired: false
  });
  
  // Text area inputs for lists
  const [requirementsInput, setRequirementsInput] = useState('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('');
  const [differentialsInput, setDifferentialsInput] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');

  // Form state for manual candidate
  const [manualCandidate, setManualCandidate] = useState<{
    name: string;
    email: string;
    resumeText: string;
    fileName: string;
    salaryExpectation: string;
    workModels: string[];
    contractTypes: string[];
  }>({
    name: '',
    email: '',
    resumeText: '',
    fileName: '',
    salaryExpectation: '',
    workModels: [],
    contractTypes: []
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
    if (!newJobData.title || !newJobData.description || !newJobData.state || !newJobData.salaryRange) return;

    const parseList = (text: string) => text.split('\n').filter(r => r.trim() !== '');

    const newJob: Job = {
      id: Date.now().toString(),
      title: newJobData.title,
      department: newJobData.department || 'General',
      location: {
        city: newJobData.city,
        state: newJobData.state
      },
      type: newJobData.type.length > 0 ? newJobData.type : ['On-site'],
      contractType: newJobData.contractType.length > 0 ? newJobData.contractType : ['Full-time'],
      description: newJobData.description,
      schedule: newJobData.schedule,
      salaryRange: newJobData.salaryRange,
      interviewRequired: newJobData.interviewRequired,
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
    setNewJobData({ title: '', department: '', city: '', state: '', type: [], contractType: [], description: '', schedule: '', salaryRange: '', interviewRequired: false });
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

  const toggleManualSelection = (field: 'workModels' | 'contractTypes', value: string) => {
    setManualCandidate(prev => {
        const current = prev[field];
        if (current.includes(value)) {
            return { ...prev, [field]: current.filter(i => i !== value) };
        } else {
            return { ...prev, [field]: [...current, value] };
        }
    });
  }

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
      alert("Error reading file. Check if format is supported.");
      setLoading(false);
    }
  };

  const handleManualCandidateSubmit = async () => {
    if (!selectedJob || !manualCandidate.resumeText || !manualCandidate.name) return;
    
    // Validate salary presence for manual entry if job has salary
    if (!manualCandidate.salaryExpectation) {
        alert("Salary Expectation is mandatory for match analysis.");
        return;
    }

    setLoading(true);
    try {
      const preferences: CandidatePreferences = {
          salaryExpectation: manualCandidate.salaryExpectation,
          workModels: manualCandidate.workModels,
          contractTypes: manualCandidate.contractTypes
      };

      const analysis = await analyzeResume(selectedJob, manualCandidate.resumeText, preferences);
      
      const newCandidate: Candidate = {
        id: `m${Date.now()}`,
        name: manualCandidate.name,
        email: manualCandidate.email,
        fileName: manualCandidate.fileName,
        resumeText: manualCandidate.resumeText,
        analysis,
        jobId: selectedJob.id,
        preferences: preferences
      };
      
      // Use function from context that is now passed as prop or imported
      addApplication(newCandidate);

      setIsAddingCandidate(false);
      setManualCandidate({ name: '', email: '', resumeText: '', fileName: '', salaryExpectation: '', workModels: [], contractTypes: [] });
    } catch (error) {
      alert("Analysis error. Please try again.");
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
        resumeText: `Full Stack Developer with 6 years experience. Strong in React, Node.js and PostgreSQL. Led migration from monolith to microservices. Fluent English.`,
        history: [
          { date: '15/01/2024', overallScore: 72, recommendation: 'Consider' },
          { date: '10/03/2024', overallScore: 78, recommendation: 'Consider' }
        ],
        jobId: selectedJob.id
      },
      {
        id: 'c2',
        name: 'Ana Souza',
        email: 'ana.souza@email.com',
        fileName: 'Ana_Souza_Resume.docx',
        resumeText: `Marketing Graduate. Did a React bootcamp 6 months ago. Experience with sales and customer support. Looking for first opportunity as junior dev.`,
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
      alert("Error processing candidates. Check your API Key.");
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
          case 'High Priority': return 'bg-green-100 text-green-800 border-green-200';
          case 'Consider': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
                  &larr; Back to list
              </button>
              
              <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-geek-dark mb-2">Analysis for {analysisView.name}</h2>
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
                      Analysis History
                    </h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-geek-gray">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Classification</th>
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
          </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-140px)]">
      
      {/* Modal Style Detail */}
      {modalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-geek-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-all border border-geek-border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-geek-border bg-gray-50/50 sticky top-0 bg-opacity-95 backdrop-blur">
               <h3 className="text-lg font-bold text-geek-dark">Candidate Details</h3>
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
                 
                 {/* Preferences and Salary Match */}
                 {modalCandidate.preferences && (
                   <div className="p-4 bg-geek-gray rounded-xl border border-geek-border space-y-3">
                      <div>
                        <p className="text-xs text-geek-text uppercase font-bold tracking-wider mb-2">Preferences</p>
                        <div className="flex flex-wrap gap-2">
                          {modalCandidate.preferences.workModels.map(m => (
                            <span key={m} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium">{m}</span>
                          ))}
                          {modalCandidate.preferences.contractTypes.map(c => (
                            <span key={c} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium">{c}</span>
                          ))}
                        </div>
                      </div>
                      
                      {modalCandidate.preferences.salaryExpectation && selectedJob?.salaryRange && (
                         <div className="mt-3 pt-3 border-t border-geek-border/50">
                            <span className="text-xs font-bold text-geek-text uppercase flex items-center gap-1"><DollarSign className="w-3 h-3"/> Salary Alignment</span>
                            <div className="flex justify-between items-center mt-2 bg-white p-2 rounded border border-gray-200">
                               <div className="text-right">
                                  <p className="text-xs text-geek-text">Expectation</p>
                                  <p className="font-bold text-geek-dark">R$ {modalCandidate.preferences.salaryExpectation}</p>
                               </div>
                               <div className="text-gray-300">vs</div>
                               <div>
                                  <p className="text-xs text-geek-text">Job Budget</p>
                                  <p className="font-bold text-green-600">{selectedJob.salaryRange}</p>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                 )}

                 {/* Interview Score Details */}
                 {modalCandidate.interviewResult && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                             <MessageSquare className="w-3 h-3"/> Simulated Interview
                           </span>
                           <span className="text-lg font-bold text-blue-800">{modalCandidate.interviewResult.score}/100</span>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed bg-white/50 p-2 rounded">
                          "{modalCandidate.interviewResult.feedback}"
                        </p>
                    </div>
                 )}

                 {modalCandidate.analysis && (
                   <div className="pt-2">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-geek-text uppercase">Adherence Score</span>
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

            <div className="p-6 border-t border-geek-border bg-gray-50/50 flex justify-end gap-3 sticky bottom-0">
               <button 
                  onClick={() => setModalCandidate(null)}
                  className="px-5 py-2.5 text-geek-text hover:bg-geek-gray rounded-lg font-semibold text-sm transition-colors"
               >
                 Close
               </button>
               <button 
                  onClick={() => {
                    setAnalysisView(modalCandidate);
                    setModalCandidate(null);
                  }}
                  className="px-5 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors shadow-soft"
               >
                 View Full Analysis <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Job List */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-card border border-geek-border p-5 sticky top-24">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-geek-dark">Open Positions</h2>
             <button 
                onClick={() => { setIsCreatingJob(true); setIsAddingCandidate(false); setSelectedJob(null); }}
                className="p-2 rounded-lg bg-geek-blue text-white hover:bg-geek-blueHover transition-colors shadow-sm"
                title="New Job"
             >
               <Plus className="w-5 h-5" />
             </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-geek-text" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
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
              <h2 className="text-2xl font-bold text-geek-dark">Register New Job</h2>
              <button onClick={() => setIsCreatingJob(false)} className="text-geek-text hover:text-geek-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-geek-dark border-l-4 border-geek-blue pl-3">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Job Title</label>
                  <input 
                    type="text" 
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="Ex: Senior Full Stack Developer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-geek-dark mb-2">Department</label>
                    <input 
                      type="text" 
                      value={newJobData.department}
                      onChange={(e) => setNewJobData({...newJobData, department: e.target.value})}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                      placeholder="Ex: Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-geek-dark mb-2">Salary Range (Mandatory)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3.5 text-geek-text text-sm font-bold">R$</span>
                        <input 
                        type="text" 
                        value={newJobData.salaryRange}
                        onChange={(e) => setNewJobData({...newJobData, salaryRange: e.target.value})}
                        className="w-full pl-10 p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                        placeholder="Ex: 8.000 - 12.000"
                        />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-bold text-geek-dark mb-2">City</label>
                     <input 
                        type="text" 
                        value={newJobData.city}
                        onChange={(e) => setNewJobData({...newJobData, city: e.target.value})}
                        className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                        placeholder="New York"
                      />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-geek-dark mb-2">State</label>
                     <select
                        value={newJobData.state}
                        onChange={(e) => setNewJobData({...newJobData, state: e.target.value})}
                        className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                      >
                        <option value="">Select...</option>
                        {BRAZIL_STATES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-sm font-bold text-geek-dark mb-2">Work Model</label>
                      <div className="space-y-2 bg-geek-gray p-3 rounded-lg border border-geek-border">
                         {['On-site', 'Hybrid', 'Remote'].map(option => (
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
                   <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-geek-dark mb-2">Contract Type</label>
                        <div className="space-y-2 bg-geek-gray p-3 rounded-lg border border-geek-border">
                            {['Full-time', 'Contractor', 'Freelancer', 'Internship'].map(option => (
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
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={newJobData.interviewRequired}
                              onChange={(e) => setNewJobData({...newJobData, interviewRequired: e.target.checked})}
                              className="w-4 h-4 text-geek-blue rounded border-geek-border focus:ring-geek-blue"
                            />
                            <span className="text-sm font-bold text-blue-900">Require AI Simulated Interview</span>
                         </label>
                         <p className="text-xs text-blue-700 mt-1 pl-6">Candidates will be encouraged to answer 5 technical questions.</p>
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Job Description</label>
                  <textarea 
                    rows={4}
                    value={newJobData.description}
                    onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="Overview and context of the opportunity..."
                  />
                </div>
              </div>

              {/* Requirements & Details Section */}
              <div className="space-y-6 pt-6 border-t border-geek-border">
                <h3 className="text-lg font-bold text-geek-dark border-l-4 border-geek-blue pl-3">Technical Details & Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                       <ListChecks className="w-4 h-4 text-geek-blue" /> Responsibilities (one per line)
                    </label>
                    <textarea 
                      rows={5}
                      value={responsibilitiesInput}
                      onChange={(e) => setResponsibilitiesInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Lead team&#10;- Develop APIs"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <BrainCircuit className="w-4 h-4 text-red-500" /> Mandatory Requirements (one per line)
                    </label>
                    <textarea 
                      rows={5}
                      value={requirementsInput}
                      onChange={(e) => setRequirementsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Angular 12+&#10;- Advanced C#"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <Star className="w-4 h-4 text-yellow-500" /> Differentials / Bonus (one per line)
                    </label>
                    <textarea 
                      rows={5}
                      value={differentialsInput}
                      onChange={(e) => setDifferentialsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- AWS Knowledge&#10;- Redis"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-geek-dark mb-2">
                      <Users className="w-4 h-4 text-purple-500" /> Soft Skills / Behavioral (one per line)
                    </label>
                    <textarea 
                      rows={5}
                      value={softSkillsInput}
                      onChange={(e) => setSoftSkillsInput(e.target.value)}
                      className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-mono text-sm"
                      placeholder="- Proactivity&#10;- Good communication"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-geek-border flex justify-end gap-4">
                <button 
                  onClick={() => setIsCreatingJob(false)}
                  className="px-6 py-2.5 text-geek-text bg-white border border-geek-border hover:bg-geek-gray rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateJob}
                  disabled={!newJobData.title || !newJobData.description || !newJobData.salaryRange}
                  className="px-6 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 shadow-soft"
                >
                  <Save className="w-4 h-4" />
                  Save Job
                </button>
              </div>
            </div>
          </div>
        ) : isAddingCandidate ? (
          <div className="bg-white rounded-xl shadow-card border border-geek-border p-8 animate-in fade-in slide-in-from-bottom-4">
             {/* ... Keep the same Add Candidate Logic, just ensure layout consistency ... */}
             <div className="flex justify-between items-center mb-8 border-b border-geek-border pb-4">
              <div>
                <h2 className="text-2xl font-bold text-geek-dark">Add Candidate</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-geek-text">for vacancy:</span>
                  <span className="text-sm font-semibold text-geek-blue bg-geek-blue/10 px-2 py-0.5 rounded">{selectedJob?.title}</span>
                </div>
              </div>
              <button onClick={() => setIsAddingCandidate(false)} className="text-geek-text hover:text-geek-dark transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
               {/* Candidate Input Fields */}
               <div className="grid grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={manualCandidate.name}
                    onChange={(e) => setManualCandidate({...manualCandidate, name: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                 </div>
                 <div>
                  <label className="block text-sm font-bold text-geek-dark mb-2">Email</label>
                  <input 
                    type="email" 
                    value={manualCandidate.email}
                    onChange={(e) => setManualCandidate({...manualCandidate, email: e.target.value})}
                    className="w-full p-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all"
                    placeholder="john@email.com"
                  />
                 </div>
              </div>

               {/* Manual Preferences Section */}
               <div className="bg-gray-50 p-6 rounded-xl border border-geek-border">
                  <h4 className="text-sm font-bold text-geek-dark uppercase mb-4 flex items-center gap-2">
                     <ListChecks className="w-4 h-4 text-geek-blue"/> Candidate Preferences
                  </h4>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-geek-text uppercase mb-2">Salary Expectation (Mandatory)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-geek-text font-bold text-xs">R$</span>
                            <input 
                              type="text" 
                              value={manualCandidate.salaryExpectation}
                              onChange={(e) => setManualCandidate({...manualCandidate, salaryExpectation: e.target.value})}
                              className="w-full pl-8 p-2 bg-white border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:outline-none text-sm"
                              placeholder="0,00"
                            />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-geek-text uppercase mb-2">Work Models Accepted</label>
                        <div className="flex flex-wrap gap-2">
                            {['On-site', 'Hybrid', 'Remote'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleManualSelection('workModels', option)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        manualCandidate.workModels.includes(option)
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
                        <label className="block text-xs font-bold text-geek-text uppercase mb-2">Contracts Accepted</label>
                        <div className="flex flex-wrap gap-2">
                            {['Full-time', 'Contractor', 'Freelancer', 'Internship'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleManualSelection('contractTypes', option)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        manualCandidate.contractTypes.includes(option)
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
               </div>

               {/* Upload Section */}
              <div>
                <label className="block text-sm font-bold text-geek-dark mb-3">Resume Upload</label>
                {!manualCandidate.fileName ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-geek-blue/30 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-geek-blue/5 hover:border-geek-blue transition-all group"
                  >
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                       <UploadCloud className="w-8 h-8 text-geek-blue" />
                    </div>
                    <p className="text-base text-geek-dark font-semibold">Click to upload</p>
                    <p className="text-sm text-geek-text mt-1">PDF, DOCX or TXT</p>
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
                          <p className="text-xs text-geek-text">Ready for analysis</p>
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
              
              <div className="pt-6 border-t border-geek-border flex justify-end gap-4">
                <button 
                  onClick={() => setIsAddingCandidate(false)}
                  className="px-6 py-2.5 text-geek-text bg-white border border-geek-border hover:bg-geek-gray rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleManualCandidateSubmit}
                  disabled={loading || !manualCandidate.resumeText || !manualCandidate.name || !manualCandidate.salaryExpectation}
                  className="px-6 py-2.5 bg-geek-blue hover:bg-geek-blueHover text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 shadow-soft"
                >
                   {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                   Analyze Candidate
                </button>
              </div>
            </div>
          </div>
        ) : !selectedJob ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-card border border-geek-border min-h-[400px]">
            <div className="bg-geek-gray p-6 rounded-full mb-6">
               <Filter className="w-10 h-10 text-geek-text opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-geek-dark">No vacancy selected</h3>
            <p className="text-geek-text mt-2 max-w-sm">Select a vacancy from the side menu to view and manage candidates or create a new opportunity.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card border border-geek-border flex flex-col h-full min-h-[600px]">
            {/* Header Vaga */}
            <div className="p-8 border-b border-geek-border bg-white rounded-t-xl">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h1 className="text-2xl font-bold text-geek-dark">{selectedJob.title}</h1>
                       <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Active</span>
                       {selectedJob.interviewRequired && (
                         <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase flex items-center gap-1">
                           <MessageSquare className="w-3 h-3"/> Interview Req.
                         </span>
                       )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-geek-text text-sm mb-4">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location.city}, {selectedJob.location.state}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {selectedJob.type.join(' / ')}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {selectedJob.salaryRange}</span>
                    </div>
                    
                    <p className="text-geek-text max-w-3xl whitespace-pre-line mb-6">{selectedJob.description}</p>
                    
                    {/* Details Snippet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-geek-gray/30 p-4 rounded-lg border border-geek-border">
                       <div>
                          <h4 className="font-bold text-geek-dark mb-1 flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> Requirements</h4>
                          <ul className="list-disc pl-4 text-geek-text space-y-0.5">
                             {selectedJob.requirements.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                             {selectedJob.requirements.length > 3 && <li>...and {selectedJob.requirements.length - 3} more</li>}
                          </ul>
                       </div>
                       {selectedJob.responsibilities && (
                        <div>
                            <h4 className="font-bold text-geek-dark mb-1 flex items-center gap-1"><ListChecks className="w-3 h-3"/> Responsibilities</h4>
                            <ul className="list-disc pl-4 text-geek-text space-y-0.5">
                              {selectedJob.responsibilities.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                              {selectedJob.responsibilities.length > 3 && <li>...and {selectedJob.responsibilities.length - 3} more</li>}
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
                      Add Candidate
                    </button>
                    <button 
                      onClick={simulateBatchProcessing}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-geek-dark hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-soft"
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Users className="w-4 h-4" />}
                      {loading ? "Processing..." : "Simulate Process"}
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
                   placeholder="Filter by name or email..." 
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
                   <option value="all">All Classifications</option>
                   <option value="High Priority">High Priority</option>
                   <option value="Consider">Consider</option>
                   <option value="Low Priority">Low Priority</option>
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
                   <h3 className="text-lg font-bold text-geek-dark">Processing Candidates...</h3>
                   <p className="text-geek-text text-sm mt-1">Our AI is analyzing each profile.</p>
                </div>
              )}

              {candidates.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                   <Users className="w-16 h-16 text-geek-gray mb-4" />
                   <h3 className="text-lg font-bold text-geek-dark">No candidates yet</h3>
                   <p className="text-geek-text mt-2">Start by adding candidates manually or simulating the process.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-geek-gray">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Candidate</th>
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
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Tech Fit</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Cultural Fit</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Interview Score</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-geek-text uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredAndSortedCandidates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-geek-text text-sm">
                            No candidates found with current filters.
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
                                      <span>Tech</span>
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
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                {candidate.interviewResult ? (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${candidate.interviewResult.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                            {candidate.interviewResult.score}
                                        </span>
                                        <span className="text-xs text-geek-text">/ 100</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Pending</span>
                                )}
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