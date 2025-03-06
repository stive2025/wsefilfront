import Resize from "/src/hooks/responsiveHook.jsx";
import TagList from "/src/components/utilities/tagsList.jsx";
import TagForm from "/src/components/utilities/tagForm.jsx";


const TagsComplete = () => {

    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <TagList />
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <TagList />
            <TagForm />
        </div>

    );
};

export default TagsComplete;