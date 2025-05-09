import { useEffect, useContext } from 'react';
import { ConnectionInfo, ConnectionQR, WebSocketMessage } from "@/contexts/chats.js";

const WebSocketHook = () => {
    const { setCodigoQR } = useContext(ConnectionQR);
    const { setIsConnected } = useContext(ConnectionInfo);
    const { setMessageData } = useContext(WebSocketMessage);

    useEffect(() => {
        let conn;
        
        const connectWebSocket = () => {
            conn = new WebSocket('ws://193.46.198.228:8081');
    
            conn.onopen = () => {
                console.log("WebSocket connection established!");
            };
    
            conn.onerror = (error) => {
                console.error("WebSocket Error: ", error);
                console.log("Connection closed. Reconnecting in 3s...");
            };
    
            conn.onclose = () => {
                console.log("Connection closed. Reconnecting in 3s...");
                setTimeout(connectWebSocket, 3000);
            };
    
            conn.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    console.log("WebSocket data received: ", data);
                    
                    // Detectar el tipo de mensaje por sus propiedades
                    if (data.status === "DISCONNECTED" || data.estatus === "DISCONNECTED") {
                        console.log("No hay sesion activa (WebSocket)");
                        setIsConnected({
                            sesion: false,
                            name: '',
                            number: ''
                        });
                        if (data.qr_code) {
                            setCodigoQR(data.qr_code);
                        }
                    } else if (data.status === "CONNECTED" || data.estatus === "CONNECTED") {
                        setIsConnected({
                            sesion: true,
                            name: data.name || '',
                            number: data.number || ''
                        });
                    }
                    
                    // Si es un mensaje de chat (tiene campo body), enviarlo al contexto
                    if (data.body) {
                        console.log("Mensaje de chat recibido:", data);
                        // Normalizar la estructura del mensaje
                        const normalizedMessage = {
                            id: data.id_message_wp || Date.now().toString(),
                            body: data.body,
                            from_me: data.from_me === true || data.from_me === "true",
                            chat_id: data.chat_id,
                            number: data.number,
                            notify_name: data.notify_name,
                            timestamp: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(),
                            created_at: data.created_at || new Date().toISOString(),
                            media_type: data.media_type || 'chat',
                            media_url: data.media_url || '',
                            is_private: data.is_private || 0,
                            user_id: data.user_id || null,
                        };
                        setMessageData(normalizedMessage);
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };
        };
    
        connectWebSocket();
    
        return () => {
            if (conn) {
                conn.close();
            }
        };
    }, [setCodigoQR, setIsConnected, setMessageData]);
    
    return null;
};

export default WebSocketHook;