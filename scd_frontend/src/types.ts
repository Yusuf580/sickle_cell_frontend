export interface Prediction {
  class_name: string;
  class_index: number;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface XAIData {
  gradcam_figure: string;
  gradcam_overlay: string;
  shap_figure: string | null;
}

export interface ClinicalData {
  interpretation: string;
  counterfactual: string;
  disclaimer: string;
}

export interface ModelInfo {
  architecture: string;
  parameters: string;
  input_size: string;
  xai_methods: string[];
}

export interface PredictionResult {
  prediction: Prediction;
  xai: XAIData;
  images: { original: string };
  clinical: ClinicalData;
  model_info: ModelInfo;
}
