// src\pages\details\components\InvitationSummaryChart.tsx
import React from 'react';
import { Pie, PieConfig } from '@ant-design/charts';
import { Alert } from 'antd';

interface InvitationSummaryChartProps {
    invitationSummary: {
        accepted: number;
        pending: number;
        declined: number;
        totalInvited: number;
    };
}

const InvitationSummaryChart: React.FC<InvitationSummaryChartProps> = ({ invitationSummary }) => {
    if (!invitationSummary) {
        return <Alert message="No invitation summary data" type="warning" showIcon />;
    }

    const data = [
        { type: 'Accepted', value: invitationSummary.accepted },
        { type: 'Pending', value: invitationSummary.pending },
        { type: 'Declined', value: invitationSummary.declined },
    ];

    const config: PieConfig = { // Đảm bảo config có kiểu PieConfig
        appendPadding: 10,
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
            style: {
                fontSize: 14, // Kích thước font chữ mặc định
                textAlign: 'center',
            },
        },
        interactions: [{ type: 'element-active' }],
         legend: { // Cấu hình Legend (chú thích)
            position: 'bottom', // Hiển thị chú thích ở dưới chart
        },
    };

    return <Pie {...config} />;
};

export default InvitationSummaryChart;
