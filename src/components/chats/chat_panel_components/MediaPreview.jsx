import React, { useState, useRef, useEffect } from "react";
import { X, Volume2, PlayCircle, PauseCircle, File } from "lucide-react";
import { useTheme } from "@/contexts/themeContext";
import clsx from "clsx";

const MediaPreview = ({ selectedFiles, recordedAudio, removeFile, removeRecordedAudio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const { theme } = useTheme();
  
  // Crear URL para el audio grabado cuando cambia
  useEffect(() => {
    if (recordedAudio) {
      // Si recordedAudio tiene una propiedad base64, es el formato que necesitamos
      if (recordedAudio.base64) {
        setAudioUrl(recordedAudio.base64);
      } 
      // Si tiene una propiedad blob, creamos una URL a partir de ella
      else if (recordedAudio.blob) {
        const url = URL.createObjectURL(recordedAudio.blob);
        setAudioUrl(url);
        
        // Limpiar la URL cuando el componente se desmonte
        return () => URL.revokeObjectURL(url);
      }
      // Si tiene una propiedad url, la usamos directamente
      else if (recordedAudio.url) {
        setAudioUrl(recordedAudio.url);
      }
    } else {
      setAudioUrl(null);
      setIsPlaying(false);
    }
  }, [recordedAudio]);
  
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error reproduciendo audio:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  // Manejar cuando el audio termina de reproducirse
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  if (selectedFiles.length === 0 && !recordedAudio) return null;
  return (
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
            {/* Audio element oculto para reproducción */}
            {audioUrl && (
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={handleAudioEnded} 
                className="hidden"
              />
            )}
            
            <div className={clsx(
              "h-16 w-40 rounded flex flex-col items-center justify-center p-1",
              theme === 'dark' ? "bg-gray-700" : "bg-gray-200"
            )}>
              <div className="flex items-center justify-center w-full">
                <button
                  onClick={handlePlayPause}
                  className={clsx(
                    "p-1 rounded-full",
                    isPlaying ? "text-red-500" : "text-green-500",
                    !audioUrl && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!audioUrl}
                  title={isPlaying ? "Pausar audio" : "Reproducir audio"}
                >
                  {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                </button>
                <div className="ml-1 flex flex-col">
                  <span className="text-xs font-medium">
                    {isPlaying ? "Reproduciendo..." : "Audio grabado"}
                  </span>
                  <span className="text-xs opacity-75">
                    Escuchar antes de enviar
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={removeRecordedAudio}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              title="Eliminar audio"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPreview;
