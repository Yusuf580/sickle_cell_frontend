// hooks/useSicklePrediction.ts
import { useState, useCallback } from "react";
import type { PredictionResult } from "../types";

const SPACE_URL = "https://sickle-cell-backend.onrender.com";

export function useSicklePrediction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  /**
   * Converts any supported input (File, Blob, blob URL, or base64 string)
   * into a File object ready for FormData.
   */
  const toFile = async (input: string | File | Blob): Promise<File> => {
    // Already a File — use it directly (best case, no encoding needed)
    if (input instanceof File) return input;

    // Blob object — wrap in File
    if (input instanceof Blob) {
      return new File([input], "blood_smear.png", { type: input.type || "image/png" });
    }

    // Blob URL: "blob:http://localhost:5173/..."
    if (input.startsWith("blob:")) {
      const response = await fetch(input);
      const blob = await response.blob();
      return new File([blob], "blood_smear.png", { type: blob.type || "image/png" });
    }

    // Base64 string (with or without data URL prefix)
    let base64 = input;
    // Strip data URL prefix e.g. "data:image/png;base64,"
    base64 = base64.replace(/^data:[^;]+;base64,/, "");
    // Remove any whitespace/newlines that break atob()
    base64 = base64.replace(/\s/g, "");

    let byteArray: Uint8Array;
    try {
      const byteCharacters = atob(base64);
      byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
    } catch (e) {
      throw new Error(
        `Invalid base64 input. Make sure you're passing a base64 string or a File object. Original error: ${(e as DOMException).message}`
      );
    }

    const blob = new Blob([new Uint8Array(byteArray)], { type: "image/png" });
    return new File([blob], "blood_smear.png", { type: "image/png" });
  };

  const predict = useCallback(async (input: string | File | Blob) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const file = await toFile(input);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${SPACE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorText = "";
        try {
          const errJson = await response.json();
          errorText = errJson.detail || JSON.stringify(errJson);
        } catch {
          errorText = await response.text();
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ API Success Response:", data);
      setResult(data as PredictionResult);
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message || "Server error. The backend may be sleeping.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { predict, result, loading, error, reset };
}