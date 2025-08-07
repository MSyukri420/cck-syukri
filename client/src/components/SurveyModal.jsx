import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Table from "./Table.jsx";
import axios from "axios";
import Button from "./Button.jsx";


const SurveyModal = () => {
    const [departments, setDepartments] = useState([]);
    const [department, setDepartment] = useState('');
    const [campaignTitle, setCampaignTitle] = useState('');
    const [campaignDescription, setCampaignDescription] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const headers = ["Full Name", "Department", "Designation", "Job Grade"];
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentSelectedEmployees, setCurrentSelectedEmployees] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [jobGrades, setJobGrades] = useState([]);

    const handleRemove = (employee) => {
        setSelectedEmployees(selectedEmployees.filter(e => e._id !== employee._id));
        setCurrentSelectedEmployees(currentSelectedEmployees.filter(e => e._id !== employee._id));
    };

    const navigate = useNavigate();

    const handleCreateSurvey = () => {
        // Gather your data
        const surveyData = {
            campaignTitle,
            campaignDescription,
            selectedEmployees,
            startDate,
            endDate,
        };

        // Store the data in sessionStorage
        sessionStorage.setItem('surveyData', JSON.stringify(surveyData));

        // Navigate to the SurveyQuestionnaire page
        navigate('/survey-questionnaire');
    };

    useEffect(() => {
        // Fetch designations from the server when the component mounts
        axios.get('/api/designations')
            .then(response => {
                setDesignations(response.data.designations);
            })
            .catch(error => {
                console.error('Error fetching designations:', error);
            });

        // Fetch job grades from the server when the component mounts
        axios.get('/api/jobgrades')
            .then(response => {
                setJobGrades(response.data.jobGrades);
            })
            .catch(error => {
                console.error('Error fetching job grades:', error);
            });
    }, []);

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



    return (
        <div>
            {/* Campaign Details */}
            <div className="grid grid-cols-12 gap-x-4 gap-y-4">
                {/* Campaign Title and Description Inputs */}
                <div className="col-span-12 grid grid-cols-2 gap-x-4">
                    {/* Campaign Title Input */}
                    <div>
                        <label htmlFor="campaign-title" className="inline-block py-[7px] text-sm font-medium">Campaign Title:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input
                                type="text"
                                id="campaign-title"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                placeholder="Enter Campaign Title"
                                value={campaignTitle}
                                onChange={e => setCampaignTitle(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Campaign Description Input */}
                    <div>
                        <label htmlFor="campaign-description" className="inline-block py-[7px] text-sm font-medium">Campaign Description:</label>
                        <div className="w-full relative inline-flex items-center">
                <textarea
                    id="campaign-description"
                    className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                    placeholder="Enter Campaign Description"
                    value={campaignDescription}
                    onChange={e => setCampaignDescription(e.target.value)}
                />
                        </div>
                    </div>
                </div>
                {/* Start and End Date Inputs */}
                <div className="col-span-12 grid grid-cols-2 gap-x-4">
                    {/* Start Date Input */}
                    <div>
                        <label htmlFor="start-date" className="inline-block py-[7px] text-sm font-medium">Start Date:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input
                                type="date"
                                id="start-date"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* End Date Input */}
                    <div>
                        <label htmlFor="end-date" className="inline-block py-[7px] text-sm font-medium">End Date:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input
                                type="date"
                                id="end-date"
                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Department and Employee Selection */}
            <div className="grid grid-cols-12 gap-x-4 gap-y-4">
                {/* Department Dropdown Button */}
                <div className="col-span-6">
                    <label htmlFor="department-select" className="inline-block py-[7px] text-sm font-medium">Department:</label>
                    <div className="w-full relative flex items-center">
                        <select id="department"
                                className="w-full appearance-none text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                        >
                            <option className="rounded">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept._id}>{dept.departmentName}</option>
                            ))}
                        </select>
                        <svg
                            className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                            aria-hidden="true" fill="none" viewBox="0 0 10 6"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="2" d="m1 1 4 4 4-4"/>
                        </svg>
                    </div>
                </div>
                {/* Employee Selection */}
                {department && (
                    <div className="col-span-6">
                        <label htmlFor="employee-selection" className="inline-block py-[7px] text-xs font-medium">Employee Selection:</label>
                        <div className="employee-selection-container border-2 border-gray-300 p-4 rounded space-y-2 overflow-auto">
                            {[{header: true}, ...employees].map((item, index) => (
                                <div key={item._id || 'header'} className="grid grid-cols-4 items-center space-x-2" style={{ gridTemplateColumns: 'auto 1fr 2fr 1fr' }}>
                                    {item.header ? (
                                        <>
                                            <div></div>
                                            <div style={{fontWeight: 'bold'}}>No.</div>
                                            <div style={{fontWeight: 'bold'}}>Full Name</div>
                                            <div style={{fontWeight: 'bold'}}>Designation</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    id={`employee-${item._id}`}
                                                    value={item._id}
                                                    checked={selectedEmployees.some(e => e._id === item._id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setSelectedEmployees([...selectedEmployees, item]);
                                                        } else {
                                                            setSelectedEmployees(selectedEmployees.filter(e => e._id !== item._id));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div>{index}</div>
                                            <div className="flex items-center space-x-2">
                                                <label htmlFor={`employee-${item._id}`}>{item.name}</label>
                                            </div>
                                            <div>{designations.find(designation => designation._id === item.designation)?.name}</div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Selected Employees */}
            {selectedEmployees.length > 0 && (
                <div className="grid grid-cols-12 gap-x-4 gap-y-4">
                    <div className="col-span-12">
                        <Table

                            header={[...headers, "Actions"]}
                            data={selectedEmployees.map(employee => [
                                employee.name,
                                departments.find(dept => dept._id === employee.department)?.departmentName,
                                designations.find(designation => designation._id === employee.designation)?.name,
                                'G' + jobGrades.find(jobGrade => jobGrade._id === employee.jobGrade)?.jobGradeName,
                                <Button onClick={() => handleRemove(employee)}>Remove</Button>
                            ])}
                        />
                    </div>
                </div>
            )}
            {/* Create Survey Button */}
            {selectedEmployees.length > 0 && (
                <div className="flex justify-center items-center mt-4">
                    <Button colorType="primary" onClick={handleCreateSurvey}>Create Survey</Button>
                </div>
            )}
        </div>
    );
};
export default SurveyModal;