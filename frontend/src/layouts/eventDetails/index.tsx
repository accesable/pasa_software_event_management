// src/layouts/eventDetails/index.tsx
import { AppLayout } from '../index.ts';
import { Col, Row, message, Spin, Typography, Card, Tag } from 'antd';
import { useLocation, useParams, Outlet } from 'react-router-dom';
import { CiLocationOn, CiUser, CiCalendar } from "react-icons/ci"; // Import thêm icons
import { PageHeader } from '../../components';
import { HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import { useStylesContext } from '../../context';
import { useEffect, useState } from 'react';
import authService from '../../services/authService.ts';
import dayjs from 'dayjs';

const { Text } = Typography;

export const EventDetailLayout = () => {
  const { pathname } = useLocation();
  const { id: eventId } = useParams<{ id: string }>(); // Lấy eventId từ URL
  const stylesContext = useStylesContext();

  // State lưu trữ thông tin sự kiện
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await authService.getEventDetails(eventId) as { statusCode: number; data: any; message?: string };
        console.log('response', response);
        if (response.statusCode === 200 && response.data) {
          // Lấy dữ liệu theo cấu trúc: response.data.event
          setEventDetail(response.data.event);
          console.log('eventDetail', response.data.event);
        } else {
          message.error(response.message || 'Failed to load event details');
        }
      } catch (error: any) {
        message.error(error.message || 'Error fetching event details');
      } finally {
        setLoadingEvent(false);
      }
    };

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  return (
    <>
      {/*@ts-ignore*/}
      <AppLayout>
        <PageHeader
          title="Event Details"
          breadcrumbs={[
            {
              title: (
                <>
                  <HomeOutlined />
                  <span>home</span>
                </>
              ),
              path: '/',
            },
            {
              title: (
                <>
                  <IdcardOutlined />
                  <span>event</span>
                </>
              ),
            },
            {
              title: pathname.split('/')[pathname.split('/').length - 1] || '',
            },
          ]}
        />
        <Row {...stylesContext?.rowProps}>
          <Col xs={24} md={16} xl={18}>
            <Outlet context={{ eventId, eventDetail }} /> {/* Truyền eventId và eventDetail qua context */}
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Row {...stylesContext?.rowProps}>
              <Col span={24}>
                <Card title="Event Info">
                  {loadingEvent ? (
                    <div style={{ textAlign: 'center' }}>
                      <Spin tip="Loading event info..." />
                    </div>
                  ) : (
                    // Sử dụng div với display flex để bố trí các mục thông tin
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Name:</Text>
                        <Text>{eventDetail?.name || 'N/A'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Status:</Text>
                        <Tag color={eventDetail?.status === 'SCHEDULED' ? 'blue' : eventDetail?.status === 'CANCELED' ? 'red' : 'green'}>{eventDetail?.status}</Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiLocationOn />
                        <Text strong>Location:</Text>
                        <Text>{eventDetail?.location || 'N/A'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiUser />
                        <Text strong>Capacity:</Text>
                        <Text>{eventDetail?.maxParticipants || 'Unlimited'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiCalendar />
                        <Text strong>Start Date:</Text>
                        <Text>
                          {eventDetail?.startDate ? dayjs(eventDetail.startDate).format('DD/MM/YYYY HH:mm') : 'N/A'}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiCalendar />
                        <Text strong>End Date:</Text>
                        <Text>
                          {eventDetail?.endDate ? dayjs(eventDetail.endDate).format('DD/MM/YYYY HH:mm') : 'N/A'}
                        </Text>
                      </div>
                      {/* Bạn có thể thêm các thông tin khác nếu cần */}
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </AppLayout>
    </>
  );
};

export default EventDetailLayout;
