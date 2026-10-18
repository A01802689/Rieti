import Login from "./pages/login/Login"
import HomePage from "./pages/home/HomePage"
import HeatMapPage from "./pages/map/HeatMapPage"
import { Routes, Route, Navigate } from "react-router-dom"
import ReportPage from "./pages/reports/Reports"
import ReportDetailPage from "./pages/reports/ReportDetail"
import CasesPage from "./pages/cases/Cases"
import CaseDetailPage from "./pages/cases/CaseDetail"
import { AuthProvider } from "./context/AuthContext"
import { RequirePermission } from "./components/layout/RequirePermission"
import UsersPage from "./pages/users/Users"
import LogsPage from "./pages/logsp/Logs"
import NoAccessPage from "./pages/noaccess/NoAccess"
import NotFoundPage from "./pages/404/404"
import RecoveryPage from "./pages/recovery/Recovery"
import TokenPage from "./pages/recovery/Token"
import { NO_ACCESS_ROUTE } from "./lib/routes"

/** Routes of the app, inside the session provider; every page of the panel asks for the permission that opens it */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/recovery" element={<RecoveryPage/>} />
        <Route path="/recovery/token" element={<TokenPage/>} />
        <Route path="/home" element={<RequirePermission permission="stats.view"><HomePage /></RequirePermission>} />
        <Route path="/reports" element={<RequirePermission permission="reports.view"><ReportPage/></RequirePermission>} />
        <Route path="/reports/:id" element={<RequirePermission permission="reports.view_detail"><ReportDetailPage/></RequirePermission>} />
        <Route path="/map" element={<RequirePermission permission="map.view"><HeatMapPage/></RequirePermission>} />
        <Route path="/cases" element={<RequirePermission permission="cases.view"><CasesPage/></RequirePermission>} />
        <Route path="/cases/:id" element={<RequirePermission permission="cases.view"><CaseDetailPage/></RequirePermission>} />
        <Route path="/users" element={<RequirePermission role="Administrador"><UsersPage/></RequirePermission>} />
        <Route path="/logs" element={<RequirePermission permission="logs.view"><LogsPage/></RequirePermission>} />
        <Route path={NO_ACCESS_ROUTE} element={<RequirePermission><NoAccessPage/></RequirePermission>} />
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
