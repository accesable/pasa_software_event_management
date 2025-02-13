// src\components\InviteUsersModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Checkbox, Avatar, message, Spin, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

interface InviteUsersModalProps {
    visible: boolean;
    onCancel: () => void;
    eventId: string;
    onInvitationsSent: () => void; // Callback khi gửi lời mời thành công
}

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({ visible, onCancel, eventId, onInvitationsSent }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            setError(null);
            try {
                const response = await axiosInstance.get('/users');
                const data = response.data as { statusCode: number; data: { users: User[] } };
                if (data.statusCode === 200) {
                    setUsers(data.data.users);
                } else {
                    setError('Failed to load users.');
                    message.error('Failed to load users.');
                }
            } catch (error: any) {
                setError(error.message || 'Failed to load users.');
                message.error(error.message || 'Failed to load users.');
            } finally {
                setLoadingUsers(false);
            }
        };

        if (visible) {
            fetchUsers();
            setSelectedUserIds([]); // Reset selected users khi modal mở
        }
    }, [visible]);

    const handleCheckboxChange = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUserIds([...selectedUserIds, userId]);
        } else {
            setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
        }
    };

    const handleInviteUsers = async () => {
        if (selectedUserIds.length === 0) {
            message.warning('Please select users to invite.');
            return;
        }

        setInviting(true);
        setError(null);
        try {
            const usersToInvite = selectedUserIds.map(id => {
                const user = users.find(u => u.id === id);
                return { id: user?.id, email: user?.email };
            });

            const response = await axiosInstance.post(`/events/${eventId}/invite`, { users: usersToInvite });
            const responseData = response.data as { statusCode: number; message: string };
            if (responseData.statusCode === 201) {
                message.success((response.data as { message: string }).message);
                onInvitationsSent();
                onCancel();
            } else {
                // **Lấy message lỗi từ responseData (nếu có)**
                const errorMessage = responseData.message || 'Failed to send invitations.';
                setError(errorMessage);
                message.error(errorMessage);
            }
        } catch (error: any) {
            // **Lấy message lỗi từ error.response.data (thêm vào)**
            const errorMessage = error.response?.data?.message || error.message || 'Failed to send invitations.';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setInviting(false);
        }
    };

    return (
        <Modal
            title="Invite Users"
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="invite" type="primary" onClick={handleInviteUsers} loading={inviting}>
                    Invite
                </Button>,
            ]}
        >
            {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
            {loadingUsers ? (
                <div style={{ textAlign: 'center' }}>
                    <Spin tip="Loading Users..." />
                </div>
            ) : (
                <List
                    dataSource={users}
                    renderItem={(user) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} src={user.avatar} />}
                                title={user.name}
                                description={user.email}
                            />
                            <Checkbox
                                value={user.id}
                                onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                            />
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default InviteUsersModal;
