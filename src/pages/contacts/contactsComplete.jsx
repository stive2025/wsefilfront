import Resize from "/src/hooks/responsiveHook.jsx";
import ListContacts from "/src/components/contacts/listContacts.jsx";
import NewContact from "/src/components/contacts/newContact.jsx";
import Tagmod from "/src/components/mod/newUtilitieMod.jsx";
import { NewContactForm } from "/src/contexts/chats.js"
import { useContext } from "react";


const ContactsComplete = () => {
  const {contactNew, setContactNew} = useContext(NewContactForm);
    const isMobile = Resize();
    return isMobile ? (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white">
            <ListContacts />
            {contactNew && <Tagmod isOpen={contactNew} onClose={() => setContactNew(false)} option={4}/>}
        </div>
    ) : (
        <div className="h-screen w-full mx-auto p-4 bg-gray-900 text-white grid grid-cols-2 gap-4 overflow-y-auto">
            <ListContacts />
            <NewContact />
        </div>

    );
};

export default ContactsComplete;