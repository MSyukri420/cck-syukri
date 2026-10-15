import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { PlatformContext } from "../Layout/PlatformLayout.jsx";
import Modal from '../Modal.jsx';
import RoleForm from './RoleForm.jsx';
import UserPermission from './UserPermission.jsx';
import AddPermissionModal from './AddPermissionForm.jsx';
import EditPermissionModal from './EditPermissionForm.jsx';
import Table from "../Table.jsx";

const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const platformCtx = useContext(PlatformContext);
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);
    const modalRef = useRef(null);
    const [activeTab, setActiveTab] = useState('settings');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getData = async function() {
            const response = await axios.get("/employees-list");
            const data = response.data;
            return data;
        }

        getData().then((data) => {
            setLoading(false);
            setEmployees(data.employees);
        });
    }, [loading]);

    useEffect(() => {
        platformCtx.setPage("Roles Based Access Control");
        platformCtx.setBreadcrumb([
            { name: "Home" },
            { name: "Roles Based Access Control", path: "/roles-permissions" }
        ]);
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = async () => {
        try {
            const response = await axios.get("/roles-permissions", { headers: { "client": "react" } });
            setRoles(response.data.roles);
            setModules(formatModules(response.data.modules));
        } catch (error) {
            console.error("Failed to fetch roles and permissions:", error);
        }
    };

    const formatModules = (modulesData) => {
        let formatted = {};
        Object.keys(modulesData).forEach(module => {
            formatted[module] = {};
            Object.keys(modulesData[module]).forEach(group => {
                formatted[module][group] = modulesData[module][group].filter(permission => permission.name !== 'ApiKey').map(permission => ({
                    ...permission,
                    assigned: false 
                }));
            });
        });
        return formatted;
    };

    const handleSelectRole = async (role) => {
        setSelectedRole(role);
        const response = await axios.get(`/roles-permissions/${role._id}/permissions`);
        if (response.status === 200) {
            setModules(formatPermissionsForRole(response.data.permissions, modules));
        }
    };

    const handleUnselectRole = () => {
        setSelectedRole(null);
        const resetModules = { ...modules };
        Object.keys(resetModules).forEach(module => {
            Object.keys(resetModules[module]).forEach(group => {
                resetModules[module][group] = resetModules[module][group].map(permission => ({
                    ...permission,
                    assigned: false
                }));
            });
        });
        setModules(resetModules);
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                await axios.delete(`/roles-permissions/delete-role/${roleId}`);
                const updatedRoles = roles.filter(role => role._id !== roleId);
                setRoles(updatedRoles);
                if (selectedRole && selectedRole._id === roleId) {
                    setSelectedRole(null);
                }
                alert('Role deleted successfully');
            } catch (error) {
                console.error('Failed to delete role:', error);
                alert(error.response?.data?.message || 'Failed to delete role');
            }
        }
    };

    const handleAddRole = () => {
        openModal("Add Role", <RoleForm fetchRolesAndPermissions={fetchRolesAndPermissions} closeModal={() => modalRef.current.closeModal()} />);
    };

    const handleEditRole = (roleId) => {
        const roleToEdit = roles.find(role => role._id === roleId);
        if (roleToEdit) {
            openModal("Edit Role", <RoleForm role={roleToEdit} fetchRolesAndPermissions={fetchRolesAndPermissions} closeModal={() => modalRef.current.closeModal()} />);
        } else {
            console.error('Role not found');
        }
    };

    const formatPermissionsForRole = (permissions, allModules) => {
        let formatted = { ...allModules };
        Object.keys(formatted).forEach(module => {
            Object.keys(formatted[module]).forEach(group => {
                formatted[module][group] = formatted[module][group].map(permission => ({
                    ...permission,
                    assigned: permissions.includes(permission._id)
                }));
            });
        });
        return formatted;
    };

    const handlePermissionChange = (moduleKey, groupKey, permissionId, isExclusive) => {
        if (!selectedRole) return;
        const newModules = { ...modules };
        const permissions = newModules[moduleKey][groupKey];

        if (isExclusive) {
            permissions.forEach(permission => {
                permission.assigned = permission._id === permissionId;
            });
        } else {
            const permissionIndex = permissions.findIndex(p => p._id === permissionId);
            if (permissionIndex > -1) {
                permissions[permissionIndex].assigned = !permissions[permissionIndex].assigned;
            }
        }

        setModules(newModules);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedRole) {
            console.error('No role selected');
            return;
        }
        const selectedPermissions = [];
        Object.values(modules).forEach(groups => {
            Object.values(groups).forEach(permissions => {
                permissions.forEach(permission => {
                    if (permission.assigned) selectedPermissions.push(permission._id);
                });
            });
        });

        try {
            await axios.post(`/roles-permissions/${selectedRole._id}/permissions`, {
                permissions: selectedPermissions
            });
            alert('Permissions updated successfully');
            location.reload();
        } catch (error) {
            console.error('Failed to update permissions:', error);
            alert('Failed to update permissions');
        }
    };

    const handleShowUserPermissions = (employee) => {
        openModal("User Permissions", <UserPermission employee={employee} closeModal={() => modalRef.current.closeModal()} />);
    };

    const handleAddPermission = () => {
        openModal("Add Permission", <AddPermissionModal onPermissionAdded={fetchRolesAndPermissions} closeModal={() => modalRef.current.closeModal()} />);
    };

    const handleEditPermission = (permissionId, e) => {
        e.stopPropagation();
        openModal("Edit Permission", <EditPermissionModal permissionId={permissionId} onPermissionUpdated={fetchRolesAndPermissions} closeModal={() => modalRef.current.closeModal()} />);
    };

    const handleDeletePermission = (permissionId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this permission?")) {
            axios.delete(`/roles-permissions/delete-permission/${permissionId}`)
                .then(response => {
                    alert('Permission deleted successfully');
                    location.reload();
                })
                .catch(error => {
                    console.error("Failed to delete permission:", error);
                    alert('Failed to delete permission');
                });
        }
    };

    const openModal = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        modalRef.current.openModal();
    };

    return (
        <div>
            <Modal ref={modalRef}>{modalContent}</Modal>
            <div className="page-header mb-4">
                <div className="flex border-b">
                    <button className={`flex-1 py-2 ${activeTab === 'settings' ? 'text-red-500 border-b-2 font-medium border-red-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('settings')}>
                        Settings
                    </button>
                    <button className={`flex-1 py-2 ${activeTab === 'users' ? 'text-red-500 border-b-2 font-medium border-red-500' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('users')}>
                        Users
                    </button>
                </div>
            </div>
            {activeTab === 'settings' && (
                <div className="flex flex-wrap">
                    <div className="w-full lg:w-1/4 p-4">
                        <button onClick={handleAddRole} className="btn btn-primary mb-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-200">Add Role</button>
                        {roles.map(role => (
                            <div 
                                key={role._id} 
                                onClick={() => handleSelectRole(role)} 
                                className={`flex justify-between items-center p-2 mb-1 cursor-pointer hover:bg-gray-200 ${selectedRole && selectedRole._id === role._id ? 'bg-gray-200' : 'bg-white'}`}
                            >
                                <span>{role.name}</span>
                                <span>
                                    <button onClick={(e) => { e.stopPropagation(); handleEditRole(role._id); }} className="text-xs mr-2">
                                        <i className="material-icons">edit</i>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role._id); }} className="text-xs">
                                        <i className="material-icons">delete</i>
                                    </button>
                                </span>
                            </div>
                        ))}
                        {selectedRole && (
                            <button onClick={handleUnselectRole} className="btn btn-secondary mt-2 w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-200">Unselect Role</button>
                        )}
                    </div>
                    <div className="w-full lg:w-3/4 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {selectedRole ? `${selectedRole.name} Permission Access` : "Select a role to view permissions"}
                            </h3>
                            {/* {!selectedRole && (
                                <button onClick={handleAddPermission} className="btn btn-primary mb-2 w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-200">Add Permission</button>
                            )} */}
                        </div>
                        <form onSubmit={handleSubmit}>
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
                                                                        <input type="radio" name={`${moduleKey}-${groupKey}`} id={`${permission._id}_permission`} checked={permission.assigned} onChange={() => handlePermissionChange(moduleKey, groupKey, permission._id, true)} className="form-radio h-4 w-4 mr-2"/>
                                                                    ) : (
                                                                        <input type="checkbox" id={`${permission._id}_permission`} checked={permission.assigned} onChange={() => handlePermissionChange(moduleKey, groupKey, permission._id, false)} className="form-checkbox h-4 w-4 mr-2"/>
                                                                    )}
                                                                    {permission.name}
                                                                </label>
                                                                {/* {!selectedRole && (
                                                                    <div className="flex">
                                                                        <button onClick={(e) => handleEditPermission(permission._id, e)} className="text-xs mr-2">
                                                                            <i className="material-icons">edit</i>
                                                                        </button>
                                                                        <button onClick={(e) => handleDeletePermission(permission._id, e)} className="text-xs">
                                                                            <i className="material-icons">delete</i>
                                                                        </button>
                                                                    </div>
                                                                )} */}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedRole && (
                                <button type="submit" className="btn btn-primary mb-2 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-200">Save Permissions</button>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {activeTab === 'users' && (
                <div className="p-4">
                    <Table
                        header={["No", "Employee ID", "Username", "Full Name", "Department", "Designation", "Role", "Action" ]}
                        data={employees.map((employee, index) => {
                            return [
                                index + 1,
                                employee.employeeId,
                                employee.username,
                                employee.name,
                                employee.department?.departmentName,
                                employee.designation?.name,
                                employee.role?.name,
                                <button onClick={() => handleShowUserPermissions(employee)} className="text-blue-500 hover:text-blue-800">View Permissions</button>
                            ];
                        })}
                    />
                </div>
            )}
        </div>
    );
};

export default RolesPermissions;
