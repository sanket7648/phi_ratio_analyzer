import { useState } from 'react';
import { Upload, Video, X, Camera, Sparkles } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import WebcamAnalyzer from './components/WebcamAnalyzer';

function App() {
  const [activeMode, setActiveMode] = useState<'none' | 'upload' | 'webcam'>('none');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative min-h-screen flex flex-col">
        <header className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-blue-400" />
                <div className="absolute inset-0 blur-lg bg-blue-400 opacity-30" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                Face Analyzer
              </h1>
            </div>
            <p className="text-center text-slate-400 mt-3 text-lg">
              Advanced AI-powered facial recognition and analysis
            </p>
          </div>
        </header>

        {/* --- THIS IS THE LINE I CHANGED ---
          I changed 'items-center' to 'items-start' and added 'pt-8' (padding-top)
        */}
        <main className="flex-1 flex items-start justify-center px-4 pb-12 pt-8">
          {activeMode === 'none' && (
            <div className="max-w-5xl w-full">
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setActiveMode('upload')}
                  className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl">
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Upload Photo</h2>
                      <p className="text-slate-400">
                        Analyze a face from your photo gallery
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">Get Started</span>
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveMode('webcam')}
                  className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/20 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Live Webcam</h2>
                      <p className="text-slate-400">
                        Real-time face analysis with your camera
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-teal-400 group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">Start Live</span>
                      <Video className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-slate-300 text-sm">Powered by advanced AI technology</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'upload' && (
            <div className="max-w-4xl w-full">
              <button
                onClick={() => setActiveMode('none')}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Back to menu</span>
              </button>
              <ImageUpload />
            </div>
          )}

          {activeMode === 'webcam' && (
            <div className="max-w-4xl w-full">
              <button
                onClick={() => setActiveMode('none')}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Back to menu</span>
              </button>
              <WebcamAnalyzer />
            </div>
          )}
        </main>

        <footer className="py-6 text-center text-slate-500 text-sm">
          <p>Advanced facial recognition technology • Privacy-focused • Secure processing</p>
        </footer>
      </div>
    </div>
  );
}

export default App;