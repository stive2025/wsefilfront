import React from "react";
import { MessageSquareShare } from "lucide-react";
import { useTheme } from "@/contexts/themeContext";

const EmptyState = () => {
  const { theme } = useTheme();
  return (
    <div className={`flex flex-col items-center justify-center h-full text-[rgb(var(--color-text-secondary-${theme}))]`}>
      <div className={`p-6 bg-[rgb(var(--color-bg-${theme}-secondary))] rounded-xl flex flex-col items-center`}>
        <MessageSquareShare size={64} className={`mb-4 text-[rgb(var(--color-primary-${theme}))]`} />
        <h3 className={`text-xl font-medium text-[rgb(var(--color-text-primary-${theme}))] mb-2`}>
          Ningún chat seleccionado
        </h3>
        <p className="text-center mb-2">
          Selecciona un chat de la lista o inicia una nueva conversación
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
