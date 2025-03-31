import { useEffect, useContext, useRef } from "react";
import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import SearchInChat from "/src/components/chats/searchInChat.jsx";
import ListContacts from "/src/components/contacts/listContacts.jsx";
import ConectionMod from "/src/components/mod/conectionMod.jsx";
import WebSocketHook from "/src/hooks/websocketHook.jsx"
import { getCodigoQR } from "/src/services/conections.js";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { ContactInfoClick, ChatInterfaceClick, SearchInChatClick, NewMessage, ConnectionInfo } from "/src/contexts/chats.js";

const ChatComplete = () => {
    const { callEndpoint } = useFetchAndLoad();
    const { infoOpen } = useContext(ContactInfoClick);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { searchInChat } = useContext(SearchInChatClick);
    const { newMessage } = useContext(NewMessage);
    const { isConnected, setIsConnected } = useContext(ConnectionInfo);
    const isMobile = Resize();

    useEffect(() => {
        const fetchQR = async () => {
            setIsConnected(true)
            try {
                const apiCall = getCodigoQR();
                const response = await callEndpoint(apiCall);
                console.log("Respuesta del backend:", response);
                if(response.data.status != "CONNECTED"){
                    setIsConnected(false);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("No se pudo obtener los datos de la conexion:", error);
                    setError("No se pudo obtener los datos de la conexion");
                }
            }
        };

        fetchQR();
    }, [isConnected]); // 

    return (
        <div className={`flex flex-col bg-transparent text-white `}>
            <WebSocketHook />
            {!isConnected && <ConectionMod isOpen={true} />}
            {isMobile ? (
                selectedChatId == null ? (
                    newMessage ? (
                        <ListContacts />
                    ) : (
                        <ChatList />
                    )
                ) : (
                    <>
                        {infoOpen ? (
                            <ContactInfo />
                        ) : searchInChat ? (
                            <SearchInChat />
                        ) : (
                            <ChatInterface />
                        )}
                    </>
                )
            ) : (
                <div
                    className={`h-screen bg-gray-900 text-white ${searchInChat || infoOpen ? "grid grid-cols-3" : "grid grid-cols-[35%_65%]"}`}
                >
                    {newMessage ? <ListContacts /> : <ChatList />}
                    <ChatInterface />
                    {infoOpen && <ContactInfo />}
                    {searchInChat && <SearchInChat />}
                </div>
            )}
        </div>
    );
};

export default ChatComplete;