// src/constants/abilities.js

export const ABILITIES = {
    // LISTADO DE CHATS
    CHATS: {
      VIEW: "chats.view",                    // Ver listado de chats
      SEARCH: "chats.search",                // Buscar chats/contactos
      FILTER_BY_AGENT: "chats.filter.agent", // Filtrar por agente
      FILTER_BY_STATUS: "chats.filter.status", // Filtrar por estado (pendiente/proceso/resuelto)
      FILTER_BY_TAG: "chats.filter.tag"      // Filtrar por etiquetas
    },
    
    // PANEL DE CHAT
    CHAT_PANEL: {
      VIEW: "chat.view",                      // Ver panel de chat
      SEND_TEXT: "chat.send.text",            // Enviar mensajes de texto
      SEND_MEDIA: "chat.send.media",          // Enviar imágenes/audios
      SEARCH_MESSAGES: "chat.search",         // Buscar mensajes por fecha/palabras
      DOWNLOAD_HISTORY: "chat.download",      // Descargar historial
      TRANSFER: "chat.transfer",              // Transferir chat
      VIEW_CONTACT_INFO: "chat.contact.view", // Ver info del contacto
      TAG_CHAT: "chat.tag",                   // Etiquetar chat
      MARK_AS_FINISHED: "chat.mark.finished"  // Marcar chat como finalizado
    },
    
    // UTILITIES (Etiquetas, mensajes personalizados, automáticos)
    UTILITIES: {
      VIEW: "utilities.view",                 // Ver utilidades
      CREATE: "utilities.create",             // Crear utilidades
      EDIT: "utilities.edit",                 // Editar utilidades
      DELETE: "utilities.delete",             // Eliminar utilidades
      SEARCH: "utilities.search"              // Buscar utilidades
    },
    
    // CONTACTOS
    CONTACTS: {
      VIEW: "contacts.view",                  // Ver contactos
      CREATE: "contacts.create",              // Crear contactos
      EDIT: "contacts.edit",                  // Editar contactos
      DELETE: "contacts.delete",              // Eliminar contactos
      SEARCH: "contacts.search"               // Buscar contactos
    },
    
    // AGENTES
    AGENTS: {
      VIEW: "agents.view",                    // Ver agentes
      CREATE: "agents.create",                // Crear agentes
      EDIT: "agents.edit",                    // Editar agentes
      DELETE: "agents.delete",                // Eliminar agentes
      SEARCH: "agents.search"                 // Buscar agentes
    },
    
    // PERFIL
    PROFILE: {
      VIEW: "profile.view",                   // Ver perfil
      SCAN_QR: "profile.scan_qr",             // Escanear QR WhatsApp
      CHANGE_PASSWORD: "profile.change_password" // Cambiar contraseña
    }
  };
  
  // Roles predefinidos con sus respectivas abilities
  export const ROLES = {
    ADMIN: 'ADMIN',
    SUPERVISOR: 'SUPERVISOR',
    AGENT: 'AGENT',
    READONLY: 'READONLY'
  };
  
  // Abilities predeterminadas por rol (solo informativo)
  export const ROLE_DEFAULT_ABILITIES = {
    [ROLES.ADMIN]: Object.values(ABILITIES).flatMap(section => 
      Object.values(section)
    ),
    
    [ROLES.SUPERVISOR]: [
      // Acceso a chats y operaciones
      ...Object.values(ABILITIES.CHATS),  // Esto ya incluye FILTER_BY_AGENT
      ...Object.values(ABILITIES.CHAT_PANEL),
      
      // Gestión de utilidades
      ABILITIES.UTILITIES.VIEW,
      ABILITIES.UTILITIES.SEARCH,
      
      // Gestión de contactos
      ...Object.values(ABILITIES.CONTACTS),
      
      // Ver agentes
      ABILITIES.AGENTS.VIEW,
      ABILITIES.AGENTS.SEARCH,
      
      // Perfil propio
      ...Object.values(ABILITIES.PROFILE)
    ],
    
    [ROLES.AGENT]: [
      // Acceso a chats
      ABILITIES.CHATS.VIEW,
      ABILITIES.CHATS.SEARCH,
      ABILITIES.CHATS.FILTER_BY_AGENT, // Agregar este permiso
      ABILITIES.CHATS.FILTER_BY_STATUS,
      ABILITIES.CHATS.FILTER_BY_TAG,
      
      // Operaciones básicas de chat
      ABILITIES.CHAT_PANEL.VIEW,
      ABILITIES.CHAT_PANEL.SEND_TEXT,
      ABILITIES.CHAT_PANEL.SEND_MEDIA,
      ABILITIES.CHAT_PANEL.SEARCH_MESSAGES,
      ABILITIES.CHAT_PANEL.VIEW_CONTACT_INFO,
      ABILITIES.CHAT_PANEL.TAG_CHAT,
      ABILITIES.CHAT_PANEL.MARK_AS_FINISHED,
      
      // Ver utilidades
      ABILITIES.UTILITIES.VIEW,
      ABILITIES.UTILITIES.SEARCH,
      
      // Ver contactos
      ABILITIES.CONTACTS.VIEW,
      ABILITIES.CONTACTS.SEARCH,
      
      // Perfil propio
      ABILITIES.PROFILE.VIEW,
      ABILITIES.PROFILE.SCAN_QR,
      ABILITIES.PROFILE.CHANGE_PASSWORD
    ],
    
    [ROLES.READONLY]: [
      // Solo visualización
      ABILITIES.CHATS.VIEW,
      ABILITIES.CHATS.SEARCH,
      ABILITIES.CHATS.FILTER_BY_AGENT,
      ABILITIES.CHATS.FILTER_BY_STATUS,
      ABILITIES.CHATS.FILTER_BY_TAG,
      
      ABILITIES.CHAT_PANEL.VIEW,
      ABILITIES.CHAT_PANEL.SEARCH_MESSAGES,
      ABILITIES.CHAT_PANEL.VIEW_CONTACT_INFO,
      
      ABILITIES.CONTACTS.VIEW,
      ABILITIES.CONTACTS.SEARCH,
      
      ABILITIES.UTILITIES.VIEW,
      ABILITIES.UTILITIES.SEARCH,
      
      ABILITIES.AGENTS.VIEW,
      ABILITIES.AGENTS.SEARCH,
      
      ABILITIES.PROFILE.VIEW
    ]
  };
