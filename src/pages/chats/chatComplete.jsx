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
    const notificationSound = "/audios/notification.mp3";
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

    // Inicialización del audio para notificaciones con manejo mejorado de errores
    useEffect(() => {
        const initAudio = () => {
            try {
                // Crear una nueva instancia de audio si no existe
                if (!notificationAudio.current) {
                    notificationAudio.current = new Audio(notificationSound);
                    notificationAudio.current.preload = 'auto';
                    notificationAudio.current.volume = 1.0;
                    notificationAudio.current.muted = false;
                    
                    // Agregar listener para manejar errores de carga
                    notificationAudio.current.addEventListener('error', (e) => {
                        console.error('Error en el elemento de audio:', e);
                    });
                }
                
                // Cargar el audio explícitamente
                notificationAudio.current.load();
                
                // Esperar un momento antes de intentar reproducir
                setTimeout(() => {
                    // Inicializar reproduciendo brevemente y pausando
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
                                // Si el error es por restricciones de autoplay, marcamos como inicializado de todas formas
                                // ya que se inicializará en la primera interacción del usuario
                                if (error.name === 'NotAllowedError') {
                                    setAudioInitialized(true);
                                }
                            });
                    }
                }, 100);
            } catch (error) {
                console.error('Error inicializando audio:', error);
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

    // UseEffect para manejar la reproducción de notificaciones cuando llegan mensajes
    useEffect(() => {
        if (!messageData) return;

        // Obtener datos del usuario actual
        let userData, currentUserId;
        try {
            const userDataCookie = GetCookieItem('userData');
            if (userDataCookie) {
                userData = JSON.parse(userDataCookie);
                currentUserId = userData?.id;
            }
        } catch (error) {
            console.error('Error obteniendo datos de usuario:', error);
        }

        // Verificar si el usuario puede recibir la notificación
        const canReceiveNotification =
            hasAbility(ABILITIES.CHATS.FILTER_BY_AGENT) || // Si tiene el permiso especial
            (messageData.user_id?.toString() === currentUserId?.toString()); // O si el mensaje es para este usuario

        const shouldPlaySound =
            canReceiveNotification && 
            (messageData.body || messageData.filename) &&
            (messageData.from_me === false || messageData.from_me === "false") &&
            soundEnabled &&
            (!isTabActive || selectedChatId?.id !== messageData.chat_id);

        if (shouldPlaySound) {
            playNotificationSound();
        }
    }, [messageData, soundEnabled, selectedChatId, hasAbility, isTabActive]);

    // Función para alternar el sonido
    const toggleSound = () => {
        const newSoundState = !soundEnabled;
        setSoundEnabled(newSoundState);
        localStorage.setItem('chatSoundEnabled', newSoundState);
    };


    
    // Función para reproducir el sonido de notificación con manejo de errores mejorado
    const playNotificationSound = () => {
        try {
            if (notificationAudio.current) {
                // Asegurarse de que cualquier reproducción anterior se detenga primero
                if (!notificationAudio.current.paused) {
                    notificationAudio.current.pause();
                }
                
                // Reiniciar el audio
                notificationAudio.current.currentTime = 0;
                notificationAudio.current.volume = 1.0;
                notificationAudio.current.muted = false;
                
                // Esperar un momento antes de reproducir para evitar conflictos
                setTimeout(() => {
                    notificationAudio.current.play().catch(error => {
                        // Manejar específicamente el error AbortError
                        if (error.name === 'AbortError') {
                            console.log('Reproducción interrumpida, intentando nuevamente...');
                            setTimeout(() => {
                                notificationAudio.current.play().catch(e => {
                                    console.error('Error en segundo intento de reproducción:', e);
                                });
                            }, 100);
                        } else {
                            console.error('Error reproduciendo notificación:', error);
                        }
                    });
                }, 50);
            }
        } catch (error) {
            console.error('Error reproduciendo sonido:', error);
        }
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

                {/* Controles de sonido */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    {/* Botón de prueba de sonido */}
                    {/* <button
                        onClick={playNotificationSound}
                        className={`p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white
                        transition-colors duration-200`}
                        title="Probar sonido"
                    >
                        🎵
                    </button> */}
                    
                    {/* Botón para alternar sonido */}
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