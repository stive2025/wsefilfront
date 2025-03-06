import Resize from "/src/hooks/responsiveHook.jsx";
import TagList from "/src/components/utilities/tagsList.jsx";
import TagForm from "/src/components/utilities/tagForm.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { TagsCreateForm } from "/src/contexts/chats.js"
import { useContext } from "react";


const TagsComplete = () => {

    const isMobile = Resize();
    const { tagsClick,setTagsClick } = useContext(TagsCreateForm);
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <TagList />
            {tagsClick && <Tagmod isOpen={tagsClick} onClose={() => setTagsClick(false)} option={1}/>}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <TagList />
            <TagForm />
        </div>

    );
};

export default TagsComplete;