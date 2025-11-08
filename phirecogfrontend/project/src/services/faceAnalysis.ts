// Import the new types
import type { AnalysisApiResponse } from '../types';

// The Python server BASE URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Sends image data to the Python backend for analysis.
 * @param imageData The base64 data URL of the image
 * @returns A promise that resolves to the full analysis object
 */
export async function analyzeFace(imageData: string): Promise<AnalysisApiResponse> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set in your .env file.");
  }
  
  // We construct the full URL from the base URL and the specific endpoint
  const ANALYZE_URL = `${API_BASE_URL}/analyze-phi-ratio`;
  
  console.log(`Sending image to backend at ${ANALYZE_URL}...`);

  try {
    // We use the new, complete URL variable
    const response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_data: imageData }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If the server returned an error (like "No face found")
      // 'data.detail' is the error message from FastAPI
      throw new Error(data.detail || 'Failed to analyze face.');
    }

    // Return the full object: { success: true, results: [...], annotated_image: "..." }
    return data;

  } catch (err) {
    console.error('Error in analyzeFace:', err);
    // Re-throw the error so the component can catch it
    throw err;
  }
}