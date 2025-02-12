import type { Meta, StoryObj } from '@storybook/react';

import { ClientsTable } from './ClientsTable.tsx';

const meta = {
  title: 'Components/Dashboard/Projects/Clients',
  component: ClientsTable,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ClientsTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [].slice(0, 10),
    style: { width: 600 },
  },
};
