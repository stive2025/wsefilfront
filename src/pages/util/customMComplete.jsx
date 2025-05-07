import Resize from "@/hooks/responsiveHook.jsx";
import CustomList from "@/components/utilities/customMList.jsx";
import CustomForm from "@/components/utilities/customForm.jsx";
import Tagmod from "@/components/mod/newUtilitieMod.jsx";
import { CustomCreateForm } from "@/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "@/contexts/themeContext";

const CustomComplete = () => {
    const {customClick, setCustomClick} = useContext(CustomCreateForm);
    const isMobile = Resize();
    const { theme } = useTheme();

    return isMobile ? (
        <div className={`h-screen w-full mx-auto p-4 
          bg-[rgb(var(--color-bg-${theme}))] 
          text-[rgb(var(--color-text-primary-${theme}))]`}
        >
            <CustomList />
            {customClick && (
                <Tagmod 
                    isOpen={customClick} 
                    onClose={() => setCustomClick(false)} 
                    option={2} 
                />
            )}
        </div>
    ) : (
        <div className={`h-screen w-full mx-auto pt-15 p-4
          bg-[rgb(var(--color-bg-${theme}))] 
          text-[rgb(var(--color-text-primary-${theme}))] 
          grid grid-cols-2 gap-4 overflow-y-auto`}
        >
            <CustomList />
            <CustomForm />
        </div>
    );
};

export default CustomComplete;