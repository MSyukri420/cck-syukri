import React, {useEffect, useState, useContext} from 'react';
import Button from "./Button.jsx";
import axios from "axios";
import { PlatformContext } from './Layout/PlatformLayout.jsx';

function AddDesignation({onSubmit}) {
    const languageMap = {
        English: {
            designationName: "Designation Name",
            designationNameInput: "Enter Designation Name",
            departmentAssociated: "Associated Department",
            departmentSelect: "Select Department",
            designatedLead: "Designated Lead",
            submit: "Submit",
        },
        'Bahasa Melayu': {
            designationName: "Nama Jawatan",
            designationNameInput: "Masukkan Nama Jawatan",
            departmentAssociated: "Jabatan Berkaitan",
            departmentSelect: "Pilih Jabatan",
            designatedLead: "Pemimpin Yang Ditugaskan",
            submit: "Hantar",
        },
        '中文': {
            designationName: "职位名称",
            designationNameInput: "输入职位名称",
            departmentAssociated: "关联部门",
            departmentSelect: "选择部门",
            designatedLead: "指定领导",
            submit: "提交",
        }     
    };

    const platformCtx = useContext(PlatformContext);
    const [designationName, setDesignationName] = useState('');
    const [department, setDepartment] = useState('');
    const [isLead, setIsLead] = useState(false);
    const [departments, setDepartments] = useState([]);


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

    const handleSubmit = () => {
        const designation = {
            name: designationName,
            department,
            isLead
        };
        onSubmit?.(designation);
    };

    return (
        // Modal Content
        <div className="flex flex-col gap-6">
            {/* Designation Name Input */}
            <div className="flex flex-col">
                <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationName}:</label>
                <input 
                    type="text" 
                    id="designation"
                    className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    placeholder="Enter Designation Name"
                    value={designationName}
                    onChange={e => setDesignationName(e.target.value)}
                />
            </div>
            {/* Department Associated Dropdown Button */}
            <div className="flex flex-col">
                <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].departmentAssociated}:</label>
                <div className="w-full relative inline-flex items-center">
                    <select 
                        id="department"
                        className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}>
                        <option className="rounded">
                            {languageMap[platformCtx.language].departmentSelect}
                        </option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                        ))}
                    </select>
                    <svg
                        className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                        aria-hidden="true" fill="none" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
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
                <span className="text-sm">{languageMap[platformCtx.language].designatedLead}</span>
            </div>
            {/* Submit Button */}
            <div className="text-right font-medium">
                <Button colorType={"dark"} onClick={handleSubmit}>
                    <span>{languageMap[platformCtx.language].submit}</span>
                </Button>
            </div>
        </div>
    )
}

export default AddDesignation;