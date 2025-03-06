import { Search, Star } from 'lucide-react';

const ListContacts = () => {
  // Sample contact data
  const contacts = [
    {
      id: 1,
      name: "Samy",
      emoji: "😊",
      isFavorite: true,
      note: "Envía mensajes a este mismo número.",
      avatar: "/api/placeholder/50/50",
      isPrimary: true
    },
    {
      id: 2,
      name: ".",
      avatar: "/api/placeholder/50/50",
      isEmpty: true
    },
    {
      id: 3,
      name: "Andreina Burneo",
      phone: "+593 93 961 4409",
      avatar: "/api/placeholder/50/50",
      hasCustomIcon: true
    },
    {
      id: 4,
      phone: "+593 96 764 9684",
      avatar: "/api/placeholder/50/50"
    },
    {
      id: 5,
      phone: "+593 98 661 9610",
      note: "Hair & Makeup Artist ✨",
      avatar: "/api/placeholder/50/50",
      hasHeart: true
    }
  ];

  return (
    <div className="bg-gray-900 text-white p-4">
      {/* Search bar */}
      <div className=" mb-6">
        <div className="left-3 flex items-center">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Busca un nombre o número"
          className="w-full bg-gray-800 text-gray-300 py-3 pl-10 pr-4 rounded-md focus:outline-none"
        />
      </div>

      {/* Contacts header */}
      <div className="mb-4">
        <h2 className="text-teal-500 text-lg font-medium tracking-wide">CONTACTOS EN WHATSAPP</h2>
        <div className="h-px bg-gray-700 mt-2"></div>
      </div>

      {/* Contacts list */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="flex items-center py-2">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img
                src={contact.avatar}
                alt={contact.name || "Contact"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 border-b border-gray-700 pb-4">
              <div className="flex items-center">
                {contact.isPrimary && (
                  <div className="flex items-center">
                    <span className="mr-1">{contact.name}</span>
                    {contact.emoji && <span className="mr-1">{contact.emoji}</span>}
                    {contact.isFavorite && <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />}
                    <span className="text-gray-300">Samy (Tú)</span>
                  </div>
                )}
                {contact.hasCustomIcon && (
                  <div className="flex items-center">
                    <span className="text-gray-300">{contact.phone}</span>
                    <div className="flex ml-2">
                      <div className="w-4 h-6 bg-pink-600 rounded-sm mx-px"></div>
                      <div className="w-4 h-6 bg-pink-600 rounded-sm mx-px"></div>
                    </div>
                  </div>
                )}
                {contact.isEmpty && <span className="text-gray-300">{contact.name}</span>}
                {!contact.isPrimary && !contact.hasCustomIcon && !contact.isEmpty && (
                  <span className="text-gray-300">{contact.phone}</span>
                )}
              </div>
              {contact.note && (
                <div className="text-gray-400 text-sm mt-1 flex items-center">
                  {contact.note}
                  {contact.hasHeart && <span className="text-pink-500 ml-1">💕</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListContacts;