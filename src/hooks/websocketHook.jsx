import { useEffect, useContext, useRef } from 'react';
import { ConnectionInfo, ConnectionQR, WebSocketMessage } from "@/contexts/chats.js";
import { GetCookieItem } from "@/utilities/cookies.js";

const WebSocketHook = () => {
    const { setCodigoQR } = useContext(ConnectionQR);
    const { setIsConnected } = useContext(ConnectionInfo);
    const { setMessageData } = useContext(WebSocketMessage);

    const lastMessageRef = useRef(null);

    useEffect(() => {
        let conn;
        let reconnectTimeout;

        const userDataString = GetCookieItem("userData");
        if (!userDataString) {
            console.error("No se encontró userData en las cookies");
            return;
        }

        const userData = JSON.parse(userDataString);
        const userId = userData.id;
        const abilities = userData.abilities || [];
        
        if (!userId) {
            console.error("No se encontró ID de usuario en las cookies");
            return;
        }

        // Verificar si el usuario tiene permisos para ver todos los chats
        const canViewAllChats = abilities.includes("chats.filter.agent");

        const normalizeMessage = (data) => {
            // Si es una actualización de ACK
            if (data.id_wp && !data.body) {
                return {
                    id: data.id_message_wp || data.id,
                    ack: data.ack,
                    type: 'ack',
                    chat_id: data.chat_id,
                    user_id: data.user_id
                };
            }

            const baseMessage = {
                id: data.id_message_wp || data.id || Date.now().toString(),
                body: data.body || '',
                from_me: data.from_me === true || data.from_me === "true",
                chat_id: data.chat_id,
                number: data.number,
                timestamp: data.timestamp
                    ? (typeof data.timestamp === 'number'
                        ? new Date(data.timestamp * 1000).toISOString()
                        : data.timestamp)
                    : new Date().toISOString(),
                created_at: data.created_at || new Date().toISOString(),
                is_private: data.is_private || 0,
                user_id: data.user_id || null,
                ack: data.ack || 0,
                temp_signature: data.temp_signature || null
            };

            if (data.media_type === 'audio' || data.media_type === 'ptt') {
                return {
                    ...baseMessage,
                    media_type: data.media_type,
                    filename: data.filename,
                    media_url: data.filename || '',
                    filetype: 'audio',
                    fileformat: data.filename?.split('.').pop() || 'wav'
                };
            }

            if (data.media && Array.isArray(data.media) && data.media.length > 0) {
                const mediaItem = data.media[0];
                return {
                    ...baseMessage,
                    media_type: mediaItem.type || 'chat',
                    media_url: mediaItem.filename || '',
                    filename: mediaItem.filename || '',
                    filetype: mediaItem.type || '',
                    fileformat: mediaItem.filename?.split('.').pop() || '',
                    caption: mediaItem.caption || data.body || ''
                };
            } else if (data.media_type && data.media_type !== 'chat') {
                return {
                    ...baseMessage,
                    media_type: data.media_type,
                    media_url: data.media_url || '',
                    filename: data.filename || '',
                    filetype: data.filetype || data.media_type,
                    fileformat: data.fileformat || '',
                };
            }

            return {
                ...baseMessage,
                media_type: 'chat',
                media_url: '',
            };
        };

        // Función para verificar si un mensaje debe ser procesado según los permisos
        const shouldProcessMessage = (data) => {
            // Si es información de estado de sesión (CONNECTED/DISCONNECTED), siempre procesar
            if (data.status || data.estatus) {
                return true;
            }

            // Si el usuario puede ver todos los chats, procesar siempre
            if (canViewAllChats) {
                return true;
            }

            // Si no tiene permisos especiales, solo procesar mensajes propios
            // Verificar tanto user_id del mensaje como del propietario del chat
            if (data.user_id && data.user_id.toString() === userId.toString()) {
                return true;
            }

            // Si el mensaje es de/para un chat asignado al usuario actual
            if (data.assigned_user_id && data.assigned_user_id.toString() === userId.toString()) {
                return true;
            }

            return false;
        };

        const connectWebSocket = () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (conn) {
                try {
                    conn.close();
                } catch (e) {
                    console.error("Error al cerrar conexión WebSocket previa:", e);
                }
            }

            conn = new WebSocket('ws://193.46.198.228:8081');

            conn.onopen = () => {
                console.log("🟢 WebSocket conectado exitosamente!");
            };

            conn.onerror = (error) => {
                console.error("🔴 Error en WebSocket: ", error);
                try {
                    conn.close();
                } catch (e) {
                    console.error("Error al cerrar conexión WebSocket en error:", e);
                }
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            conn.onclose = (event) => {
                console.log(`WebSocket cerrado (código: ${event.code}). Reconectando en 3s...`);
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            conn.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);

                    const messageId = data.id_message_wp || data.id || `${data.user_id}_${data.status}_${Date.now()}`;
                    if (lastMessageRef.current === messageId) return;
                    lastMessageRef.current = messageId;

                    // Verificar si este mensaje debe ser procesado según los permisos
                    if (!shouldProcessMessage(data)) {
                        return;
                    }

                    if (data.user_id?.toString() === userId.toString()) {
                        // Estado de sesión - esta lógica se mantiene igual
                        if (data.status === "DISCONNECTED" || data.estatus === "DISCONNECTED") {
                            setIsConnected({
                                sesion: false,
                                name: '',
                                number: '',
                                userId
                            });

                            if (data.qr_code) {
                                setCodigoQR(data.qr_code);
                            }

                        } else if (data.status === "CONNECTED" || data.estatus === "CONNECTED") {
                            setIsConnected({
                                sesion: true,
                                name: data.name || '',
                                number: data.number || '',
                                userId
                            });
                        }
                    }

                    // Procesar mensaje solo si pasa el filtro de permisos
                    // Siempre enviar el mensaje original completo
                    setMessageData(data);

                    // Si hay mensaje o media, normalizar
                    if (data.body !== undefined || data.media_type || (data.media && data.media.length > 0)) {
                        const normalizedMessage = normalizeMessage(data);
                        setMessageData(normalizedMessage);
                    }

                } catch (err) {
                    console.error("❌ Error procesando mensaje WebSocket:", err);
                }
            };
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (conn) conn.close();
        };
    }, [setCodigoQR, setIsConnected, setMessageData]);

    return null;
};

export default WebSocketHook;