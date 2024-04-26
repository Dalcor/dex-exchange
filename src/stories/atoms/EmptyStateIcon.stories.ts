import type { Meta, StoryObj } from "@storybook/react";

import EmptyStateIcon from "@/components/atoms/EmptyStateIcon";

const meta = {
  title: "Atoms/EmptyStateIcon",
  component: EmptyStateIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyStateIcon>;

export default meta;
type Story = StoryObj<typeof EmptyStateIcon>;

export const Wallet: Story = {
  args: {
    iconName: "wallet",
  },
};

export const Assets: Story = {
  args: {
    iconName: "assets",
  },
};

export const Edit: Story = {
  args: {
    iconName: "edit",
  },
};
