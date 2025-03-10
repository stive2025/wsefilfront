import Resize from "/src/hooks/responsiveHook.jsx";
import ProfileInfo from "/src/components/profile/profileInfo.jsx";
import ProfileQR from "/src/components/profile/profileQR.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { ProfileInfoPanel } from "/src/contexts/chats.js"
import { useContext } from "react";


const ProfileComplete = () => {
  const {profileInfoOpen, SetProfileInfoOpen} = useContext(ProfileInfoPanel);
    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <ProfileInfo />
            {profileInfoOpen && <Tagmod isOpen={profileInfoOpen} onClose={() => SetProfileInfoOpen(false)} option={6}/>}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <ProfileInfo />
            <ProfileQR />
        </div>

    );
};

export default ProfileComplete;