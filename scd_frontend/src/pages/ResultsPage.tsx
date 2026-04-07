import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PredictionResult } from "../types";
import {
  Microscope, ArrowLeft, Upload, CheckCircle2, AlertTriangle,
  Map, BarChart3, Stethoscope, Info, ChevronRight, RefreshCw
} from "lucide-react";

interface Props {
  result: PredictionResult;
  onReset: () => void;
}

// ── Confidence bar ────────────────────────────────────────────────────
function ConfidenceBar({ label, value, positive }: { label: string; value: number; positive: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${positive ? "bg-gradient-to-r from-red-400 to-rose-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── XAI image card ────────────────────────────────────────────────────
function XAICard({ title, subtitle, b64, badge, badgeColor = "emerald" }: {
  title: string;
  subtitle: string;
  b64: string | null;
  badge?: string;
  badgeColor?: "emerald" | "violet" | "sky";
}) {
  const badgeStyles: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    violet: "bg-violet-50 border-violet-200 text-violet-700",
    sky: "bg-sky-50 border-sky-200 text-sky-700",
  };

  if (!b64) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 flex items-center justify-center h-48">
        <p className="text-slate-400 text-sm">Not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-slate-800 font-bold text-sm">{title}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
        </div>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${badgeStyles[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <img
          src={`data:image/png;base64,${b64}`}
          alt={title}
          className="w-full rounded-xl object-contain transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </div>
    </div>
  );
}

// ── Metric tile ───────────────────────────────────────────────────────
function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-slate-800 font-bold text-sm">{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function ResultsPage({ result, onReset }: Props) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"gradcam" | "shap" | "clinical">("gradcam");

  const isSickle = result.prediction.class_index === 1;
  const probs = result.prediction.probabilities;

  const tabs = [
    { key: "gradcam" as const, label: "Grad-CAM", icon: <Map className="w-4 h-4" /> },
    { key: "shap" as const, label: "SHAP", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "clinical" as const, label: "Clinical", icon: <Stethoscope className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      {/* Sticky header */}
      <header className="bg-white/90 backdrop-blur border-b border-emerald-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Microscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">SickleXAI — Analysis Report</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── VERDICT CARD ── */}
        <div className={`rounded-3xl p-6 border-2 relative overflow-hidden ${
          isSickle
            ? "bg-red-50 border-red-200"
            : "bg-emerald-50 border-emerald-200"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
              isSickle ? "bg-red-100 border-red-200" : "bg-emerald-100 border-emerald-200"
            }`}>
              {isSickle
                ? <AlertTriangle className="w-8 h-8 text-red-500" />
                : <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              }
            </div>

            {/* Verdict text */}
            <div className="flex-1">
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                isSickle ? "text-red-500" : "text-emerald-600"
              }`}>
                Classification Result
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {result.prediction.class_name}
              </h2>
              <p className={`text-base font-semibold ${isSickle ? "text-red-600" : "text-emerald-600"}`}>
                {result.prediction.confidence.toFixed(1)}% confidence
              </p>
            </div>

            {/* Confidence bars */}
            <div className="md:w-72 space-y-3">
              {Object.entries(probs).map(([label, val]) => (
                <ConfidenceBar key={label} label={label} value={val} positive={label.toLowerCase().includes("positive")} />
              ))}
            </div>
          </div>
        </div>

        {/* ── INPUT IMAGE + MODEL INFO ── */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="text-slate-800 font-bold text-sm">Input Image</h3>
              <p className="text-slate-400 text-xs">Peripheral blood smear</p>
            </div>
            <div className="p-4">
              <img
                src={`data:image/png;base64,${result.images.original}`}
                alt="Input smear"
                className="w-full rounded-xl object-contain max-h-56 bg-slate-50"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm mb-4 pb-3 border-b border-slate-50">Model Details</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricTile label="Architecture" value={result.model_info.architecture} />
              <MetricTile label="Parameters" value={result.model_info.parameters} />
              <MetricTile label="Input Size" value={result.model_info.input_size} />
              <MetricTile label="XAI Methods" value={result.model_info.xai_methods.join(" · ")} />
            </div>
            <div className="flex flex-wrap gap-2">
              {result.model_info.xai_methods.map(m => (
                <span key={m} className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── XAI TABS ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 p-1 gap-1 bg-slate-50/50">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-white text-emerald-600 shadow-sm border border-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Grad-CAM */}
            {tab === "gradcam" && (
              <div className="space-y-4">
                <div className="flex gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-100">
                  <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sky-700 font-semibold text-sm mb-1">What is Grad-CAM?</p>
                    <p className="text-sky-600 text-xs leading-relaxed">
                      Gradient-weighted Class Activation Mapping highlights image regions that most influenced the model's prediction.
                      Warm (red) areas indicate high attention. For sickle cell detection, the model focuses on crescent-shaped cell morphology.
                    </p>
                  </div>
                </div>
                <XAICard title="Grad-CAM Full Analysis" subtitle="Original · Heatmap · Overlay comparison" b64={result.xai.gradcam_figure} badge="Grad-CAM" badgeColor="emerald" />
                <XAICard title="Heatmap Overlay" subtitle="Direct overlay on blood smear" b64={result.xai.gradcam_overlay} badge="Overlay" badgeColor="sky" />
              </div>
            )}

            {/* SHAP */}
            {tab === "shap" && (
              <div className="space-y-4">
                <div className="flex gap-3 p-4 rounded-2xl bg-violet-50 border border-violet-100">
                  <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-violet-700 font-semibold text-sm mb-1">What is SHAP?</p>
                    <p className="text-violet-600 text-xs leading-relaxed">
                      SHAP (SHapley Additive exPlanations) assigns each pixel an importance score based on game theory.
                      Warm colours push toward Sickle Cell; cool colours push toward Normal.
                    </p>
                  </div>
                </div>
                <XAICard title="SHAP Pixel Importance" subtitle="Per-pixel causal contribution to prediction" b64={result.xai.shap_figure} badge="SHAP" badgeColor="violet" />
                {!result.xai.shap_figure && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    SHAP computation requires significant memory. Ensure the backend has sufficient RAM.
                  </div>
                )}
              </div>
            )}

            {/* Clinical */}
            {tab === "clinical" && (
              <div className="space-y-4">
                {/* Interpretation */}
                <div className={`rounded-2xl border p-5 ${isSickle ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {isSickle
                      ? <AlertTriangle className="w-4 h-4 text-red-500" />
                      : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    }
                    <h3 className={`font-bold text-sm ${isSickle ? "text-red-700" : "text-emerald-700"}`}>
                      Clinical Interpretation
                    </h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.clinical.interpretation}</p>
                </div>

                {/* Counterfactual */}
                <div className="rounded-2xl bg-teal-50 border border-teal-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-teal-600" />
                    <h3 className="text-teal-700 font-bold text-sm">Causal Counterfactual Explanation</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.clinical.counterfactual}</p>
                  <p className="text-slate-400 text-xs mt-3 italic">
                    Describes the morphological features causally responsible for the classification.
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-xs leading-relaxed">{result.clinical.disclaimer}</p>
                </div>

                {/* Next steps */}
                {isSickle && (
                  <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
                    <h3 className="text-slate-800 font-bold text-sm mb-4">Suggested Next Steps</h3>
                    <div className="space-y-3">
                      {[
                        "Refer patient to haematologist for confirmatory diagnosis",
                        "Request Haemoglobin electrophoresis (Hb electrophoresis)",
                        "Consider Sickledex solubility test",
                        "Document findings and flag for clinical review",
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-emerald-700 text-xs font-bold">{i + 1}</span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── ANOTHER ANALYSIS ── */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all hover:border-emerald-300 hover:text-emerald-700 shadow-sm"
        >
          <Upload className="w-4 h-4" /> Analyse Another Image
        </button>
      </div>
    </div>
  );
}
