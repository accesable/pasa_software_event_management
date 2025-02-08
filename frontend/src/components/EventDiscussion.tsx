// src/components/EventDiscussion.tsx
import React, { useState, useEffect } from 'react';
import { List, Card, Input, Button, message, Avatar, Typography, Form, Spin, Collapse, Flex } from 'antd';
import authService from '../services/authService';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Answer, Question } from '../types';

interface EventDiscussionProps {
  eventId: string;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface UserInfo {
  name: string;
  avatar: string;
}

const EventDiscussion: React.FC<EventDiscussionProps> = ({ eventId, questions, setQuestions }) => {
  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [activeAnswerQuestionId, setActiveAnswerQuestionId] = useState<string | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  // State lưu thông tin của người dùng theo dạng: userId -> { name, avatar }
  const [userInfos, setUserInfos] = useState<Record<string, UserInfo>>({});
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchQuestionsAndUserInfos = async () => {
      setLoadingQuestions(true);
      try {
        const response = await authService.getEventQuestions(eventId) as {
          statusCode: number,
          data: { questions: Question[] },
          message?: string
        };
        if (response.statusCode === 200 && response.data.questions) {
          setQuestions(response.data.questions || []);
          // Lấy danh sách userId từ các câu hỏi và câu trả lời
          const allUserIds = new Set<string>();
          if (Array.isArray(response.data.questions)) {
            response.data.questions.forEach((q: Question) => {
              allUserIds.add(q.userId);
              if (Array.isArray(q.answers)) {
                q.answers.forEach((a: Answer) => allUserIds.add(a.userId));
              }
            });
          }
          fetchUserInfos(Array.from(allUserIds));
        } else {
          setQuestions([]);
        }
      } catch (error: any) {
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestionsAndUserInfos();
  }, [eventId, setQuestions]);

  const fetchUserInfos = async (userIds: string[]) => {
    const infosMap: Record<string, UserInfo> = {};
    for (const userId of userIds) {
      try {
        const response = await authService.getUserById(userId) as {
          statusCode: number,
          data: {
            id: string,
            email: string,
            name: string,
            avatar: string,
            lastLoginAt: string,
            createdAt: string,
            updatedAt: string
          }
        };
        if (response.statusCode === 200 && response.data) {
          infosMap[userId] = { name: response.data.name, avatar: response.data.avatar };
        } else {
          infosMap[userId] = { name: 'Unknown User', avatar: '' };
        }
      } catch (error) {
        infosMap[userId] = { name: 'Unknown User', avatar: '' };
        console.error(`Failed to fetch user info for ${userId}`, error);
      }
    }
    setUserInfos(prevInfos => ({ ...prevInfos, ...infosMap }));
  };

  const handleQuestionSubmit = async () => {
    if (!questionInput.trim()) return;
    setSubmittingQuestion(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('You need to login to ask a question.');
        return;
      }
      const response = await authService.postQuestion(eventId, questionInput, accessToken) as {
        statusCode: number,
        data: { question: Question },
        message?: string
      };
      if (response.statusCode === 201) {
        message.success('Question submitted successfully!');
        setQuestionInput('');
        setQuestions([response.data.question, ...questions]);
        // Fetch thêm thông tin của người hỏi nếu cần
        fetchUserInfos([response.data.question.userId]);
      } else {
        message.error(response.message || 'Failed to submit question');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerInput.trim() || !questionId) return;
    setSubmittingAnswer(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('You need to login to submit an answer.');
        return;
      }
      const response = await authService.postAnswer(questionId, answerInput, accessToken) as {
        statusCode: number,
        data: { question: Question },
        message?: string
      };
      if (response.statusCode === 201) {
        message.success('Answer submitted successfully!');
        setAnswerInput('');
        setActiveAnswerQuestionId(null);
        const updatedQuestions = questions.map(q =>
          q.id === questionId ? response.data.question : q
        );
        setQuestions(updatedQuestions);
        // Fetch thông tin của người vừa trả lời
        const lastAnswer = response.data.question.answers[response.data.question.answers.length - 1];
        fetchUserInfos([lastAnswer.userId]);
      } else {
        message.error(response.message || 'Failed to submit answer');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <Card title="Event Discussion" style={{ marginBottom: '20px' }}>
      {loadingQuestions ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Loading..." />
        </div>
      ) : (
        <List
          dataSource={questions}
          itemLayout="vertical"
          renderItem={(question) => (
            <List.Item
              key={question.id}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: '20px',
                borderBottom: '1px dashed #e8e8e8',
                paddingBottom: '20px'
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={userInfos[question.userId]?.avatar}
                    icon={!userInfos[question.userId]?.avatar ? <UserOutlined /> : undefined}
                  />
                }
                title={
                  <Text strong>
                    {userInfos[question.userId]?.name || 'Loading Name...'}
                  </Text>
                }
                description={<Paragraph style={{ margin: 0 }}>{question.text}</Paragraph>}
              />

              <Collapse bordered={false} defaultActiveKey={['1']} style={{ width: '100%', marginTop: '10px' }}>
                <Panel header={`Answers (${question.answers ? question.answers.length : 0})`} key="1" style={{ borderBottom: 'none' }}>
                  <List
                    className="answer-list"
                    dataSource={question.answers || []}
                    renderItem={(answer: Answer) => (
                      <List.Item
                        style={{
                          border: '1px solid #f0f0f0',
                          borderRadius: '5px',
                          padding: '10px',
                          marginBottom: '8px',
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={userInfos[answer.userId]?.avatar}
                              icon={!userInfos[answer.userId]?.avatar ? <UserOutlined /> : undefined}
                            />
                          }
                          title={<Text strong>{userInfos[answer.userId]?.name || 'Loading Name...'}</Text>}
                          description={<Paragraph style={{ margin: 0 }}>{answer.text}</Paragraph>}
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              </Collapse>

              <Button
                type="dashed"
                onClick={() => setActiveAnswerQuestionId(question.id)}
                style={{ marginTop: 16, marginBottom: 8, textAlign: 'left' }}
              >
                Answer
              </Button>
              {activeAnswerQuestionId === question.id && (
                <Form.Item style={{ width: '100%' }}>
                  <Input.TextArea
                    rows={2}
                    placeholder="Your answer..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    onPressEnter={() => handleAnswerSubmit(question.id)}
                  />
                  <Flex justify="end" gap="small" style={{ marginTop: '10px' }}>
                    <Button
                      type="primary"
                      onClick={() => handleAnswerSubmit(question.id)}
                      loading={submittingAnswer}
                    >
                      Submit
                    </Button>
                    <Button onClick={() => setActiveAnswerQuestionId(null)}>
                      Cancel
                    </Button>
                  </Flex>
                </Form.Item>
              )}
            </List.Item>
          )}
          footer={
            <Form.Item>
              <Input
                placeholder="Your question..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onPressEnter={handleQuestionSubmit}
              />
              <Button
                type="primary"
                onClick={handleQuestionSubmit}
                loading={submittingQuestion}
                style={{ marginTop: '10px' }}
              >
                Submit Question
              </Button>
            </Form.Item>
          }
        />
      )}
    </Card>
  );
};

export default EventDiscussion;
