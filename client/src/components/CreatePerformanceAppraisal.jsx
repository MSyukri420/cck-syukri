import { Link, Outlet } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { PlatformContext } from "./Layout/PlatformLayout.jsx";
import axios from "axios";
import SearchableDropdown from "./SearchableDropdown.jsx";
import Button from "./Button.jsx";

export const CreatePerformanceAppraisalContext = createContext({
    employees: [],
    employeeData: null,
    attributes: null,
    appraisalDate: null,
    timePeriod: null,
    getEmployeeData: () => {},
    setEmployeeData: () => {},
    setAppraisalDate: () => {},
    setTimePeriod: () => {},
    setAttributes: () => {},
    reset: () => {}
});

export function PerformanceAppraisalProvider({children}) {

    
    const [employees, setEmployees] = useState([{}]);
    const [employeeData, setEmployeeData] = useState(null);
    const [attributes, setAttributes] = useState(null);
    const [appraisalDate, setAppraisalDate] = useState(null);
    const [timePeriod, setTimePeriod] = useState(null);

    useEffect(() => {
        const getEmployees = async () => {
            try {
                const response = await axios.get("/get-employee-names");

                const data = response.data;

                if (data.success) {
                    setEmployees(data.employees);
                } else {
                    console.error(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        }

        getEmployees().then(() => {
            console.log("Got employees data");
        });
    }, []);

    const getEmployeeData = async (employeeId) => {
        try {
            const response = await axios.get(`/get-employee-details/${employeeId}`);

            const data = response.data;

            if (data.success) {
                setEmployeeData(data.employee);
                setAttributes(data.attributes);
            } else {
                console.error(data.message);
            }
        } catch (e) {
            console.error(e);
        }
    }

    function reset() {
        setEmployeeData(null);
        setAttributes(null);
        setAppraisalDate(null);
    }

    const ctx = {
        employees,
        employeeData,
        timePeriod,
        setTimePeriod,
        getEmployeeData,
        setEmployeeData,
        setAppraisalDate,
        attributes,
        setAttributes,
        appraisalDate,
        reset
    };

    return (
        <CreatePerformanceAppraisalContext.Provider value={ctx}>
            {children}
            <Outlet />
        </CreatePerformanceAppraisalContext.Provider>
    )
}

function CreatePerformanceAppraisal() {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            // Modal Title
            addAppraisal: "Add Appraisal",
            // Employee Details
            employeeDetails: "Employee Details",
            // Employee Select
            employeeName: "Employee Name",
            employeeSelect: "Select Employee",
            // Department Assigned
            departmentAssigned: "Department Assigned",
            // Designation Assigned
            designationAssigned: "Designation Assigned",
            // Job Grade Assigned
            jobGradeAssigned: "Job Grade Assigned",
            // Appraisal Period Input
            appraisalPeriod: "Appraisal Period",
            appraisalPeriodInput: "Enter Appraisal Period",
            // Appraisal Date Input
            appraisalDate: "Appraisal Date",
            // Submit Button
            submit: "Submit",
        },
        'Bahasa Melayu': {
            // Modal Title
            addAppraisal: "Tambah Penilaian",
            // Employee Details
            employeeDetails: "Butiran Pekerja",
            // Employee Select
            employee: "Pekerja",
            employeeSelect: "Pilih Pekerja",
            // Department Assigned
            departmentAssigned: "Jabatan Ditugaskan",
            // Designation Assigned
            designationAssigned: "Jawatan Ditugaskan",
            // Job Grade Assigned
            jobGradeAssigned: "Gred Kerja Ditugaskan",
            // Appraisal Period Input
            appraisalPeriod: "Tempoh Penilaian",
            appraisalPeriodInput: "Masukkan Tempoh Penilaian",
            // Appraisal Date Input
            appraisalDate: "Tarikh Penilaian",
            // Submit Button
            submit: "Hantar",
        },
        '中文': {
            // Modal Title
            addAppraisal: "添加评估",
            // Employee Details
            employeeDetails: "员工详情",
            // Employee Select
            employee: "员工",
            employeeSelect: "选择员工",
            // Department Assigned
            departmentAssigned: "分配的部门",
            // Designation Assigned
            designationAssigned: "分配的职位",
            // Job Grade Assigned
            jobGradeAssigned: "分配的工作等级",
            // Appraisal Period Input
            appraisalPeriod: "评估期间",
            appraisalPeriodInput: "输入评估期间",
            // Appraisal Date Input
            appraisalDate: "评估日期",
            // Submit Button
            submit: "提交",
        }           
    };

    const {
        employees,
        employeeData,
        getEmployeeData,
        setAppraisalDate,
        appraisalDate,
        timePeriod,
        setTimePeriod,
        reset
    } = useContext(CreatePerformanceAppraisalContext);

    useEffect(() => {
        reset();
    }, [])

    return (
        <div className="overflow-hidden">
            <div className="mb-2 text-lg font-medium">{languageMap[platformCtx.language].employeeDetails}</div>
            {/* Employee Details */}
            <div className="flex flex-col gap-6">
                {/* Employee Dropdown Button */}
                <div className="flex flex-col">
                    <label htmlFor="employee" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].employeeName}:</label>
                    <SearchableDropdown
                        options={employees.map((employee) => ({text: employee.name, value: employee._id}))}
                        selected={employeeData? employeeData._id : ""}
                        placeholder={languageMap[platformCtx.language].employeeSelect}
                        onChange={(value) => getEmployeeData(value)}
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Department Assigned Input */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentAssigned}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input 
                                type="text" 
                                id="department"
                                className="w-full text-gray-900 bg-gray-300 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none "
                                value={employeeData ? employeeData.department.departmentName : "No data available"}
                                readOnly
                            />
                        </div>
                    </div>
                    {/* Designation Assigned Input */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationAssigned}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input 
                                type="text" 
                                id="designation"
                                className="w-full text-gray-900 bg-gray-300 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none "
                                value={employeeData ? employeeData.designation.name : "No data available"}
                                readOnly
                            />
                        </div>
                    </div>
                    {/* Job Grade Assigned Input */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="job-grade" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].jobGradeAssigned}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input 
                                type="text" 
                                id="job-grade"
                                className="w-full text-gray-900 bg-gray-300 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none "
                                value={employeeData ? `${employeeData.jobGrade.jobGradeName}` : "No data available"}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Header Tag */}
            <hr className="my-3 ring-0 ring-gray-200"/>
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="date" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].appraisalPeriod}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input 
                                type="text"
                                value={timePeriod || ""}
                                onChange={(e) => setTimePeriod(e.target.value)}
                                className="w-full appearance-none text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Appraisal Date Input */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="date" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].appraisalDate}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input
                                type="date"
                                id="date"
                                value={appraisalDate || ""}
                                onChange={(e) => setAppraisalDate(e.target.value)}
                                className="w-full appearance-none text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
                {/* Submit Button */}
                <Link to="/performance-evaluation">
                    <div className="text-right font-medium">
                        <Button>{languageMap[platformCtx.language].submit}</Button>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default CreatePerformanceAppraisal;