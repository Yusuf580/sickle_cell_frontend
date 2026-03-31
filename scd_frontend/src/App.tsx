import { useSicklePrediction } from "./hooks/useSickleCellPrediction";
import ResultsPage from "./pages/ResultsPage";
import UploadPage from "./pages/UploadPage";


export default function SickleApp() {
  const { predict, result, loading, error, reset } = useSicklePrediction();

  const handleAnalyse = async (base64: string) => {
    await predict(base64);
  };

  if (result) {
    return <ResultsPage result={result} onReset={reset} />;
  }

  return (
    <UploadPage 
      onAnalyse={handleAnalyse} 
      isLoading={loading} 
      apiError={error} 
    />
  );
}