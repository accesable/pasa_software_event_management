// src\components\dashboard\events\EventParticipantsTable.tsx
import React from 'react';
import { Table, TableProps, Alert } from 'antd';

import dayjs from 'dayjs';
import { Loader } from '../../components';
import { useFetchData } from '../../hooks';
import { Participants } from '../../types';

interface EventParticipantsTableProps extends TableProps<Participants> {
    eventId: string;
}

const PARTICIPANTS_COLUMNS = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Check-in Time',
        dataIndex: 'checkInAt',
        key: 'checkInAt',
        render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
    {
        title: 'Check-out Time',
        dataIndex: 'checkOutAt',
        key: 'checkOutAt',
        render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
    },
];

const EventParticipantsTable: React.FC<EventParticipantsTableProps> = ({ eventId }) => {
    const { data: participantsData, error: participantsError, loading: participantsLoading } = useFetchData(
        eventId ? `/events/${eventId}/participants` : "",
        localStorage.getItem('accessToken') || undefined
    );
    if (!eventId) {
        return <Alert message="Event ID is missing." type="warning" showIcon />;
    }

    if (participantsLoading) {
        return <Loader />;
    }

    // Kiểm tra nếu không có dữ liệu người tham gia
    if (!participantsData?.data || participantsData.data.length === 0) {
        return <Alert message="No participants found for this event." type="info" showIcon />;
    }

    // Kiểm tra cụ thể nếu participantsData.data là undefined hoặc mảng rỗng
    if (participantsError) {
        return <Alert message="Error loading participants" description={participantsError.toString()} type="error" showIcon />;
    }

    return (
        <div>
            <Table
                dataSource={participantsData.data} // Dùng participantsData.data thay vì participantsData?.data || []
                columns={PARTICIPANTS_COLUMNS}
                loading={participantsLoading}
                pagination={{ pageSize: 5 }}
                rowKey="id"
            />
        </div>
    );
};

export { EventParticipantsTable };