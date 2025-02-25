import { useState } from "react";
import { Send, Search, MessageSquareShare, SquarePlus } from "lucide-react";
import MenuInchat from "/src/components/mod/menuInchat.jsx";

const ChatInterface = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [messages] = useState([
        { id: 1, sender: "José Sarmiento", text: "Hola, ¿cómo estás?", avatar: "/api/placeholder/40/40", isSelf: false },
        { id: 2, sender: "Me", text: "MENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO", isSelf: true },
        { id: 3, sender: "José Sarmiento", text: "MENSAJE DE ENVÍO", avatar: "/api/placeholder/40/40", isSelf: false },
        { id: 4, sender: "Me", text: "MENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO", isSelf: true }
    ]);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
            {/* Chat Header */}
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800 sticky mt-14 z-10">
                <div className="flex items-center space-x-3">
                    <img src="/api/placeholder/40/40" alt="Current chat" className="w-10 h-10 rounded-full" />
                    <span className="font-medium">José Sarmiento</span>
                </div>
                <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full">
                        <Search size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full">
                        <MessageSquareShare size={20} />
                    </button>
                    <button
                        className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full"
                        onClick={() => setMenuOpen(prev => !prev)}
                    >
                        <SquarePlus size={20} />
                        {menuOpen && <MenuInchat />}
                    </button>
                    
                </div>
            </div>

            {/* Menú Inchat */}
            

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}>
                        <div className={`flex ${message.isSelf ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                            {!message.isSelf && <img src={message.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.isSelf
                                ? "bg-blue-600 rounded-l-lg rounded-br-lg"
                                : "bg-gray-700 rounded-r-lg rounded-bl-lg"
                                } p-3 whitespace-pre-wrap`}>
                                {message.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800 sticky bottom-0">
                <div className="flex items-center space-x-2">
                    <input type="text" placeholder="Type a message..." className="flex-1 bg-gray-900 rounded-lg px-4 py-2" />
                    <button className="p-2 bg-green-900 rounded-lg hover:bg-green-700">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
