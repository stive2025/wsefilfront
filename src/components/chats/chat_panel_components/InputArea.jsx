import React from "react";
import { Mic, Paperclip, Eye, EyeOff, Loader, Send } from "lucide-react";
import AudioRecorderBar from "./AudioRecorderBar";

const InputArea = ({
  messageText,
  setMessageText,
  handleSendMessage,
  handlePaperclipClick,
  handleFileSelect,
  fileInputRef,
  selectedFiles,
  isPrivateMessage,
  handleIsPrivate,
  isRecording,
  handleMicClick,
  isChatClosed,
  sendingMessage,
  recordingTime,
  MAX_RECORDING_TIME
}) => {
  return (
    <div className="flex items-center space-x-2">
      <textarea
        value={messageText}
        onChange={e => setMessageText(e.target.value)}
        placeholder={isChatClosed ? "Chat cerrado" : "Escribe un mensaje..."}
        className="flex-1 bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))] rounded-lg p-3 resize-none outline-none scrollbar-hide h-[40px] min-h-[40px] max-h-[120px] leading-[20px]"
        style={{ overflow: messageText ? 'auto' : 'hidden' }}
        disabled={isChatClosed}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
      />
      <div className="flex space-x-2 ">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            disabled={isChatClosed}
            key={selectedFiles.length}
          />
          <button
            className="p-2 rounded-full bg-[rgb(var(--color-bg-light-secondary))] hover:bg-[rgb(var(--input-hover-bg-light))] active:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]"
            onClick={handlePaperclipClick}
            disabled={isChatClosed}
          >
            <Paperclip size={20} />
            {selectedFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedFiles.length}
              </span>
            )}
          </button>
        </div>
        <button
          className={`p-2 rounded-full transition-colors duration-200 ${isPrivateMessage ? 'bg-[#2b95ef] text-white hover:bg-[#1a7fd9]' : 'bg-[rgb(var(--color-bg-light-secondary))] text-[rgb(var(--color-text-secondary-light))] hover:bg-[rgb(var(--input-hover-bg-light))]'}`}
          onClick={handleIsPrivate}
          disabled={isChatClosed}
        >
          {isPrivateMessage ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button
          className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-[rgb(var(--color-bg-light-secondary))]'} hover:bg-[rgb(var(--input-hover-bg-light))] active:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]`}
          onClick={handleMicClick}
          disabled={isChatClosed}
        >
          <Mic size={20} />
        </button>
        <button
          className="p-2 rounded-full bg-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--color-secondary-light))] text-[rgb(var(--color-text-primary-light))] disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={isChatClosed || (messageText.trim() === "" && selectedFiles.length === 0) || sendingMessage}
        >
          {sendingMessage ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
      <AudioRecorderBar isRecording={isRecording} recordingTime={recordingTime} MAX_RECORDING_TIME={MAX_RECORDING_TIME} />
    </div>
  );
};

export default InputArea;
