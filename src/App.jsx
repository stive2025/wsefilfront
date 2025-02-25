import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import ChatComplete from "./pages/chats/chatComplete.jsx"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navs />}>
          <Route path="/chatList" element={<ChatComplete/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
