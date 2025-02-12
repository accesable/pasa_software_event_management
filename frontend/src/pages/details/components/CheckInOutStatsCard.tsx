// src\pages\details\components\CheckInOutStatsChart.tsx
import React from 'react';
import { Column } from '@ant-design/charts'; // Thay đổi import từ Pie thành Column
import { Alert } from 'antd';

interface CheckInOutStatsChartProps {
    checkInOutStats: {
        totalRegistered: number;
        totalCheckedIn: number;
        totalCheckedOut: number;
        checkInRate: number;
        checkOutRate: number;
    };
}

const CheckInOutStatsChart: React.FC<CheckInOutStatsChartProps> = ({ checkInOutStats }) => {
    if (!checkInOutStats) {
        return <Alert message="No check-in/check-out stats data" type="warning" showIcon />;
    }

    const data = [
        { type: 'Checked-In', value: checkInOutStats.totalCheckedIn },
        { type: 'Checked-Out', value: checkInOutStats.totalCheckedOut },
        { type: 'Registered', value: checkInOutStats.totalRegistered }, // Registered
    ];

    const config = {
        data,
        xField: 'type', // Sử dụng 'type' làm trục x (tên trạng thái)
        yField: 'value', // Sử dụng 'value' làm trục y (số lượng)
        label: {
            position: 'top' as const,
            style: {
                fill: '#000',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        yAxis: {
            min: 0, // Đảm bảo trục Y bắt đầu từ 0
        },
        seriesField: 'type', // Không cần seriesField trong trường hợp này, có thể bỏ nếu không cần thiết
        legend: { visible: false }, // Ẩn legend vì type đã hiển thị trên cột
        tooltip: {
            formatter: (params: any) => {
                return {
                    name: params.type,
                    value: params.value,
                };
            },
        },
    };

    return <Column {...config} />; // Thay Pie bằng Column
};

export default CheckInOutStatsChart;
