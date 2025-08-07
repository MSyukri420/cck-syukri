import React, { useContext } from 'react';
import { PlatformContext } from "../Layout/PlatformLayout.jsx";
import Chart from 'react-apexcharts';

const TopPerformersChart = ({ data }) => {
    const platformCtx = useContext(PlatformContext);
    const languageMap = {
        "English": {
            "attributeScoreHigherIsBetter": "Attribute Score (Higher is Better)",
            "knowHow": "Know-How",
            "problemSolving": "Problem Solving",
            "accountability": "Accountability",
            "totalScore": "Total Score"
        },
        "Bahasa Melayu": {
            "attributeScoreHigherIsBetter": "Skor Atribut (Lebih Tinggi adalah Lebih Baik)",
            "knowHow": "Pengetahuan",
            "problemSolving": "Penyelesaian Masalah",
            "accountability": "Tanggungjawab",
            "totalScore": "Skor Keseluruhan"
        },
        "中文": {
            "attributeScoreHigherIsBetter": "属性分数（越高越好）",
            "knowHow": "知识",
            "problemSolving": "解决问题",
            "accountability": "责任",
            "totalScore": "总分"
        }
    };

    const attributeData = data || [];
    const categories = attributeData.map(item => `${item.employeeInfo.name} (${item.stats.totalScore}%)`);
    const knowHowScores = attributeData.map(item => item.stats.knowHow.percentageScore);
    const problemSolvingScores = attributeData.map(item => item.stats.problemSolving.percentageScore);
    const accountabilityScores = attributeData.map(item => item.stats.accountability.percentageScore);

    const series = [
        {
            name: languageMap[platformCtx.language].knowHow,
            data: knowHowScores
        },
        {
            name: languageMap[platformCtx.language].problemSolving,
            data: problemSolvingScores
        },
        {
            name: languageMap[platformCtx.language].accountability,
            data: accountabilityScores
        }
    ];

    return (
        <div className="flex flex-col p-6 w-full md:flex-1 gap-4">
            {attributeData.length > 0 && (
                <Chart 
                    type="bar" 
                    height={300} 
                    options={{
                        chart: {
                            type: "bar",
                            height: 300,
                            stacked: true
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
                            }
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
                            categories: categories,
                        },
                    }} 
                    series={series}
                />
            )}
        </div>
    );
};

export default TopPerformersChart;
