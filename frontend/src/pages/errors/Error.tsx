// src\pages\errors\Error.tsx
import { useRouteError } from 'react-router-dom';
import { Result, Typography } from 'antd';
import { BackBtn, RefreshBtn } from '../../components';

const { Paragraph, Text } = Typography;

type Error = unknown | any;

export const ErrorPage = () => {
  const error: Error = useRouteError();
  console.error(error);

  return (
    <Result
      status="error"
      title="Oops!"
      subTitle="Sorry, an unexpected error has occurred."
      extra={[<BackBtn key="back-btn" type="primary" />, <RefreshBtn key="refresh-btn" />]} // Added key props here
    >
      <div className="desc">
        <Paragraph>
          <Text
            strong
            style={{
              fontSize: 16,
            }}
          >
            The page you tried to open has the following error:
          </Text>
        </Paragraph>
        <Paragraph copyable>{error.statusText || error.message}</Paragraph>
      </div>
    </Result>
  );
};