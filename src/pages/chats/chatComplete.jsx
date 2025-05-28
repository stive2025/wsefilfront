import { useEffect, useContext, useState, useRef } from "react";
import ChatInterface from "@/components/chats/chatPanel_components.jsx";
import ChatList from "@/components/chats/chatList_component.jsx";
import Resize from "@/hooks/responsiveHook.jsx";
import ContactInfo from "@/components/chats/contactInfo.jsx";
import SearchInChat from "@/components/chats/searchInChat.jsx";
import ListContacts from "@/components/contacts/listContacts.jsx";
import ConectionMod from "@/components/mod/conectionMod.jsx";
import WebSocketHook from "@/hooks/websocketHook.jsx"
import { getCodigoQR } from "@/services/conections.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { ContactInfoClick, ChatInterfaceClick, SearchInChatClick, NewMessage, ConnectionInfo, WebSocketMessage } from "@/contexts/chats.js";
import { useTheme } from "@/contexts/themeContext";
import notificationSound from '/sounds/notification.mp3';



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

    const notificationAudio = useRef(new Audio(notificationSound));
    const [isTabActive, setIsTabActive] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(
        localStorage.getItem('chatSoundEnabled') !== 'false'
    );

    // Agregar efecto para manejar la visibilidad de la página
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabActive(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (messageData) {
            console.log("Nuevo mensaje recibido:", messageData);
            console.log("chat seleccionado:", selectedChatId);

            const shouldPlaySound =
                messageData.body &&
                (messageData.from_me === false || messageData.from_me === "false") &&
                soundEnabled &&
                (!isTabActive || selectedChatId?.id !== messageData.chat_id)

            if (shouldPlaySound) {
                try {
                    console.log("Reproduciendo sonido - Chat actual:", selectedChatId?.id, "Mensaje de chat:", messageData.chat_id);
                    notificationAudio.current.play().catch(error => {
                        console.log("Error reproduciendo sonido:", error);
                    });
                } catch (error) {
                    console.error("Error al reproducir sonido:", error);
                }
            }
        }
    }, [messageData, soundEnabled, selectedChatId]); // Agregamos selectedChatId a las dependencias

    // Función para alternar el sonido
    const toggleSound = () => {
        const newSoundState = !soundEnabled;
        setSoundEnabled(newSoundState);
        localStorage.setItem('chatSoundEnabled', newSoundState);
    };

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
            <div className={`flex flex-col h-screen w-full mx-auto 
                bg-[rgb(var(--color-bg-${theme}))] 
                text-[rgb(var(--color-text-primary-${theme}))]`}>

                {/* Agregar botón de sonido */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={toggleSound}
                        className={`p-2 rounded-full hover:bg-[rgb(var(--color-bg-${theme}-secondary))]
                        transition-colors duration-200`}
                        title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
                    >
                        {soundEnabled ? "🔊" : "🔇"}
                    </button>
                </div>

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