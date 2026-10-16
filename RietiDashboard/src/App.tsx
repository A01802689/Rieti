import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import HeatMapPage from "./pages/map/HeatMapPage";
import { Routes, Route, Navigate } from "react-router-dom";
import ReportPage from "./pages/reports/Reports";
import CasesPage from "./pages/cases/Cases";
import CaseDetailPage from "./pages/cases/CaseDetail";
import { AuthProvider } from "./context/AuthContext";
// import { RequireRole } from "./components/layout/RequireRole"; // needed when the guarded /users route below is enabled
import UsersPage from "./pages/users/Users";
//import LogsPage from "./pages/logs/Logs";
import NotFoundPage from "./pages/404/404";
import RecoveryPage from "./pages/recovery/Recovery";
import TokenPage from "./pages/recovery/Token";

/** Routes of the app, inside the session provider */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/recovery" element={<RecoveryPage/>} />
        <Route path="/recovery/token" element={<TokenPage/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reports" element={<ReportPage/>} />
        <Route path="/map" element={<HeatMapPage/>} />
        <Route path="/case" element={<CasesPage/>} />
        <Route path="/case/:id" element={<CaseDetailPage/>} />
        {/* <Route path="/users" element={<RequireRole role="Administrador"><UsersPage/></RequireRole>} /> */}
        <Route path="/users" element={<UsersPage/>} />
        {/* <Route path="/logs" element={<LogsPage/>} /> */}
        <Route path="*" element={<NotFoundPage/>} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
