import ProfileInfo from "@/components/profile/profileInfo.jsx";
import Tagmod from "@/components/mod/newUtilitieMod.jsx";
import { ProfileInfoPanel } from "@/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "@/contexts/themeContext.jsx";

const ProfileComplete = () => {
    const { profileInfoOpen, SetProfileInfoOpen } = useContext(ProfileInfoPanel);
    const { theme } = useTheme();

    return (
        <div className={`
            min-h-screen w-full mx-auto p-4
            ${theme === 'light' ? 'bg-[rgb(var(--color-bg-light))]' : 'bg-[rgb(var(--color-bg-dark))]'}
            ${theme === 'light' ? 'text-[rgb(var(--color-text-primary-light))]' : 'text-[rgb(var(--color-text-primary-dark))]'}
        `}>
            <ProfileInfo role={"admin"} />
            {profileInfoOpen && <Tagmod isOpen={profileInfoOpen} onClose={() => SetProfileInfoOpen(false)} option={6} />}
        </div>
    )
};

export default ProfileComplete;