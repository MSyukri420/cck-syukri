import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from "/images/cck-logo.png";

const SurveyPreview = ({ surveyTitle, surveyDescription, questionCard, selectedEmployees, startDate, endDate }) => {
    const employee = selectedEmployees[0];

    return (
        <div>
            {/* CCK Logo */}
            <img src={logo} alt="Logo" className="mx-auto mb-4" width="100" height="100"/>
            <div className="mb-[30px] bg-white rounded-md shadow-md ring-1 ring-gray-200">
                <div className="p-[16px]">
                    {employee && (
                        <div>
                            <div className="pb-3 space-y-3 border-b">
                                <p className="text-4xl font-medium">{surveyTitle || "N/A"}</p>
                                <p className="text-sm">{surveyDescription || "N/A"}</p>
                            </div>
                            <div className="pt-3">
                                <div className="px-6 py-3 space-y-1 bg-gray-100 text-sm rounded-md">
                                    <p><span className="font-medium">Applicant Name:</span> {employee.name}</p>
                                    <p><span className="font-medium">Department:</span> {employee.department?.departmentName}</p>
                                    <p><span className="font-medium">Designation:</span> {employee.designation?.name} (G{employee.jobGrade?.jobGradeName})</p>
                                    <p>
                                        <span className="font-medium">Survey Period: </span> 
                                        {new Date(new Date(startDate).setHours(0, 0, 0, 0)).toLocaleDateString("en-my", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric"
                                        })} to {new Date(new Date(endDate).setHours(23, 59, 59, 999)).toLocaleDateString("en-my", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric"
                                        })}
                                    </p>      
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Question Cards */}
            {questionCard.map((card, index) => (
                <div key={index} className="mb-[30px] bg-white rounded-md shadow-md ring-1 ring-gray-200">
                    {/* Card Body */}
                    <div className="p-[16px]">
                        {/* Card Content */}
                        <div className="px-[12px] text-center">
                            <div className="flex justify-center gap-8">
                                {/* Question Title */}
                                <div className="w-full flex items-center gap-4">
                                    <p className="font-medium">{index + 1}.</p>
                                    <p>{card.title || "Untitled Question"}</p>
                                </div>
                            </div>
                            {/* Question Type Selection */}
                            <div>
                                {/* Question Type - Linear Scale */}
                                <div className="mt-8 flex flex-row-reverse justify-center items-end gap-12">
                                    <span>{card.lowest || "Lowest Rating"}</span>
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <div className="flex flex-col items-center gap-4">
                                            <label htmlFor={`question-${index}-rating-${rating}`}>{rating}</label>
                                            <input type="radio" id={`question-${index}-rating-${rating}`} name={`question-${index}`}/>
                                        </div>
                                    ))}
                                    <span>{card.highest || "Highest Rating"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SurveyPreview;