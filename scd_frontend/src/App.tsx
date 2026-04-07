import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import { useSicklePrediction } from "./hooks/useSickleCellPrediction";

function AppRoutes() {
  const navigate = useNavigate();
  const { predict, result, loading, error, reset } = useSicklePrediction();

  const handleAnalyse = async (input: string) => {
    await predict(input);
    navigate("/results");
  };

  const handleReset = () => {
    reset();
    navigate("/upload");
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/upload"
        element={
          <UploadPage
            onAnalyse={handleAnalyse}
            isLoading={loading}
            apiError={error}
          />
        }
      />
      <Route
        path="/results"
        element={
          result ? (
            <ResultsPage result={result} onReset={handleReset} />
          ) : (
            // If no result (e.g. direct navigation), redirect to upload
            <UploadPage
              onAnalyse={handleAnalyse}
              isLoading={loading}
              apiError={error}
            />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
