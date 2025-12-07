
import React, { useState, useRef } from 'react';
import { Job, AnalysisResult, Candidate, InterviewResult } from '../types';
import { analyzeResume, findBestMatches, JobMatch, extractTextFromFile } from '../services/geminiService';
import AnalysisCard from '../components/AnalysisCard';
import InterviewModal from '../components/InterviewModal';
import { useAppContext } from '../contexts/AppContext';
import { FileText, Loader2, CheckCircle2, UploadCloud, X, ArrowRight, Briefcase, Search, ChevronLeft, Send, Edit2, MapPin, Building2, Mic2, AlertTriangle, DollarSign, Lock } from 'lucide-react';

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
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  
  // Preferences State
  const [preferences, setPreferences] = useState<{workModels: string[], contractTypes: string[], salaryExpectation: string}>({
    workModels: [],
    contractTypes: [],
    salaryExpectation: ''
  });

  // UI/Loading state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setLoadingMessage("Reading document via AI...");
    setErrorMsg('');

    try {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target?.result as string);
          setLoading(false);
        };
        reader.readAsText(file);
      } else {
        // Use Gemini to extract text from PDF/Images
        const extractedText = await extractTextFromFile(file);
        setResumeText(extractedText);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Could not read file. Try pasting text manually or use another format.");
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!resumeText) return;
    
    setLoading(true);
    setLoadingMessage(`Analyzing compatibility with ${jobs.length} vacancies...`);
    
    try {
      const results = await findBestMatches(resumeText, jobs);
      setMatches(results);
      setStep('results');
    } catch (error) {
      alert("Error finding vacancies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    setSelectedJob(job);
    setApplicationSuccess(false); // Reset app status
    setInterviewResult(null); // Reset previous interview
    setLoading(true);
    setLoadingMessage(`Calculating adherence for ${job.title}...`);

    try {
      const analysis = await analyzeResume(job, resumeText);
      setAnalysisResult(analysis);
      setStep('detail');
    } catch (error) {
      alert("Error in detailed analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreApply = () => {
    // Double check logic for security, though UI is disabled
    if (selectedJob?.interviewRequired && !interviewResult) {
        alert("This vacancy requires completing the simulated interview.");
        return;
    }
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

  const handleInterviewComplete = (result?: InterviewResult) => {
     setShowInterviewModal(false);
     if (result) {
         setInterviewResult(result);
     }
  }

  const handleApply = () => {
    if (!selectedJob || !analysisResult) return;
    setIsApplying(true);
    
    // Simulate network delay then save to context
    setTimeout(() => {
      const newCandidate: Candidate = {
        id: `app-${Date.now()}`,
        name: fileName ? fileName.split('.')[0] : 'Candidate (Portal)',
        email: 'candidate@portal.com',
        fileName: fileName || 'resume.pdf',
        resumeText: resumeText,
        analysis: analysisResult,
        jobId: selectedJob.id,
        preferences: preferences, // Save preferences
        interviewResult: interviewResult || undefined // Save interview result
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const file = e.dataTransfer.files[0];
       setFileName(file.name);
       setLoading(true);
       setLoadingMessage("Reading document via AI...");
       setErrorMsg('');
       
       try {
        if (file.type === "text/plain") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setResumeText(e.target?.result as string);
            setLoading(false);
          };
          reader.readAsText(file);
        } else {
           const extractedText = await extractTextFromFile(file);
           setResumeText(extractedText);
           setLoading(false);
        }
       } catch (err) {
         setErrorMsg("Error reading file.");
         setLoading(false);
       }
    }
  };

  const resetProcess = () => {
    setStep('upload');
    setResumeText('');
    setFileName(null);
    setMatches([]);
    setAnalysisResult(null);
    setApplicationSuccess(false);
    setErrorMsg('');
    setInterviewResult(null);
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
        <p className="text-geek-text mt-2 font-medium">Our AI is reading your document...</p>
      </div>
    );
  }

  // Helper to determine if we should block application based on interview
  const isInterviewMissing = selectedJob?.interviewRequired && !interviewResult;

  return (
    <div className="w-full">
      
      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
          <div className="text-center mb-12 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-geek-dark mb-6 tracking-tight">
              Discover your real <span className="text-geek-blue">potential</span>
            </h1>
            <p className="text-lg text-geek-text leading-relaxed">
              Upload your resume and let our Artificial Intelligence analyze your skills against the best market opportunities.
            </p>
          </div>

          <div className="w-full max-w-2xl">
             {errorMsg && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5" /> {errorMsg}
               </div>
             )}

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
                    <p className="font-bold text-xl text-geek-dark">Drag your CV or click here</p>
                    <p className="text-sm text-geek-text mt-2 font-medium">We support PDF, DOCX, Images or TXT</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
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
                              <CheckCircle2 className="w-4 h-4" /> Reading Completed
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
                            <Edit2 className="w-3 h-3 text-geek-blue"/> Extracted Content (Editable)
                          </label>
                       </div>
                       <textarea 
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="w-full h-48 p-4 text-sm bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-geek-blue/20 text-geek-dark font-mono resize-none leading-relaxed"
                          placeholder="Paste your resume text here..."
                       />
                    </div>

                    <button
                      onClick={handleFindMatches}
                      className="w-full bg-geek-blue hover:bg-geek-blueHover text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
                    >
                      <Search className="w-6 h-6" />
                      Find My Vacancies
                    </button>
                </div>
             )}
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl">
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">1</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">Smart Upload</h3>
                <p className="text-sm text-geek-text leading-relaxed">Our AI reads PDFs and images instantly. No need to retype anything.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">2</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">TalentMatch AI</h3>
                <p className="text-sm text-geek-text leading-relaxed">Advanced technology matches your skills with the best opportunities.</p>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-geek-border shadow-card">
                <div className="bg-geek-gray w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-geek-dark font-bold">3</div>
                <h3 className="font-bold text-geek-dark mb-2 text-lg">Real Feedback</h3>
                <p className="text-sm text-geek-text leading-relaxed">Receive an adherence ranking and tips to evolve your career.</p>
             </div>
          </div>
        </div>
      )}

      {/* STEP 2: RESULTS */}
      {step === 'results' && (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-geek-dark">Compatible Vacancies</h2>
                <p className="text-geek-text mt-1">We found the following opportunities for <span className="font-semibold text-geek-dark">{fileName}</span></p>
              </div>
              <button 
                onClick={resetProcess}
                className="text-sm font-semibold text-geek-text hover:text-geek-blue border border-geek-border bg-white px-5 py-2.5 rounded-lg hover:border-geek-blue transition-colors shadow-sm"
              >
                Analyze another profile
              </button>
           </div>

           {matches.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-3xl border border-geek-border shadow-soft">
                <div className="bg-geek-gray w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-geek-text" />
                </div>
                <h3 className="text-2xl font-bold text-geek-dark">No vacancies found</h3>
                <p className="text-geek-text mt-3 max-w-md mx-auto leading-relaxed">
                  We didn't find vacancies with match above 40% at the moment. Try detailing your experiences more in the resume.
                </p>
                <button onClick={resetProcess} className="mt-8 px-6 py-3 bg-geek-blue text-white rounded-xl font-bold hover:bg-geek-blueHover transition-colors">Try again</button>
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
                           RECOMMENDED
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
                          View Details & Apply <ArrowRight className="w-4 h-4" />
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
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-card border border-geek-border p-8">
              <h2 className="text-2xl font-bold text-geek-dark mb-2">Work Preferences</h2>
              <p className="text-geek-text mb-8">To finalize your application for <strong>{selectedJob.title}</strong>, select what fits your profile.</p>

              <div className="space-y-6">
                 <div>
                    <label className="block font-bold text-geek-dark mb-3">Which work models do you accept?</label>
                    <div className="flex flex-wrap gap-3">
                        {['On-site', 'Hybrid', 'Remote'].map(option => (
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
                    {preferences.workModels.includes('On-site') && selectedJob.location.state !== 'Remote' && (
                         <div className="mt-2 text-xs bg-blue-50 text-blue-800 p-2 rounded">
                            <span className="font-bold">Note:</span> This vacancy is in {selectedJob.location.city}/{selectedJob.location.state}. Ensure the location is feasible for you.
                         </div>
                    )}
                 </div>

                 <div>
                    <label className="block font-bold text-geek-dark mb-3">Which contract types do you accept?</label>
                    <div className="flex flex-wrap gap-3">
                        {['Full-time', 'Contractor', 'Freelancer', 'Internship'].map(option => (
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

                 <div>
                    <label className="block font-bold text-geek-dark mb-3">Salary Expectation (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-geek-text font-bold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> R$
                      </span>
                      <input 
                        type="text"
                        value={preferences.salaryExpectation}
                        onChange={(e) => setPreferences({...preferences, salaryExpectation: e.target.value})}
                        placeholder="0,00"
                        className="w-full pl-14 pr-4 py-3 bg-geek-gray border border-geek-border rounded-lg focus:ring-2 focus:ring-geek-blue/20 focus:border-geek-blue focus:outline-none transition-all font-bold text-geek-dark"
                      />
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleApply}
                disabled={isApplying || preferences.workModels.length === 0 || preferences.contractTypes.length === 0 || !preferences.salaryExpectation}
                className="mt-10 w-full bg-geek-blue hover:bg-geek-blueHover text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </>
                ) : (
                    <>
                      Confirm Application <Send className="w-5 h-5" />
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
            <ChevronLeft className="w-4 h-4" /> Back to results
          </button>

          {/* Success Application Message */}
          {applicationSuccess && (
             <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 shadow-soft">
                <div className="bg-green-100 p-4 rounded-full mb-4 ring-4 ring-green-50">
                   <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800">Application Sent!</h3>
                <p className="text-green-700 mt-2 max-w-lg font-medium">
                   Your profile was successfully sent for the position of {selectedJob.title}. Good luck!
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
                        <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {selectedJob.salaryRange}</span>
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
                  <div className="flex flex-col items-end">
                     <button 
                        onClick={() => setShowInterviewModal(true)}
                        className={`border-2 px-8 py-4 rounded-xl font-bold shadow-sm transition-all flex items-center gap-3 text-lg w-full md:w-auto justify-center ${
                           interviewResult 
                           ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                           : isInterviewMissing
                             ? 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse hover:bg-orange-100'
                             : 'bg-white text-geek-blue border-geek-blue hover:bg-geek-blue/5'
                        }`}
                     >
                        {interviewResult ? (
                           <>
                              <CheckCircle2 className="w-5 h-5" /> Interview Completed ({interviewResult.score}/100)
                           </>
                        ) : (
                           <>
                              <Mic2 className="w-5 h-5" /> 
                              {isInterviewMissing ? "Perform Mandatory Interview" : "Simulate Interview"}
                           </>
                        )}
                     </button>
                     {isInterviewMissing && (
                         <span className="text-xs text-orange-600 font-bold mt-2">Required to apply</span>
                     )}
                  </div>

                  <button 
                    onClick={handlePreApply}
                    disabled={isInterviewMissing || false}
                    className={`px-10 py-4 rounded-xl font-bold shadow-lg transform transition-all flex items-center gap-3 text-lg w-full md:w-auto justify-center ${
                        isInterviewMissing 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-geek-blue hover:bg-geek-blueHover text-white hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                     {isInterviewMissing ? <Lock className="w-5 h-5" /> : null}
                     Apply Now <ArrowRight className="w-5 h-5" />
                  </button>
               </>
             ) : (
               <button 
                  disabled
                  className="bg-geek-gray text-geek-text border border-geek-border px-8 py-3 rounded-xl font-bold cursor-default flex items-center gap-2"
               >
                  Applied
               </button>
             )}
          </div>

          {/* Interview Modal */}
          {showInterviewModal && (
            <InterviewModal 
               job={selectedJob} 
               resumeText={resumeText} 
               onClose={handleInterviewComplete} 
            />
          )}

        </div>
      )}
    </div>
  );
};

export default CandidatePortal;