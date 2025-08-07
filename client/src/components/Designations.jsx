import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal";
import Table from "./Table.jsx";
import AddDesignation from "./AddDesignation.jsx";
import SearchQuery from "./SearchQuery.jsx";

const Designations = () => {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            home: 'Home',
            designations: 'Designations',
            designationName: 'Designation Name',
            enterDesignationName: 'Enter Designation Name',
            departmentAssociated: 'Department Associated',
            selectDepartment: 'Select Department',
            lead: 'Lead',
            saveChanges: 'Save Changes',
            addDesignation: 'Add Designation',
            editDesignation: 'Edit Designation',
            deleteDesignation: 'Delete Designation',
            actions: 'Actions',
            deleteConfirmation: 'Are you sure you want to delete this designation?',
            delete: 'Delete',
            designationAdded: 'Designation added successfully',
            error: 'Error',
            designationDeleted: 'Designation deleted successfully',
            deleteFailed: 'Failed to delete designation',
            fillAllFields: 'Please fill all fields before submitting.',
            designationUpdated: 'Designation updated successfully',
            designationSearch: 'Search',
        },
        'Bahasa Melayu': {
            home: 'Laman Utama',
            designations: 'Jawatan',
            designationName: 'Nama Jawatan',
            enterDesignationName: 'Masukkan Nama Jawatan',
            departmentAssociated: 'Jabatan Berkaitan',
            selectDepartment: 'Pilih Jabatan',
            lead: 'Ketua',
            saveChanges: 'Simpan Perubahan',
            addDesignation: 'Tambah Jawatan',
            editDesignation: 'Edit Jawatan',
            deleteDesignation: 'Padam Jawatan',
            actions: 'Tindakan',
            deleteConfirmation: 'Adakah anda pasti ingin memadam jawatan ini?',
            delete: 'Padam',
            designationAdded: 'Jawatan berjaya ditambah',
            error: 'Gagal',
            designationDeleted: 'Jawatan berjaya dipadam',
            deleteFailed: 'Gagal memadam jawatan',
            fillAllFields: 'Sila isi semua medan sebelum menghantar.',
            designationUpdated: 'Jawatan berjaya dikemaskini',
            designationSearch: 'Carian',

        },
        '中文': {
            home: '主页',
            designations: '职位',
            designationName: '职位名称',
            enterDesignationName: '输入职位名称',
            departmentAssociated: '相关部门',
            selectDepartment: '选择部门',
            lead: '领导',
            saveChanges: '保存更改',
            addDesignation: '添加职位',
            editDesignation: '编辑职位',
            deleteDesignation: '删除职位',
            actions: '动作',
            deleteConfirmation: '您确定要删除此职位吗？',
            delete: '删除',
            designationAdded: '职位添加成功',
            error: '错误',
            designationDeleted: '成功删除职位',
            deleteFailed: '删除职位失败',
            fillAllFields: '提交前请填写所有字段。',
            designationUpdated: '成功更新职位',
            designationSearch: "搜索",
        }
    };

    // Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const modalRef = useRef();

    const handleModalOpen = (content, title) => {
        setModalContent(content);
        setModalTitle(title);
        modalRef.current?.openModal();
    };

    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalTitle, setModalTitle] = useState('');

    // Designation Search Query Handling
    const [queries, setQueries] = useState([]);
    const tableRef = useRef();

    function handleSearchQuery(query) {
        setQueries(prev => {
            let newQuery = [...prev, query];

            let queryStr = newQuery.map(q => `${q.key}:${q.value}`).join(",");

            tableRef.current?.searchMultiple(queryStr);

            return newQuery;
        });
    }

    function handleDeleteQuery(index) {
        setQueries(prev => {
            let filtered = prev.filter((_, i) => i !== index);

            if(filtered.length === 0) {
                tableRef.current?.reset();
            } else {
                tableRef.current?.searchMultiple(filtered.map(q => `${q.key}:${q.value}`).join(","));
            }

            return filtered;
        });
    }

    useEffect(() => {
        // Breadcrumbs Handling
        platformCtx.setPage(languageMap[platformCtx.language]['designations']);
        platformCtx.setBreadcrumb([
            {name: languageMap[platformCtx.language]['home'], path: "/"},
            {name: languageMap[platformCtx.language]['designations'], path: "/designations"}
        ]);

        // Designations Data Fetch Handling
        axios.get('/designations')
            .then(response => {
                setDesignations(response.data.designations);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching designations:', error);
            });
    }, [loading]);

    const handleDepartmentSubmit = (designation) => {
        // Check if all fields are filled
        if (!designation.name || !designation.department) {
            platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].fillAllFields});
            return;
        }

        // Post the new designation to the server
        axios.post('/designation/add', designation)
            .then(response => {
                // If the post was successful, refetch the designations
                if (response.data.success) {
                    platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].designationAdded});
                    return axios.get('/designations');
                } else {
                    throw new Error(response.data.message);
                }
            })
            .then(response => {
                setDesignations(response.data.designations);
                modalRef.current?.closeModal();
            })
            .catch(error => {
                console.error(languageMap[platformCtx.language].error, error);
                platformCtx.setAlert({type: "danger", message: error.message});
            });
    };

    // Edit Designation Modal Content
    const EditDesignationModal = ({ designation, onSave, onClose }) => {
        const [designationName, setDesignationName] = useState(designation.name);
        const [department, setDepartment] = useState(designation.department ? designation.department._id : '');
        const [departments, setDepartments] = useState([]);
        const [isLead, setIsLead] = useState(designation.isLead || false);

        useEffect(() => {
            // Fetch departments from the server when the component mounts
            axios.get('/departments')
                .then(response => {
                    setDepartments(response.data.departments);
                })
                .catch(error => {
                    console.error('Error fetching departments:', error);
                });
        }, []);

        useEffect(() => {
            // Update state when designation prop changes
            setDesignationName(designation.name);
            setDepartment(designation.department._id);
            setIsLead(designation.isLead || false);
        }, [designation]);

        const handleSaveChanges = () => {
            const updatedDesignation = {
                designationId: designation._id,
                name: designationName,
                departmentId: department,
                isLead
            };
            onSave?.(updatedDesignation);
            onClose?.();
        };

        return (
            <div className="flex flex-col gap-6">
                {/* Designation Name Input */}
                <div className="flex flex-col">
                    <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language]['designationName']}</label>
                    <input 
                        type="text" 
                        id="designation"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        placeholder={languageMap[platformCtx.language]['enterDesignationName']}
                        value={designationName}
                        onChange={e => setDesignationName(e.target.value)}
                    />
                </div>
                {/* Department Associated Dropdown Button */}
                <div className="flex flex-col">
                    <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language]['departmentAssociated']}</label>
                    <div className="w-full relative inline-flex items-center">
                        <select 
                            id="department"
                            className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}>
                            <option className="rounded">
                                {languageMap[platformCtx.language]['selectDepartment']}
                            </option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                            ))}
                        </select>
                        <svg
                            className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                            aria-hidden="true" 
                            fill="none" 
                            viewBox="0 0 10 6"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </div>
                </div>
                {/* Designated Lead Checkbox */}
                <div className="flex flex-row gap-x-2">
                    <input 
                        type="checkbox"
                        checked={isLead}
                        onChange={e => setIsLead(e.target.checked)}
                    />
                    <span className="text-sm">{languageMap[platformCtx.language]['lead']}</span>
                </div>
                {/* Save Changes Button */}
                <div className="text-right font-medium">
                    <Button colorType={"dark"} onClick={handleSaveChanges}><span>{languageMap[platformCtx.language]['saveChanges']}</span></Button>
                </div>
            </div>
        )
    }

    // Edit Designation Data Handling
    const handleEditSubmit = (updatedDesignation) => {
        // Optimistically update the state
        setDesignations(prevDesignations =>
            prevDesignations.map(designation =>
                designation._id === updatedDesignation.designationId
                    ? { ...designation, name: updatedDesignation.name, department: updatedDesignation.departmentId }
                    : designation
            )
        );

        axios.post('/designation/edit', updatedDesignation)
        .then(response => {
            if (response.data.success) {
                platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].designationUpdated});
                return axios.get('/designations');
            } else {
                throw new Error(response.data.message);
            }
        })
        .then(response => {
            setDesignations(response.data.designations);
            modalRef.current?.closeModal();
        })
        .catch(error => {
            console.error(languageMap[platformCtx.language].error, error);
            platformCtx.setAlert({type: "danger", message: error.message});
            // Revert the state back to its original form if the request fails
            setDesignations(prevDesignations);
        });
    };

    // Delete Designation Modal Content
    function DeleteConfirmation({ designation, onConfirm }) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                    {/* Are you sure? */}
                    <span className="w-32 h-32 inline-flex items-center justify-center bg-red-100 rounded-full">
                        <span className="material-symbols-outlined text-6xl text-red-500 text-opacity-80">warning</span>
                    </span>
                    <p className="mb-3 text-center text-2xl font-medium">{languageMap[platformCtx.language].deleteConfirmation}</p>
                    {/* Designation Name Input */}
                    <div className="w-full">
                        <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationName}:</label>
                        <input
                            type="text"
                            id="department" 
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                            value={designation.name}
                            readOnly
                        />
                    </div>
                    {/* Department Associated Input */}
                    <div className="w-full">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentAssociated}:</label>
                        <input
                            type="text"
                            id="department" 
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                            value={designation.department ? designation.department.departmentName : 'N/A'}
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

    // Delete Designation Data Handling
    const handleDeleteDesignation = (designationId) => {
        const designation = designations.find(des => des._id === designationId);
        const onConfirm = async () => {
            try {
                const response = await axios.post("/designation/delete", {
                    designationId
                }, { headers: { client: 'react' } });

                const data = response.data;
                if (data.success) {
                    platformCtx.setAlert({type: "success", message: languageMap[platformCtx.language].designationDeleted});
                    setLoading(true); // to refetch the designation list
                } else {
                    platformCtx.setAlert({type: "danger", message: languageMap[platformCtx.language].deleteFailed});
                }
                modalRef.current.closeModal();
            } catch (error) {
                console.error('Error deleting designation:', error);
                modalRef.current.closeModal();
            }
        };

        handleModalOpen(<DeleteConfirmation designation={designation} onConfirm={onConfirm} onCancel={() => modalRef.current.closeModal()} />, languageMap[platformCtx.language].deleteDesignation);
    };

    return (
        <div className="w-auto">
            {/* Page Header */}
            <div className="mb-[1.875rem] flex items-center">
                {/* Modal */}
                <div className="ml-auto">
                    <Button colorType={"secondary"} onClick={() => handleModalOpen(<AddDesignation
                        onSubmit={handleDepartmentSubmit}/>, languageMap[platformCtx.language]['addDesignation'])}>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <p className="font-medium">{languageMap[platformCtx.language]['addDesignation']}</p>
                        </div>
                    </Button>
                </div>
                <Modal ref={modalRef} title={modalTitle}>{modalContent}</Modal>
            </div>
            {/* Page Content */}
            <div className="flex flex-col gap-4">
                <div>
                    {/* Search Input */}
                    <label htmlFor="designation" className="inline-block py-[7px] text-xs font-bold">{languageMap[platformCtx.language].designationSearch}:</label>
                    <SearchQuery
                        selections={[languageMap[platformCtx.language]['designationName'], languageMap[platformCtx.language]['departmentAssociated']]}
                        data={queries}
                        onSaved={handleSearchQuery}
                        onDelete={handleDeleteQuery}
                    />
                </div>
                {/* Table */}
                <Table
                    ref={tableRef}
                    header={["#", languageMap[platformCtx.language]['designationName'], languageMap[platformCtx.language]['departmentAssociated'], languageMap[platformCtx.language]['actions']]}
                    data={designations.map((designation, index) => {
                        return [
                            index + 1,
                            designation.name,
                            designation.department ? designation.department.departmentName : 'N/A',
                            <div key={designation.designationId} className="flex gap-2">
                                <span 
                                    className="material-icons text-black cursor-pointer"
                                    onClick={
                                        () => handleModalOpen(<EditDesignationModal 
                                        designation={designation}
                                        onSave={handleEditSubmit}
                                        modalRef={modalRef}
                                        setLoading={setLoading}/>, 
                                        languageMap[platformCtx.language]['editDesignation'])
                                    }>
                                    edit
                                </span>
                                <span className="material-icons text-red-500 cursor-pointer" onClick={() => handleDeleteDesignation(designation._id)}>delete</span>
                            </div>
                        ];
                    })}
                />
            </div>
        </div>
    );
};

export default Designations;