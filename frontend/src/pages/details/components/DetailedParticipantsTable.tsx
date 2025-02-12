// src\pages\details\components\DetailedParticipantsTable.tsx
import React from 'react';
import { Table, Alert } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface DetailedParticipantsTableProps {
    detailedParticipants: any[];
    meta: any;
}

const DetailedParticipantsTable: React.FC<DetailedParticipantsTableProps> = ({ detailedParticipants, meta }) => {
    if (!detailedParticipants || detailedParticipants.length === 0) {
        return <Alert message="No detailed participants data" type="info" showIcon />;
    }

    const columns: ColumnsType<any> = [
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
            title: 'Registration Date',
            dataIndex: 'registrationDate',
            key: 'registrationDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
        },
        {
            title: 'Check-in Time',
            dataIndex: 'checkInAt',
            key: 'checkInAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
        },
        {
            title: 'Check-out Time',
            dataIndex: 'checkOutAt',
            key: 'checkOutAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
        },
        {
            title: 'Ticket Status',
            dataIndex: 'ticketStatus',
            key: 'ticketStatus',
            render: (status: number) => {
                let statusText = 'Unknown';
                switch (status) {
                    case 0: statusText = 'ACTIVE'; break;
                    case 1: statusText = 'USED'; break;
                    case 2: statusText = 'CHECKED_IN'; break;
                    case 3: statusText = 'CANCELED'; break;
                    default: statusText = 'UNKNOWN'; break;
                }
                return statusText;
            }
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={detailedParticipants}
            pagination={{
                current: meta.page,
                pageSize: meta.limit,
                total: meta.totalItems,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                pageSizeOptions: ['10', '20', '50', '100'],
                showSizeChanger: true,
            }}
            rowKey="id"
        />
    );
};

export default DetailedParticipantsTable;
