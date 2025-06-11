// utils/getUserLabelColors.js

const assignedColors = new Map();
const availableColors = [
  { bg: "bg-red-200", text: "text-red-800" },
  { bg: "bg-green-200", text: "text-green-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-yellow-200", text: "text-yellow-800" },
  { bg: "bg-purple-200", text: "text-purple-800" },
  { bg: "bg-pink-200", text: "text-pink-800" },
  { bg: "bg-orange-200", text: "text-orange-800" },
  { bg: "bg-teal-200", text: "text-teal-800" },
  { bg: "bg-indigo-200", text: "text-indigo-800" },
  { bg: "bg-amber-200", text: "text-amber-800" },
];

const defaultColor = { bg: "bg-gray-100", text: "text-gray-800" }; // Color por defecto si se acaban los colores

export const getUserLabelColors = (user) => {
  if (assignedColors.has(user)) {
    return assignedColors.get(user);
  }

  const color = availableColors.shift() || defaultColor; // Si se acaban los colores
  assignedColors.set(user, color);
  return color;
};
