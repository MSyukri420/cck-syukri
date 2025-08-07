import React, {useState, useEffect, useContext, useRef} from 'react';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import {Link, useNavigate} from 'react-router-dom';
import Table from "./Table.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import AddSurveyModal from "./AddSurveyModal.jsx";
import axios from "axios";

const PerformanceSurveyStatus = ({surveyId}) => {
    const [survey, setSurvey] = useState(null);
    const [employeesNotCompleted, setEmployeesNotCompleted] = useState([]);
    const [employeesCompleted, setEmployeesCompleted] = useState([]);

    useEffect(() => {
        const getSurveyStatus = async () => {
            try {
                const response = await axios.get(`/survey/${surveyId}/status`);
                const data = response.data;

                if (data.success) {
                    setSurvey(data.survey);
                    setEmployeesNotCompleted(data.employeesNotCompleted);
                    setEmployeesCompleted(data.employeesCompleted);
                } else {
                    console.error(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        }

        getSurveyStatus().then(() => {
            console.log("Survey status fetched!");
        });
    }, [surveyId]);

    return survey && (
        <div className="flex flex-col gap-6">
            <p>Employees completed their survey:</p>
            <div className="flex flex-col gap-4">
                {employeesCompleted.length === 0 && (
                    <div className="flex flex-row gap-2 items-center">
                        <span className="material-icons-outlined text-red-500">error</span>
                        <p>No employees have completed the survey yet.</p>
                    </div>
                )}
                {employeesCompleted.map((employee, index) => (
                    <div className="flex flex-row gap-4">
                        <img src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`} alt={employee.employeeId} className="rounded-full object-cover w-12 h-12"/>
                        <div className="flex flex-col gap-1">
                            <p>{employee.name}</p>
                            <div className="flex flex-row gap-2 items-center text-sm text-slate-500">
                                <p>{employee.department?.departmentName}</p>
                                <span className="material-icons" style={{fontSize: "5px"}}>circle</span>
                                <p>{employee.designation?.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p>Employees yet to complete their survey:</p>
            <div className="flex flex-col gap-4">
                {employeesNotCompleted.length === 0 && (<div className="flex flex-row gap-2 items-center">
                    <span className="material-icons text-green-500">check</span>
                    <p>All employees have completed the survey.</p>
                </div>)}
                {employeesNotCompleted.map((employee, index) => (
                    <div className="flex flex-row gap-4">
                        <img src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`} alt={employee.employeeId} className="rounded-full object-cover w-12 h-12"/>
                        <div className="flex flex-col gap-1">
                            <p>{employee.name}</p>
                            <div className="flex flex-row gap-2 items-center text-sm text-slate-500">
                                <p>{employee.department?.departmentName}</p>
                                <span className="material-icons" style={{fontSize: "5px"}}>circle</span>
                                <p>{employee.designation?.name}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const PerformanceSurveyDeleteModal = ({survey, onSubmit}) => {
    async function handleDelete () {
        // Delete the survey
        try {
            const response = await axios.post(`/survey/delete`, {
                surveyId: survey._id
            });
            const data = response.data;

            onSubmit?.(data);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <p>Are you sure you want to delete this performance survey?</p>
            <div className="flex flex-col gap-4 p-6 text-sm rounded-md bg-slate-200">
                <div className="flex flex-row gap-2">
                    <p className="font-medium">Survey Title:</p>
                    <p>{survey.campaignName}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-medium">Number of Questions:</p>
                    <p>{survey.questions.length}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-medium">Number of Employees:</p>
                    <p>{survey.employees.length}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-medium">Creation Date:</p>
                    <p>{new Date(survey.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-medium">Status:</p>
                    <p>{survey.employees.length === survey.completed.length ? "Completed" : "Incomplete"}</p>
                </div>
            </div>
            <p>You may want to <Link className="text-blue-500 underline" target={"_blank"} to={`${axios.defaults.baseURL}/survey/${survey._id}/get-all-responses`}>download all records for this survey</Link> before deletion. You cannot undo this action!</p>
            <Button colorType={"primary"} onClick={handleDelete}>Delete</Button>
        </div>
    );
}

const PerformanceSurvey = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    // Page Header Handling
    const platformCtx = useContext(PlatformContext);

    useEffect(() => {
        platformCtx.setPage("Performance Survey");
        platformCtx.setBreadcrumb([
            {name: "Home"},
            {name: "Performance Survey", path: "/performance-survey"}
        ]);
    }, []);

    // Add Survey Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);
    const modalRef = useRef();

    const handleModalOpen = (content, title) => {
        setModalContent(() => content);
        setModalTitle(() => title);
        modalRef.current?.openModal();
    };

    const handleModalClose = (res) => {
        setLoading(true);
        modalRef.current?.closeModal();

        if(res.success) {
            platformCtx.setAlert({message: res.message, type: "success"});
        } else {
            platformCtx.setAlert({message: res.message, type: "danger"});
        }
    }

    // Component Navigation Handling
    const navigate = useNavigate();


    const handleNavigateSurveyQuestionnaire = (surveyId) => {
        // Navigate to the SurveyQuestionnaire.jsx
        navigate(`/survey-questionnaire/${surveyId}`);
    };

    useEffect(() => {
        const getSurvey = async () => {
            try {
                // Fetch survey data from the backend
                const response = await axios.get('/survey');

                const data = response.data;

                if (data.success) {
                    setSurveys(data.surveys);
                } else {
                    console.error(data.message);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        getSurvey().then(() => {
            console.log("Survey data fetched!");
        });
    }, [loading]);

    return (
        <div>
            {/* Page Header */}
            <div className="mb-[1.875rem] flex items-center">
                <div className="ml-auto">
                    {/* Add Survey Modal Button */}
                    <button
                        className="px-[12px] py-[6px] text-white bg-red-500 bg-opacity-80 rounded-md ring-1 ring-inset ring-red-400 shadow-sm"
                        onClick={() => handleModalOpen(<AddSurveyModal/>, "Add Survey")}
                    >
                        <span className="flex items-center">
                            <span className="material-symbols-outlined">add</span>
                            <span className="font-medium">Add Survey</span>
                        </span>
                    </button>
                </div>
                <Modal ref={modalRef} title={modalTitle}>{modalContent}</Modal>
            </div>
            <Table
                header={["#", "Survey Title", "Number of  Question(s)", "Number of Employee(s)", "Creation Date", "Status", "Action"]}
                data={surveys.map((survey, index) => {
                    return [
                        index + 1,
                        survey.campaignName,
                        survey.questions.length,
                        survey.employees.length,
                        new Date(survey.createdAt).toLocaleDateString(),
                        <div 
                            key={survey._id}
                            onClick={() => handleModalOpen(<PerformanceSurveyStatus surveyId={survey._id}/>, "Survey Status")}
                            className="flex items-center cursor-pointer py-2 text-black"
                        >
                            <div 
                                className={`h-2.5 w-2.5 rounded-full ${survey.employees.length === survey.completed.length ? "bg-green-500" : "bg-red-500"} me-2`}
                            ></div> 
                            <span>{survey.employees.length === survey.completed.length ? "Complete" : "Incomplete"}</span>
                        </div>,
                        <div className="flex flex-row gap-2">
                            <span className="material-icons cursor-pointer"
                                  onClick={() => handleNavigateSurveyQuestionnaire(survey._id)}>edit</span>
                            <Link to={`stats/${survey._id}`}>
                                <span className="material-icons-outlined cursor-pointer">area_chart</span>
                            </Link>
                            <span className="material-icons text-red-500 cursor-pointer" onClick={() => handleModalOpen(<PerformanceSurveyDeleteModal survey={survey} onSubmit={handleModalClose} />, "Delete Survey")}>delete</span>
                        </div>
                    ];
                })}
            />
        </div>
    );
};

export default PerformanceSurvey;