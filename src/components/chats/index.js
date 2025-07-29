// Componente principal optimizado
export { default as ChatListOptimized } from './ChatListOptimized';

// Componentes individuales
export { default as ChatHeader } from './components/ChatHeader';
export { default as SearchInput } from './components/SearchInput';
export { default as TagsBar } from './components/TagsBar';
export { default as AgentSelect } from './components/AgentSelect';
export { default as ChatItems } from './components/ChatItems';

// Hook personalizado
export { useChatList } from './hooks/useChatList';

// Utilidades
export * from './utils/chatUtils';

// Componente original (para compatibilidad)
export { default as ChatList } from './chatList_component';
