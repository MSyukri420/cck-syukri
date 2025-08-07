import React from "react";

/**
 * Alert component.
 * @param {"primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"} type - The type of the alert.
 * @param {function} onClose - The function to call when the alert is closed.
 * @param {React.ReactNode} children - The message body of the alert.
 */
function Alert({type, onClose, children}) {

    function setAlertType(type) {
        switch(type) {
            case "primary":
                return 'bg-blue-300 border-blue-500 text-blue-800';
            case "secondary":
                return 'bg-gray-300 border-gray-500 text-gray-700';
            case "success":
                return 'bg-green-100 border-green-500 text-green-700';
            case "danger":
                return 'bg-red-100 border-red-500 text-red-700';
            case "warning":
                return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case "info":
                return 'bg-blue-100 border-blue-500 text-blue-700';
            case "light":
                return 'bg-gray-100 border-gray-500 text-gray-700';
            case "dark":
                return 'bg-gray-500 border-gray-900 text-gray-100';
            default:
                return 'bg-blue-100 border-blue-500 text-blue-700';
        }

    }

    return (
        <div className={`flex flex-row gap-6 justify-between w-full p-4 border rounded ${setAlertType(type)}`} role="alert">
            <p>{children}</p>
            <button onClick={onClose} className="font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                </svg>
            </button>
        </div>
    );
}

export default Alert;