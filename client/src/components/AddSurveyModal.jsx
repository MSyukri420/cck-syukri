import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Table from "./Table.jsx";
import Button from "./Button.jsx";
import axios from "axios";


const AddSurveyModal = () => {
    // Data Fetch Handling
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

    // Department Selection Handling
    const [department, setDepartment] = useState('');

    // Employee Selection Handling
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        if (department) {
            // Fetch employees from the server when a department is selected
            axios.get(`/employees/${department}`)
                .then(response => {
                    const populatedEmployees = response.data.employees.map(employee => ({
                        ...employee,
                        department: employee.department,
                        designation: employee.designation,
                        jobGrade: employee.jobGrade,
                    }));
                    setEmployees(populatedEmployees);
                })
                .catch(error => {
                    console.error('Error fetching employees:', error);
                });
        }
    }, [department]);

    useEffect(() => {
        // Reset the current selected employees when the department changes
        setCurrentSelectedEmployees([]);
    }, [department]);



    // Selected Employee Table Data Handling
    const headers = ["Full Name", "Department", "Designation", "Job Grade"];

    const [currentSelectedEmployees, setCurrentSelectedEmployees] = useState([]);

    const handleRemove = (employee) => {
        setSelectedEmployees(selectedEmployees.filter(e => e._id !== employee._id));
        setCurrentSelectedEmployees(currentSelectedEmployees.filter(e => e._id !== employee._id));
    };

    // Survey Data Parsing Handling
    const [surveyTitle, setSurveyTitle] = useState('');
    const [surveyDescription, setSurveyDescription] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // Component Navigation Handling
    const navigate = useNavigate();

    const handleCreateSurvey = () => {
        const surveyData = {
            surveyTitle,
            surveyDescription,
            selectedEmployees,
            startDate,
            endDate,
        };

        // Store the data in sessionStorage
        sessionStorage.setItem('surveyData', JSON.stringify(surveyData));

        // Navigate to the SurveyQuestionnaire.jsx
        navigate('/survey-questionnaire');
    };

    return (
        <div>
            {/* Combine Page One and Page Two */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {/* Survey Title Input */}
                <div className="col-span-2">
                    <label htmlFor="survey-title" className="inline-block py-[7px] text-sm font-medium">Survey Title:</label>
                    <div className="w-full relative inline-flex items-center">
                        <input
                            type="text"
                            id="survey-title"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            placeholder="Enter Survey Title"
                            value={surveyTitle}
                            onChange={e => setSurveyTitle(e.target.value)}
                        />
                    </div>
                </div>
                {/* Survey Description Input */}
                <div className="col-span-2">
                    <label htmlFor="survey-description" className="inline-block py-[7px] text-sm font-medium">Survey Description:</label>
                    <textarea
                        id="survey-description"
                        className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                        placeholder="Enter Survey Description"
                        value={surveyDescription}
                        onChange={e => setSurveyDescription(e.target.value)}
                    />
                </div>
                {/* Start Date Input */}
                <div className="col-span-1">
                    <label htmlFor="start-date" className="inline-block py-[7px] text-sm font-medium">Start Date:</label>
                    <div className="w-full relative inline-flex items-center">
                        <input
                            type="date"
                            id="start-date"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                </div>
                {/* End Date Input */}
                <div className="col-span-1">
                    <label htmlFor="end-date" className="inline-block py-[7px] text-sm font-medium">End Date:</label>
                    <div className="w-full relative inline-flex items-center">
                        <input
                            type="date"
                            id="end-date"
                            className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                {/* Department Dropdown Button */}
                <div className="col-span-2">
                    <label htmlFor="department-select" className="inline-block py-[7px] text-sm font-medium">Department:</label>
                    <div className="w-full relative flex items-center">
                        <select
                            id="department-select"
                            className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                        >
                            <option className="rounded">Select Department</option>
                            {departments.map(department => (
                                <option key={department._id} value={department._id}>{department.departmentName}</option>
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
                {/* Employee Selection */}
                {department && (
                    <div className="col-span-2 w-full">
                        <label htmlFor="employee-selection" className="inline-block py-[7px] text-sm font-medium">Employee Selection:</label>
                        {/* Employee Selection Table */}
                        <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 overflow-x-auto">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input
                                            id="checkbox-all"
                                            type="checkbox"
                                            className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:outline-none"
                                            onChange={e => {
                                                const isChecked = e.target.checked;
                                                if (isChecked) {
                                                    setSelectedEmployees(employees);
                                                } else {
                                                    setSelectedEmployees([]);
                                                }
                                            }}
                                            checked={selectedEmployees.length === employees.length}
                                        />
                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">No.</th>
                                <th scope="col" className="px-6 py-3">Full Name</th>
                                <th scope="col" className="px-6 py-3">Designation</th>
                            </tr>
                            </thead>
                            <tbody>
                            {employees.map((employee, index) => (
                                <tr key={employee._id} className={`bg-white ${index !== employees.length - 1 ? 'border-b' : ''}`}>
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                id={`checkbox-${employee._id}`}
                                                type="checkbox"
                                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:outline-none"
                                                value={employee._id}
                                                checked={selectedEmployees.some(e => e._id === employee._id)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setSelectedEmployees([...selectedEmployees, employee]);
                                                    } else {
                                                        setSelectedEmployees(selectedEmployees.filter(e => e._id !== employee._id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`checkbox-${employee._id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                        <img className="w-10 h-10 rounded-full" src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`} alt={`${employee.name} image`} />
                                        <div className="ps-3">
                                            <div className="text-base font-semibold">{employee.name}</div>
                                            <div className="font-normal text-gray-500">{employee.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {employee.designation?.name}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Selected Employees Table */}
                {selectedEmployees.length > 0 && (
                    <div className="col-span-2">
                        <label htmlFor="selected-employee" className="inline-block py-[7px] text-xs font-medium">Selected Employee:</label>
                        <Table
                            header={[...headers, "Actions"]}
                            data={selectedEmployees.map(employee => [
                                employee.name,
                                employee.department?.departmentName,
                                employee.designation?.name,
                                'G' + employee.jobGrade?.jobGradeName,
                                <Button onClick={() => handleRemove(employee)}>Remove</Button>
                            ])}
                        />
                    </div>
                )}
                {/* Create Survey Button */}
                {selectedEmployees.length > 0 && (
                    <div className="col-start-2 text-right">
                        <Button colorType="danger" onClick={handleCreateSurvey}>
                            Create Survey
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AddSurveyModal;