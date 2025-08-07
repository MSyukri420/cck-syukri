import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserPermission = ({ employee, closeModal }) => {
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                // Fetch general roles and modules structure
                const rolesResponse = await axios.get("/roles-permissions", { headers: { "client": "react" } });
                setRoles(rolesResponse.data.roles);

                // Fetch specific permissions for this user
                const userPermissionsResponse = await axios.get(`/roles-permissions/${employee.role._id}/permissions`, { headers: { "client": "react" } });
                const userPermissions = userPermissionsResponse.data.permissions;

                setModules(formatModules(rolesResponse.data.modules, userPermissions));
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            }
        };
        fetchPermissions();
    }, [employee]);

    const formatModules = (modulesData, userPermissions) => {
        let formatted = {};
        Object.keys(modulesData).forEach(module => {
            formatted[module] = {};
            Object.keys(modulesData[module]).forEach(group => {
                formatted[module][group] = modulesData[module][group].map(permission => ({
                    ...permission,
                    assigned: userPermissions.includes(permission._id)
                }));
            });
        });
        return formatted;
    };

    const handlePermissionChange = (moduleKey, groupKey, permissionId) => {
        if (!selectedRole) return; 
        const newModules = {...modules};
        const permissionIndex = newModules[moduleKey][groupKey].findIndex(p => p._id === permissionId);
        if (permissionIndex > -1) {
            newModules[moduleKey][groupKey][permissionIndex].assigned = !newModules[moduleKey][groupKey][permissionIndex].assigned;
        }
        setModules(newModules);
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Permissions for {employee.name}</h3>
            <div className="space-y-4">
                {Object.entries(modules).map(([moduleKey, groups]) => (
                    <div key={moduleKey} className="mb-4 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-100 p-4">
                            <div className="font-bold text-md">{moduleKey}</div>
                        </div>
                        <div className="p-4">
                            <div className="flex flex-wrap -mx-2">
                                {Object.entries(groups).map(([groupKey, permissions]) => (
                                    <div key={groupKey} className="w-full lg:w-1/4 px-2">
                                        <h6 className="font-semibold text-gray-600 mb-2">{groupKey}</h6>
                                        <ul className="list-none pl-0">
                                            {permissions.map(permission => (
                                                <li key={permission._id} className="mb-1">
                                                    <label htmlFor={`${permission._id}_permission`} className="flex items-center">
                                                        {permission.exclusive ? (
                                                            <input type="radio" name={`${moduleKey}-${groupKey}`} id={`${permission._id}_permission`} checked={permission.assigned} disabled={!selectedRole} onChange={() => handlePermissionChange(moduleKey, groupKey, permission._id, true)} className="form-radio h-4 w-4 mr-2"/>
                                                        ) : (
                                                            <input type="checkbox" id={`${permission._id}_permission`} checked={permission.assigned} disabled={!selectedRole} onChange={() => handlePermissionChange(moduleKey, groupKey, permission._id, false)} className="form-checkbox h-4 w-4 mr-2"/>
                                                        )}
                                                        {permission.name}
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPermission;
