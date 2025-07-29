# Chat Components - Estructura Modularizada

Esta carpeta contiene los componentes de chat optimizados y modularizados para mejorar la mantenibilidad y reutilización del código.

## 📁 Estructura de Archivos

```
src/components/chats/
├── components/           # Componentes reutilizables
│   ├── ChatHeader.jsx   # Header de la lista de chats
│   ├── SearchInput.jsx  # Componente de búsqueda
│   ├── TagsBar.jsx      # Barra de filtros por tags
│   ├── AgentSelect.jsx  # Selector de agentes
│   └── ChatItems.jsx    # Lista de elementos de chat
├── hooks/               # Hooks personalizados
│   └── useChatList.js   # Hook para lógica de chats
├── utils/               # Utilidades y helpers
│   └── chatUtils.js     # Funciones utilitarias
├── ChatListOptimized.jsx # Componente principal optimizado
├── chatList_component.jsx # Componente original (legacy)
├── index.js             # Exportaciones
└── README.md            # Esta documentación
```

## 🚀 Componentes Principales

### ChatListOptimized
Componente principal que orquesta todos los demás componentes. Utiliza el hook `useChatList` para manejar la lógica de estado.

```jsx
import { ChatListOptimized } from '@/components/chats';

<ChatListOptimized role="admin" />
```

### Componentes Individuales

#### ChatHeader
Header con el logo del CRM.

#### SearchInput
Componente de búsqueda con debounce y validación de permisos.

#### TagsBar
Barra horizontal de tags con scroll y filtrado.

#### AgentSelect
Selector dropdown para filtrar por agente asignado.

#### ChatItems
Lista de chats con paginación, estados de lectura y avatares.

## 🎣 Hook Personalizado

### useChatList
Hook que encapsula toda la lógica de manejo de chats:

```jsx
const {
  chats,
  setChats,
  searchQuery,
  setSearchQuery,
  loading,
  hasMoreChats,
  tags,
  loadMoreChats,
} = useChatList({
  pageSize: 20,
  debounceDelay: 500
});
```

**Características:**
- ✅ Manejo de estado centralizado
- ✅ Búsqueda con debounce
- ✅ Paginación automática
- ✅ Filtros por estado, tag y agente
- ✅ Manejo de mensajes WebSocket
- ✅ Validación de permisos

## 🛠️ Utilidades

### chatUtils.js
Funciones utilitarias para el manejo de chats:

- `formatTimestamp()` - Formatea timestamps para mostrar
- `getMessagePreview()` - Genera vista previa de mensajes
- `isChatSelected()` - Determina si un chat está seleccionado
- `createChatFromMessage()` - Crea objeto de chat desde mensaje

## 🔄 Migración

### Desde el componente original:
```jsx
// Antes
import ChatList from '@/components/chats/chatList_component';

// Después
import { ChatListOptimized } from '@/components/chats';
```

### Ventajas de la nueva estructura:

1. **Modularidad**: Cada componente tiene una responsabilidad específica
2. **Reutilización**: Los componentes pueden usarse independientemente
3. **Mantenibilidad**: Código más fácil de mantener y debuggear
4. **Testing**: Cada componente puede testearse por separado
5. **Performance**: Mejor optimización y lazy loading
6. **Legibilidad**: Código más limpio y organizado

## 🎯 Funcionalidades

### Búsqueda y Filtros
- ✅ Búsqueda por nombre o teléfono con debounce
- ✅ Filtro por estado de chat (PENDING, OPEN, CLOSED)
- ✅ Filtro por tags
- ✅ Filtro por agente asignado

### Gestión de Chats
- ✅ Lista de chats con paginación
- ✅ Mensajes no leídos con contador
- ✅ Estados de ACK para mensajes enviados
- ✅ Avatares con fallback
- ✅ Timestamps formateados

### WebSocket
- ✅ Mensajes en tiempo real
- ✅ Actualización automática de chats
- ✅ Notificaciones de mensajes nuevos

### Permisos
- ✅ Validación de permisos por funcionalidad
- ✅ Fallbacks para usuarios sin permisos
- ✅ Integración con sistema de roles

## 🔧 Configuración

El hook `useChatList` acepta las siguientes opciones:

```jsx
const options = {
  pageSize: 20,        // Número de chats por página
  debounceDelay: 500   // Delay para búsqueda en ms
};
```

## 📱 Responsive Design

Los componentes están optimizados para:
- ✅ Desktop (layout con sidebar)
- ✅ Mobile (layout full-width)
- ✅ Tablet (adaptativo)

## 🚨 Notas Importantes

1. **Compatibilidad**: El componente original se mantiene para compatibilidad hacia atrás
2. **Permisos**: Todos los componentes validan permisos usando `useAuth`
3. **Temas**: Soporte completo para temas claro/oscuro
4. **Performance**: Optimizado con `useCallback` y `useMemo`

## 🔄 Próximas Mejoras

- [ ] Lazy loading de componentes
- [ ] Virtualización para listas grandes
- [ ] Cache de datos con React Query
- [ ] Tests unitarios completos
- [ ] Storybook para documentación visual
