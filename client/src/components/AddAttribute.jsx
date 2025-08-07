import { useEffect, useState, useContext } from "react";
import { PlatformContext } from "./Layout/PlatformLayout.jsx";
import axios from "axios";
import Button from "./Button.jsx";

function AddAttribute({onSubmit}) {
    const platformCtx = useContext(PlatformContext);

    // Language Settings
    const languageMap = {
        English: {
            // Modal Title
            addAttribute: "Add Attribute",
            // Attribute Details
            attributeDetails: "Attribute Details",
            // Department Select
            department: "Department",
            departmentSelect: "Select Department",
            // Designation Select
            designationAssociated: "Designation Associated",
            designationSelect: "Select Designation",
            // Category Select
            categoryAssociated: "Category Associated",
            categorySelect: "Select Category",
            knowHow: "Know How",
            problemSolving: "Problem Solving",
            accountability: "Accountability",
            // Attribute Name Input
            attributeName: "Attribute Name",
            attributeNameInput: "Enter Attribute Name",
            // Sub-Attribute Details
            addSubAttribute: "Add Sub-Attribute",
            subAttributeDetails: "Sub-Attribute Details",
            subAttributeName: "Sub-Attribute Name",
            subAttributeNameInput: "Enter Sub-Attribute Name",
            weighting: "Weighting",
            weightingInput: "Enter Weighting",
            // Weighting Calculation
            totalWeight: "Total Weight",
            // Submit Button
            submit: "Submit",
        },
        'Bahasa Melayu': {
            // Modal Title
            addAttribute: "Tambah Atribut",
            // Attribute Details
            attributeDetails: "Butiran Atribut",
            // Department Select
            department: "Jabatan",
            departmentSelect: "Pilih Jabatan",
            // Designation Select
            designationAssociated: "Jawatan Berkaitan",
            designationSelect: "Pilih Jawatan",
            // Category Select
            categoryAssociated: "Kategori Berkaitan",
            categorySelect: "Pilih Kategori",
            knowHow: "Pengetahuan",
            problemSolving: "Penyelesaian Masalah",
            accountability: "Bertangungjawab",
            // Attribute Name Input
            attributeName: "Nama Atribut",
            attributeNameInput: "Masukkan Nama Atribut",
            // Sub-Attribute Details
            addSubAttribute: "Tambah Sub-Atribut",
            subAttributeDetails: "Butiran Sub-Atribut",
            subAttributeName: "Nama Sub-Atribut",
            subAttributeNameInput: "Masukkan Nama Sub-Atribut",
            weighting: "Peratusan",
            weightingInput: "Masukkan Peratusan",
            // Weighting Calculation
            totalWeight: "Jumlah peratusan",
            // Submit Button
            submit: "Hantar",
        },
        '中文': {
            // Modal Title
            addAttribute: "添加属性",
            // Attribute Details
            attributeDetails: "属性详情",
            // Department Select
            department: "部门",
            departmentSelect: "选择部门",
            // Designation Select
            designationAssociated: "关联职位",
            designationSelect: "选择职位",
            // Category Select
            categoryAssociated: "关联类别",
            categorySelect: "选择类别",
            knowHow: "知识技能",
            problemSolving: "解决问题",
            accountability: "责任感",
            // Attribute Name Input
            attributeName: "属性名称",
            attributeNameInput: "输入属性名称",
            // Sub-Attribute Details
            addSubAttribute: "添加子属性",
            subAttributeDetails: "子属性详情",
            subAttributeName: "子属性名称",
            subAttributeNameInput: "输入子属性名称",
            weighting: "加权",
            weightingInput: "输入加权",
            // Weighting Calculation
            totalWeight: "总加权",
            // Submit Button
            submit: "提交",
        }          
    };

    const [attributeData, setAttributeData] = useState({
        department: "",
        category: "",
        name: "",
        designation: "",
        jobGrade: "",
        subAttributes: [
            {name: "", weight: 0}
        ]
    });

    const [departments, setDepartments] = useState([]);
    const [jobGrades, setJobGrades] = useState([]);
    const [totalWeight, setTotalWeight] = useState(0);

    const handleDesignationJobGradesByDepartment = async function(e) {
        try {
            setAttributeData((prev) => ({...prev, department: e.target.value}));

            const response = await axios.get("/api/filter-jobgrades", {
                params: {
                    departmentId: e.target.value
                }
            });

            const data = response.data;

            setJobGrades(data.jobGrades);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDesignationOnChange(e) {
        // Separate by dash
        const [designation, jobGrade] = e.target.value.split("-");

        setAttributeData((prev) => (
            {
                ...prev,
                designation: designation,
                jobGrade: jobGrade
            }
        ));
    }

    async function handleSubAttributeOnChange(e, index, data) {

        const newTotalWeight = attributeData.subAttributes.reduce((acc, curr, currIndex) => {

            if (currIndex === index) {
                return acc + parseInt(data.weight);
            }

            return acc + parseInt(curr.weight);
        }, 0);


        if (newTotalWeight > 100) {

            data.weight = 100 - (newTotalWeight - parseInt(data.weight));
        }

        setAttributeData((prev) => {
            const newState = {
                ...prev,
                subAttributes: prev.subAttributes.map((subAttr, subIndex) =>
                    subIndex === index
                        ? data
                        : subAttr
                )
            }

            setTotalWeight(newTotalWeight > 100 ? 100 : newTotalWeight);

            return newState;
        });
    }

    async function handleSubAttributeDelete(index) {
        setAttributeData((prev) => {
            const newSubAttributes = [...prev.subAttributes];
            newSubAttributes.splice(index, 1);

            return {
                ...prev,
                subAttributes: newSubAttributes
            };
        });
    }

    async function handleSubmit() {
        try {
            const response = await axios.post("/create-attribute", {
                ...attributeData
            });

            const data = response.data;

            onSubmit?.(data);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        const getDepartments = async () => {
            try {
                const response = await axios.get("/departments");

                const data = response.data;

                setDepartments(data.departments);
            } catch (e) {
                console.error(e);
            }
        }

        getDepartments().then(() => {
            console.log("Gotten departments");
        });
    }, []);

    const isSubmissionValid = () => {
        return attributeData.name !== "" &&
            attributeData.designation !== "" &&
            attributeData.jobGrade !== "" &&
            attributeData.category !== "" &&
            totalWeight === 100;
    }

    return (
        // Modal Content
        <div>
            <div className="mb-2 text-lg font-medium">{languageMap[platformCtx.language].attributeDetails}</div>
            {/* Attribute Details */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-4">
                    {/* Designation Dropdown Button */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="designation" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].department}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <select
                                onChange={handleDesignationJobGradesByDepartment}
                                value={attributeData.department ?? undefined}
                                id="designation"
                                className="w-full appearance-none text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            >
                                <option className="rounded">{languageMap[platformCtx.language].departmentSelect}</option>
                                {departments.map((department) => {
                                    return (
                                        <option value={department._id}>{department.departmentName}</option>
                                    )
                                })}
                            </select>
                            <svg
                                className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                                aria-hidden="true" fill="none" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 4 4 4-4"/>
                            </svg>
                        </div>
                    </div>
                    {/* Job Grade Dropdown Button */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="job-grade" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].designationAssociated}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <select
                                id="designation"
                                onChange={handleDesignationOnChange}
                                value={attributeData.designation && attributeData.jobGrade ? `${attributeData.designation}-${attributeData.jobGrade}` : undefined}
                                className="w-full appearance-none text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none">
                                <option className="rounded">{languageMap[platformCtx.language].designationSelect}</option>
                                {jobGrades.map((jobGrade) => {
                                    return (
                                        <option value={`${jobGrade.designation._id}-${jobGrade._id}`}>
                                            {jobGrade.designation.name} (G{jobGrade.jobGradeName})
                                        </option>
                                    )
                                })}
                            </select>
                            <svg
                                className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                                aria-hidden="true" fill="none" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 4 4 4-4"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    {/* Category Dropdown Button */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="department" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].categoryAssociated}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <select
                                id="department"
                                onChange={(e) => setAttributeData((prev) => ({...prev, category: e.target.value}))}
                                value={attributeData.category ?? undefined}
                                className="w-full appearance-none text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                            >
                                <option className="rounded">{languageMap[platformCtx.language].categorySelect}</option>
                                <option value={"Know-How"}>{languageMap[platformCtx.language].knowHow}</option>
                                <option value={"Problem-Solving"}>{languageMap[platformCtx.language].problemSolving}</option>
                                <option value={"Accountability"}>{languageMap[platformCtx.language].accountability}</option>
                            </select>
                            <svg
                                className="absolute top-1/2 transform -translate-y-1/2 right-3 w-2.5 h-2.5 text-gray-400 pointer-events-none"
                                aria-hidden="true" fill="none" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="m1 1 4 4 4-4"/>
                            </svg>
                        </div>
                    </div>
                    {/* Attribute Input */}
                    <div className="flex flex-col gap-x-2 w-full md:flex-1">
                        <label htmlFor="attribute-name" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].attributeName}:</label>
                        <div className="w-full relative inline-flex items-center">
                            <input
                                type="text"
                                id="attribute-name"
                                value={attributeData.name}
                                onChange={(e) => setAttributeData((prev) => ({...prev, name: e.target.value}))}
                                className="w-full text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                placeholder={languageMap[platformCtx.language].attributeNameInput}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Header Tag */}
            <hr className="my-3 ring-0 ring-gray-200"/>
            {/* Sub-Attribute Details*/}
            <div className="mb-2 flex justify-between items-center">
                <div className="text-lg font-medium">{languageMap[platformCtx.language].subAttributeDetails}</div>
                {/* Add Sub-Attribute Button */}
                <Button
                        className="px-[12px] py-[6px] text-white bg-red-500 bg-opacity-80 rounded-md ring-1 ring-inset ring-red-400 shadow-sm"
                        onClick={() => {
                        setAttributeData((prev) => ({
                            ...prev,
                            subAttributes: [...prev.subAttributes, {name: "", weight: 0}]
                        }));
                    }}
                >
                    <span className="flex items-center">
                        <span className="material-symbols-outlined">add</span>
                        <span className="font-medium">{languageMap[platformCtx.language].addSubAttribute}</span>
                    </span>
                </Button>
            </div>
            <div className="mb-2 px-6 py-3 bg-gray-100 rounded-md">
                {/* Sub-Attribute Details Table */}
                <table className="table-auto w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left">
                            <th className="pr-6 py-3">{languageMap[platformCtx.language].subAttributeName}</th>
                            <th className="pr-6 py-3">{languageMap[platformCtx.language].weighting} (%)</th>
                            {attributeData.subAttributes.length > 1 && <th className="py-3">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {attributeData.subAttributes.map((subAttribute, index) => (
                            <tr key={index} className="border-b">
                                {/* Attribute Name Input */}
                                <td className="pr-6 py-3">
                                    <label htmlFor="sub-attribute-name" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].subAttributeName}:</label>
                                    <div className="w-full relative inline-flex items-center">
                                        <input
                                            type="text"
                                            id="sub-attribute-name"
                                            onChange={(e) => handleSubAttributeOnChange(e, index, {
                                                name: e.target.value,
                                                weight: attributeData.subAttributes[index].weight
                                            })}
                                            value={attributeData.subAttributes[index].name}
                                            className="w-full text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            placeholder={languageMap[platformCtx.language].subAttributeNameInput}
                                        />
                                    </div>
                                </td>
                                {/* Weight Percentage Input */}
                                <td className="pr-6 py-3">
                                    <label htmlFor="weight" className="inline-block py-[7px] text-sm font-medium">{languageMap[platformCtx.language].weighting} (%):</label>
                                    <div className="w-full relative inline-flex items-center">
                                        <input
                                            type="number"
                                            id="weight"
                                            min="0"
                                            max="100"
                                            onChange={(e) => handleSubAttributeOnChange(e, index, {
                                                name: attributeData.subAttributes[index].name,
                                                weight: e.target.value
                                            })}
                                            value={attributeData.subAttributes[index].weight > 0 ? attributeData.subAttributes[index].weight : ""}
                                            className="w-full text-gray-900 bg-white font-semibold rounded-md text-sm px-3 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                                            placeholder={languageMap[platformCtx.language].weightingInput}
                                        />
                                    </div>
                                </td>
                                {/* Delete Button */}
                                {attributeData.subAttributes.length > 1 && index !== 0 && (
                                    <td className="py-3 leading-3 align-bottom">
                                        <Button className="">
                                            <span onClick={() => handleSubAttributeDelete(index)} className="material-symbols-outlined">delete</span>
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Total Weight */}
                <div className={`my-2 text-sm font-medium ${totalWeight > 100 && "text-red-500"}`}>{languageMap[platformCtx.language].totalWeight}: {isNaN(totalWeight) ? 0 : totalWeight}%</div>
            </div>
            {/* Submit Button */}
            <div className="text-right font-medium">
                <Button 
                    disabled={!isSubmissionValid()} 
                    onClick={handleSubmit}
                >
                    <span>{languageMap[platformCtx.language].submit}</span>
                </Button>
            </div>
        </div>
    )
}

export default AddAttribute;