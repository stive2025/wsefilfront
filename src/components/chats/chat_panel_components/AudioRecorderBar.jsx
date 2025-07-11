import React from "react";
import { formatTime } from "./utils";

const AudioRecorderBar = ({ isRecording, recordingTime, MAX_RECORDING_TIME }) => {
  if (!isRecording) return null;
  return (
    <div className="w-52 max-w-full flex flex-col items-center mt-2">
      <div className="flex justify-between text-xs w-full mb-1">
        <span className="font-mono text-teal-700">{formatTime(recordingTime)}</span>
        <span className="font-mono text-gray-400">/ {formatTime(MAX_RECORDING_TIME)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-teal-500 rounded transition-all"
          style={{ width: `${Math.min(100, (recordingTime / MAX_RECORDING_TIME) * 100)}%` }}
        />
      </div>
      {recordingTime === MAX_RECORDING_TIME && (
        <div className="text-xs text-red-600 mt-1 text-center">Tiempo máximo alcanzado</div>
      )}
    </div>
  );
};

export default AudioRecorderBar;
