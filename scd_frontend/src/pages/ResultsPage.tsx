import { useState } from "react";
import type { PredictionResult } from "../types";

interface Props {
  result: PredictionResult;
  onReset: () => void;
}

// ── Confidence bar ────────────────────────────────────────────────────
function ConfidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

// ── XAI image card ────────────────────────────────────────────────────
function XAICard({ title, subtitle, b64, badge }: {
  title: string; 
  subtitle: string; 
  b64: string | null; 
  badge?: string;
}) {
  if (!b64) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 flex items-center justify-center h-48">
        <p className="text-slate-600 text-sm">Not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden group">
      <div className="p-4 border-b border-white/5 flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <img 
          src={`data:image/png;base64,${b64}`} 
          alt={title}
          className="w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.01]" 
        />
      </div>
    </div>
  );
}

// ── Metric pill ───────────────────────────────────────────────────────
function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

export default function ResultsPage({ result, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"gradcam" | "shap" | "clinical">("gradcam");
  
  const isSickle = result.prediction.class_index === 1;
  const probs = result.prediction.probabilities;

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slide-up 0.5s ease-out forwards; }
        @keyframes pulse-border {
          0%,100% { border-color: rgba(239,68,68,0.3); }
          50%      { border-color: rgba(239,68,68,0.7); }
        }
        .pulse-border-red { animation: pulse-border 2s ease-in-out infinite; }
        @keyframes pulse-border-green {
          0%,100% { border-color: rgba(16,185,129,0.3); }
          50%      { border-color: rgba(16,185,129,0.6); }
        }
        .pulse-border-green { animation: pulse-border-green 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 bg-black/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm">SickleXAI — Analysis Report</span>
          </div>
          <button onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10
              text-slate-300 hover:text-white text-sm transition-all border border-white/5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            New Analysis
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── VERDICT CARD ── */}
        <div className={`slide-up rounded-2xl border-2 p-6 relative overflow-hidden
          ${isSickle
            ? "bg-red-500/5 pulse-border-red"
            : "bg-emerald-500/5 pulse-border-green"
          }`}>
          {/* Background glow */}
          <div className={`absolute inset-0 opacity-5 ${
            isSickle
              ? "bg-gradient-to-br from-red-500 to-orange-500"
              : "bg-gradient-to-br from-emerald-500 to-teal-500"
          }`} />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isSickle ? "bg-red-500/20 border border-red-500/30" : "bg-emerald-500/20 border border-emerald-500/30"
            }`}>
              <span className="text-3xl">{isSickle ? "🔴" : "🟢"}</span>
            </div>

            {/* Verdict */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase tracking-widest ${
                  isSickle ? "text-red-400" : "text-emerald-400"
                }`}>Classification Result</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {result.prediction.class_name}
              </h2>
              <p className={`text-lg font-semibold ${
                isSickle ? "text-red-300" : "text-emerald-300"
              }`}>
                {result.prediction.confidence.toFixed(1)}% confidence
              </p>
            </div>

            {/* Confidence bars */}
            <div className="md:w-72 space-y-3">
              {Object.entries(probs).map(([label, val]) => (
                <ConfidenceBar key={label} label={label} value={val}
                  color={label.includes("Positive")
                    ? "bg-gradient-to-r from-red-500 to-orange-400"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  } />
              ))}
            </div>
          </div>
        </div>

        {/* ── IMAGE + MODEL INFO ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold text-sm">Input Image</h3>
              <p className="text-slate-500 text-xs">Peripheral blood smear</p>
            </div>
            <div className="p-3">
              <img src={`data:image/png;base64,${result.images.original}`}
                alt="Input blood smear"
                className="w-full rounded-lg object-contain max-h-52 bg-black/40" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-3">Model Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Pill label="Architecture"  value={result.model_info.architecture} />
              <Pill label="Parameters"    value={result.model_info.parameters} />
              <Pill label="Input size"    value={result.model_info.input_size} />
              <Pill label="XAI methods"   value={result.model_info.xai_methods.join(" · ")} />
            </div>

            {/* XAI method pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {result.model_info.xai_methods.map(m => (
                <span key={m} className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── XAI TABS ── */}
        <div className="slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-4">
            {([
              { key: "gradcam",  label: "🗺️  Grad-CAM",     desc: "Where the model looked" },
              { key: "shap",     label: "📊  SHAP",         desc: "Why it decided" },
              { key: "clinical", label: "🏥  Clinical",     desc: "Interpretation & report" },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-300"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grad-CAM tab */}
          {activeTab === "gradcam" && (
            <div className="space-y-4 slide-up">
              <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-4">
                <p className="text-cyan-300 text-sm font-medium mb-1">What is Grad-CAM?</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Gradient-weighted Class Activation Mapping highlights the image regions that most
                  influenced the model's prediction. <strong className="text-slate-300">Red/warm areas</strong> = high
                  attention. For sickle cell detection, the model should focus on elongated,
                  crescent-shaped cell morphology.
                </p>
                <p className="text-slate-500 text-xs mt-2 font-mono">
                  Formula: L<sup>c</sup> = ReLU(Σ<sub>k</sub> α<sup>c</sup><sub>k</sub> · A<sup>k</sup>)
                </p>
              </div>
              <XAICard
                title="Grad-CAM Full Analysis"
                subtitle="Original · Heatmap · Overlay comparison"
                b64={result.xai.gradcam_figure}
                badge="Grad-CAM" />
              <XAICard
                title="Heatmap Overlay"
                subtitle="Direct overlay on blood smear"
                b64={result.xai.gradcam_overlay}
                badge="Overlay" />
            </div>
          )}

          {/* SHAP tab */}
          {activeTab === "shap" && (
            <div className="space-y-4 slide-up">
              <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-4">
                <p className="text-violet-300 text-sm font-medium mb-1">What is SHAP?</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  SHAP (SHapley Additive exPlanations) assigns each pixel an importance score
                  based on game theory — how much did this pixel <em>cause</em> the prediction?
                  <strong className="text-slate-300"> Warm colours</strong> push toward Sickle Cell,
                  <strong className="text-slate-300"> cool colours</strong> push toward Normal.
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Method: GradientExplainer with random background distribution
                </p>
              </div>
              <XAICard
                title="SHAP Pixel Importance"
                subtitle="Per-pixel causal contribution to prediction"
                b64={result.xai.shap_figure}
                badge="SHAP" />
              {!result.xai.shap_figure && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4">
                  <p className="text-amber-300 text-sm">SHAP computation requires significant memory.
                    Ensure the backend has sufficient RAM and SHAP is installed.</p>
                </div>
              )}
            </div>
          )}

          {/* Clinical tab */}
          {activeTab === "clinical" && (
            <div className="space-y-4 slide-up">

              {/* Interpretation */}
              <div className={`rounded-xl border p-5 ${
                isSickle
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{isSickle ? "⚠️" : "✅"}</span>
                  <h3 className={`font-semibold text-sm ${isSickle ? "text-red-300" : "text-emerald-300"}`}>
                    Clinical Interpretation
                  </h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.clinical.interpretation}
                </p>
              </div>

              {/* Counterfactual explanation */}
              <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔍</span>
                  <h3 className="text-violet-300 font-semibold text-sm">Causal Counterfactual Explanation</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {result.clinical.counterfactual}
                </p>
                <p className="text-slate-500 text-xs mt-3 italic">
                  This explanation describes the morphological features the model identified
                  as causally responsible for the classification decision.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3">
                <span className="text-amber-400 text-lg flex-shrink-0">⚕️</span>
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  {result.clinical.disclaimer}
                </p>
              </div>

              {/* Suggested next steps */}
              {isSickle && (
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">Suggested Next Steps</h3>
                  <div className="space-y-2">
                    {[
                      "Refer patient to haematologist for confirmatory diagnosis",
                      "Request Haemoglobin electrophoresis (Hb electrophoresis)",
                      "Consider Sickledex solubility test",
                      "Document findings and flag for clinical review",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-cyan-300 text-xs">{i + 1}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── NEW ANALYSIS BUTTON ── */}
        <button onClick={onReset}
          className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10
            text-white font-semibold text-sm transition-all duration-200 slide-up"
          style={{ animationDelay: "0.3s" }}>
          ← Analyse Another Image
        </button>
      </div>
    </div>
  );
}
