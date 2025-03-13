import { useState, useEffect } from 'react';
import Resize from "/src/hooks/responsiveHook.jsx";
import { QRCodeCanvas } from 'qrcode.react';

const ProfileQR = () => {
  const isMobile = Resize();
  const [codigoBackend, setCodigoBackend] = useState(null);

  /*useEffect(() => {
    // Simulando la llamada al backend para obtener el código numérico
    const fetchCodigo = async () => {
      try {
        const response = await fetch('TU_URL_DEL_BACKEND'); // Cambia esto por tu URL real
        const data = await response.json();
        setCodigoBackend(data.codigo); // Asegúrate de que tu backend envíe { codigo: "123456" }
      } catch (error) {
        console.error("Error al obtener el código del backend:", error);
      }
    };

    fetchCodigo();
  }, []);*/

  useEffect(() => {
    setCodigoBackend("1234"); 
  }, []);

  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-normal">Escanea el código QR</h1>
      </div>

      {/* Código QR */}
      <div className="flex justify-center p-4 bg-gray-800 rounded-lg">
        {codigoBackend ? (
          <QRCodeCanvas value={codigoBackend} size={isMobile ? 200 : 256} />
        ) : (
          <p className="text-gray-400">Cargando código QR...</p>
        )}
      </div>
    </div>
  );
};

export default ProfileQR;