import { useState, useRef, useEffect } from "react";
import {
    Send, Search, MessageSquareShare, SquarePlus,
    Mic, Paperclip, X, ArrowLeft, File, Image,
    Volume2, PlayCircle, Link, Download, EyeOff, Loader,
    RefreshCcw
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
import { getChat, updateChat } from "/src/services/chats.js";
import { sendMessage } from "/src/services/messages.js";
import toast from "react-hot-toast";

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

    // File size limit in bytes (2MB = 2 * 1024 * 1024)
    const FILE_SIZE_LIMIT = 2 * 1024 * 1024;
    const [fileSizeError, setFileSizeError] = useState("");

    // Estados para gestionar mensajes y archivos
    const [messageText, setMessageText] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [chatMessages, setChatMessages] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isNewChat, setIsNewChat] = useState(false);
    const [reopeningChat, setReopeningChat] = useState(false);
    // Estado para controlar la carga del chat
    const [isLoading, setIsLoading] = useState(true);

    // Referencias
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesContainerRef = useRef(null); // Ref for messages container

    // Determinar si el chat está cerrado de manera consistente
    const isChatClosed = selectedChatId?.status === "CLOSED";

    // Function to reopen a closed chat
    const handleReopenChat = async () => {
        if (!selectedChatId || !selectedChatId.id) {
            console.error("No chat selected");
            return;
        }

        try {
            setReopeningChat(true);
            const { call, abortController } = updateChat(selectedChatId.id, { state: "OPEN" });
            await callEndpoint({ call, abortController });
            // Update the selectedChatId with the new state
            setSelectedChatId(prev => ({
                ...prev,
                status: "OPEN"
            }));
            
            toast.success("Chat reabierto con éxito");
        } catch (error) {
            toast.error("Ocurrió un error al reabrir el chat");
            console.error("Error al reabrir el chat:", error);
        } finally {
            setReopeningChat(false);
        }
    };

    // Function to scroll to the bottom of the messages
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Format date for message timestamps
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for date separators
    const formatMessageDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Hoy";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Ayer";
        } else {
            return date.toLocaleDateString([], {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    };

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
                        className="absolute bottom-2 right-2 bg-teal-600 rounded-full p-2"
                    >
                        <Download size={24} color="white" />
                    </button>
                </div>
            </div>
        );
    };

    const renderMessageContent = (message, prevMessageDate) => {
        const { media_type, body, media_path, created_at } = message;
        const isSelf = message.from_me === "true";
        const isPrivate = message.is_private;
        const messageTime = formatMessageTime(created_at);
        const messageDate = formatMessageDate(created_at);
        const showDateSeparator = prevMessageDate !== messageDate && created_at;

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
            <>
                {showDateSeparator && (
                    <div className="flex justify-center my-4">
                        <div className="bg-gray-800 text-gray-300 px-4 py-1 rounded-full text-xs">
                            {messageDate}
                        </div>
                    </div>
                )}
                <div key={message.id} className={`flex ${isPrivate === 1 ? "justify-center" : isSelf ? "justify-end" : "justify-start"} w-full mb-2`}>
                    <div className={`flex ${isSelf && !isPrivate ? "flex-row-reverse" : "flex-row"} items-start space-x-2 ${isPrivate === 1 ? "max-w-[70%]" : "max-w-[60%]"} w-auto`}>
                        <div
                            className={`
                            ${isPrivate === 1
                                    ? "bg-indigo-900 mx-auto rounded-lg"
                                    : isSelf
                                        ? "bg-teal-700 rounded-l-lg rounded-br-lg ml-auto"
                                        : "bg-gray-700 rounded-r-lg rounded-bl-lg mr-auto"
                                }
                            p-3 
                            w-full 
                            max-w-full 
                            break-words 
                            whitespace-pre-wrap 
                            flex 
                            flex-col
                          `}
                        >
                            {isPrivate === 1 && (
                                <div className="flex items-center justify-center mb-2 text-gray-300">
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Mensaje Privado</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
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

                            {/* Timestamp */}
                            <div className={`text-xs text-gray-400 mt-1 ${isSelf ? "text-right" : "text-left"}`}>
                                {messageTime}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    useEffect(() => {
        const loadMessages = async () => {
            // Siempre comenzar con estado de carga al cambiar de chat
            setIsLoading(true);
            
            // Solo intentar cargar mensajes si hay un chat_id existente
            if (selectedChatId && selectedChatId.id) {
                try {
                    const response = await callEndpoint(getChat(selectedChatId.id));
                    setChatMessages(response.messages);
                    
                    // Update the selectedChatId with the current state from the response
                    setSelectedChatId(prev => ({
                        ...prev,
                        status: response.state || prev.state
                    }));
                    
                    setIsNewChat(false);
                } catch (error) {
                    console.error("Error cargando mensajes:", error);
                    setChatMessages([]);
                    toast.error("Error al cargar los mensajes del chat");
                }
            } else if (selectedChatId && selectedChatId.idContact) {
                // Es un chat nuevo
                setChatMessages([]);
                setIsNewChat(true);
                
                // Ensure state is set to "OPEN" for new chats
                setSelectedChatId(prev => ({
                    ...prev,
                    status: "OPEN"
                }));
            } else {
                setChatMessages(null);
                setIsNewChat(false);
            }
            
            // Finalizar estado de carga después de procesar
            setIsLoading(false);
        };

        loadMessages();
    }, [selectedChatId?.id]); // Solo recargar mensajes cuando cambia el ID de chat

    // Scroll to bottom when messages load or change
    useEffect(() => {
        if (chatMessages && chatMessages.length > 0) {
            scrollToBottom();
        }
    }, [chatMessages]);

    // Verificar el tamaño total de los archivos multimedia
    const checkTotalMediaSize = (newFiles) => {
        // Calculamos el tamaño total actual
        let currentTotalSize = selectedFiles.reduce((total, file) => total + file.size, 0);

        // Añadimos el tamaño del audio grabado si existe
        if (recordedAudio) {
            currentTotalSize += recordedAudio.blob.size;
        }

        // Añadimos el tamaño de los nuevos archivos
        const newTotalSize = currentTotalSize + newFiles.reduce((total, file) => total + file.size, 0);

        // Verificamos si excede el límite
        return newTotalSize <= FILE_SIZE_LIMIT;
    };

    // Función para manejar la selección de archivos con restricción de tamaño
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);

        // Verificar el tamaño total
        if (!checkTotalMediaSize(files)) {
            setFileSizeError("La suma de los archivos multimedia no debe superar los 2MB.");
            // Clear error message after 5 seconds
            setTimeout(() => setFileSizeError(""), 5000);
            event.target.value = null;
            return;
        }

        const validFiles = [];
        // Check each file size
        files.forEach(file => {
            if (file.size > FILE_SIZE_LIMIT) {
                setFileSizeError(`El archivo "${file.name}" excede el límite de 2MB.`);
                // Clear error message after 5 seconds
                setTimeout(() => setFileSizeError(""), 5000);
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }

        event.target.value = null; // Reset input to allow selecting the same file again
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

                    // Check if adding this audio would exceed the total limit
                    const totalCurrentSize = selectedFiles.reduce((total, file) => total + file.size, 0);
                    if (totalCurrentSize + audioBlob.size > FILE_SIZE_LIMIT) {
                        setFileSizeError("La suma de los archivos multimedia no debe superar los 2MB.");
                        // Clear error message after 5 seconds
                        setTimeout(() => setFileSizeError(""), 5000);

                        // Detener todas las pistas del stream
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    // Check if audio file size exceeds limit
                    if (audioBlob.size > FILE_SIZE_LIMIT) {
                        setFileSizeError("La grabación de audio excede el límite de 2MB.");
                        // Clear error message after 5 seconds
                        setTimeout(() => setFileSizeError(""), 5000);

                        // Detener todas las pistas del stream
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

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

        // Check if chat is closed before attempting to send
        if (sendingMessage || isChatClosed) return;

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

            // Prepare message data - Make chat_id optional
            const messageData = {
                number: selectedChatId.number || "", // Fallback to empty string
                body: messageText,
                media: mediaArray.length > 0 ? mediaArray : "",
                from_me: true
            };

            // Only add chat_id if it exists
            if (selectedChatId.id) {
                messageData.chat_id = selectedChatId.id;
            }

            // For new chats, use idContact instead of chat_id
            if (isNewChat && selectedChatId.idContact) {
                messageData.contact_id = selectedChatId.idContact;
            }

            // Remove undefined properties
            Object.keys(messageData).forEach(key =>
                messageData[key] === undefined && delete messageData[key]
            );

            // Send message using the service
            console.log("Sending message data:", messageData);
            const { call } = sendMessage(messageData);
            const response = await call;
            console.log("Message response:", response);

            // Handle successful message send
            if (response) {
                // Si era un chat nuevo y recibimos un chat_id en la respuesta
                if (isNewChat && response.chat_id) {
                    setSelectedChatId(prev => ({
                        ...prev,
                        id: response.chat_id
                    }));
                    setIsNewChat(false);
                }

                // Crear un nuevo objeto de mensaje para la UI
                const newMessage = {
                    id: Date.now(), // ID temporal
                    body: messageText,
                    from_me: "true",
                    media_type: "chat",
                    created_at: new Date().toISOString() // Añadir timestamp
                };

                // Actualizar mensajes (incluido para chats nuevos)
                setChatMessages(prev => {
                    // Si es un array existente, añadir el nuevo mensaje
                    if (Array.isArray(prev)) {
                        return [...prev, newMessage];
                    }
                    // Si es null o undefined (chat nuevo), crear un nuevo array con este mensaje
                    return [newMessage];
                });

                // Reset input states
                setMessageText("");
                setSelectedFiles([]);
                setRecordedAudio(null);

                // Scroll to bottom after sending a message
                setTimeout(scrollToBottom, 100); // Small delay to ensure DOM update
            } else {
                // Handle error scenario
                console.error("Failed to send message", response);
                toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Ocurrió un error al enviar el mensaje.");
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

    // Group messages by date
    const renderMessagesWithDateSeparators = () => {
        if (!chatMessages || chatMessages.length === 0) return null;

        let lastMessageDate = "";

        return chatMessages.map((message, index) => {
            const messageDate = formatMessageDate(message.created_at);
            const currentElement = renderMessageContent(message, lastMessageDate);
            lastMessageDate = messageDate;
            return <div key={message.id || index}>{currentElement}</div>;
        });
    };

    // Limpiar URLs de objetos al desmontar
    useEffect(() => {
        return () => {
            if (recordedAudio) {
                URL.revokeObjectURL(recordedAudio.url);
            }
        };
    }, []);

    // Determinar si debe mostrar la interfaz de chat (si hay selectedChatId o selectedChatId.idContact)
    const shouldShowChat = selectedChatId && (selectedChatId.id || selectedChatId.idContact);

    // Verificar si hay mensajes para mostrar
    const hasMessages = chatMessages && chatMessages.length > 0;

    // Renderizar un loader mientras se carga el chat
    if (shouldShowChat && isLoading) {
        return (
            <div className="flex flex-col h-screen w-full bg-gray-900 text-white justify-center items-center">
                <Loader size={40} className="animate-spin text-teal-500" />
                <p className="mt-4 text-gray-400">Cargando chat...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
            {shouldShowChat ? (
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
                            <div className="flex flex-col">
                                <span className="font-medium">{selectedChatId.name}</span>
                                {isChatClosed && (
                                    <span className="text-xs text-red-400">Chat cerrado</span>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full"
                                onClick={() => setSearchInChat(prev => !prev)}
                                disabled={isChatClosed}
                                style={isChatClosed ? { opacity: 0.5 } : {}}
                            >
                                <Search size={20} />
                            </button>
                            <button
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full"
                                onClick={() => isChatClosed ? null : setTransferOpen(prev => !prev)}
                                disabled={isChatClosed}
                                style={isChatClosed ? { opacity: 0.5 } : {}}
                            >
                                <MessageSquareShare size={20} />
                            </button>
                            <button
                                className="p-2 hover:bg-gray-700 active:bg-gray-700 rounded-full relative"
                                onClick={() => isChatClosed ? null : setMenuOpen(prev => !prev)}
                                disabled={isChatClosed}
                                style={isChatClosed ? { opacity: 0.5 } : {}}
                            >
                                <SquarePlus size={20} />
                            </button>
                            {menuOpen && !isChatClosed && <MenuInchat isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
                        </div>
                    </div>

                    {/* Chat Transfer - Only show when chat is open */}
                    {transferOpen && !isChatClosed && <ChatTransfer isOpen={transferOpen} onClose={() => setTransferOpen(false)} />}
                    {tagClick && !isChatClosed && <ChatTag isOpen={tagClick} onClose={() => setTagClick(false)} />}
                    {resolveClick && !isChatClosed && <ChatResolved isOpen={resolveClick} onClose={() => setResolveClick(false)} />}

                    {/* Reopen chat button - Show only when chat is closed */}
                    {isChatClosed && (
                        <div className="bg-gray-800 p-2 text-center">
                            <button 
                                className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg flex items-center justify-center mx-auto"
                                onClick={handleReopenChat}
                                disabled={reopeningChat}
                            >
                                {reopeningChat ? (
                                    <>
                                        <Loader size={16} className="animate-spin mr-2" />
                                        <span>Reabriendo chat...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCcw size={16} className="mr-2" />
                                        <span>Reabrir chat</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* File Size Error Message */}
                    {fileSizeError && (
                        <div className="bg-red-500 text-white p-2 text-center">
                            {fileSizeError}
                        </div>
                    )}

                    {/* Messages Area - Add ref here */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
                        style={{
                            backgroundImage: "url('https://i.pinimg.com/474x/66/33/b0/6633b0f983f094bef115082c63302554.jpg')",
                            backgroundSize: "cover"
                        }}
                    >
                        {isNewChat && !hasMessages ? (
                            <div className="flex justify-center items-center h-full opacity-50">
                                <p>Comienza un nuevo chat con este contacto</p>
                            </div>
                        ) : (
                            renderMessagesWithDateSeparators()
                        )}
                    </div>

                    {/* Preview de archivos y audio seleccionados */}
                    {(selectedFiles.length > 0 || recordedAudio) && (
                        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                            <div className="text-sm text-gray-400 mb-2">Archivos adjuntos:</div>
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="bg-gray-700 rounded-md p-2 flex items-center space-x-2">
                                        <File size={16} />
                                        <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                                        <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {recordedAudio && (
                                    <div className="bg-gray-700 rounded-md p-2 flex items-center space-x-2">
                                        <Volume2 size={16} />
                                        <span className="text-sm">Audio grabado</span>
                                        <audio controls src={recordedAudio.url} className="h-6 w-24" />
                                        <button onClick={removeAudio} className="text-red-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Input Area - Disable when chat is closed */}
                    <div className={`p-4 bg-gray-800 border-t border-gray-700 ${isChatClosed ? "opacity-60" : ""}`}>
                        <div className="flex items-center space-x-2">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder={isChatClosed ? "Chat cerrado" : "Escribe un mensaje..."}
                                className="flex-1 bg-gray-700 text-white rounded-lg p-3 resize-none outline-none"
                                rows={1}
                                style={{ minHeight: '40px' }}
                                disabled={isChatClosed}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                className="hidden"
                                disabled={isChatClosed}
                            />

                            <button
                                className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-700'}`}
                                onClick={handleMicClick}
                                disabled={isChatClosed}
                            >
                                <Mic size={20} />
                            </button>

                            <button
                                className="p-2 bg-gray-700 rounded-full"
                                onClick={handlePaperclipClick}
                                disabled={isChatClosed}
                            >
                                <Paperclip size={20} />
                            </button>

                            <button
                                className="p-2 bg-teal-600 rounded-full"
                                onClick={handleSendMessage}
                                disabled={
                                    isChatClosed || 
                                    (messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) ||
                                    sendingMessage
                                }
                            >
                                {sendingMessage ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                // Empty state when no chat is selected
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="p-6 bg-gray-800 rounded-xl flex flex-col items-center">
                        <MessageSquareShare size={64} className="mb-4 text-teal-500" />
                        <h3 className="text-xl font-medium text-white mb-2">Ningún chat seleccionado</h3>
                        <p className="text-center mb-2">Selecciona un chat de la lista o inicia una nueva conversación</p>
                    </div>
                </div>
            )}

            {/* Media Preview Modal */}
            {renderMediaPreview()}
        </div>
    );
};

export default ChatInterface;