import {useState, useEffect, useContext, useRef} from 'react';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Modal from "./Modal";
import {Link} from 'react-router-dom';
import Table from "./Table.jsx";
import CreatePerformanceAppraisal from "./CreatePerformanceAppraisal.jsx";
import axios from "axios";
import DeleteAppraisal from "./DeleteAppraisal.jsx";
import SearchQuery from "./SearchQuery.jsx";

const PerformanceAppraisal = () => {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            // Page Title
            performanceAppraisal: "Performance Appraisal",
            home: "Home",
            // Breadcrumbs
            breadcrumbHome: "Home",
            breadcrumbPerformanceAppraisal: "Performance Appraisal",
            // Search Input
            searchInput: "Performance Appraisal",
            // Button
            addAppraisal: "Add Appraisal",
            // Table Header
            employeeId: "Employee ID",
            employeeName: "Employee Name",
            department: "Department",
            designation: "Designation",
            categories: "Know How/Problem Solving/Accountability",
            totalScore: "Total Score",
            appraisalDate: "Appraisal Date",
            action: "Action",
        },
        'Bahasa Melayu': {
            // Page Title
            performanceAppraisal: "Penilaian Prestasi",
            // Breadcrumbs
            breadcrumbHome: "Laman Utama",
            breadcrumbPerformanceAppraisal: "Penilaian Prestasi",
            // Search Input
            searchInput: "Penilaian Prestasi",
            // Button
            addAppraisal: "Tambah Penilaian",
            // Table Header
            employeeId: "ID Pekerja",
            employeeName: "Nama Pekerja",
            department: "Jabatan",
            designation: "Jawatan",
            categories: "Pengetahuan/Penyelesaian Masalah/Keberkesanan",
            totalScore: "Jumlah Markah",
            appraisalDate: "Tarikh Penilaian",
            action: "Tindakan",
        },
        '中文': {
            // Page Title
            performanceAppraisal: "绩效评估",
            // Breadcrumbs
            breadcrumbHome: "首页",
            breadcrumbPerformanceAppraisal: "绩效评估",
            // Search Input
            searchInput: "绩效评估",
            // Button
            addAppraisal: "添加评估",
            // Table Header
            employeeId: "员工编号",
            employeeName: "员工姓名",
            department: "部门",
            designation: "职位",
            categories: "知识技能/解决问题/责任感",
            totalScore: "总分",
            appraisalDate: "评估日期",
            action: "操作",
        }                   
    };

    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);
    const [appraisals, setAppraisals] = useState([]);
    const [filterList, setFilterList] = useState([]);
    const modalRef = useRef();
    const tableRef = useRef();

    const handleModalOpen = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        modalRef.current?.openModal();
    };

    const handleResponse = (response) => {
        platformCtx.setAlert({type: response.success ? "success" : "danger", message: response.message});
        modalRef.current?.closeModal();
    }

    const handleSearchQuery = (query) => {
        setFilterList((prev) => {
            let newQuery = [...prev, query];

            let queryStr = newQuery.map(q => `${q.key}:${q.value}`).join(",");

            tableRef.current?.searchMultiple(queryStr);

            return newQuery;
        });
    }

    const handleDeleteQuery = (index) => {
        setFilterList((prev) => {
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
        platformCtx.setPage(languageMap[platformCtx.language].performanceAppraisal);
        platformCtx.setBreadcrumb([
            {name: languageMap[platformCtx.language].breadcrumbHome, path: "/"},
            {name: languageMap[platformCtx.language].breadcrumbPerformanceAppraisal, path: "/performance-appraisal"}
        ]);
    }, []);

    useEffect(() => {
        const getPerformanceAppraisals = async () => {
            try {
                const response = await axios.get("/get-appraisals-list");

                const data = response.data;

                if (data.success) {
                    setAppraisals(data.appraisals);
                } else {
                    console.error(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        }

        getPerformanceAppraisals().then(() => {
            console.log("Got appraisals data");
        });
    }, []);

    return (
        <div>
            {/* Page Header */}
            <div className="mb-[16px] flex items-center">
                <div className="ml-auto">
                    {/* Add Appraisal Button */}
                    <button
                        className="px-[12px] py-[6px] text-white bg-red-500 bg-opacity-80 rounded-md ring-1 ring-inset ring-red-400 shadow-sm"
                        onClick={() => handleModalOpen("Add Appraisal", <CreatePerformanceAppraisal/>)}>
                        <span className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <span className="font-medium">{languageMap[platformCtx.language].addAppraisal}</span>
                        </span>
                    </button>
                </div>
                {/* Modal Title */}
                <Modal ref={modalRef} title={modalTitle}>{modalContent}</Modal>
            </div>
            {/* Page Content */}
            <div className="flex flex-col gap-y-4">
                {/* Search Tool */}
                <div className="w-full">
                    <SearchQuery
                        selections={["Employee ID", "Employee Name", "Department", "Designation"]}
                        data={filterList}
                        onSaved={handleSearchQuery}
                        onDelete={handleDeleteQuery}
                    />
                </div>
                {/* Table */}
                <Table
                    ref={tableRef}
                    header={["#", `${languageMap[platformCtx.language].employeeId}`, `${languageMap[platformCtx.language].employeeName}`, `${languageMap[platformCtx.language].department}`, `${languageMap[platformCtx.language].designation}`, `${languageMap[platformCtx.language].categories}`, `${languageMap[platformCtx.language].totalScore}`, `${languageMap[platformCtx.language].appraisalDate}`, `${languageMap[platformCtx.language].action}`]}
                    data={appraisals.length > 0 ? appraisals.map((appraisal, index) => [
                        index + 1,
                        appraisal.employeeDetails.employeeId,
                        appraisal.employeeDetails.name,
                        appraisal.employeeDetails.department,
                        appraisal.employeeDetails.designation,
                        [
                            `${appraisal.stats.knowHow.percentageScore}%`,
                            `${appraisal.stats.problemSolving.percentageScore}%`,
                            `${appraisal.stats.accountability.percentageScore}%`,
                        ].join(" / "),
                        `${appraisal.stats.totalScore}% (${appraisal.stats.grade})`,
                        new Date(appraisal.appraisalDate).toLocaleString(platformCtx.language === 'English' ? "en-my" : platformCtx.language === 'Bahasa Melayu' ? "ms-MY" : "zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }),
                        <div className="flex flex-row gap-4 text-sm">
                            <Link to={`/view-appraisal/${appraisal._id}`} className="text-blue-500"><span className="material-icons text-black">visibility</span></Link>
                            <Link to={`/performance-evaluation/${appraisal._id}`} className="text-blue-500"><span className="material-icons text-black">edit</span></Link>
                            <span 
                                className="material-icons text-red-500 cursor-pointer"
                                onClick={() => handleModalOpen(
                                    "Delete Appraisal", 
                                    <DeleteAppraisal
                                        performanceAppraisal={appraisal} 
                                        onSubmit={handleResponse}
                                    />
                                )}
                            >delete</span>
                        </div>
                    ]) : []}
                />
            </div>
        </div>
    );
};

export default PerformanceAppraisal;