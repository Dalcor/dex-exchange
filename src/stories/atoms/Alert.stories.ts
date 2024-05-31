import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Alert from "../../components/atoms/Alert";

const meta = {
  title: "Atoms/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

export const Success: Story = {
  args: {
    text: "Max base fee can not be lower than current base fee",
  },
};

export const Error: Story = {
  args: {
    text: "Max base fee can not be lower than current base fee",
    type: "error",
  },
};

export const Warning: Story = {
  args: {
    text: "Max base fee can not be lower than current base fee",
    type: "warning",
  },
};

export const Info: Story = {
  args: {
    text: "Max base fee can not be lower than current base fee",
    type: "info",
  },
};

export const InfoBorder: Story = {
  args: {
    text: "Max base fee can not be lower than current base fee",
    type: "info-border",
  },
};
