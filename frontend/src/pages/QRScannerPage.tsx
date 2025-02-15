// src/pages/QRScannerPage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';
import { Input, Button, message, Typography, Card, Spin, Alert, Radio } from 'antd';
import { BackBtn, PageHeader } from '../components';
import { Helmet } from 'react-helmet-async';
import { HomeOutlined, PieChartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../constants';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import * as faceapi from 'face-api.js';

const { Title, Text } = Typography;

const QRScannerPage: React.FC = () => {
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Lưu userId được nhận diện
  const navigate = useNavigate();
  const { id: eventId } = useParams<{ id: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isProcessingScan = useRef(false);
  const isProcessingFace = useRef(false); // Đánh dấu khi đang xử lý nhận diện khuôn mặt (bao gồm cooldown)
  const [faceDetectionError, setFaceDetectionError] = useState<string | null>(null);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [faceDetectionLoading, setFaceDetectionLoading] = useState<boolean>(false);
  const [faceMatchName, setFaceMatchName] = useState<string | null>(null);

  // --- Các state mới cho tính năng dùng face ---
  const [faceEnabled, setFaceEnabled] = useState<boolean>(false);
  const [faceAction, setFaceAction] = useState<'check-in' | 'check-out'>('check-in');
  // -------------------------------------------------

  // Load các model face-api.js
  const loadModels = useCallback(async () => {
    setFaceDetectionLoading(true);
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      ]);
      console.log('All models loaded');
    } catch (error: any) {
      console.error('Error loading models:', error);
      setFaceDetectionError('Failed to load face recognition models.');
      message.error('Failed to load face recognition models.');
    } finally {
      setFaceDetectionLoading(false);
    }
  }, []);

  const loadLabeledImages = useCallback(async () => {
    if (!eventId) return []; // Nếu chưa có eventId thì thoát

    setFaceDetectionLoading(true);
    try {
      const response = await authService.getEventParticipantsWithFaces(eventId) as any;
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to fetch participants faces.');
      }
      const participants = response.data.participants;
      if (!participants || participants.length === 0) {
        message.warning('No participants with face images found for this event.');
        return [];
      }

      return Promise.all(
        participants.map(async (participant: any) => {
          const descriptions: Float32Array[] = [];
          const label = participant.userId; // Dùng userId làm label
          const faceImages = participant.faceImages || []; // Đảm bảo faceImages là mảng

          for (let i = 0; i < faceImages.length; i++) {
            const imgUrl = faceImages[i];
            try {
              const img = await faceapi.fetchImage(imgUrl);
              const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();
              if (detection) {
                descriptions.push(detection.descriptor);
              }
            } catch (error) {
              console.error(`Failed to load image for user ${label}, image URL ${imgUrl}:`, error);
            }
          }
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
      );
    } catch (apiError: any) {
      setFaceDetectionError(apiError.message || 'Failed to load participant face data.');
      return []; // Trả về mảng rỗng nếu có lỗi
    } finally {
      setFaceDetectionLoading(false);
    }
  }, [eventId]);

  // Chỉ load model và dữ liệu khuôn mặt khi faceEnabled = true
  useEffect(() => {
    if (faceEnabled) {
      loadModels();
      loadLabeledImages()
        .then(setLabeledFaceDescriptors)
        .catch(e => {
          setFaceDetectionError("Failed to load face recognition data.");
        });
    }
  }, [faceEnabled, loadModels, loadLabeledImages, eventId]);

  // Khởi tạo stream cho video (dùng cho QR & Face)
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: {} }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleFaceActionCall = async (userId: string) => {
    if (isProcessingFace.current) return;
    isProcessingFace.current = true;
    setIsLoading(true);
    message.loading({ content: `Processing ${faceAction}...`, key: 'faceActionMessage', duration: 1 });
    // Hiển thị loading khoảng 1 giây
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      let response: any;
      if (faceAction === 'check-in') {
        response = await authService.checkIn(eventId!, userId); // Gọi API check-in
      } else {
        response = await authService.checkOut(eventId!, userId); // Gọi API check-out
      }
      if (response.statusCode === 200 || response.statusCode === 201) {
        message.success({ 
          content: `${faceAction === 'check-in' ? 'Check-in' : 'Check-out'} successful for user ${userId}`, 
          key: 'faceActionMessage', 
          duration: 5
        });
      } else {
        message.error({ 
          content: response.error || `${faceAction === 'check-in' ? 'Check-in' : 'Check-out'} failed`, 
          key: 'faceActionMessage', 
          duration: 5
        });
      }
    } catch (error: any) {
      message.error({ 
        content: error.error || `${faceAction === 'check-in' ? 'Check-in' : 'Check-out'} failed`, 
        key: 'faceActionMessage', 
        duration: 2 
      });
    }
    setIsLoading(false);
    setTimeout(() => {
      isProcessingFace.current = false;
    }, 3000);
  };

  const handleFaceRecognition = useCallback(async () => {
    if (!videoRef.current) return;
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (detections && detections.length > 0) {
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
      const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
      setFaceMatchName(bestMatch.toString());
      if (bestMatch.label !== 'unknown' && !isProcessingFace.current) {
        handleFaceActionCall(bestMatch.label);
      }
    } else {
      setFaceMatchName(null);
    }
  }, [labeledFaceDescriptors, faceAction]);

  useEffect(() => {
    if (faceEnabled && !faceDetectionLoading && labeledFaceDescriptors.length > 0 && videoRef.current) {
      const intervalId = setInterval(() => handleFaceRecognition(), 100);
      return () => clearInterval(intervalId);
    }
  }, [faceEnabled, faceDetectionLoading, labeledFaceDescriptors, handleFaceRecognition]);

  const handleScanTicket = async (code: string, manual: boolean = false) => {
    if (isProcessingScan.current) {
      return;
    }
    isProcessingScan.current = true;
    setIsCameraActive(false);
    if (!manual) {
      setIsLoading(true);
      message.loading({ content: 'Checking ticket...', key: 'scanMessage', duration: 0 });
    }

    const startTime = Date.now();
    let response: any = { statusCode: 0 };
    try {
      response = await authService.scanTicket(code.trim()) as any;
    } catch (error: any) {
      response = { statusCode: 500, data: [], error: error.error || 'Scan failed.' };
    }

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

  const handleScan = async (result: any) => {
    if (result && isCameraActive && manualCode.trim() === '') {
      const code = result.getText();
      if (code && code !== lastScannedCode) {
        setLastScannedCode(code);
        handleScanTicket(code);
      }
    }
  };

  const handleError = (error: any) => {
    setIsCameraActive(false);
    setFaceDetectionError("");
  };

  const handleManualSubmit = async () => {
    if (manualCode.trim() === '') {
      message.warning('Please enter a code manually.');
      return;
    }
    handleScanTicket(manualCode.trim(), true);
    setManualCode('');
  };

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
        title="QR Code & Face Scanner"
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
          { title: 'QR & Face Scanner' },
        ]}
        btnBack={<BackBtn />}
      />
      <BackBtn />

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <Title level={4}>Event Check-in/Check-out Scanner</Title>
          {/* Nút bật/tắt face và lựa chọn Check In/Check Out */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Button onClick={() => setFaceEnabled(!faceEnabled)}>
              {faceEnabled ? "Disable Face Recognition" : "Enable Face Recognition"}
            </Button>
            {faceEnabled && (
              <div style={{ marginTop: '8px' }}>
                <Typography.Text>Select Action: </Typography.Text>
                <Radio.Group
                  value={faceAction}
                  onChange={(e) => setFaceAction(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="check-in">Check In</Radio.Button>
                  <Radio.Button value="check-out">Check Out</Radio.Button>
                </Radio.Group>
              </div>
            )}
          </div>
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
            <video ref={videoRef} width="100%" height="100%" autoPlay muted />
            {faceDetectionLoading && (
              <div style={loadingOverlayStyle}>
                <Spin size="large" tip="Loading Face Recognition Models..." />
              </div>
            )}
            {faceDetectionError && (
              <div style={loadingOverlayStyle}>
                <Alert message={faceDetectionError} type="error" />
              </div>
            )}
            {isLoading && (
              <div style={loadingOverlayStyle}>
                <Spin size="large" tip="Processing..." />
              </div>
            )}
            {faceMatchName && faceMatchName !== 'unknown' && (
              <div style={faceMatchOverlayStyle}>
                <CheckCircleOutlined style={{ color: 'green', fontSize: 24, marginBottom: 8 }} />
                <Typography.Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Face Matched: User {faceMatchName}
                </Typography.Text>
              </div>
            )}
            {faceMatchName === 'unknown' && (
              <div style={faceMatchOverlayStyle}>
                <Alert message="Unknown Face Detected" type="warning" showIcon />
              </div>
            )}
            <QrReader
              constraints={{ facingMode: 'environment' }}
              scanDelay={300}
              onResult={(result, error) => {
                // Chỉ xử lý QR khi tính năng face bị tắt
                if (!faceEnabled && result && isCameraActive && manualCode.trim() === '') {
                  handleScan(result);
                }
                if (error) {
                  handleError(error);
                }
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>
          <Text>
            {faceEnabled
              ? 'Using Face Recognition for Check-in/Check-out'
              : 'Scanning for QR codes...'}
          </Text>

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

          <Button type="primary" onClick={handleFinish} style={{ marginTop: '20px' }} disabled={isLoading}>
            Finish Event
          </Button>
        </div>
      </Card>
    </div>
  );
};

const loadingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  zIndex: 10,
};

const faceMatchOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '10px',
  textAlign: 'center',
  borderRadius: '0 0 8px 8px',
  zIndex: 10,
};

export default QRScannerPage;
