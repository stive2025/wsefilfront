import { useState, useEffect, useContext, useRef } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { QRCodeCanvas } from 'qrcode.react';
import { useFetchAndLoad } from "/src/hooks/fechAndload.jsx";
import { ProfileInfoPanel } from "/src/contexts/chats.js";
import { getCodigoQR } from "/src/services/conections.js";

const ProfileQR = () => {
  const isMobile = Resize();
  const [codigoBackend, setCodigoBackend] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({ name: '', number: '' });
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
    if (isConnected) return; // No hacer llamada si ya hay conexión
    
    try {
      // Obtener el apiCall completo
      const apiCall = getCodigoQR();
      // Usar callEndpoint para realizar la llamada
      const response = await callEndpoint(apiCall);
      
      if (response.status === 200) {
        setIsConnected(true);
        setConnectionInfo({
          name: response.data.name,
          number: response.data.number
        });
        
        // Detener el intervalo si ya hay una conexión
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setIsConnected(false);
        setCodigoBackend(response.data.qr_code);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error buscando código QR:", error);
        setError("No se pudo cargar el código QR");
      }
    }
  };

  useEffect(() => {
    // Limpiar cualquier intervalo existente al iniciar o cambiar profileInfoOpen
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Solo iniciar el proceso si profileInfoOpen está activo y no hay conexión
    if (profileInfoOpen && !isConnected) {
      // Llamar inmediatamente cuando se abre
      handleQR();
      
      // Configurar intervalo solo si no hay conexión
      intervalRef.current = setInterval(() => {
        if (!isConnected) {
          handleQR();
        } else {
          // Detener intervalo si hay conexión
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 17000);
    }
    
    // Limpieza del intervalo cuando el componente se desmonta
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [profileInfoOpen, isConnected]);

  return (
    <div className={`bg-gray-900 rounded-lg w-full space-y-4 h-max`}>
      {/* Header */}
      <div className="flex items-center rounded-lg">
        <h1 className="text-xl font-normal">
          {isConnected ? "Ya existe una conexión" : "Escanea el código QR"}
        </h1>
      </div>

      {/* Contenido: QR o información de conexión */}
      <div className="flex justify-center rounded-lg">
        {loading && !isConnected ? (
          <p className="text-gray-400">Cargando...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : isConnected ? (
          <div className="flex flex-col items-center text-center p-4 bg-gray-800 rounded-lg w-full max-w-xs">
            <div className="mb-3">
              <span className="text-gray-400 block mb-1">Nombre:</span>
              <p className="text-lg font-medium">{connectionInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Teléfono:</span>
              <p className="text-md font-mono">{formatPhoneNumber(connectionInfo.number)}</p>
            </div>
          </div>
        ) : codigoBackend ? (
          <QRCodeCanvas value={codigoBackend} size={isMobile ? 200 : 256} />
        ) : (
          <p className="text-gray-400">No se pudo cargar el código QR</p>
        )}
      </div>
    </div>
  );
};

export default ProfileQR;