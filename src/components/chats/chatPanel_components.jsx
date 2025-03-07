import { useState } from "react";
import { Send, Search, MessageSquareShare, SquarePlus, Mic, Paperclip } from "lucide-react";
import Resize from "/src/hooks/responsiveHook.jsx";
import MenuInchat from "/src/components/mod/menuInchat.jsx";
import ChatTransfer from "/src/components/mod/chatTransfer.jsx"
import ChatTag from "/src/components/mod/chatTag.jsx"
import ChatResolved from "/src/components/mod/chatResolved.jsx"
import { TagClick, ResolveClick,SearchInChatClick } from "/src/contexts/chats.js"
import { useContext } from "react";


// eslint-disable-next-line react/prop-types
const ChatInterface = ({ chatId }) => {
    const isMobile = Resize();
    const [menuOpen, setMenuOpen] = useState(false);
    const [transferOpen, settransferOpen] = useState(false);
    const {tagClick, setTagClick} = useContext(TagClick);
    const {resolveClick,setResolveClick} = useContext(ResolveClick);
    const {setSearchInChat} = useContext(SearchInChatClick);


    const chats = [
        {
            id: 1,
            name: "José Sarmiento",
            avatar: "/api/placeholder/40/40",
            messages: [
                { id: 1, sender: "José Sarmiento", text: "Hola, ¿cómo estás?", isSelf: false },
                { id: 2, sender: "Me", text: "MENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO", isSelf: true }
            ]
        },
        {
            id: 2,
            name: "María López",
            avatar: "/api/placeholder/40/40",
            messages: [
                { id: 3, sender: "María López", text: "¿Tienes tiempo para hablar?", isSelf: false },
                { id: 4, sender: "Me", text: "Claro, dime", isSelf: true }
            ]
        },
        {
            id: 3,
            name: "Carlos Pérez",
            avatar: "/api/placeholder/40/40",
            messages: [
                { id: 5, sender: "Carlos Pérez", text: "Nos vemos mañana a las 10", isSelf: false },
                { id: 6, sender: "Me", text: "Perfecto, ahí estaré", isSelf: true }
            ]
        }
    ];

    const idChatSelected = parseInt(chatId)
    const chatSelected = (chats.find(chat => chat.id === idChatSelected))
    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
            {/* Verifica si hay un chat seleccionado */}
            {chatSelected ? (
                <>
                    {/* Chat Header */}
                    <div className="flex p-2 border-b border-gray-700 bg-gray-800 sticky mt-10 z-10 justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <img src={chatSelected.avatar} alt="Current chat" className="w-10 h-10 rounded-full" />
                            <span className="font-medium">{chatSelected.name}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" onClick={() => setSearchInChat(prev => !prev)}>
                                <Search size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" onClick={() => settransferOpen(prev => !prev)}>
                                <MessageSquareShare size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full relative" onClick={() => setMenuOpen(prev => !prev)}>
                                <SquarePlus size={20} />
                            </button>
                            {menuOpen && <MenuInchat isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
                        </div>
                    </div>

                    {/* Chat Transfer */}
                    {transferOpen && <ChatTransfer isOpen={transferOpen} onClose={() => settransferOpen(false)} chatId={idChatSelected} />}
                    {tagClick && <ChatTag isOpen={tagClick} onClose={() => setTagClick(false)} chatId={idChatSelected} />}
                    {resolveClick && <ChatResolved isOpen={resolveClick} onClose={() => setResolveClick(false)} chatId={idChatSelected} />}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {chatSelected.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}>
                                <div className={`flex ${message.isSelf ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                                    {!message.isSelf && (
                                        <img src={chatSelected.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                                    )}
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.isSelf
                                        ? "bg-verde-base rounded-l-lg rounded-br-lg"
                                        : "bg-gray-700 rounded-r-lg rounded-bl-lg"
                                        } p-3 whitespace-pre-wrap`}>
                                        {message.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className={`p-2 border-t border-gray-700 bg-gray-800 sticky bottom-0 ${isMobile ? "mb-10" : ""}`}>
                        <div className="flex items-center space-x-2">
                            <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-900 rounded-lg px-4 py-2 w-full" />
                            <button className="p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900">
                                <Send size={20} color="var(--color-verde-base)" />
                            </button>
                            <button className="p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900">
                                <Mic size={20} color="var(--color-verde-base)" />
                            </button>
                            <button className="p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900">
                                <Paperclip size={20} color="var(--color-verde-base)" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400">
                    <p>Selecciona un chat para comenzar</p>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
