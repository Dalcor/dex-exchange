import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import IconButton, { IconButtonVariant } from "@/components/buttons/IconButton";

const meta = {
  title: "Buttons/Icon Button",
  component: IconButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],

  args: { onClick: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    variant: IconButtonVariant.DEFAULT,
    iconName: "add",
  },
};

export const Control: Story = {
  args: {
    variant: IconButtonVariant.CONTROL,
    iconName: "zoom-in",
  },
};

export const Close: Story = {
  args: {
    variant: IconButtonVariant.CLOSE,
  },
};

export const Delete: Story = {
  args: {
    variant: IconButtonVariant.DELETE,
  },
};
