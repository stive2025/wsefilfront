import NavSlideBar from "@/components/ui/navslidebar.jsx";
import NavUtilities from "@/components/ui/navUtilities.jsx";
import { Outlet } from "react-router-dom";



const utilitiesLayout = () => {
  const userRole = "admin"; // Puedes obtenerlo de un contexto o API

  return (
    <div className="flex flex-col">
      <NavSlideBar role={userRole}/>
      <NavUtilities/>
      <main className="w-full flex flex-col">
        {/* Outlet renderiza la ruta hija*/}
        <Outlet />
      </main> 
    </div>

  );
};

export default utilitiesLayout;