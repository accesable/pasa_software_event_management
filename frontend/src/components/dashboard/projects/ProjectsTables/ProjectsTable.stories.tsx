import type { Meta, StoryObj } from '@storybook/react';

import { ProjectsTable } from './ProjectsTable.tsx';

const meta = {
  title: 'Components/Dashboard/Projects/Projects table',
  component: ProjectsTable,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProjectsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [].slice(0, 10),
    style: { width: 1000 },
  },
};
