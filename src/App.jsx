import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import ChatComplete from "./pages/chats/chatComplete.jsx"
import {ContactInfoClick} from "./contexts/chats.js"
import { useState } from "react";



function App() {
  
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navs />}>
          <Route path="/chatList" element={
            <ContactInfoClick.Provider value={{infoOpen, setInfoOpen}}>
              <ChatComplete />
            </ContactInfoClick.Provider>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
