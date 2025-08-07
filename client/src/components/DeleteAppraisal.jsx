import Button from "./Button.jsx";
import axios from "axios";
import { useContext } from "react";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

function DeleteAppraisal({ performanceAppraisal, onSubmit }) {
    const platformCtx = useContext(PlatformContext);
    const languageMap = {
        English: {
            deleteAppraisalConfirmation: "Are you sure you want to delete this performance appraisal?",
            employeeName: "Employee Name",
            employeeId: "Employee ID",
            department: "Department",
            designation: "Designation",
            appraisalDate: "Appraisal Date",
            delete: "Delete",
        },
        'Bahasa Melayu': {
            deleteAppraisalConfirmation: "Adakah anda pasti ingin memadam penilaian prestasi ini?",
            employeeName: "Nama Pekerja",
            employeeId: "ID Pekerja",
            department: "Jabatan",
            designation: "Jawatan",
            appraisalDate: "Tarikh Penilaian",
            delete: "Padam",
        },
        '中文': {
            deleteAppraisalConfirmation: "您确定要删除此绩效评估吗？",
            employeeName: "员工姓名",
            employeeId: "员工编号",
            department: "部门",
            designation: "职位",
            appraisalDate: "评估日期",
            delete: "删除",

        }
    }
    async function handleDelete() {
        try {
            const response = await axios.post("/delete-appraisal", {
                performanceAppraisalId: performanceAppraisal._id
            });

            const data = response.data;

            onSubmit?.(data);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4">
                {/* Are you sure? */}
                <span className="w-32 h-32 inline-flex items-center justify-center bg-red-100 rounded-full">
                    <span className="material-symbols-outlined text-6xl text-red-500 text-opacity-80">warning</span>
                </span>
                <p className="mb-3 text-center text-2xl font-medium">{languageMap[platformCtx.language].deleteAppraisalConfirmation}</p>
                {/* Employee Name Input */}
                <div className="w-full">
                    <label htmlFor="employee-name" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].employeeName}:</label>
                    <input
                        type="text"
                        id="employee-name" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={performanceAppraisal.employeeDetails.name}
                        readOnly
                    />
                </div>
                {/* Employee ID Input */}
                <div className="w-full">
                    <label htmlFor="employee-id" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].employeeId}:</label>
                    <input
                        type="text"
                        id="employee-id" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={performanceAppraisal.employeeDetails.employeeId}
                        readOnly
                    />
                </div>
                {/* Department Associated Input */}
                <div className="w-full">
                    <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].department}:</label>
                    <input
                        type="text"
                        id="designation" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={performanceAppraisal.employeeDetails.department}
                        readOnly
                    />
                </div>
                {/* Designation Associated Input */}
                <div className="w-full">
                    <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designation}:</label>
                    <input
                        type="text"
                        id="designation" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={performanceAppraisal.employeeDetails.designation}
                        readOnly
                    />
                </div>
                {/* Appraisal Date Input */}
                <div className="w-full">
                    <label htmlFor="appraisal-date" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].appraisalDate}:</label>
                    <input
                        type="text"
                        id="appraisal-date" 
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none" 
                        value={new Date(performanceAppraisal.appraisalDate).toLocaleString(platformCtx.language === 'English' ? "en-my" : platformCtx.language === 'Bahasa Melayu' ? "ms-MY" : "zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                        readOnly
                    />
                </div>
            </div>
            {/* Delete Button */}
            <div className="text-right font-medium">
                <Button className="bg-red-500" onClick={handleDelete}>{languageMap[platformCtx.language].delete}</Button>
            </div>
        </div>
    );
}

export default DeleteAppraisal;