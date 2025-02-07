// src\layouts\userAccount\index.tsx
import { AppLayout } from '../app';
import {
  Col,
  ConfigProvider,
  Descriptions,
  DescriptionsProps,
  Image,
  Row,
  Tabs,
  TabsProps,
  theme,
  Typography,
  Button,
  message,
  Spin,
} from 'antd';
import { Card } from '../../components';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { USER_PROFILE_ITEMS } from '../../constants';
import { useStylesContext } from '../../context';

const { Link } = Typography;

import './styles.css';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import authService from '../../services/authService';
import { updateUserProfile } from '../../redux/userSlice';

export const UserAccountLayout = () => {
  const {
    token: { borderRadius },
  } = theme.useToken();
  const navigate = useNavigate();
  const stylesContext = useStylesContext();
  const location = useLocation();
  const TAB_ITEMS: TabsProps['items'] = USER_PROFILE_ITEMS.map((u) => ({
    key: u.title,
    label: u.title,
  }));
  const [activeKey, setActiveKey] = useState(TAB_ITEMS[0].key);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChange = (key: string) => {
    navigate(key);
  };

  useEffect(() => {
    const k =
      TAB_ITEMS.find((d) => location.pathname.includes(d.key))?.key || '';
    setActiveKey(k);
  }, [location]);

  const DESCRIPTION_ITEMS: DescriptionsProps['items'] = [
    {
      key: 'full-name',
      label: 'Name',
      children: <span>{user.name || 'N/A'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      children: (
        <Link href={`mailto:${user.email}`}>
          {user.email || 'N/A'}
        </Link>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      children: user.phoneNumber || 'N/A',
    },
  ];

  const handleUploadAvatar = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('Bạn chưa đăng nhập.');
        return;
      }
      const response = await authService.uploadAvatar(formData, accessToken);
      const res = response as { statusCode: number; message: string; data: { user: { avatar: string } } };
      if (res.statusCode === 201) {
        message.success(res.message);
        dispatch(updateUserProfile({ avatar: res.data.user.avatar } as any));
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.reload(); // Tự động reload trang sau khi upload thành công
      } else {
        message.error(res.message || 'Upload avatar không thành công.');
      }
    } catch (error: any) {
      message.error(error?.message || 'Đã có lỗi xảy ra khi upload avatar.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUploadAvatar(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <>
      <AppLayout>
        <Card
          className="user-profile-card-nav card"
          actions={[
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    colorBorderSecondary: 'none',
                  },
                },
              }}
            >
              <Tabs
                defaultActiveKey={activeKey}
                activeKey={activeKey}
                items={TAB_ITEMS}
                onChange={onChange}
                style={{ textTransform: 'capitalize' }}
              />
            </ConfigProvider>,
          ]}
        >
          <Row {...stylesContext?.rowProps}>
            <Col xs={24} sm={8} lg={4} style={{ textAlign: 'center' }}>
              <Image
                src={user.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"}
                alt="user profile image"
                height={120} // Set cố định chiều cao
                width={120}  // Set cố định chiều rộng
                style={{ borderRadius, objectFit: 'cover' }}
                fallback="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
              />
              <div style={{ marginTop: '10px' }}>
                <Button onClick={triggerFileInput} loading={uploadLoading}>
                  {uploadLoading ? <Spin size="small" /> : 'Đổi Avatar'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </Col>
            <Col xs={24} sm={16} lg={20}>
              <Descriptions
                title="User Info"
                items={DESCRIPTION_ITEMS}
                column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              />
            </Col>
          </Row>
        </Card>
        <div style={{ marginTop: '1.5rem' }}>
          <Outlet />
        </div>
      </AppLayout>
    </>
  );
};