import { useState,useEffect } from "react";
const Resize = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 600);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, [isMobile]);
    return isMobile;
}

export default Resize;