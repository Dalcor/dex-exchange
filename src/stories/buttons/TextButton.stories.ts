import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TextButton from "@/components/buttons/TextButton";

const meta = {
  title: "Buttons/Text Button",
  component: TextButton,
  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof TextButton>;

export const Default: Story = {
  args: {
    children: "Configure automatically",
    endIcon: "settings",
  },
};

export const WithoutIcon: Story = {
  args: {
    children: "Configure automatically",
  },
};
