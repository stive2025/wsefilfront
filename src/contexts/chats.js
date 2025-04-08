import { createContext } from 'react';

// 📌 Contextos de interfaz del chat
export const ChatInterfaceClick = createContext(false);
export const SearchInChatClick = createContext(false);
export const NewMessage = createContext(false);

// 📌 Contextos relacionados con la información de contacto y agentes
export const ContactInfoClick = createContext(false);
export const ContactHandle = createContext(false);
export const NewContactForm = createContext(false);
export const UpdateContactForm = createContext(false);

export const NewAgentForm = createContext(false);
export const UpdateAgentForm = createContext(false);
export const AgentFind = createContext(false);
export const AgentHandle = createContext(false);

// 📌 Contextos relacionados con modales y menus dentro del chat
export const TagClick = createContext(false);
export const ResolveClick = createContext(false);

// 📌 Contextos relacionados con la creación de etiquetas
export const TagsCreateForm = createContext(false);
export const UpdateTagForm = createContext();
export const TagHandle = createContext();

// 📌 Contextos relacionados con la creación de mensajes personalizados
export const CustomCreateForm = createContext(false);
export const UpdateCustomForm = createContext();
export const CustomHandle = createContext();

// 📌 Contextos relacionados con la creación de mensajes automatizados
export const AutoCreateForm = createContext(false);
export const UpdateAutoForm = createContext();
export const AutoHandle = createContext();

// 📌 Contexto de Informacion dentro del chat
export const ProfileInfoPanel = createContext(false);

// 📌 Contexto de Informacion de Conexión
export const ConnectionInfo = createContext(false);
export const ConnectionQR = createContext(false);