import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Watch from "./pages/Watch";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route path="/watch/:id" element={<Watch />} />



      </Routes>

    </BrowserRouter>
  );
}
export default App;