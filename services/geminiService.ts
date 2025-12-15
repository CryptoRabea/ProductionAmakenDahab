import { GoogleGenAI } from "@google/genai";

export const getDahabConciergeResponse = async (query: string): Promise<string> => {
  // Use process.env.API_KEY directly. Vite replaces 'process.env' with the env object during build.
  // We assume the variable is pre-configured as per guidelines.
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("API_KEY is missing in environment variables");
    return "I'm sorry, I cannot connect to the AI service right now. Please check the configuration.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const systemInstruction = `
      You are an expert concierge and local guide for Dahab, Egypt. 
      The user is using the "AmakenDahab" app.
      Your tone should be relaxed, friendly, and helpful (the "Dahab vibe").
      
      You can help with:
      1. Recommending types of events (Parties, Diving, Hikes, Yoga).
      2. Suggesting local areas (Lighthouse, Mashraba, Laguna, Assalah).
      3. Explaining how to pay with Vodafone Cash or Instapay in Egypt.
      4. Giving tips on wind conditions for kitesurfing.
      
      Keep answers concise and formatted nicely. Do not make up specific phone numbers, but you can suggest general places.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm having a bit of trouble hearing the waves. Can you ask that again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I'm taking a break by the sea. Please try again later.";
  }
};