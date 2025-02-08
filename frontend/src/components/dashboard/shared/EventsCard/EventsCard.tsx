// src\components\dashboard\shared\EventsCard\EventsCard.tsx
import React from 'react';
import {
  Card as AntdCard,
  CardProps,
  Descriptions,
  DescriptionsProps,
  Flex,
  Tooltip,
  Typography,
  Spin, // Import Spin
  Tag, // Import Tag
  message, // Import message
} from 'antd';
import {
  CalendarOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

import './styles.css';
import { Events } from '../../../../types';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import authService from '../../../../services/authService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

type Props = {
  event?: Events; // Make event prop optional
  size?: 'small' | 'default';
} & CardProps;

export const EventsCard = (props: Props) => {
  const {
    size,
    event, // Event can be potentially undefined
    ...others
  } = props;

  const [categoryName, setCategoryName] = useState<string | null>(null); // State for category name
  const [categoryLoading, setCategoryLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!event?.categoryId) return; // Exit if categoryId is missing
      setCategoryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getCategoryById(event.categoryId, accessToken || '');
        const categoryResponse = response as { data: { category: { name: string } } };
        setCategoryName(categoryResponse.data.category.name);
      } catch (error: any) {
        console.error('Error fetching category name:', error);
        message.error('Failed to load category name');
        setCategoryName('N/A'); // Set to N/A in case of error
      } finally {
        setCategoryLoading(false);
      }
    };

    if (event) {
      fetchCategoryName();
    }
  }, [event]);


  const items: DescriptionsProps['items'] = event ? [
    {
      key: 'event_name',
      label: 'Title',
      children: (
        <span className="text-capitalize">{event.name?.slice(0, 36)}...</span>
      ),
      span: 24,
    },
    {
      key: 'event_id',
      label: 'ID',
      children: event.id,
      span: 24,
    },
    {
      key: 'event_type',
      label: 'Category',
      children: categoryLoading ? <Spin size="small" /> : <Tag color="blue">{categoryName || 'Loading...'}</Tag>, // Display category name or loader
      span: 24,
    },
    {
      key: 'project_location',
      label: 'Location',
      children: event.location,
      span: 24,
    },
    {
      key: 'project_status',
      label: 'Status',
      children: <span className="text-capitalize">{event.status}</span>,
    },
    {
      key: 'team_size',
      label: <UsergroupAddOutlined />,
      children: (
        <Tooltip title="Team size">
          <Typography.Text>{event.maxParticipants}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      key: 'start_date',
      label: <CalendarOutlined />,
      children: (
        <Tooltip title="Project date">
          <Typography.Text>{event.startDate ? dayjs(event.startDate).format('DD/MM/YYYY HH:mm') : 'N/A'} - {event.endDate ? dayjs(event.endDate).format('DD/MM/YYYY HH:mm') : 'N/A'}</Typography.Text>
        </Tooltip>
      ),
    },
  ] : [];


  return size === 'small' ? (
    <AntdCard
      bordered
      hoverable={true}
      className="project-small-card"
      {...others}
    >
      <Title level={5} className="text-capitalize m-0">
        {event?.name?.slice(0, 15)}
      </Title>
      <br />
      <Flex wrap="wrap" gap="small" className="text-capitalize">
        <Text>
          Category: <b>{categoryLoading ? <Spin size="small" /> : <Tag color="blue">{categoryName || 'Loading...'}</Tag>}</b>,
        </Text>
        <Text>
          Location: <b>{event?.location}</b>
        </Text>
      </Flex>
    </AntdCard>
  ) : (
    <AntdCard bordered hoverable={true} {...others}>
      <Descriptions
        items={items}
        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
      />
    </AntdCard>
  );
};
