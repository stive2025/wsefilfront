import Resize from "/src/hooks/responsiveHook.jsx";
import AutoList from "/src/components/utilities/autoMList.jsx";
import AutoForm from "/src/components/utilities/autoMForm.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { AutoCreateForm } from "/src/contexts/chats.js"
import { useContext } from "react";


const AutoComplete = () => {
  const {autoClick, setAutoClick} = useContext(AutoCreateForm);
    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <AutoList />
            {autoClick && <Tagmod isOpen={autoClick} onClose={() => setAutoClick(false)} option={3}/>}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <AutoList />
            <AutoForm />
        </div>

    );
};

export default AutoComplete;