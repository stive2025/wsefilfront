import { useState, useEffect, useContext } from "react";
import { AgentFilter } from "@/contexts/chats.js";
import { getAgents } from "@/services/agents.js";
import { useFetchAndLoad } from "@/hooks/fechAndload.jsx";
import { useTheme } from "@/contexts/themeContext";
import { getUserLabelColors } from "@/utils/getUserLabelColors";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';

/**
 * Componente selector de agentes para filtrar chats
 * @param {Object} props - Props del componente
 * @param {string} props.role - Rol del usuario actual
 */
const AgentSelect = ({ role = "admin" }) => {
  const { theme } = useTheme();
  const { agentSelected, setAgentSelected } = useContext(AgentFilter);
  const { callEndpoint } = useFetchAndLoad();
  const [agents, setAgents] = useState([]);

  const loadAgents = async () => {
    try {
      const response = await callEndpoint(getAgents());
      if (response.data) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error("Error loading agents:", error);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleAgentChange = (e) => {
    const value = e.target.value;
    setAgentSelected(value === "" ? null : parseInt(value));
  };

  return (
    <AbilityGuard
      abilities={[ABILITIES.CHATS.FILTER_BY_AGENT]}
      fallback={
        <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-secondary-${theme}))] text-sm`}>
          No tienes permiso para filtrar por agente
        </div>
      }
    >
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <select
          value={agentSelected || ""}
          onChange={handleAgentChange}
          className={`w-full bg-[rgb(var(--color-bg-${theme}))] rounded-lg px-3 py-1 
            text-[rgb(var(--color-text-primary-${theme}))] text-sm
            border border-[rgb(var(--color-text-secondary-${theme}))]
            hover:border-[rgb(var(--input-hover-border-${theme}))]
            focus:border-[rgb(var(--input-focus-border-${theme}))]
            focus:ring-1 focus:ring-[rgb(var(--input-focus-border-${theme}))]
            outline-none`}
        >
          <option value="">Todos los agentes</option>
          {agents.map((agent) => {
            const colors = getUserLabelColors(agent.id);
            return (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            );
          })}
        </select>
      </div>
    </AbilityGuard>
  );
};

export default AgentSelect;
