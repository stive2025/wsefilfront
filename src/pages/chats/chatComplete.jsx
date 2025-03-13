/* eslint-disable react-hooks/rules-of-hooks */
import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import SearchInChat from "/src/components/chats/searchInChat.jsx";
import ListContacts from "/src/components/contacts/listContacts.jsx";
import { ContactInfoClick, ChatInterfaceClick, SearchInChatClick, NewMessage} from "/src/contexts/chats.js"
import { useContext } from "react";


const chatComplete = () => {

    const { infoOpen } = useContext(ContactInfoClick);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { searchInChat } = useContext(SearchInChatClick);
    const { newMessage } = useContext(NewMessage);
    const isMobile = Resize();
    return isMobile ? (
        !selectedChatId ? (
            newMessage ? <ListContacts /> : <ChatList />
        ) : (
            <>
                {infoOpen ? (<ContactInfo contactId={selectedChatId} />) : searchInChat ? (<SearchInChat contactId={selectedChatId} />
                ) : (
                    <ChatInterface chatId={selectedChatId} />
                )}
            </>
        )
    ) : (
        <div
            className={`h-screen bg-gray-900 text-white ${searchInChat || infoOpen ? "grid grid-cols-3" : "grid grid-cols-[35%_65%]"
                }`}
        >
            {newMessage ? <ListContacts /> : <ChatList />}
            <ChatInterface chatId={selectedChatId} />
            {infoOpen && <ContactInfo contactId={selectedChatId} />}
            {searchInChat && <SearchInChat contactId={selectedChatId} />}

        </div>
    );
};

export default chatComplete;
