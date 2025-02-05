import {
    Alert,
    Badge,
    BadgeProps,
    Button,
    Form,
    Input,
    Modal,
    Table,
} from 'antd';
// import { useNavigate } from 'react-router-dom';  
import { Card } from '../..';
import { useState } from 'react';
// navigate: ReturnType<typeof useNavigate>
const USER_COLUMNS = () => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'name',
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'emailAddress',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
    },
    // {
    //   title: 'Actions',
    //   dataIndex: 'id',
    //   key: 'id',
    //   render: (value,record) => (
    //     <div>
    //     <Button type="primary" onClick={() => navigate(`/details/events/${record.id}`)}>
    //       Details
    //     </Button>
    //     </div>
    //   )
    // }
    {
      title: 'Current Status',
      dataIndex: 'status',
      key: 'status',
      render: (_: any) => {
        let status: BadgeProps['status'];
  
        if (_ === 'offline') {
          status = 'default';
        } else if (_ === 'online') {
          status = 'success';
        } 
  
        return <Badge status={status} text={_} className="text-capitalize" />;
      },
    }
  ];
  interface UserTableProps {
    data: [];
    error?: string;
    loading: boolean;
  }

export const UserTable : React.FC<UserTableProps> = ({data,error,loading} ) => {
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
  // const navigate = useNavigate();
  return (
    <div>
          <Card title="Your Events" extra={<Button onClick={showCreateUserModal}>Create New User</Button>}>
            {error ? (
              <Alert
                message="Error"
                description={error.toString()}
                type="error"
                showIcon
              />
            ) : (
              <Table
                columns={USER_COLUMNS()}
                dataSource={data}
                loading={loading}
                className="overflow-scroll"
              />
            )}
          </Card>
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
    </div>
  )
}
