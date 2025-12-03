import { GoogleGenAI } from "@google/genai";
import { ReviewData } from "../types";
import { QUESTIONS } from "../constants";

export const generateSynthesis = async (review: ReviewData): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return "Erreur: Clé API manquante. Veuillez configurer l'API Key.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct a prompt context
  let context = `Tu es un expert RH assistant un directeur de résidence senior pour des entretiens annuels. 
  Ton but est de rédiger une synthèse professionnelle, constructive et bienveillante basée sur les réponses de l'employé et du manager.
  
  Employé: ${review.employeeName} (${review.employeeRole})
  
  Voici les réponses confrontées :
  `;

  QUESTIONS.forEach(q => {
    context += `\nQuestion: ${q.label}\n`;
    context += `- Réponse Employé: ${review.employeeAnswers[q.id] || "Non renseigné"}\n`;
    context += `- Avis Manager: ${review.managerAnswers[q.id] || "Non renseigné"}\n`;
  });

  context += `\nTâche : Rédige une "Synthèse de l'entretien" d'environ 150 mots. 
  1. Souligne les points d'accord (réussites).
  2. Mentionne avec tact les points d'amélioration identifiés par le manager s'il y en a.
  3. Adopte un ton encourageant pour l'année à venir.
  Ne mets pas de titre, juste le corps du texte.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });
    
    return response.text || "Impossible de générer la synthèse.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Une erreur est survenue lors de la génération de la synthèse.";
  }
};