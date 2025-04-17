// Update your WebSocketHook.jsx
import { useEffect, useContext } from 'react';
import { ConnectionInfo, ConnectionQR } from "/src/contexts/chats.js";

const WebSocketHook = () => {
    const { setCodigoQR } = useContext(ConnectionQR);
    const {  setIsConnected } = useContext(ConnectionInfo);

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
                    
                    if (data.estatus === "DISCONNECTED") {
                        console.log("No hay sesion activa (WebSocket)");
                        setIsConnected({
                            sesion: false,
                            name: '',
                            number: ''
                        });
                        if (data.qr_code) {
                            setCodigoQR(data.qr_code);
                        }
                    } else if (data.estatus === "CONNECTED") {
                        setIsConnected({
                            sesion: true,
                            name: data.name || '',
                            number: data.number || ''
                        });
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
    }, []);
    
    return null;
};

export default WebSocketHook;