import Login from "./pages/login/Login";
import { Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    // <AuthProvider>
      <Routes>
        <Route path="/" element={<Login/>} />

      </Routes>
    // </AuthProvider>
  );
}

export default App;
