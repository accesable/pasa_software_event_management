// src\components\UserAvatar\UserAvatar.tsx
import { Avatar, AvatarProps, Flex, FlexProps, theme, Typography } from 'antd';
import { colourNameToHex, getNameInitials, isColorLight } from '../../utils';
import { CheckCircleFilled, UserOutlined } from '@ant-design/icons';
import { blue } from '@ant-design/colors';
import { CSSProperties } from 'react';

type Props = {
  fullName: string;
  mark?: boolean;
  size?: 'small' | 'middle' | 'large';
  verified?: boolean;
  color?: CSSProperties['color'];
  textWidth?: CSSProperties['width'];
  avatarUrl?: string | null; // Add avatarUrl prop
} & Omit<FlexProps, 'children'>;

export const UserAvatar = ({
  fullName,
  mark,
  size,
  verified,
  color,
  textWidth,
  avatarUrl, // Use avatarUrl prop
  ...others
}: Props) => {
  const {
    token: { colorPrimary },
  } = theme.useToken();

  const avatarProps: AvatarProps = {
    size: size === 'large' ? 36 : size === 'small' ? 18 : 24,
    src: avatarUrl, // Set src from avatarUrl prop
    icon: !avatarUrl ? <UserOutlined /> : undefined, // Show default icon if no avatarUrl
  };

  return (
    <Flex gap="small" align="center" {...others}>
      {mark ? (
        <Avatar
          style={{
            backgroundColor: color || colorPrimary,
            color: isColorLight(colourNameToHex(color || colorPrimary))
              ? 'black'
              : 'white',
          }}
          icon={<UserOutlined />}
          {...avatarProps}
        />
      ) : (
        <Avatar
          style={{
            backgroundColor: color || colorPrimary,
            color: isColorLight(colourNameToHex(color || colorPrimary))
              ? 'black'
              : 'white',
          }}
          {...avatarProps}
        >
          {!avatarUrl && getNameInitials(fullName)} {/* Show initials only if no avatarUrl */}
        </Avatar>
      )}
      <Typography.Text
        style={{
          fontSize: size === 'large' ? 18 : size === 'small' ? 14 : 16,
          width: textWidth || 160,
        }}
      >
        {fullName}
      </Typography.Text>
      {verified && (
        <CheckCircleFilled style={{ fontSize: 14, color: blue[6] }} />
      )}
    </Flex>
  );
};