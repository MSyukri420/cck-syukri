import React from "react";

/**
 * Card component.
 * @property {React.ReactNode} children - The children to render inside the card.
 */
function Card({children}) {
    return (
        <div className="flex flex-col shadow-lg rounded bg-white">
            {children}
        </div>
    );
}

export default Card;