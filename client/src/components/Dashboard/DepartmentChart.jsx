import React, { useContext } from 'react';
import { PlatformContext } from '../Layout/PlatformLayout.jsx';
import Chart from 'react-apexcharts';

const DepartmentChart = ({ data }) => {
    if (!data) {
        return <p>No department data available</p>;
    }

    const platformCtx = useContext(PlatformContext);
    const chartData = Object.keys(data).map(key => ({
        name: key,
        Employees: data[key]
    }));

    const translations = {
        "English": {
            "Employees": "Employees"
        },
        "Bahasa Melayu": {
            "Employees": "Pekerja"
        },
        "中文": {
            "Employees": "员工"
        }
    };

    const translateKey = (key) => {
        const language = platformCtx.language || 'English'; // Default to 'English' if platformCtx.language is not defined
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
                        categories: chartData.map(item => item.name),
                    },
                    tooltip: {
                        shared: true,
                        intersect: false,
                    },
                }} 
                series={[
                    {
                        name: translateKey("Employees"),
                        data: chartData.map(item => item.Employees)
                    }
                ]}
            />
        </div>
    );
};

export default DepartmentChart;
