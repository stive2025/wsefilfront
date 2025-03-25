import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState } from "react";

const LoginForm = lazy(() => import('./pages/auth/loginForm'));
const Navs = lazy(() => import("./pages/Layout/generalLayout"));
const UtilNavs = lazy(() => import("./pages/Layout/utilitiesLayout"));
const ChatComplete = lazy(() => import("/src/pages/chats/chatComplete.jsx"));
const TagsComplete = lazy(() => import("/src/pages/util/tagsComplete.jsx"));
const AutoComplete = lazy(() => import("/src/pages/util/autoMComplete.jsx"));
const CustomComplete = lazy(() => import("/src/pages/util/customMComplete.jsx"));
const ContactsComplete = lazy(() => import("/src/pages/contacts/contactsComplete.jsx"));
const AgentsComplete = lazy(() => import("/src/pages/agents/agentsComplete.jsx"));
const ProfileComplete = lazy(() => import("/src/pages/profile/profileComplete.jsx"));

import {
  ContactInfoClick, ChatInterfaceClick, TagClick, ResolveClick, TagsCreateForm, UpdateAgentForm, AgentHandle, UpdateContactForm, ContactHandle,
  AutoCreateForm, CustomCreateForm, NewContactForm, SearchInChatClick, NewAgentForm, ProfileInfoPanel, NewMessage, UpdateTagForm, TagHandle, 
  UpdateCustomForm, CustomHandle,AutoHandle,UpdateAutoForm
} from "./contexts/chats.js";


function App() {

  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [tagClick, setTagClick] = useState(null);
  const [resolveClick, setResolveClick] = useState(null);
  const [tagsClick, setTagsClick] = useState(null);
  const [tagFind, setTagtFind] = useState(null);
  const [tagHandle, setTagHandle] = useState(null);
  const [customFind, setCustomFind] = useState(null);
  const [customHandle, setCustomHandle] = useState(null);
  const [customClick, setCustomClick] = useState(null);
  const [autoFind, setAutoFind] = useState(null);
  const [autoHandle, setAutoHandle] = useState(null);
  const [autoClick, setAutoClick] = useState(null);
  const [contactNew, setContactNew] = useState(null);
  const [agentNew, setAgentNew] = useState(null);
  const [searchInChat, setSearchInChat] = useState(null);
  const [profileInfoOpen, SetProfileInfoOpen] = useState(null);
  const [newMessage, setNewMessage] = useState(false);
  const [agentFind, setAgentFind] = useState(null);
  const [agentHandle, setAgentHandle] = useState(null);
  const [contactFind, setContactFind] = useState(null);
  const [contactHandle, setContactHandle] = useState(null);


  return (
    <Router>
      <NewMessage.Provider value={{ newMessage, setNewMessage }}>
        <ChatInterfaceClick.Provider value={{ selectedChatId, setSelectedChatId }}>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/utilities" element={<UtilNavs />}>
                <Route path="/utilities/tags" element={
                  <TagHandle.Provider value={{ tagHandle, setTagHandle }}>
                    <UpdateTagForm.Provider value={{ tagFind, setTagtFind }}>
                      <TagsCreateForm.Provider value={{ tagsClick, setTagsClick }}>
                        <TagsComplete />
                      </TagsCreateForm.Provider>
                    </UpdateTagForm.Provider>
                  </TagHandle.Provider>
                } />
                <Route path="/utilities/customMessages" element={
                  <CustomHandle.Provider value={{ customHandle, setCustomHandle }}>
                    <UpdateCustomForm.Provider value={{ customFind, setCustomFind }}>
                      <CustomCreateForm.Provider value={{ customClick, setCustomClick }}>
                        <CustomComplete />
                      </CustomCreateForm.Provider>
                    </UpdateCustomForm.Provider>
                  </CustomHandle.Provider>
                } />
                <Route path="/utilities/autoMessages" element={
                  <AutoHandle.Provider value={{ autoHandle, setAutoHandle }}>
                  <UpdateAutoForm.Provider value={{ autoFind, setAutoFind }}>
                    <AutoCreateForm.Provider value={{ autoClick, setAutoClick }}>
                      <AutoComplete />
                    </AutoCreateForm.Provider>
                  </UpdateAutoForm.Provider>
                </AutoHandle.Provider>
                } />
              </Route>
              <Route path="/" element={<Navs />}>
                <Route path="/contacts" element={
                  <ContactHandle.Provider value={{ contactHandle, setContactHandle }}>
                    <UpdateContactForm.Provider value={{ contactFind, setContactFind }}>
                      <NewContactForm.Provider value={{ contactNew, setContactNew }}>
                        <ContactsComplete />
                      </NewContactForm.Provider>
                    </UpdateContactForm.Provider>
                  </ContactHandle.Provider>
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
          </Suspense>
        </ChatInterfaceClick.Provider>
      </NewMessage.Provider>
    </Router>
  );
}

export default App;
