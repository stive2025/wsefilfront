import NavSlideBar from "/src/components/ui/navslidebar.jsx";

const home_chat = () => {
  const userRole = "admin"; // Puedes obtenerlo de un contexto o API

  return (
    <div className="flex">
      <NavSlideBar role={userRole} />
      <main className="flex-1 p-6">WUUUU!</main>
    </div>
  );
};

export default home_chat;