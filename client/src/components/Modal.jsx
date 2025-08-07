import React, {useRef, useState, useImperativeHandle, forwardRef, useEffect} from "react";
import {createPortal} from "react-dom";

/**
 * Modal component.
 * @param {string} [title] - The title of the modal.
 * @param {() => void} [onOpen] - The function to call when the modal is opened.
 * @param {() => void} [onClose] - The function to call when the modal is closed.
 * @param {React.ReactNode} children - The children to render inside the modal.
 * @param {React.Ref} ref - The ref for the PopModal component.
 */
const Modal = forwardRef(function ({onOpen, onClose, title, children}, ref) {
    // Reference to the dialog element
    const modalRef = useRef(null);

    // State to hold the modal content
    const [content, setContent] = useState();

    // Effect to set the modal content when the children prop changes
    useEffect(() => {
        setContent(children);
    }, [children]);

    /**
     * Open the modal.
     */
    const openModal = () => {
        modalRef.current?.showModal();
        onOpen?.();
    }

    /**
     * Close the modal.
     */
    const closeModal = () => {
        modalRef.current?.close();
        onClose?.();
    }

    // Expose the openModal and closeModal functions to the parent component
    useImperativeHandle(ref, () => {
        return {
            openModal,
            closeModal
        }
    });

    return createPortal(
        <dialog ref={modalRef} className="w-12/12 lg:w-10/12 xl:w-8/12 z-50 px-[30px] relative bg-transparent border-none bg-white rounded-xl focus:outline-none">
            <div className="flex flex-col">
                {/* Modal Header */}
                {/* If `title` is not provided */}
                {!title && (
                    <span className="material-icons cursor-pointer self-end" onClick={closeModal}>close</span>
                )}
                {/* If `title` is provided */}
                {title && (
                    <div className="py-[15px] relative flex flex-row justify-start items-center bg-white border-b border-gray-200">
                        <h1 className="text-2xl font-medium">{title}</h1>
                        <span className="material-icons absolute right-5 cursor-pointer" onClick={closeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                            </svg>
                        </span>
                    </div>
                )}
                {/* Modal Content */}
                <div className="py-[30px]">
                    {content}
                </div>
            </div>
        </dialog>
        , document.body);
});

export default Modal;