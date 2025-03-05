import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import ChatComplete from "/src/pages/chats/chatComplete.jsx"
import { ContactInfoClick, ChatInterfaceClick, TagClick, ResolveClick } from "./contexts/chats.js"
import { useState } from "react";



function App() {

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [tagClick, setTagClick] = useState(null);
  const [resolveClick, setResolveClick] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Navs />}>
          <Route path="/chatList" element={
            <ResolveClick.Provider value={{ resolveClick, setResolveClick }}>
              <TagClick.Provider value={{ tagClick, setTagClick }}>
                <ChatInterfaceClick.Provider value={{ selectedChatId, setSelectedChatId }}>
                  <ContactInfoClick.Provider value={{ infoOpen, setInfoOpen }}>
                    <ChatComplete />
                  </ContactInfoClick.Provider>
                </ChatInterfaceClick.Provider>
              </TagClick.Provider>
            </ResolveClick.Provider>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
