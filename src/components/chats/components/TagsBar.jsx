import { useRef, useContext } from "react";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { TagFilter } from "@/contexts/chats.js";
import { useTheme } from "@/contexts/themeContext";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';

/**
 * Componente de barra de tags para filtrar chats
 * @param {Object} props - Props del componente
 * @param {Array} props.tags - Lista de tags disponibles
 */
const TagsBar = ({ tags }) => {
  const { theme } = useTheme();
  const { tagSelected, setTagSelected } = useContext(TagFilter);
  const scrollContainerRef = useRef(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleTagClick = (tagId) => {
    setTagSelected(tagSelected === tagId ? null : tagId);
  };

  return (
    <AbilityGuard
      abilities={[ABILITIES.CHATS.FILTER_BY_TAG]}
      fallback={
        <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-secondary-${theme}))] text-sm`}>
          No tienes permiso para filtrar por tags
        </div>
      }
    >
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className={`text-[rgb(var(--color-text-secondary-${theme}))] 
              hover:text-[rgb(var(--color-primary-${theme}))] transition-colors`}
          >
            <ChevronLeftCircle size={20} />
          </button>
          
          <div
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => handleTagClick(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                tagSelected === null
                  ? `bg-[rgb(var(--color-primary-${theme}))] text-white`
                  : `bg-[rgb(var(--color-bg-${theme}))] text-[rgb(var(--color-text-primary-${theme}))] 
                     hover:bg-[rgb(var(--color-primary-${theme}))] hover:text-white`
              }`}
            >
              Todos
            </button>
            
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  tagSelected === tag.id
                    ? `bg-[rgb(var(--color-primary-${theme}))] text-white`
                    : `bg-[rgb(var(--color-bg-${theme}))] text-[rgb(var(--color-text-primary-${theme}))] 
                       hover:bg-[rgb(var(--color-primary-${theme}))] hover:text-white`
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={scrollRight}
            className={`text-[rgb(var(--color-text-secondary-${theme}))] 
              hover:text-[rgb(var(--color-primary-${theme}))] transition-colors`}
          >
            <ChevronRightCircle size={20} />
          </button>
        </div>
      </div>
    </AbilityGuard>
  );
};

export default TagsBar;
