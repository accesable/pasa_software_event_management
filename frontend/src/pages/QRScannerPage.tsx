// src\pages\QRScannerPage.tsx
import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { Input, Button, message, Typography, Card, Flex } from 'antd';
import authService from '../services/authService';
import { useNavigate, useParams } from 'react-router-dom';
import { BackBtn } from '../components';
import { Helmet } from 'react-helmet-async';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../constants';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components';


const QRScannerPage: React.FC = () => {
    const [lastScannedCode, setLastScannedCode] = useState<string>('');
    const [manualCode, setManualCode] = useState<string>('');
    const navigate = useNavigate();
    const { id: eventId } = useParams<{ id: string }>();
    const qrReaderRef = useRef<typeof QrReader>(null); // Create a ref for QrReader
    const [isCameraActive, setIsCameraActive] = useState(true); // State to control camera activity

    // Hàm xử lý khi mã QR được quét
    const handleScan = async (result: any) => {
        if (result && isCameraActive) { // Only process if camera is active
            const code = result.getText();
            if (code && code !== lastScannedCode) {
                setLastScannedCode(code);
                setIsCameraActive(false); // Deactivate camera temporarily after scan
                try {
                    const response = await authService.scanTicket(code) as { status: number; data: any[]; error?: string };
                    if (response.status === 200) {
                        message.success(`Ticket scanned: ${response.data[0]?.name || ''}. Ready for next scan.`);
                    } else {
                        message.error(response.error || 'Scan failed. Please try again.');
                    }
                } catch (error: any) {
                    console.error('Error scanning ticket:', error);
                    message.error(error.message || 'Scan failed. Please try again.');
                } finally {
                    setIsCameraActive(true); // Reactivate camera after API call
                }
            }
        }
    };

    // Hàm xử lý lỗi camera
    const handleError = (error: any) => {
        console.error('QR Reader error:', error);
        message.error('Error accessing camera. Please check camera permissions.');
        setIsCameraActive(false); // Deactivate camera on error
    };

    // Hàm xử lý quét thủ công
    const handleManualSubmit = async () => {
        if (manualCode.trim() === '') {
            message.warning('Please enter a code manually.');
            return;
        }
        setIsCameraActive(false); // Deactivate camera temporarily for manual submit
        try {
            const response = await authService.scanTicket(manualCode.trim()) as { statusCode: number; data: any[]; error?: string };
            if (response.statusCode === 200) {
                message.success(`Ticket scanned: ${response.data[0]?.name || ''}. Ready for next scan.`);
            } else {
                message.error(response.error || 'Scan failed. Please try again.');
            }
        } catch (error: any) {
            message.error(error.message || 'Scan failed. Please try again.');
        } finally {
            setIsCameraActive(true); // Reactivate camera after manual submit
        }
    };

    // Hàm xử lý hoàn thành sự kiện
    const handleFinish = async () => {
        setIsCameraActive(false); // Deactivate camera before finishing event
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
            setIsCameraActive(true); // Reactivate camera after finish event attempt, in case of error
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
                    {
                        title: 'QR Scanner',
                    },
                ]}
                btnBack={<BackBtn />}
            />

            <Card>
                <Flex vertical align="center" gap="large">
                    <Typography.Title level={4}>Event Check-in/Check-out Scanner</Typography.Title>
                    <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                        <QrReader
                            constraints={{ facingMode: 'environment' }}
                            scanDelay={300} // Adjust scan delay as needed
                            onResult={(result, error) => {
                                if (!!result) {
                                    handleScan(result);
                                }
                                if (!!error) {
                                    handleError(error);
                                }
                            }}
                            videoStyle={{ width: '300px' }} // Adjust video size as needed
                        />
                    </div>
                    <Typography.Text>Scanning for QR codes...</Typography.Text>

                    <Flex vertical align="center" gap="middle">
                        <Typography.Text>Manual Code Entry:</Typography.Text>
                        <Input
                            placeholder="Enter code manually"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Button onClick={handleManualSubmit}>Submit Code</Button>
                    </Flex>

                    <Button type="primary" onClick={handleFinish} style={{ marginTop: 20 }}>
                        Finish Event
                    </Button>
                </Flex>
            </Card>
        </div>
    );
};

export default QRScannerPage;
