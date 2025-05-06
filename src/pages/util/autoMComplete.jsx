import Resize from "/src/hooks/responsiveHook.jsx";
import AutoList from "/src/components/utilities/autoMList.jsx";
import AutoForm from "/src/components/utilities/autoMForm.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { AutoCreateForm } from "/src/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "/src/contexts/themeContext";

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