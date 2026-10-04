import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import HeatMapPage from "./pages/map/HeatMapPage";
import { Routes, Route } from "react-router-dom";
import ReportPage from "./pages/reports/Reports";
// import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    // <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reports" element={<ReportPage/>} />
        <Route path="/map" element={<HeatMapPage/>} />

      </Routes>
    // </AuthProvider>
  );
}

export default App;
