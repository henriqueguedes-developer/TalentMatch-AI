export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Presencial' | 'Remoto' | 'Híbrido';
  description: string;
  requirements: string[];
}

export interface AnalysisResult {
  overallScore: number;
  technicalFit: number;
  culturalFit: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[]; // New field for actionable advice
  recommendation: 'Alta Prioridade' | 'Considerar' | 'Baixa Prioridade';
}

export interface AnalysisHistoryItem {
  date: string;
  overallScore: number;
  recommendation: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  fileName?: string; 
  resumeText: string; 
  analysis?: AnalysisResult;
  history?: AnalysisHistoryItem[];
  jobId?: string;
}

export enum UserRole {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}