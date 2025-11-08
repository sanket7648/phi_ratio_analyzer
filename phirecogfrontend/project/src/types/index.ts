// This is the old type, you can keep it or remove it
export interface FaceAnalysisResult {
  age: string;
  gender: string;
  emotion: string;
  accessories: string;
  quality: string;
  confidence?: number;
}

// This is the new type for a single ratio
export interface PhiRatio {
  name: string;
  ratio: number;
  closeness_to_phi: number;
}

// This is the type for the API response (an array of ratios)
export type PhiRatioResult = PhiRatio[];

export interface AnalysisApiResponse {
  success: boolean;
  results: PhiRatioResult;
  annotated_image: string; // The base64 string for the "dotted" image
}

