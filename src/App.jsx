import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from './pages/auth/loginForm';
import Navs from "./pages/Layout/generalLayout";
import UtilNavs from "./pages/Layout/utilitiesLayout";
import ChatComplete from "/src/pages/chats/chatComplete.jsx"
import TagsComplete from "/src/pages/util/tagsComplete.jsx"
import AutoComplete from "/src/pages/util/autoMComplete.jsx"
import CustomComplete from "/src/pages/util/customMComplete.jsx"
import ContactsComplete from "/src/pages/contacts/contactsComplete.jsx"
import {
  ContactInfoClick, ChatInterfaceClick, TagClick, ResolveClick, TagsCreateForm,
  AutoCreateForm, CustomCreateForm, NewContactForm, SearchInChatClick
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
  const [searchInChat, setSearchInChat] = useState(null);


  return (
    <Router>
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
          <Route path="/chatList" element={
            <ResolveClick.Provider value={{ resolveClick, setResolveClick }}>
              <TagClick.Provider value={{ tagClick, setTagClick }}>
                <ChatInterfaceClick.Provider value={{ selectedChatId, setSelectedChatId }}>
                  <ContactInfoClick.Provider value={{ infoOpen, setInfoOpen }}>
                    <SearchInChatClick.Provider value={{ searchInChat, setSearchInChat }}>
                      <ChatComplete />
                    </SearchInChatClick.Provider>
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
