import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import HeatMapPage from "./pages/map/HeatMapPage";
import { Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    // <AuthProvider>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<HeatMapPage/>}></Route>

      </Routes>
    // </AuthProvider>
  );
}

export default App;
