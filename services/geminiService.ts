
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Job, AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

// Use 'gemini-2.5-flash' for fast, efficient analysis.
const MODEL_NAME = "gemini-2.5-flash";
// Use 'gemini-2.5-flash' for chat to avoid preview model instability
const CHAT_MODEL_NAME = "gemini-2.5-flash";

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Uma pontuação de 0 a 100 indicando a aderência geral à vaga.",
    },
    technicalFit: {
      type: Type.NUMBER,
      description: "Pontuação de 0 a 100 baseada apenas nas habilidades técnicas e experiência.",
    },
    culturalFit: {
      type: Type.NUMBER,
      description: "Pontuação de 0 a 100 baseada em soft skills e perfil comportamental inferido.",
    },
    summary: {
      type: Type.STRING,
      description: "Um resumo executivo curto (máx 2 parágrafos) da análise.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3 a 5 pontos fortes do candidato em relação à vaga.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3 a 5 pontos de atenção ou gaps de competência.",
    },
    improvementTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3 ações práticas, cursos ou projetos específicos que o candidato deve realizar para melhorar sua pontuação para esta vaga.",
    },
    recommendation: {
      type: Type.STRING,
      enum: ["Alta Prioridade", "Considerar", "Baixa Prioridade"],
      description: "Classificação final para o recrutador.",
    },
  },
  required: ["overallScore", "technicalFit", "culturalFit", "summary", "strengths", "weaknesses", "improvementTips", "recommendation"],
};

// Helper to clean JSON response from markdown blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeResume = async (job: Job, resumeText: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Você é um especialista em Recrutamento e Seleção utilizando Inteligência Artificial.
    
    Sua tarefa é analisar a aderência de um candidato a uma vaga específica.
    
    VAGA:
    Título: ${job.title}
    Departamento: ${job.department}
    Descrição Geral: ${job.description}
    Responsabilidades: ${job.responsibilities?.join("; ") || "Não especificado"}
    Requisitos Obrigatórios: ${job.requirements.join("; ")}
    Diferenciais (Desejável): ${job.differentials?.join("; ") || "Nenhum"}
    Soft Skills (Comportamental): ${job.softSkills?.join("; ") || "Não especificado"}

    CANDIDATO (Texto do Currículo):
    ${resumeText}

    Analise profundamente a experiência, habilidades técnicas, soft skills e o contexto da carreira do candidato em relação à vaga.
    Considere os Requisitos Obrigatórios como peso maior, e os Diferenciais como bônus.
    Para o 'Cultural Fit', analise a seção 'Soft Skills' da vaga.
    
    IMPORTANTE:
    No campo 'improvementTips', aja como um mentor de carreira. Dê conselhos extremamente práticos e acionáveis sobre o que falta para ele chegar a 100% de aderência. Cite tecnologias específicas, metodologias ou tipos de projetos que ele precisa adicionar ao portfólio.
    
    Retorne a resposta estritamente no formato JSON solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(cleanJson(jsonText)) as AnalysisResult;
  } catch (error) {
    console.error("Error analysing resume:", error);
    throw error;
  }
};

// Interface for batch matching results
export interface JobMatch {
  jobId: string;
  matchScore: number;
  reason: string;
}

const matchSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      jobId: { type: Type.STRING },
      matchScore: { type: Type.NUMBER },
      reason: { type: Type.STRING, description: "Uma frase curta explicando o motivo da pontuação." }
    },
    required: ["jobId", "matchScore", "reason"]
  }
};

export const findBestMatches = async (resumeText: string, jobs: Job[]): Promise<JobMatch[]> => {
  if (!apiKey) {
    throw new Error("API Key not found.");
  }
  const ai = new GoogleGenAI({ apiKey });

  // Create a minified version of jobs to save tokens
  const jobsSummary = jobs.map(j => ({
    id: j.id,
    title: j.title,
    requirements: j.requirements,
    city: j.location.city,
    state: j.location.state
  }));

  const prompt = `
    Atue como um recrutador sênior.
    Analise o seguinte currículo:
    "${resumeText.substring(0, 5000)}"

    Compare este currículo com a lista de vagas abaixo.
    Para cada vaga, atribua uma pontuação de match (0-100) baseada na aderência técnica e experiência.
    Retorne APENAS as vagas com matchScore > 40.
    
    Lista de Vagas:
    ${JSON.stringify(jobsSummary)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchSchema,
        temperature: 0.1
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    let results = JSON.parse(cleanJson(jsonText)) as JobMatch[];
    // Ensure sorting
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error finding matches:", error);
    return [];
  }
};

export const sendChatMessage = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  const chat = ai.chats.create({
    model: CHAT_MODEL_NAME,
    history: history,
    config: {
      temperature: 0.7,
      systemInstruction: "Você é o assistente virtual da TalentMatch AI. Ajude candidatos a melhorarem seus currículos e recrutadores a encontrarem os melhores talentos. Seja conciso, profissional e amigável."
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text || "Desculpe, não consegui processar sua resposta.";
};

// Interview Simulator Function
export const runInterviewTurn = async (
  message: string, 
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  jobContext: Job,
  resumeContext: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Você é um Recrutador Técnico Sênior na empresa TalentMatch.
    Você está entrevistando um candidato para a vaga de: ${jobContext.title} (${jobContext.department}).
    
    CONTEXTO DA VAGA:
    ${jobContext.description}
    Responsabilidades: ${jobContext.responsibilities?.join("; ") || "Não especificado"}
    Requisitos Obrigatórios: ${jobContext.requirements.join('; ')}
    Diferenciais: ${jobContext.differentials?.join("; ") || "Nenhum"}
    Soft Skills: ${jobContext.softSkills?.join("; ") || "Não especificado"}

    RESUMO DO CANDIDATO:
    ${resumeContext.substring(0, 2000)}

    SUA MISSÃO:
    Conduzir uma simulação de entrevista realista e curta (máximo 5 perguntas no total).
    
    REGRAS DE INTERAÇÃO:
    1. Faça APENAS UMA pergunta por vez. Nunca faça várias perguntas na mesma mensagem.
    2. Comece se apresentando brevemente e fazendo a primeira pergunta (técnica ou comportamental).
    3. Quando o candidato responder, dê um feedback CURTO e CONSTRUTIVO sobre a resposta dele (ex: "Boa resposta, mostrou conhecimento em X", ou "Poderia ter sido mais específico sobre Y").
    4. Logo após o feedback, faça a próxima pergunta.
    5. Aumente a dificuldade gradualmente.
    6. Tente explorar tanto os Requisitos quanto os Diferenciais se o candidato demonstrar conhecimento.
    7. Mantenha um tom profissional, mas encorajador.
  `;
  
  try {
    const chat = ai.chats.create({
      model: CHAT_MODEL_NAME,
      history: history,
      config: {
        temperature: 0.6,
        systemInstruction: systemInstruction
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Erro na simulação.";
  } catch (e: any) {
     console.error("Interview error", e);
     return `Erro ao processar entrevista: ${e.message}`;
  }
};
