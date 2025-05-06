import { useEffect, useContext, useState } from "react";
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
import { ContactInfoClick, ChatInterfaceClick, SearchInChatClick, NewMessage, ConnectionInfo, WebSocketMessage } from "/src/contexts/chats.js";
import { useTheme } from "/src/contexts/themeContext";

const ChatComplete = () => {
    const { callEndpoint } = useFetchAndLoad();
    const { infoOpen } = useContext(ContactInfoClick);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { searchInChat } = useContext(SearchInChatClick);
    const { newMessage } = useContext(NewMessage);
    const { isConnected, setIsConnected } = useContext(ConnectionInfo);
    const isMobile = Resize();
    const [messageData, setMessageData] = useState(null);
    const { theme } = useTheme();

    // Default value to prevent null errors
    const connectionStatus = isConnected || { sesion: false, name: '', number: '' };

    useEffect(() => {
        const checkConnection = async () => {
            try {
                console.log("Verificando estado de conexión...");
                const apiCall = getCodigoQR();
                const response = await callEndpoint(apiCall);
                console.log("Respuesta de conexión:", response.data);

                if (response.data.status === "DISCONNECTED") {
                    setIsConnected({
                        sesion: false,
                        name: '',
                        number: ''
                    });
                    console.log("No hay sesión activa");
                } else if (response.data.status === "CONNECTED") {
                    setIsConnected({
                        sesion: true,
                        name: response.data.name || '',
                        number: response.data.number || ''
                    });
                    console.log("Sesión activa detectada");
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Error al verificar estado de conexión:", error);
                    setIsConnected({
                        sesion: false,
                        name: '',
                        number: ''
                    });
                }
            }
        };

        checkConnection();
    }, []);

    return (
        <WebSocketMessage.Provider value={{ messageData, setMessageData }}>
            <div className={`flex flex-col h-screen w-full mx-auto p-4 
                bg-[rgb(var(--color-bg-${theme}))] 
                text-[rgb(var(--color-text-primary-${theme}))]`}>
                {/* WebSocketHook siempre debe estar presente para manejar la conexión */}
                <WebSocketHook />

                {/* Si no hay sesión activa, solo mostrar el modal de conexión */}
                {!connectionStatus.sesion ? (
                    <ConectionMod isOpen={true} />
                ) : (
                    /* Renderizado condicional basado en si hay sesión activa */
                    isMobile ? (
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
                        <div className={`h-screen w-full 
                            bg-[rgb(var(--color-bg-${theme}))] 
                            text-[rgb(var(--color-text-primary-${theme}))]
                            ${searchInChat || infoOpen ? "grid grid-cols-3" : "grid grid-cols-[35%_65%]"}`}
                        >
                            {newMessage ? <ListContacts /> : <ChatList />}
                            <ChatInterface />
                            {infoOpen && <ContactInfo />}
                            {searchInChat && <SearchInChat />}
                        </div>
                    )
                )}
            </div>
        </WebSocketMessage.Provider>
    );
};

export default ChatComplete;