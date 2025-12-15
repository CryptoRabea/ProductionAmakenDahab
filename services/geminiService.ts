/**
 * Gemini AI Service - Secure Cloud Function Implementation
 *
 * This service calls a Firebase Cloud Function to interact with Gemini AI.
 * The API key is kept secure on the backend and never exposed to clients.
 */

export const getDahabConciergeResponse = async (query: string): Promise<string> => {
  const cloudFunctionUrl = import.meta.env.VITE_CLOUD_FUNCTION_URL;

  if (!cloudFunctionUrl) {
    console.warn("Cloud Function URL not configured");
    return "I'm sorry, the concierge service is not configured yet. Please contact support.";
  }

  try {
    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.response) {
      return data.response;
    } else {
      throw new Error(data.error || 'Unknown error');
    }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    return "Sorry, I'm taking a break by the sea. Please try again later.";
  }
};
