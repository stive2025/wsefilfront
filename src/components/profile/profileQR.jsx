import { useState, useEffect, useContext, useRef } from 'react';
import Resize from "@/hooks/responsiveHook.jsx";
import { QRCodeCanvas } from 'qrcode.react';
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { ProfileInfoPanel, ConnectionInfo, ConnectionQR } from "@/contexts/chats.js";
import { getCodigoQR } from "@/services/conections.js";
import { useTheme } from "@/contexts/themeContext.jsx";

const ProfileQR = () => {
  const { theme } = useTheme();
  const isMobile = Resize();
  const { setCodigoQR, codigoQR } = useContext(ConnectionQR);
  const { isConnected, setIsConnected } = useContext(ConnectionInfo);
  const [error, setError] = useState(null);
  const { loading, callEndpoint } = useFetchAndLoad();
  const { profileInfoOpen } = useContext(ProfileInfoPanel);
  const intervalRef = useRef(null);

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

  const handleQR = async () => {
    try {
      const apiCall = getCodigoQR();
      const response = await callEndpoint(apiCall);
      
      if (response.data.status === "CONNECTED") {
        console.log("Sesión activa detectada:", response.data);
        setIsConnected({
          sesion: true,
          name: response.data.name || '',
          number: response.data.number || ''
        });
        
        // Clear interval when connection is detected
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        console.log("No hay sesión activa:", response.data);
        setIsConnected({
          sesion: false,
          name: '',
          number: ''
        });
        
        if (response.data.qr_code) {
          setCodigoQR(response.data.qr_code);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando código QR:", error);
        setError("No se pudo cargar el código QR");
      }
    }
  };

  useEffect(() => {
    // Clean up any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start polling if the profile panel is open and no active connection
    if (profileInfoOpen && !isConnected.sesion) {
      // Initial QR check
      handleQR();
      
      // Set up polling interval
      intervalRef.current = setInterval(() => {
        if (!isConnected.sesion) {
          handleQR();
        } else {
          // Stop polling if connection is established
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 17000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [profileInfoOpen, isConnected.sesion]);

  return (
    <div className={`
      w-full space-y-4 h-max rounded-lg
      ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
    `}>
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
  );
};

export default ProfileQR;