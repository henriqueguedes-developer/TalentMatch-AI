
export interface Job {
  id: string;
  title: string;
  department: string;
  location: {
    city: string;
    state: string;
  };
  type: string[]; // Ex: ['Presencial', 'Híbrido']
  contractType: string[]; // Ex: ['CLT', 'PJ']
  description: string;
  requirements: string[]; // Requisitos Obrigatórios
  responsibilities?: string[]; // Responsabilidades
  differentials?: string[]; // Diferenciais / Desejáveis
  softSkills?: string[]; // Perfil Comportamental
  schedule?: string; // Horário de Trabalho
  salaryRange: string; // Faixa Salarial (Obrigatório)
  interviewRequired?: boolean; // Se a empresa exige/aceita entrevista simulada
}

export interface AnalysisResult {
  overallScore: number;
  technicalFit: number;
  culturalFit: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  recommendation: 'Alta Prioridade' | 'Considerar' | 'Baixa Prioridade';
}

export interface AnalysisHistoryItem {
  date: string;
  overallScore: number;
  recommendation: string;
}

export interface CandidatePreferences {
  workModels: string[]; // O que o candidato aceita
  contractTypes: string[]; // O que o candidato aceita
  salaryExpectation: string; // Pretensão Salarial (Obrigatório)
  locationPreference?: string; // Ex: "Aceito mudar de estado" ou "Apenas local"
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
  preferences?: CandidatePreferences; // Novas preferências
  interviewResult?: InterviewResult; // Resultado da entrevista simulada
}

export enum UserRole {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}
