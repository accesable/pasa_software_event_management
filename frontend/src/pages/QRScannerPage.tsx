// src/pages/QRScannerPage.tsx
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Input, Button, message, Typography, Card } from 'antd';
import { BackBtn, PageHeader } from '../components';
import { Helmet } from 'react-helmet-async';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../constants';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';

const { Title, Text } = Typography;

const QRScannerPage: React.FC = () => {
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();

  // Hàm xử lý khi mã QR được quét
  const handleScan = (result: any) => {
    // Nếu ô input đang trống và camera đang hoạt động, xử lý kết quả quét
    if (result && isCameraActive && manualCode.trim() === '') {
      const code = result.getText();
      // Chỉ hiển thị thông báo nếu mã mới và khác với lần quét trước
      if (code && code !== lastScannedCode) {
        setLastScannedCode(code);
        setManualCode(code); // Tự động điền vào ô input
        message.success(`Scanned: ${code}`);
        // Vô hiệu hóa scan tạm thời để tránh hiển thị liên tục (ví dụ 3 giây)
        setIsCameraActive(false);
        setTimeout(() => {
          setIsCameraActive(true);
        }, 3000);
      }
    }
  };

  // Hàm xử lý lỗi camera
  const handleError = (error: any) => {
    setIsCameraActive(false);
  };

  // Hàm xử lý khi người dùng nhấn "Submit Code"
  const handleManualSubmit = async () => {
    if (manualCode.trim() === '') {
      message.warning('Please enter a code manually.');
      return;
    }
    setIsCameraActive(false);
    try {
      const response = await authService.scanTicket(manualCode.trim()) as { statusCode: number; data: any[]; error?: string };
      console.log('Scan response:', response);
      if (response.statusCode === 200) {
        message.success(`Ticket scanned: ${response.data[0]?.name || ''}. Ready for next scan.`);
      } else {
        message.error(response.error);
      }
    } catch (error: any) {
      message.error(error.error);
    } finally {
      setManualCode('');
      setIsCameraActive(true);
    }
  };

  // Hàm xử lý hoàn thành sự kiện
  const handleFinish = async () => {
    setIsCameraActive(false);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !eventId) {
        message.error('Missing access token or event id.');
        return;
      }
      const response = await authService.updateEvent(eventId, { status: 'FINISHED' }, accessToken) as { statusCode: number; message?: string };
      if (response.statusCode === 200) {
        message.success('Event finished successfully.');
        navigate('/dashboards/my-events');
      } else {
        message.error(response.message || 'Failed to finish event.');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to finish event.');
    } finally {
      setIsCameraActive(true);
    }
  };

  return (
    <div>
      <Helmet>
        <title>QR Scanner | Event Check-in/Check-out</title>
      </Helmet>
      <PageHeader
        title="QR Code Scanner"
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
          { title: 'QR Scanner' },
        ]}
        btnBack={<BackBtn />}
      />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <Title level={4}>Event Check-in/Check-out Scanner</Title>
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              width: '100%',
              maxWidth: '500px',
              height: '400px',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <QrReader
              constraints={{ facingMode: 'environment' }}
              scanDelay={300}
              onResult={(result, error) => {
                if (!!result) {
                  handleScan(result);
                }
                if (!!error) {
                  handleError(error);
                }
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <Text>Scanning for QR codes...</Text>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Text>Manual Code Entry:</Text>
            <Input
              placeholder="Enter code manually"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              style={{ width: 300 }}
            />
            <Button onClick={handleManualSubmit}>Submit Code</Button>
          </div>

          <Button type="primary" onClick={handleFinish} style={{ marginTop: 20 }}>
            Finish Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QRScannerPage;
