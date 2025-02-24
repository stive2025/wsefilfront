import  useState  from 'react';
import { Settings, Send } from 'lucide-react';

const ChatInterface = () => {
    const [messages] = useState([
        {
            id: 1,
            sender: 'José Sarmiento',
            text: 'Hola, ¿cómo estás?',
            avatar: '/api/placeholder/40/40',
            isSelf: false
        },
        {
            id: 2,
            sender: 'Me',
            text: 'MENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO\nMENSAJE DE ENVÍO',
            isSelf: true
        },
        {
            id: 3,
            sender: 'José Sarmiento',
            text: 'MENSAJE DE ENVÍO',
            avatar: '/api/placeholder/40/40',
            isSelf: false
        }
    ]);
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src="/api/placeholder/40/40"
                            alt="Current chat"
                            className="w-10 h-10 rounded-full"
                        />
                        <span className="font-medium">José Sarmiento</span>
                    </div>
                    <button className="p-2 hover:bg-gray-700 rounded">
                        <Settings size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isSelf ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex ${message.isSelf ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
                                {!message.isSelf && (
                                    <img
                                        src={message.avatar}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <div
                                    className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.isSelf
                                        ? 'bg-blue-600 rounded-l-lg rounded-br-lg'
                                        : 'bg-gray-700 rounded-r-lg rounded-bl-lg'
                                        } p-3 whitespace-pre-wrap`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-800 rounded-lg px-4 py-2"
                        />
                        <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;