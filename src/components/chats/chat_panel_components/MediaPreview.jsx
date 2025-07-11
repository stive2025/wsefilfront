import React from "react";
import { X, Volume2, PlayCircle, File } from "lucide-react";

const MediaPreview = ({ selectedFiles, recordedAudio, removeFile, removeRecordedAudio }) => {
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
            <div className="h-16 w-16 bg-gray-700 rounded flex items-center justify-center">
              <Volume2 size={24} />
            </div>
            <button
              onClick={removeRecordedAudio}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
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
