import React, {useEffect, useRef, useState} from "react";

/**
 * Dropdown component.
 * @param {React.ReactNode} header - The header node to render inside the dropdown.
 * @param {React.ReactNode} children - The children to render inside the dropdown.
 */
function Dropdown({header, children}) {
    // State to hold the dropdown open status
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    })

    /**
     * Handle click event to toggle dropdown open status.
     */
    function handleClick() {
        setIsOpen(!isOpen);
    }

    function handleChildClick() {
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Render the header node and attach click event to toggle dropdown */}
            <div className="cursor-pointer" onClick={handleClick}>{header}</div>
            {/* Render the children inside the dropdown. It's hidden by default and shown when dropdown is open */}
            <div className="absolute hidden top-10 right-0 z-10 min-w-40 bg-white shadow-lg rounded mt-2 aria-checked:block" aria-checked={isOpen}>
                <div onClick={handleChildClick}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Dropdown;