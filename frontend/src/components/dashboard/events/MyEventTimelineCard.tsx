import { Alert, Button, CardProps, Flex, Form, Input, Modal, Timeline, Typography } from 'antd';
import {
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';
// import { ActivityTimeline } from '../../../types';
import { Card, Loader } from '../../index.ts';
import { ReactNode, useEffect, useState } from 'react';

type Props = {
  data?: [];
  loading?: boolean;
  error?: ReactNode;
} & CardProps;

export const MyEventTimelineCard = ({ data, error, loading, ...others }: Props) => {

    // Modal State for create event type
    const [activityTimeline, setActivityTimeline] = useState(data);
    useEffect(() => {
      setActivityTimeline(data);
    }, [data]);
    const [isCreateTimelineModalOpen, setIsCreateTimelineModalOpen] = useState<any>(false);
  
      const [form] = Form.useForm();
  
    const showCreateTimelineModal = () => {
      setIsCreateTimelineModalOpen(true);
    };
  
    const handleOkCreateTimeline = () => {
      setIsCreateTimelineModalOpen(false);
      form.submit()
    };
  
    const handleCancelCreateTimeline = () => {
      setIsCreateTimelineModalOpen(false);
    };

    const onFinishTimeline = (values : any) => {
      setActivityTimeline([...activityTimeline, {
        speaker_name: values.speaker_name,
        post_content: values.post_content
      }]);
      setIsCreateTimelineModalOpen(false);
    };
  return (
    <Card title="Latest activities" {...others} extra={<Button type='primary' onClick={showCreateTimelineModal}>Add New Activity</Button>}>
      {error ? (
        <Alert
          message="Error"
          description={error.toString()}
          type="error"
          showIcon
        />
      ) : loading ? (
        <Loader />
      ) : (
        <Timeline
          mode="left"
          items={activityTimeline?.map((_) => ({
            // dot:
            //   _.device_type === 'desktop' ? (
            //     <LaptopOutlined />
            //   ) : _.device_type === 'tablet' ? (
            //     <TabletOutlined />
            //   ) : (
            //     <MobileOutlined />
            //   ),
            children: (
              <Flex gap="small" vertical>
                <Typography.Paragraph
                  ellipsis={{
                    rows: 2,
                  }}
                  // title={`${_.post_content}--${_.timestamp}`}
                  style={{ marginBottom: 0 }}
                >
                  {_.post_content} - By <i>{_.speaker_name}</i>
                </Typography.Paragraph>
                {/* <Typography.Text type="secondary">
                  {_.timestamp}
                </Typography.Text> */}
              </Flex>
            ),
          }))}
        />
      )}
              <Modal title="Create Event Type" open={isCreateTimelineModalOpen} onOk={handleOkCreateTimeline} onCancel={handleCancelCreateTimeline}>
          <Form layout='vertical'
            onFinish={onFinishTimeline}
            form={form}
          >
            <Form.Item label="Speaker's Name" name="speaker_name">
              <Input placeholder="John Doe" />
            </Form.Item>
            <Form.Item label="Talk About" name="post_content">
              <Input placeholder="Software Engineering Future" />
            </Form.Item>
          </Form>
      </Modal>
    </Card>
  );
};
