import type { Meta, StoryObj } from "@storybook/react";

import TextField from "@/components/atoms/TextField";

const meta = {
  title: "Atoms/Text Field",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: "Default text field",
    placeholder: "Placeholder text",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Default text field",
    helperText: "This is helper text",
    placeholder: "Placeholder text",
  },
};

export const WithError: Story = {
  args: {
    label: "Default text field",
    error: "This is error text",
    placeholder: "Placeholder text",
  },
};
export const WithWarning: Story = {
  args: {
    label: "Default text field",
    warning: "This is warning text",
    placeholder: "Placeholder text",
  },
};

export const WithTooltip: Story = {
  args: {
    label: "Default text field",
    tooltipText: "This is tooltip text",
    placeholder: "Placeholder text",
  },
};
