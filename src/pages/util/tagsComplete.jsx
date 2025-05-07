import Resize from "@/hooks/responsiveHook.jsx";
import TagList from "@/components/utilities/tagsList.jsx";
import TagForm from "@/components/utilities/tagForm.jsx";
import Tagmod from "@/components/mod/newUtilitieMod.jsx";
import { TagsCreateForm } from "@/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "@/contexts/themeContext";

const TagsComplete = () => {
    const isMobile = Resize();
    const { tagsClick, setTagsClick } = useContext(TagsCreateForm);
    const { theme } = useTheme();

    return isMobile ? (
        <div className={`h-screen w-full mx-auto p-4 
          bg-[rgb(var(--color-bg-${theme}))] 
          text-[rgb(var(--color-text-primary-${theme}))]`}
        >
            <TagList />
            {tagsClick && (
                <Tagmod 
                    isOpen={tagsClick} 
                    onClose={() => setTagsClick(false)} 
                    option={1}
                />
            )}
        </div>
    ) : (
        <div className={`h-screen w-full mx-auto pt-15 p-4
          bg-[rgb(var(--color-bg-${theme}))] 
          text-[rgb(var(--color-text-primary-${theme}))] 
          grid grid-cols-2 gap-4 overflow-y-auto`}
        >
            <TagList />
            <TagForm />
        </div>
    );
};

export default TagsComplete;