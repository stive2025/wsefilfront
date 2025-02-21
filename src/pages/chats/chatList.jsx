import { MessageSquareShare, MessageSquarePlus, EllipsisVertical } from "lucide-react";
//import { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";

const chatList = () => {
    <div id="divContainer">
        <div id="divLogo">
            <img
                src="/src/assets/images/logoCRM.png"
                alt="CRM SEFIL"
                className="h-16 object-cover hidden md:block rounded-lg"
            />
            <div>
                <ul className="flex flex-row gap-4">
                    <li className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                        <MessageSquareShare />
                    </li>
                    <li className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                        <MessageSquarePlus />
                    </li>
                    <li className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                        <EllipsisVertical />
                    </li>
                </ul>
            </div>
        </div>
        <div id="buscar">

        </div>
        <div id="etiquetas">

        </div>
        <div id="chatList">

        </div>
    </div>
}


export default chatList;
