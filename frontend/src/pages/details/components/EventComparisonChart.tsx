// src\pages\details\components\EventComparisonChart.tsx
import React from 'react';
import { Column } from '@ant-design/charts';
import { Alert, Spin } from 'antd';

interface EventComparisonChartProps {
    eventComparisonDataList: any[]; // Thay 'any' bằng interface/type cụ thể nếu có
    loading: boolean;
    error: string | null;
}

const EventComparisonChart: React.FC<EventComparisonChartProps> = ({ eventComparisonDataList, loading, error }) => {
    if (error) {
        return <Alert message="Error loading event comparison data" description={error} type="error" showIcon />;
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Loading event comparison data..." />
        </div>;
    }

    if (!eventComparisonDataList || eventComparisonDataList.length === 0) {
        return <Alert message="No event comparison data available" type="warning" showIcon />;
    }

    const chartData = eventComparisonDataList.flatMap((event: any) => [
        {
            eventName: event.eventName,
            category: 'Registration Count',
            value: event.registrationCount,
        },
        {
            eventName: event.eventName,
            category: 'Feedback Count',
            value: event.feedbackCount,
        },
        {
            eventName: event.eventName,
            category: 'Average Rating',
            value: event.averageRating,
        },
    ]);

    const config = {
        data: chartData,
        isGroup: true,
        xField: 'eventName',
        yField: 'value',
        seriesField: 'category',
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
            min: 0,
        },
        tooltip: {
            formatter: (params: any) => {
                return {
                    name: params.category,
                    value: params.value,
                };
            },
        },
    };

    return <Column {...config} />;
};

export default EventComparisonChart;
