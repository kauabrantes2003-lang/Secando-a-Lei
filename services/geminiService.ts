
import { GoogleGenAI, Type } from "@google/genai";
import { StudyPlan, LawBlock, Question } from "../types";

export interface LawSource {
  text?: string;
  pdfBase64?: string;
  images?: Array<{ data: string; mimeType: string }>;
}

export const generateStudyPlan = async (source: LawSource, days: number, projectName: string): Promise<StudyPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  
  // Adiciona PDF se existir
  if (source.pdfBase64) {
    parts.push({
      inlineData: {
        data: source.pdfBase64,
        mimeType: 'application/pdf'
      }
    });
  }

  // Adiciona Imagens se existirem (OCR Multimodal)
  if (source.images && source.images.length > 0) {
    source.images.forEach(img => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    });
  }
  
  const promptText = `Analise o conteúdo jurídico fornecido (texto, PDF ou imagens com texto/OCR) e crie um cronograma de estudos de ${days} dias para o projeto "${projectName}". 
    Se o conteúdo estiver em formato de imagem, realize o reconhecimento do texto (OCR) primeiro.
    Divida o conteúdo logicamente em blocos diários. 
    ${source.text ? `Texto Adicional: ${source.text.substring(0, 10000)}` : ''}
    IMPORTANTE: Atribua cada dia a um "group" (categoria lógica), como por exemplo "Parte Geral", "Dos Crimes", "Disposições Finais", etc., para que possamos organizar em abas.`;

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lawTitle: { type: Type.STRING },
          totalDays: { type: Type.NUMBER },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                articles: { type: Type.STRING },
                summary: { type: Type.STRING },
                group: { type: Type.STRING, description: "Nome da categoria/aba do estudo" }
              },
              required: ["day", "title", "articles", "summary", "group"]
            }
          }
        },
        required: ["lawTitle", "totalDays", "blocks"]
      }
    }
  });

  const parsed = JSON.parse(response.text);
  return {
    ...parsed,
    id: crypto.randomUUID(),
    name: projectName,
    createdAt: Date.now(),
    completedDays: []
  };
};

export const generateQuestionsForBlock = async (block: LawBlock): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Com base neste resumo/texto de lei: "${block.summary}", gere EXATAMENTE 15 questões de múltipla escolha inéditas no estilo de concursos públicos de alto nível (ex: FCC, CESPE, VUNESP). 
    Foque na "letra da lei". As questões devem ser desafiadoras e cobrir diferentes partes do texto fornecido.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSimulado = async (blocks: LawBlock[]): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const combinedContext = blocks.map(b => `Dia ${b.day} (${b.title}): ${b.summary}`).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Com base nos seguintes tópicos de lei, gere um simulado completo de 10 questões inéditas. 
    Distribua as questões entre os tópicos fornecidos. 
    Contexto: ${combinedContext.substring(0, 15000)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            blockId: { type: Type.NUMBER, description: "O número do dia (bloco) a que esta questão pertence" }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation", "blockId"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const explainLegalTerm = async (term: string, context: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Explique de forma didática e simples para um estudante de Direito o termo "${term}" no contexto deste texto: "${context}".`,
    config: {
      systemInstruction: "Você é um professor de Direito amigável e didático, especialista em simplificar conceitos complexos da lei seca."
    }
  });
  return response.text;
};
