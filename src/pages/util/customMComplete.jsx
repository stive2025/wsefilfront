import Resize from "/src/hooks/responsiveHook.jsx";
import CustomList from "/src/components/utilities/customMList.jsx";
import CustomForm from "/src/components/utilities/customForm.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { CustomCreateForm } from "/src/contexts/chats.js"
import { useContext } from "react";


const CustomComplete = () => {
    const {customClick, setCustomClick} = useContext(CustomCreateForm);
    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <CustomList />
            {customClick && <Tagmod isOpen={customClick} onClose={() => setCustomClick(false)} option={2} />}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <CustomList />
            <CustomForm />
        </div>

    );
};

export default CustomComplete;