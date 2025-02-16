// src\pages\edit\EventFileUploadForm.tsx
import React, { useState } from 'react';
import { Upload, Button, message, Alert, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosInstance'; // Import axiosInstance

interface EventFileUploadFormProps {
    eventId: string;
}

const EventFileUploadForm: React.FC<EventFileUploadFormProps> = ({ eventId }) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedField, setSelectedField] = useState<string>('documents'); // Default to documents

    const handleFileChange = (info: any) => {
        if (info.fileList.length > 0) {
            setUploadedFile(info.fileList[0].originFileObj as File);
        } else {
            setUploadedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!uploadedFile || !selectedField) {
            message.error('Please select a file and a field type');
            return;
        }

        if (!eventId) {
            message.error('Event ID is missing. Please ensure you are editing an event.');
            return;
        }

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('field', selectedField);
        formData.append('files', uploadedFile);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error('Bạn chưa đăng nhập.');
                return;
            }

            const response = await axiosInstance.post(`/events/${eventId}/files`, formData, { // Sử dụng eventId từ props trong URL
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${accessToken}`, // Đảm bảo có Authorization header
                },
            });

            if (response.status === 201) {
                message.success(`Uploaded ${selectedField} successfully`);
                setUploadedFile(null); // Reset uploadedFile state sau khi upload thành công
            } else {
                message.error(`Upload ${selectedField} failed: ${(response.data as any)?.error || 'Unknown error'}`);
                setUploadError(`Upload ${selectedField} failed: ${(response.data as any)?.error || 'Unknown error'}`);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message || error.message || 'Upload failed'}`);
            setUploadError(`Upload ${selectedField} failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };


    const fieldOptions = [
        { value: 'videoIntro', label: 'Video Intro (MP4)', accept: '.mp4,video/mp4', multiple: false },
        { value: 'banner', label: 'Banner (Image)', accept: 'image/*', multiple: false },
        { value: 'documents', label: 'Documents (Multiple)', accept: '*', multiple: true },
    ];

    const currentFieldOption = fieldOptions.find(option => option.value === selectedField);

    return (
        <div>
            {uploadError && (
                <Alert
                    message="Upload Error"
                    description={uploadError}
                    type="error"
                    closable
                    onClose={() => setUploadError(null)}
                    style={{ marginBottom: 24 }}
                />
            )}

            <Select
                value={selectedField}
                onChange={setSelectedField}
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="Select File Type to Upload"
                options={fieldOptions.map(option => ({ value: option.value, label: option.label }))}
            />

            <Upload
                beforeUpload={() => false}
                onChange={handleFileChange}
                maxCount={currentFieldOption?.multiple ? undefined : 1}
                accept={currentFieldOption?.accept}
                fileList={uploadedFile ? [{
                    uid: '1',
                    name: uploadedFile.name,
                    status: 'done',
                    url: URL.createObjectURL(uploadedFile),
                }] : []}
            >
                <Button icon={<UploadOutlined />} disabled={!selectedField} loading={uploading}>
                    Select File
                </Button>
            </Upload>

            <Button
                type="primary"
                onClick={handleUpload}
                disabled={uploading || !uploadedFile || !selectedField || !eventId} // Disable if eventId is missing
                loading={uploading}
                style={{ marginTop: 24 }}
            >
                Upload
            </Button>
        </div>
    );
};

export default EventFileUploadForm;
