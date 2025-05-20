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

            conn.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    
                    // Crear un ID único para el mensaje
                    const messageId = data.id_message_wp || data.id || `${data.user_id}_${data.status}_${Date.now()}`;
                    
                    if (lastMessageRef.current === messageId) {
                        return;
                    }
                    
                    lastMessageRef.current = messageId;
                    
                    if (data.user_id && data.user_id.toString() === userId.toString()) {
                        // Manejar estados de conexión...
                        if (data.status === "DISCONNECTED" || data.estatus === "DISCONNECTED") {
                            console.log("🔌 Usuario desconectado según WebSocket");
                            
                            setIsConnected({
                                sesion: false,
                                name: '',
                                number: '',
                                userId
                            });
                            
                            // Actualizar código QR si está presente
                            if (data.qr_code) {
                                console.log("🔄 Actualizando código QR:", data.qr_code.substring(0, 20) + "...");
                                setCodigoQR(data.qr_code);
                            } else {
                                console.warn("⚠️ Mensaje de desconexión sin código QR");
                            }
                        } else if (data.status === "CONNECTED" || data.estatus === "CONNECTED") {
                            console.log("🔌 Usuario conectado según WebSocket");
                            
                            setIsConnected({
                                sesion: true,
                                name: data.name || '',
                                number: data.number || '',
                                userId
                            });
                        }

                        // Normalizar el mensaje para el chat
                        if (data.body !== undefined || data.media_type) {
                            const normalizedMessage = {
                                id: data.id_message_wp || data.id || Date.now().toString(),
                                body: data.body || '',
                                from_me: data.from_me === true || data.from_me === "true",
                                chat_id: data.chat_id,
                                number: data.number,
                                notify_name: data.notify_name,
                                timestamp: data.timestamp ? 
                                    (typeof data.timestamp === 'number' ? 
                                        new Date(data.timestamp * 1000).toISOString() : 
                                        data.timestamp) : 
                                    new Date().toISOString(),
                                created_at: data.created_at || new Date().toISOString(),
                                media_type: data.media_type || 'chat',
                                media_url: data.media_url || '',
                                is_private: data.is_private || 0,
                                user_id: data.user_id || null,
                                // Nuevos campos para medios
                                data: data.data || '',
                                filename: data.filename || '',
                                filetype: data.filetype || '',
                                fileformat: data.fileformat || '',
                                ack: data.ack || 0
                            };
                            
                            setMessageData(normalizedMessage);
                        }
                    } else {
                        console.log(`⚠️ Mensaje ignorado: usuario ${data.user_id} ≠ ${userId}`);
                    }
                } catch (err) {
                    console.error("❌ Error procesando mensaje WebSocket:", err);
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