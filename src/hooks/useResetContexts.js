import { useContext } from 'react';
import * as ChatContexts from '../contexts/chats';

export const useResetContexts = () => {
  // Get all context values
  const chatInterface = useContext(ChatContexts.ChatInterfaceClick);
  const searchInChat = useContext(ChatContexts.SearchInChatClick);
  const newMessage = useContext(ChatContexts.NewMessage);
  const contactInfo = useContext(ChatContexts.ContactInfoClick);
  const contactHandle = useContext(ChatContexts.ContactHandle);
  const newContactForm = useContext(ChatContexts.NewContactForm);
  const updateContactForm = useContext(ChatContexts.UpdateContactForm);
  const newAgentForm = useContext(ChatContexts.NewAgentForm);
  const updateAgentForm = useContext(ChatContexts.UpdateAgentForm);
  const agentFind = useContext(ChatContexts.AgentFind);
  const agentHandle = useContext(ChatContexts.AgentHandle);
  const tagClick = useContext(ChatContexts.TagClick);
  const resolveClick = useContext(ChatContexts.ResolveClick);
  const tagsCreateForm = useContext(ChatContexts.TagsCreateForm);
  const updateTagForm = useContext(ChatContexts.UpdateTagForm);
  const tagHandle = useContext(ChatContexts.TagHandle);
  const customCreateForm = useContext(ChatContexts.CustomCreateForm);
  const updateCustomForm = useContext(ChatContexts.UpdateCustomForm);
  const customHandle = useContext(ChatContexts.CustomHandle);
  const autoCreateForm = useContext(ChatContexts.AutoCreateForm);
  const updateAutoForm = useContext(ChatContexts.UpdateAutoForm);
  const autoHandle = useContext(ChatContexts.AutoHandle);
  const profileInfoPanel = useContext(ChatContexts.ProfileInfoPanel);
  const connectionInfo = useContext(ChatContexts.ConnectionInfo);
  const connectionQR = useContext(ChatContexts.ConnectionQR);
  const stateFilter = useContext(ChatContexts.StateFilter);
  const tagFilter = useContext(ChatContexts.TagFilter);
  const agentFilter = useContext(ChatContexts.AgentFilter);
  const webSocketMessage = useContext(ChatContexts.WebSocketMessage);

  const resetAll = () => {
    // Chat Interface Contexts
    if (typeof chatInterface?.setSelectedChatId === 'function') {
      chatInterface.setSelectedChatId(null);
    }
    if (typeof searchInChat?.setSearchActive === 'function') {
      searchInChat.setSearchActive(false);
    }
    if (typeof newMessage?.setNewMessage === 'function') {
      newMessage.setNewMessage(false);
    }

    // Contact Contexts
    if (typeof contactInfo?.setContactInfo === 'function') {
      contactInfo.setContactInfo(false);
    }
    if (typeof contactHandle?.setContact === 'function') {
      contactHandle.setContact(null);
    }
    if (typeof newContactForm?.setShowForm === 'function') {
      newContactForm.setShowForm(false);
    }
    if (typeof updateContactForm?.setShowForm === 'function') {
      updateContactForm.setShowForm(false);
    }

    // Agent Contexts
    if (typeof newAgentForm?.setShowForm === 'function') {
      newAgentForm.setShowForm(false);
    }
    if (typeof updateAgentForm?.setShowForm === 'function') {
      updateAgentForm.setShowForm(false);
    }
    if (typeof agentFind?.setAgentFind === 'function') {
      agentFind.setAgentFind(false);
    }
    if (typeof agentHandle?.setAgent === 'function') {
      agentHandle.setAgent(null);
    }

    // Tag Contexts
    if (typeof tagClick?.setShowTags === 'function') {
      tagClick.setShowTags(false);
    }
    if (typeof resolveClick?.setShowResolve === 'function') {
      resolveClick.setShowResolve(false);
    }
    if (typeof tagsCreateForm?.setShowForm === 'function') {
      tagsCreateForm.setShowForm(false);
    }
    if (typeof updateTagForm?.setShowForm === 'function') {
      updateTagForm.setShowForm(false);
    }
    if (typeof tagHandle?.setTag === 'function') {
      tagHandle.setTag(null);
    }

    // Custom Message Contexts
    if (typeof customCreateForm?.setShowForm === 'function') {
      customCreateForm.setShowForm(false);
    }
    if (typeof updateCustomForm?.setShowForm === 'function') {
      updateCustomForm.setShowForm(false);
    }
    if (typeof customHandle?.setCustom === 'function') {
      customHandle.setCustom(null);
    }

    // Auto Message Contexts
    if (typeof autoCreateForm?.setShowForm === 'function') {
      autoCreateForm.setShowForm(false);
    }
    if (typeof updateAutoForm?.setShowForm === 'function') {
      updateAutoForm.setShowForm(false);
    }
    if (typeof autoHandle?.setAuto === 'function') {
      autoHandle.setAuto(null);
    }

    // Profile and Connection Contexts
    if (typeof profileInfoPanel?.setShowPanel === 'function') {
      profileInfoPanel.setShowPanel(false);
    }
    if (typeof connectionInfo?.setShowInfo === 'function') {
      connectionInfo.setShowInfo(false);
    }
    if (typeof connectionQR?.setShowQR === 'function') {
      connectionQR.setShowQR(false);
    }

    // Filter Contexts
    if (typeof stateFilter?.setState === 'function') {
      stateFilter.setState(0);
    }
    if (typeof tagFilter?.setTag === 'function') {
      tagFilter.setTag(0);
    }
    if (typeof agentFilter?.setAgent === 'function') {
      agentFilter.setAgent(0);
    }

    // WebSocket Context
    if (typeof webSocketMessage?.setMessage === 'function') {
      webSocketMessage.setMessage(null);
    }
  };

  return resetAll;
};