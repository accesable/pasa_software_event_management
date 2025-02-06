// src\pages\dashboards\EventsList.tsx
import { Alert, Button, Card, Space, Table, Tag, Select } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Loader } from '../../components';
import { useFetchData } from '../../hooks';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const EVENT_COLUMNS: ColumnsType<Events> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Link to={`/details/events/${record.id}`}> {text}</Link>,
    },
    {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
        render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        title: 'Category',
        dataIndex: 'categoryId',
        key: 'categoryId',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <Tag color={status === 'SCHEDULED' ? 'blue' : status === 'CANCELED' ? 'red' : 'green'}>
                {status}
            </Tag>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Button type="primary" size="small">
                    <Link to={`/details/events/${record.id}`}>Details</Link>
                </Button>
            </Space>
        ),
    },
];

const EVENT_STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CANCELED', label: 'Canceled' },
    { value: 'FINISHED', label: 'Finished' },
];

const EventsListPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { data: eventsData, error: eventsError, loading: eventsLoading } = useFetchData(
        `http://localhost:8080/api/v1/events${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`,
        localStorage.getItem('accessToken') || undefined
    );


    const onStatusFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    return (
        <div>
            <Helmet>
                <title>Events List | Antd Dashboard</title>
            </Helmet>
            <PageHeader
                title="Events List"
                breadcrumbs={[
                    {
                        title: (
                            <>
                                <HomeOutlined />
                                <span>Home</span>
                            </>
                        ),
                        path: '/',
                    },
                    {
                        title: (
                            <>
                                <PieChartOutlined />
                                <span>Dashboards</span>
                            </>
                        ),
                        menu: {
                            items: DASHBOARD_ITEMS.map((d) => ({
                                key: d.title,
                                title: <Link to={d.path}>{d.title}</Link>,
                            })),
                        },
                    },
                    {
                        title: 'Events List',
                    },
                ]}
            />

            <Card
                title="Events"
                extra={
                    <Select
                        defaultValue="all"
                        style={{ width: 200 }}
                        onChange={onStatusFilterChange}
                        options={EVENT_STATUS_OPTIONS}
                    />
                }
            >
                {eventsError && (
                    <Alert
                        message="Error"
                        description={eventsError.toString()}
                        type="error"
                        showIcon
                        closable
                    />
                )}

                <Table
                    columns={EVENT_COLUMNS}
                    dataSource={eventsData?.data?.events || []}
                    loading={eventsLoading}
                    pagination={{
                        total: eventsData?.data?.meta?.totalItems,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />
            </Card>
        </div>
    );
};

export default EventsListPage;