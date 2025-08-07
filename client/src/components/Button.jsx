import React from "react";

/**
 * Button component
 * @param {"primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"} colorType - The color type of the button.
 * @param {React.ReactNode} children - The children to render inside the button.
 * @param {React.ComponentPropsWithoutRef<"button">} props - The props for the button.
 */
function Button({colorType, className, onClick, children, ...props}) {
    function setButtonType(type) {
        switch(type) {
            case "primary":
                return 'bg-blue-500 text-white';
            case "secondary":
                return 'bg-gray-500 text-white';
            case "success":
                return 'bg-green-500 text-white';
            case "danger":
                return 'bg-red-500 text-white';
            case "warning":
                return 'bg-yellow-500 text-white';
            case "info":
                return 'bg-blue-300 text-white';
            case "light":
                return 'bg-gray-300 text-white';
            case "dark":
                return 'bg-gray-900 text-white';
            default:
                return 'bg-blue-500 text-white';
        }

    }

    return (
        <button {...props} onClick={onClick} className={`px-[12px] py-[6px] text-white bg-red-500 bg-opacity-80 rounded-md ring-1 ring-inset ring-red-400 shadow-sm ${setButtonType(colorType)} ${className}`}>
            {children}
        </button>
    );
}

export default Button;