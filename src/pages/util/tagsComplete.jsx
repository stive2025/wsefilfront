import Resize from "/src/hooks/responsiveHook.jsx";
import TagList from "/src/components/utilities/tagsList.jsx";
import TagForm from "/src/components/utilities/tagForm.jsx";


const TagsComplete = () => {

    const isMobile = Resize();
    return isMobile ? (
        <div className="w-full mx-auto p-4 bg-gray-900 text-white h-screen">
            <TagList />
        </div>
    ) : (
        <div className="grid  grid-cols-2 gap-4 w-full mx-auto p-4 bg-gray-900 text-white h-screen">
            <TagList />
            <TagForm />
        </div>

    );
};

export default TagsComplete;