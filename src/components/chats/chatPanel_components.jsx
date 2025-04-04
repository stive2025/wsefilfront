import { useState, useRef, useEffect } from "react";
import { 
    Send, Search, MessageSquareShare, SquarePlus, 
    Mic, Paperclip, X, ArrowLeft, File, Image, 
    Volume2, PlayCircle, Link, Download 
} from "lucide-react";
import Resize from "/src/hooks/responsiveHook.jsx";
import MenuInchat from "/src/components/mod/menuInchat.jsx";
import ChatTransfer from "/src/components/mod/chatTransfer.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import ChatTag from "/src/components/mod/chatTag.jsx";
import ChatResolved from "/src/components/mod/chatResolved.jsx";
import { TagClick, ResolveClick, SearchInChatClick, ChatInterfaceClick } from "/src/contexts/chats.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { getChat } from "/src/services/chats.js";
import { sendMessage } from "/src/services/messages.js";

const ChatInterface = () => {
    const isMobile = Resize();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const { tagClick, setTagClick } = useContext(TagClick);
    const { resolveClick, setResolveClick } = useContext(ResolveClick);
    const { setSearchInChat } = useContext(SearchInChatClick);
    const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
    const { callEndpoint } = useFetchAndLoad();

    // Estados para gestionar mensajes y archivos
    const [messageText, setMessageText] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [chatMessages, setChatMessages] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Referencias
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleMediaPreview = (mediaPath, mediaType) => {
        setMediaPreview({ path: mediaPath, type: mediaType });
    };

    const handleDownload = (mediaPath) => {
        const link = document.createElement('a');
        link.href = mediaPath;
        link.download = mediaPath.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderMediaPreview = () => {
        if (!mediaPreview) return null;

        const closePreview = () => setMediaPreview(null);

        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-full">
                    <button 
                        onClick={closePreview} 
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                    >
                        <X size={24} color="white" />
                    </button>
                    
                    {mediaPreview.type === 'image' ? (
                        <img 
                            src={mediaPreview.path} 
                            alt="Preview" 
                            className="max-w-full max-h-screen object-contain"
                        />
                    ) : (
                        <div className="bg-white p-6 rounded-lg text-black flex flex-col items-center">
                            <File size={64} />
                            <p className="mt-4">Documento: {mediaPreview.path.split('/').pop()}</p>
                        </div>
                    )}

                    <button 
                        onClick={() => handleDownload(mediaPreview.path)}
                        className="absolute bottom-2 right-2 bg-verde-base rounded-full p-2"
                    >
                        <Download size={24} color="white" />
                    </button>
                </div>
            </div>
        );
    };

    const renderMessageContent = (message, selectedChatId) => {
        const { media_type, body, media_path } = message;
        const isSelf = message.from_me === "true";

        const getMediaIcon = () => {
            switch (media_type) {
                case 'image': return <Image size={20} />;
                case 'audio': return <Volume2 size={20} />;
                case 'video': return <PlayCircle size={20} />;
                case 'url': return <Link size={20} />;
                case 'document': return <File size={20} />;
                case 'chat': return null;
                default: return <File size={20} />;
            }
        };

        return (
            <div key={message.id} className={`flex ${isSelf ? "justify-end" : "justify-start"} w-full`}>
                <div className={`flex ${isSelf ? "flex-row-reverse" : "flex-row"} items-start space-x-2 max-w-[60%] w-auto`}>
                    {!isSelf && (
                        <img
                            src={selectedChatId.photo || "/default-avatar.png"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                    )}
                    <div
                        className={`
                            ${isSelf
                                ? "bg-verde-base rounded-l-lg rounded-br-lg"
                                : "bg-gray-700 rounded-r-lg rounded-bl-lg"
                            } 
                            p-3 
                            w-full 
                            max-w-full 
                            break-words 
                            whitespace-pre-wrap 
                            flex 
                            items-center 
                            space-x-2
                        `}
                    >
                        {media_type !== 'chat' && media_type !== null && (
                            <span className="mr-2 flex-shrink-0">{getMediaIcon()}</span>
                        )}

                        <div className="flex-1 min-w-0">
                            {media_path && media_path !== 'no' ? (
                                <>
                                    {body && <div className="mb-2">{body}</div>}
                                    <div className="text-sm text-gray-300 truncate flex items-center justify-between">
                                        {media_type === 'url' ? (
                                            <a 
                                                href={media_path} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="underline overflow-hidden text-ellipsis"
                                            >
                                                {media_path}
                                            </a>
                                        ) : (
                                            <>
                                                <span className="truncate max-w-[calc(100%-60px)]">{media_path.split('/').pop()}</span>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    {(media_type === 'image' || media_type === 'document') && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleMediaPreview(media_path, media_type)}
                                                                className="text-white hover:text-gray-300"
                                                            >
                                                                <Image size={20} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDownload(media_path)}
                                                                className="text-white hover:text-gray-300"
                                                            >
                                                                <Download size={20} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>{body}</>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await callEndpoint(getChat(selectedChatId.id));
                setChatMessages(response.messages)
            } catch (error) {
                console.error("Error cargando mensajes:", error);
            }
        };

        if (selectedChatId) {
            loadMessages();
        }
    }, [selectedChatId]);

    // Función para manejar la selección de archivos
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        event.target.value = null; // Resetear el input para permitir seleccionar el mismo archivo
    };

    // Función para abrir el selector de archivos
    const handlePaperclipClick = () => {
        fileInputRef.current.click();
    };

    // Función para iniciar/detener la grabación de audio
    const handleMicClick = async () => {
        if (isRecording) {
            // Detener grabación
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);

                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunksRef.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedAudio({
                        blob: audioBlob,
                        url: audioUrl,
                        name: `audio_${new Date().toISOString()}.wav`
                    });

                    // Detener todas las pistas del stream
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error al acceder al micrófono:", error);
                alert("No se pudo acceder al micrófono. Verifica los permisos.");
            }
        }
    };

    // Función para enviar mensaje con archivos adjuntos
    const handleSendMessage = async () => {
        if (messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) {
            return; // No hay nada que enviar
        }

        if (sendingMessage) return; // Prevent multiple sends

        try {
            setSendingMessage(true);

            // Prepare media array for the message
            const mediaArray = [
                ...selectedFiles.map(file => ({
                    name: file.name,
                    caption: "" // You can add a caption logic if needed
                })),
                ...(recordedAudio ? [{
                    name: recordedAudio.name,
                    caption: "" // You can add a caption logic if needed
                }] : [])
            ];

            // Prepare message data
            const messageData = {
                number: selectedChatId.number || "", // Fallback to empty string
                body: messageText,
                media: mediaArray.length > 0 ? mediaArray : "",
                user: 12, // Replace with actual user ID from your context
                chat_id: selectedChatId.id,
                from_me:true
            };

            // Remove undefined properties
            Object.keys(messageData).forEach(key => 
                messageData[key] === undefined && delete messageData[key]
            );

            // Send message using the service
            console.log(messageData)
            const { call } = sendMessage(messageData);
            const response = await call;

            // Handle successful message send
            if (response.ok) {
                // Optionally, you can update the chat messages state here
                setChatMessages(prev => [...(prev || []), {
                    id: Date.now(), // Temporary ID
                    body: messageText,
                    from_me: "true",
                    media_type: "chat"
                }]);

                // Reset input states
                setMessageText("");
                setSelectedFiles([]);
                setRecordedAudio(null);
            } else {
                // Handle error scenario
                console.error("Failed to send message", response);
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred while sending the message.");
        } finally {
            setSendingMessage(false);
        }
    };

    // Función para eliminar archivo seleccionado
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Función para eliminar audio grabado
    const removeAudio = () => {
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio.url);
            setRecordedAudio(null);
        }
    };

    // Limpiar URLs de objetos al desmontar
    useEffect(() => {
        return () => {
            if (recordedAudio) {
                URL.revokeObjectURL(recordedAudio.url);
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
            {selectedChatId ? (
                <>
                    {/* Chat Header */}
                    <div className="flex p-2 border-b border-gray-700 bg-gray-800 sticky mt-10 z-10 justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {location.pathname === "/chatList" && isMobile && (
                                <button
                                    className="p-1 text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black"
                                    onClick={() => setSelectedChatId(null)}
                                >
                                    <ArrowLeft size={15} />
                                </button>
                            )}
                            <img 
                                src={selectedChatId.photo || "/default-avatar.png"} 
                                alt="Current chat" 
                                className="w-10 h-10 rounded-full" 
                            />
                            <span className="font-medium">{selectedChatId.name}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" 
                                onClick={() => setSearchInChat(prev => !prev)}
                            >
                                <Search size={20} />
                            </button>
                            <button 
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" 
                                onClick={() => setTransferOpen(prev => !prev)}
                            >
                                <MessageSquareShare size={20} />
                            </button>
                            <button 
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full relative" 
                                onClick={() => setMenuOpen(prev => !prev)}
                            >
                                <SquarePlus size={20} />
                            </button>
                            {menuOpen && <MenuInchat isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
                        </div>
                    </div>

                    {/* Chat Transfer */}
                    {transferOpen && <ChatTransfer isOpen={transferOpen} onClose={() => setTransferOpen(false)} />}
                    {tagClick && <ChatTag isOpen={tagClick} onClose={() => setTagClick(false)} />}
                    {resolveClick && <ChatResolved isOpen={resolveClick} onClose={() => setResolveClick(false)} />}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {chatMessages && chatMessages.map((message) => 
                            renderMessageContent(message, selectedChatId)
                        )}
                    </div>

                    {/* Preview de archivos y audio seleccionados */}
                    {(selectedFiles.length > 0 || recordedAudio) && (
                        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                            <div className="text-sm text-gray-400 mb-2">Archivos adjuntos:</div>
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="bg-gray-700 rounded p-2 flex items-center">
                                        <span className="text-sm truncate max-w-xs">{file.name}</span>
                                        <button
                                            className="ml-2 text-gray-400 hover:text-white"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {recordedAudio && (
                                    <div className="bg-gray-700 rounded p-2 flex items-center">
                                        <audio controls src={recordedAudio.url} className="h-8 w-32" />
                                        <button
                                            className="ml-2 text-gray-400 hover:text-white"
                                            onClick={removeAudio}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className={`p-2 border-t border-gray-700 bg-gray-800 sticky bottom-0 ${isMobile ? "mb-10" : ""}`}>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-900 rounded-lg px-4 py-2 w-full"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                className="p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900"
                                onClick={handleSendMessage}
                                disabled={sendingMessage}
                            >
                                <Send size={20} color="var(--color-verde-base)" />
                            </button>
                            <button
                                className={`p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900 ${isRecording ? "bg-red-600 bg-opacity-50" : ""}`}
                                onClick={handleMicClick}
                            >
                                <Mic size={20} color={isRecording ? "red" : "var(--color-verde-base)"} />
                            </button>
                            <button
                                className="p-2 bg-transparent rounded-lg hover:bg-gray-700 active:bg-gray-900"
                                onClick={handlePaperclipClick}
                            >
                                <Paperclip size={20} color="var(--color-verde-base)" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileSelect}
                                multiple
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400">
                    <p>Selecciona un chat para comenzar</p>
                </div>
            )}

            {/* Media Preview Modal */}
            {mediaPreview && renderMediaPreview()}
        </div>
    );
};

export default ChatInterface;