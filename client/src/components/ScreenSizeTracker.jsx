import React, { useState, useEffect } from 'react';

export const ScreenSizeTracker = ({ children }) => {
    // State to hold the current screen width
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Function to update the screen width state
    const updateScreenWidth = () => {
        setScreenWidth(window.innerWidth);
    };

    // Effect to add event listener when component mounts
    useEffect(() => {
        window.addEventListener('resize', updateScreenWidth);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            window.removeEventListener('resize', updateScreenWidth);
        };
    }, []); // Empty dependency array ensures the effect runs only once when component mounts

    // Render the children with the current screen width
    return children(screenWidth);
};