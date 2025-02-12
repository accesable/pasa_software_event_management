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
            responsive: ['lg'], // Ẩn cột ID trên màn hình nhỏ hơn lg
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
            // responsive: ['md'], // Ẩn cột Email trên màn hình nhỏ hơn md
        },
        {
            title: 'Registration Date',
            dataIndex: 'registrationDate',
            key: 'registrationDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
            // responsive: ['sm'], // Ẩn cột Registration Date trên màn hình nhỏ hơn sm
        },
        {
            title: 'Check-in Time',
            dataIndex: 'checkInAt',
            key: 'checkInAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
            // responsive: ['sm'], // Ẩn cột Check-in Time trên màn hình nhỏ hơn sm
        },
        {
            title: 'Check-out Time',
            dataIndex: 'checkOutAt',
            key: 'checkOutAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
            // responsive: ['sm'], // Ẩn cột Check-out Time trên màn hình nhỏ hơn sm
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
            },
            // responsive: ['md'],
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
            scroll={{ x: 'max-content' }} // Thêm scroll ngang cho table
        />
    );
};

export default DetailedParticipantsTable;
