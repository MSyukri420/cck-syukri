import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Button from './Button';
import { PlatformContext } from "./Layout/PlatformLayout.jsx";

function EditJobGradeModal({ jobGrade, onSave, modalRef,setLoading }) {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            // Page Title
            jobGrade: "Job Grade",
            // Breadcrumbs
            breadcrumbHome: "Home",
            breadcrumbJobGrade: "Job Grade",
            // Search Input
            searchInput: "Job Grade",
            // Button
            save: "Save",
            // Table Header
            department: "Department",
            designation: "Designation",
            percentageCarryKnowHow: "Percentage Carry Know-How",
            percentageCarryProblemSolving: "Percentage Carry Problem-Solving",
            percentageCarryAccountability: "Percentage Carry Accountability",
            remainingPercentage: "Remaining Percentage",
            selectDepartment: "Select Department",
            totalPercentageError: "Total percentage must be 100%",
            jobGradeUpdateSuccess: "Job grade updated successfully",
            jobGradeExists: "Job grade already exists"
        },
        'Bahasa Melayu': {
            // Page Title
            jobGrade: "Gred Jawatan",
            // Breadcrumbs
            breadcrumbHome: "Laman Utama",
            breadcrumbJobGrade: "Gred Jawatan",
            // Search Input
            searchInput: "Gred Jawatan",
            // Button
            save: "Simpan",
            // Table Header
            department: "Jabatan",
            designation: "Jawatan",
            percentageCarryKnowHow: "Pembawaan Peratusan Pengetahuan",
            percentageCarryProblemSolving: "Pembawaan Peratusan Penyelesaian Masalah",
            percentageCarryAccountability: "Pembawaan Peratusan Tanggungjawab",
            remainingPercentage: "Sisa Peratusan",
            selectDepartment: "Pilih Jabatan",
            totalPercentageError: "Jumlah peratusan mesti 100%",
            jobGradeUpdateSuccess: "Gred jawatan berjaya dikemaskini",
            jobGradeExists: "Gred jawatan sudah wujud"

        },
        '中文': {
            // Page Title
            jobGrade: "职级",
            // Breadcrumbs
            breadcrumbHome: "主页",
            breadcrumbJobGrade: "职级",
            // Search Input
            searchInput: "职级",
            // Button
            save: "保存",
            // Table Header
            department: "部门",
            designation: "指定",
            percentageCarryKnowHow: "百分比携带知识",
            percentageCarryProblemSolving: "百分比携带解决问题",
            percentageCarryAccountability: "百分比携带责任",
            remainingPercentage: "剩余百分比",
            selectDepartment: "选择部门",
            totalPercentageError: "总百分比必须为100%",
            jobGradeUpdateSuccess: "职级更新成功",
            jobGradeExists: "职级已存在"

        },
    }
    
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [selectedJobGrade, setSelectedJobGrade] = useState('');
    const [percentageCarry, setPercentageCarry] = useState({
        knowHow: '',
        problemSolving: '',
        accountability: ''
    });

    const remainingPercentage = 100 - (Number(percentageCarry.knowHow) + Number(percentageCarry.problemSolving) + Number(percentageCarry.accountability));
    // Reset state when jobGrade prop changes
    useEffect(() => {
        setSelectedDepartment(jobGrade?.department?._id);
        setSelectedDesignation(jobGrade?.designation?._id);
        setSelectedJobGrade(jobGrade?.jobGradeName);
        setPercentageCarry(jobGrade?.percentageCarry || {
            knowHow: '',
            problemSolving: '',
            accountability: ''
        });
    }, [jobGrade]);

    useEffect(() => {
        // Fetch departments
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('/departments', { headers: { client: 'react' } });
                setDepartments(response.data.departments);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, []);

    useEffect(() => {
        // Fetch designations of the selected department
        const fetchDesignations = async () => {
            try {
                const response = await axios.get(`/api/designations/department/${selectedDepartment}`, { headers: { client: 'react' } });
                setDesignations(response.data.designations);
            } catch (error) {
                console.error('Error fetching designations:', error);
            }
        };

        if (selectedDepartment) {
            fetchDesignations();
        }
    }, [selectedDepartment]);

    const handleSave = async () => {
        let jobGradeData = null;
        try {
            const totalPercentage = Number(percentageCarry.knowHow) + Number(percentageCarry.problemSolving) + Number(percentageCarry.accountability);
            if (totalPercentage !== 100) {
                platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].totalPercentageError });
                return;
            }

            // Check if job grade already exists
            const existingJobGrade = await axios.get(`/jobgrade/check/${selectedJobGrade}`, { headers: { client: 'react' } });
            if (existingJobGrade.data.exists) {
                platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].jobGradeExists});
                return;
            }

            jobGradeData = {
                jobGradeName: selectedJobGrade,
                department: selectedDepartment,
                designation: selectedDesignation,
                percentageCarry
            };

            await axios.post(`/jobgrade/update/${jobGrade._id}`, jobGradeData, { headers: { client: 'react' } });
            // Call onSave function after data is sent
            onSave();
            // Check if modalRef and modalRef.current are defined before calling closeModal
            if (modalRef && modalRef.current) {
                modalRef.current.closeModal();
            }
            // Alert the user
            platformCtx.setAlert({ type: 'success', message: languageMap[platformCtx.language].jobGradeUpdateSuccess });
            // Set loading to true to trigger a refresh of the data
            setLoading(true);
        } catch (error) {
            console.error('Error updating job grade:', error);
            if (jobGradeData) {
                console.error('Data sent to server:', jobGradeData);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Department Dropdown */}
            <div className="flex flex-col">
                <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].department}:</label>
                <select 
                    id="department" 
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                    <option value="">
                        {languageMap[platformCtx.language].selectDepartment}
                    </option>
                    {departments.map((department) => (
                        <option key={department._id} value={department._id}>{department.departmentName}</option>
                    ))}
                </select>
            </div>
            {/* Designation Dropdown */}
            <div className="flex flex-col">
                <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designation}:</label>
                <select 
                    id="designation" 
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                    <option value="">
                        {languageMap[platformCtx.language].selectDesignation}
                    </option>
                    {designations.map((designation) => (
                        <option key={designation._id} value={designation._id}>{designation.name}</option>
                    ))}
                </select>
            </div>
            {/* Job Grade Dropdown */}
            <div className="flex flex-col">
                <label htmlFor="job-grade" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].jobGrade}:</label>
                <select 
                    id="job-grade" 
                    value={selectedJobGrade}
                    onChange={(e) => setSelectedJobGrade(e.target.value)}
                    className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                    <option value="">
                        {languageMap[platformCtx.language].selectJobGrade}
                    </option>
                    {Array.from({length: 20}, (_, i) => i + 1).map((grade) => (
                        <option key={grade} value={grade}>{`Grade ${grade}`}</option>
                    ))}
                </select>
            </div>
            {/* Percentage Carry Inputs */}
            <div className="flex flex-wrap gap-4">
                {/* Know How */}
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <label htmlFor="percentage-carry-know-how" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].percentageCarryKnowHow}:</label>
                    <input
                        type="number" 
                        id="percentage-carry-know-how"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        value={percentageCarry.knowHow}
                        onChange={(e) => {
                            const value = e.target.value === '' ? '' : Math.max(1, Math.min(e.target.value, 100 - percentageCarry.problemSolving - percentageCarry.accountability));
                            setPercentageCarry({...percentageCarry, knowHow: value})
                        }}
                        min="1" 
                        max="100"
                    />
                </div>
                {/* Problem Solving */}
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <label htmlFor="percentage-carry-problem-solving" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].percentageCarryProblemSolving}:</label>
                    <input
                        type="number"
                        id="percentage-carry-problem-solving"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        value={percentageCarry.problemSolving}
                        onChange={(e) => {
                            const value = e.target.value === '' ? '' : Math.max(1, Math.min(e.target.value, 100 - percentageCarry.knowHow - percentageCarry.accountability));
                            setPercentageCarry({...percentageCarry, problemSolving: value})
                        }}
                        min="1"
                        max="100"
                    />
                </div>
                {/* Accountability */}
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <label htmlFor="percentage-carry-accountability" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].percentageCarryAccountability}:</label>
                    <input
                        type="number" 
                        id="percentage-carry-accountability"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        value={percentageCarry.accountability}
                        onChange={(e) => {
                            const value = e.target.value === '' ? '' : Math.max(1, Math.min(e.target.value, 100 - percentageCarry.knowHow - percentageCarry.problemSolving));
                            setPercentageCarry({...percentageCarry, accountability: value})
                        }}
                        min="1" 
                        max="100"
                    />
                </div>
            </div>
            {/* Remaining Percentage Carry */}
            <div className="flex flex-col gap-2 w-auto">
                <label htmlFor="remaining-percentage" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].remainingPercentage} (%):</label>
                <input 
                    type="number" 
                    id="remaining-percentage"
                    className=" text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    value={remainingPercentage}
                    readOnly
                />
            </div>
            {/* Save Changes Button */}
            <div className="text-right font-medium">
                <Button onClick={handleSave}><span>{languageMap[platformCtx.language].save}</span></Button>
            </div>
        </div>
    );
}

export default EditJobGradeModal;