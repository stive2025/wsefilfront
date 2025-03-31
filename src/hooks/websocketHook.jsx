import { useEffect, useRef, useContext } from 'react';
import { ConnectionInfo, ConnectionQR } from "/src/contexts/chats.js";

const WebSocketHook = () => {
    const connRef = useRef(null);
    const { codigoQR, setCodigoQR } = useContext(ConnectionQR);
    const { isConnected, setIsConnected } = useContext(ConnectionInfo);

    useEffect(() => {
        let conn;
        
        const connectWebSocket = () => {
            conn = new WebSocket('ws://193.46.198.228:8081');
    
            conn.onopen = () => {
                console.log("Connection established!");
            };
    
            conn.onerror = (error) => {
                console.error("WebSocket Error: ", error);
                console.log("Connection closed. Reconnecting in 3s...");
            };
    
            conn.onclose = () => {
                console.log("Connection closed. Reconnecting in 3s...");
                setTimeout(connectWebSocket, 3000); // Reconectar tras 3 segundos
            };
    
            conn.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log("Data received: ", data);
                if(data.estatus == "DISCONNECTED"){
                    setIsConnected(false);
                    setCodigoQR(data.qr_code)
                }
            };
        };
    
        connectWebSocket();
    
        return () => conn && conn.close();
    }, []);
    

    return null;
};

export default WebSocketHook;
