import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditPermissionModal = ({ permissionId, onPermissionUpdated, closeModal }) => {
    const [name, setName] = useState('');
    const [module, setModule] = useState('');
    const [group, setGroup] = useState('');
    const [exclusive, setExclusive] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPermission = async () => {
            try {
                const response = await axios.get(`/roles-permissions/get-permission/${permissionId}`);
                const permission = response.data.permission;
                setName(permission.name);
                setModule(permission.module);
                setGroup(permission.group);
                setExclusive(permission.exclusive);
            } catch (error) {
                setError('Failed to fetch permission details');
            }
        };

        fetchPermission();
    }, [permissionId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/roles-permissions/edit-permission/${permissionId}`, {
                name,
                module,
                group,
                exclusive
            });
            onPermissionUpdated();
            closeModal();
        } catch (error) {
            setError('Failed to update permission');
        }
    };

    return (
        <div className="p-[30px] pt-0 bg-white rounded-lg shadow">
            <div className="pt-[20px] pb-[30px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">Edit Permission</h2>
                    <div className="flex flex-col items-start">
                        <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700 mb-2">
                            Permission Name:
                        </label>
                        <input
                            id="permissionName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter permission name"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <label htmlFor="permissionModule" className="block text-sm font-medium text-gray-700 mb-2">
                            Module:
                        </label>
                        <input
                            id="permissionModule"
                            type="text"
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                            placeholder="Enter module name"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <label htmlFor="permissionGroup" className="block text-sm font-medium text-gray-700 mb-2">
                            Group:
                        </label>
                        <input
                            id="permissionGroup"
                            type="text"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            placeholder="Enter group name"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="permissionExclusive"
                            type="checkbox"
                            checked={exclusive}
                            onChange={(e) => setExclusive(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                        <label htmlFor="permissionExclusive" className="ml-2 block text-sm leading-5 text-gray-900">
                            Exclusive
                        </label>
                    </div>
                    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="btn btn-primary w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-200"
                        >
                            Update Permission
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPermissionModal;
