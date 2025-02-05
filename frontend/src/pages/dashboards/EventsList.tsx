// src\pages\dashboards\EventsList.tsx
import { Alert, Button, Card, message, Space, Table, Tag, Typography } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Loader } from '../../components';
import { useFetchData } from '../../hooks';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';


const EVENT_COLUMNS: ColumnsType<Events> = [
    {
        title: 'Name', // Cột "Name" chính, hiển thị link
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Link to={`/details/events/${record.id}`}> {text}</Link>, // Link tới trang chi tiết
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
        title: 'Actions', // Cột "Actions" chỉ còn nút "Details"
        key: 'actions',
        render: (_, record) => (
            <Space size="middle">
                <Button type="primary" size="small">
                    <Link to={`/details/events/${record.id}`}>Details</Link> {/* Nút Details link tới trang chi tiết */}
                </Button>
            </Space>
        ),
    },
];


const EventsListPage = () => {
    const { data: eventsData, error: eventsError, loading: eventsLoading } = useFetchData('http://localhost:8080/api/v1/events');

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

            <Card>
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
                    dataSource={eventsData?.data?.events || []} // Use data from API response
                    loading={eventsLoading}
                    pagination={{
                        total: eventsData?.data?.meta?.totalItems,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        pageSize: 10, // Adjust as needed
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                />
            </Card>
        </div>
    );
};

export default EventsListPage;