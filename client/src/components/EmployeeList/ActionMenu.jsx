import React, { useContext } from 'react';
import { AuthenticationContext } from "../Provider/AuthenticationProvider.jsx";
import { useNavigate } from 'react-router-dom';

const ActionMenu = ({ employeeId, onEdit, onDelete }) => {
    const { isAuthenticated, hasPermission } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    const handleView = () => {
        navigate(`/profile/${employeeId}`);
    };

    return (
        <div className="flex gap-2">
            {isAuthenticated && (
                <>
                    {hasPermission('view_profile') && (
                        <span className="material-icons text-black cursor-pointer" onClick={handleView}>visibility</span>
                    )}
                    {hasPermission('edit_all', 'edit_admin', 'edit_hr') && (
                        <span className="material-icons text-black cursor-pointer" onClick={onEdit}>edit</span>
                    )}
                    {hasPermission('delete') && (
                        <span className="material-icons text-red-500 cursor-pointer" onClick={onDelete}>delete</span>
                    )}
                </>
            )}
        </div>
    );
};

export default ActionMenu;