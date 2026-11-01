import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Watch from "./pages/Watch";
import LandingPage from "./pages/LandingPage";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route path="/watch/:id" element={<Watch />} />



      </Routes>

      <Toaster />

      </AuthProvider>

    </BrowserRouter>
  );
}
export default App;