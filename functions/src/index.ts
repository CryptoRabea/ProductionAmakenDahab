import * as functions from 'firebase-functions';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI with API key from environment
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  return new GoogleGenAI({ apiKey });
};

export const dahabConcierge = functions.https.onCall(async (data, context) => {
  // Validate request
  if (!data.query || typeof data.query !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a "query" parameter.'
    );
  }

  const query = data.query;

  // Optional: Rate limiting based on user
  // You can implement rate limiting here using Firestore

  try {
    const ai = getGeminiClient();

    const systemInstruction = `
      You are an expert concierge and local guide for Dahab, Egypt.
      The user is using the "AmakenDahab" app.
      Your tone should be relaxed, friendly, and helpful (the "Dahab vibe").

      You can help with:
      1. Recommending types of events (Parties, Diving, Hikes, Yoga).
      2. Suggesting local areas (Lighthouse, Mashraba, Laguna, Assalah).
      3. Explaining how to pay with Vodafone Cash or Instapay in Egypt.
      4. Giving tips on wind conditions for kitesurfing.

      Keep answers concise and formatted nicely. Do not make up specific phone numbers,
      but you can suggest general places.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const responseText = response.text || "I'm having a bit of trouble hearing the waves. Can you ask that again?";

    return {
      success: true,
      response: responseText
    };

  } catch (error: any) {
    console.error('Gemini AI Error:', error);

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get AI response. Please try again later.',
      { originalError: error.message }
    );
  }
});

// HTTP function version (if you prefer REST over callable)
export const dahabConciergeHttp = functions.https.onRequest(async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  const { query } = request.body;

  if (!query || typeof query !== 'string') {
    response.status(400).json({ error: 'Missing or invalid query parameter' });
    return;
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `
      You are an expert concierge and local guide for Dahab, Egypt.
      The user is using the "AmakenDahab" app.
      Your tone should be relaxed, friendly, and helpful (the "Dahab vibe").

      You can help with:
      1. Recommending types of events (Parties, Diving, Hikes, Yoga).
      2. Suggesting local areas (Lighthouse, Mashraba, Laguna, Assalah).
      3. Explaining how to pay with Vodafone Cash or Instapay in Egypt.
      4. Giving tips on wind conditions for kitesurfing.

      Keep answers concise and formatted nicely. Do not make up specific phone numbers,
      but you can suggest general places.
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const responseText = aiResponse.text || "I'm having a bit of trouble hearing the waves. Can you ask that again?";

    response.json({
      success: true,
      response: responseText
    });

  } catch (error: any) {
    console.error('Gemini AI Error:', error);
    response.status(500).json({
      success: false,
      error: 'Failed to get AI response'
    });
  }
});
