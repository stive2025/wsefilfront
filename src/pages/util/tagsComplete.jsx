import Resize from "/src/hooks/responsiveHook.jsx";
import TagList from "/src/components/utilities/tagsList.jsx";

const TagsComplete = () => {

    const isMobile = Resize();
    return isMobile ? (
        <TagList />
    ) : (
        <TagList />
    );
};

export default TagsComplete;