import React, { useState, useEffect, useContext, useRef } from 'react';
import { PlatformContext } from "./Layout/PlatformLayout.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal";
import axios from "axios";
import Table from "./Table.jsx";

const Departments = () => {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            home: 'Home',
            departments: 'Departments',
            departmentName: 'Department Name',
            enterDepartmentName: 'Enter Department Name',
            saveChanges: 'Save Changes',
            addDepartmentSuccess: 'Department added successfully!',
            addDepartmentError: 'Failed adding department: ',
            editDepartmentSuccess: 'Department edited successfully!',
            editDepartment: 'Edit Department',
            editDepartmentError: 'Failed editing department: ',
            editDepartmentExist: 'Failed to save changes, Department already exist!',
            deleteDepartmentSuccess: 'Department deleted successfully',
            deleteDepartmentError: 'Failed to delete department',
            deleteDepartment: 'Delete Department',
            departmentExists: 'Department already exists!',
            confirmDelete: 'Are you sure?',
            delete: 'Delete',
            addDepartment: 'Add Department',
            submit: 'Submit',
            action: 'Action'
        },
        'Bahasa Melayu': {
            home: 'Laman Utama',
            departments: 'Jabatan',
            departmentName: 'Nama Jabatan',
            enterDepartmentName: 'Masukkan Nama Jabatan',
            saveChanges: 'Simpan Perubahan',
            addDepartmentSuccess: 'Jabatan berjaya ditambah!',
            addDepartmentError: 'Gagal menambah jabatan: ',
            editDepartmentSuccess: 'Jabatan berjaya diedit!',
            editDepartment: 'Edit Jabatan',
            editDepartmentError: 'Gagal mengedit jabatan: ',
            editDepartmentExist: 'Gagal membuat perubahan, Jabatan sudah wujud!',
            deleteDepartmentSuccess: 'Jabatan berjaya dipadam',
            deleteDepartmentError: 'Gagal memadam jabatan',
            deleteDepartment: 'Padam Jabatan',
            departmentExists: 'Jabatan sudah wujud!',
            confirmDelete: 'Adakah anda pasti?',
            delete: 'Padam',
            addDepartment: 'Tambah Jabatan',
            submit: 'Hantar',
            action: 'Tindakan'
        },
        '中文': {
            home: '首页',
            departments: '部门',
            departmentName: '部门名称',
            enterDepartmentName: '输入部门名称',
            saveChanges: '保存更改',
            addDepartmentSuccess: '成功添加部门！',
            addDepartmentError: '添加部门时出错：',
            editDepartmentSuccess: '成功编辑部门！',
            editDepartmentError: '编辑部门时出错：',
            editDepartmentExist: '无法保存更改，部门已存在！',
            deleteDepartmentSuccess: '成功删除部门',
            editDepartment: '编辑部门',
            deleteDepartmentError: '删除部门失败',
            deleteDepartment: '删除部门',
            departmentExists: '部门已经存在！',
            confirmDelete: '您确定吗？',
            delete: '删除',
            addDepartment: '添加部门',
            submit: '提交',
            action: '操作'
        }
    };
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    // Breadcrumbs Handling
    useEffect(() => {
        platformCtx.setPage(languageMap[platformCtx.language].departments);
        platformCtx.setBreadcrumb([
            {name: languageMap[platformCtx.language].home},
            {name: languageMap[platformCtx.language].departments, path: "/departments"}
        ]);
    }, [platformCtx.language]);

    // Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const modalRef = useRef();
    
    const handleModalOpen = (content, title) => {
        setModalContent(() => content);
        setModalTitle(title);
        modalRef.current?.openModal();
    };

    // Run when loading change
    useEffect(() => {
        // Get departments
        const getData = async function() {
            const response = await axios.get("/departments");

            // JSON res in "data"
            const data = response.data;

            // Output
            return data;
        }

        getData().then((data) => {
            setLoading(false);
            // Log data into console
            setDepartments(data.departments);
        });
    }, [loading]);

    // Add Department Modal Content
    function AddDepartmentModal() {
        const [newDepartment, setNewDepartment ]= useState('');
        const platformCtx = useContext(PlatformContext);

        return (
            // Modal Content
            <div className="flex flex-col gap-6">
                {/* Department Name Input */}
                <div>
                    <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentName}:</label>
                    <input
                        onChange={(e) => setNewDepartment(() => e.target.value)}
                        value={newDepartment}
                        type="text" id="department"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        placeholder={languageMap[platformCtx.language].enterDepartmentName}
                    />
                </div>
                {/* Submit Button */}
                <div className="text-right font-medium">
                    <Button onClick={() => handleAddDeparment(newDepartment)}><span>{languageMap[platformCtx.language].submit}</span></Button>
                </div>
            </div>
        );
    }

    // Add Department Data Handling
    const handleAddDeparment = async (departmentName) => {
        // Check if department already exists
        const existingDepartment = departments.find(dep => dep.departmentName.toLowerCase() === departmentName.toLowerCase());

        if (existingDepartment) {
            platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].departmentExists});
            return;
        }

        try {
            const response = await axios.post("/department/add", {
                departmentName: departmentName
            });

            // JSON res in "data"
            const data = response.data;

            //If data successful, make a success alert
            if(data.success) {
                platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].addDepartmentSuccess});
            }
            else platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].addDepartmentError + data.message});

            // Force re-render
            setLoading(true);
            modalRef.current.closeModal();
        } catch (error) {
            console.error('Error adding department:', error);
        }
    }

    // Edit Department Modal Content
    const EditDepartmentModal = ({ department, onSave }) => {
        
        // Edit Department Data Handling
        const [departmentName, setDepartmentName] = useState(department.departmentName);

        useEffect(() => {
            setDepartmentName(department.departmentName);
        }, [department]);

        const handleEditDepartment = async () => {
            try {
                const response = await axios.post("/department/edit", {
                    departmentId: department._id, // Assuming you have _id as the identifier
                    departmentName
                }, { headers: { client: 'react' } });

                const data = response.data;
                if(data.success) {
                    platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].editDepartmentSuccess});
                    onSave();
                    modalRef.current.closeModal();
                } else {
                    platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].editDepartmentError + data.message});
                }
            } catch (error) {
                console.error('Error editing department:', error);
                platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].editDepartmentExist});
            }
        };

        return (
            <div className="flex flex-col gap-6">
                {/* Department Name Input */}
                <div>
                    <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentName}:</label>
                    <input onChange={(e) => setDepartmentName(e.target.value)} value={departmentName} type="text" id="department" className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" placeholder={languageMap[platformCtx.language].enterDepartmentName} />
                </div>
                {/* Save Changes Button */}
                <div className="text-right font-medium">
                    <Button onClick={handleEditDepartment}><span>{languageMap[platformCtx.language].saveChanges}</span></Button>
                </div>
            </div>
        );
    };

    // Delete Department Data Handling
    const handleDeleteDepartment = (departmentId) => {
        const department = departments.find(dep => dep._id === departmentId);
        const onConfirm = async () => {
            try {
                const response = await axios.post("/department/delete", {
                    departmentId
                }, { headers: { client: 'react' } });

                const data = response.data;
                if (data.success) {
                    platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].deleteDepartmentSuccess});
                    setLoading(true); // to refetch the department list
                } else {
                    platformCtx.setAlert({type: "danger", message: data.message || languageMap[platformCtx.language].deleteDepartmentError});
                }
                modalRef.current.closeModal();
            } catch (error) {
                console.error('Error deleting department:', error);
                modalRef.current.closeModal();
            }
        };

        handleModalOpen(<DeleteConfirmation department={department} onConfirm={onConfirm} onCancel={() => modalRef.current.closeModal()} />, languageMap[platformCtx.language].deleteDepartment);
    };

    // Delete Department Modal Content
    function DeleteConfirmation({ department, onConfirm }) {
        const platformCtx = useContext(PlatformContext);
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                    {/* Are you sure? */}
                    <span className="w-32 h-32 inline-flex items-center justify-center bg-red-100 rounded-full">
                        <span className="material-symbols-outlined text-6xl text-red-500 text-opacity-80">warning</span>
                    </span>
                    <p className="mb-3 text-center text-2xl font-medium">{languageMap[platformCtx.language].confirmDelete}</p>
                    {/* Department Name Input */}
                    <div className="w-full">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentName}:</label>
                        <input
                            type="text"
                            id="department" 
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                            value={department.departmentName}
                            readOnly
                        />
                    </div>
                </div>
                {/* Delete Button */}
                <div className="text-right font-medium">
                    <Button onClick={onConfirm}><span>{languageMap[platformCtx.language].delete}</span></Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-auto">
            {/* Page Header */}
            <div className="mb-[1.875rem] flex items-center">
                {/* Modal */}
                <div className="ml-auto">
                    <Button colorType={"secondary"} onClick={() => handleModalOpen(<AddDepartmentModal />, languageMap[platformCtx.language].addDepartment)}>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <p className="font-medium">{languageMap[platformCtx.language].addDepartment}</p>
                        </div>
                    </Button>
                </div>
                <Modal ref={modalRef} title={modalTitle} onClose={() => setLoading(true)}>{modalContent}</Modal>
            </div>
            {/* Page Content */}
            <div>
                {/* Table */}
                <Table
                    header={["#", languageMap[platformCtx.language].departmentName, languageMap[platformCtx.language].action]}
                    data={departments.map((department, index) => {
                        return [
                            index + 1,
                            department.departmentName,
                            <div key={department.departmentId} className="flex gap-2">
                                <span 
                                    className="material-icons text-black cursor-pointer"
                                    onClick={() => handleModalOpen(<EditDepartmentModal department={department} onSave={() => setLoading(true)}/>, languageMap[platformCtx.language].editDepartment)}
                                >
                                    edit
                                </span>
                                <span className="material-icons text-red-500 cursor-pointer"onClick={() => handleDeleteDepartment(department._id)}>delete</span>
                            </div>
                        ];
                    })}
                />
            </div>
        </div>
    );
};

export default Departments;