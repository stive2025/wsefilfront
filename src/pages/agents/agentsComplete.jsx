import Resize from "/src/hooks/responsiveHook.jsx";
import ListAgents from "/src/components/agents/listAgents.jsx";
import NewAgent from "/src/components/agents/newAgent.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { NewAgentForm } from "/src/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "/src/contexts/themeContext";

const AgentsComplete = () => {
  const { agentNew, setAgentNew } = useContext(NewAgentForm);
  const isMobile = Resize();
  const { theme } = useTheme();

  return isMobile ? (
    <div className={`h-screen w-full mx-auto p-4 
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))]`}
    >
      <ListAgents />
      {agentNew && (
        <Tagmod 
          isOpen={agentNew} 
          onClose={() => setAgentNew(false)} 
          option={5}
        />
      )}
    </div>
  ) : (
    <div className={`h-screen w-full mx-auto p-4 
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))] 
      grid grid-cols-2 gap-4 overflow-y-auto`}
    >
      <ListAgents />
      <NewAgent />
    </div>
  );
};

export default AgentsComplete;