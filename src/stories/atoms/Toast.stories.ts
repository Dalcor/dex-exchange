import type { Meta, StoryObj } from "@storybook/react";

import Toast from "@/components/atoms/Toast";

const meta = {
  title: "Atoms/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    text: "Success toast!",
  },
};

export const Error: Story = {
  args: {
    text: "Error toast!",
    type: "error",
  },
};

export const Warning: Story = {
  args: {
    text: "Warning toast!",
    type: "warning",
  },
};

export const Info: Story = {
  args: {
    text: "Info toast!",
    type: "info",
  },
};
