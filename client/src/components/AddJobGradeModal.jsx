import {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import Button from './Button';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";



function AddJobGradeModal({ onSave, modalRef }) {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            department: 'Department',
            selectDepartment: 'Select Department',
            designation: 'Designation',
            selectDesignation: 'Select Designation',
            jobGrade: 'Job Grade',
            selectJobGrade: 'Select Job Grade',
            percentageCarryKnowHow: 'Percentage Carry (Know How)',
            percentageCarryProblemSolving: 'Percentage Carry (Problem Solving)',
            percentageCarryAccountability: 'Percentage Carry (Accountability)',
            remainingPercentage: 'Remaining Percentage',
            totalPercentageError: 'The total of knowHow, problemSolving, and accountability should be 100%',
            sendingData: 'Sending data to server:',
            errorAddingJobGrade: 'Error adding job grade:',
            dataSent: 'Data sent to server:',
            submit: 'Submit',
            saveChanges: 'Save Changes',
            addjobgradesuccess: 'Job Grade added successfully',
            existjobgrade: 'Job Grade already exist',
        },
        'Bahasa Melayu': {
            department: 'Jabatan',
            selectDepartment: 'Pilih Jabatan',
            designation: 'Jawatan',
            selectDesignation: 'Pilih Jawatan',
            jobGrade: 'Gred Pekerjaan',
            selectJobGrade: 'Pilih Gred Jawatan',
            percentageCarryKnowHow: 'Peratusan (Pengetahuan)',
            percentageCarryProblemSolving: 'Peratusan (Penyelesaian Masalah)',
            percentageCarryAccountability: 'Peratusan (Tanggungjawab)',
            remainingPercentage: 'Peratusan yang Tinggal',
            totalPercentageError: 'Jumlah Pengetahuan, Penyelesaian Masalah dan Tanggungjawab harus 100%',
            sendingData: 'Menghantar data ke server:',
            errorAddingJobGrade: 'Gagal menambah gred pekerjaan:',
            dataSent: 'Data dihantar ke server:',
            submit: 'Hantar',
            saveChanges: 'Simpan Perubahan',
            addjobgradesuccess: 'Gred Pekerjaan berjaya ditambah',
            existjobgrade: 'Gred Pekerjaan telah wujud',
        },
        '中文': {
            department: '部门',
            selectDepartment: '选择部门',
            designation: '职位',
            selectDesignation: '选择职位',
            jobGrade: '工作等级',
            selectJobGrade: '选择工作等级',
            percentageCarryKnowHow: '百分比 (专业知识)',
            percentageCarryProblemSolving: '百分比 (解决问题)',
            percentageCarryAccountability: '百分比 (责任)',
            remainingPercentage: '剩余百分比',
            totalPercentageError: '知识、解决问题能力和责任的总和应为100%',
            sendingData: '正在向服务器发送数据:',
            errorAddingJobGrade: '添加工作等级时出错:',
            dataSent: '发送到服务器的数据:',
            submit: '提交',
            saveChanges: '保存更改',
            addjobgradesuccess: '工作等级添加成功',
            existjobgrade: '工作等级已存在',
        }
    };

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

    // Fetch Department Data Handling
    useEffect(() => {
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

    // Fetch Designation Data Handling
    useEffect(() => {
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

    // Submit Job Grade Data Handling
    const handleSubmit = async () => {
        let jobGradeData = null;
        try {
            const totalPercentage = Number(percentageCarry.knowHow) + Number(percentageCarry.problemSolving) + Number(percentageCarry.accountability);
            if (totalPercentage !== 100) {
                platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].totalPercentageError });
                return;
            }

            jobGradeData = {
                jobGradeName: selectedJobGrade,
                department: selectedDepartment,
                designation: selectedDesignation,
                percentageCarry
            };

            const response = await axios.post('/jobgrade/add', jobGradeData, { headers: { client: 'react' } });

            // Check if the job grade was created successfully
            if (response.data.success) {
                // Call onSave function after data is sent
                onSave();
                // Close the modal
                modalRef.current.closeModal();
                // Alert the user
                platformCtx.setAlert({ type: 'success', message: languageMap[platformCtx.language].addjobgradesuccess });
            } else {
                // If there was an error creating the job grade, show the error message
                platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].existjobgrade });
            }
        } catch (error) {
            console.error(languageMap[platformCtx.language].errorAddingJobGrade, error);
            if (jobGradeData) {
                console.error(languageMap[platformCtx.language].dataSent, jobGradeData);
            }
            // If there was an error sending the request, show a generic error message
            platformCtx.setAlert({ type: 'danger', message: languageMap[platformCtx.language].errorAddingJobGrade });
        }
    };
    
    // Remaining Percentage Calculation Handling
    const remainingPercentage = 100 - (Number(percentageCarry.knowHow) + Number(percentageCarry.problemSolving) + Number(percentageCarry.accountability));

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
                            const value = e.target.value === '' ? '' : Math.max(0, Math.min(e.target.value, 100 - percentageCarry.problemSolving - percentageCarry.accountability));
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
                            const value = e.target.value === '' ? '' : Math.max(0, Math.min(e.target.value, 100 - percentageCarry.knowHow - percentageCarry.accountability));
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
                            const value = e.target.value === '' ? '' : Math.max(0, Math.min(e.target.value, 100 - percentageCarry.knowHow - percentageCarry.problemSolving));
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
                <Button onClick={handleSubmit}><span>{languageMap[platformCtx.language].submit}</span></Button>
            </div>
        </div>
    );
}

export default AddJobGradeModal;