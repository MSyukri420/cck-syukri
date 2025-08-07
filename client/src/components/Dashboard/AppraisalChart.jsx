import React, { useContext } from 'react';
import { PlatformContext } from '../Layout/PlatformLayout.jsx';
import Chart from 'react-apexcharts';

const AppraisalChart = ({ data }) => {
    if (!data || !data.length) {
        return <p>No appraisal data available</p>;
    }

    const platformCtx = useContext(PlatformContext);
    const chartData = data.map(item => ({
        Date: `${item._id.month}/${item._id.year}`,
        Appraisals: item.count
    }));

    const translations = {
        "English": {
            "Appraisals": "Appraisals"
        },
        "Bahasa Melayu": {
            "Appraisals": "Penilaian"
        },
        "中文": {
            "Appraisals": "评估"
        }
    };

    const translateKey = (key) => {
        const language = platformCtx.language || 'English';
        return translations[language][key] || key;
    };

    return (
        <div className="flex flex-col p-6 w-full md:flex-1 gap-4">
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
                    xaxis: {
                        categories: chartData.map(item => item.Date),
                    },
                    tooltip: {
                        shared: true,
                        intersect: false,
                    },
                }} 
                series={[
                    {
                        name: translateKey("Appraisals"),
                        data: chartData.map(item => item.Appraisals)
                    }
                ]}
            />
        </div>
    );
};

export default AppraisalChart;
