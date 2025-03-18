import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import UtilNavs from "./pages/Layout/utilitiesLayout";
import ChatComplete from "/src/pages/chats/chatComplete.jsx"
import TagsComplete from "/src/pages/util/tagsComplete.jsx"
import AutoComplete from "/src/pages/util/autoMComplete.jsx"
import CustomComplete from "/src/pages/util/customMComplete.jsx"
import ContactsComplete from "/src/pages/contacts/contactsComplete.jsx"
import AgentsComplete from "/src/pages/agents/agentsComplete.jsx"
import ProfileComplete from "/src/pages/profile/profileComplete.jsx"


import {
  ContactInfoClick, ChatInterfaceClick, TagClick, ResolveClick, TagsCreateForm, UpdateAgentForm, AgentHandle,
  AutoCreateForm, CustomCreateForm, NewContactForm, SearchInChatClick, NewAgentForm, ProfileInfoPanel, NewMessage
} from "./contexts/chats.js"
import { useState } from "react";



function App() {

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [tagClick, setTagClick] = useState(null);
  const [resolveClick, setResolveClick] = useState(null);
  const [tagsClick, setTagsClick] = useState(null);
  const [customClick, setCustomClick] = useState(null);
  const [autoClick, setAutoClick] = useState(null);
  const [contactNew, setContactNew] = useState(null);
  const [agentNew, setAgentNew] = useState(null);
  const [searchInChat, setSearchInChat] = useState(null);
  const [profileInfoOpen, SetProfileInfoOpen] = useState(null);
  const [newMessage, setNewMessage] = useState(false)
  const [agentFind, setAgentFind] = useState(null)
  const [agentHandle, setAgentHandle] = useState(null)


  return (
    <Router>
      <NewMessage.Provider value={{ newMessage, setNewMessage }}>
        <ChatInterfaceClick.Provider value={{ selectedChatId, setSelectedChatId }}>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/utilities" element={<UtilNavs />}>
              <Route path="/utilities/tags" element={
                <TagsCreateForm.Provider value={{ tagsClick, setTagsClick }}>
                  <TagsComplete />
                </TagsCreateForm.Provider>
              } />
              <Route path="/utilities/customMessages" element={
                <CustomCreateForm.Provider value={{ customClick, setCustomClick }}>
                  <CustomComplete />
                </CustomCreateForm.Provider>
              } />
              <Route path="/utilities/autoMessages" element={
                <AutoCreateForm.Provider value={{ autoClick, setAutoClick }}>
                  <AutoComplete />
                </AutoCreateForm.Provider>
              } />
            </Route>
            <Route path="/" element={<Navs />}>
              <Route path="/contacts" element={
                <NewContactForm.Provider value={{ contactNew, setContactNew }}>
                  <ContactsComplete />
                </NewContactForm.Provider>
              } />
              <Route path="/profile" element={
                <ProfileInfoPanel.Provider value={{ profileInfoOpen, SetProfileInfoOpen }}>
                  <ProfileComplete />
                </ProfileInfoPanel.Provider>
              } />
              <Route path="/agents" element={
                <AgentHandle.Provider value={{ agentHandle, setAgentHandle }}>
                  <UpdateAgentForm.Provider value={{ agentFind, setAgentFind }}>
                    <NewAgentForm.Provider value={{ agentNew, setAgentNew }}>
                      <AgentsComplete />
                    </NewAgentForm.Provider>
                  </UpdateAgentForm.Provider>
                </AgentHandle.Provider>
              } />
              <Route path="/chatList" element={
                <ResolveClick.Provider value={{ resolveClick, setResolveClick }}>
                  <TagClick.Provider value={{ tagClick, setTagClick }}>
                    <ContactInfoClick.Provider value={{ infoOpen, setInfoOpen }}>
                      <SearchInChatClick.Provider value={{ searchInChat, setSearchInChat }}>
                        <ChatComplete />
                      </SearchInChatClick.Provider>
                    </ContactInfoClick.Provider>
                  </TagClick.Provider>
                </ResolveClick.Provider>
              } />
            </Route>
          </Routes>
        </ChatInterfaceClick.Provider>
      </NewMessage.Provider>
    </Router>
  );
}

export default App
