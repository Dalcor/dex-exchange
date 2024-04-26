import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Button, { ButtonColor, ButtonSize, ButtonVariant } from "@/components/buttons/Button";

const meta = {
  title: "Buttons/Button",
  component: Button,

  tags: ["autodocs"],

  args: { onClick: fn() },
  argTypes: {
    variant: {
      options: [ButtonVariant.CONTAINED, ButtonVariant.OUTLINED],
      control: {
        type: "radio",
        labels: {
          [ButtonVariant.CONTAINED]: "CONTAINED",
          [ButtonVariant.OUTLINED]: "OUTLINED",
        },
      },
    },
    size: {
      options: [
        ButtonSize.EXTRA_SMALL,
        ButtonSize.SMALL,
        ButtonSize.MEDIUM,
        ButtonSize.LARGE,
        ButtonSize.EXTRA_LARGE,
      ],
      control: {
        type: "radio",
        labels: {
          [ButtonSize.EXTRA_SMALL]: "EXTRA_SMALL",
          [ButtonSize.SMALL]: "SMALL",
          [ButtonSize.MEDIUM]: "MEDIUM",
          [ButtonSize.LARGE]: "LARGE",
          [ButtonSize.EXTRA_LARGE]: "EXTRA_LARGE",
        },
      },
    },
    colorScheme: {
      options: [ButtonColor.GREEN, ButtonColor.RED],
      control: {
        type: "radio",
        labels: {
          [ButtonColor.GREEN]: "GREEN",
          [ButtonColor.RED]: "RED",
        },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: ButtonVariant.CONTAINED,
    children: "Button",
  },
};
