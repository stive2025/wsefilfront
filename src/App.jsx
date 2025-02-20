import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import HomeChat from "./pages/home/home-chat";

function App() {
  
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/home" element={<HomeChat />} />
    </Routes>
  </Router>
  );
}

export default App
