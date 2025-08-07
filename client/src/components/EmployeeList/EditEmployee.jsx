import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PlatformContext } from "../Layout/PlatformLayout.jsx";
import Button from "../Button.jsx";
import { AuthenticationContext } from "../Provider/AuthenticationProvider.jsx";

function EditEmployee({ employee, onClose, onUpdateSuccess }) {
    // Language Settings
    const languageMap = {
        English: {
            username: "Username",
            fullname: "Full Name",
            email: "Email",
            phone: "Phone",
            role: "Role",
            department: "Department",
            designationJobGrade: "Designation and Job Grade",
            selectDesignationJobGrade: "Select Designation and Job Grade",
            birthday: "Birthday",
            address: "Address",
            gender: "Gender",
            profilePicture: "Profile Picture",
            saveChanges: "Save Changes",
            editDetails: "Edit Details",
            selectGender: "Select Gender",
            selectDepartment: "Select Department",
            male: "Male",
            female: "Female",
            other: "Other",
            remove: "Remove",
            dropdownDataError: "Failed to load data. Please try again.",
            employeeUpdatedSuccess: "Employee updated successfully!",
            updateEmployeeFailed: "Failed to update employee.",
        },
        'Bahasa Melayu': {
            username: "Nama pengguna",
            fullname: "Nama lengkap",
            email: "E-mel",
            phone: "Telefon",
            role: "Peranan",
            department: "Jabatan",
            designationJobGrade: "Jawatan dan Gred Kerja",
            selectDesignationJobGrade: "Pilih Jawatan dan Gred Kerja",
            birthday: "Tarikh lahir",
            address: "Alamat",
            gender: "Jantina",
            profilePicture: "Gambar profil",
            saveChanges: "Simpan Perubahan",
            editDetails: "Edit Butiran",
            selectGender: "Pilih Jantina",
            selectDepartment: "Pilih Jabatan",
            male: "Lelaki",
            female: "Perempuan",
            other: "Lain-lain",
            remove: "Buang",
            dropdownDataError: "Gagal memuatkan data dropdown. Sila cuba lagi.",
            employeeUpdatedSuccess: "Pekerja berjaya dikemaskini!",
            updateEmployeeFailed: "Gagal mengemas kini pekerja.",
        },
        中文: {
            username: "用户名",
            fullname: "全名",
            email: "电子邮件",
            phone: "电话",
            role: "角色",
            department: "部门",
            designationJobGrade: "职位和工作等级",
            selectDesignationJobGrade: "选择职位和工作等级",
            birthday: "生日",
            address: "地址",
            gender: "性别",
            profilePicture: "个人资料图片",
            saveChanges: "保存更改",
            editDetails: "编辑详细信息",
            selectGender: "选择性别",
            selectDepartment: "选择部门",
            male: "男",
            female: "女",
            other: "其他",
            remove: "删除",
            dropdownDataError: "加载下拉数据失败。请再试一次。",
            employeeUpdatedSuccess: "员工更新成功！",
            updateEmployeeFailed: "更新员工失败。",
        }
    };

    const [formData, setFormData] = useState({
        employeeId: '', 
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        combinedDesignationJobGrade: '',
        birthday: '',
        address: '',
        gender: '',
        profilePicture: null
    });
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allDesignations, setAllDesignations] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [combinedDesignationJobGrades, setCombinedDesignationJobGrades] = useState([]);
    const { isAuthenticated, hasPermission } = useContext(AuthenticationContext);
    const platformCtx = useContext(PlatformContext);
    const currentLanguageMap = languageMap[platformCtx.language];

    useEffect(() => {
        setFormData({
            employeeId: employee.employeeId || '',
            username: employee.username || '',
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            role: employee.role?._id || '',
            department: employee.department?._id || '',
            combinedDesignationJobGrade: employee.designation && employee.jobGrade ? `${employee.designation._id}:${employee.jobGrade._id}` : '',
            birthday: employee.birthday ? new Date(employee.birthday).toISOString().split('T')[0] : '',
            address: employee.address || '',
            gender: employee.gender || '',
            profilePicture: employee.profilePicturePath || null
        });
        fetchDropdownData();
    }, [employee]);

    const fetchDropdownData = async () => {
        try {
            const response = await axios.get("/employees-list");
            const data = response.data;
            setRoles(data.roles);
            setDepartments(data.departments);
            setAllDesignations(data.designations);

            const combinedData = data.designations.map(designation => ({
                designationId: designation._id,
                designationName: designation.name,
                jobGrades: data.jobGrades
                    .filter(jg => jg.designation === designation._id)
                    .map(jg => ({ jobGradeId: jg._id, jobGradeName: jg.jobGradeName }))
            }));

            setCombinedDesignationJobGrades(combinedData);

            if (employee.department) {
                filterDesignations(employee.department._id, data.designations);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            platformCtx.setAlert({
                type: "error",
                message: currentLanguageMap['dropdownDataError']
            });
        }
    };

    const filterDesignations = (departmentId, allDesignationsList = allDesignations) => {
        const filtered = allDesignationsList.filter(designation => designation.department === departmentId);
        setDesignations(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'department') {
            filterDesignations(value);
            if (value === '') {
                setFormData(prev => ({
                    ...prev,
                    combinedDesignationJobGrade: ''
                }));
            }
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
    
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && key !== 'profilePicture' && key !== 'combinedDesignationJobGrade') {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Separate designation and job grade before sending to backend
        if (formData.combinedDesignationJobGrade) {
            const [designationId, jobGradeId] = formData.combinedDesignationJobGrade.split(':');
            formDataToSend.append('designation', designationId);
            formDataToSend.append('jobGrade', jobGradeId);
        }
    
        if (formData.profilePicture instanceof File) {
            formDataToSend.append('profilePicture', formData.profilePicture, formData.profilePicture.name);
        } else if (formData.profilePicture === null) {
            formDataToSend.append('profilePicture', '');
        }
    
        try {
            const response = await axios.post("/update-user", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                platformCtx.setAlert({ type: "success", message: currentLanguageMap['employeeUpdatedSuccess'] });
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
                onClose();
            } else {
                throw new Error(response.data.message || currentLanguageMap['updateEmployeeFailed']);
            }
        } catch (error) {
            console.error(currentLanguageMap['updateEmployeeFailed'], error);
            platformCtx.setAlert({ type: "error", message: currentLanguageMap['updateEmployeeFailed'] + error.message });
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="flex flex-col gap-6">
                {/* Profile Picture Containter */}
                {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                    <div className="flex flex-col">
                        <label htmlFor="profilePicture" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.profilePicture : ''}</label>
                        <div className="p-3 flex gap-x-4 ring-1 ring-inset ring-gray-300 rounded-lg">
                            {/* Profile Picture */}
                            {formData.profilePicture && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={
                                            typeof formData.profilePicture === 'string'
                                                ? formData.profilePicture
                                                : URL.createObjectURL(formData.profilePicture)
                                        }
                                        alt="Profile"
                                        className="w-28 h-28 border border-gray-300 rounded-full object-cover"
                                        onLoad={() => typeof formData.profilePicture === 'object' && URL.revokeObjectURL(formData.profilePicture)}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col justify-center gap-y-3">
                                {/* Choose File Button */}
                                <input
                                    name="profilePicture"
                                    id="profilePicture"
                                    type="file"
                                    className="text-gray-900 bg-white hover:bg-gray-50 font-medium text-sm rounded-sm focus:outline-none"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {/* Remove Picture Button */}
                                {formData.profilePicture && (
                                    <div className="inline-block">
                                        <Button
                                            type="button"
                                            className="flex font-medium"
                                            onClick={() => setFormData({ ...formData, profilePicture: null })}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                            <span>{currentLanguageMap['remove']}</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-4">
                    {/* Username Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_admin') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="username" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.username : ''}</label>
                            <input
                                name='username'
                                id="username"
                                type="text"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    {/* Full Name Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="name" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.fullname : ''}</label>
                            <input
                                name='name'
                                id="name"
                                type="text"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Email Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_admin') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="email" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.email : ''}</label>
                            <input
                                name='email'
                                id="email"
                                type="email"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    {/* Phone Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="phone" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.phone : ''}</label>
                            <input
                                name='phone'
                                id="phone"
                                type="tel"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Role Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_admin') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="role" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.role : ''}</label>
                            <select
                                name="role"
                                id="role"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.role}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Role</option>
                                {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
                            </select>
                        </div>
                    )}
                    {/* Department Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.department : ''}</label>
                            <select
                                name="department"
                                id="department"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.department}
                                onChange={handleInputChange}
                            >
                                <option value="">{currentLanguageMap['selectDepartment']}</option>
                                {departments.map(department => <option key={department._id} value={department._id}>{department.departmentName}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Designation and Job Grade Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="combinedDesignationJobGrade" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.designationJobGrade : ''}</label>
                            <select
                                name="combinedDesignationJobGrade"
                                id="combinedDesignationJobGrade"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.combinedDesignationJobGrade}
                                onChange={handleInputChange}
                            >
                                <option value="">{currentLanguageMap['selectDesignationJobGrade']}</option>
                                {combinedDesignationJobGrades
                                    .filter(({ designationId }) => designations.some(des => des._id === designationId))
                                    .map(({ designationId, designationName, jobGrades }) =>
                                        jobGrades.map(jobGrade => (
                                            <option key={`${designationId}:${jobGrade.jobGradeId}`} value={`${designationId}:${jobGrade.jobGradeId}`}>
                                                {`${designationName} (G${jobGrade.jobGradeName})`}
                                            </option>
                                        ))
                                    )
                                }
                            </select>
                        </div>
                    )}
                    {/* Birthday Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="birthday" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.birthday : ''}</label>
                            <input
                                name='birthday'
                                id="birthday"
                                type="date"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.birthday}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Address Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="address" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.address : ''}</label>
                            <input
                                name='address'
                                id="address"
                                type="text"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    {/* Gender Input */}
                    {isAuthenticated && hasPermission('edit_all', 'edit_hr') && (
                        <div className="flex flex-col md:flex-1">
                            <label htmlFor="gender" className="inline-block py-[7px] text-sm font-medium">{currentLanguageMap ? currentLanguageMap.gender : ''}</label>
                            <select
                                name="gender"
                                id="gender"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="">{currentLanguageMap['selectGender']}</option>
                                <option value="Male">{currentLanguageMap['male']}</option>
                                <option value="Female">{currentLanguageMap['female']}</option>
                                <option value="Other">{currentLanguageMap['other']}</option>
                            </select>
                        </div>
                    )}
                </div>
                {/* Submit Button */}
                <div className="text-right font-medium">
                    <Button colorType={"dark"} type="submit">{currentLanguageMap ? currentLanguageMap.saveChanges : ''}</Button>
                </div>
            </div>
        </form>
    );
}

export default EditEmployee;
