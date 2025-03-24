import { useState, useRef, useEffect } from "react";
import { Send, Search, MessageSquareShare, SquarePlus, Mic, Paperclip, X, ArrowLeft } from "lucide-react";
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



// eslint-disable-next-line react/prop-types
const ChatInterface = () => {
    const isMobile = Resize();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
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

    // Referencias
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);



    useEffect(() => {
        console.log(selectedChatId)
        const loadMessages = async () => {
            try {
                const response = await callEndpoint(getChat(selectedChatId.id));
                console.log(response)
                setChatMessages(response.messages)
            } catch (error) {
                console.error("Error cargando mensajes:", error);
            }
        };
        loadMessages();
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
    const handleSendMessage = () => {
        if (messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) {
            return; // No hay nada que enviar
        }

        // Aquí implementarías la lógica para enviar el mensaje al backend
        console.log("Enviando mensaje:", {
            text: messageText,
            files: selectedFiles,
            audio: recordedAudio
        });

        // Limpiar estados después de enviar
        setMessageText("");
        setSelectedFiles([]);
        setRecordedAudio(null);
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
            {/* Verifica si hay un chat seleccionado */}
            {chatMessages ? (
                <>
                    {/* Chat Header */}
                    <div className="flex p-2 border-b border-gray-700 bg-gray-800 sticky mt-10 z-10 justify-between items-center">
                        <div className="flex items-center space-x-3">
                            {location.pathname === "/chatList" && isMobile && (<button
                                className="p-1 text-white rounded-full cursor-pointer hover:bg-gray-700 active:bg-gray-700 active:text-black"
                                onClick={() => setSelectedChatId(null)}
                            >
                                <ArrowLeft size={15} />
                            </button>
                            )}
                            <img src={selectedChatId.photo} alt="Current chat" className="w-10 h-10 rounded-full" />
                            <span className="font-medium">{selectedChatId.name}</span>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" onClick={() => setSearchInChat(prev => !prev)}>
                                <Search size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full" onClick={() => setTransferOpen(prev => !prev)}>
                                <MessageSquareShare size={20} />
                            </button>
                            <button className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full relative" onClick={() => setMenuOpen(prev => !prev)}>
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
                    {<div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {chatMessages && chatMessages.map((message) => {
                            // Determinar si el mensaje es del usuario o del contacto
                            const isSelf = message.from_me === "true";

                            return (
                                <div key={message.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex ${isSelf ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}>
                                        {!isSelf && (
                                            <img
                                                src={selectedChatId.photo || "/default-avatar.png"}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full"
                                            />
                                        )}
                                        <div
                                            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isSelf
                                                ? "bg-verde-base rounded-l-lg rounded-br-lg"
                                                : "bg-gray-700 rounded-r-lg rounded-bl-lg"
                                                } p-3 whitespace-pre-wrap`}
                                        >
                                            {message.body}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>}

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
        </div>
    );
};

export default ChatInterface;