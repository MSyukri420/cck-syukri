import {useContext, useEffect, useReducer, useState} from 'react';
import {PlatformContext} from "./Layout/PlatformLayout.jsx";
import Tab from "./Tab.jsx";
import {CreatePerformanceAppraisalContext} from "./CreatePerformanceAppraisal.jsx";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {AuthenticationContext} from "./Provider/AuthenticationProvider.jsx";

function attributeReducer(state, action) {
    switch(action.type) {
        case "SET_ATTRIBUTES":
            // action.payload = {_id, category, name, designation, jobGrade, subAttributes}[]
            // Arrange with {attributeName, attributeType, subAttributes: {name, weight, marksGiven}}
            return action.payload.map(attribute => {
                return {
                    attributeId: attribute._id,
                    attributeName: attribute.name,
                    attributeType: attribute.category,
                    subAttributes: attribute.subAttributes.map(subAttribute => {
                        return {
                            name: subAttribute.name,
                            weight: subAttribute.weight,
                            marksGiven: 0,
                        }
                    })
                }
            });
        case "EDIT_MODE_SET_ATTRIBUTES":
            return action.payload.map(attribute => {
                // Random hex string
                const attributeId = Math.random().toString(16).slice(2);

                return {
                    attributeId: attributeId,
                    attributeName: attribute.attributeName,
                    attributeType: attribute.attributeType,
                    subAttributes: attribute.subAttributes.map(subAttribute => {
                        return {
                            name: subAttribute.name,
                            weight: subAttribute.weight,
                            marksGiven: subAttribute.marksGiven
                        }
                    })
                }
            });
        case "UPDATE_MARKS_GIVEN":
            // action.payload = {attributeIndex, subAttributeIndex, marksGiven}
            return state.map((attribute, index) => {
                if (index === action.payload.attributeIndex) {
                    return {
                        ...attribute,
                        subAttributes: attribute.subAttributes.map((subAttribute, subIndex) => {
                            if (subIndex === action.payload.subAttributeIndex) {
                                return {
                                    ...subAttribute,
                                    marksGiven: action.payload.marksGiven,
                                }
                            }
                            return subAttribute;
                        })
                    }
                }

                return attribute;
            });
        default:
            return state;
    }
}

function AppraisalData({attributes, category, modifyMarksGiven, lookUpAttrIndex, performanceAppraisalCtx}) {
    const relevantCategory = attributes.filter(attribute => attribute.attributeType === category);

    const {employeeData} = performanceAppraisalCtx;

    const percentageCarryForCategory = () => {
        switch (category) {
            case "Know-How":
                return employeeData.jobGrade.percentageCarry.knowHow;
            case "Problem-Solving":
                return employeeData.jobGrade.percentageCarry.problemSolving;
            case "Accountability":
                return employeeData.jobGrade.percentageCarry.accountability;
            default:
                return 0;
        }
    };

    return (<table className="w-full overflow-y-auto">
            <thead>
            <tr className="bg-slate-500 text-white ">
                <th className="px-3 py-3 text-sm font-medium uppercase">Sub-Attribute</th>
                <th className="px-3 py-3 text-sm font-medium uppercase">Marks</th>
                <th className="px-3 py-3 text-sm font-medium uppercase">Weight</th>
                <th className="px-3 py-3 text-sm font-medium uppercase">W.Marks</th>
                <th className="px-3 py-3 text-sm font-medium uppercase">%</th>
                <th className="px-3 py-3 text-sm font-medium uppercase">Score</th>
            </tr>
            </thead>
            <tbody className="text-black">
            {
                relevantCategory.map((attribute, index) => (
                        <>
                            <tr>
                                <td colSpan={6} className="border-y-2">
                                    <div className="px-[12px] py-3">
                                        <div className="flex items-center space-x-1 font-medium">
                                            <p>Attribute #{index + 1}:</p>
                                            <p>{attribute.attributeName}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            {attribute.subAttributes.map((subAttribute, subIndex) => (
                                <tr className="border-b border">
                                    <td className="px-[12px] py-3 text-sm">{subAttribute.name}</td>
                                    <td className="px-[12px] py-3 text-sm text-slate-500">
                                        <input 
                                            type="number"
                                            min={0}
                                            max={100}
                                            aria-label="marksGiven"
                                            onChange={(e) => modifyMarksGiven(lookUpAttrIndex(attribute.attributeId), subIndex, parseInt(e.target.value))}
                                            value={attributes[lookUpAttrIndex(attribute.attributeId)].subAttributes[subIndex].marksGiven.toString()}
                                            className="px-[12px] py-[6px] border border-gray-300 rounded-md"
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="px-[12px] py-3 text-sm text-slate-500">
                                        <input 
                                            type="text"
                                               aria-label="weight"
                                               value={subAttribute.weight.toString()}
                                               className="px-[12px] py-[6px] border border-gray-300 rounded-md"
                                               placeholder="0"
                                               readOnly
                                        />
                                    </td>
                                    <td className="px-[12px] py-3 text-sm text-slate-500">
                                        <input type="number"
                                               aria-label="wMarks"
                                               value={((subAttribute.weight * attributes[lookUpAttrIndex(attribute.attributeId)].subAttributes[subIndex].marksGiven) / 100).toString()}
                                               className="px-[12px] py-[6px] border border-gray-300 rounded-md"
                                               placeholder="0"/>
                                    </td>
                                </tr>
                            ))}
                        </>
                    ))
            }
            <tr className="bg-slate-500">
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1 font-medium text-white uppercase text-sm">
                            <p>Total:</p>
                        </div>
                    </div>
                </td>
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1">
                            <input type="text"
                                   aria-label="weight"
                                   value={relevantCategory.reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + curr.marksGiven, 0), 0).toFixed(2)}
                                   className="px-[12px] py-[4px] border border-gray-300 rounded-md text-slate-"
                                   placeholder="0"
                                   readOnly
                            />
                        </div>
                    </div>
                </td>
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1">
                            <input type="text"
                                   aria-label="weight"
                                   value={relevantCategory.reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + curr.weight, 0), 0).toFixed(2)}
                                   className="px-[12px] py-[4px] border border-gray-300 rounded-md"
                                   placeholder="0"
                                   readOnly
                            />
                        </div>
                    </div>
                </td>
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1">
                            <input type="text"
                                   aria-label="weight"
                                   value={relevantCategory.reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + (curr.weight * curr.marksGiven) / 100, 0), 0).toFixed(2)}
                                   className="px-[12px] py-[4px] border border-gray-300 rounded-md"
                                   placeholder="0"
                                   readOnly
                            />
                        </div>
                    </div>
                </td>
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1">
                            <input type="text"
                                   aria-label="weight"
                                   value={percentageCarryForCategory().toFixed(2)}
                                   className="px-[12px] py-[4px] border border-gray-300 rounded-md"
                                   placeholder="0"
                                   readOnly
                            />
                        </div>
                    </div>
                </td>
                <td className="border-y-2">
                    <div className="px-[12px] py-3">
                        <div className="flex items-center space-x-1">
                            <input type="text"
                                   aria-label="weight"
                                   value={((relevantCategory.reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + (curr.weight * curr.marksGiven) / 100, 0), 0) / relevantCategory.reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + curr.weight, 0), 0)) * percentageCarryForCategory()).toFixed(2).toString()}
                                   className="px-[12px] py-[4px] border border-gray-300 rounded-md"
                                   placeholder="0"
                                   readOnly
                            />
                        </div>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
    )
}

function EmployeeInfoCard({performanceAppraisalCtx}) {
    return (
        <div className="flex flex-wrap border rounded shadow-md px-12 py-6 gap-4 justify-between">
            <div className="flex flex-row gap-4 items-center w-full md:flex-1">
                <img src={`${axios.defaults.baseURL}/avatars/${performanceAppraisalCtx.employeeData?.employeeId}`} alt="Profile Picture"
                     className="w-24 h-24 rounded-full border-2 border-gray-300 "/>
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-medium">{performanceAppraisalCtx.employeeData?.name}</p>
                    <div className="flex flex-row gap-2">
                        <p className="text-sm font-medium">Employee ID:</p>
                        <p className="text-sm text-gray-400">{performanceAppraisalCtx.employeeData?.employeeId}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:flex-1">
                <h1 className="font-bold">Personal Information</h1>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Email:</p>
                    <a href="" className="text-blue-500">{performanceAppraisalCtx.employeeData?.email}</a>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Phone:</p>
                    <a href="" className="text-blue-500">{performanceAppraisalCtx.employeeData?.phone}</a>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Gender:</p>
                    <p className="text-blue-500">{performanceAppraisalCtx.employeeData?.gender}</p>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Username:</p>
                    <p className="text-blue-500">{performanceAppraisalCtx.employeeData?.username}</p>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Role:</p>
                    <p className="text-blue-500">{performanceAppraisalCtx.employeeData?.role.name}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:flex-1">
                <h1 className="font-bold">Employee Information</h1>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Department:</p>
                    <p className="text-blue-500">{performanceAppraisalCtx.employeeData?.department.departmentName}</p>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Designation:</p>
                    <p className="text-blue-500">{performanceAppraisalCtx.employeeData?.designation.name}</p>
                </div>
                <div className="flex flex-row gap-2 text-sm">
                    <p className="font-medium">Account created:</p>
                    <p className="text-blue-500">{new Date(performanceAppraisalCtx.employeeData?.createdAt).toLocaleString("en-my", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}</p>
                </div>
            </div>
        </div>
    )
}

function PerformanceAppraisalSummary({attributes, performanceAppraisalCtx}) {
    const percentageCarryForCategory = (category) => {
        switch (category) {
            case "Know-How":
                return performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.knowHow;
            case "Problem-Solving":
                return performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.problemSolving;
            case "Accountability":
                return performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.accountability;
            default:
                return 0;
        }
    };

    function checkInvalidMarksGiven(attribute) {
        return attribute.subAttributes.some(subAttribute => subAttribute.marksGiven === 0 || !(typeof subAttribute.marksGiven === "number") || isNaN(subAttribute.marksGiven) || subAttribute.marksGiven < 0 || subAttribute.marksGiven > 100);
    }

    function calculateAttributeTotalWeight(attribute) {
        return attribute.subAttributes.reduce((acc, curr) => acc + curr.weight, 0);
    }

    function calculateAttributeTotalWeightedMarks(attribute) {
        return Math.round((attribute.subAttributes.reduce((acc, curr) => acc + (curr.weight * curr.marksGiven) / 100, 0) * 1e2)) / 1e2;
    }

    function checkCategoryComplete(category) {
        return attributes.every(attribute => {
            if (attribute.attributeType === category) {
                return !checkInvalidMarksGiven(attribute);
            }
            return true;
        });
    }

    function calculateTotalWeight(category) {
        return attributes
            .filter(attribute => attribute.attributeType === category)
            .reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + curr.weight, 0), 0);
    }

    function calculateTotalWeightedMarks(category) {
        return Math.round((attributes
            .filter(attribute => attribute.attributeType === category)
            .reduce((acc, curr) => acc + curr.subAttributes.reduce((acc, curr) => acc + (curr.weight * curr.marksGiven) / 100, 0), 0)) * 1e2) / 1e2;
    }

    function calculatePercentageCarryByCategory(category) {
        return Math.round(((calculateTotalWeightedMarks(category) / calculateTotalWeight(category)) * percentageCarryForCategory(category)) * 1e2) / 1e2;
    }

    function printCategoryStat(category) {
        return `${calculateTotalWeightedMarks(category)} / ${calculateTotalWeight(category)} (${((calculateTotalWeightedMarks(category) / calculateTotalWeight(category)) * 100).toFixed(1)}%)`;
    }

    function printAttributeStat(attribute) {
        return `${calculateAttributeTotalWeightedMarks(attribute)} / ${calculateAttributeTotalWeight(attribute)} (${((calculateAttributeTotalWeightedMarks(attribute) / calculateAttributeTotalWeight(attribute)) * 100).toFixed(1)}%)`;
    }

    function printCategoryPercentageCarry(category) {
        return `${calculatePercentageCarryByCategory(category).toFixed(1)} (max. ${percentageCarryForCategory(category)})`;
    }

    function printAcquiredGrade() {
        const totalPercentageCarry = calculatePercentageCarryByCategory("Know-How") + calculatePercentageCarryByCategory("Problem-Solving") + calculatePercentageCarryByCategory("Accountability");

        if(!checkCategoryComplete("Know-How") || !checkCategoryComplete("Problem-Solving") || !checkCategoryComplete("Accountability")) return "Incomplete";

        if(totalPercentageCarry >= 85) {
            return "A";
        } else if (totalPercentageCarry >= 70 && totalPercentageCarry < 85) {
            return "B";
        } else if (totalPercentageCarry >= 50 && totalPercentageCarry < 70) {
            return "C";
        } else if (totalPercentageCarry >= 30 && totalPercentageCarry < 50) {
            return "D";
        } else {
            return "E";
        }
    }

    return (
        <div className="flex flex-col border rounded shadow-md p-6 gap-12">
            <h1 className="font-bold underline">Performance Appraisal Summary</h1>
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <h1 className="font-medium">Know How</h1>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Score:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Know-How") ? "Incomplete" : printCategoryStat("Know-How")}</p>
                    </div>
                    {
                        attributes
                            .filter(attribute => attribute.attributeType === "Know-How")
                            .map((attribute, index) => (
                                <div className="flex flex-row gap-2 text-sm">
                                    <p className="font-medium">Attribute
                                        #{index + 1}: {attribute.attributeName}:</p>
                                    <p className="text-blue-500">{checkInvalidMarksGiven(attribute) ? "Incomplete" : printAttributeStat(attribute)}</p>
                                </div>
                            ))
                    }
                </div>
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <h1 className="font-medium">Problem Solving</h1>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Score:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Problem-Solving") ? "Incomplete" : printCategoryStat("Problem-Solving")}</p>
                    </div>
                    {
                        attributes
                            .filter(attribute => attribute.attributeType === "Problem-Solving")
                            .map((attribute, index) => (
                                <div className="flex flex-row gap-2 text-sm">
                                    <p className="font-medium">Attribute
                                        #{index + 1}: {attribute.attributeName}:</p>
                                    <p className="text-blue-500">{checkInvalidMarksGiven(attribute) ? "Incomplete" : printAttributeStat(attribute)}</p>
                                </div>
                            ))
                    }
                </div>
                <div className="flex flex-col gap-2 w-full lg:flex-1">
                    <h1 className="font-medium">Accountability</h1>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Score:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Accountability") ? "Incomplete" : printCategoryStat("Problem-Solving")}</p>
                    </div>
                    {
                        attributes
                            .filter(attribute => attribute.attributeType === "Accountability")
                            .map((attribute, index) => (
                                <div className="flex flex-row gap-2 text-sm">
                                    <p className="font-medium">Attribute
                                        #{index + 1}: {attribute.attributeName}:</p>
                                    <p className="text-blue-500">{checkInvalidMarksGiven(attribute) ? "Incomplete" : printAttributeStat(attribute)}</p>
                                </div>
                            ))
                    }
                </div>
            </div>
            <div className="flex flex-wrap gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="font-medium">Percentage Carry by Attribute</h1>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Know-How Percentage Carry:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Know-How") ? "Incomplete" : printCategoryPercentageCarry("Know-How")}</p>
                    </div>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Problem-Solving Percentage Carry:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Problem-Solving") ? "Incomplete" : printCategoryPercentageCarry("Problem-Solving")}</p>
                    </div>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Accountability Percentage Carry:</p>
                        <p className="text-blue-500">{!checkCategoryComplete("Accountability") ? "Incomplete" : printCategoryPercentageCarry("Accountability")}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full md:flex-1">
                    <h1 className="font-medium">Total Score</h1>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Total Marks:</p>
                        <p className="text-blue-500">{
                            !checkCategoryComplete("Know-How") || !checkCategoryComplete("Problem-Solving") || !checkCategoryComplete("Accountability") ?
                                "Incomplete" :
                                `
                                    ${(calculateTotalWeightedMarks("Know-How") + calculateTotalWeightedMarks("Problem-Solving") + calculateTotalWeightedMarks("Accountability")).toFixed(1)} /
                                    ${calculateTotalWeight("Know-How") + calculateTotalWeight("Problem-Solving") + calculateTotalWeight("Accountability")}
                                    `
                        }
                        </p>
                    </div>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Final Score:</p>
                        <p className="text-blue-500">{
                            !checkCategoryComplete("Know-How") || !checkCategoryComplete("Problem-Solving") || !checkCategoryComplete("Accountability") ?
                                "Incomplete" : `${Math.round(calculatePercentageCarryByCategory("Know-How") + calculatePercentageCarryByCategory("Problem-Solving") + calculatePercentageCarryByCategory("Accountability"))}`
                        }</p>
                    </div>
                    <div className="flex flex-row gap-2 text-sm">
                        <p className="font-medium">Grade:</p>
                        <p className="text-blue-500">{printAcquiredGrade()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PerformanceEvaluation = () => {
    const languageMap = {
        "English": {
            addAppraisal: "Add Performance Appraisal",
            home: "Home",
            performanceAppraisal: "Performance Appraisal",
            performanceEvaluation: "Performance Evaluation",
            category: "Category",
            subAttribute: "Sub-Attribute",

            
        },
        "Bahasa Melayu": {
            addAppraisal: "Tambah Penilaian Prestasi",
            home: "Laman Utama",
            performanceAppraisal: "Penilaian Prestasi",
            performanceEvaluation: "Penilaian Prestasi Kerja",
        },
        "中文": {
            addAppraisal: "添加绩效评估",
            home: "首页",
            performanceAppraisal: "绩效评估",
            performanceEvaluation: "工作绩效评估",
        }
    }
    // Get id from params if available
    const {id} = useParams();

    // Page Header Handling
    const platformCtx = useContext(PlatformContext);
    const authCtx = useContext(AuthenticationContext);
    const performanceAppraisalCtx = useContext(CreatePerformanceAppraisalContext);

    const [attributes, dispatchAttributes] = useReducer(attributeReducer, []);
    const [appraiserComments, setAppraiserComments] = useState("");

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    function lookUpAttrIndex(attributeId) {
        return attributes.findIndex(attribute => attribute.attributeId === attributeId);
    }

    function modifyMarksGiven(attributeIndex, subAttributeIndex, marksGiven) {
        dispatchAttributes({type: "UPDATE_MARKS_GIVEN", payload: {attributeIndex, subAttributeIndex, marksGiven}});
    }

    async function submit() {
        try {
            // Process attributes
            const processedAttributes = attributes.map(attribute => {
                return {
                    attributeName: attribute.attributeName,
                    attributeType: attribute.attributeType,
                    subAttributes: attribute.subAttributes.map(subAttribute => {
                        return {
                            name: subAttribute.name,
                            weight: subAttribute.weight,
                            marksGiven: subAttribute.marksGiven
                        }
                    })
                }
            });

            if (id) {
                // Update
                const payload = {
                    performanceAppraisalId: id,
                    appraisalData: processedAttributes,
                    appraiserComments: appraiserComments
                }

                const response = await axios.post(`/update-appraisal`, payload);

                const data = response.data;

                if (data.success) {
                    platformCtx.setAlert({type: "success", message: "Performance Appraisal updated successfully."});
                    navigate("/performance-appraisal");
                } else {
                    platformCtx.setAlert({type: "danger", message: data.message});
                }
            } else {
                // Payload object
                const payload = {
                    employeeId: performanceAppraisalCtx.employeeData._id,
                    appraisalDate: performanceAppraisalCtx.appraisalDate,
                    appraisalData: processedAttributes,
                    timePeriod: performanceAppraisalCtx.timePeriod,
                    percentageCarries: {
                        "Know-How": performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.knowHow,
                        "Problem-Solving": performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.problemSolving,
                        "Accountability": performanceAppraisalCtx.employeeData.jobGrade.percentageCarry.accountability
                    },
                    appraiserComments: appraiserComments
                }

                const response = await axios.post("/create-appraisal", payload);

                const data = response.data;

                if(data.success) {
                    platformCtx.setAlert({type: "success", message: "Performance Appraisal submitted successfully."});
                    navigate("/performance-appraisal");
                } else {
                    platformCtx.setAlert({type: "danger", message: data.message});
                }
            }
        } catch (err) {
            console.error(err);
        }

    }

    useEffect(() => {
        platformCtx.setPage(languageMap[platformCtx.language].performanceEvaluation);
        platformCtx.setBreadcrumb([
            {name: languageMap[platformCtx.language].home, path: "/"},
            {name: languageMap[platformCtx.language].performanceAppraisal, path: "/performance-appraisal"},
            {name: languageMap[platformCtx.language].performanceEvaluation, path: "/performance-appraisal/performance-evaluation"}
        ]);
    }, []);

    useEffect(() => {
        if(!authCtx.hasPermission("performance_appraisal")) {
            navigate("/dashboard");
            platformCtx.setAlert({type: "danger", message: "You do not have permission to access this page."});
            return;
        }

        if(id) {
            const getPerformanceAppraisalData = async () => {
                try {
                    const response = await axios.get(`/get-appraisal-details/${id}`);

                    const data = response.data;

                    if(data.success) {
                        // Get employee data
                        const employeeDetailsResponse = await axios.get(`/get-employee-details/${data.appraisal.employeeId}`);

                        const employeeDetailsData = employeeDetailsResponse.data;

                        performanceAppraisalCtx.setEmployeeData({
                            ...employeeDetailsData.employee,
                            jobGrade: {
                                percentageCarry: {
                                    knowHow: data.appraisal.attributePercentageCarry["KnowHow"],
                                    problemSolving: data.appraisal.attributePercentageCarry["ProblemSolving"],
                                    accountability: data.appraisal.attributePercentageCarry["Accountability"],
                                },
                                jobGradeName: data.appraisal.employeeDetails.jobGrade,
                            },
                            department: {
                                departmentName: data.appraisal.employeeDetails.department,
                            },
                            designation: {
                                name: data.appraisal.employeeDetails.designation,
                            }
                        });
                        performanceAppraisalCtx.setAppraisalDate(data.appraisal.appraisalDate);
                        setAppraiserComments(data.appraisal.appraiserComments.message);
                        dispatchAttributes({type: "EDIT_MODE_SET_ATTRIBUTES", payload: data.appraisal.appraisalData});
                    }
                } catch (e) {
                    console.error(e);
                    navigate("/performance-appraisal");
                } finally {
                    setLoading(false);
                }
            };

            getPerformanceAppraisalData().then(() => {
                console.log("Got performance appraisal data");
            });
        } else {
            // At least check if employeeData is available
            if(!performanceAppraisalCtx.employeeData) {
                performanceAppraisalCtx.reset();
                platformCtx.setAlert({type: "danger", message: "Performance evaluation cannot be done without employee data. Please retry."});
                navigate("/performance-appraisal");
                return;
            }

            dispatchAttributes({type: "SET_ATTRIBUTES", payload: performanceAppraisalCtx.attributes});
            setLoading(false);
        }
    }, []);

    return loading? (<p>Loading...</p>) : (
        <div>
            {/* Information Card */}
            <EmployeeInfoCard performanceAppraisalCtx={performanceAppraisalCtx}/>
            {/* Summary Card */}
            <PerformanceAppraisalSummary performanceAppraisalCtx={performanceAppraisalCtx} attributes={attributes}/>
            {/* Card */}
            <div className="mb-[30px] mt-6 border border-gray-200 rounded-md shadow-md relative">
                {/* Card Body */}
                <div className="pb-[16px]">
                    <p className="p-3 font-semibold">Categories</p>
                    {/* Tabs */}
                    <Tab
                        tabs={["Know How", "Problem Solving", "Accountability"]}
                        activeTabIndex={0}
                        body={[
                            <AppraisalData attributes={attributes} modifyMarksGiven={modifyMarksGiven}
                                           category={"Know-How"} lookUpAttrIndex={lookUpAttrIndex} performanceAppraisalCtx={performanceAppraisalCtx}/>,
                            <AppraisalData attributes={attributes} modifyMarksGiven={modifyMarksGiven}
                                           category={"Problem-Solving"} lookUpAttrIndex={lookUpAttrIndex} performanceAppraisalCtx={performanceAppraisalCtx}/>,
                            <AppraisalData attributes={attributes} modifyMarksGiven={modifyMarksGiven}
                                           category={"Accountability"} lookUpAttrIndex={lookUpAttrIndex} performanceAppraisalCtx={performanceAppraisalCtx}/>,
                        ]}
                    />
                    {/* Comments */}
                    <div className="m-6">
                        <p className="p-3 font-semibold">Comments</p>
                        <textarea
                            value={appraiserComments}
                            onChange={(e) => setAppraiserComments(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500"
                            placeholder="Enter your comments here..."/>
                    </div>
                    {/* Submit Button */}
                    <div className="mt-[16px] text-center">
                        <button
                            onClick={submit}
                            disabled={attributes.some(attribute => attribute.subAttributes.some(subAttribute => subAttribute.marksGiven === 0 || !(typeof subAttribute.marksGiven === "number") || isNaN(subAttribute.marksGiven) || subAttribute.marksGiven < 0 || subAttribute.marksGiven > 100))}
                            className="px-14 py-3 text-white font-medium bg-red-500 bg-opacity-80 rounded-full ring-1 ring-inset ring-red-400 shadow-sm disabled:ring-slate-500 disabled:bg-slate-500">
                            <span className="flex items-center">
                                Submit
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceEvaluation;