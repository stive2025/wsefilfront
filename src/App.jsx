import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import ChatList from "./pages/chats/chatList";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navs />}>
          <Route path="/chatList" element={<ChatList/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
