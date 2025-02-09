// src/pages/DeclineEventPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Result, Button } from 'antd';
import { Helmet } from 'react-helmet-async';
import authService from '../services/authService';

const DeclineEventPage: React.FC = () => {
  // Lấy token từ query string và eventId từ URL params
  const [searchParams] = useSearchParams();
  const { eventId } = useParams<{ eventId: string }>();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [declineSuccess, setDeclineSuccess] = useState(false);

  useEffect(() => {
    const processDecline = async () => {
      if (!token || !eventId) {
        message.error('Thiếu token hoặc thông tin sự kiện. Vui lòng đăng nhập lại.');
        navigate('/auth/signin');
        return;
      }

      try {
        // Gọi API decline event
        const response = (await authService.declineEvent(eventId, token)) as { statusCode: number; error?: string };
        if (response.statusCode === 200) {
          setDeclineSuccess(true);
          message.success('Bạn đã từ chối lời mời thành công.');
        } else {
          message.error(response.error || 'Từ chối lời mời thất bại.');
          navigate('/auth/signin');
        }
      } catch (error: any) {
        console.error('Error declining event:', error);
        message.error(error.message || 'Có lỗi xảy ra khi từ chối lời mời.');
        navigate('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    processDecline();
  }, [eventId, token, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <Helmet>
          <title>Đang xử lý...</title>
        </Helmet>
        <Spin size="large" tip="Đang xử lý phản hồi của bạn..." />
      </div>
    );
  }

  if (declineSuccess) {
    return (
      <>
        <Helmet>
          <title>Trả lời từ chối lời mời</title>
        </Helmet>
        <Result
          status="success"
          title="Cảm ơn bạn!"
          subTitle="Chúng tôi đã ghi nhận rằng bạn từ chối lời mời tham gia sự kiện. Cảm ơn bạn đã phản hồi. Hy vọng sẽ có cơ hội gặp lại bạn trong các sự kiện sắp tới."
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>,
          ]}
        />
      </>
    );
  }

  // Nếu không có gì hiển thị (trường hợp đã redirect) thì render null
  return null;
};

export default DeclineEventPage;
