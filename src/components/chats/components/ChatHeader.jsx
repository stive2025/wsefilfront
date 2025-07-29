import { useTheme } from "@/contexts/themeContext";

/**
 * Componente del header de la lista de chats
 */
const ChatHeader = () => {
  const { theme } = useTheme();

  return (
    <div className={`p-1 flex items-center justify-between bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
      <div className="flex items-center space-x-2">
        <img src="./images/logoCRM.png" alt="Logo" className="w-22 h-9" />
      </div>
    </div>
  );
};

export default ChatHeader;
