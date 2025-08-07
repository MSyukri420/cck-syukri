import Button from "../Button.jsx";
import Tab from "../Tab.jsx";
import {useContext, useEffect, useState} from "react";
import {PlatformContext} from "../Layout/PlatformLayout.jsx";
import axios from "axios";

function AddEmployee({onSubmit, onUpdateSuccess}) {
    const [roles, setRoles] = useState([]);
    // Language Settings
    const languageMap = {
        English: {
            addUser: 'Add More User',
            user: 'User',
            role: 'Role',
            selectRole: 'Select Role',
            username: 'Username',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            passwordsNotMatch: 'Passwords do not match',
            delete: 'Delete',
            submit: 'Submit',
            allFieldsFilled: 'Please make sure all fields are filled.',
            passwordsnotMatch: 'Passwords do not match in one or more entries.',
            employeesAdded: 'Employees added successfully!',
            errorAddingEmployees: 'Error adding employees: ',
            failedToAddEmployees: 'Failed to add employees. '
        },
        'Bahasa Melayu': {
            addUser: 'Tambah Pengguna Lain',
            user: 'Pengguna',
            role: 'Peranan',
            selectRole: 'Pilih Peranan',
            username: 'Nama Pengguna',
            email: 'Emel',
            password: 'Kata Laluan',
            confirmPassword: 'Sahkan Kata Laluan',
            passwordsNotMatch: 'Kata laluan tidak sepadan',
            delete: 'Padam',
            submit: 'Hantar',
            allFieldsFilled: 'Sila pastikan semua medan diisi.',
            passwordsnotMatch: 'Kata laluan tidak sepadan dalam satu atau lebih entri.',
            employeesAdded: 'Pekerja berjaya ditambah!',
            errorAddingEmployees: 'Ralat menambah pekerja: ',
            failedToAddEmployees: 'Gagal menambah pekerja. '
        },
        '中文': {
            addUser: '添加更多用户',
            user: '用户',
            role: '角色',
            selectRole: '选择角色',
            username: '用户名',
            email: '电子邮件',
            password: '密码',
            confirmPassword: '确认密码',
            passwordsNotMatch: '密码不匹配',
            delete: '删除',
            submit: '提交',
            allFieldsFilled: '请确保所有字段都已填写。',
            passwordsnotMatch: '一个或多个条目中的密码不匹配。',
            employeesAdded: '成功添加员工！',
            errorAddingEmployees: '添加员工时出错：',
            failedToAddEmployees: '无法添加员工。'
        }
    }

    const [employeeData, setEmployeeData] = useState([{
        sectionId: Date.now(),
        role: "",
        username: "",
        email: "",
        password: "",
        repeatPassword: "",
        department: null, 
        designation: null 
    }]);

    const platformCtx = useContext(PlatformContext);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get("/roles-permissions");
                const data = response.data;
    
                const filteredRoles = data.roles.filter(role => role._id.toString() !== '65fb145ef0ce3f17e0d9a105');
    
                setRoles(filteredRoles);
            } catch (e) {
                console.error(e);
            }
        };
    
        fetchRoles().then(() => {
            console.log("Fetched roles");
        });
    }, []);

    function handleSectionAdd() {
        setEmployeeData([...employeeData, {
            sectionId: Date.now(),
            role: "",
            username: "",
            email: "",
            password: "",
            department: null,
            designation: null 
        }]);
    }

    function handleSectionDelete(sectionId) {
        setEmployeeData(employeeData.filter(e => e.sectionId !== sectionId));
    }

    function searchBySectionId(sectionId) {
        return employeeData.findIndex(e => e.sectionId === sectionId);
    }

    function handleSectionDataChange(index, object) {
        setEmployeeData(employeeData.map((e, i) => i === index ? {...e, ...object} : e));
    }

    function handleSubmit() {
        // Check if all fields are filled and passwords match
        const allFieldsFilled = employeeData.every(employee => employee.username && employee.email && employee.password && employee.role);
        const allPasswordsMatch = employeeData.every(employee => employee.password === employee.repeatPassword);

        if (!allFieldsFilled) {
            platformCtx.setAlert({type: "error", message: languageMap[platformCtx.language].allFieldsFilled});
            return;
        }

        if (!allPasswordsMatch) {
            platformCtx.setAlert({type: "error", message: languageMap[platformCtx.language].passwordsnotMatch});
            return;
        }
    
        // Prepare data to be sent to the server
        const usersToSend = employeeData.map(({ confirmPassword, sectionId, ...data }) => ({
            ...data,
            password: data.password,
            role: data.role
        }));
    
        // Post data to the server
        axios.post('/add-user', { users: usersToSend })
            .then(response => {
                if (response.data.success) {
                    platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].employeesAdded});
                    setEmployeeData([{ // Reset the form to initial state with one empty user form
                        sectionId: Date.now(),
                        role: "",
                        username: "",
                        email: "",
                        password: "",
                        repeatPassword: "",
                        department: null, 
                        designation: null 
                    }]);
                    if (onUpdateSuccess) {
                        onUpdateSuccess();
                    }
                    onSubmit?.();
                } else {
                    platformCtx.setAlert({type: "error", message: languageMap[platformCtx.language].errorAddingEmployees + (response.data.message || 'Unknown error')});
                }
            })
            .catch(error => {
                console.error('Failed to add employees:', error);
                const errorMessage = error.response?.data?.message || error.message;
                platformCtx.setAlert({type: "error", message: languageMap[platformCtx.language].failedToAddEmployees + errorMessage});
            });
    }
    
    return (
        <div className="flex flex-col w-full h-full">
            <div className="text-right">
                {/* Add More User Button */}
                <Button colorType="secondary" onClick={handleSectionAdd}>
                    <div className="flex flex-row items-center justify-center">
                        <span className="material-icons">add</span>
                        <span className="font-medium">{languageMap[platformCtx.language].addUser}</span>
                    </div>
                </Button>
            </div>
            {/* Modal Content */}
            <div>
                {/* Users Tabs */}
                <Tab
                    tabs={employeeData.map((_, index) => `${languageMap[platformCtx.language].user} #${(index + 1).toString()}`)}
                    activeTabIndex={0}
                    body={employeeData.map((employee, index) => {
                        const sectionIndex = searchBySectionId(employee.sectionId);
                        return (
                            <div key={`${index}-tab`} className="flex flex-col gap-6">
                                {/* First Row */}
                                <div>
                                    {/* Role Select */}
                                    <label htmlFor="role" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].role}:</label>
                                    <select
                                        id="role"
                                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                        value={employeeData[sectionIndex].role}
                                        onChange={(event) => handleSectionDataChange(sectionIndex, {role: event.target.value})}
                                    >
                                        <option value="">{languageMap[platformCtx.language].selectRole}</option>
                                        {roles.map
                                            (role => 
                                                <option 
                                                    key={role._id}
                                                    value={role._id}
                                                >
                                                    {role.name}
                                                </option>
                                            )
                                        }
                                    </select>
                                </div>
                                {/* Second Row */}
                                <div className="flex flex-wrap gap-x-6">
                                    {/* Username Input */}
                                    <div className="flex flex-col md:flex-1 w-full">
                                        <label htmlFor="username" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].username}:</label>
                                        <input
                                            id="username"
                                            type="text"
                                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            value={employeeData[sectionIndex].username}
                                            placeholder="Enter Username"
                                            onChange={(event) => handleSectionDataChange(sectionIndex, {username: event.target.value})}
                                        />
                                    </div>
                                    {/* Email Input */}
                                    <div className="flex flex-col md:flex-1 w-full">
                                        <label htmlFor="email" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].email}:</label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            value={employeeData[sectionIndex].email}
                                            placeholder="Enter Email"
                                            onChange={(event) => handleSectionDataChange(sectionIndex, {email: event.target.value})}
                                        />
                                    </div>
                                </div>
                                {/* Third Row */}
                                <div className="flex flex-wrap gap-x-6">
                                    {/* Password Input */}
                                    <div className="flex flex-col md:flex-1 w-full">
                                        <label htmlFor="password" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].password}:</label>
                                        <input
                                            id="password"
                                            type="password"
                                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            value={employeeData[sectionIndex].password}
                                            placeholder="Enter Password"
                                            onChange={(event) => handleSectionDataChange(sectionIndex, {password: event.target.value})}
                                        />
                                    </div>
                                    {/* Confirm Password Input */}
                                    <div className="flex flex-col md:flex-1 w-full">
                                        <label htmlFor="confirm-password" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].confirmPassword}:</label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            value={employeeData[sectionIndex].repeatPassword}
                                            placeholder="Confirm Password"
                                            onChange={(event) => handleSectionDataChange(sectionIndex, {repeatPassword: event.target.value})}
                                        />
                                        {(employeeData[sectionIndex].password !== employeeData[sectionIndex].repeatPassword) && (
                                            <p className="text-red-500 text-sm">{languageMap[platformCtx.language].passwordsNotMatch}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap justify-between gap-x-6">
                                    <Button colorType="danger" onClick={() => handleSectionDelete(employee.sectionId)}>
                                        <span className="flex items-center">
                                            <span className="material-icons">delete</span>
                                            <span className="font-medium">{languageMap[platformCtx.language].delete}</span>
                                        </span>
                                    </Button>
                                    <Button colorType="primary" className="font-medium" onClick={handleSubmit}>{languageMap[platformCtx.language].submit}</Button>
                                </div>
                            </div>
                        );
                    })}
                />
            </div>
        </div>
    )
}

export default AddEmployee;