// src\pages\dashboards\ParticipatedEvents.tsx
import React, { useState } from 'react';
import { Alert, Button, Card, Space, Table, Tag, Select } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Loader } from '../../components';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';
import useFetchParticipatedEventsData from '../../hooks/useFetchParticipatedEventsData';

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

const ParticipatedEventsPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { data: eventsData, error: eventsError, loading: eventsLoading, fetchData } = useFetchParticipatedEventsData(statusFilter === 'all' ? undefined : statusFilter);

    const onStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const isEmptyData = eventsData?.events === undefined || eventsData?.events?.length === 0;


    return (
        <div>
            <Helmet>
                <title>Participated Events | Antd Dashboard</title>
            </Helmet>
            <PageHeader
                title="Participated Events"
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
                        // menu: {
                        //     items: DASHBOARD_ITEMS.map((d) => ({
                        //         key: d.title,
                        //         label: <Link to={d.path}>{d.title}</Link>, // Sử dụng label thay vì title
                        //     }) as MenuProps['items'][number]),
                        // },
                    },
                    {
                        title: 'Participated Events',
                    },
                ]}
            />

            <Card
                title="List of Participated Events"
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

                {isEmptyData ? (
                    <Alert message="No events participated yet." type="info" showIcon />
                ) : (
                    <Table
                        columns={EVENT_COLUMNS}
                        dataSource={eventsData?.events || []}
                        loading={eventsLoading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: eventsData?.meta?.totalItems || 0,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showSizeChanger: true,
                            onChange: handlePaginationChange,
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default ParticipatedEventsPage;