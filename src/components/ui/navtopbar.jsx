import Resize  from "/src/hooks/responsiveHook.jsx"


const Navtopbar = () => {
  const isMobile = Resize();
  const menuOptions = {
    label_all: "Todo",
    label_new: "Nuevo",
    label_proccess: "Proceso",
    label_check: "Resuelto",
  };

  return isMobile ? (
    <footer className="bg-gray-900 text-white fixed w-full bottom-0 z-20">
      <nav className="bg-gray-800 text-white  w-full p-2 shadow-md absolute bottom-full left-0">
        <ul className="flex flex-row gap-4">
        {Object.values(menuOptions).map((item, index) => (
            <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  ) : (
    <header className="bg-gray-900 text-white fixed w-full top-0 z-20">
      <nav className="bg-gray-800 text-white w-full ml-16 p-2 shadow-md absolute top-full left-0">
        <ul className="flex flex-row gap-4">
          {Object.values(menuOptions).map((item, index) => (
            <li key={index} className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navtopbar;
