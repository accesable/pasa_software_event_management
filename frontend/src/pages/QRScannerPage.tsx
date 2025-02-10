// src/pages/QRScannerPage.tsx
import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Input, Button, message, Typography, Card, Spin } from 'antd';
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();
  const isProcessingScan = useRef(false); // Theo dõi trạng thái xử lý scan

  // Thêm tham số manual để phân biệt quét tự động (manual = false) và submit thủ công (manual = true)
  const handleScanTicket = async (code: string, manual: boolean = false) => {
    if (isProcessingScan.current) {
      return;
    }
    isProcessingScan.current = true;
    setIsCameraActive(false);
    // Nếu không phải submit thủ công thì bật loading
    if (!manual) {
      setIsLoading(true);
      message.loading({ content: 'Checking ticket...', key: 'scanMessage', duration: 0 });
    }

    const startTime = Date.now();
    let response: { statusCode: number; data?: any[]; error?: string } | null = null;
    try {
      response = await authService.scanTicket(code.trim()) as { statusCode: number; data?: any[]; error?: string };
    } catch (error: any) {
      response = { statusCode: 500, error: error.error || 'Scan failed.' };
    }

    // Nếu submit tự động, đảm bảo hiển thị loading ít nhất 3s
    if (!manual) {
      const elapsed = Date.now() - startTime;
      const remainingTime = 3000 - elapsed;
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }
    }

    if (!manual) {
      setIsLoading(false);
    }

    // Hiển thị thông báo kết quả
    if (response.statusCode === 200) {
      message.success({
        content: `Ticket scanned: ${response.data && response.data[0]?.name ? response.data[0].name : ''}. Ready for next scan.`,
        key: 'scanMessage',
        duration: 2,
      });
    } else {
      message.error({ content: response.error || 'Scan failed.', key: 'scanMessage', duration: 2 });
    }

    setIsCameraActive(true);
    setLastScannedCode('');
    isProcessingScan.current = false;
  };

  // Hàm xử lý khi mã QR được quét tự động (chỉ xử lý khi manualCode trống)
  const handleScan = (result: any) => {
    if (result && isCameraActive && manualCode.trim() === '') {
      const code = result.getText();
      if (code && code !== lastScannedCode) {
        setLastScannedCode(code);
        handleScanTicket(code); // Gọi với manual = false (mặc định)
      }
    }
  };

  // Hàm xử lý lỗi camera
  const handleError = (error: any) => {
    setIsCameraActive(false);
    console.error(error);
  };

  // Khi submit thủ công, gọi handleScanTicket với manual = true để bỏ qua delay
  const handleManualSubmit = async () => {
    if (manualCode.trim() === '') {
      message.warning('Please enter a code manually.');
      return;
    }
    // Gọi hàm xử lý mà không chờ delay
    handleScanTicket(manualCode.trim(), true);
    setManualCode('');
  };

  // Hàm xử lý hoàn thành sự kiện (giữ nguyên)
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
      <BackBtn />

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
              position: 'relative',
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
            {isLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '8px',
                }}
              >
                <Spin size="large" tip="Checking Ticket..." />
              </div>
            )}
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
            <Button onClick={handleManualSubmit} disabled={isLoading}>
              Submit Code
            </Button>
          </div>

          <Button type="primary" onClick={handleFinish} style={{ marginTop: 20 }} disabled={isLoading}>
            Finish Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QRScannerPage;
