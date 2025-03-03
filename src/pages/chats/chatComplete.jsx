/* eslint-disable react-hooks/rules-of-hooks */
import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import { ContactInfoClick, ChatInterfaceClick } from "/src/contexts/chats.js"
import { useContext } from "react";


const chatComplete = () => {

    const { infoOpen } = useContext(ContactInfoClick);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    console.log(selectedChatId);
    const isMobile = Resize();
    return isMobile ? (
        !selectedChatId ? (
            <ChatList />
        ) : (
            <ChatInterface chatId={selectedChatId} />
        )
    ) : (
        <div
            className={`h-screen bg-gray-900 text-white 
                    ${infoOpen ? " grid  grid-cols-3" : " grid grid-cols-[1fr_2fr]"}`}
        >
            <ChatList />
            <ChatInterface chatId={selectedChatId} />
            {infoOpen && <ContactInfo />}
        </div>
    );
};

export default chatComplete;