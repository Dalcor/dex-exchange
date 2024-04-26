import type { Meta, StoryObj } from "@storybook/react";

import RecentTransaction from "@/components/others/RecentTransaction";
import { RecentTransactionStatus } from "@/stores/useRecentTransactionsStore";
import { exampleTitleForTwo, exampleTransaction } from "@/stories/example-data";

const meta = {
  title: "Molecules/RecentTransaction",
  component: RecentTransaction,
  tags: ["autodocs"],
} satisfies Meta<typeof RecentTransaction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingFor1Token: Story = {
  args: {
    transaction: { ...exampleTransaction, status: RecentTransactionStatus.PENDING },
  },
};

export const SuccessFor1Token: Story = {
  args: {
    transaction: exampleTransaction,
  },
};

export const ErrorFor1Token: Story = {
  args: {
    transaction: { ...exampleTransaction, status: RecentTransactionStatus.ERROR },
  },
};

export const SuccessFor2Tokens: Story = {
  args: {
    transaction: { ...exampleTransaction, title: exampleTitleForTwo },
  },
};
