import Resize from "@/hooks/responsiveHook.jsx";
import AutoList from "@/components/utilities/autoMList.jsx";
import AutoForm from "@/components/utilities/autoMForm.jsx";
import Tagmod from "@/components/mod/newUtilitieMod.jsx";
import { AutoCreateForm } from "@/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "@/contexts/themeContext";

const AutoComplete = () => {
  const { autoClick, setAutoClick } = useContext(AutoCreateForm);
  const isMobile = Resize();
  const { theme } = useTheme();

  return isMobile ? (
    <div className={`h-screen w-full mx-auto p-4 
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))]`}
    >
      <AutoList />
      {autoClick && (
        <Tagmod 
          isOpen={autoClick} 
          onClose={() => setAutoClick(false)} 
          option={3}
        />
      )}
    </div>
  ) : (
    <div className={`h-screen w-full mx-auto pt-15 p-4
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))] 
      grid grid-cols-2 gap-4 overflow-y-auto`}
    >
      <AutoList />
      <AutoForm />
    </div>
  );
};

export default AutoComplete;