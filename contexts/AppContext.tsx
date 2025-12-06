import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job, Candidate } from '../types';
import { MOCK_JOBS } from '../constants';

interface AppContextType {
  jobs: Job[];
  addJob: (job: Job) => void;
  applications: Candidate[];
  addApplication: (candidate: Candidate) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<Candidate[]>([]);

  const addJob = (job: Job) => {
    setJobs(prev => [job, ...prev]);
  };

  const addApplication = (candidate: Candidate) => {
    // Avoid duplicates
    if (!applications.find(a => a.id === candidate.id)) {
      setApplications(prev => [candidate, ...prev]);
    }
  };

  return (
    <AppContext.Provider value={{ jobs, addJob, applications, addApplication }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};