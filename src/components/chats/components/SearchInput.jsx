import { Search } from "lucide-react";
import { useTheme } from "@/contexts/themeContext";
import { ABILITIES } from '@/constants/abilities';
import AbilityGuard from '@/components/common/AbilityGuard';

/**
 * Componente de búsqueda para la lista de chats
 * @param {Object} props - Props del componente
 * @param {string} props.searchQuery - Término de búsqueda actual
 * @param {Function} props.setSearchQuery - Función para actualizar el término de búsqueda
 */
const SearchInput = ({ searchQuery, setSearchQuery }) => {
  const { theme } = useTheme();

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <AbilityGuard
      abilities={[ABILITIES.CHATS.SEARCH]}
      fallback={
        <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))] 
          text-[rgb(var(--color-text-secondary-${theme}))] text-sm`}>
          No tienes permiso para buscar chats
        </div>
      }
    >
      <div className={`p-2 bg-[rgb(var(--color-bg-${theme}-secondary))]`}>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-[rgb(var(--color-bg-${theme}))] rounded-lg pl-8 pr-8 py-1 
              text-[rgb(var(--color-text-primary-${theme}))] 
              placeholder-[rgb(var(--color-text-secondary-${theme}))]
              hover:border-[rgb(var(--input-hover-border-${theme}))]
              focus:border-[rgb(var(--input-focus-border-${theme}))]
              focus:ring-1 focus:ring-[rgb(var(--input-focus-border-${theme}))]
              outline-none`}
          />
          <Search
            className={`absolute left-1 text-[rgb(var(--color-text-secondary-${theme}))]`}
            size={18}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className={`absolute right-2 p-1 rounded-full
                text-[rgb(var(--color-text-secondary-${theme}))]
                hover:bg-[rgb(var(--input-hover-bg-${theme}))]
                hover:text-[rgb(var(--color-primary-${theme}))]
                transition-colors duration-200`}
              title="Limpiar búsqueda"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          )}
        </div>
      </div>
    </AbilityGuard>
  );
};

export default SearchInput;
