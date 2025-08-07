import {useContext, useEffect, useReducer, useRef, useState} from "react";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import SurveyPreview from "./SurveyPreview.jsx";
import Chart from "react-apexcharts";

function statisticsReducer(state, action) {
    switch(action.type) {
        case "SET_AVERAGE_RATING":
            return {
                ...state,
                averageChartData: {
                    options: {
                        title: {
                            text: "Ratings for Survey Questions",
                            align: "center"
                        },
                        chart: {
                            type: "bar",
                            height: 500,
                        },
                        plotOptions: {
                            bar: {
                                horizontal: true,
                                dataLabels: {
                                    position: "top",
                                },
                            },
                        },
                        dataLabels: {
                            enabled: true,
                            offsetX: -6,
                            style: {
                                fontSize: "12px",
                                colors: ["#fff"],
                            },
                        },
                        stroke: {
                            show: true,
                            width: 1,
                            colors: ["#fff"],
                        },
                        tooltip: {
                            shared: true,
                            intersect: false,
                        },
                        xaxis: {
                            categories: action.data.map((_, index) => `Q${index + 1}`),
                        },
                    },
                    series: [
                        {
                            name: "Average Rating",
                            data: action.data.map((question) => Math.round(question.averageRating)),
                        },
                        {
                            name: "Lowest Rating",
                            data: action.data.map((question) => Math.round(question.lowestRating)),
                        },
                        {
                            name: "Highest Rating",
                            data: action.data.map((question) => Math.round(question.highestRating)),
                        },
                    ],
                }
            }
        case "SET_RATING_DISTRIBUTION":
            return {
                ...state,
                // Assuming rating distribution for each question is formatted {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}, stack bar chart
                ratingDistribution: [
                    ...action.data.map((question, index) => {
                        // Pie chart for distribution of ratings
                        let options = {
                            title: {
                                text: `Rating Distribution for Q${index + 1}`,
                                align: "center",
                            },
                            chart: {
                                type: "pie",
                                height: 300,
                            },
                            labels: ["1", "2", "3", "4", "5"].map((rating) => `Rating: ${rating}`),
                            responsive: [
                                {
                                    breakpoint: 480,
                                    options: {
                                        chart: {
                                            width: 400,
                                        },
                                        legend: {
                                            position: "bottom",
                                        },
                                    },
                                },
                            ],
                        };

                        let series = [...Object.values(question.ratingDistribution)];

                        return {
                            options,
                            series,
                        }
                    }),
                ],
            }
        case "SET_EMPLOYEE_DEPARTMENT_DISTRIBUTION":
            // Arrange employee by their department name
            const departmentDistribution = action.data.reduce((acc, employee) => {
                if(acc[employee.department.departmentName]) {
                    acc[employee.department.departmentName].employeeCount++;
                } else {
                    acc[employee.department.departmentName] = {
                        employeeCount: 1,
                        departmentName: employee.departmentName,
                    };
                }

                return acc;
            }, {});

            let employeeDepartmentDistribution = {
                    options: {
                        title: {
                            text: "Employee Distribution by Department",
                            align: "center",
                        },
                        chart: {
                            type: "donut",
                            width: 300,
                        },
                        labels: Object.keys(departmentDistribution),
                        responsive: [
                            {
                                breakpoint: 480,
                                options: {
                                    chart: {
                                        width: 400,
                                    },
                                    legend: {
                                        position: "bottom",
                                    },
                                },
                            },
                        ],
                    },
                    series: Object.values(departmentDistribution).map((department) => department.employeeCount),
                };

            return {
                ...state,
                employeeDepartmentDistribution
            }
    }
}

function PerformanceSurveyStats() {
    const {surveyId} = useParams();
    const platformCtx = useContext(PlatformContext);

    const [ratingDistributionIndex, setRatingDistributionIndex] = useState(0);
    const [surveyResponsesIndex, setSurveyResponsesIndex] = useState(0);

    const [surveyData, setSurveyData] = useState(null);
    const [chartData, dispatchChartData] = useReducer(statisticsReducer, {});

    // Add Survey Modal Handling
    const [modalContent, setModalContent] = useState(null);
    const [modalTitle, setModalTitle] = useState(null);
    const modalRef = useRef();

    const handleModalOpen = (content, title) => {
        setModalContent(content);
        setModalTitle(title);
        modalRef.current?.openModal();
    };

    useEffect(() => {
        platformCtx.setPage("Performance Survey Stats");
        platformCtx.setBreadcrumb([
            {name: "Home", path: "/"},
            {name: "Performance Survey", path: "/performance-survey"},
            {name: "Stats", path: "/performance/survey/stats"}
        ]);
    }, []);

    useEffect(() => {
        // Fetch survey data
        const fetchSurvey = async () => {
            try {
                const response = await axios.get(`survey/${surveyId}/stats`);

                if (response.status === 200) {
                    setSurveyData(response.data);
                    dispatchChartData({
                        type: "SET_AVERAGE_RATING",
                        data: response.data.averageRatings
                    });
                    dispatchChartData({
                        type: "SET_RATING_DISTRIBUTION",
                        data: response.data.averageRatings
                    });
                    dispatchChartData({
                        type: "SET_EMPLOYEE_DEPARTMENT_DISTRIBUTION",
                        data: response.data.survey.employees
                    });
                } else {
                    console.error("Failed to fetch survey data");
                }
            } catch (e) {
                console.error(e);
            }
        }

        fetchSurvey().then(() => {
            console.log("Survey data fetched");
        });
    }, []);

    function handleRatingDistributionPrev() {
        setRatingDistributionIndex((prev) => {
            if(prev - 1 < 0) {
                return prev;
            } else {
                return surveyData.survey.questions.length - 1;
            }
        });
    }

    function handleRatingDistributionNext() {
        setRatingDistributionIndex((prev) => {
            if(prev + 1 >= surveyData.survey.questions.length) {
                return 0;
            } else {
                return prev + 1;
            }
        });
    }

    function handleSurveyResponsesPrev() {
        setSurveyResponsesIndex((prev) => {
            if(prev - 1 < 0) {
                return prev;
            } else {
                return surveyData.surveyResponses.length - 1;
            }
        });
    }

    function handleSurveyResponsesNext() {
        setSurveyResponsesIndex((prev) => {
            if(prev + 1 >= surveyData.surveyResponses.length) {
                return 0;
            } else {
                return prev + 1;
            }
        });
    }

    return surveyData && (<>
        <Modal ref={modalRef} title={modalTitle}>
            {modalContent}
        </Modal>
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white">
                <p className="font-medium text-lg">{surveyData.survey.campaignName}</p>
                <p className="font-medium">Campaign Description:</p>
                <p className="text-gray-500 text-sm">{surveyData.survey.campaignDescription}</p>
                <div className="flex flex-row gap-4">
                    <Link to={`/survey-questionnaire/${surveyId}`}>
                        <Button>
                            <div className="flex flex-row gap-1 items-center text-sm">
                                <span className="material-icons text-lg">edit</span>
                                <span>Edit Survey</span>
                            </div>
                        </Button>
                    </Link>
                    <Button onClick={() => handleModalOpen(
                        <SurveyPreview
                            surveyTitle={surveyData.survey.campaignName}
                            surveyDescription={surveyData.survey.campaignDescription}
                            questionCard={surveyData.survey.questions.map((question) => ({
                                title: question.question,
                                low: question.low,
                                high: question.high
                            }))}
                            selectedEmployees={surveyData.survey.employees}
                            startDate={surveyData.survey.campaignStartDate}
                            endDate={surveyData.survey.campaignEndDate}
                        />,
                        "Survey Preview"
                    )}>
                        <div className="flex flex-row gap-1 items-center text-sm">
                            <span className="material-icons text-lg">preview</span>
                            <span>Preview Survey</span>
                        </div>
                    </Button>
                    <Link to={`${axios.defaults.baseURL}/survey/${surveyId}/get-all-responses`} target="_blank">
                        <Button>
                            <div className="flex flex-row gap-1 items-center text-sm">
                                <span className="material-icons text-lg">download</span>
                                <span>Download all records</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col gap-2 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white">
                <p className="font-medium">Survey Questions</p>
                {surveyData.survey.questions.map((question, index) => (
                    <p className="text-sm"><span className="font-medium">Q{index + 1}:</span> {question.question}</p>
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-6 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white md:flex-1 w-full">
                    <p>Employees that have submitted the survey</p>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-64">
                        {surveyData.employeesWhoCompleted.map((employee) => (
                            <div className="flex flex-row gap-4 items-center text-sm">
                                <img src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`} alt={employee.employeeId} className="rounded-full object-cover w-10 h-10"/>
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
                <div
                    className="flex flex-col gap-2 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white md:flex-1 w-full">
                    <p>Employees that have not submitted the survey</p>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-64">
                        {surveyData.employeesWhoDidNotComplete.map((employee) => (
                            <div className="flex flex-row gap-4 items-center text-sm">
                                <img src={`${axios.defaults.baseURL}/avatars/${employee.employeeId}`}
                                     alt={employee.employeeId} className="rounded-full object-cover w-10 h-10"/>
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
            </div>
            <div className="flex flex-wrap gap-4">
                <div
                    className="flex flex-col gap-2 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white flex-1 lg:w-1/2 sm:w-full items-center">
                    <Chart options={chartData.employeeDepartmentDistribution.options}
                           series={chartData.employeeDepartmentDistribution.series} type="donut" height={300} width={400}/>
                </div>
                <div
                    className="flex flex-col gap-2 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white flex-1 lg:w-1/2 sm:w-full items-center justify-center">
                    {surveyData.surveyResponses.length === 0 && (<p>No data of rating distribution yet to show.</p>)}

                    {surveyData.surveyResponses.length > 0 && (<>
                        <Chart options={chartData.ratingDistribution[ratingDistributionIndex].options}
                               series={chartData.ratingDistribution[ratingDistributionIndex].series}
                               type="pie" height={300} width={400}/>
                        <div className="flex flex-row justify-evenly gap-6 my-6">
                        <span className="material-icons cursor-pointer"
                              onClick={handleRatingDistributionPrev}>chevron_left</span>
                            <span className="material-icons cursor-pointer"
                                  onClick={handleRatingDistributionNext}>chevron_right</span>
                        </div>
                    </>)}
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {/* Question average rating statistics */}
                <div
                    className="flex flex-col gap-2 w-full md:flex-1 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white">
                    {surveyData.surveyResponses.length === 0 && (<p>Not enough data to shoe average rating.</p>)}
                    {surveyData.surveyResponses.length > 0 && (<Chart options={chartData.averageChartData.options} series={chartData.averageChartData.series}
                                                                     type="bar" height={500}/>)}
                </div>
                <div className="flex flex-col gap-4 rounded-md shadow-md ring-1 ring-gray-200 p-4 bg-white md:flex-1 sm:w-full">
                    {surveyData.surveyResponses.length === 0 && (<p>No data of survey responses yet to show.</p>)}
                    {surveyData.surveyResponses.length > 0 && (<>
                        <div className="flex flex-row justify-between">
                            <span className="material-icons cursor-pointer"
                                  onClick={handleSurveyResponsesPrev}>chevron_left</span>
                            <p className="font-medium text-center">Survey Responses</p>
                            <span className="material-icons cursor-pointer"
                                  onClick={handleSurveyResponsesNext}>chevron_right</span>
                        </div>
                        <div className="flex flex-col gap-6 overflow-y-auto max-h-[30rem]">
                            <p>Employee Details:</p>
                            <div className="flex flex-col gap-4 p-4 rounded-md bg-slate-100 text-sm">
                                <div className="flex flex-row gap-2">
                                    <p className="font-bold">Name:</p>
                                    <p>{surveyData.surveyResponses[surveyResponsesIndex].user.name}</p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <p className="font-bold">Department:</p>
                                    <p>{surveyData.surveyResponses[surveyResponsesIndex].user.department?.departmentName || "Not available"}</p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <p className="font-bold">Designation:</p>
                                    <p>{surveyData.surveyResponses[surveyResponsesIndex].user.designation?.name || "Not available"}</p>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <p className="font-bold">Job Grade:</p>
                                    <p>{surveyData.surveyResponses[surveyResponsesIndex].user.jobGrade ? `G${surveyData.surveyResponses[surveyResponsesIndex].user.jobGrade.jobGradeName}` : "Not Available"}</p>
                                </div>
                            </div>
                            <p>Survey Questions</p>
                            <div className="flex flex-col gap-4 p-4 rounded-md bg-slate-100 text-sm">
                                {surveyData.surveyResponses[surveyResponsesIndex].responses.map((response, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <p className="font-bold">{response.question}</p>
                                        <p>Answer: {response.rating} / 5</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    </>)
}

export default PerformanceSurveyStats;