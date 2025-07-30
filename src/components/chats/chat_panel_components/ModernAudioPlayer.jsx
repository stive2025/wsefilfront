import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/themeContext';
import { motion } from 'framer-motion';

const ModernAudioPlayer = ({ 
  src, 
  filename, 
  onDownload, 
  isFromMe = false, 
  showDownload = true 
}) => {
  const { theme } = useTheme();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Velocidades de reproducción disponibles
  const playbackRates = [1, 1.25, 1.5, 2];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    // Throttle para actualizaciones de tiempo más suaves
    let lastUpdateTime = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      // Actualizar máximo cada 100ms para suavidad
      if (now - lastUpdateTime >= 100) {
        setCurrentTime(audio.currentTime);
        lastUpdateTime = now;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [src]);

  const togglePlayPause = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setHasError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || hasError || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = Math.max(0, Math.min(percentage * duration, duration));
    
    // Actualizar inmediatamente para feedback visual instantáneo
    setCurrentTime(newTime);
    
    // Aplicar el cambio al audio
    try {
      audioRef.current.currentTime = newTime;
    } catch (error) {
      console.error('Error al buscar posición en audio:', error);
      // Revertir si hay error
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const changePlaybackRate = () => {
    const currentIndex = playbackRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    const newRate = playbackRates[nextIndex];
    
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className="flex items-center space-x-2 p-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 bg-opacity-20">
          <RotateCcw size={20} className="text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-red-500">Error al cargar el audio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-2 min-w-[280px]">
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />

      {/* Botón Play/Pause */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlayPause}
        disabled={isLoading || hasError}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isLoading 
            ? 'bg-gray-300 cursor-not-allowed' 
            : isFromMe
              ? `bg-[rgb(var(--color-primary-${theme}))] hover:bg-[rgb(var(--color-primary-${theme}))] hover:bg-opacity-80`
              : `bg-[rgb(var(--color-secondary-${theme}))] hover:bg-[rgb(var(--color-secondary-${theme}))] hover:bg-opacity-80`
        }`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause size={16} className="text-white" />
        ) : (
          <Play size={16} className="text-white ml-0.5" />
        )}
      </motion.button>

      {/* Barra de progreso y controles */}
      <div className="flex-1 space-y-1">
        {/* Barra de progreso */}
        <div 
          className="relative h-3 bg-gray-300 bg-opacity-30 rounded-full cursor-pointer overflow-hidden group"
          onClick={handleSeek}
        >
          {/* Barra de progreso rellena */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-75 ease-out ${
              isFromMe 
                ? `bg-[rgb(var(--color-primary-${theme}))]` 
                : `bg-[rgb(var(--color-secondary-${theme}))]`
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Indicador de posición (thumb) */}
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-75 ease-out shadow-md opacity-0 group-hover:opacity-100 ${
              isFromMe 
                ? `bg-[rgb(var(--color-primary-${theme}))]` 
                : `bg-[rgb(var(--color-secondary-${theme}))]`
            }`}
            style={{ 
              left: `calc(${progressPercentage}% - 6px)`,
              opacity: progressPercentage > 0 ? '1' : '0'
            }}
          />
          
          {/* Hover effect */}
          <div className="absolute inset-0 rounded-full bg-white bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Tiempo y controles */}
        <div className="flex items-center justify-between text-xs">
          <span className={`text-[rgb(var(--color-text-secondary-${theme}))]`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Control de velocidad */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={changePlaybackRate}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isFromMe
                  ? `bg-[rgb(var(--color-primary-${theme}))] bg-opacity-30 text-[rgb(var(--color-text-primary-${theme}))]`
                  : `bg-[rgb(var(--color-secondary-${theme}))] bg-opacity-30 text-[rgb(var(--color-text-primary-${theme}))]`
              }`}
              title="Cambiar velocidad de reproducción"
            >
              {playbackRate}x
            </motion.button>

            {/* Botón reset */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAudio}
              className={`p-1 rounded transition-colors ${
                currentTime > 0 
                  ? `text-[rgb(var(--color-text-secondary-${theme}))] hover:text-[rgb(var(--color-text-primary-${theme}))]`
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={currentTime === 0}
              title="Reiniciar audio"
            >
              <RotateCcw size={12} />
            </motion.button>

            {/* Botón de descarga */}
            {showDownload && onDownload && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDownload(src, filename)}
                className={`p-1 rounded transition-colors text-[rgb(var(--color-text-secondary-${theme}))] hover:text-[rgb(var(--color-text-primary-${theme}))]`}
                title="Descargar audio"
              >
                <Download size={12} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAudioPlayer;
