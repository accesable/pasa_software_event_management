// src\pages\edit\EditEventPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
  message,
  Space
} from 'antd';
import { DASHBOARD_ITEMS, PATH_DASHBOARD } from '../../constants';
import { PageHeader, Loader } from '../../components';
import { Events } from '../../types';
import authService from '../../services/authService';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';
import EventFileUploadForm from './EventFileUploadForm';
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HomeOutlined, PieChartOutlined, ArrowLeftOutlined, CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import CreateSpeakerModal from '../../components/CreateSpeakerModal';
import CreateGuestModal from '../../components/CreateGuestModal';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventDetails, setEventDetails] = useState<Events | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [speakersOptions, setSpeakersOptions] = useState<any>([]);
  const [guestsOptions, setGuestsOptions] = useState<any>([]);
  const [isCreateSpeakerModalVisible, setIsCreateSpeakerModalVisible] = useState(false);
  const [isCreateGuestModalVisible, setIsCreateGuestModalVisible] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await authService.getEventDetails(id, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string, error?: string };
      if (response.statusCode === 200 && response.data.event) {
        setEventDetails(response.data.event);
        form.setFieldsValue({
          name: response.data.event.name,
          description: response.data.event.description,
          startDate: dayjs(response.data.event.startDate),
          endDate: dayjs(response.data.event.endDate),
          location: response.data.event.location,
          categoryId: response.data.event.categoryId,
          maxParticipants: response.data.event.maxParticipants,
          banner: response.data.event.banner,
          videoIntro: response.data.event.videoIntro,
          status: response.data.event.status,
          guestIds: response.data.event.guestIds,
          schedule: response.data.event.schedule?.map((session: any) => ({
            ...session,
            speakerIds: session.speakerIds,
            title: session.title, // Make sure to include title
            description: session.description, // Make sure to include description
            startTime: dayjs(session.startTime),
            endTime: dayjs(session.endTime),
          })) || [],
        });
      } else {
        setError(response?.error || 'Failed to load event details');
        message.error(response?.error);
      }
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      setError(error.error);
      message.error(error.error);
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]);

  const fetchSpeakersOptions = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        navigate(PATH_DASHBOARD.my_events);
        return;
      }
      const response = await axiosInstance.get('/speakers', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = response.data as { statusCode: number; data: { speakers: any[] } };
      if (data.statusCode === 200) {
        const speakerList = data.data.speakers || [];
        setSpeakersOptions(
          speakerList.map((speaker: any) => ({
            value: speaker.id,
            label: speaker.name,
          }))
        );
      } else {
        setError("Failed to load speakers options.");
        message.error("Failed to load speakers options.");
      }
    } catch (error: any) {
      console.error("Failed to load speakers options:", error);
      setError("Failed to load speakers options.");
      message.error("Failed to load speakers options.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchGuestsOptions = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        navigate(PATH_DASHBOARD.my_events);
        return;
      }
      const response = await axiosInstance.get('/guests', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = response.data as { statusCode: number; data: { guests: any[] } };
      if (data.statusCode === 200) {
        const guestList = data.data.guests || [];
        setGuestsOptions(
          guestList.map((guest: any) => ({
            value: guest.id,
            label: guest.name,
          }))
        );
      } else {
        setError("Failed to load guests options.");
        message.error("Failed to load guests options.");
      }
    } catch (error: any) {
      console.error("Failed to load guests options:", error);
      setError("Failed to load guests options.");
      message.error("Failed to load guests options.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);


  useEffect(() => {
    fetchEventDetails();
    fetchSpeakersOptions();
    fetchGuestsOptions();
  }, [fetchEventDetails, fetchSpeakersOptions, fetchGuestsOptions]);


  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        navigate('/auth/signin');
        return;
      }

      const eventData = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        guestIds: values.guestIds || [],
        schedule: values.schedule?.map((session: any) => ({
          title: session.title, // Include title
          description: session.description, // Include description
          speakerIds: session.speakerIds || [], // Ensure speakerIds is always an array
          startTime: session.startTime.toISOString(),
          endTime: session.endTime.toISOString(),
        })) || [],
      };

      const response = await authService.updateEvent(id!, eventData, accessToken) as { statusCode: number; message: string; error?: string };
      if (response.statusCode === 200) {
        message.success(response.message);
        setTimeout(() => {
          navigate('/dashboards/my-events');
        }, 1000);
      } else {
        message.error(response.message || response.error || 'Failed to update event');
      }
    } catch (error: any) {
      message.error(error.message || error.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleCreateSpeaker = () => {
    setIsCreateSpeakerModalVisible(true);
  };

  const handleCancelCreateSpeakerModal = () => {
    setIsCreateSpeakerModalVisible(false);
  };

  const handleSpeakerCreated = (newSpeaker: any) => {
    setSpeakersOptions((prevOptions: { value: string; label: string }[]) => [...prevOptions, { value: newSpeaker.id, label: newSpeaker.name }]);
    form.setFieldsValue({ speakerIds: [...(form.getFieldValue('speakerIds') || []), newSpeaker.id] });
  };

  const handleCreateGuest = () => {
    setIsCreateGuestModalVisible(true);
  };

  const handleCancelCreateGuestModal = () => {
    setIsCreateGuestModalVisible(false);
  };

  const handleGuestCreated = (newGuest: any) => {
    setGuestsOptions((prevOptions: { value: string; label: string }[]) => [...prevOptions, { value: newGuest.id, label: newGuest.name }]);
    form.setFieldsValue({ guestIds: [...(form.getFieldValue('guestIds') || []), newGuest.id] });
  };


  if (loading && !eventDetails) {
    return <Loader />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }


  return (
    <div>
      <Helmet>
        <title>Edit Event | Dashboard</title>
      </Helmet>
      <PageHeader
        title="Edit Event"
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
            title: 'Edit Event',
          },
        ]}
      />

      <Card title={`Edit Event: ${eventDetails?.name}`} extra={<Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back</Button>}>
        <Form
          form={form}
          name="edit-event-form"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="on"
          requiredMark={false}
        >
          <Row gutter={[16, 0]}>
            <Col sm={24} lg={24}>
              <Form.Item<any>
                label="Event's Name"
                name="name"
                rules={[{ required: true, message: 'Please input your event name!' }]}
              >
                <Input placeholder='Tech Conference 2026' />
              </Form.Item>
            </Col>
            <Col sm={24} lg={24}>
              <Form.Item<any>
                label="Event's Description"
                name="description"
                rules={[{ required: false }]}
              >
                <Input.TextArea rows={3} placeholder='A major event about technology and innovation (optional)' />
              </Form.Item>
            </Col>
            <Col sm={24} lg={8}>
              <Form.Item<any>
                label="Event's Capacity"
                name="maxParticipants"
                rules={[{ required: false, message: 'Please input event capacity!' }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} placeholder="Unlimited if empty" />
              </Form.Item>
            </Col>
            <Col sm={24} lg={8}>
              <Form.Item<any>
                label="Start At"
                name="startDate"
                rules={[{ required: true, message: 'Please input your start of event' },]}
              >
                <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col sm={24} lg={8}>
              <Form.Item<any>
                label="End At"
                name="endDate"
                rules={[{ required: true, message: 'Please input your end of event' },]}
              >
                <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item<any>
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please input event location!' }]}
              >
                <Input placeholder="Hall A, University Campus" />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item<any>
                label="Event Type"
                name="categoryId"
                rules={[{ required: true, message: 'Please input your event type!' }]}
              >
                <Select
                  options={[
                    { value: '678a2141f8a1c0593de58562', label: 'IT' }, // Replace with actual categories from API later
                    { value: '676b9128c0ea46752f9a5c89', label: 'Technology' },
                  ]}
                  placeholder="Select Event Type"
                />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item<any>
                label="Banner URL (Optional)"
                name="banner"
                rules={[{ required: false }]}
              >
                <Input placeholder="https://example.com/banner.jpg" />
              </Form.Item>
            </Col>
            <Col sm={24} lg={12}>
              <Form.Item<any>
                label="Video Intro URL (Optional)"
                name="videoIntro"
                rules={[{ required: false }]}
              >
                <Input placeholder="https://example.com/video.mp4" />
              </Form.Item>
            </Col>
            <Col span={24} lg={12}>
              <Form.Item<any>
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select event status!' }]}
              >
                <Select
                  options={[
                    { value: 'SCHEDULED', label: 'Scheduled' },
                    { value: 'CANCELED', label: 'Canceled' },
                    { value: 'FINISHED', label: 'Finished' },
                  ]}
                  placeholder="Select Event Status"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={12}>
              <Form.Item<any>
                label="Guests"
                name="guestIds"
              >
                <Select
                  mode="multiple"
                  placeholder="Select Guests"
                  options={guestsOptions}
                  allowClear
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Button type="text" onClick={handleCreateGuest} icon={<PlusOutlined />} style={{width: '100%', textAlign: 'left'}}>
                        Create New Guest
                      </Button>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.List name="schedule" >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          fieldKey={[fieldKey || 0, 'title']}
                          rules={[{ required: true, message: 'Missing session title' }]}
                        >
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'startTime']}
                          fieldKey={[fieldKey || 0, 'startTime']}
                          rules={[{ required: true, message: 'Missing start time' }]}
                        >
                          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Start Time" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'endTime']}
                          fieldKey={[fieldKey || 0, 'endTime']}
                          rules={[{ required: true, message: 'Missing end time' }]}
                        >
                          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="End Time" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          fieldKey={[fieldKey || 0, 'description']}
                        >
                          <Input placeholder="Description" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'speakerIds']}
                          fieldKey={[fieldKey || 0, 'speakerIds']}
                          label="Speakers"
                        >
                          <Select
                            mode="multiple"
                            placeholder="Select Speakers"
                            options={speakersOptions}
                            allowClear
                            dropdownRender={(menu) => (
                              <div>
                                {menu}
                                <Button type="text" onClick={handleCreateSpeaker} icon={<PlusOutlined />} style={{width: '100%', textAlign: 'left'}}>
                                  Create New Speaker
                                </Button>
                              </div>
                            )}
                          />
                        </Form.Item>
                        <Button danger icon={<CloseOutlined />} onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.ErrorList errors={errors} />
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Add Session
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Save changes
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Upload Files" style={{ marginTop: 24 }}>
        <EventFileUploadForm eventId={id!} />
      </Card>

      <CreateSpeakerModal
        visible={isCreateSpeakerModalVisible}
        onCancel={handleCancelCreateSpeakerModal}
        onCreated={handleSpeakerCreated}
      />
      <CreateGuestModal
        visible={isCreateGuestModalVisible}
        onCancel={handleCancelCreateGuestModal}
        onCreated={handleGuestCreated}
      />
    </div>
  );
};

export default EditEventPage;
