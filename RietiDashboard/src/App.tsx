import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import HeatMapPage from "./pages/map/HeatMapPage";
import { Routes, Route } from "react-router-dom";
import ReportPage from "./pages/reports/Reports";
import CasesPage from "./pages/cases/Cases";
import CaseDetailPage from "./pages/cases/CaseDetail";
import { AuthProvider } from "./context/AuthContext";
import { RequireRole } from "./components/layout/RequireRole";
import UsersPage from "./pages/users/Users";

/** Routes of the app, inside the session provider */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reports" element={<ReportPage/>} />
        <Route path="/map" element={<HeatMapPage/>} />
        <Route path="/case" element={<CasesPage/>} />
        <Route path="/case/:id" element={<CaseDetailPage/>} />
        {/* <Route path="/users" element={<RequireRole role="Administrador"><UsersPage/></RequireRole>} /> */}
        <Route path="/users" element={<UsersPage/>} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
