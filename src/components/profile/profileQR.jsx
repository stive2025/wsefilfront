import { useState, useEffect, useContext, useRef } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { QRCodeCanvas } from 'qrcode.react';
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { ProfileInfoPanel, ConnectionInfo, ConnectionQR } from "/src/contexts/chats.js";
import { getCodigoQR } from "/src/services/conections.js";

const ProfileQR = () => {
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
    <div className={`bg-gray-900 rounded-lg w-full space-y-4 h-max`}>
      {/* Header */}
      <div className="flex items-center rounded-lg">
        <h1 className="text-xl font-normal">
          {isConnected.sesion ? "Ya existe una conexión" : "Escanea el código QR"}
        </h1>
      </div>

      {/* Contenido: QR o información de conexión */}
      <div className="flex justify-center rounded-lg">
        {loading && !isConnected.sesion ? (
          <p className="text-gray-400">Cargando...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : isConnected.sesion ? (
          <div className="flex flex-col items-center text-center p-4 bg-gray-800 rounded-lg w-full max-w-xs">
            <div className="mb-3">
              <span className="text-gray-400 block mb-1">Nombre:</span>
              <p className="text-lg font-medium">{isConnected.name}</p>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Teléfono:</span>
              <p className="text-md font-mono">{formatPhoneNumber(isConnected.number)}</p>
            </div>
          </div>
        ) : codigoQR ? (
          <div className='border-6 border-white flex flex-col items-center'>
            <QRCodeCanvas value={codigoQR} size={isMobile ? 200 : 256} />
          </div>
        ) : (
          <p className="text-gray-400">No se pudo cargar el código QR</p>
        )}
      </div>
    </div>
  );
};

export default ProfileQR;