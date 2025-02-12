import type { Meta, StoryObj } from '@storybook/react';

import { PostsCard } from './PostsCard.tsx';

const meta = {
  title: 'Components/Posts list',
  component: PostsCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PostsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    as: 'active',
    data: [].slice(0, 10),
    style: { width: 600 },
  },
};

export const Scheduled: Story = {
  args: {
    as: 'scheduled',
    data: [].slice(0, 10),
    style: { width: 600 },
  },
};
