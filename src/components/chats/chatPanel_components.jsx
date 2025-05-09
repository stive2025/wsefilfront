import { useState, useRef, useEffect } from "react";
import {
    Send, Search, MessageSquareShare, SquarePlus,
    Mic, Paperclip, X, ArrowLeft, File, Image,
    Volume2, PlayCircle, Download, EyeOff, Loader, Clock, Check, AlertTriangle,
    RefreshCcw
} from "lucide-react";
import { ABILITIES } from '/src/constants/abilities';
import AbilityGuard from '/src/components/common/AbilityGuard';
import Resize from "/src/hooks/responsiveHook.jsx";
import MenuInchat from "/src/components/mod/menuInchat.jsx";
import ChatTransfer from "/src/components/mod/chatTransfer.jsx";
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import ChatTag from "/src/components/mod/chatTag.jsx";
import ChatResolved from "/src/components/mod/chatResolved.jsx";
import { TagClick, ResolveClick, SearchInChatClick, ChatInterfaceClick, WebSocketMessage } from "/src/contexts/chats.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { getChat, updateChat } from "/src/services/chats.js";
import { sendMessage } from "/src/services/messages.js";
import toast from "react-hot-toast";
import { useTheme } from "/src/contexts/themeContext";

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
    const { messageData } = useContext(WebSocketMessage);
    const { theme } = useTheme();

    // File size limit in bytes (2MB = 2 * 1024 * 1024)
    const FILE_SIZE_LIMIT = 2 * 1024 * 1024;
    const [fileSizeError, setFileSizeError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Estados para gestionar mensajes y archivos
    const [messageText, setMessageText] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [chatMessages, setChatMessages] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isNewChat, setIsNewChat] = useState(false);
    const [reopeningChat, setReopeningChat] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Referencias
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesContainerRef = useRef(null);

    // Determinar si el chat está cerrado
    const isChatClosed = selectedChatId?.status === "CLOSED";
    const shouldShowChat = selectedChatId && (selectedChatId.id || selectedChatId.idContact || selectedChatId.number);
    const hasMessages = chatMessages && chatMessages.length > 0;

    // Efectos
    useEffect(() => {
        const loadMessages = async () => {
            setIsLoading(true);

            if (selectedChatId && selectedChatId.id) {
                try {
                    const response = await callEndpoint(getChat(selectedChatId.id));
                    setChatMessages(response.messages);
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
                setChatMessages([]);
                setIsNewChat(true);
                setSelectedChatId(prev => ({
                    ...prev,
                    status: "OPEN"
                }));
            } else {
                setChatMessages(null);
                setIsNewChat(false);
            }

            setIsLoading(false);
        };

        loadMessages();
    }, [selectedChatId?.id]);

    useEffect(() => {
        if (chatMessages && chatMessages.length > 0) {
            scrollToBottom();
        }
    }, [chatMessages]);

    useEffect(() => {
        if (messageData && messageData.body) {
            // Ignorar mensajes que ya fueron mostrados por el flujo optimista
            const isDuplicate = chatMessages?.some(msg =>
                (msg.id === messageData.id) || // Mensaje ya existe con ID real
                (msg.is_temp && msg.body === messageData.body &&
                    msg.from_me === (messageData.from_me ? "true" : "false") &&
                    (!msg.media_path || msg.media_path === messageData.media_url)) // Mismo contenido
            );

            if (isDuplicate) return;

            if (selectedChatId && (selectedChatId.id === messageData.chat_id)) {
                setChatMessages(prevMessages => {
                    // Si es un mensaje nuestro (from_me) y tenemos un mensaje temporal, reemplazarlo
                    if (messageData.from_me) {
                        const tempMessageIndex = prevMessages?.findIndex(msg =>
                            msg.is_temp &&
                            msg.body === messageData.body &&
                            (!msg.media_path || msg.media_path === messageData.media_url)
                        );

                        if (tempMessageIndex !== -1 && tempMessageIndex !== undefined) {
                            const newMessages = [...prevMessages];
                            newMessages[tempMessageIndex] = {
                                ...newMessages[tempMessageIndex],
                                id: messageData.id,
                                is_temp: false,
                                ack: messageData.ack || 1,
                                ...(messageData.media_url && { media_path: messageData.media_url })
                            };
                            return newMessages;
                        }
                    }

                    // Si no es un mensaje nuestro o no encontramos el temporal, agregar nuevo
                    const newMessage = {
                        id: messageData.id,
                        body: messageData.body,
                        from_me: messageData.from_me ? "true" : "false",
                        media_type: messageData.media_type || 'chat',
                        media_path: messageData.media_url || '',
                        is_private: messageData.is_private || 0,
                        created_at: messageData.created_at || new Date().toISOString(),
                        ack: messageData.ack || 0
                    };

                    return prevMessages ? [...prevMessages, newMessage] : [newMessage];
                });

                setTimeout(scrollToBottom, 100);
            }
        }
    }, [messageData, selectedChatId]);

    useEffect(() => {
        return () => {
            selectedFiles.forEach(file => URL.revokeObjectURL(file.previewUrl));
            if (recordedAudio) URL.revokeObjectURL(recordedAudio.url);
            if (chatMessages) {
                chatMessages.forEach(msg => {
                    if (msg.is_temp && msg.media_path) {
                        URL.revokeObjectURL(msg.media_path);
                    }
                });
            }
        };
    }, [selectedFiles, recordedAudio, chatMessages]);

    // Funciones de ayuda
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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

    const renderAckStatus = (ackStatus) => {
        switch (ackStatus) {
            case -1: return <AlertTriangle size={14} className="text-yellow-500" />;
            case 0: return <Clock size={14} className="text-gray-400" />;
            case 1: return <Check size={14} className="text-gray-400" />;
            case 2: return (
                <div className="relative">
                    <Check size={14} className="text-gray-400" />
                    <Check size={14} className="text-gray-400 absolute top-0 left-1" />
                </div>
            );
            case 3: return (
                <div className="relative">
                    <Check size={14} className="text-blue-500" />
                    <Check size={14} className="text-blue-500 absolute top-0 left-1" />
                </div>
            );
            default: return null;
        }
    };

    // Funciones para archivos multimedia
    const checkTotalMediaSize = (newFiles) => {
        let currentTotalSize = selectedFiles.reduce((total, file) => total + file.file.size, 0);
        if (recordedAudio) {
            currentTotalSize += recordedAudio.blob.size;
        }
        const newTotalSize = currentTotalSize + newFiles.reduce((total, file) => total + file.size, 0);
        return newTotalSize <= FILE_SIZE_LIMIT;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        event.target.value = null;

        if (!files || files.length === 0) return;

        if (!checkTotalMediaSize(files)) {
            setFileSizeError("La suma de los archivos multimedia no debe superar los 2MB.");
            setTimeout(() => setFileSizeError(""), 5000);
            return;
        }

        const validFiles = files.map(file => {
            if (file.size > FILE_SIZE_LIMIT) {
                setFileSizeError(`El archivo "${file.name}" excede el límite de 2MB.`);
                setTimeout(() => setFileSizeError(""), 5000);
                return null;
            }

            return {
                file,
                previewUrl: URL.createObjectURL(file),
                type: file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('audio/') ? 'audio' :
                        file.type.startsWith('video/') ? 'video' : 'document'
            };
        }).filter(Boolean);

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handlePaperclipClick = () => {
        fileInputRef.current.click();
    };

    const removeFile = (index) => {
        setSelectedFiles(prevFiles => {
            const fileToRemove = prevFiles[index];
            URL.revokeObjectURL(fileToRemove.previewUrl);
            const newFiles = [...prevFiles];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleMicClick = async () => {
        if (isRecording) {
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
                    const totalCurrentSize = selectedFiles.reduce((total, file) => total + file.file.size, 0);

                    if (totalCurrentSize + audioBlob.size > FILE_SIZE_LIMIT) {
                        setFileSizeError("La suma de los archivos multimedia no debe superar los 2MB.");
                        setTimeout(() => setFileSizeError(""), 5000);
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    if (audioBlob.size > FILE_SIZE_LIMIT) {
                        setFileSizeError("La grabación de audio excede el límite de 2MB.");
                        setTimeout(() => setFileSizeError(""), 5000);
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }

                    const audioUrl = URL.createObjectURL(audioBlob);
                    setRecordedAudio({
                        blob: audioBlob,
                        url: audioUrl,
                        name: `audio_${new Date().toISOString()}.wav`
                    });

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

    const removeAudio = () => {
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio.url);
            setRecordedAudio(null);
        }
    };

    // Funciones para mensajes
    const renderMessageContent = (message, prevMessageDate) => {
        const { media_type, body, media_path, created_at, is_temp } = message;
        const isSelf = message.from_me === "true";
        const isPrivate = message.is_private;
        const messageTime = formatMessageTime(created_at);
        const messageDate = formatMessageDate(created_at);
        const showDateSeparator = prevMessageDate !== messageDate && created_at;

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
                            className={`${isPrivate === 1
                                ? `bg-[rgb(var(--color-primary-${theme}))] mx-auto rounded-lg`
                                : isSelf
                                    ? `${theme === 'light' 
                                        ? 'bg-[#d9fdd3]' 
                                        : 'bg-[#144d37]'} rounded-l-lg rounded-br-lg ml-auto`
                                    : `bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-r-lg rounded-bl-lg mr-auto`
                                } p-3 w-full max-w-full break-words whitespace-pre-wrap flex flex-col`}
                        >
                            {isPrivate === 1 && (
                                <div className="flex items-center justify-center mb-2 text-gray-300">
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Mensaje Privado</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <div className="flex-1 min-w-0">
                                    {media_path && media_path !== 'no' ? (
                                        media_type === 'url' ? (
                                            <a
                                                href={media_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline overflow-hidden text-ellipsis"
                                            >
                                                {media_path}
                                            </a>
                                        ) : media_type === 'image' ? (
                                            <div className="relative group">
                                                {body && <div className="mb-2">{body}</div>}
                                                <img
                                                    src={media_path}
                                                    alt="Preview"
                                                    className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => handleMediaPreview(media_path, media_type)}
                                                />
                                                {is_temp && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                                        <Loader size={20} className="animate-spin" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                                    <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.DOWNLOAD_HISTORY]}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(media_path);
                                                            }}
                                                            className="bg-teal-600 rounded-full p-1"
                                                        >
                                                            <Download size={16} color="white" />
                                                        </button>
                                                    </AbilityGuard>
                                                </div>
                                            </div>
                                        ) : media_type === 'audio' ? (
                                            <div className="flex items-center space-x-2">
                                                <audio
                                                    controls
                                                    src={media_path}
                                                    className="h-8"
                                                />
                                                {is_temp && <Loader size={16} className="animate-spin ml-2" />}
                                                {!is_temp && (
                                                    <button
                                                        onClick={() => handleDownload(media_path)}
                                                        className="text-white hover:text-gray-300"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {media_type === 'video' ? (
                                                        <PlayCircle size={20} />
                                                    ) : (
                                                        <File size={20} />
                                                    )}
                                                    <span className="truncate max-w-[calc(100%-60px)]">
                                                        {media_path.split('/').pop()}
                                                    </span>
                                                </div>
                                                {!is_temp && (
                                                    <div className="flex space-x-2 flex-shrink-0">
                                                        {media_type === 'video' && (
                                                            <button
                                                                onClick={() => handleMediaPreview(media_path, media_type)}
                                                                className="text-white hover:text-gray-300"
                                                            >
                                                                <Image size={20} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDownload(media_path)}
                                                            className="text-white hover:text-gray-300"
                                                        >
                                                            <Download size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <>{body}</>
                                    )}
                                </div>
                            </div>

                            <div className={`text-xs text-gray-400 mt-1 ${isSelf ? "text-right" : "text-left"}`}>
                                <div className="flex items-center gap-1 overflow-hidden">
                                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {messageTime}
                                    </span>
                                    {isSelf && (
                                        <span className="shrink-0">
                                            {renderAckStatus(message.ack)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

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

    const handleSendMessage = async () => {
        if ((messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) ||
            sendingMessage ||
            isChatClosed) {
            return;
        }
        // Crear mensaje temporal con ID único basado en contenido
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempSignature = `${messageText}-${selectedFiles.length}-${!!recordedAudio}`;

        try {
            setSendingMessage(true);
            setUploadProgress(0);
            const newMessage = {
                id: tempId,
                body: messageText,
                from_me: "true",
                created_at: new Date().toISOString(),
                ack: 0,
                is_temp: true,
                tempSignature: tempSignature,
             // Firma para identificar duplicados
            };

            // Agregar información multimedia si existe
            if (selectedFiles[0]) {
                newMessage.media_type = selectedFiles[0].type;
                newMessage.media_path = selectedFiles[0].previewUrl;
            } else if (recordedAudio) {
                newMessage.media_type = 'audio';
                newMessage.media_path = recordedAudio.url;
            }

            setChatMessages(prev => prev ? [...prev, newMessage] : [newMessage]);
            scrollToBottom();

            // Limpiar UI inmediatamente
            setMessageText("");
            const filesToSend = [...selectedFiles];
            const audioToSend = recordedAudio;
            setSelectedFiles([]);
            setRecordedAudio(null);

            // Preparar payload para el servidor
            const messagePayload = {
                number: selectedChatId.number || "",
                body: messageText,
                from_me: true,
                ...(selectedChatId.id && { chat_id: selectedChatId.id }),
                ...(selectedChatId.idContact && { contact_id: selectedChatId.idContact }),
                tempSignature: tempSignature // Incluir la firma en el payload al servidor
            };

            // Procesar archivos para enviar al servidor
            if (filesToSend.length > 0 || audioToSend) {
                const mediaItems = [];

                const fileToBase64 = (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result.split(',')[1]);
                        reader.onerror = error => reject(error);
                    });
                };

                // Procesar archivos seleccionados
                for (const fileObj of filesToSend) {
                    try {
                        const base64Data = await fileToBase64(fileObj.file);
                        mediaItems.push({
                            type: fileObj.type,
                            media: base64Data,
                            caption: messageText || '',
                            ...(fileObj.type === 'document' && { filename: fileObj.file.name })
                        });
                    } catch (error) {
                        console.error(`Error procesando archivo ${fileObj.file.name}:`, error);
                        continue;
                    }
                }

                // Procesar audio grabado
                if (audioToSend) {
                    try {
                        const audioBase64 = await fileToBase64(audioToSend.blob);
                        mediaItems.push({
                            type: 'audio',
                            media: audioBase64,
                            caption: messageText || '',
                            filename: 'audio_message.wav'
                        });
                    } catch (error) {
                        console.error("Error procesando audio grabado:", error);
                    }
                }

                if (mediaItems.length > 0) {
                    messagePayload.media = JSON.stringify(mediaItems);
                }
            }

            // Enviar al servidor con progreso
            const { call, abortController } = sendMessage(messagePayload, (progress) => {
                setUploadProgress(progress);
            });
            const response = await callEndpoint({ call, abortController });

            // Agregar console.log para ver la respuesta cuando no hay chatId
            if (!selectedChatId.id) {
                console.log('Respuesta del servidor al enviar mensaje sin chatId:', {
                    response,
                    messagePayload
                });
            }

            if (response) {
                // Actualizar mensaje temporal con datos del servidor
                setChatMessages(prev => {
                    if (!prev) return [];

                    return prev.map(msg => {
                        if (msg.id === tempId || msg.tempSignature === tempSignature) {
                            const updatedMsg = {
                                ...msg,
                                id: response.message_id || msg.id,
                                ack: response.ack || 1,
                                is_temp: false,
                                ...(response.media_url && {
                                    media_path: response.media_url
                                }),
                                // Eliminar la firma temporal ya que ahora es un mensaje real
                                tempSignature: undefined
                            };

                            // Liberar URL temporal si existía
                            if (msg.is_temp && msg.media_path) {
                                URL.revokeObjectURL(msg.media_path);
                            }

                            return updatedMsg;
                        }
                        return msg;
                    });
                });

                if (response.chat_id) {
                    setSelectedChatId(prev => ({
                        ...prev,
                        id: response.chat_id,
                        status: "OPEN"
                    }));
                    setIsNewChat(false);
                }
            }
        } catch (error) {
            console.error("Error al enviar:", error);

            // Marcar mensaje como fallido usando tanto el ID como la firma
            setChatMessages(prev => {
                if (!prev) return [];
                return prev.map(msg =>
                    (msg.id === tempId || msg.tempSignature === tempSignature)
                        ? { ...msg, ack: -1 }
                        : msg
                );
            });

            toast.error(error.response?.data?.message || "Error al enviar el mensaje");
        } finally {
            setSendingMessage(false);
            setUploadProgress(0);
        }
    };
    const handleUpdateChat = async (idChat, dataChat) => {
        try {
          const response = await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
          console.log("Chat actualizado ", response);
          return response;
        } catch (error) {
          console.error("Error actualizando chat ", error);
          throw error;
        }
    };
    
    const handleReopenChat = async () => {
        if (!selectedChatId?.id) return;
        
        try {
          setReopeningChat(true);
          const previousState = selectedChatId.status;
          const chatElement = document.querySelector(`[data-chat-id="${selectedChatId.id}"]`);
      
          // Actualizar estado en el servidor
          await handleUpdateChat(selectedChatId.id, { state: "OPEN" });
      
          // Aplicar animación si el elemento existe
          if (chatElement) {
            chatElement.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 300));
          }
      
          // Disparar evento de cambio de estado
          const event = new CustomEvent('chatStateChanged', {
            detail: {
              chatId: selectedChatId.id,
              newState: "OPEN",
              previousState: previousState,
              shouldRemove: true
            }
          });
          window.dispatchEvent(event);
      
          // Actualizar el estado local del chat
          setSelectedChatId(prev => ({
            ...prev,
            status: "OPEN"
          }));
      
          toast.success("Chat reabierto exitosamente");
        } catch (error) {
          console.error("Error al reabrir el chat:", error);
          toast.error("Error al reabrir el chat");
        } finally {
          setReopeningChat(false);
        }
    };

    if (shouldShowChat && isLoading) {
        return (
            <div className={`flex flex-col h-screen w-full 
                bg-[rgb(var(--color-bg-${theme}))] 
                text-[rgb(var(--color-text-primary-${theme}))] 
                justify-center items-center`}
            >
                <Loader size={40} className={`animate-spin text-[rgb(var(--color-primary-${theme}))]`} />
                <p className={`mt-4 text-[rgb(var(--color-text-secondary-${theme}))]`}>
                    Cargando chat...
                </p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen w-full
            bg-[rgb(var(--color-bg-${theme}))] 
            text-[rgb(var(--color-text-primary-${theme}))]
            ${isMobile ? 'pb-10' : ''}`}>
            {shouldShowChat ? (
                <>
                    {/* Chat Header */}
                    <div className={`flex p-2 border-b border-[rgb(var(--color-text-secondary-${theme}))] 
                        bg-[rgb(var(--color-bg-${theme}-secondary))] sticky mt-10 z-10 
                        justify-between items-center`}>
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
                            <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEARCH_MESSAGES]}>
                                <div className="relative group">
                                    <button
                                        className={`p-2 
                                            hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                            active:bg-[rgb(var(--color-primary-${theme}))] rounded-full
                                            text-[rgb(var(--color-text-secondary-${theme}))]
                                            hover:text-[rgb(var(--color-primary-${theme}))]`}
                                        onClick={() => setSearchInChat(prev => !prev)}
                                        disabled={isChatClosed}
                                        style={isChatClosed ? { opacity: 0.5 } : {}}
                                    >
                                        <Search size={20} />
                                    </button>
                                    <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                        bg-[rgb(var(--color-bg-${theme}-secondary))] px-2 py-1 rounded
                                        text-xs whitespace-nowrap opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200 z-50`}>
                                        Buscar en el chat
                                    </div>
                                </div>
                            </AbilityGuard>
                            <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.TRANSFER]}>
                                <div className="relative group">
                                    <button
                                        className={`p-2 
                                            hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                            active:bg-[rgb(var(--color-primary-${theme}))] rounded-full
                                            text-[rgb(var(--color-text-secondary-${theme}))]
                                            hover:text-[rgb(var(--color-primary-${theme}))]`}
                                        onClick={() => isChatClosed ? null : setTransferOpen(prev => !prev)}
                                        disabled={isChatClosed}
                                        style={isChatClosed ? { opacity: 0.5 } : {}}
                                    >
                                        <MessageSquareShare size={20} />
                                    </button>
                                    <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                        bg-[rgb(var(--color-bg-${theme}-secondary))] px-2 py-1 rounded
                                        text-xs whitespace-nowrap opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200 z-50`}>
                                        Transferir chat
                                    </div>
                                </div>
                            </AbilityGuard>
                            <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.TAG_CHAT, ABILITIES.CHAT_PANEL.MARK_AS_FINISHED]} requireAll={false}>
                                <button
                                    className={`p-2 
                                        hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                        active:bg-[rgb(var(--color-primary-${theme}))] rounded-full
                                        text-[rgb(var(--color-text-secondary-${theme}))]
                                        hover:text-[rgb(var(--color-primary-${theme}))] relative`}
                                    onClick={() => isChatClosed ? null : setMenuOpen(prev => !prev)}
                                    disabled={isChatClosed}
                                    style={isChatClosed ? { opacity: 0.5 } : {}}
                                >
                                    <SquarePlus size={20} />
                                </button>
                            </AbilityGuard>
                            {menuOpen && !isChatClosed && <MenuInchat isOpen={menuOpen} onClose={() => setMenuOpen(false)} />}
                        </div>
                    </div>

                    {/* Chat Transfer - Only show when chat is open */}
                    {transferOpen && !isChatClosed && <ChatTransfer isOpen={transferOpen} onClose={() => setTransferOpen(false)} />}
                    {tagClick && !isChatClosed && <ChatTag isOpen={tagClick} onClose={() => setTagClick(false)} />}
                    {resolveClick && !isChatClosed && <ChatResolved isOpen={resolveClick} onClose={() => setResolveClick(false)} />}

                    {/* Reopen chat button - Show only when chat is closed */}
                    {isChatClosed && (
                        <div className={`bg-[rgb(var(--color-bg-${theme}-secondary))] p-2 text-center`}>
                            <button
                                className={`bg-[rgb(var(--color-primary-${theme}))] 
                                    hover:bg-[rgb(var(--color-secondary-${theme}))] 
                                    px-4 py-2 rounded-lg flex items-center justify-center mx-auto
                                    text-[rgb(var(--color-text-primary-${theme}))]`}
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

                    {/* Messages Area */}
                    <div
                        ref={messagesContainerRef}
                        className={`flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide`}
                        style={{
                            backgroundImage: theme === 'dark' 
                                ? "url('https://i.pinimg.com/736x/cd/3d/62/cd3d628f57875af792c07d6ad262391c.jpg')"
                                : "url('https://i.pinimg.com/originals/2b/45/cf/2b45cfec4c0d3c56aed4ccd30b61bd3a.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat"
                        }}
                    >
                        {isNewChat && !hasMessages ? (
                            <div className="flex flex-col justify-center items-center h-full opacity-50">
                                <p>Nuevo chat con {selectedChatId.name || selectedChatId.number}</p>
                                <p className="text-sm mt-2">Escribe tu primer mensaje</p>
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
                                    <div key={index} className="relative">
                                        {file.type === 'image' ? (
                                            <img
                                                src={file.previewUrl}
                                                className="h-16 w-16 object-cover rounded"
                                                alt="Preview"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-gray-700 rounded flex items-center justify-center">
                                                {file.type === 'audio' ? (
                                                    <Volume2 size={24} />
                                                ) : file.type === 'video' ? (
                                                    <PlayCircle size={24} />
                                                ) : (
                                                    <File size={24} />
                                                )}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {recordedAudio && (
                                    <div className="relative">
                                        <div className="h-16 w-16 bg-gray-700 rounded flex items-center justify-center">
                                            <Volume2 size={24} />
                                        </div>
                                        <button
                                            onClick={removeAudio}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Media Preview */}
                    {mediaPreview && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
                            <div className="relative max-w-full max-h-full">
                                <button
                                    onClick={() => setMediaPreview(null)}
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
                                ) : mediaPreview.type === 'video' ? (
                                    <video controls className="max-w-full max-h-screen">
                                        <source src={mediaPreview.path} type="video/mp4" />
                                    </video>
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
                    )}

                    {/* Input Area - Disable when chat is closed */}
                    <div
                        className={`p-4 bg-[rgb(var(--color-bg-${theme}-secondary))] 
                            border-t border-[rgb(var(--color-text-secondary-${theme}))]
                            ${isChatClosed ? "opacity-60" : ""} 
                            ${isDragging ? "border-2 border-dashed border-[rgb(var(--color-primary-${theme}))]" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex items-center space-x-2">
                            <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEND_TEXT]}>
                                <textarea
                                    value={messageText}
                                    onChange={(e) => {
                                        setMessageText(e.target.value);
                                        // Ajuste automático de altura
                                        e.target.style.height = '40px'; // Altura inicial de una línea
                                        const scrollHeight = e.target.scrollHeight;
                                        const maxHeight = 120; // 5 líneas aproximadamente (24px por línea)
                                        e.target.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
                                    }}
                                    placeholder={isChatClosed ? "Chat cerrado" : "Escribe un mensaje..."}
                                    className={`flex-1 bg-[rgb(var(--color-bg-${theme}))] 
                                        text-[rgb(var(--color-text-primary-${theme}))]
                                        placeholder-[rgb(var(--color-text-secondary-${theme}))]
                                        rounded-lg p-3 resize-none outline-none
                                        hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                        focus:border-[rgb(var(--input-focus-border-${theme}))]
                                        scrollbar-hide h-[40px] min-h-[40px] max-h-[120px]
                                        leading-[20px]`}
                                    style={{
                                        overflow: messageText ? 'auto' : 'hidden'
                                    }}
                                    disabled={isChatClosed}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </AbilityGuard>
                            <div className="flex space-x-2">
                                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEND_MEDIA]}>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            multiple
                                            className="hidden"
                                            disabled={isChatClosed}
                                            key={selectedFiles.length}
                                        />
                                        <button
                                            className={`p-2 rounded-full
                                                bg-[rgb(var(--color-bg-${theme}-secondary))]
                                                hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                                active:bg-[rgb(var(--color-primary-${theme}))]
                                                text-[rgb(var(--color-text-secondary-${theme}))]
                                                hover:text-[rgb(var(--color-primary-${theme}))]`}
                                            onClick={handlePaperclipClick}
                                            disabled={isChatClosed}
                                        >
                                            <Paperclip size={20} />
                                            {selectedFiles.length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {selectedFiles.length}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </AbilityGuard>
                                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.SEND_MEDIA]}>
                                    <button
                                        className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : `bg-[rgb(var(--color-bg-${theme}-secondary))]`}
                                            hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                                            active:bg-[rgb(var(--color-primary-${theme}))]
                                            text-[rgb(var(--color-text-secondary-${theme}))]
                                            hover:text-[rgb(var(--color-primary-${theme}))]`}
                                        onClick={handleMicClick}
                                        disabled={isChatClosed}
                                    >
                                        <Mic size={20} />
                                    </button>
                                </AbilityGuard>
                                <button
                                    className={`p-2 rounded-full
                                        bg-[rgb(var(--color-primary-${theme}))]
                                        hover:bg-[rgb(var(--color-secondary-${theme}))]
                                        text-[rgb(var(--color-text-primary-${theme}))]
                                        disabled:opacity-50`}
                                    onClick={handleSendMessage}
                                    disabled={
                                        isChatClosed ||
                                        (messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) ||
                                        sendingMessage
                                    }
                                >
                                    {sendingMessage ? (
                                        <Loader size={20} className="animate-spin" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // Empty state when no chat is selected
                <div className={`flex flex-col items-center justify-center h-full 
                    text-[rgb(var(--color-text-secondary-${theme}))]`}>
                    <div className={`p-6 bg-[rgb(var(--color-bg-${theme}-secondary))] 
                        rounded-xl flex flex-col items-center`}>
                        <MessageSquareShare size={64} className={`mb-4 text-[rgb(var(--color-primary-${theme}))]`} />
                        <h3 className={`text-xl font-medium text-[rgb(var(--color-text-primary-${theme}))] mb-2`}>
                            Ningún chat seleccionado
                        </h3>
                        <p className="text-center mb-2">
                            Selecciona un chat de la lista o inicia una nueva conversación
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;