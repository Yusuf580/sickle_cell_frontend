import { useState, useRef, useCallback, useEffect } from "react";


interface Props {
  onAnalyse: (input: string) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}

function HelixLoader() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-24">
        {[0,1,2,3,4,5].map((i) => (
          <div key={i} className="absolute w-full flex justify-between"
            style={{ top: `${i * 16}px`, animationDelay: `${i * 0.1}s` }}>
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1.4s" }} />
            <div className="w-3 h-3 rounded-full bg-violet-400 animate-ping"
              style={{ animationDelay: `${i * 0.15 + 0.7}s`, animationDuration: "1.4s" }} />
          </div>
        ))}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 96" fill="none">
          <path d="M8 8 C40 24 24 48 8 64 C40 80 24 96 8 96"
            stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" fill="none"/>
          <path d="M56 8 C24 24 40 48 56 64 C24 80 40 96 56 96"
            stroke="rgba(167,139,250,0.3)" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-cyan-300 font-semibold text-lg tracking-wide">Analysing blood smear</p>
        <p className="text-slate-400 text-sm mt-1">Running EfficientNetB0 · Grad-CAM · SHAP</p>
      </div>
    </div>
  );
}

function ScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
        style={{ animation: "scan 2s ease-in-out infinite", top: "0%" }} />
      <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-2xl" />
      {[
        "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
        "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
        "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
        "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-6 h-6 border-cyan-400 ${cls}`} />
      ))}
    </div>
  );
}

export default function UploadPage({ onAnalyse, isLoading, apiError }: Props) {
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadingSteps = [
    "Preprocessing image…",
    "Running EfficientNetB0…",
    "Generating Grad-CAM heatmap…",
    "Computing SHAP values…",
    "Preparing clinical report…",
  ];

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(s => Math.min(s + 1, loadingSteps.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 }
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

    canvas.toBlob(blob => {
      if (!blob) return;
      setPreview(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(dropped));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyse = async () => {
  if (!preview) return;
  await onAnalyse(preview); // pass the full data URL or blob URL as-is
};

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.3); } 50% { box-shadow: 0 0 40px rgba(34,211,238,0.6); } }
      `}</style>

      {/* Header */}
      <header className="px-6 py-5 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">SickleXAI</h1>
              <p className="text-slate-500 text-xs mt-0.5">EfficientNetB0 · Grad-CAM · SHAP</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          <span className="text-white">Sickle Cell</span><br />
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Blood Smear Analysis</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Upload or capture a peripheral blood smear image for AI analysis with explainability.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 flex-1 w-full">
        {/* Mode Toggle */}
        {!preview && !isLoading && (
          <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
            {(["upload", "camera"] as const).map(m => (
              <button
                key={m}
                onClick={() => m === "camera" ? startCamera() : setMode("upload")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {m === "upload" ? "📁 Upload Image" : "📷 Take Photo"}
              </button>
            ))}
          </div>
        )}

        {/* Camera */}
        {mode === "camera" && cameraStream && (
          <div className="relative rounded-2xl overflow-hidden bg-black mb-6">
            <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
            <ScanOverlay />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
              <button onClick={stopCamera} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm">Cancel</button>
              <button onClick={capturePhoto} className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold">Capture</button>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        {mode === "upload" && !preview && !isLoading && (
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
              dragOver ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 hover:border-white/20"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-white font-medium mb-1">Drop blood smear image here</p>
            <p className="text-slate-500 text-sm">or click to browse</p>
          </div>
        )}

        {/* Preview */}
        {preview && !isLoading && (
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <img src={preview} alt="Preview" className="w-full max-h-80 object-contain bg-black/40" />
            <ScanOverlay />
            <button
              onClick={() => { setPreview(null);  }}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/70 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-12 text-center">
            <HelixLoader />
            <div className="mt-8 space-y-2">
              {loadingSteps.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${i <= loadingStep ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i < loadingStep ? "bg-emerald-500" : i === loadingStep ? "bg-cyan-500 animate-pulse" : "bg-white/10"}`}>
                    {i < loadingStep && <span>✓</span>}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Error */}
        {apiError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6">
            <p className="text-red-300 text-sm">{apiError}</p>
          </div>
        )}

        {/* Analyse Button */}
        {preview && !isLoading && (
          <button
            onClick={handleAnalyse}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-base transition-all"
          >
            Analyse Blood Smear
          </button>
        )}
      </div>
    </div>
  );
}