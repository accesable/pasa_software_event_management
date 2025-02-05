// src/pages/authentication/Welcome.tsx
import { Button, Flex, Typography } from 'antd';
import { Logo } from '../../components';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../constants';

const { Title, Text } = Typography;

export const WelcomePage = () => {
  return (
    <Flex vertical gap="large" align="center" justify="center" style={{ height: '80vh' }}>
      <Logo color="blue" />
      <Title level={2} className="m-0">Welcome to Our App</Title>
      <Text style={{ fontSize: 18 }}>
        Your account has been created successfully.
      </Text>
      <Link to={PATH_DASHBOARD.default}>
        <Button type="primary" size="middle">
          Go to Homepage
        </Button>
      </Link>
    </Flex>
  );
};
