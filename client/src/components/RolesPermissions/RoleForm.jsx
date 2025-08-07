import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from "../Button"; 

// RoleForm for both adding and editing roles
const RoleForm = ({ role = null, fetchRolesAndPermissions, closeModal }) => {
    const [roleName, setRoleName] = useState(role ? role.name : '');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (roleName.trim() === '') {
            setError('Role name is required');
            return;
        }

        const url = role ? `/roles-permissions/edit-role/${role._id}` : "/roles-permissions/add-role";
        const method = role ? 'PUT' : 'POST';
        const data = { name: roleName };

        try {
            const response = await axios({ url, method, data });
            if (response.status === 200 || response.status === 201) {
                await fetchRolesAndPermissions(); 
                closeModal(); 
            } else {
                setError('Failed to process role');
            }
        } catch (error) {
            console.error("Failed to process role:", error);
            setError('Error: ' + error.message);
        }
    };

    useEffect(() => {
        setRoleName(role ? role.name : '');
    }, [role]);
    

    return (
        <div className="p-[30px] pt-0 bg-white rounded-lg shadow">
            <div className="pt-[20px] pb-[30px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">{role ? 'Update Role' : 'Add Role'}</h2>
                    <div className="flex flex-col items-start">
                        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">
                            Role Name:
                        </label>
                        <input
                            id="roleName"
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Enter role name"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            required
                        />
                        {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                    </div>
                    <div className="text-center">
                        <Button type="submit" className="w-full">
                            {role ? 'Update Role' : 'Add Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleForm;
