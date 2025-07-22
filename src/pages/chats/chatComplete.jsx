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
import { useAuth } from "@/contexts/authContext";
import { GetCookieItem } from "@/utilities/cookies";
import { ABILITIES } from "@/constants/abilities.js";


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
    const notificationSound = "https://cdn.pixabay.com/audio/2022/03/15/audio_273c5b6e2f.mp3";
    const [audioInitialized, setAudioInitialized] = useState(false);
    const notificationAudio = useRef(null);
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

    const { hasAbility } = useAuth(); // Agregar este hook

    // Modificar la inicialización del audio y agregar un useEffect para la carga inicial
    useEffect(() => {
        const initAudio = () => {
            try {
                if (!notificationAudio.current) {
                    notificationAudio.current = new Audio(notificationSound);
                    notificationAudio.current.preload = 'auto';
                    notificationAudio.current.volume = 1.0;
                }
                
                // Intentar cargar y reproducir el audio (mudo) para inicializarlo
                const playPromise = notificationAudio.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            notificationAudio.current.pause();
                            notificationAudio.current.currentTime = 0;
                            setAudioInitialized(true);
                        })
                        .catch(error => {
                            console.error('Error en la inicialización del audio:', error);
                        });
                }
            } catch (error) {
                console.error('Error crítico inicializando audio:', error);
            }
        };

        // Intentar inicializar inmediatamente
        initAudio();

        // También inicializar en la primera interacción del usuario
        const handleInteraction = () => {
            if (!audioInitialized) {
                initAudio();
            }
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []); // Solo se ejecuta una vez al montar el componente

    // Modificar el useEffect que maneja los mensajes
    useEffect(() => {
        if (messageData && notificationAudio.current) {

            // Obtener datos del usuario actual
            const userData = JSON.parse(GetCookieItem('userData'));
            const currentUserId = userData.id;

            // Verificar si el usuario puede recibir la notificación
            const canReceiveNotification =
                hasAbility(ABILITIES.CHATS.FILTER_BY_AGENT) || // Si tiene el permiso especial
                (messageData.user_id?.toString() === currentUserId?.toString()); // O si el mensaje es para este usuario

            const shouldPlaySound =
                canReceiveNotification && // Agregar esta nueva condición
                (messageData.body || messageData.filename) &&
                (messageData.from_me === false || messageData.from_me === "false") &&
                soundEnabled &&
                (!isTabActive || selectedChatId?.id !== messageData.chat_id);

            if (shouldPlaySound) {
                try {
                    // Reiniciar y reproducir
                    notificationAudio.current.currentTime = 0;
                    notificationAudio.current.play().catch(error => {
                        console.error('Error reproduciendo sonido:', error);
                        // Intentar reinicializar si falla
                        setAudioInitialized(false);
                    });
                } catch (error) {
                    console.error('Error crítico reproduciendo sonido:', error);
                    setAudioInitialized(false);
                }
            }
        }
    }, [messageData, soundEnabled, selectedChatId, hasAbility]); // Agregar hasAbility a las dependencias

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
                const apiCall = getCodigoQR();
                const response = await callEndpoint(apiCall);

                if (response.data.status === "DISCONNECTED") {
                    setIsConnected({
                        sesion: false,
                        name: '',
                        number: ''
                    });
                } else if (response.data.status === "CONNECTED") {
                    setIsConnected({
                        sesion: true,
                        name: response.data.name || '',
                        number: response.data.number || ''
                    });
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
                        onClick={() => {
                            toggleSound();
                            // Intentar inicializar el audio si aún no se ha hecho
                            if (!audioInitialized) {
                                notificationAudio.current = new Audio(notificationSound);
                                notificationAudio.current.preload = 'auto';
                                notificationAudio.current.volume = 1.0;
                                setAudioInitialized(true);
                            }
                        }}
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