// src\pages\userAccount\FaceCapturePage.tsx
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Button, message, Typography, Card, Alert, Space } from 'antd';
import { CameraOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosInstance';

const { Title } = Typography;

// Helper function to convert data URL to File object (giữ nguyên)
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const FaceCaptureTab: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraStarted, setCameraStarted] = useState<boolean>(false);

  // Start camera on component mount
  useEffect(() => {
    const startCamera = async () => {

      setLoading(true);
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraStarted(true);
        } else {
          setError("Lỗi: videoRef không tồn tại.");
          message.error("Lỗi: Component video không được khởi tạo đúng cách.");
        }
      } catch (err: any) {
        console.error('FaceCaptureTab: Error accessing camera:', err); // In ra toàn bộ lỗi
        setError(`Không thể truy cập camera: ${err.message}. Vui lòng kiểm tra quyền trình duyệt.`);
        message.error(`Không thể truy cập camera: Vui lòng kiểm tra quyền trình duyệt và console để biết thêm chi tiết.`);
      } finally {
        setLoading(false);
        console.log("FaceCaptureTab: startCamera finally block - loading:", loading, "cameraStarted:", cameraStarted, "error:", error); // Debug log finally block
      }
    };

    startCamera();

    // Stop stream on unmount (giữ nguyên)
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        console.log("FaceCaptureTab: Camera stream stopped on unmount"); // Debug log khi stream stop
      }
    };
  }, []);

  // Capture image from video (giữ nguyên)
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Unable to get canvas context');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    setImages(prev => [...prev, dataURL]);
  };

  // Handle file upload from device (giữ nguyên)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      } else {
        message.error('Only image files are allowed.');
      }
    });
    e.target.value = "";
  };

  // Delete image by index (giữ nguyên)
  const deleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submit (API call to /users/upload/faces) (giữ nguyên)
  const handleSubmit = async () => {
    if (images.length === 0) {
      message.error('Please capture or upload at least one image.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      images.forEach((imageDataUrl, index) => {
        const file = dataURLtoFile(imageDataUrl, `faceImage${index + 1}.png`);
        formData.append('files', file);
      });

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('Bạn chưa đăng nhập.');
        return;
      }

      console.log("Calling API /users/upload/faces with data:", formData);

      const response = await axiosInstance.post('/users/upload/faces', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("API Response:", response.data);

      if (response.status === 201) {
        message.success('Face registered successfully!');
        setImages([]);
      } else {
        const respData = response.data as { error?: string };
        setError(respData.error || 'Failed to register face.');
        message.error('Failed to register face.');
      }
    } catch (error: any) {
      setError(error.error || 'Failed to register face.');
      message.error(error.error || 'Failed to register face.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <Title level={4}>Capture Face</Title>

          {error && (
            <Alert
              message="Camera Access Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          <div
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              height: '400px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
             <video
              ref={videoRef} // <-- Gán ref cho thẻ <video> ở đây
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <Space>
            <Button
              type="primary"
              onClick={captureImage}
              disabled={loading || !cameraStarted}
              icon={<CameraOutlined />}
            >
              Capture Image
            </Button>
            <Button icon={<UploadOutlined />}>
              <label htmlFor="uploadInput" style={{ cursor: 'pointer', margin: 0 }}>
                Upload Image
              </label>
            </Button>
            <input
              id="uploadInput"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </Space>

          {images.length > 0 && (
            <Card
              title="Captured / Uploaded Images"
              style={{ width: '100%', maxWidth: '500px', marginTop: '20px' }}
            >
              <Space direction="horizontal" style={{ width: '100%', overflowX: 'auto' }}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      marginRight: '8px',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      style={{
                        maxWidth: '150px',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => deleteImage(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          <Button type="primary" onClick={handleSubmit} loading={loading}>
            Register Face
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FaceCaptureTab;
