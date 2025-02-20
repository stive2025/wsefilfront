// src/components/NavSlideBar.jsx
// eslint-disable-next-line react/prop-types
const NavSlideBar = ({ role }) => {
  // Opciones según el rol
  const menuOptions = {
    label_all: "Todo",
    label_new: "Nuevo",
    label_process: "Proceso",
    label_check: "Resuelto"
  };

  return (
    <nav className="h-16 w-screem bg-gray-900 flex flex-col  py-4">
      {/* Opciones de menú */}
      <ul className="flex flex-col gap-6 flex-1">
        {menuOptions[role]?.map((item, index) => (
          <li key={index} className="text-gray-400 hover:text-white cursor-pointer">
            {item.icon}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavSlideBar;

