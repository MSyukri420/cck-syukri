import {useEffect, useState} from "react";
import axios from "axios";

function ViewSurveyResponse({surveyResponseId}) {
    const [surveyResponse, setSurveyResponse] = useState(null);

    useEffect(() => {
        // Fetch survey response
        const fetchSurveyResponse = async () => {
            try {
                const response = await axios.get(`/survey-response/${surveyResponseId}`);
                setSurveyResponse(response.data.response);
            } catch (error) {
                console.error('Error fetching survey response:', error);
            }
        }

        fetchSurveyResponse().then(() => {
            console.log("Survey response fetched!");
        });
    }, [surveyResponseId]);

    return surveyResponse && (
        <div className="flex flex-col gap-6">
            <p>Employee Details:</p>
            <div className="flex flex-col gap-4 p-4 rounded-md bg-slate-100 text-sm">
                <div className="flex flex-row gap-2">
                    <p className="font-bold">Name:</p>
                    <p>{surveyResponse.user.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <p className="font-bold">Review Period:</p>
                    <p>{new Date(surveyResponse.campaign.campaignStartDate).toLocaleDateString("en-my", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })} to {new Date(surveyResponse.campaign.campaignEndDate).toLocaleDateString("en-my", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                    })}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-bold">Department:</p>
                    <p>{surveyResponse.user.department?.departmentName || "Not available"}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-bold">Designation:</p>
                    <p>{surveyResponse.user.designation?.name || "Not available"}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <p className="font-bold">Job Grade:</p>
                    <p>{ surveyResponse.user.jobGrade? `G${surveyResponse.user.jobGrade.jobGradeName}` : "Not Available"}</p>
                </div>
            </div>
            <p>Survey Questions</p>
            <div className="flex flex-col gap-4 p-4 rounded-md bg-slate-100 text-sm">
                {surveyResponse.responses.map((response, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <p className="font-bold">{response.question}</p>
                        <p>Answer: {response.rating} / 5</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ViewSurveyResponse;