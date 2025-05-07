import Resize from "@/hooks/responsiveHook.jsx";
import ListContacts from "@/components/contacts/listContacts.jsx";
import NewContact from "@/components/contacts/newContact.jsx";
import Tagmod from "@/components/mod/newUtilitieMod.jsx";
import { NewContactForm } from "@/contexts/chats.js"
import { useContext } from "react";
import { useTheme } from "@/contexts/themeContext";

const ContactsComplete = () => {
  const { contactNew, setContactNew } = useContext(NewContactForm);
  const isMobile = Resize();
  const { theme } = useTheme();

  return isMobile ? (
    <div className={`h-screen w-full mx-auto p-4 
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))]`}
    >
      <ListContacts />
      {contactNew && (
        <Tagmod 
          isOpen={contactNew} 
          onClose={() => setContactNew(false)} 
          option={4}
        />
      )}
    </div>
  ) : (
    <div className={`h-screen w-full mx-auto p-4 
      bg-[rgb(var(--color-bg-${theme}))] 
      text-[rgb(var(--color-text-primary-${theme}))] 
      grid grid-cols-2 gap-4 overflow-y-auto`}
    >
      <ListContacts />
      <NewContact />
    </div>
  );
};

export default ContactsComplete;