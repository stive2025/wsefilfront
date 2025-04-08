import Resize from "/src/hooks/responsiveHook.jsx";
import ListAgents from "/src/components/agents/ListAgents.jsx";
import NewAgent from "/src/components/agents/NewAgent.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { NewAgentForm } from "/src/contexts/chats.js"
import { useContext } from "react";


const AgentsComplete = () => {
  const {agentNew, setAgentNew} = useContext(NewAgentForm);
    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <ListAgents />
            {agentNew && <Tagmod isOpen={agentNew} onClose={() => setAgentNew(false)} option={5}/>}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <ListAgents />
            <NewAgent />
        </div>

    );
};

export default AgentsComplete;