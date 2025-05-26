// utils/getUserLabelColors.js
const userColors = [
  { bg: "bg-blue-100", text: "text-blue-800" },
  { bg: "bg-green-100", text: "text-green-800" },
  { bg: "bg-pink-100", text: "text-pink-800" },
  { bg: "bg-yellow-100", text: "text-yellow-800" },
  { bg: "bg-purple-100", text: "text-purple-800" },
];

const stringToIndex = (str, max) => {
  if (!str) return 0;
  // Normalizar: trim + minúsculas
  const cleanStr = str.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    hash = cleanStr.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Mantener entero 32-bit
  }
  return Math.abs(hash) % max;
};

export const getUserLabelColors = (user) => {
  const index = stringToIndex(user, userColors.length);
  return userColors[index];
};
