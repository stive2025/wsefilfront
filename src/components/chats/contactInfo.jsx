/* eslint-disable react/prop-types */
import { AnimatePresence, motion } from "framer-motion";
import { Info, StickyNote, SquareCheck } from "lucide-react";

const ContactInfo = () => {
    return (
        <div className="w-full max-w-sm bg-gray-900 text-white rounded-b-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center border-b border-gray-700">
                <span className="mr-2 text-xl font-bold cursor-pointer">×</span>
                <span className="text-sm">Info. del Contacto</span>
            </div>

            {/* Profile Section */}
            <div className="p-5 flex flex-col items-center border-b border-gray-700">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 mb-3">
                    <img
                        src="/placeholder-profile.jpg"
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <h2 className="text-lg mb-1">José Sarmiento Cliente 1</h2>
                <p className="text-gray-400 text-sm mb-1">+593 98 393 7312</p>
                <p className="text-green-500 text-sm">En línea</p>
            </div>

            {/* Client Status */}
            <div className="py-3 bg-gray-800 text-gray-500 text-center text-sm">
                estado del cliente
            </div>

            {/* Files Section */}
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-700">
                <span className="text-gray-400 text-sm">Archivos, enlaces y documentos</span>
                <span className="text-gray-400 text-sm">563 &gt;</span>
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex gap-2 border-b border-gray-700">
                <img
                    src="/placeholder-fox.jpg"
                    alt="Thumbnail"
                    className="w-20 h-16 rounded object-cover"
                />
                <img
                    src="/placeholder-sofa.jpg"
                    alt="Thumbnail"
                    className="w-20 h-16 rounded object-cover"
                />
                <img
                    src="/placeholder-device.jpg"
                    alt="Thumbnail"
                    className="w-20 h-16 rounded object-cover"
                />
            </div>

            {/* Credit Info */}
            <div className="p-4">
                <h3 className="mb-2 text-base">Info.Credito</h3>
                <div className="text-gray-500 text-sm">
                    <p className="mb-1">Nro.</p>
                    <p className="mb-1">Garante:</p>
                    <p className="mb-1">Monto:</p>
                    <p className="mb-1">Fecha:</p>
                </div>
            </div>
        </div>
    );
};
export default ContactInfo;
