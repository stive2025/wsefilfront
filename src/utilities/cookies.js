// Get cookie value by name
export const GetCookieItem = (key) => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(key + '='));
    return cookie ? cookie.split('=')[1] : null;
};

// Set cookie with optional expiration days
export const setCookieItem = (key, value, days = 1) => {
    if (typeof document === 'undefined') return;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue = `${key}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
    document.cookie = cookieValue;
};

// Remove cookie by setting expiration to past date
export const RemoveCookieItem = (key) => {
    if (typeof document === 'undefined') return;

    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};