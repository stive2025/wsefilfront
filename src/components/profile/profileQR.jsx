import Resize from "/src/hooks/responsiveHook.jsx";

const ProfileQR = () => {
  const isMobile = Resize();
  return (
    <div className={`bg-gray-900 rounded-lg w-full p-6 space-y-4 h-max ${isMobile ? "" : "mt-5"}`}>
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800 rounded-lg">
        <h1 className="text-xl font-normal">Escanea el código  QR</h1>
      </div>
      <div>QR</div>
    </div>
  );
};

export default ProfileQR;
