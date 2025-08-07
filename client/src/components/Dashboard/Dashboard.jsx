import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { PlatformContext } from "../Layout/PlatformLayout.jsx";
import { AuthenticationContext } from "../Provider/AuthenticationProvider.jsx";
import axios from "axios";
import DepartmentChart from './DepartmentChart';
import EmployeeGrowthChart from './EmployeeGrowthChart';
import AppraisalChart from './AppraisalChart';
import Table from "../Table.jsx";
import TopPerformersChart from "./TopPerformersChart.jsx";
import Button from "../Button.jsx";
import Modal from "../Modal.jsx";
import PerformanceSurveyStatus from "../PerformanceSurvey.jsx";


const Dashboard = () => {
    // Language Settings
    const translations = {
        "English": {
            "Employees": "Employees",
            "Employee Name": "Employee Name",
            "Employee ID": "Employee ID",
            "Username": "Username",
            "Full Name": "Full Name",
            "Name": "Name",
            "Category": "Category",
            "Email": "Email",
            "Phone": "Phone",
            "Department": "Department",
            "Designation": "Designation",
            "Role": "Role",
            "View All Employees": "View All Employees",
            "View All Departments": "View All Departments",
            "View All Designations": "View All Designations",
            "view All Appraisals": "View All Appraisals",
            "view All Own Appraisals": "View All Own Appraisals",
            "view All Performance Indicators": "View All Performance Indicators",
            "Own Appraisals": "Own Appraisals",
            "performance Indicators": "Performance Indicators",
            "Appraisals": "Appraisals",
            "Know How / Problem Solving / Accountability": "Know How / Problem Solving / Accountability",
            "Total Score": "Total Score",
            "Appraisal Date": "Appraisal Date",
            "Action": "Action",
        },
        "Bahasa Melayu": {
            "Employees": "Pekerja",
            "Employee Name": "Nama Pekerja",
            "Employee ID": "ID Pekerja",
            "Username": "Nama Pengguna",
            "Full Name": "Nama Penuh",
            "Name": "Nama",
            "Category": "Kategori",
            "Email": "Emel",
            "Phone": "Telefon",
            "Department": "Jabatan",
            "Designation": "Jawatan",
            "Role": "Peranan",
            "View All Employees": "Lihat Semua Pekerja",
            "View All Departments": "Lihat Semua Jabatan",
            "View All Designations": "Lihat Semua Jawatan",
            "View All Appraisals": "Lihat Semua Penilaian",
            "View All Own Appraisals": "Lihat Semua Penilaan Sendiri",
            "View All Performance Indicators": "Lihat Semua Penunjuk Prestasi",
            "Performance Indicators": "Penunjuk Prestasi",
            "Own Appraisals": "Penilaian Sendiri",
            "Appraisals": "Penilaian",
            "Know How / Problem Solving / Accountability": "Pengetahuan / Penyelesaian Masalah / Tanggungjawab",
            "Total Score": "Markah Keseluruhan",
            "Appraisal Date": "Tarikh Penilaian",
            "Action": "Tindakan"
        },
        "中文": {
            "Employees": "员工",
            "Employee Name": "员工姓名",
            "Employee ID": "员工 ID",
            "Username": "用户名",
            "Full Name": "全名",
            "Name": "姓名",
            "Category": "类别",
            "Email": "电子邮件",
            "Phone": "电话",
            "Department": "部门",
            "Designation": "职位",
            "Role": "角色",
            "View All Employees": "查看所有员工",
            "View All Departments": "查看所有部门",
            "View All Designations": "查看所有职位",
            "View All Appraisals": "查看所有评估",
            "View All Own Appraisals": "查看所有自评",
            "View All Performance Indicators": "查看所有绩效指标",
            "Own Appraisals": "自评",
            "Performance Indicators": "绩效指标",
            "Appraisals": "评估",
            "Know How / Problem Solving / Accountability": "知识 / 解决问题 / 责任",
            "Total Score": "总分",
            "Appraisal Date": "评估日期",
            "Action": "操作"
        }
    };

    const translateKey = (key) => {
        const language = platformCtx.language || 'English'; // Default to 'English' if platformCtx.language is not defined
        return translations[language] ? translations[language][key] || key : key;
    };

    const [dashboardData, setDashboardData] = useState({
        employees: [],
        departments: [],
        designations: [],
        appraisals: [],
        ownAppraisals: [],
        attributes: [],
        surveys: [],
    });
    const [graphData, setGraphData] = useState({
        employeeCountsByDepartment: {},
        appraisalCountsByMonth: [],
        employeeGrowthData: []
    });
    const [loading, setLoading] = useState(true);
    const [graphLoading, setGraphLoading] = useState(true);
    const platformCtx = useContext(PlatformContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('');

    // Add Survey Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);
    const modalRef = useRef();

    const handleModalOpenWithSurveyStatus = (surveyId) => {
        console.log('Survey ID:', surveyId);
        setModalContent(<PerformanceSurveyStatus surveyId={surveyId} />);
        setModalTitle('Survey Status');
        modalRef.current?.openModal();
    };

    const handleModalClose = (res) => {
        setLoading(true);
        modalRef.current?.closeModal();

        if (res.success) {
            platformCtx.setAlert({ message: res.message, type: "success" });
        } else {
            platformCtx.setAlert({ message: res.message, type: "danger" });
        }
    };

    useEffect(() => {
        const pageName = platformCtx.language === 'English' ? 'Dashboard' :
            platformCtx.language === 'Bahasa Melayu' ? 'Papan Pemuka' :
                '仪表板';

        const homeName = platformCtx.language === 'English' ? 'Home' :
            platformCtx.language === 'Bahasa Melayu' ? 'Laman Utama' :
                '主页';

        platformCtx.setPage(pageName);
        platformCtx.setBreadcrumb([
            { name: homeName },
            { name: pageName, path: "/" }
        ]);
    }, [platformCtx.language]);

    useEffect(() => {
        // Function to fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("/dashboard", {
                    headers: {
                        "Client": "react"
                    }
                });
                return response.data;
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            }
        };
        if (loading) {
            fetchDashboardData().then((data) => {
                if (data) {
                    setDashboardData({
                        totalEmployees: data.totalEmployees,
                        totalDepartments: data.totalDepartments,
                        totalDesignations: data.totalDesignations,
                        totalAppraisal: data.totalAppraisal,
                        totalAttributes: data.totalAttributes,
                        employees: data.employees,
                        departments: data.departments,
                        designations: data.designations,
                        appraisals: data.appraisals,
                        ownAppraisals: data.ownAppraisals,
                        attributes: data.attributes,
                        remarksAppraisal: data.remarksAppraisal,
                        surveys: data.surveys,
                    });
                }
                setLoading(false);
            });
        }
    }, [loading]);

    useEffect(() => {
        // Function to fetch graph data
        const fetchGraphData = async () => {
            try {
                const response = await axios.get("/dashboard-graphs", {
                    headers: {
                        "Client": "react"
                    }
                });
                return response.data;
            } catch (err) {
                console.error('Error fetching graph data:', err);
            }
        };
        if (graphLoading) {
            fetchGraphData().then((data) => {
                if (data) {
                    setGraphData({
                        employeeCountsByDepartment: data.employeeCountsByDepartment,
                        appraisalCountsByMonth: data.appraisalCountsByMonth,
                        employeeGrowthData: data.employeeGrowthData,
                        topPerformers: data.topPerformers,
                    });
                }
                setGraphLoading(false);
            });
        }
    }, [graphLoading]);

    const { isAuthenticated, hasPermission } = useContext(AuthenticationContext);

    useEffect(() => {
        if (isAuthenticated) {
            if (hasPermission('department_graph')) {
                setActiveTab('departments');
            } else if (hasPermission('employees_graph')) {
                setActiveTab('employees');
            } else if (hasPermission('appraisals_graph')) {
                setActiveTab('appraisals');
            }
        }
    }, [isAuthenticated, hasPermission]);

    return (<>
        <Modal ref={modalRef} title={modalTitle} onClose={handleModalClose}>{modalContent}</Modal>
        <div>
            {/* Dashboard Grid Containers */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                {isAuthenticated && hasPermission('employees_table') && (
                    <div className="flex flex-row justify-between items-center rounded-md p-4 flex-1 sm:w-full bg-white ring-1 ring-gray-300 gap-4">
                        <span className="flex flex-row items-center justify-center material-icons w-16 h-16 text-3xl text-white rounded-full bg-red-500 bg-opacity-80">person</span>
                        <div className="flex flex-col gap-1 justify-end items-end text-slate-700">
                            <p className="text-2xl">{dashboardData.totalEmployees}</p>
                            <p className="text-lg font-medium">
                                {
                                    platformCtx.language === 'English' ? 'Employees' :
                                        platformCtx.language === 'Bahasa Melayu' ? 'Pekerja' : '员工'
                                }
                            </p>
                        </div>
                    </div>
                )}
                {isAuthenticated && hasPermission('departments_table') && (
                    <div className="flex flex-row justify-between items-center rounded-md p-4 flex-1 sm:w-full bg-white ring-1 ring-gray-300 gap-4">
                        <span className="flex flex-row items-center justify-center material-icons w-16 h-16 text-3xl text-white rounded-full bg-orange-500 bg-opacity-80">domain</span>
                        <div className="flex flex-col gap-1 justify-end items-end text-slate-700">
                            <p className="text-2xl">{dashboardData.totalDepartments}</p>
                            <p className="text-lg font-medium">
                                {
                                    platformCtx.language === 'English' ? 'Departments' :
                                        platformCtx.language === 'Bahasa Melayu' ? 'Jabatan' : '部门'
                                }
                            </p>
                        </div>
                    </div>
                )}
                {isAuthenticated && hasPermission('designations_table') && (
                    <div className="flex flex-row justify-between items-center rounded-md p-4 flex-1 sm:w-full bg-white ring-1 ring-gray-300 gap-4">
                        <span className="flex flex-row items-center justify-center material-icons w-16 h-16 text-3xl text-white rounded-full bg-amber-500 bg-opacity-80">badge</span>
                        <div className="flex flex-col gap-1 justify-end items-end text-slate-700">
                            <p className="text-2xl">{dashboardData.totalDesignations}</p>
                            <p className="text-lg font-medium">
                                {
                                    platformCtx.language === 'English' ? 'Designations' :
                                        platformCtx.language === 'Bahasa Melayu' ? 'Jawatan' : '职位'
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {/* Graphs */}
            <div className="ring-1 ring-gray-300 rounded-md">
                {/* Graph Tabs */}
                <div className="flex">
                    {isAuthenticated && hasPermission('department_graph') && (
                        <button
                            className={`flex-1 py-2 ${activeTab === 'departments' ? 'border-b-2 border-red-500 border-opacity-80 text-red-500 text-opacity-80' : 'text-gray-500'} bg-white rounded-tl-md font-medium hover:text-red-500 hover:text-opacity-80`}
                            onClick={() => setActiveTab('departments')}
                        >
                            {platformCtx.language === 'English' ? 'Departments' :
                                platformCtx.language === 'Bahasa Melayu' ? 'Jabatan' :
                                    '部门'}
                        </button>
                    )}
                    {isAuthenticated && hasPermission('employees_graph') && (
                        <button
                            className={`flex-1 py-2 ${activeTab === 'employees' ? 'border-b-2 border-red-500 border-opacity-80 text-red-500 text-opacity-80' : 'text-gray-500'} bg-white font-medium hover:text-red-500 hover:text-opacity-80`}
                            onClick={() => setActiveTab('employees')}
                        >
                            {platformCtx.language === 'English' ? 'Employees' :
                                platformCtx.language === 'Bahasa Melayu' ? 'Pekerja' :
                                    '员工'}
                        </button>
                    )}
                    {isAuthenticated && hasPermission('appraisals_graph') && (
                        <button
                            className={`flex-1 py-2 ${activeTab === 'appraisals' ? 'border-b-2 border-red-500 border-opacity-80 text-red-500 text-opacity-80' : 'text-gray-500'} bg-white rounded-tr-md font-medium hover:text-red-500 hover:text-opacity-80`}
                            onClick={() => setActiveTab('appraisals')}
                        >
                            {platformCtx.language === 'English' ? 'Appraisals' :
                                platformCtx.language === 'Bahasa Melayu' ? 'Penilaian' :
                                    '评估'}
                        </button>
                    )}
                    {isAuthenticated && hasPermission('topPerformers_graph') && (
                        <button
                            className={`flex-1 py-2 ${activeTab === 'topPerformers' ? 'border-b-2 border-red-500 border-opacity-80 text-red-500 text-opacity-80' : 'text-gray-500'} bg-white rounded-tr-md font-medium hover:text-red-500 hover:text-opacity-80`}
                            onClick={() => setActiveTab('topPerformers')}
                        >
                            {platformCtx.language === 'English' ? 'Top Performers' :
                                platformCtx.language === 'Bahasa Melayu' ? 'Penilaian' :
                                    '评估'}
                        </button>
                    )}
                </div>
                {/* Active Graph */}
                <div className="bg-white">
                    {isAuthenticated && hasPermission('department_graph') && activeTab === 'departments' && (
                        <div className="p-3 text-center">
                            <DepartmentChart data={graphData.employeeCountsByDepartment} />
                        </div>
                    )}

                    {isAuthenticated && hasPermission('employees_graph') && activeTab === 'employees' && (
                        <div className="p-3 text-center">
                            <EmployeeGrowthChart data={graphData.employeeGrowthData} />
                        </div>
                    )}

                    {isAuthenticated && hasPermission('appraisals_graph') && activeTab === 'appraisals' && (
                        <div className="p-3 text-center">
                            <AppraisalChart data={graphData.appraisalCountsByMonth} />
                        </div>
                    )}

                    {isAuthenticated && hasPermission('topPerformers_graph') && activeTab === 'topPerformers' && (
                        <div className="p-3 text-center">
                            <TopPerformersChart data={graphData.topPerformers} />
                        </div>
                    )}
                </div>
            </div>
            {/* Tables */}
            {/* Employees Table */}
            {isAuthenticated && hasPermission('employees_table') && (
                <div className="flex flex-col gap-x-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-medium uppercase">{translateKey("Employees")}</p>
                        <div className="text-right p-3">
                            <button
                                onClick={() => navigate('/employees-list')}
                                className="btn btn-primary text-sm underline"
                            >
                                {translateKey("View All Employees")}
                            </button>
                        </div>
                    </div>
                    <Table
                        simple
                        header={[
                            "#",
                            translateKey("Employee ID"),
                            translateKey("Username"),
                            translateKey("Full Name"),
                            translateKey("Email"),
                            translateKey("Phone"),
                            translateKey("Department"),
                            translateKey("Designation"),
                            translateKey("Role")
                        ]}
                        data={[...dashboardData.employees.map((employee, index) => [
                            index + 1,
                            <a href={`profile/${employee.employeeId}`}>{employee.employeeId}</a>,
                            employee.username,
                            employee.name,
                            employee.email,
                            employee.phone,
                            employee.department ? employee.department.departmentName : '',
                            employee.designation ? employee.designation.name : '',
                            employee.role ? employee.role.name : ''
                        ])]}
                    />
                </div>
            )}
            <div className="flex flex-wrap gap-4">
                {/* Departments Table */}
                {isAuthenticated && hasPermission('departments_table') && (
                    <div className="flex flex-col gap-x-4 flex-1">
                        <div className="flex flex-row justify-between items-center">
                            <p className="font-medium uppercase">{translateKey("Department")}</p>
                            <div className="text-right p-3">
                                <button
                                    onClick={() => navigate('/departments')}
                                    className="btn btn-primary text-sm underline"
                                >
                                    {translateKey("View All Departments")}
                                </button>
                            </div>
                        </div>
                        <Table
                            simple
                            header={["#", translateKey("Department")]}
                            data={[...dashboardData.departments.map((department, index) => [
                                index + 1,
                                department.departmentName
                            ])]}
                        />
                    </div>
                )}
                {/* Designations Table */}
                {isAuthenticated && hasPermission('designations_table') && (
                    <div className="flex flex-col gap-x-4 flex-1">
                        <div className="flex flex-row justify-between items-center">
                            <p className="font-medium uppercase">{translateKey("Designation")}</p>
                            <div className="text-right p-3">
                                <button
                                    onClick={() => navigate('/designations')}
                                    className="btn btn-primary text-sm underline"
                                >
                                    {translateKey("View All Designations")}
                                </button>
                            </div>
                        </div>
                        <Table
                            simple
                            header={["#", translateKey("Designation"), translateKey("Department")]}
                            data={[...dashboardData.designations.map((designation, index) => [
                                index + 1,
                                designation.name,
                                designation.department.departmentName
                            ])]}
                        />
                    </div>
                )}
            </div>
            {/* Appraisals Table */}
            {isAuthenticated && hasPermission('appraisals_table') && (
                <div className="flex flex-col gap-x-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-medium uppercase">{translateKey("Appraisals")}</p>
                        <div className="text-right p-3">
                            <button
                                onClick={() => navigate('/performance-appraisal')}
                                className="btn btn-primary text-sm underline"
                            >
                                {translateKey("View All Appraisals")}
                            </button>
                        </div>
                    </div>
                    <Table
                        simple
                        header={[
                            "#",
                            translateKey("Employee ID"),
                            translateKey("Employee Name"),
                            translateKey("Department"),
                            translateKey("Designation"),
                            translateKey("Know How / Problem Solving / Accountability"),
                            translateKey("Total Score"),
                            translateKey("Appraisal Date"),
                            translateKey("Action")
                        ]}
                        data={[...dashboardData.appraisals.map((appraisal, index) => [
                            index + 1,
                            appraisal.employeeDetails.employeeId,
                            appraisal.employeeDetails.name,
                            appraisal.employeeDetails.department,
                            appraisal.employeeDetails.designation,
                            [
                                `${appraisal.stats.knowHow.percentageScore}%`,
                                `${appraisal.stats.problemSolving.percentageScore}%`,
                                `${appraisal.stats.accountability.percentageScore}%`
                            ].join(" / "),
                            `${appraisal.stats.totalScore}% (${appraisal.stats.grade})`,
                            new Date(appraisal.appraisalDate).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            <Link to={`/view-appraisal/${appraisal._id}`} className="text-blue-500"><span
                                className="material-icons text-black">visibility</span></Link>
                        ])]}
                    />
                </div>
            )}
            {/* Own Appraisals Table */}
            {isAuthenticated && hasPermission('own_appraisals_table') && (
                <div className="flex flex-col gap-x-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-medium uppercase">{translateKey("Own Appraisals")}</p>
                        <div className="text-right p-3">
                            <button
                                onClick={() => navigate('/performance-appraisal')}
                                className="btn btn-primary text-sm underline"
                            >
                                {translateKey("View All Own Appraisals")}
                            </button>
                        </div>
                    </div>
                    <Table
                        simple
                        header={[
                            "#",
                            translateKey("Employee ID"),
                            translateKey("Employee Name"),
                            translateKey("Know How / Problem Solving / Accountability"),
                            translateKey("Total Score"),
                            translateKey("Appraisal Date"),
                            translateKey("Action")
                        ]}
                        data={[...dashboardData.ownAppraisals.map((appraisal, index) => [
                            index + 1,
                            appraisal.employeeDetails.employeeId,
                            appraisal.employeeDetails.name,
                            [
                                `${appraisal.stats.knowHow.percentageScore}%`,
                                `${appraisal.stats.problemSolving.percentageScore}%`,
                                `${appraisal.stats.accountability.percentageScore}%`
                            ].join(" / "),
                            `${appraisal.stats.totalScore}% (${appraisal.stats.grade})`,
                            new Date(appraisal.appraisalDate).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            <Link to={`/view-appraisal/${appraisal._id}`} className="text-blue-500"><span
                                className="material-icons text-black">visibility</span></Link>
                        ])]}
                    />
                </div>
            )}
            {/* Survey Table */}
            {isAuthenticated && hasPermission('survey_table') && (
                <div className="flex flex-col gap-x-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-medium uppercase">{translateKey("Survey")}</p>
                        <div className="text-right p-2">
                            <button
                                onClick={() => navigate('/performance-survey')}
                                className="btn btn-primary text-sm underline"
                            >
                                {translateKey("View All Surveys")}
                            </button>
                        </div>
                    </div>
                    <Table
                        simple header={["#", "Survey Title", "Number of Question(s)", "Number of Employee(s)", "Creation Date", "Status"]}
                        data={dashboardData.surveys.map((survey, index) => {
                            return [
                                index + 1,
                                survey.campaignName,
                                survey.questions.length,
                                survey.employees.length,
                                new Date(survey.createdAt).toLocaleDateString(),
                                <button
                                    key={survey._id}
                                    onClick={() => handleModalOpenWithSurveyStatus(survey._id)}
                                    className={`flex items-center cursor-pointer py-2 rounded-md text-black`}
                                >
                                    <div 
                                        className={`h-2.5 w-2.5 rounded-full ${survey.employees?.length === survey.completed?.length ? "bg-green-500" : "bg-red-500"} me-2`}
                                    ></div> 
                                    <span>{survey.completed?.length && survey.employees?.length === survey.completed?.length ? "Completed" : "Incomplete"}</span>
                                </button>
                            ];
                        })}
                    />
                </div>
            )}
            {/* Performance Indicators Table */}
            {isAuthenticated && hasPermission('indicators_table') && (
                <div className="flex flex-col gap-x-4">
                    <div className="flex flex-row justify-between items-center">
                        <p className="font-medium uppercase">{translateKey("Performance Indicators")}</p>
                        <div className="text-right p-2">
                            <button
                                onClick={() => navigate('/performance-indicator')}
                                className="btn btn-primary text-sm underline"
                            >
                                {translateKey("View All Performance Indicators")}
                            </button>
                        </div>
                    </div>
                    <Table
                        simple
                        header={[
                            "#",
                            translateKey("Name"),
                            translateKey("Category"),
                            translateKey("Designation")
                        ]}
                        data={[...dashboardData.attributes.map((attribute, index) => [
                            index + 1,
                            attribute.name,
                            attribute.category,
                            attribute.designation.name
                        ])]}
                    />
                </div>
            )}
        </div>
    </>);
}

export default Dashboard;
