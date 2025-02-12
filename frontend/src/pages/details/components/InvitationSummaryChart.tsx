// src\pages\details\components\InvitationSummaryChart.tsx
import React from 'react';
import { Pie } from '@ant-design/charts';
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

    const config = {
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
                fontSize: 14,
                textAlign: 'center',
            },
        },
        interactions: [{ type: 'element-active' }],
    };
    return <Pie {...config} />;
};

export default InvitationSummaryChart;
