import { useEffect, useContext } from "react";
import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";
import ContactInfo from "/src/components/chats/contactInfo.jsx";
import SearchInChat from "/src/components/chats/searchInChat.jsx";
import ListContacts from "/src/components/contacts/listContacts.jsx";
import ConectionMod from "/src/components/mod/conectionMod.jsx";
import { ContactInfoClick, ChatInterfaceClick, SearchInChatClick, NewMessage, ConnectionInfo, ConnectionQR } from "/src/contexts/chats.js";

const ChatComplete = () => {
    const { infoOpen } = useContext(ContactInfoClick);
    const { selectedChatId } = useContext(ChatInterfaceClick);
    const { searchInChat } = useContext(SearchInChatClick);
    const { newMessage } = useContext(NewMessage);
    const { codigoQR, setCodigoQR } = useContext(ConnectionQR);
    const { isConnected, setIsConnected } = useContext(ConnectionInfo);
    const isMobile = Resize();


    useEffect(() => {
        const conn = new WebSocket('ws://193.46.198.228:8081');
        console.log(conn);

        conn.onopen = () => {
            console.log("Connection established!");
        };

        conn.onerror = (error) => {
            console.error("WebSocket Error: ", error);
            setIsConnected(false);
        };

        conn.onclose = () => {
            console.log("Connection closed.");
        };

        conn.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Data received: ", data);
            if (data.qr_code) {
                console.log("QR Code: ", codigoQR);
                setCodigoQR(data.qr_code);
                console.log("QR Code: ", codigoQR);
            }
            if (data.status === 'CONNECTED') {
                setIsConnected(true);
            }
        };

        return () => {
            conn.close();
        };
    }, []);



    // Main render logic
    return (
        <div className="relative h-full">
            {!isConnected && <ConectionMod isOpen={true} />}
            {isMobile ? (
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
                <div
                    className={`h-screen bg-gray-900 text-white ${searchInChat || infoOpen ? "grid grid-cols-3" : "grid grid-cols-[35%_65%]"}`}
                >
                    {newMessage ? <ListContacts /> : <ChatList />}
                    <ChatInterface />
                    {infoOpen && <ContactInfo />}
                    {searchInChat && <SearchInChat />}
                </div>
            )}
        </div>
    );
};

export default ChatComplete;