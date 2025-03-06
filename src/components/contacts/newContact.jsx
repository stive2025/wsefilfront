import { useState } from 'react';
import { ArrowLeft, User, Phone, Download, ChevronDown } from 'lucide-react';

const NewContact = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-gray-800">
        <button className="mr-4">
          <ArrowLeft size={24} color="#fff" />
        </button>
        <h1 className="text-xl font-normal">New contact</h1>
      </div>

      {/* Form */}
      <div className="p-4 flex-1 flex flex-col">
        {/* First name */}
        <div className="mb-6 border-b border-gray-700 pb-2">
          <div className="flex items-center">
            <User size={20} className="text-gray-400 mr-4" />
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-transparent text-white outline-none"
            />
          </div>
        </div>

        {/* Last name */}
        <div className="mb-6 border-b border-gray-700 pb-2">
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>

        {/* Phone */}
        <div className="mb-6">
          <div className="flex items-center">
            <Phone size={20} className="text-gray-400 mr-4" />
            <div className="flex-1">
              <div className="text-xs text-gray-400">
                <span>Count...</span>
                <span className="ml-8 text-teal-500">Phone</span>
              </div>
              <div className="flex mt-1">
                <div className="flex items-center bg-transparent border-b border-gray-700 mr-2 pb-1">
                  <span className="text-gray-200">US +1</span>
                  <ChevronDown size={16} className="text-gray-400 ml-1" />
                </div>
                <div className="flex-1 border-b border-teal-500 pb-1">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-transparent text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save to */}
        <div className="mb-6 border-b border-gray-700 pb-2">
          <div className="flex items-center">
            <Download size={20} className="text-gray-400 mr-4" />
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">Save to</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-200">Phone</span>
                <ChevronDown size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Information */}
        <button className="text-teal-500 text-left mt-4">
          Add Information
        </button>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Save button */}
        <div className="mt-4 mb-6">
          <button className="w-full bg-teal-500 text-white py-3 rounded-full font-medium">
            Save
          </button>
        </div>

        {/* Bottom bar indicator */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NewContact;