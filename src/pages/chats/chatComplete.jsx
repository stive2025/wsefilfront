import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import { ContactInfoClick } from "/src/contexts/chats.js"
import { useContext } from "react";


const chatComplete = () => {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { infoOpen } = useContext(ContactInfoClick);

    const isMobile = Resize();
    return isMobile ? (
        <ChatList />
    ) : (
        <div
            className={`h-screen bg-gray-900 text-white overflow-hidden 
                    ${infoOpen ? " grid  grid-cols-3" : "flex"}`} 
        >
            <ChatList  /> 
            <ChatInterface  /> 
            {infoOpen && <ContactInfo  />} 
        </div>
    );
};

export default chatComplete;