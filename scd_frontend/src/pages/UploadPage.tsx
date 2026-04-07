import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Microscope, Upload, Camera, X, FlaskConical,
  ArrowLeft, CheckCircle2, Loader2, AlertCircle, Image as ImageIcon
} from "lucide-react";

interface Props {
  onAnalyse: (input: string) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}

// ── Loading steps indicator ───────────────────────────────────────────
const LOADING_STEPS = [
  "Preprocessing image…",
  "Running EfficientNetB0…",
  "Generating Grad-CAM heatmap…",
  "Computing SHAP values…",
  "Preparing clinical report…",
];

function LoadingPanel() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center py-16 px-6">
      {/* Animated ring */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Microscope className="w-8 h-8 text-emerald-500" />
        </div>
      </div>

      <p className="text-slate-700 font-semibold text-lg mb-1">Analysing your image…</p>
      <p className="text-slate-400 text-sm mb-8">This usually takes a few seconds</p>

      <div className="w-full max-w-xs space-y-3">
        {LOADING_STEPS.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= step ? "opacity-100" : "opacity-30"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              i < step ? "bg-emerald-500" : i === step ? "bg-emerald-500 animate-pulse" : "bg-slate-200"
            }`}>
              {i < step
                ? <CheckCircle2 className="w-3 h-3 text-white" />
                : i === step
                  ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                  : null
              }
            </div>
            <span className={i <= step ? "text-slate-700 font-medium" : "text-slate-400"}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Scan overlay (for preview & camera) ──────────────────────────────
function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"
        style={{ animation: "scanline 2.5s ease-in-out infinite" }} />
      {/* Corner brackets */}
      {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2",
        "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 border-emerald-400 rounded-sm ${cls}`} />
      ))}
    </div>
  );
}

export default function UploadPage({ onAnalyse, isLoading, apiError }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMode("camera");
    } catch {
      alert("Camera access denied. Please allow permissions or upload an image.");
    }
  };

  const stopCamera = useCallback(() => {
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setMode("upload");
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg"));
    stopCamera();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex flex-col">
      <style>{`
        @keyframes scanline {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Microscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">SickleXAI</span>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              Blood Smear Analysis
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {!isLoading && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload a Blood Smear</h1>
            <p className="text-slate-500">Take a photo or upload an image for AI-powered analysis</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm">
            <LoadingPanel />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Mode tabs */}
            {!preview && (
              <div className="flex gap-2 mb-5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setMode("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === "upload"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Image
                </button>
                <button
                  onClick={startCamera}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === "camera"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Camera className="w-4 h-4" /> Take Photo
                </button>
              </div>
            )}

            {/* Camera */}
            {mode === "camera" && cameraStream && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 mb-5 shadow-lg">
                <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
                <ScanLine />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                  <button onClick={stopCamera}
                    className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium backdrop-blur transition">
                    Cancel
                  </button>
                  <button onClick={capturePhoto}
                    className="px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition shadow-lg">
                    Capture Photo
                  </button>
                </div>
              </div>
            )}

            {/* Upload zone */}
            {mode === "upload" && !preview && (
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors ${
                  dragOver ? "bg-emerald-100" : "bg-slate-100"
                }`}>
                  <ImageIcon className={`w-8 h-8 transition-colors ${dragOver ? "text-emerald-500" : "text-slate-400"}`} />
                </div>
                <p className="text-slate-700 font-semibold text-base mb-1">
                  {dragOver ? "Drop your image here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-slate-400 text-sm">Supports JPG, PNG, TIFF blood smear images</p>
                <div className="mt-6">
                  <span className="inline-block px-6 py-2.5 rounded-full bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-200">
                    Browse Files
                  </span>
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="relative rounded-2xl overflow-hidden mb-5 shadow-lg bg-slate-900">
                <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
                <ScanLine />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur text-white text-xs font-medium">
                    ✓ Image loaded — ready to analyse
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {apiError && (
              <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 mb-5">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-semibold text-sm mb-0.5">Analysis Failed</p>
                  <p className="text-red-500 text-sm">{apiError}</p>
                </div>
              </div>
            )}

            {/* Analyse button */}
            {preview && (
              <button
                onClick={() => onAnalyse(preview)}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-all shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <FlaskConical className="w-5 h-5" />
                Analyse Blood Smear
              </button>
            )}

            {/* Tips */}
            {!preview && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="text-slate-600 font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-emerald-500">💡</span> Tips for best results
                </p>
                <ul className="space-y-2 text-slate-500 text-sm">
                  {[
                    "Use a well-focused image from a light microscope",
                    "Ensure good lighting — avoid over- or under-exposed images",
                    "Peripheral blood smear images work best (thin smear)",
                    "Image resolution of at least 224×224 pixels recommended",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
