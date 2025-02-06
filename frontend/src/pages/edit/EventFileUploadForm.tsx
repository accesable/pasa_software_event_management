// src\pages\edit\EventFileUploadForm.tsx
import React, { useState } from 'react';
import { Upload, Button, message, Alert, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axiosInstance';

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

        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('files', uploadedFile);
        formData.append('field', selectedField);
        
        try {
            const response = await axiosInstance.post(`/events/${eventId}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'field': selectedField,
                },
            });
            const responseData = response.data as { statusCode: number, message: string };
            if (responseData.statusCode === 201) {
                message.success(`Uploaded ${selectedField} successfully`);
                setUploadedFile(null); // Clear selected file after successful upload
            } else {
                const responseData = response.data as { message: string };
                setUploadError(`Upload ${selectedField} failed: ${responseData.message}`);
                message.error(`Upload ${selectedField} failed: ${responseData.message}`);
            }
        } catch (error: any) {
            setUploadError(`Upload ${selectedField} failed: ${error.message}`);
            message.error(`Upload ${selectedField} failed: ${error.message}`);
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
                maxCount={currentFieldOption?.multiple ? undefined : 1} // Allow multiple for documents
                accept={currentFieldOption?.accept}
                fileList={uploadedFile ? [{
                    uid: '1',
                    name: uploadedFile.name,
                    status: 'done',
                    url: URL.createObjectURL(uploadedFile), // Or a URL if you have one
                }] : []}
            >
                <Button icon={<UploadOutlined />} disabled={!selectedField} loading={uploading}>
                    Select File
                </Button>
            </Upload>

            <Button
                type="primary"
                onClick={handleUpload}
                disabled={uploading || !uploadedFile || !selectedField}
                loading={uploading}
                style={{ marginTop: 24 }}
            >
                Upload
            </Button>
        </div>
    );
};

export default EventFileUploadForm;