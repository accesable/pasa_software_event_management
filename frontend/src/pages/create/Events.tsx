import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Radio, Row, Select, Typography } from 'antd';
import { Card } from '../../components';
import { SaveOutlined } from '@ant-design/icons';
import { Events } from '../../types';
import { useState } from 'react';
import { useFetchData } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../constants';
type FieldType = {
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  priority: EventPriority;
  capacity: number;
  event_description: string;
  event_location: string;
  event_type: EventType;
  event_category: EventCategory;
  event_guests : [string];
};

export const CreateEventPage = () => {
  const {
    data: users,
    error: usersError,
    loading: usersLoading,
  } = useFetchData('../mocks/Users.json');

  const [loading, setLoading] = useState(false);
  // Modal State for create event type
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState<any>(false);
  const [types,setTypes] = useState([                  { value: "software development", label: 'software development' },
    { value: 'marketing', label: 'marketing' },
    { value: 'research', label: 'research' },]);

    const [form] = Form.useForm();

  const showCreateTypeModal = () => {
    setIsCreateTypeModalOpen(true);
  };

  const handleOkCreateType = () => {
    setIsCreateTypeModalOpen(false);
    form.submit()
  };

  const handleCancelCreateType = () => {
    setIsCreateTypeModalOpen(false);
  };

  const navigate = useNavigate();
  const onFinish = (values: any) => {
    setLoading(true);
    // TODO: make post request here

    setTimeout(() => {
      navigate(PATH_DASHBOARD.my_events);
      message.open({
        type: 'success',
        content: 'Event Added Successfully',
      });
    }, 3000);
  };

    // Modal State for create user
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<any>(false);

    const showCreateUserModal = () => {
      setIsCreateUserModalOpen(true);
    };
  
    const handleOkCreateUser = () => {
      setIsCreateUserModalOpen(false);
    };
  
    const handleCancelCreateUser = () => {
      setIsCreateUserModalOpen(false);
    };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onFinishType = (values : any) => {
    setTypes([...types, { value: values.event_type, label: values.event_type }]);
    setIsCreateTypeModalOpen(false);
  };

  return (
    <Card>
        <Modal title="Create Event Type" open={isCreateTypeModalOpen} onOk={handleOkCreateType} onCancel={handleCancelCreateType}>
          <Form layout='vertical'
            onFinish={onFinishType}
            form={form}
          >
            <Form.Item label="Event Type" name="event_type">
              <Input placeholder="Enter Event Type" />
            </Form.Item>
          </Form>
      </Modal>
        <Modal title="Create Event User" open={isCreateUserModalOpen} onOk={handleOkCreateUser} onCancel={handleCancelCreateUser}>
          <Form layout='vertical'>
            <Form.Item label="User's Email">
              <Input placeholder="example@email.com" />
            </Form.Item>
            <Form.Item label="User's Full Name">
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item label="User's Title">
              <Input placeholder="Software Engineer" />
            </Form.Item>
          </Form>
      </Modal>
      <Form
        name="user-profile-details-form"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col sm={24} lg={24}>
            <Form.Item<FieldType>
              label="Event's Name"
              name="event_name"
              rules={[{ required: true, message: 'Please input your event name!' }]}
            >
              <Input
              placeholder='Workshop 101'
              />
            </Form.Item>
          </Col>
          <Col sm={24} lg={24}>
            <Form.Item<FieldType>
              label="Event's Description"
              name="event_description"
              rules={[{ required: true, message: 'Please input your Event\'s Description!' }]}
            >
              <Input.TextArea
              rows={3}
              placeholder='Workshop 101'
              />
            </Form.Item>
          </Col>
          <Col sm={24} lg={8}>
            <Form.Item<FieldType>
              label="Event's Capacity"
              name="capacity"
              rules={[
                { required: true, message: 'Please input your first name!' },
              ]}
            >
              <InputNumber style={{width : "100%"}} />
            </Form.Item>
          </Col>
          <Col sm={24} lg={8}>
            <Form.Item<FieldType>
              label="Start At"
              name="start_date"
              rules={[
                { required: true, message: 'Please input your start of event' },
              ]}
            >
              <DatePicker style={{ width: "100%" }} showTime />
            </Form.Item>
          </Col>
          <Col sm={24} lg={8}>
            <Form.Item<FieldType>
              label="End At"
              name="end_date"
              rules={[
                { required: true, message: 'Please input your end of event' },
              ]}
            >
              <DatePicker style={{ width: "100%" }} showTime />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Location"
              name="event_location"
              rules={[{ required: true, message: 'Please input event capacity!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col sm={24} lg={12}>
            <Form.Item<FieldType>
              label="Event Type"
              name="event_type"
              rules={[
                { required: true, message: 'Please input your event type!' },
              ]}
            >
              <Select
                dropdownRender={(menu) => (
                  <>
                    {menu}
                      <Button type="text" style={{width : "100%"}} onClick={showCreateTypeModal} >
                        Create New Type
                      </Button>
                  </>
                )}
                options={types.map((item) => ({ value: item.value, label: item.label }))}
                />
            </Form.Item>
          </Col>
          <Col sm={24}>
            <Form.Item<FieldType>
              label="Event's Guests"
              name="event_guests"
              rules={[
                { required: true, message: 'Please input your guests!' },
              ]}
            >
              <Select
              mode='multiple'
              loading={usersLoading}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                      <Button type="text" style={{width : "100%"}} onClick={showCreateUserModal} >
                        Create Guest ( Result A new user in the system )
                      </Button>
                  </>
                )}
                >
                        {!usersLoading &&
                        users?.map((user) => (
                          <Select.Option key={user.id} value={user.id} label={`${user.name} - ${user.title} - ${user.email}`}>
                            {`${user.name} - ${user.title} - ${user.email}`}
                          </Select.Option>
                        ))}
                </Select>
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Form.Item<FieldType>
              label="Status"
              name="status"
              rules={[
                { required: true, message: 'Please select your status!' },
              ]}
            >
              <Radio.Group>
                <Radio value="active">Active</Radio>
                <Radio value="inactive">Inactive</Radio>
              </Radio.Group>
            </Form.Item>
          </Col> */}
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
