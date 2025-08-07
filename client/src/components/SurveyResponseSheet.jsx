import {useContext, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AuthenticationContext} from "./Provider/AuthenticationProvider.jsx";
import axios from "axios";
import logo from "../../images/cck-logo.png";
import Button from "./Button.jsx";
import {PlatformContext} from "./Layout/PlatformLayout.jsx";

function SurveyResponseSheet({surveyId}) {
    const params = useParams();
    const query = new URLSearchParams(location.search);
    const navigate = useNavigate();

    const authCtx = useContext(AuthenticationContext);
    const platformCtx = useContext(PlatformContext);

    const [inputs, setInputs] = useState([]);

    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [surveyDetails, setSurveyDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check platform context
        if(platformCtx) {
            platformCtx.setPage("Survey Response Sheet");
            platformCtx.setBreadcrumb([
                {name: "Home", path: "/dashboard"},
                {name: "Survey Response Sheet", path: "/survey-response-sheet"}
            ]);
        }
    })

    useEffect(() => {
        const getSurveyResponseSheet = async () => {
            try {
                let response;

                if(surveyId || params.surveyId) {
                    console.log("Survey ID provided!");
                    // Fetch survey responses, assume that user is also authenticated
                    response = await axios.get(`/respond-to-survey/${surveyId || params.surveyId}`);
                } else if(query.has("token")) {
                    console.log("Token provided!");
                    // Send a get request with only the token
                    response = await axios.get(`/respond-to-survey/?token=${query.get("token")}`);
                } else {
                    console.error("No survey ID or token provided!");
                    if(authCtx.isAuthenticated) {
                        navigate("/dashboard");
                    } else {
                        navigate("/");
                    }
                }

                response = response.data;

                if(response.success) {
                    setEmployeeDetails(response.user);
                    setSurveyDetails(response.survey);

                    // Populate the inputs array with the questions
                    setInputs(response.survey.questions.map(question => ({
                        question: question.question,
                        low: question.low,
                        high: question.high,
                        rating: null
                    })));
                } else {
                    console.error(response.error);
                    setError(response.data.message);
                }
            } catch (e) {
                console.error(e);
                setError(e.response.data.message);
            }
        }

        getSurveyResponseSheet().then(() => {
            console.log("Survey response sheet fetched!");
        });
    }, []);

    function handleAnswerPick(questionNumber, selection) {
        // Handle the answer selection
        setInputs(inputs.map((input, index) => {
            if(index === questionNumber) {
                return {
                    ...input,
                    rating: selection
                };
            }

            return input;
        }));

    }

    async function handleSubmit() {
        try {
            // If token isn't present
            let token;

            if(!query.has("token")) {
                // Fetch token from the backend
                const response = await axios.post("/survey-response/token", {
                    surveyId: surveyId || params.surveyId,
                    userId: authCtx.user._id
                });

                token = response.data.token;
            } else {
                token = query.get("token");
            }

            // Submit survey response
            const response = await axios.post(`/create-survey-response`, {
                token,
                responses: inputs.map((input) => ({
                    question: input.question,
                    rating: input.rating
                }))
            })

            setError(response.data.message);
        } catch (e) {
            console.error(e);
            setError(e.response.data.message)
        }
    }

    if(error) {
        return <div>{error}</div>;
    }

    return surveyDetails && employeeDetails && (
        <div className="flex flex-col gap-4 p-4">
            {/* Block for Employee Details and Survey Period */}
            <img src={logo} alt="Logo" className="mx-auto mb-4" width="100" height="100"/>
            <div className="bg-white border border-gray-200 rounded-md shadow-md">
                <div className="p-4">
                    <h2 className="text-3xl font-bold text-center mb-14">{surveyDetails.campaignName || "N/A"}</h2>
                    <p><span className="font-bold">Applicant Name:</span> {employeeDetails.name}</p>
                    <p><span
                        className="font-bold">Department:</span> {employeeDetails.department?.departmentName || "N/A"}
                    </p>
                    <p><span className="font-bold">Designation:</span> {employeeDetails.designation?.name || "N/A"}</p>
                    <p><span className="font-bold">Job Grade:</span> G{employeeDetails.jobGrade?.jobGradeName || "N/A"}</p>
                    <p><span className="font-bold">Survey Period:</span> From {new Date(surveyDetails.campaignStartDate).toLocaleDateString("en-my", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })} to {new Date(surveyDetails.campaignEndDate).toLocaleDateString("en-my", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })}</p>
                </div>
            </div>
            {/* Block for Survey Description */}
            <div className="bg-white border border-gray-200 rounded-md shadow-md">
                <div className="p-4 text-justify">
                    <p>{surveyDetails.campaignDescription || "N/A"}</p>
                </div>
            </div>
            {/* Question Cards */}
            {inputs.map((card, index) => (
                <div key={index} className="flex flex-col bg-white rounded-md shadow-md ring-1 ring-gray-200">
                    {/* Card Body */}
                    <div className="p-6">
                        {/* Card Content */}
                        <div className="px-[12px] text-center">
                            <div className="flex justify-center gap-8">
                                {/* Question Title */}
                                <div className="w-full flex items-center gap-4 text-xl">
                                    <p className="font-medium">{index + 1}.</p>
                                    <p>{card.question || "Untitled Question"}</p>
                                </div>
                            </div>
                            {/* Question Type Selection */}
                            <div>
                                {/* Question Type - Linear Scale */}
                                <div className="mt-8 flex flex-row justify-center items-end gap-8">
                                    <span>{card.low || "Lowest Rating"}</span>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <div className="flex flex-col items-center gap-4">
                                            <input type="radio" id={`question-${index}-rating-${rating}`}
                                                   name={`question-${index}`} checked={card.rating === rating} onChange={() => handleAnswerPick(index, rating)}/>
                                            <label htmlFor={`question-${index}-rating-${rating}`}>{rating}</label>
                                        </div>
                                    ))}
                                    <span>{card.high || "Highest Rating"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex flex-col sm:w-full md:w-1/2 lg:w-1/6 mx-auto p-6">
                <Button onClick={handleSubmit} colorType="primary">Submit</Button>
            </div>
        </div>
    )
}

export default SurveyResponseSheet;