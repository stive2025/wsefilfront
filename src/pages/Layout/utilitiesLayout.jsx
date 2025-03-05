import NavSlideBar from "/src/components/ui/navslidebar.jsx";
import NavUtilities from "/src/components/ui/navUtilities.jsx";
import { Outlet } from "react-router-dom";



const utilitiesLayout = () => {
  const userRole = "admin"; // Puedes obtenerlo de un contexto o API

  return (
    <div className="overflow-hidden">
      <NavSlideBar role={userRole}/>
      <NavUtilities/>
      <main className="h-screen w-full flex flex-col">
        {/* Outlet renderiza la ruta hija*/}
        <Outlet />
      </main> 
    </div>

  );
};

export default utilitiesLayout;