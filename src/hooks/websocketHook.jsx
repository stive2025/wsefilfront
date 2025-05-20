import { useEffect, useContext, useRef } from 'react';
import { ConnectionInfo, ConnectionQR, WebSocketMessage } from "@/contexts/chats.js";
import { GetCookieItem } from "@/utilities/cookies.js";

const WebSocketHook = () => {
    const { setCodigoQR } = useContext(ConnectionQR);
    const { setIsConnected } = useContext(ConnectionInfo);
    const { setMessageData } = useContext(WebSocketMessage);

    // Referencia para rastrear el último mensaje procesado
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

        if (!userId) {
            console.error("No se encontró ID de usuario en las cookies");
            return;
        }

        const connectWebSocket = () => {
            // Limpiar timeout previo si existe
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            // Cerrar conexión previa si existe
            if (conn) {
                try {
                    conn.close();
                } catch (e) {
                    console.error("Error al cerrar conexión WebSocket previa:", e);
                }
            }

            console.log(`Intentando conectar WebSocket para usuario ${userId}...`);
            conn = new WebSocket('ws://193.46.198.228:8081');

            conn.onopen = () => {
                console.log("🟢 WebSocket conectado exitosamente!");
            };

            conn.onerror = (error) => {
                console.error("🔴 Error en WebSocket: ", error);

                // En caso de error, cerrar y reconectar
                try {
                    conn.close();
                } catch (e) {
                    console.error("Error al cerrar conexión WebSocket en error:", e);
                }
                console.log("🔄 Reconectando WebSocket...");
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            conn.onclose = (event) => {
                console.log(`WebSocket cerrado (código: ${event.code}). Reconectando en 3s...`);
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            const normalizeMessage = (data) => {
                console.group('🎵 Normalizando mensaje de audio');
                console.log('Datos recibidos:', data);

                const baseMessage = {
                    id: data.id_message_wp || data.id || Date.now().toString(),
                    body: data.body || '',
                    from_me: data.from_me,
                    chat_id: data.chat_id,
                    number: data.number,
                    notify_name: data.notify_name || '.',
                    timestamp: data.timestamp ?
                        (typeof data.timestamp === 'number' ?
                            new Date(data.timestamp * 1000).toISOString() :
                            data.timestamp) :
                        new Date().toISOString(),
                    created_at: data.created_at || new Date().toISOString(),
                    is_private: data.is_private || 0,
                    user_id: data.user_id || null,
                    ack: data.ack || 0,
                    temp_signature: data.temp_signature || null
                };

                if (data.media_type === 'audio' || data.media_type === 'ptt') {
                    console.log('Procesando mensaje de audio');
                    return {
                        ...baseMessage,
                        media_type: data.media_type,
                        filename: data.filename,
                        media_url: data.filename || '',
                        filetype: 'audio',
                        fileformat: data.filename?.split('.').pop() || 'wav'
                    };
                }

                // Handle media
                if (data.media && Array.isArray(data.media) && data.media.length > 0) {
                    // Sent message with media
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
                    // Received message with media
                    return {
                        ...baseMessage,
                        media_type: data.media_type,
                        media_url: data.media_url || '',
                        filename: data.filename || '',
                        filetype: data.filetype || data.media_type,
                        fileformat: data.fileformat || '',
                    };
                }

                // Regular chat message
                return {
                    ...baseMessage,
                    media_type: 'chat',
                    media_url: '',
                };
            };

            conn.onmessage = (e) => {
                try {
                    console.group('📨 Mensaje WebSocket');
                    const data = JSON.parse(e.data);
                    console.log('📥 Datos recibidos:', data);

                    const messageId = data.id_message_wp || data.id || `${data.user_id}_${data.status}_${Date.now()}`;

                    if (lastMessageRef.current === messageId) {
                        console.log('🔄 Mensaje duplicado, ignorando');
                        console.groupEnd();
                        return;
                    }

                    lastMessageRef.current = messageId;

                    if (data.user_id?.toString() === userId.toString()) {
                        if (data.body !== undefined || data.media_type || (data.media && data.media.length > 0)) {
                            const normalizedMessage = normalizeMessage(data);
                            console.log('📝 Mensaje procesado:', normalizedMessage);
                            setMessageData(normalizedMessage);
                        }
                    }
                    console.groupEnd();
                } catch (err) {
                    console.error("❌ Error:", err);
                    console.groupEnd();
                }
            };
        };

        // Iniciar la conexión si tenemos un ID de usuario
        connectWebSocket();

        // Cleanup al desmontar
        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            if (conn) {
                console.log("Cerrando conexión WebSocket (componente desmontado)");
                conn.close();
            }
        };
    }, [setCodigoQR, setIsConnected, setMessageData]);

    // Este componente no renderiza nada
    return null;
};

export default WebSocketHook;