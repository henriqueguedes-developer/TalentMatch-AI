
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Job, AnalysisResult, InterviewResult, CandidatePreferences } from "../types";

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

const interviewEvalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Pontuação de 0 a 100 do desempenho do candidato na entrevista.",
    },
    feedback: {
      type: Type.STRING,
      description: "Um feedback conciso (max 3 linhas) explicando a nota, destacando pontos positivos e o que faltou.",
    },
  },
  required: ["score", "feedback"],
};

// Helper to clean JSON response from markdown blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found.");
  const ai = new GoogleGenAI({ apiKey });

  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Extract all text content from this document. Return only the raw text content without any markdown formatting. If it is a resume, organize the sections clearly."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error("Falha ao ler o arquivo. Certifique-se que é um PDF ou Imagem válido e tente novamente.");
  }
};

export const analyzeResume = async (
  job: Job, 
  resumeText: string, 
  preferences?: CandidatePreferences
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let preferencesContext = "";
  if (preferences) {
    preferencesContext = `
    PREFERÊNCIAS OBRIGATÓRIAS DO CANDIDATO (FATORES CRÍTICOS):
    - Pretensão Salarial: R$ ${preferences.salaryExpectation}
    - Budget da Vaga: ${job.salaryRange}
    - Modelos Aceitos pelo Candidato: ${preferences.workModels.join(', ')}
    - Modelo da Vaga: ${job.type.join(', ')}
    - Contratos Aceitos: ${preferences.contractTypes.join(', ')}

    REGRA RÍGIDA DE PONTUAÇÃO (MATCH FINANCEIRO E ESTRUTURAL):
    1. MATCH SALARIAL: Compare o valor numérico da pretensão salarial com o budget da vaga.
       - Se a pretensão for maior que o limite superior da vaga em mais de 10%: SUBTRAIA IMEDIATAMENTE 20 PONTOS do 'overallScore' e adicione "Incompatibilidade Salarial" em 'weaknesses'.
       - Se a pretensão for muito acima (>30%), classifique automaticamente como "Baixa Prioridade".
    
    2. MATCH DE MODELO E CONTRATO:
       - Se não houver interseção entre os Modelos de Trabalho (ex: Candidato só aceita Remoto e vaga é 100% Presencial), o 'overallScore' NÃO DEVE PASSAR DE 40. Classifique como "Baixa Prioridade" e cite "Incompatibilidade de Modelo de Trabalho".
    `;
  }

  const prompt = `
    Você é um especialista em Recrutamento e Seleção utilizando Inteligência Artificial.
    
    Sua tarefa é analisar a aderência de um candidato a uma vaga específica.
    
    VAGA:
    Título: ${job.title}
    Departamento: ${job.department}
    Localização: ${job.location.city} / ${job.location.state}
    Descrição Geral: ${job.description}
    Responsabilidades: ${job.responsibilities?.join("; ") || "Não especificado"}
    Requisitos Obrigatórios: ${job.requirements.join("; ")}
    Diferenciais (Desejável): ${job.differentials?.join("; ") || "Nenhum"}
    Soft Skills (Comportamental): ${job.softSkills?.join("; ") || "Não especificado"}
    Faixa Salarial Oferecida: ${job.salaryRange}
    Modelo de Trabalho da Vaga: ${job.type.join(', ')}
    Contrato da Vaga: ${job.contractType.join(', ')}

    ${preferencesContext}

    CANDIDATO (Texto do Currículo):
    ${resumeText}

    CRITÉRIOS DE PONTUAÇÃO (Pesos Sugeridos):
    - 35%: Hard Skills e Requisitos Obrigatórios.
    - 25%: Experiência Profissional relevante.
    - 30%: Compatibilidade (Salário, Localização, Modelo de Trabalho) - SEJA RIGOROSO AQUI.
    - 10%: Soft Skills e Cultura.

    Analise profundamente a experiência, habilidades técnicas, soft skills e o contexto da carreira do candidato em relação à vaga.
    
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
    Você é Alex, um Recrutador Técnico Sênior experiente na empresa TalentMatch.
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
    2. Comece se apresentando como Alex e fazendo a primeira pergunta (técnica ou comportamental).
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

export const evaluateInterview = async (
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  jobContext: Job
): Promise<InterviewResult> => {
    if (!apiKey) {
        throw new Error("API Key not found.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // Format chat history into a string
    const transcript = history.map(msg => `${msg.role.toUpperCase()}: ${msg.parts[0].text}`).join('\n');

    const prompt = `
      Você é um avaliador de entrevistas técnicas.
      
      Analise a transcrição da entrevista abaixo para a vaga de "${jobContext.title}".
      O candidato respondeu a perguntas feitas por um recrutador de IA.
      
      TRANSCRICAO:
      ${transcript}
      
      Avalie o candidato com base em:
      1. Clareza e comunicação.
      2. Profundidade técnica nas respostas (se houve perguntas técnicas).
      3. Comportamento e profissionalismo.
      
      Retorne um JSON com:
      - score: Nota de 0 a 100.
      - feedback: Um resumo curto justificando a nota.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewEvalSchema
            }
        });
        
        const jsonText = response.text;
        if (!jsonText) throw new Error("No response");
        
        return JSON.parse(cleanJson(jsonText)) as InterviewResult;
    } catch (error) {
        console.error("Evaluation error", error);
        return { score: 0, feedback: "Erro ao avaliar entrevista." };
    }
}
