import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeFace } from '../services/faceAnalysis';
import ResultDisplay from './ResultDisplay';
// Import the new type
import type { PhiRatioResult } from '../types';

export default function ImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhiRatioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- ADD THIS STATE ---
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        setError(null);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    setError(null);
    setAnnotatedImage(null); // Clear previous image

    try {
      const analysis = await analyzeFace(imageData);
      // --- UPDATE THESE ---
      setResult(analysis.results);
      setAnnotatedImage(analysis.annotated_image);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to analyze image. Please try again.');
      } else {
        setError('Failed to analyze image. Please try again.');
      }
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    // --- ADD THIS ---
    setAnnotatedImage(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImage(imageData);
        setError(null);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        {!image ? (
          // ... (Upload component, no changes needed here) ...
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/30 transition-all duration-300 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl group-hover:scale-110 transition-transform">
                  <Upload className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Upload your photo
                </p>
                <p className="text-slate-400">
                  Drag and drop or click to browse
                </p>
              </div>
              <p className="text-sm text-slate-500">
                Supports: JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-900">
              <img
                src={image}
                alt="Uploaded"
                className="w-full h-auto max-h-96 object-contain"
              />
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {analyzing && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-slate-300">Analyzing face...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {result && !analyzing && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300">Analysis complete</span>
              </div>
            )}
          </div>
        )}
      </div>

      {result && (
        <ResultDisplay 
          result={result} 
          // --- PASS THE NEW PROP ---
          annotatedImage={annotatedImage} 
        />
      )}
    </div>
  );
}