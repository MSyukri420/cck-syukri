import { useState, useEffect, useContext, useRef } from 'react';
import { PlatformContext } from "./Layout/PlatformLayout.jsx";
import Button from "./Button.jsx";
import axios from "axios";
import Modal from "./Modal.jsx";
import SurveyPreview from "./SurveyPreview.jsx";
import TextareaAutosize from 'react-textarea-autosize';
import {useNavigate, useParams} from "react-router-dom";

const SurveyQuestionnaire = () => {
    const {surveyId} = useParams();

    // SurveyQuestionnaire.jsx Data Parsing Handling
    const surveyData = JSON.parse(sessionStorage.getItem('surveyData')) || {};
    const [surveyTitle, setSurveyTitle] = useState(surveyData.surveyTitle || '');
    const [surveyDescription, setSurveyDescription] = useState(surveyData.surveyDescription || '');
    const [startDate, setStartDate] = useState(surveyData.startDate || '');
    const [endDate, setEndDate] = useState(surveyData.endDate || '');
    const [selectedEmployees, setSelectedEmployees] = useState(surveyData.selectedEmployees || []);
    const modalRef = useRef();

    // Survey Duration Calculation Handling
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Page Header Handling
    const platformCtx = useContext(PlatformContext);

    const navigate = useNavigate();

    useEffect(() => {
        platformCtx.setPage("Performance Survey");
        platformCtx.setBreadcrumb([
            {name: "Home"},
            {name: "Performance Survey", path: "/performance-survey"},
            {name: "Survey Questionnaire", path: "/survey-questionnaire"}
        ]);
    }, []);

    useEffect(() => {
        if(surveyId) {
            axios.get(`/survey/${surveyId}`)
                .then(response => {
                    const survey = response.data.survey;
                    setSurveyTitle(survey.campaignName);
                    setSurveyDescription(survey.campaignDescription);
                    setStartDate(survey.campaignStartDate);
                    setEndDate(survey.campaignEndDate);
                    setSelectedEmployees(survey.employees);
                    setQuestionCard(survey.questions.map(question => ({
                        title: question.question,
                        lowest: question.low,
                        highest: question.high
                    })));

                    // Store data in sessionStorage
                    sessionStorage.setItem('surveyData', JSON.stringify({
                        surveyTitle: survey.campaignName,
                        surveyDescription: survey.campaignDescription,
                        questionCard: survey.questions.map(question => ({
                            title: question.question,
                            lowest: question.low,
                            highest: question.high
                        })),
                        selectedEmployees: survey.employees
                    }));
                })
                .catch(error => {
                    console.error('Error fetching survey:', error);
                });
        }
    }, []);

    const handleNavigatePreview = () => {
        // Data Parsing Handling
        const surveyData = { surveyTitle, surveyDescription, questionCard, selectedEmployees };

        // Store data in sessionStorage
        sessionStorage.setItem('surveyData', JSON.stringify(surveyData));

        // Open the modal
        modalRef.current.openModal();
    };



    // Send Survey Button Handling
    const handleNavigateSend = () => {
        let payload = {
            campaignId: surveyId?? undefined,
            campaignName: surveyTitle,
            campaignDescription: surveyDescription,
            campaignStartDate: startDate,
            campaignEndDate: endDate,
            employees: !surveyId? selectedEmployees.map((employee) => employee._id) : undefined,
            questions: questionCard.map((card) => ({
                question: card.title,
                low: card.lowest,
                high: card.highest
            }))
        };

        const submitSurvey = async () => {
            try {
                let response;

                if(surveyId) {
                    response = await axios.post(`/update-survey`, payload);
                } else {
                    response = await axios.post('/create-survey', payload);
                }

                const data = response.data;

                if (data.success) {
                    platformCtx.setAlert({message: data.message, type: 'success'});
                    sessionStorage.removeItem('surveyData');
                    navigate(-1);
                } else {
                    platformCtx.setAlert({message: data.message, type: 'danger'});
                }
            } catch (error) {
                console.error('Error submitting survey:', error);
            }
        }

        submitSurvey().then(() => {
            console.log('Survey submitted successfully');
        });
    }

    // SurveyPreview.jsx Data Parsing Handling
    useEffect(() => {
        const surveyData = JSON.parse(sessionStorage.getItem('surveyData')) || {};
        setSurveyTitle(surveyData.surveyTitle || '');
        setSurveyDescription(surveyData.surveyDescription || '');
        setQuestionCard(surveyData.questionCard || [{ title: '', lowest: '', highest: '' }]);
    }, []);

// Add Question Card Handling
    const [questionCard, setQuestionCard] = useState(surveyData.questionCard || [{ title: '', lowest: '', highest: '' }]);

    const handleAddQuestionCard = () => {
        // Add a new question card to the array
        setQuestionCard(
            [
                // `...` spread operator - takes all the elements from the `questionCard` array
                ...questionCard,
                // Then add a new object to store question's `title`
                { title: '', lowest: '', highest: '' }
            ]
        );
    };

    // Delete Question Card Handling
    const handleDeleteQuestionCard = (index) => {
        // Create a new array and matches all elements' indexes and exclude the one needed to be removed.
        const updatedQuestionCards = questionCard.filter(
            // This function requires two arguements but only the second one - `i` is needed
            // `_` is used as a placeholder as the current element is not in use.
            (_, i) =>
                // `i` is a variable name represeting the index of each element in `addQuestionCard` array.
                i !== index
        );
        // Update the state with the new array
        setQuestionCard(updatedQuestionCards);
    };

    const inputDateFormatter = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    return (
        <div>
            {/* Page Header */}
            <div className="mb-[1.875rem] flex items-center">
                <div className="ml-auto space-x-2">
                    {/* Preview Button */}
                    <Button colorType="danger" onClick={handleNavigatePreview}>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined">visibility</span>
                            <span className="font-medium">Preview</span>
                        </span>
                    </Button>
                    {/* Send Button */}
                    <Button colorType="danger" onClick={handleNavigateSend}>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined">mail</span>
                            <span className="font-medium">Send</span>
                        </span>
                    </Button>
                </div>
            </div>
            {/* Survey Title Card */}
            <div className="mb-[30px] bg-white border border-gray-200 rounded-md shadow-md">
                {/* Card Body */}
                <div className="p-[16px]">
                    <div className="pb-3 space-y-3 border-b">
                        {/* Survey Title */}
                        <input
                            type="text"
                            className="w-full text-gray-900 rounded-md text-4xl px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none leading-tight font-medium"
                            value={surveyTitle}
                            onChange={e => setSurveyTitle(e.target.value)}
                            placeholder="Enter Survey Title"
                        />
                        {/* Survey Description */}
                        <TextareaAutosize
                            className="w-full text-gray-900 rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            placeholder="Enter Survey Description"
                            value={surveyDescription}
                            onChange={e => setSurveyDescription(e.target.value)}
                        />
                    </div>
                    <div className="pt-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Selected Employee(s) */}
                            <div className="col-span-1 px-6 py-3 bg-gray-100 rounded-md">
                                <p className="font-medium pb-3">Selected Employee(s):</p>
                                {/* Employee Selection Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 border rounded-full">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Full Name</th>
                                                <th scope="col" className="px-6 py-3">Department</th>
                                                <th scope="col" className="px-6 py-3">Designation</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(surveyData.selectedEmployees || []).length > 0 ? (
                                                (surveyData.selectedEmployees || []).map((employee, index) => (
                                                        <tr key={employee._id} className={`bg-white ${index !== surveyData.selectedEmployees.length - 1 ? 'border-b' : ''}`}>
                                                            <td className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                                                                <img className="w-10 h-10 rounded-full" src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`} alt={employee.employeeId} />
                                                                <div className="ps-3">
                                                                    <div className="text-base font-semibold">{employee.name}</div>
                                                                    <div className="font-normal text-gray-500">{employee.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {employee.department?.departmentName}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {employee.designation?.name}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td className="px-6 py-4" colSpan="3">No data available</td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Survey Period */}
                            <div className="col-span-1 px-6 py-3 bg-gray-100 rounded-md">
                                <p className="font-medium pb-3">Survey Period:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                    <div className="col-span-1">
                                        <label htmlFor="start-date" className="inline-block py-[7px] text-xs font-medium">Start Date:</label>
                                        <div className="w-full relative inline-flex items-center">
                                            <input
                                                type="date"
                                                id="start-date"
                                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                                // Get formatted date in yyyy-mm-dd format
                                                value={inputDateFormatter(startDate)}
                                                onChange={e => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label htmlFor="end-date" className="inline-block py-[7px] text-xs font-medium">End Date:</label>
                                        <div className="w-full relative inline-flex items-center">
                                            <input
                                                type="date"
                                                id="end-date"
                                                className="w-full text-gray-900 bg-white hover:bg-gray-50 font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                                value={inputDateFormatter(endDate)}
                                                onChange={e => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-start-1 md:col-start-2 text-right">
                                        <p className="text-sm">Duration: {diffDays} days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Questionnaire Cards */}
            {questionCard.map((card, index) => (
                <div key={index}>
                    {/* Questionnaire Card */}
                    <div className={`mb-[30px] bg-white rounded-md shadow-md ring-1 ring-gray-200 ${index === questionCard.length - 1 ? 'border-l-8 border-red-500 border-opacity-80' : ''}`}>
                        {/* Card Body */}
                        <div className="p-[16px]">
                            {/* Card Content */}
                            <div className="px-[12px]">
                                <div className="flex justify-start gap-8">
                                    {/* Question Title */}
                                    <div className="w-full flex gap-4">
                                        <p className="text-xl font-medium">{index + 1}.</p>
                                        <input
                                            type="text"
                                            className="p-2 flex-grow bg-gray-200 bg-opacity-80 rounded-md focus:outline-none"
                                            placeholder="Untitled Question"
                                            value={card.title}
                                            onChange={e => {
                                                const newQuestionCard = [...questionCard];
                                                newQuestionCard[index].title = e.target.value;
                                                setQuestionCard(newQuestionCard);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Question Type Selection */}
                            <div>
                                {/* Question Type - Linear Scale */}
                                <div className="mt-4 flex items-center gap-x-4 text-sm">
                                    <span>Linear Scale:</span>
                                    <span className="px-2.5 border text-lg font-medium rounded-full">1</span>
                                    <span>to</span>
                                    <span className="px-2.5 border text-lg font-medium rounded-full">5</span>
                                </div>
                                {/* Lowest Rating Input */}
                                <div className="mt-4">
                                    <span className="px-2.5 py-0.5 border text-lg font-medium rounded-full">1</span><span> - </span>
                                    <input 
                                        type="text"
                                        className="w-2/4 p-2 border-b bg-white focus:outline-none"
                                        placeholder="Lowest Rating"
                                        value={card.lowest}
                                        onChange={e => {
                                            const newQuestionCard = [...questionCard];
                                            newQuestionCard[index].lowest = e.target.value;
                                            setQuestionCard(newQuestionCard);
                                        }}
                                    />
                                </div>
                                {/* Highest Rating Input */}
                                <div className="mt-4">
                                    <span className="px-2.5 py-0.5 border text-lg font-medium rounded-full">5</span><span> - </span>
                                    <input 
                                        type="text"
                                        className="w-2/4 p-2 border-b bg-white focus:outline-none"
                                        placeholder="Highest Rating"
                                        value={card.highest}
                                        onChange={e => {
                                            const newQuestionCard = [...questionCard];
                                            newQuestionCard[index].highest = e.target.value;
                                            setQuestionCard(newQuestionCard);
                                        }}
                                    />
                                </div>
                            </div>
                            <hr className="my-[16px]"/>
                            <div className="flex justify-end">
                                {/* Manage Question Card Buttons */}
                                <div className="space-x-2">
                                    {/* Add Question Card Button */}
                                    <button
                                        className="px-[12px] py-[6px] bg-red-500 bg-opacity-80 text-white rounded-md ring-1 ring-inset ring-red-400 shadow-sm"
                                        onClick={handleAddQuestionCard}
                                    >
                                        <span className="flex items-center">
                                            <span className="material-symbols-outlined">add</span>
                                        </span>
                                    </button>
                                    {/* Delete Question Card Button */}
                                    <button
                                        className="px-[12px] py-[6px] bg-red-500 bg-opacity-80 text-white rounded-md ring-1 ring-inset ring-red-400 shadow-sm"
                                        onClick={() => handleDeleteQuestionCard(index)}
                                    >
                                        <span className="flex items-center">
                                            <span className="material-symbols-outlined">delete</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <Modal ref={modalRef} title="Preview Survey">
                <SurveyPreview surveyTitle={surveyTitle} surveyDescription={surveyDescription} questionCard={questionCard} selectedEmployees={selectedEmployees} startDate={startDate} endDate={endDate} />
            </Modal>
        </div>
    );
};

export default SurveyQuestionnaire;