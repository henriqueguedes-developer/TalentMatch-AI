
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
      description: "A score from 0 to 100 indicating general adherence to the vacancy.",
    },
    technicalFit: {
      type: Type.NUMBER,
      description: "Score from 0 to 100 based solely on technical skills and experience.",
    },
    culturalFit: {
      type: Type.NUMBER,
      description: "Score from 0 to 100 based on soft skills and inferred behavioral profile.",
    },
    summary: {
      type: Type.STRING,
      description: "A short executive summary (max 2 paragraphs) of the analysis in English.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 to 5 strengths of the candidate regarding the vacancy in English.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 to 5 points of attention or competence gaps in English.",
    },
    improvementTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 practical actions, courses, or specific projects the candidate should undertake to improve their score for this vacancy in English.",
    },
    recommendation: {
      type: Type.STRING,
      enum: ["High Priority", "Consider", "Low Priority"],
      description: "Final classification for the recruiter.",
    },
  },
  required: ["overallScore", "technicalFit", "culturalFit", "summary", "strengths", "weaknesses", "improvementTips", "recommendation"],
};

const interviewEvalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Score from 0 to 100 on the candidate's interview performance.",
    },
    feedback: {
      type: Type.STRING,
      description: "A concise feedback (max 3 lines) explaining the grade, highlighting positives and what was missing, in English.",
    },
  },
  required: ["score", "feedback"],
};

// Helper to clean JSON response from markdown blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Helper to extract wait time from error message
const parseRetryDelay = (errorMessage: string): number | null => {
  const match = errorMessage.match(/retry in (\d+(\.\d+)?)s/);
  if (match && match[1]) {
    // Add 1000ms buffer to be safe
    return Math.ceil(parseFloat(match[1]) * 1000) + 1000;
  }
  return null;
};

// Retry Helper Function
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, defaultDelay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || JSON.stringify(error);
    
    const isQuotaError = error.status === 429 || 
                         error.code === 429 || 
                         errorMsg.includes('429') ||
                         errorMsg.includes('Quota exceeded') ||
                         errorMsg.includes('RESOURCE_EXHAUSTED');

    if (isQuotaError && retries > 0) {
      // Try to parse specific delay from API message, otherwise use exponential backoff
      const apiDelay = parseRetryDelay(errorMsg);
      const delay = apiDelay || defaultDelay;
      
      console.warn(`Quota limit hit. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // If we used a specific API delay, don't double it next time, just respect the API again
      const nextDelay = apiDelay ? 2000 : defaultDelay * 2;
      return callWithRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
}

// Helper to check MIME types based on extension if browser fails
const getMimeType = (file: File): string => {
  if (file.type) return file.type;
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'txt') return 'text/plain';
  
  return 'application/octet-stream';
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found.");
  const ai = new GoogleGenAI({ apiKey });

  // Validate type before processing
  const mimeType = getMimeType(file);
  if (mimeType !== 'application/pdf' && !mimeType.startsWith('image/') && mimeType !== 'text/plain') {
     throw new Error("Unsupported file format. Please upload PDF, TXT or Image.");
  }

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

  return callWithRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Extract all text content from this document. Return only the raw text content without any markdown formatting. If it is a resume, organize the sections clearly. Return text in English if possible, or keep original if it is a proper name/specific term."
            }
          ]
        }
      });

      return response.text || "";
    } catch (error) {
      console.error("Text extraction error:", error);
      // IMPORTANT: Re-throw error so callWithRetry can handle 429s
      throw error; 
    }
  }, 5); // Increased retries for file extraction
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
    CANDIDATE MANDATORY PREFERENCES (CRITICAL FACTORS):
    - Salary Expectation: ${preferences.salaryExpectation}
    - Job Budget: ${job.salaryRange}
    - Work Models Accepted by Candidate: ${preferences.workModels.join(', ')}
    - Job Model: ${job.type.join(', ')}
    - Contracts Accepted: ${preferences.contractTypes.join(', ')}

    STRICT SCORING RULES (FINANCIAL AND STRUCTURAL MATCH):
    1. SALARY MATCH: Compare the numerical value of salary expectation with the vacancy budget.
       - If expectation is > 10% above upper limit: IMMEDIATELY SUBTRACT 20 POINTS from 'overallScore' and add "Salary Incompatibility" to 'weaknesses'.
       - If expectation is way above (>30%), automatically classify as "Low Priority".
    
    2. MODEL AND CONTRACT MATCH:
       - If there is no intersection between Work Models (e.g., Candidate only Remote vs Job 100% On-site), 'overallScore' MUST NOT EXCEED 40. Classify as "Low Priority" and cite "Work Model Incompatibility".
    `;
  }

  const prompt = `
    You are an expert in Recruitment and Selection using Artificial Intelligence.
    
    Your task is to analyze the adherence of a candidate to a specific vacancy.
    
    VACANCY:
    Title: ${job.title}
    Department: ${job.department}
    Location: ${job.location.city} / ${job.location.state}
    General Description: ${job.description}
    Responsibilities: ${job.responsibilities?.join("; ") || "Not specified"}
    Mandatory Requirements: ${job.requirements.join("; ")}
    Differentials (Nice to have): ${job.differentials?.join("; ") || "None"}
    Soft Skills (Behavioral): ${job.softSkills?.join("; ") || "Not specified"}
    Salary Range Offered: ${job.salaryRange}
    Job Work Model: ${job.type.join(', ')}
    Job Contract: ${job.contractType.join(', ')}

    ${preferencesContext}

    CANDIDATE (Resume Text):
    ${resumeText}

    SCORING CRITERIA (Suggested Weights):
    - 35%: Hard Skills and Mandatory Requirements.
    - 25%: Relevant Professional Experience.
    - 30%: Compatibility (Salary, Location, Work Model) - BE STRICT HERE.
    - 10%: Soft Skills and Culture.

    Analyze deeply the experience, technical skills, soft skills, and career context of the candidate regarding the vacancy.
    
    IMPORTANT:
    In the 'improvementTips' field, act as a career mentor. Give extremely practical and actionable advice on what is missing for them to reach 100% adherence. Cite specific technologies, methodologies, or project types they need to add to their portfolio.
    
    Return the response strictly in the requested JSON format, IN ENGLISH.
  `;

  return callWithRetry(async () => {
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
  });
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
      reason: { type: Type.STRING, description: "A short sentence explaining the score reason in English." }
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
    Act as a senior recruiter.
    Analyze the following resume:
    "${resumeText.substring(0, 5000)}"

    Compare this resume with the list of vacancies below.
    For each vacancy, assign a match score (0-100) based on technical adherence and experience.
    Return ONLY vacancies with matchScore > 40.
    Provide the 'reason' in English.
    
    Vacancy List:
    ${JSON.stringify(jobsSummary)}
  `;

  return callWithRetry(async () => {
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
  });
};

export const sendChatMessage = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key not found.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  return callWithRetry(async () => {
    const chat = ai.chats.create({
      model: CHAT_MODEL_NAME,
      history: history,
      config: {
        temperature: 0.7,
        systemInstruction: "You are TalentMatch AI's virtual assistant. Help candidates improve their resumes and recruiters find the best talent. Be concise, professional, and friendly. Answer in English."
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Sorry, I could not process your request.";
  });
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
    You are Alex, an experienced Senior Technical Recruiter at TalentMatch.
    You are interviewing a candidate for the position of: ${jobContext.title} (${jobContext.department}).
    
    VACANCY CONTEXT:
    ${jobContext.description}
    Responsibilities: ${jobContext.responsibilities?.join("; ") || "Not specified"}
    Mandatory Requirements: ${jobContext.requirements.join('; ')}
    Differentials: ${jobContext.differentials?.join("; ") || "None"}
    Soft Skills: ${jobContext.softSkills?.join("; ") || "Not specified"}

    CANDIDATE SUMMARY:
    ${resumeContext.substring(0, 2000)}

    YOUR MISSION:
    Conduct a realistic and short simulation interview (max 3 questions total).
    
    INTERACTION RULES:
    1. Ask ONLY ONE question at a time. Never ask multiple questions in the same message.
    2. Start by introducing yourself as Alex and asking the first question (technical or behavioral).
    3. When the candidate answers, give SHORT and CONSTRUCTIVE feedback on their answer (e.g., "Good answer, showed knowledge in X", or "Could have been more specific about Y").
    4. Immediately after the feedback, ask the next question.
    5. Increase difficulty gradually.
    6. Try to explore both Requirements and Differentials if the candidate demonstrates knowledge.
    7. Maintain a professional but encouraging tone.
    8. SPEAK IN ENGLISH.
  `;
  
  return callWithRetry(async () => {
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
      return result.text || "Simulation error.";
    } catch (e: any) {
       console.error("Interview error", e);
       throw e; // re-throw to trigger retry
    }
  });
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
      You are a technical interview evaluator.
      
      Analyze the interview transcript below for the vacancy "${jobContext.title}".
      The candidate answered questions asked by an AI recruiter.
      
      TRANSCRIPT:
      ${transcript}
      
      Evaluate the candidate based on:
      1. Clarity and communication.
      2. Technical depth in answers (if there were technical questions).
      3. Behavior and professionalism.
      
      Return a JSON with:
      - score: Grade from 0 to 100.
      - feedback: A short summary justifying the grade in English.
    `;

    return callWithRetry(async () => {
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
          throw error;
      }
    });
}
