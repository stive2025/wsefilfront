import React, { useRef, useEffect } from "react";
import { Mic, Paperclip, Eye, EyeOff, Loader, Send } from "lucide-react";
import AudioRecorderBar from "./AudioRecorderBar";
import { useTheme } from "@/contexts/themeContext";
import clsx from "clsx";

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
  MAX_RECORDING_TIME,
  recordedAudio
}) => {
  const { theme } = useTheme();
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to expand the textarea
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [messageText]);

  return (
    <div className="flex items-center space-x-2">
      <textarea
        ref={textareaRef}
        value={messageText}
        onChange={e => setMessageText(e.target.value)}
        placeholder={isChatClosed ? "Chat cerrado" : "Escribe un mensaje..."}
        className={clsx(
          "flex-1 rounded-lg p-3 resize-none outline-none overflow-y-auto min-h-[40px] max-h-[200px] leading-[20px]",
          theme === 'dark'
            ? "bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-primary-dark))] placeholder-[rgb(var(--color-text-secondary-dark))] hover:bg-[rgb(var(--input-hover-bg-dark))] focus:border-[rgb(var(--input-focus-border-dark))]"
            : "bg-[rgb(var(--color-bg-light))] text-[rgb(var(--color-text-primary-light))] placeholder-[rgb(var(--color-text-secondary-light))] hover:bg-[rgb(var(--input-hover-bg-light))] focus:border-[rgb(var(--input-focus-border-light))]"
        )}
        style={{
          height: 'auto',
          minHeight: '40px',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
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
            className={clsx(
              "p-2 rounded-full",
              theme === 'dark'
                ? "bg-[rgb(var(--color-bg-dark-secondary))] hover:bg-[rgb(var(--input-hover-bg-dark))] active:bg-[rgb(var(--color-primary-dark))] text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]"
                : "bg-[rgb(var(--color-bg-light-secondary))] hover:bg-[rgb(var(--input-hover-bg-light))] active:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]"
            )}
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
          className={clsx(
            "p-2 rounded-full transition-colors duration-200",
            isPrivateMessage
              ? "bg-[#2b95ef] text-white hover:bg-[#1a7fd9]"
              : theme === 'dark'
                ? "bg-[rgb(var(--color-bg-dark-secondary))] text-[rgb(var(--color-text-secondary-dark))] hover:bg-[rgb(var(--input-hover-bg-dark))]"
                : "bg-[rgb(var(--color-bg-light-secondary))] text-[rgb(var(--color-text-secondary-light))] hover:bg-[rgb(var(--input-hover-bg-light))]"
          )}
          onClick={handleIsPrivate}
          disabled={isChatClosed}
        >
          {isPrivateMessage ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button
          className={clsx(
            "p-2 rounded-full",
            isRecording
              ? "bg-red-500"
              : theme === 'dark'
                ? "bg-[rgb(var(--color-bg-dark-secondary))]"
                : "bg-[rgb(var(--color-bg-light-secondary))]",
            theme === 'dark'
              ? "hover:bg-[rgb(var(--input-hover-bg-dark))] active:bg-[rgb(var(--color-primary-dark))] text-[rgb(var(--color-text-secondary-dark))] hover:text-[rgb(var(--color-primary-dark))]"
              : "hover:bg-[rgb(var(--input-hover-bg-light))] active:bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-text-secondary-light))] hover:text-[rgb(var(--color-primary-light))]",
            (isChatClosed || recordedAudio) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleMicClick}
          disabled={isChatClosed || recordedAudio}
          title={recordedAudio ? "Ya existe un audio grabado" : "Grabar audio"}
        >
          <Mic size={20} />
        </button>
        <button
          className={clsx(
            "p-2 rounded-full",
            theme === 'dark'
              ? "bg-[rgb(var(--color-primary-dark))] hover:bg-[rgb(var(--color-secondary-dark))] text-[rgb(var(--color-text-primary-dark))]"
              : "bg-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--color-secondary-light))] text-[rgb(var(--color-text-primary-light))]",
            (isChatClosed || isRecording || (messageText.trim() === "" && selectedFiles.length === 0 && (!recordedAudio || recordedAudio === null)) || sendingMessage) && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSendMessage}
          disabled={
            isChatClosed ||
            isRecording ||
            (
              messageText.trim() === "" &&
              selectedFiles.length === 0 &&
              (!recordedAudio || recordedAudio === null)
            ) ||
            sendingMessage
          }
        >
          {sendingMessage ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
      <AudioRecorderBar isRecording={isRecording} recordingTime={recordingTime} MAX_RECORDING_TIME={MAX_RECORDING_TIME} />
    </div>
  );
};

export default InputArea;
