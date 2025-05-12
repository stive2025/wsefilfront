import { useState, useEffect, useContext, useRef } from 'react';
import Resize from "@/hooks/responsiveHook.jsx";
import { QRCodeCanvas } from 'qrcode.react';
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { ProfileInfoPanel, ConnectionInfo, ConnectionQR, WebSocketMessage } from "@/contexts/chats.js";
import { getCodigoQR } from "@/services/conections.js";
import { useTheme } from "@/contexts/themeContext.jsx";
import { GetCookieItem } from "@/utilities/cookies.js";
import WebSocketHook from "@/hooks/websocketHook.jsx";

const ProfileQR = () => {
  const { theme } = useTheme();
  const isMobile = Resize();
  const { setCodigoQR, codigoQR } = useContext(ConnectionQR);
  const { isConnected, setIsConnected } = useContext(ConnectionInfo);
  const { messageData, setMessageData } = useContext(WebSocketMessage);
  const [error, setError] = useState(null);
  const { loading, callEndpoint } = useFetchAndLoad();
  const { profileInfoOpen } = useContext(ProfileInfoPanel);

  // Referencia para rastrear si ya procesamos un mensaje específico
  const processedMessageRef = useRef({});

  // Referencia para almacenar el último userId
  const userIdRef = useRef(null);

  // Función para formatear el número de teléfono exactamente como se requiere
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';

    // Eliminar cualquier carácter no numérico
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Si comienza con 593, formatear como +593 XX XXX XXXX
    if (cleaned.startsWith('593')) {
      return `+593 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }

    // Si no comienza con 593, devolver en formato genérico
    return `+${cleaned}`;
  };

  // Obtener el ID de usuario actual
  const getCurrentUserId = () => {
    try {
      const userDataString = GetCookieItem("userData");
      if (!userDataString) return null;

      const userData = JSON.parse(userDataString);
      return userData?.id;
    } catch (error) {
      console.error("Error al obtener el ID de usuario:", error);
      return null;
    }
  };

  const checkInitialConnection = async () => {
    try {
      const userId = getCurrentUserId();
      userIdRef.current = userId;

      if (!userId) {
        setError("No se encontró ID de usuario");
        return;
      }

      const apiCall = getCodigoQR();
      const response = await callEndpoint(apiCall);
      console.log("Response inicial:", response);

      if (response?.data?.user_id?.toString() === userId.toString()) {
        if (response.data.status === "CONNECTED") {
          setIsConnected({
            sesion: true,
            name: response.data.name || '',
            number: response.data.number || '',
            userId: userId
          });
        } else {
          setIsConnected({
            sesion: false,
            name: '',
            number: '',
            userId: userId
          });

          // Si no está conectado y hay un código QR, actualizarlo
          if (response.data.qr_code) {
            console.log("Estableciendo código QR inicial:", response.data.qr_code.substring(0, 20) + "...");
            setCodigoQR(response.data.qr_code);
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error verificando conexión:", error);
        setError("Error al verificar el estado de conexión");
      }
    }
  };

  // Efecto para manejar los mensajes del WebSocket
  useEffect(() => {
    if (!messageData) return;

    const messageId = messageData.id || messageData.id_message_wp || JSON.stringify(messageData);

    // Evitar procesar el mismo mensaje múltiples veces
    if (processedMessageRef.current[messageId]) {
      return;
    }

    console.log("🔍 ProfileQR: Procesando nuevo mensaje WebSocket:", messageData);

    const userId = getCurrentUserId();
    userIdRef.current = userId;

    if (!userId) {
      console.error("❌ No se pudo obtener el ID de usuario al procesar mensaje WebSocket");
      return;
    }

    if (messageData.user_id?.toString() === userId.toString()) {
      // Marcar este mensaje como procesado
      processedMessageRef.current[messageId] = true;

      console.log("👤 Mensaje WebSocket para este usuario. Status:", messageData.status || messageData.estatus);

      // Verificar tanto status como estatus (ambos formatos se usan en tu sistema)
      const status = messageData.status || messageData.estatus;

      if (status === "DISCONNECTED") {
        console.log("🔌 Usuario desconectado - Actualizando estado");
        setIsConnected({
          sesion: false,
          name: '',
          number: '',
          userId
        });

        if (messageData.qr_code) {
          console.log("🔄 Actualizando QR desde WebSocket:", messageData.qr_code.substring(0, 20) + "...");
          setCodigoQR(messageData.qr_code);

          // Forzar una actualización del estado para asegurar el re-renderizado
          setTimeout(() => {
            console.log("⏱️ Verificando estado del QR después de actualización");
            console.log("QR actual:", codigoQR ? "Presente" : "No disponible");
          }, 100);
        } else {
          console.warn("⚠️ Mensaje de desconexión sin código QR");
        }
      } else if (status === "CONNECTED") {
        console.log("🔌 Usuario conectado - Actualizando estado");
        setIsConnected({
          sesion: true,
          name: messageData.name || '',
          number: messageData.number || '',
          userId
        });
      }
    } else {
      console.log(`⚠️ Mensaje ignorado: usuario ${messageData.user_id} ≠ ${userId}`);
    }
  }, [messageData, setIsConnected, setCodigoQR, codigoQR]);

  // Efecto para la verificación inicial cuando se abre el panel
  useEffect(() => {
    if (profileInfoOpen) {
      console.log("Panel de perfil abierto, verificando conexión inicial");
      checkInitialConnection();
    }
  }, [profileInfoOpen]);

  // Debug efecto para monitorear cambios en codigoQR
  useEffect(() => {
    if (codigoQR) {
      console.log("Estado de codigoQR actualizado:", codigoQR.substring(0, 20) + "...");
    } else {
      console.log("Estado de codigoQR: null o vacío");
    }
  }, [codigoQR]);

  return (
    <WebSocketMessage.Provider value={{ messageData, setMessageData }}>

      <WebSocketHook />
      <div className={`w-full space-y-4 h-max rounded-lg
        ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}`}>
        {/* Header */}
        <div className="flex items-center rounded-lg">
          <h1 className={`
            text-xl font-normal
            ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
          `}>
            {isConnected.sesion ? "Ya existe una conexión" : "Escanea el código QR"}
          </h1>
        </div>

        {/* Contenido: QR o información de conexión */}
        <div className="flex justify-center rounded-lg">
          {loading && !isConnected.sesion ? (
            <p className={`
              ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
            `}>
              Cargando...
            </p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : isConnected.sesion ? (
            <div className={`
              flex flex-col items-center text-center p-4 rounded-lg w-full max-w-xs
              ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light-secondary))]' : 'bg-[rgb(var(--color-bg-dark-secondary))]'}
            `}>
              <div className="mb-3">
                <span className={`
                  block mb-1
                  ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                `}>
                  Nombre:
                </span>
                <p className={`
                  text-lg font-medium
                  ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                `}>
                  {isConnected.name}
                </p>
              </div>
              <div>
                <span className={`
                  block mb-1
                  ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
                `}>
                  Teléfono:
                </span>
                <p className={`
                  text-md font-mono
                  ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
                `}>
                  {formatPhoneNumber(isConnected.number)}
                </p>
              </div>
            </div>
          ) : codigoQR ? (
            <div className={`
              border-6 flex flex-col items-center
              ${theme === 'light' ? 'border-[rgb(var(--color-primary-light))]' : 'border-[rgb(var(--color-primary-dark))]'}
            `}>
              <QRCodeCanvas
                value={codigoQR}
                size={isMobile ? 200 : 256}
                bgColor={theme === 'light' ? '#F9F9F9' : '#2d3e3a'}
                fgColor={theme === 'light' ? '#1F1F1F' : '#FFFFFF'}
              />
            </div>
          ) : (
            <p className={`
              ${theme === 'light' ? 'text-[rgb(var(--color-text-secondary-light))]' : 'text-[rgb(var(--color-text-secondary-dark))]'}
            `}>
              No se pudo cargar el código QR
            </p>
          )}
        </div>
      </div>
    </WebSocketMessage.Provider>
  );
};

export default ProfileQR;