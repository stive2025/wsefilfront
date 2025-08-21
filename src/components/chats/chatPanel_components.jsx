import { useState, useRef, useEffect, useCallback } from "react";
import MediaPreview from "./chat_panel_components/MediaPreview";
import InputArea from "./chat_panel_components/InputArea";
import MessageList from "./chat_panel_components/MessageList";
import EmptyState from "./chat_panel_components/EmptyState";
import ModernAudioPlayer from "./chat_panel_components/ModernAudioPlayer";
import {
    Search, MessageSquareShare, SquarePlus, X, ArrowLeft, File,
    Download, EyeOff, Loader, Clock, Check, AlertTriangle,
    RefreshCcw,
} from "lucide-react";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';
import Resize from "@/hooks/responsiveHook.jsx";
import MenuInchat from "@/components/mod/menuInchat.jsx";
import ChatTransfer from "@/components/mod/chatTransfer.jsx";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { useMessagesPagination } from "@/hooks/useMessagesPagination.js";
import ChatTag from "@/components/mod/chatTag.jsx";
import ChatResolved from "@/components/mod/chatResolved.jsx";
import { TagClick, ResolveClick, SearchInChatClick, TempNewMessage, ChatInterfaceClick, WebSocketMessage } from "@/contexts/chats.js";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { updateChat } from "@/services/chats.js";
import { sendMessage, sendPrivateMessage } from "@/services/messages.js";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/themeContext";
import { GetCookieItem } from "@/utilities/cookies";
import { getUserLabelColors } from "@/utils/getUserLabelColors";


const ChatInterface = () => {
    // ... estados existentes ...
    const [recordingTime, setRecordingTime] = useState(0); // segundos transcurridos
    const recordingIntervalRef = useRef(null);
    const MAX_RECORDING_TIME = 60; // 1 minuto




    const isScrollingManually = useRef(false);
    const SERVER_URL = 'http://193.46.198.228:8085/back/public/';
    const isMobile = Resize();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const { tagClick, setTagClick } = useContext(TagClick);
    const { resolveClick, setResolveClick } = useContext(ResolveClick);
    const { setSearchInChat } = useContext(SearchInChatClick);
    const { tempIdChat, setTempIdChat } = useContext(TempNewMessage);
    const { selectedChatId, setSelectedChatId } = useContext(ChatInterfaceClick);
    const { callEndpoint } = useFetchAndLoad();
    const { messageData } = useContext(WebSocketMessage);
    const { theme } = useTheme();
    // File size limit in bytes (2MB = 2 * 1024 * 1024)
    const FILE_SIZE_LIMIT = 2 * 1024 * 1024;
    const [fileSizeError, setFileSizeError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPrivateMessage, setIsPrivateMessage] = useState(false);
    // Estados para gestionar mensajes y archivos
    const [messageText, setMessageText] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudio, setRecordedAudio] = useState(null);
    // Hook de paginación de mensajes
    const {
        messages: chatMessages,
        isLoading,
        isLoadingMore: loadingMoreMessages,
        hasMoreMessages,
        loadMoreMessages,
        addNewMessage,
        updateMessage,
        hasMessages
    } = useMessagesPagination(selectedChatId?.id);

    const [sendingMessage, setSendingMessage] = useState(false);
    const [isNewChat, setIsNewChat] = useState(false);
    const [reopeningChat, setReopeningChat] = useState(false);
    const [record_stream, setStream] = useState(null);  // Reemplaza mediaRecorderRef

    // Referencias
    const fileInputRef = useRef(null);
    const messageListRef = useRef(null);

    // Determinar si el chat está cerrado
    const isChatClosed = selectedChatId?.status === "CLOSED";
    const shouldShowChat = selectedChatId && (selectedChatId.id || selectedChatId.idContact || selectedChatId.number);
    const formatMessage = (text) => {
        if (!text) return '';

        return text
            // Reemplazar saltos de línea con <br>
            .split('\n')
            .map(line => {
                return line
                    // Negrita: *texto* -> <strong>texto</strong>
                    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                    // Cursiva: _texto_ -> <em>texto</em>
                    .replace(/_([^_]+)_/g, '<em>$1</em>')
                    // Tachado: ~texto~ -> <del>texto</del>
                    .replace(/~([^~]+)~/g, '<del>$1</del>')
                    // Monoespaciado: ```texto``` -> <code>texto</code>
                    .replace(/```([^`]+)```/g, '<code class="bg-gray-800 px-1 rounded">$1</code>');
            })
            .join('<br>');
    };

    const handleMicClick = async () => {
        if (isRecording) {
            if (record_stream) {
                record_stream.stop();
                setIsRecording(false);
            }
            // Limpiar barra y tiempo
            clearInterval(recordingIntervalRef.current);
            setRecordingTime(0);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);

                recorder.start();
                setStream(recorder);
                setIsRecording(true);
                setRecordingTime(0);

                // Iniciar intervalo para actualizar el tiempo
                recordingIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => {
                        if (prev + 1 >= MAX_RECORDING_TIME) {
                            // Detener grabación automáticamente
                            if (recorder.state === 'recording') {
                                recorder.stop();
                                setIsRecording(false);
                            }
                            clearInterval(recordingIntervalRef.current);
                            return MAX_RECORDING_TIME;
                        }
                        return prev + 1;
                    });
                }, 1000);

                const blobToBase64 = (blob) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                };

                recorder.addEventListener('dataavailable', async (e) => {
                    const base64 = await blobToBase64(e.data);
                    const audioUrl = URL.createObjectURL(e.data);
                    const fileName = `audio_${new Date().toISOString()}.${getExtension(recorder.mimeType)}`;

                    setRecordedAudio({
                        blob: e.data,
                        url: audioUrl,
                        name: fileName,
                        base64: base64
                    });
                    // Limpiar barra y tiempo
                    clearInterval(recordingIntervalRef.current);
                    setRecordingTime(0);
                });

            } catch (error) {
                console.error("Error accessing microphone:", error);
                alert("Couldn't access microphone. Please check permissions.");
                clearInterval(recordingIntervalRef.current);
                setRecordingTime(0);
            }
        }
    };

    // 1. Primero, asegurémonos que handleIsPrivate está funcionando correctamente
    const handleIsPrivate = () => {
        setIsPrivateMessage(prev => !prev);
        toast.success(`Mensaje ${!isPrivateMessage ? 'privado' : 'público'} activado`);
    }

    const getExtension = (mimeType) => {
        return mimeType.split("/")[1] || "webm";
    };

    const handleMediaError = (element, type) => {
        // Intentar cargar desde la URL del servidor si falló la carga local
        if (!element.src.includes(SERVER_URL) && element.src.includes('/')) {
            const filename = element.src.split('/').pop();
            const newUrl = `${SERVER_URL}/${filename}`;
            element.src = newUrl;
        } else {
            // Si ya estábamos usando la URL del servidor o falló también, mostrar error
            const container = element.parentElement;
            if (container) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-red-500 p-2 rounded bg-red-100 dark:bg-red-900 text-sm';
                errorDiv.textContent = `Error cargando ${type}`;

                // Reemplazar el elemento multimedia con el mensaje de error
                container.innerHTML = '';
                container.appendChild(errorDiv);
            }
        }
    };
    const scrollToBottom = useCallback(() => {
        if (messageListRef.current && messageListRef.current.scrollToBottom) {
            messageListRef.current.scrollToBottom();
        }
    }, []);

    // Manejar nuevo chat (cuando tiene idContact pero no id)
    useEffect(() => {
        if (selectedChatId?.idContact && !selectedChatId.id) {
            setIsNewChat(true);
            setSelectedChatId(prev => ({
                ...prev,
                status: "OPEN"
            }));
        } else {
            setIsNewChat(false);
        }
    }, [selectedChatId, setSelectedChatId]);

    // La paginación ahora se maneja en el hook useMessagesPagination y en MessageList


    // Referencia para rastrear el último mensaje y evitar scroll en paginación
    const lastMessageIdRef = useRef(null);

    // Auto-scroll solo cuando se agrega un mensaje realmente nuevo al final
    useEffect(() => {
        if (chatMessages && chatMessages.length > 0) {
            const lastMessage = chatMessages[chatMessages.length - 1];
            const lastMessageId = lastMessage?.id;

            // Solo hacer scroll si:
            // 1. Es un mensaje temporal (recién enviado)
            // 2. O es un mensaje nuevo que no habíamos visto antes (diferente ID)
            const isTemporaryMessage = lastMessage?.is_temp;
            const isNewMessageId = lastMessageId && lastMessageId !== lastMessageIdRef.current;

            if ((isTemporaryMessage || isNewMessageId) && !isScrollingManually.current) {
                scrollToBottom();
                // Solo actualizar la referencia si no es un mensaje temporal
                if (!isTemporaryMessage && lastMessageId) {
                    lastMessageIdRef.current = lastMessageId;
                }
            }
        }
    }, [chatMessages]);

    useEffect(() => {
        if (messageData) {
            // Obtener el ID del chat actualmente seleccionado
            const currentChatId = selectedChatId?.id;
            const isNewChatTemp = isNewChat && tempIdChat;

            // Validar si el mensaje pertenece al chat actual
            const messageMatchesChat =
                messageData.chat_id === currentChatId ||
                (isNewChatTemp && messageData.chat_id === tempIdChat);

            // Si el mensaje no pertenece al chat actual, ignorarlo
            if (!messageMatchesChat) {
                return;
            }

            // Primero, verificar si es una actualización de ACK
            const isAckUpdate = messageData.type === 'ack' ||
                (messageData.ack !== undefined && !messageData.body && !messageData.media_type);

            if (isAckUpdate) {
                // Buscar y actualizar mensaje por ID o temp_signature
                const messageId = messageData.id_message_wp || messageData.id;
                const tempSignature = messageData.temp_signature;

                let messageFound = false;

                // 1. Buscar por ID del mensaje
                if (messageId) {
                    const messageByIdExists = chatMessages.some(msg => msg.id === messageId);
                    if (messageByIdExists) {
                        updateMessage(messageId, { ack: messageData.ack });
                        messageFound = true;
                        console.log('ACK actualizado por ID:', messageId, 'ACK:', messageData.ack);
                    }
                }

                // 2. Si no se encontró por ID, buscar por tempSignature
                if (!messageFound && tempSignature) {
                    const messageByTempSig = chatMessages.find(msg => msg.tempSignature === tempSignature);
                    if (messageByTempSig) {
                        updateMessage(messageByTempSig.id, { ack: messageData.ack });
                        messageFound = true;
                        console.log('ACK actualizado por tempSignature:', tempSignature, 'ACK:', messageData.ack);
                    }
                }

                // 3. Si aún no se encontró, buscar por contenido del mensaje
                if (!messageFound && messageData.body) {
                    const normalizedFromMe = messageData.from_me === true || messageData.from_me === "true" || messageData.from_me === "yes";
                    const messageByContent = chatMessages.find(msg => 
                        msg.body === messageData.body && 
                        msg.from_me === normalizedFromMe &&
                        !msg.is_temp
                    );
                    if (messageByContent) {
                        updateMessage(messageByContent.id, { ack: messageData.ack });
                        messageFound = true;
                        console.log('ACK actualizado por contenido:', messageData.body, 'ACK:', messageData.ack);
                    }
                }

                if (!messageFound) {
                    console.log('No se encontró mensaje para actualizar ACK:', { messageId, tempSignature, ack: messageData.ack });
                }

                // Si es ack=3 (leído), actualizar todos los mensajes enviados no leídos
                if (messageData.ack === 3) {
                    chatMessages.forEach(msg => {
                        if (msg.from_me && msg.ack === 2) {
                            updateMessage(msg.id, { ack: 3 });
                        }
                    });
                }

                return;
            }

            // Continuar con el manejo normal de mensajes
            if (messageData.body || messageData.media_type) {
                // Normalizar el valor de from_me para consistencia
                const normalizedFromMe = messageData.from_me === true || messageData.from_me === "true" || messageData.from_me === "yes";

                // Buscar mensaje temporal para actualizar
                let tempMessage = null;
                
                // 1. Primero buscar por tempSignature si está disponible
                if (messageData.temp_signature) {
                    tempMessage = chatMessages.find(msg => 
                        msg.tempSignature === messageData.temp_signature
                    );
                    console.log('Búsqueda por tempSignature:', messageData.temp_signature, tempMessage ? 'ENCONTRADO' : 'NO ENCONTRADO');
                }
                
                // 2. Si no se encuentra por tempSignature, buscar por ID del mensaje
                if (!tempMessage && (messageData.id_message_wp || messageData.id)) {
                    const messageId = messageData.id_message_wp || messageData.id;
                    tempMessage = chatMessages.find(msg => 
                        msg.id === messageId && msg.is_temp
                    );
                    console.log('Búsqueda por ID temporal:', messageId, tempMessage ? 'ENCONTRADO' : 'NO ENCONTRADO');
                }
                
                // 3. Si aún no se encuentra, buscar por otros criterios (fallback)
                if (!tempMessage) {
                    tempMessage = chatMessages.find(msg =>
                        msg.is_temp &&
                        msg.body === messageData.body &&
                        msg.from_me === normalizedFromMe &&
                        (!msg.media_path || msg.media_path === messageData.media_url)
                    );
                    console.log('Búsqueda por criterios fallback:', tempMessage ? 'ENCONTRADO' : 'NO ENCONTRADO');
                }

                if (tempMessage) {
                    // Actualizar mensaje temporal
                    const newMessageId = messageData.id_message_wp || messageData.id;
                    console.log('Actualizando mensaje temporal:', {
                        tempId: tempMessage.id,
                        newId: newMessageId,
                        ack: messageData.ack || 1,
                        tempSignature: tempMessage.tempSignature
                    });
                    
                    updateMessage(tempMessage.id, {
                        id: newMessageId,
                        is_temp: false,
                        ack: messageData.ack || 1,
                        media_path: messageData.media_url ? `${SERVER_URL}/${messageData.media_url}` : tempMessage.media_path,
                        filename: messageData.filename
                    });
                } else {
                    // Agregar nuevo mensaje (evitar duplicados de mensajes propios)
                    const shouldAddMessage = !normalizedFromMe || isNewChat ||
                        !chatMessages.some(msg =>
                            msg.id === (messageData.id_message_wp || messageData.id) &&
                            msg.from_me === normalizedFromMe
                        );
                    if (shouldAddMessage) {
                        const normalizedMessage = {
                            id: messageData.id_message_wp || messageData.id,
                            body: messageData.body || '',
                            from_me: normalizedFromMe,
                            media_type: messageData.media_type || 'chat',
                            media_path: messageData.media_url ? `${SERVER_URL}/${messageData.media_url}` : '',
                            media_url: messageData.media_url ? `${SERVER_URL}/${messageData.media_url}` : '',
                            data: messageData.data || '',
                            filename: messageData.filename || '',
                            filetype: messageData.filetype || '',
                            fileformat: messageData.fileformat || '',
                            is_private: messageData.is_private || 0,
                            created_at: messageData.created_at || new Date().toISOString(),
                            ack: messageData.ack || 0,
                            is_temp: false
                        };
                        addNewMessage(normalizedMessage);
                    }
                }

                if (!isScrollingManually.current) {
                    setTimeout(scrollToBottom, 100);
                }

                // Actualizar contador de mensajes no leídos
                if (currentChatId &&
                    messageData.chat_id === currentChatId &&
                    !normalizedFromMe) {
                    handleUpdateChat(currentChatId, { unread_message: 0 });
                }
            }
        }
    }, [messageData, selectedChatId, tempIdChat, isNewChat]);

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
        // Solo sumar archivos seleccionados, NO el audio grabado
        let currentTotalSize = selectedFiles.reduce((total, file) => total + file.file.size, 0);
        // No sumar el tamaño de recordedAudio
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

    const removeRecordedAudio = () => {
        if (recordedAudio) {
            URL.revokeObjectURL(recordedAudio.url);
            setRecordedAudio(null);
        }
    };


    // Funciones para mensajes
    const renderMediaContent = (message) => {
        let mediaSource;
        if (message.media_path?.startsWith('blob:') && message.type === 'image') {
            mediaSource = message.media_path;
        } else if (message.filename && message.media_path?.startsWith("files/") || message.filename?.startsWith("files/")) {
            mediaSource = `${SERVER_URL}${message.filename}`;
        } else if (message.filename && message.mediaUrl?.startsWith("files/")) {
            mediaSource = `${SERVER_URL}${message.mediaUrl}`;
        } else if (message.media_path?.startsWith('http')) {
            mediaSource = message.media_path;
        } else if (message.media_path && message.from_me === "false") {
            mediaSource = `${SERVER_URL}${message.media_path}`;
        }

        switch (message.media_type) {
            case 'image':
                return (
                    <div className="relative group">
                        {message.body && <div
                            className="mb-2 break-words"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.body) }}
                        />}
                        <img
                            src={mediaSource}
                            alt={message.filename || "Image"}
                            className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleMediaPreview(mediaSource, message.media_type)}
                            onError={(e) => handleMediaError(e.target, 'imagen')}
                        />
                        {!message.is_temp && (
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.DOWNLOAD_HISTORY]}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload(mediaSource, message.filename);
                                        }}
                                        className="bg-teal-600 rounded-full p-1"
                                    >
                                        <Download size={16} color="white" />
                                    </button>
                                </AbilityGuard>
                            </div>
                        )}
                    </div>
                );

            case 'ptt':
            case 'audio':
                return (
                    <div className="flex flex-col space-y-2">
                        {message.body && <div
                            className="mb-2 break-words"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.body) }}
                        />}
                        <ModernAudioPlayer
                            src={mediaSource}
                            filename={message.filename}
                            onDownload={!message.is_temp ? handleDownload : null}
                            isFromMe={message.from_me === true || message.from_me === "true" || message.from_me === "yes"}
                            showDownload={!message.is_temp}
                        />
                    </div>
                );

            case 'video':
                return (
                    <div className="relative group">
                        {message.body && <div
                            className="mb-2 break-words"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.body) }}
                        />}
                        <video
                            controls
                            src={mediaSource}
                            className="max-w-full max-h-48 rounded-lg"
                            onError={(e) => handleMediaError(e.target, 'video')}
                        />
                        {!message.is_temp && (
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.DOWNLOAD_HISTORY]}>
                                    <button
                                        onClick={() => handleDownload(mediaSource, message.filename)}
                                        className="bg-teal-600 rounded-full p-1"
                                    >
                                        <Download size={16} color="white" />
                                    </button>
                                </AbilityGuard>
                            </div>
                        )}
                    </div>
                );

            case 'document':
                return (
                    <div className="flex flex-col space-y-2">
                        {message.body && <div
                            className="mb-2 break-words"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.body) }}
                        />}
                        <div className="flex items-center space-x-2">
                            <File size={20} />
                            <span className="truncate max-w-[200px]">{message.filename}</span>
                            {!message.is_temp && (
                                <AbilityGuard abilities={[ABILITIES.CHAT_PANEL.DOWNLOAD_HISTORY]}>
                                    <button
                                        onClick={() => handleDownload(mediaSource, message.filename)}
                                        className="text-white hover:text-gray-300"
                                    >
                                        <Download size={20} />
                                    </button>
                                </AbilityGuard>
                            )}
                        </div>
                    </div>
                );

            default:
                return message.body ? (
                    <>
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(message.body) }} />
                    </>
                ) : '';
        }
    };

    // Modificar la función que maneja la visualización del mensaje para incluir el estilo privado
    const renderMessageContent = (message, prevMessageDate) => {
        const { created_at, created_by } = message;
        const isSelf = message.from_me === true || message.from_me === "true" || message.from_me === "yes";
        const isPrivate = message.is_private === 1;
        const messageTime = formatMessageTime(created_at);
        const messageDate = formatMessageDate(created_at);
        const showDateSeparator = prevMessageDate !== messageDate && created_at;
        const { bg, text } = created_by ? getUserLabelColors(created_by) : { bg: '', text: '' };

        const getBackgroundColor = () => {
            if (isPrivate) {
                return isSelf ? '#2b95ef' : '#6f7375';
            }
            return theme === 'light'
                ? (isSelf ? '#d9fdd3' : `rgb(var(--color-bg-${theme}-secondary))`)
                : (isSelf ? '#144d37' : `rgb(var(--color-bg-${theme}-secondary))`);
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
                <div className={`flex ${isSelf ? "justify-end" : "justify-start"} w-full mb-2`}>
                    <div className={`flex ${isSelf ? "flex-row-reverse" : "flex-row"} items-start space-x-2 max-w-[60%] w-auto`}>
                        <div
                            className={`p-3 w-full max-w-full break-words whitespace-pre-wrap flex flex-col rounded-lg
                                ${isSelf ? 'rounded-l-lg rounded-br-lg ml-auto' : 'rounded-r-lg rounded-bl-lg mr-auto'}`}
                            style={{ backgroundColor: getBackgroundColor() }}
                        >
                            {/* Mostrar created_by para mensajes propios o mensajes privados */}
                            {(isSelf || isPrivate) && created_by && (
                                <div className={`${bg} ${text} text-xs rounded-full px-2 py-0.5 mb-1 w-fit`}>
                                    {created_by}
                                </div>
                            )}

                            {/* Indicador de mensaje privado */}
                            {isPrivate && (
                                <div className={`flex items-center ${isSelf ? "justify-end" : "justify-start"} mb-2 text-gray-300`}>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Mensaje Privado</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <div className="flex-1 min-w-0">
                                    {renderMediaContent(message)}
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
        if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
            return null;
        }

        let lastMessageDate = "";

        // Renderizamos los mensajes en orden directo (más antiguos arriba, más recientes abajo)
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

    const dataURLtoBlob = (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const handleDownload = (url, filename) => {
        // Si tenemos data (base64), crear y descargar blob
        if (url.startsWith('data:')) {
            const blob = dataURLtoBlob(url);
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } else {
            // Si es una URL normal, descargar directamente
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    // Modificar handleSendMessage para manejar correctamente mensajes privados
    const handleSendMessage = async () => {
        if ((messageText.trim() === "" && selectedFiles.length === 0 && !recordedAudio) ||
            sendingMessage ||
            isChatClosed) {
            return;
        }

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tempSignature = tempId;

        try {
            setSendingMessage(true);
            setUploadProgress(0);

            // Crear mensaje temporal con el atributo is_private
            const newMessage = {
                id: tempId,
                body: messageText,
                from_me: "true",
                created_at: new Date().toISOString(),
                ack: 0,
                is_temp: true,
                is_private: isPrivateMessage ? 1 : 0, // Asegurar que is_private se incluya
                tempSignature: tempSignature,
            };

            // Manejar archivos multimedia temporales
            if (selectedFiles[0]) {
                const file = selectedFiles[0];
                newMessage.media_type = file.type;
                newMessage.filename = file.file.name;
                newMessage.media_path = file.previewUrl;
            } else if (recordedAudio) {
                newMessage.media_type = 'audio';
                newMessage.filename = recordedAudio.name;
                newMessage.media_path = recordedAudio.url;
            }

            // Siempre agregamos el mensaje temporal (comportamiento optimista)
            addNewMessage(newMessage);
            scrollToBottom();

            // Limpiar UI
            setMessageText("");
            const userData = JSON.parse(GetCookieItem('userData'));
            const currentUser = userData ? userData.id : null;
            const filesToSend = [...selectedFiles];
            const audioToSend = recordedAudio;
            setSelectedFiles([]);
            setRecordedAudio(null);

            let messagePayload;

            if (isPrivateMessage) {
                messagePayload = {
                    id_message_wp: tempId,
                    body: messageText,
                    ack: 0,
                    from_me: true,
                    to: selectedChatId.number || "",           // destinatario
                    media_type: "chat",
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    is_private: 1,
                    state: "G_TEST",
                    user_id: currentUser.id,
                    chat_id: selectedChatId.id || tempIdChat
                };
            } else {
                messagePayload = {
                    number: selectedChatId.number || "",
                    body: messageText,
                    is_private: isPrivateMessage ? 1 : 0,
                    from_me: true,
                    ...(selectedChatId.id || tempIdChat ? { chat_id: selectedChatId.id || tempIdChat } : {}),
                    ...(selectedChatId.idContact && { contact_id: selectedChatId.idContact }),
                    tempSignature: tempSignature
                };
            }

            // Procesar archivos
            if (filesToSend.length > 0 || audioToSend) {
                const mediaItems = [];

                // Modifica la función fileToBase64 para incluir el encabezado correcto
                const fileToBase64 = (file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                            resolve(reader.result); // Enviamos el base64 completo con encabezado
                        };
                        reader.onerror = reject;
                    });
                };

                // Procesar archivos seleccionados
                for (const fileObj of filesToSend) {
                    const base64Data = await fileToBase64(fileObj.file);

                    mediaItems.push({
                        type: fileObj.type,
                        media_type: fileObj.file.type,
                        media: base64Data, // Ahora incluye el encabezado completo
                        caption: messageText || '',
                        filename: fileObj.file.name
                    });
                }

                // Procesar audio grabado
                if (audioToSend) {
                    console.log('Bandera Procesando audio:', {
                        type: 'audio',
                        mimeType: 'audio/webm',
                        fileName: audioToSend.name
                    });
                    // Log del base64 del audio (solo preview)
                    console.log('Base64 del audio (preview):\n', audioToSend.base64, '\n\n...');

                    mediaItems.push({
                        type: 'audio',
                        media_type: 'audio/webm',
                        media: audioToSend.base64, // El audio grabado ya debe incluir el encabezado
                        caption: messageText || '',
                        filename: audioToSend.name
                    });
                }

                if (mediaItems.length > 0) {
                    messagePayload.media = JSON.stringify(mediaItems);
                }
            }

            const { call, abortController } = isPrivateMessage
                ? sendPrivateMessage(messagePayload, progress => setUploadProgress(progress)) // ▶️
                : sendMessage(messagePayload, progress => setUploadProgress(progress));

            // 4. (sin cambios) dispara la petición y actualiza el mensaje temporal
            const response = await callEndpoint({ call, abortController });
            if (response) {
                // Actualizar mensaje temporal con datos del servidor
                const mediaData = response.media?.[0];
                const messageUpdates = {
                    id: response.message_id || tempId,
                    ack: response.ack || 1,
                    is_temp: false,
                    ...(mediaData?.filename && {
                        media_path: `${SERVER_URL}/${mediaData.filename}`,
                        filename: mediaData.filename
                    })
                };
                updateMessage(tempId, messageUpdates);
            }


            if (response.chat_id) {
                setTempIdChat(response.chat_id);
                setIsNewChat(false);
            }
        } catch (error) {
            // Actualizar el mensaje temporal para mostrar error
            updateMessage(tempId, { ack: -1 });

            toast.error(error.response?.data?.message || "Error al enviar el mensaje");
        } finally {
            setSendingMessage(false);
            setUploadProgress(0);
        }
    };

    const handleUpdateChat = async (idChat, dataChat) => {
        try {
            const response = await callEndpoint(updateChat(idChat, dataChat), `update_chat_${idChat}`);
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
                    chat_id: selectedChatId.id,
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
            setSendingMessage(false);
            setUploadProgress(0);
        }
    };

    // Eliminar el scrollToBottom del loadMessages y crear un nuevo useEffect para manejar el scroll
    useEffect(() => {
        // Solo hacer scroll automático cuando cambia el ID del chat (no todo el objeto)
        setIsPrivateMessage(false);
        // Resetear la referencia del último mensaje al cambiar de chat
        lastMessageIdRef.current = null;
        if (selectedChatId?.id) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [selectedChatId?.id, scrollToBottom]); // Solo depende del ID del chat

    // Primero, agregamos el manejador de eventos para el pegado
    const handlePaste = (e) => {
        const clipboardItems = e.clipboardData.items;
        const imageItems = Array.from(clipboardItems).filter(
            item => item.type.indexOf('image') !== -1
        );

        if (imageItems.length === 0) return;

        e.preventDefault();

        // Validar límite de archivos
        if (selectedFiles.length >= 5) {
            toast.error('Máximo 5 archivos permitidos');
            return;
        }

        imageItems.forEach(imageItem => {
            // Obtener el blob directamente sin crear un nuevo File
            const blob = imageItem.getAsFile();

            // Validar tamaño
            if (blob.size > FILE_SIZE_LIMIT) {
                toast.error('La imagen excede el límite de 2MB');
                return;
            }

            // Crear objeto de archivo para la interfaz
            const newFile = {
                file: blob, // Usar el blob directamente
                previewUrl: URL.createObjectURL(blob),
                type: 'image'
            };

            setSelectedFiles(prev => [...prev, newFile]);
            toast.success('Imagen agregada correctamente');
        });
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
                    <MessageList
                        ref={messageListRef}
                        isLoading={isLoading}
                        isNewChat={isNewChat}
                        hasMessages={hasMessages}
                        renderMessagesWithDateSeparators={renderMessagesWithDateSeparators}
                        selectedChatId={selectedChatId}
                        isLoadingMore={loadingMoreMessages}
                        hasMoreMessages={hasMoreMessages}
                        onLoadMore={loadMoreMessages}
                    />

                    {/* Preview de archivos y audio seleccionados */}
                    <MediaPreview
                        selectedFiles={selectedFiles}
                        recordedAudio={recordedAudio}
                        removeFile={removeFile}
                        removeRecordedAudio={removeRecordedAudio}
                    />

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
                        onPaste={handlePaste}
                    >
                        <InputArea
                            messageText={messageText}
                            setMessageText={setMessageText}
                            handleSendMessage={handleSendMessage}
                            handlePaperclipClick={handlePaperclipClick}
                            handleFileSelect={handleFileSelect}
                            fileInputRef={fileInputRef}
                            selectedFiles={selectedFiles}
                            isPrivateMessage={isPrivateMessage}
                            handleIsPrivate={handleIsPrivate}
                            isRecording={isRecording}
                            handleMicClick={handleMicClick}
                            isChatClosed={isChatClosed}
                            sendingMessage={sendingMessage}
                            recordingTime={recordingTime}
                            MAX_RECORDING_TIME={MAX_RECORDING_TIME}
                            recordedAudio={recordedAudio}
                        />
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
                <>
                    {/* Empty state when no chat is selected */}
                    <EmptyState />
                </>
            )}
        </div>
    );
};

export default ChatInterface;