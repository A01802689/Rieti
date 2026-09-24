import Login from "./pages/login/Login";
import HomePage from "./pages/home/HomePage";
import { Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    // <AuthProvider>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<HomePage />} />

      </Routes>
    // </AuthProvider>
  );
}

export default App;
