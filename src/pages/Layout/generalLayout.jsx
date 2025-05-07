import NavSlideBar from "@/components/ui/navslidebar.jsx";
import NavTopBar from "@/components/ui/navtopbar.jsx";
import { Outlet } from "react-router-dom";



const generalLayout = () => {
  const userRole = "admin"; // Puedes obtenerlo de un contexto o API

  return (
    <div className="flex">
      <NavSlideBar role={userRole} />
      <NavTopBar />
      <main className="flex flex-col w-full min-h-screen bg-gray-900">
        {/* Outlet renderiza la ruta hija*/}
        <Outlet />
      </main>
    </div>

  );
};

export default generalLayout;