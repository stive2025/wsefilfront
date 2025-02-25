import ChatInterface from "/src/components/chats/chatPanel_components.jsx";
import ChatList from "/src/components/chats/chatList_component.jsx";
import Resize from "/src/hooks/responsiveHook.jsx";



const chatComplete = () => {
    const isMobile = Resize();
    return isMobile ? (
        <ChatList />
    ) : (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <ChatList />
            <ChatInterface />
        </div>
    );
};

export default chatComplete;