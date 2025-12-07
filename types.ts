
export interface Job {
  id: string;
  title: string;
  department: string;
  location: {
    city: string;
    state: string;
  };
  type: string[]; // Ex: ['On-site', 'Hybrid']
  contractType: string[]; // Ex: ['Full-time', 'Contractor']
  description: string;
  requirements: string[]; // Mandatory Requirements
  responsibilities?: string[]; // Responsibilities
  differentials?: string[]; // Nice to have
  softSkills?: string[]; // Behavioral Profile
  schedule?: string; // Work Schedule
  salaryRange: string; // Salary Range (Mandatory)
  interviewRequired?: boolean; // If company requires/accepts simulated interview
}

export interface AnalysisResult {
  overallScore: number;
  technicalFit: number;
  culturalFit: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  recommendation: 'High Priority' | 'Consider' | 'Low Priority';
}

export interface AnalysisHistoryItem {
  date: string;
  overallScore: number;
  recommendation: string;
}

export interface CandidatePreferences {
  workModels: string[]; // What candidate accepts
  contractTypes: string[]; // What candidate accepts
  salaryExpectation: string; // Salary Expectation (Mandatory)
  locationPreference?: string; // Ex: "Willing to relocate"
}

export interface InterviewResult {
  score: number;
  feedback: string;
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
  preferences?: CandidatePreferences; // New preferences
  interviewResult?: InterviewResult; // Simulated interview result
}

export enum UserRole {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}