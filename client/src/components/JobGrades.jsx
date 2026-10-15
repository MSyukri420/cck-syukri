import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal";
import Table from "./Table.jsx";
import AddJobGradeModal from "./AddJobGradeModal.jsx";
import EditJobGradeModal from "./EditJobGradeModal.jsx";


const JobGrades = () => {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            jobGrades: 'Job Grades',
            home: 'Home',
            deleteConfirmation: 'Are you sure you want to delete this job grade?',
            jobGrade: 'Job Grade',
            designationAssociated: 'Designation Associated',
            departmentAssociated: 'Department Associated',
            delete: 'Delete',
            addJobGrade: 'Add Job Grade',
            searchDepartment: 'Search Department',
            search: 'Search',
            viewJobGrade: 'View Job Grade',
            editJobGrade: 'Edit Job Grade',
            jobGradeDeleted: 'Job grade deleted successfully',
            deleteJobGradeFailed: 'Failed to delete job grade',
            deleteJobGrade: 'Delete Job Grade',
            details: 'Details',
            attributeCategory: 'Attribute Category',
            jobGradePercentageCarry: 'Job Grade Percentage Carry',
            knowHow: 'Know How',
            problemSolving: 'Problem Solving',
            accountability: 'Accountability',
            action: 'Action'
        },
        'Bahasa Melayu': {
            jobGrades: 'Gred Jawatan',
            home: 'Laman Utama',
            deleteConfirmation: 'Adakah anda pasti ingin memadam gred jawatan ini?',
            designationAssociated: 'Jawatan Berkaitan',
            departmentAssociated: 'Jabatan Berkaitan',
            delete: 'Padam',
            addJobGrade: 'Tambah Gred Jawatan',
            searchDepartment: 'Cari Jabatan',
            search: 'Cari',
            viewJobGrade: 'Butiran Gred Jawatan',
            editJobGrade: 'Edit Gred Jawatan',
            jobGradeDeleted: 'Gred pekerjaan berjaya dipadam',
            deleteJobGradeFailed: 'Gagal memadam gred jawatan',
            deleteJobGrade: 'Padam Gred Pekerjaan',
            details: 'Butiran',
            attributeCategory: 'Kategori Atribut',
            jobGradePercentageCarry: 'Jumlah Keseluruhan Pembawaan Peratusan Gred Jawatann',
            knowHow: 'Pengetahuan',
            problemSolving: 'Penyelesaian Masalah',
            accountability: 'Tanggungjawab',
            action: 'Tindakan'
        },
        '中文': {
            jobGrades: '工作等级',
            home: '主页',
            deleteConfirmation: '您确定要删除此工作等级吗？',
            designationAssociated: '相关职位',
            departmentAssociated: '相关部门',
            delete: '删除',
            addJobGrade: '添加工作等级',
            searchDepartment: '搜索部门',
            search: '搜索',
            viewJobGrade: '查看职位详情',
            editJobGrade: '编辑工作等级',
            jobGradeDeleted: '成功删除工作等级',
            deleteJobGradeFailed: '删除工作等级失败',
            deleteJobGrade: '删除工作等级',
            details: '详情',
            attributeCategory: '属性类别',
            jobGradePercentageCarry: '工作等级百分比',
            knowHow: '专业知识',
            problemSolving: '解决问题',
            accountability: '责任',
            action: '操作'
        }
    };

    useEffect(() => {
        // Breadcrumbs Handling
        platformCtx.setPage(languageMap[platformCtx.language].jobGrades);
        platformCtx.setBreadcrumb([
            { name: languageMap[platformCtx.language].home },
            { name: languageMap[platformCtx.language].jobGrades, path: "/job-grades" }
        ]);
        
        // Screen Width Handling
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState([]);

    // Define `screenWidth`
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        // Fetch departments from your backend
        axios.get('/departments', { headers: { client: 'react' } })
            .then(response => {
                setDepartments(response.data.departments);
            })
            .catch(error => {
                console.error('Error fetching departments:', error);
            });
    }, []);

    // Job Grades Data Fetch Handling
    const [jobGrades, setJobGrades] = useState([]);

    const fetchJobGrades = async () => {
        try {
            const response = await axios.get('/jobgrades', { headers: { client: 'react' } });
            setJobGrades(response.data.jobgrades);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching job grades:', error);
            setLoading(false);
        }
    };

    const [refresh, setRefresh] = useState(false);

    // Fetch Job Grades once Component Mounts or Page Refresh
    useEffect(() => {
        fetchJobGrades();
    }, [refresh]);

    // Fetch Job Grades once Component Mounts
    useEffect(() => {
        fetchJobGrades();
    }, []);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (loading) {
            fetchJobGrades(); // Fetch job grades when loading changes
            setLoading(false); // Reset loading after fetching the data
        }
    }, [loading]);

    // Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const modalRef = useRef();

    const handleModalOpen = (content, title) => {
        setModalContent(content);
        setModalTitle(title);
        modalRef.current?.openModal();
    };    

    // View Job Grade Handling
    function ViewJobGrade({ jobGrade }) {
        const platformCtx = useContext(PlatformContext);
        return (
            <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{jobGrade.designation.name} (G{jobGrade.jobGradeName}) {languageMap[platformCtx.language].details}</h2>
                <Table
                    simple={true}
                    style={{ marginTop: '20px' }}
                    header={[languageMap[platformCtx.language].attributeCategory, languageMap[platformCtx.language].jobGradePercentageCarry]}
                    data={[
                        [languageMap[platformCtx.language].knowHow, `${jobGrade.percentageCarry.knowHow}%`],
                        [languageMap[platformCtx.language].problemSolving, `${jobGrade.percentageCarry.problemSolving}%`],
                        [languageMap[platformCtx.language].accountability, `${jobGrade.percentageCarry.accountability}%`]
                    ]}
                />
            </div>
        );
    };

    // Delete Job Grade Modal
    function DeleteConfirmation({ jobGrade, onConfirm }) {
        const platformCtx = useContext(PlatformContext);
        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4">
                    {/* Are you sure? */}
                    <span className="w-32 h-32 inline-flex items-center justify-center bg-red-100 rounded-full">
                        <span className="material-symbols-outlined text-6xl text-red-500 text-opacity-80">warning</span>
                    </span>
                    <p className="mb-3 text-center text-2xl font-medium">{languageMap[platformCtx.language].deleteConfirmation}</p>
                    {/* Job Grade Name Input */}
                    <div className="w-full">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].jobGrade}:</label>
                        <input
                            type="text"
                            id="department" 
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                            value={jobGrade.jobGradeName}
                            readOnly
                        />
                    </div>
                    {/* Designation Associated Input */}
                    <div className="w-full">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationAssociated}:</label>
                        <input
                            type="text"
                            id="department" 
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                            value={jobGrade.designation ? jobGrade.designation.name : 'N/A'}
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
                            value={jobGrade.department ? jobGrade.department.departmentName : 'N/A'}
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
    };

    // Delete Job Grade Handling
    const deleteJobGrade = (jobGradeId) => {
        const jobGrade = jobGrades.find(jg => jg._id === jobGradeId); // Find the job grade to delete

        const onConfirm = async () => {
            try {
                const deleteResponse = await axios.post('/jobgrade/delete', { jobGradeId }, { headers: { client: 'react' } });
                // The server refuses while employees still have this job grade; show its reason
                if (!deleteResponse.data.success) {
                    platformCtx.setAlert({ type: 'danger', message: deleteResponse.data.message || languageMap[platformCtx.language].deleteJobGradeFailed });
                    modalRef.current.closeModal();
                    return;
                }
                // Refetch job grades after deletion
                const response = await axios.get('/jobgrades', { headers: { client: 'react' } });
                setJobGrades(response.data.jobgrades);
                platformCtx.setAlert({ type: 'success', message: languageMap[platformCtx.language].jobGradeDeleted });
            } catch (error) {
                console.error('Error deleting job grade:', error);
                platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].deleteJobGradeFailed });
            }
            modalRef.current.closeModal();
        };

        handleModalOpen(<DeleteConfirmation jobGrade={jobGrade} onConfirm={onConfirm} onCancel={() => modalRef.current.closeModal()} />, languageMap[platformCtx.language].deleteJobGrade);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center">
                {/* Modal */}
                <div className="ml-auto">
                    {/* Add Job Grade Button */}
                    <Button colorType={"secondary"} onClick={() => handleModalOpen(<AddJobGradeModal onSave={() => {setRefresh(Date.now());}} modalRef={modalRef} />, languageMap[platformCtx.language].addJobGrade)}>
                        <div className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <p className="font-medium">{languageMap[platformCtx.language].addJobGrade}</p>
                        </div>
                    </Button>
                </div>
                {/* Modal Title */}
                <Modal ref={modalRef} title={modalTitle}>{modalContent}</Modal>
            </div>
            <div className="mb-[16px]">
                <div className="w-full grid grid-cols-12 gap-x-8 gap-y-4">
                    {/* Search Input */}
                    <div className="col-span-12 sm:col-span-6 md:col-span-3">
                        <label htmlFor="search" className="inline-block py-[7px] text-xs font-bold">{languageMap[platformCtx.language].searchDepartment}:</label>
                        <input
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={languageMap[platformCtx.language].search}
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            {/* Table */}
            <Table
                header={[
                    "#",
                    languageMap[platformCtx.language].jobGrades,
                    languageMap[platformCtx.language].designationAssociated,
                    languageMap[platformCtx.language].departmentAssociated,
                    languageMap[platformCtx.language].action
                ]}
                data={jobGrades.filter(jobGrade =>
                    jobGrade.jobGradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (jobGrade.designation && jobGrade.designation.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (jobGrade.department && jobGrade.department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((jobGrade, index) => {
                    return [
                        index + 1,
                        `G${jobGrade.jobGradeName}`,
                        jobGrade.designation ? jobGrade.designation.name : 'N/A',
                        jobGrade.department ? jobGrade.department.departmentName : 'N/A',
                        <div key={jobGrade._id} className="flex gap-2">
                        <span className="material-icons text-black cursor-pointer"
                              onClick={() => handleModalOpen(<ViewJobGrade jobGrade={jobGrade} />, languageMap[platformCtx.language].viewJobGrade)}>visibility</span>
                            <span className="material-icons text-black cursor-pointer"
                                  onClick={() => handleModalOpen(<EditJobGradeModal jobGrade={jobGrade} onSave={() => setLoading(true)} modalRef={modalRef} setLoading={setLoading}/>, languageMap[platformCtx.language].editJobGrade)}>edit</span>
                            <span className="material-icons text-red-500 cursor-pointer"
                                  onClick={() => deleteJobGrade(jobGrade._id)}>delete</span>
                        </div>
                    ];
                })}
            />
        </div>
    );
};

export default JobGrades;