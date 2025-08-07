import React, { useContext } from 'react';
import { PlatformContext } from '../Layout/PlatformLayout.jsx';
import Chart from 'react-apexcharts';

const EmployeeGrowthChart = ({ data }) => {
    if (!data || !data.length) {
        return <p>No employee growth data available</p>;
    }

    const platformCtx = useContext(PlatformContext);
    const chartData = data.map(item => ({
        Date: `${item._id.month}/${item._id.year}`,
        Employees: item.count
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
        const language = platformCtx.language || 'English';
        return translations[language][key] || key;
    };

    return (
        <div className="flex flex-col p-6 w-full md:flex-1 gap-4">
            <Chart 
                type="line"
                height={300} 
                options={{
                    chart: {
                        type: "line",
                        height: 300
                    },
                    stroke: {
                        curve: 'smooth'
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
                        name: translateKey("Employees"),
                        data: chartData.map(item => item.Employees)
                    }
                ]}
            />
        </div>
    );
};

export default EmployeeGrowthChart;
