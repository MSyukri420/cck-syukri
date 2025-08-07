import {useState, useEffect, useContext, useReducer} from 'react';
import { PlatformContext } from "./Layout/PlatformLayout.jsx";
import Button from "./Button.jsx";
import Table from "./Table.jsx";
import Chart from "react-apexcharts";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import {AuthenticationContext} from "./Provider/AuthenticationProvider.jsx";

function appraisalDataReducer(state, action,platformCtx) {
    const languageMap = {
        English: {
            totalWeightedMarksFor: "Total Weighted Marks For",
            WMarks: "W.Marks",
            Weight: "Weight %",
        },
        'Bahasa Melayu': {
            totalWeightedMarksFor: "Jumlah Berat Markah Untuk",
            WMarks: "Berat Peratusan",
            Weight: "Kesuluruhan Berat %",
        },
        '中文': {
            totalWeightedMarksFor: "总加权分数",
            WMarks: "加权分数",
            Weight: "总重量 ％",
        }
    }
    // The stats object is what we're interested in
    const {stats} = action.payload;

    function generateTableData(attributes) {
        let tableData = [];
        attributes.forEach(attribute => {
            attribute.subAttributes.forEach(subAttribute => {
                tableData.push([
                    attribute.attributeName,
                    subAttribute.name,
                    subAttribute.marksGiven,
                    subAttribute.weight,
                    subAttribute.weightMark
                ]);
            });
        });
        return tableData;
    }

    function generateChartData(attributes) {
        return attributes.map((attribute) => {
            return {
                options: {
                    title: {
                        text: `${languageMap[platformCtx.language].totalWeightedMarksFor} ${attribute.attributeName}`,
                        align: "center",
                    },
                    chart: {
                        type: "bar",
                        height: 500
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
                        categories: attribute.subAttributes.map((subAttribute) => subAttribute.name),
                    },
                },
                series: [
                    {
                        name: languageMap[platformCtx.language].WMarks,
                        data: attribute.subAttributes.map((subAttribute) => parseFloat(subAttribute.weightMark)),
                    },
                    {
                        name: languageMap[platformCtx.language].Weight,
                        data: attribute.subAttributes.map((subAttribute) => subAttribute.weight),
                    },
                ],
            }
        });
    }

    switch (action.type) {
        case "SET_APPRAISAL":
            return {
                ...state,
                knowHow: {
                    percentageCarry: stats.knowHow.percentageCarry,
                    totalWeight: stats.knowHow.totalWeight,
                    totalWeightedMarks: stats.knowHow.totalWeightedMarks,
                    percentageScore: stats.knowHow.percentageScore,
                    tableData: generateTableData(stats.knowHow.attributes),
                    chartData: generateChartData(stats.knowHow.attributes)
                },
                problemSolving: {
                    percentageCarry: stats.problemSolving.percentageCarry,
                    totalWeight: stats.problemSolving.totalWeight,
                    totalWeightedMarks: stats.problemSolving.totalWeightedMarks,
                    percentageScore: stats.problemSolving.percentageScore,
                    tableData: generateTableData(stats.problemSolving.attributes),
                    chartData: generateChartData(stats.problemSolving.attributes)
                },
                accountability: {
                    percentageCarry: stats.accountability.percentageCarry,
                    totalWeight: stats.accountability.totalWeight,
                    totalWeightedMarks: stats.accountability.totalWeightedMarks,
                    percentageScore: stats.accountability.percentageScore,
                    tableData: generateTableData(stats.accountability.attributes),
                    chartData: generateChartData(stats.accountability.attributes)
                }
            }
        default:
            return state;
    }
}

function priorityScoreReducer(state, action,platformCtx) {
    switch (action.type) {
        case "SET_PRIORITY_SCORE":
            // Process from the payload = {percentageCarry, totalWeight, totalWeightedMarks, percentageScore}

            const languageMap = {
                English: {
                    knowHow: "Know How",
                    problemSolving: "Problem Solving",
                    accountability: "Accountability"
                },
                'Bahasa Melayu': {
                    knowHow: "Pengetahuan",
                    problemSolving: "Penyelesaian Masalah",
                    accountability: "Tanggungjawab"
                },
                '中文': {
                    knowHow: "专业知识",
                    problemSolving: "解决问题",
                    accountability: "责任心"
                }
            }

            const knowHowDecimalScore = ((action.payload.knowHow.percentageScore /  action.payload.knowHow.percentageCarry)).toFixed(2) + Math.random() / 1000;
            const problemSolvingDecimalScore = ((action.payload.problemSolving.percentageScore /  action.payload.problemSolving.percentageCarry)).toFixed(2) + Math.random() / 1000;
            const accountabilityDecimalScore = ((action.payload.accountability.percentageScore /  action.payload.accountability.percentageCarry)).toFixed(2) + Math.random() / 1000;

            // Create an array of objects {score, attribute}
            const scoresAndAttributes = [
                {score: knowHowDecimalScore, attribute: languageMap[platformCtx.language].knowHow},
                {score: problemSolvingDecimalScore, attribute: languageMap[platformCtx.language].problemSolving},
                {score: accountabilityDecimalScore, attribute: languageMap[platformCtx.language].accountability}
            ];

            // Sort the array of objects based on the score in ascending order
            const sortedScoresAndAttributes = scoresAndAttributes.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));

            // Get the sorted priorityOrder from the sorted array of objects
            const priorityOrder = sortedScoresAndAttributes.map(item => item.attribute);

            return {
                ...state,
                priorityOrder,
                sortedScores: sortedScoresAndAttributes.map(item => item.score)
            }
        default:
            return state;
    }
}

const ViewAppraisal = () => {
    const languageMap = {
        English: {
            employeesname: "Employees Name",
            employeesID: "Employees ID",
            home: "Home",
            performanceAppraisal: "Performance Appraisal",
            viewAppraisal: "View Appraisal",
            knowHow: "Know How",
            problemSolving: "Problem Solving",
            accountability: "Accountability",
            totalWeightedMarks: "Total Weighted Marks",
            totalWeight: "Total Weight",
            percentageScore: "Percentage Score",
            percentageCarry: "Percentage Carry",
            attribute: "Attribute",
            subAttribute: "Sub-attribute",
            marks: "Marks",
            attributeScoreHigherIsBetter: "Attribute Score (Higher is Better)",
            priorityScore: "Priority Score",
            totalPoint: "Total Point",
            grade: "Grade",
            department: "Department",
            designation: "Designation",
            jobGrade: "Job Grade",
            reviewPeriod: "Review Period",
            appraisalDate: "Appraisal Date",
            downloadPdf: "Download PDF",
            edit: "Edit",
            appraisersComment: "Appraiser's Comment",
            employeeComment: "Employee Comment",
            appraiser: "Appraiser",
            appraiserName: "Appraiser Name",
            weightedPercentage: "Weighted Percentage",
            weightedMarks: "Weighted Marks"

        },
        'Bahasa Melayu': {
            employeesname: "Nama Pekerja",
            employeesID: "ID Pekerja",
            home: "Laman Utama",
            performanceAppraisal: "Penilaian Prestasi",
            viewAppraisal: "Lihat Penilaian",
            knowHow: "Pengetahuan",
            problemSolving: "Penyelesaian Masalah",
            accountability: "Tanggungjawab",
            totalWeightedMarks: "Jumlah Berat Markah",
            totalWeight: "Jumlah Markah",
            percentageScore: "Peratusan Markah",
            percentageCarry: "Pembawaan Peratusan",
            attribute: "Atribut",
            subAttribute: "Sub-atribut",
            marks: "Markah",
            attributeScoreHigherIsBetter: "Skor Atribut (Tinggi Lebih Bagus)",
            priorityScore: "Skor Keutamaan",
            totalPoint: "Jumlah Markah",
            grade: "Gred",
            department: "Jabatan",
            designation: "Jawatan",
            jobGrade: "Gred Kerja",
            reviewPeriod: "Tempoh Semakan",
            appraisalDate: "Tarikh Penilaian",
            downloadPdf: "Muat turun PDF",
            edit: "Kemaskini",
            appraisersComment: "Komen Penilai",
            employeeComment: "Komen Pekerja",
            appraiser: "Penilai",
            appraiserName: "Nama Penilai",
            weightPercentage: "Berat Peratusan",
            weightedMarks: "Berat Markah",


        },
        '中文': {
            employeesname: "员工姓名",
            employeesID: "员工编号",
            home: "主页",
            performanceAppraisal: "绩效评估",
            viewAppraisal: "查看评估",
            knowHow: "专业知识",
            problemSolving: "解决问题",
            accountability: "责任心",
            totalWeightedMarks: "总加权分数",
            totalWeight: "总权重",
            percentageScore: "百分比得分",
            percentageCarry: "百分比携带",
            attribute: "属性",
            subAttribute: "子属性",
            marks: "分数",
            attributeScoreHigherIsBetter: "属性分数（越高越好）",
            priorityScore: "优先级分数",
            totalPoint: "总分",
            grade: "等级",
            department: "部门",
            designation: "职位",
            jobGrade: "工作等级",
            reviewPeriod: "审查期",
            appraisalDate: "评估日期",
            downloadPdf: "下载PDF",
            edit: "编辑",
            appraisersComment: "评估者的评论",
            employeeComment: "员工评论",
            appraiser: "评估者",
            appraiserName: "评估者姓名",
            weightPercentage: "权重百分比",
            weightedMarks: "加权分数",

        }
    };
    const {id} = useParams();

    // Page Header Handling
    const platformCtx = useContext(PlatformContext);
    const authCtx = useContext(AuthenticationContext);

    const [appraisal, setAppraisal] = useState(null);
    const [attributeData, dispatchAttributeData] = useReducer((state, action) => appraisalDataReducer(state, action, platformCtx), {});
    const [priorityScore, dispatchPriorityScore] = useReducer((state, action) => priorityScoreReducer(state, action, platformCtx), {
        priorityOrder: [],
        sortedScores: []
    });
    const [appraisalTab, setAppraisalTab] = useState("knowHow");
    const [chartIndex, setChartIndex] = useState(0);

    useEffect(() => {
        platformCtx.setPage(languageMap[platformCtx.language].viewAppraisal);
        platformCtx.setBreadcrumb([
            {name: languageMap[platformCtx.language].home},
            {name: languageMap[platformCtx.language].performanceAppraisal, path: "/performance-appraisal"},
            {name: languageMap[platformCtx.language].viewAppraisal, path: "/view-appraisal"}
        ]);
    }, [platformCtx.language]);

    useEffect(() => {
        const getPerformanceAppraisal = async () => {
            platformCtx.setLoading(true);

            try {
                const response = await axios.get(`/get-appraisal-details/${id}`);

                const data = response.data;

                if (data.success) {
                    setAppraisal(data.appraisal);
                    dispatchAttributeData({type: "SET_APPRAISAL", payload: data.appraisal}, platformCtx);
                } else {
                    console.error(data.message);
                }
            } catch (e) {
                console.error(e);
            }
        }

        getPerformanceAppraisal().then(() => {
            console.log("Got appraisal data");
            platformCtx.setLoading(false);
        });
    }, []);

    useEffect(() => {
        if(Object.keys(attributeData).length === 0) return;
        dispatchPriorityScore({type: "SET_PRIORITY_SCORE", payload: attributeData});
    }, [attributeData]);

    function handleAppraisalTabChange(tab) {
        setAppraisalTab(tab);
        setChartIndex(0);
    }

    function handleChartIndexChange(action) {
        if (action === "next") {
            setChartIndex((prev) => {
                if (prev === attributeData[appraisalTab].chartData.length - 1) {
                    return 0;
                }
                return prev + 1;
            });
        } else {
            setChartIndex((prev) => {
                if (prev === 0) {
                    return attributeData[appraisalTab].chartData.length - 1;
                }
                return prev - 1;
            });
        }
    }

    return appraisal && (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-between shadow-md bg-white rounded-md p-6 w-full gap-6">
                <div className="flex flex-row gap-4 items-center w-full lg:flex-1">
                    <img
                        className="rounded-full h-16 w-16 object-cover"
                        src={`${axios.defaults.baseURL}/avatars/${appraisal.employeeDetails.employeeId}`}
                        alt="portrait"/>
                    <div className="flex flex-col">
                        <p><strong>{languageMap[platformCtx.language].employeesname} </strong> {appraisal.employeeDetails.name}</p>
                        <p><strong>{languageMap[platformCtx.language].employeesID} </strong> {appraisal.employeeDetails.employeeId}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-sm w-full md:flex-1">
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].department}</p>
                        <p>{appraisal.employeeDetails.department}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].designation}</p>
                        <p>{appraisal.employeeDetails.designation}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].jobGrade}</p>
                        <p>G{appraisal.employeeDetails.jobGrade}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].dateJoined}</p>
                        <p>{appraisal.employeeDetails.dateOfJoining?? ""}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-sm w-full md:flex-1">
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].reviewPeriod}</p>
                        <p>{appraisal.timePeriod}</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].appraisalDate}</p>
                        <p>{new Date(appraisal.appraisalDate).toLocaleString(platformCtx.language === 'English' ? "en-my" : platformCtx.language === '中文' ? "zh-CN" : "ms-MY", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 text-sm w-full md:flex-1">
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].totalPoint}</p>
                        <p>{appraisal.stats.totalScore}%</p>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].grade}</p>
                        <p>{appraisal.stats.grade}</p>
                    </div>
                </div>
                <div className="flex flex-row gap-2 text-sm w-full lg:flex-1">
                    <Link to={`${axios.defaults.baseURL}/print-appraisal/${appraisal._id}`} target="_blank">
                        <Button>
                            <div className="flex flex-row gap-2 items-center">
                                <span className="material-icons">save</span>
                                <div>{languageMap[platformCtx.language].downloadPdf}</div>
                            </div>
                        </Button>
                    </Link>
                    {authCtx.hasPermission("performance_appraisal") && (
                        <Link to={`/performance-evaluation/${appraisal._id}`}>
                            <Button>
                                <div className="flex flex-row gap-2 items-center">
                                    <span className="material-icons">edit</span>
                                    <div>{languageMap[platformCtx.language].edit}</div>
                                </div>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <div className="flex flex-col shadow-md bg-white rounded-md p-6 w-full md:flex-1 gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].appraisersComment}</p>
                        <div className="flex flex-col h-full justify-between gap-4 rounded-md bg-gray-100 p-4">
                            <p>{appraisal.appraiserComments?.message || "No comment from appraiser."}</p>
                            <div className="flex flex-row gap-2 items-center">
                                <img
                                    className="rounded-full h-10 w-10 object-cover"
                                    src={`${axios.defaults.baseURL}/avatars/${appraisal.appraiserComments.user.employeeId}`}
                                    alt="portrait"/>
                                <div className="flex flex-col text-sm">
                                    <p>{appraisal.appraiserComments.user.name}</p>
                                    <p className="text-slate-400 text-xs">{languageMap[platformCtx.language].appraiserName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-medium">{languageMap[platformCtx.language].employeeComment}</p>
                        <div className="flex flex-col h-full justify-between gap-4 rounded-md bg-gray-100 p-4">
                            <p>{appraisal.employeeComment?.message || "No comment from employee."}</p>
                            <div className="flex flex-row gap-2 items-center">
                                <img
                                    className="rounded-full h-10 w-10 object-cover"
                                    src={`${axios.defaults.baseURL}/avatars/${appraisal.employeeDetails.employeeId}`}
                                    alt="portrait"/>
                                <div className="flex flex-col text-sm">
                                    <p>{appraisal.employeeDetails.name}</p>
                                    <p className="text-slate-400 text-xs">{appraisal.employeeComment && new Date(appraisal.employeeComment.timestamp).toLocaleDateString("em-my", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric"
                                    })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col shadow-md bg-white rounded-md p-6 w-full md:flex-1 gap-4">
                    {Object.keys(attributeData).length > 0 && (
                        <Chart type="bar" height={300} options={{
                            title: {
                                text: languageMap[platformCtx.language].attributeScoreHigherIsBetter,
                                align: "center",
                            },
                            chart: {
                                type: "bar",
                                height: 300
                            },
                            plotOptions: {
                                bar: {
                                    horizontal: false,
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
                                categories: priorityScore.priorityOrder,
                            },
                        }} series={[
                            {
                                name: languageMap[platformCtx.language].priorityScore,
                                data: priorityScore.sortedScores
                            },
                        ]}/>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-6 w-full">
                <div className="flex flex-col shadow-md bg-white rounded-md p-6 gap-8 lg:w-2/3 w-full flex-1">
                    <div className="flex flex-row gap-2">
                        <button
                            className="flex flex-row p-2 rounded-md bg-slate-500 text-white hover:bg-red-600 text-sm items-center aria-checked:bg-red-500"
                            aria-checked={appraisalTab === "knowHow"}
                            onClick={() => handleAppraisalTabChange("knowHow")}>
                            <p>{languageMap[platformCtx.language].knowHow}</p>
                        </button>
                        <button
                            className="flex flex-row p-2 rounded-md bg-slate-500 text-white hover:bg-red-600 text-sm items-center aria-checked:bg-red-500"
                            aria-checked={appraisalTab === "problemSolving"}
                            onClick={() => handleAppraisalTabChange("problemSolving")}>
                            <p>{languageMap[platformCtx.language].problemSolving}</p>
                        </button>
                        <button className="flex flex-row p-2 rounded-md bg-slate-500 text-white hover:bg-red-600 text-sm items-center aria-checked:bg-red-500" aria-checked={appraisalTab === "accountability"} onClick={() => handleAppraisalTabChange("accountability")}>
                            <p>{languageMap[platformCtx.language].accountability}</p>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <p className="font-medium">{languageMap[platformCtx.language].totalWeightedMarks}</p>
                            <p>{attributeData[appraisalTab].totalWeightedMarks}%</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="font-medium">{languageMap[platformCtx.language].totalWeight}</p>
                            <p>{attributeData[appraisalTab].totalWeight}%</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="font-medium">{languageMap[platformCtx.language].percentageScore}</p>
                            <p>{attributeData[appraisalTab].percentageScore}%</p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <p className="font-medium">{languageMap[platformCtx.language].percentageCarry}</p>
                            <p>{attributeData[appraisalTab].percentageCarry}%</p>
                        </div>
                    </div>
                    <div className="w-full">
                        <Table
                            header={[
                                languageMap[platformCtx.language].attribute,
                                languageMap[platformCtx.language].subAttribute,
                                languageMap[platformCtx.language].marks,
                                languageMap[platformCtx.language].weightPercentage,
                                languageMap[platformCtx.language].weightedMarks
                            ]}
                            data={attributeData[appraisalTab].tableData}
                        />
                    </div>
                </div>
                <div className="flex flex-col shadow-md bg-white rounded-md p-6 gap-4 lg:w-1/3 w-full items-center">
                    <div className="w-full">
                        <Chart
                            options={attributeData[appraisalTab].chartData[chartIndex].options}
                            series={attributeData[appraisalTab].chartData[chartIndex].series}
                            type="bar"
                            height={500}
                        />
                    </div>
                    <div className="flex flex-row justify-evenly gap-4 w-full text-2xl">
                        <span className="material-icons p-2 cursor-pointer" onClick={() => handleChartIndexChange("prev")}>chevron_left</span>
                        <span className="material-icons p-2 cursor-pointer" onClick={() => handleChartIndexChange("next")}>chevron_right</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAppraisal;