import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Camera, Loader2, AlertCircle } from 'lucide-react';
import { analyzeFace } from '../services/faceAnalysis';
import ResultDisplay from './ResultDisplay';
import type { PhiRatioResult } from '../types';

// Get the base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function WebcamAnalyzer() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhiRatioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const requestRef = useRef<number>();

  // --- WebSocket Connection ---
  useEffect(() => {
    if (isActive && isVideoReady) {
      if (!API_BASE_URL) {
        console.error("VITE_API_BASE_URL is not set. WebSocket cannot connect.");
        setError("Configuration error. Cannot connect to live analysis.");
        return;
      }

      // --- THIS IS THE FIX ---
      // Convert 'http://localhost:8000' to 'ws://localhost:8000/ws/realtime-face'
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws/realtime-face';
      
      console.log("Connecting to WebSocket at:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WS Connected");
        sendFrames();
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        drawDots(data.landmarks);
      };
      ws.onclose = () => console.log("WS Closed");
      ws.onerror = (err) => console.error("WS Error:", err);
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isVideoReady]);

  // --- Send Frames Loop ---
  const sendFrames = () => {
    if (!isActive || !videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
       requestRef.current = requestAnimationFrame(sendFrames);
       return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.videoWidth > 0) {
      const width = 320;
      const scale = width / video.videoWidth;
      canvas.width = width;
      canvas.height = video.videoHeight * scale;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      wsRef.current.send(canvas.toDataURL('image/jpeg', 0.5));
    }
    setTimeout(() => {
        requestRef.current = requestAnimationFrame(sendFrames);
    }, 66);
  };

  // --- Draw Dots Overlay ---
  const drawDots = (landmarks: number[][]) => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    overlay.width = video.clientWidth;
    overlay.height = video.clientHeight;
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (!landmarks.length) return;

    const scaleX = overlay.width / 320;
    const scaleY = overlay.height / (video.videoHeight * (320 / video.videoWidth));

    ctx.fillStyle = '#00ff00';
    ctx.save();
    ctx.translate(overlay.width, 0);
    ctx.scale(-1, 1);
    landmarks.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x * scaleX, y * scaleY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
  };

  // --- Standard video setup (unchanged) ---
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error(e));
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  // --- Handlers (unchanged) ---
  const startWebcam = async () => {
    try {
      setError(null); setIsVideoReady(false); setResult(null); setAnnotatedImage(null);
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
      setStream(ms); setIsActive(true);
    } catch (e) { setError('Camera access denied'); }
  };

  const stopWebcam = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); setIsActive(false); setResult(null); setIsVideoReady(false); setAnnotatedImage(null); }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;
    setAnalyzing(true); setError(null); setAnnotatedImage(null);
    try {
      const video = videoRef.current; const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.9);
      const res = await analyzeFace(data);
      setResult(res.results); setAnnotatedImage(res.annotated_image);
    } catch (e) { setError('Analysis failed'); } finally { setAnalyzing(false); }
  };

  // --- JSX (unchanged from your file) ---
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        {!isActive ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20" />
                <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl">
                  <Video className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">Start your webcam</p>
                <p className="text-slate-400">Click below to begin live face analysis</p>
              </div>
              <button onClick={startWebcam} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-teal-500/30">
                Start Webcam
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden bg-slate-900">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-auto max-h-96 object-contain transform scale-x-[-1]"
                onCanPlay={() => setIsVideoReady(true)}
              />
              <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Analysis</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={captureAndAnalyze} disabled={analyzing || !isVideoReady} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center gap-2">
                {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Camera className="w-5 h-5" /> {isVideoReady ? "Capture & Analyze" : "Loading Camera..."}</>}
              </button>
              <button onClick={stopWebcam} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2">
                <VideoOff className="w-5 h-5" /> Stop Webcam
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300">{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {result && <ResultDisplay result={result} annotatedImage={annotatedImage} />}
    </div>
  );
}