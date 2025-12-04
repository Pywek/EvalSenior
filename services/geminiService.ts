import { GoogleGenAI } from "@google/genai";
import { ReviewData } from "../types";
import { QUESTIONS } from "../constants";

export interface AIAnalysisResult {
  synthesis: string;
  objectives: string;
  training: string;
}

export const generateSynthesis = async (review: ReviewData): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return {
      synthesis: "Erreur: Clé API manquante.",
      objectives: "",
      training: ""
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct a prompt context
  let context = `Tu es un expert RH assistant un Manager de résidence senior pour des entretiens annuels. 
  Ton but est de préparer le compte-rendu final basé sur les réponses de l'employé et du manager.
  
  Employé: ${review.employeeName} (${review.employeeRole})
  
  Voici les réponses confrontées :
  `;

  QUESTIONS.forEach(q => {
    context += `\nQuestion: ${q.label}\n`;
    context += `- Réponse Employé: ${review.employeeAnswers[q.id] || "Non renseigné"}\n`;
    context += `- Avis Manager: ${review.managerAnswers[q.id] || "Non renseigné"}\n`;
  });

  context += `\nTâche : Analyse ces réponses et génère une réponse au format JSON strict avec les 3 champs suivants :
  1. "synthesis": Une synthèse professionnelle, bienveillante et ULTRA-CONCISE (environ 30 à 40 mots maximum). Va droit au but, pas de blabla.
  2. "objectives": Un seul objectif prioritaire et concret pour l'année prochaine (format liste à puces, 1 seul point).
  3. "training": Une seule proposition de formation ou de souhait (format liste à puces, 1 seul point).
  
  Réponds uniquement avec le JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(text);
    return {
      synthesis: parsed.synthesis || "Impossible de générer la synthèse.",
      objectives: parsed.objectives || "",
      training: parsed.training || ""
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      synthesis: "Une erreur est survenue lors de l'analyse IA.",
      objectives: "",
      training: ""
    };
  }
};