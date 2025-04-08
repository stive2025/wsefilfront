import ProfileInfo from "/src/components/profile/profileInfo.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { ProfileInfoPanel } from "/src/contexts/chats.js"
import { useContext } from "react";


const ProfileComplete = () => {
    const { profileInfoOpen, SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    return (
        <div className="min-h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <ProfileInfo role={"admin"} />
            {profileInfoOpen && <Tagmod isOpen={profileInfoOpen} onClose={() => SetProfileInfoOpen(false)} option={6} />}
        </div>
    )
};

export default ProfileComplete;