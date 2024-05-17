import type { Meta, StoryObj } from "@storybook/react";

import TextAreaField from "@/components/atoms/TextAreaField";

const meta = {
  title: "Atoms/Text Area Field",
  component: TextAreaField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextAreaField>;

export default meta;
type Story = StoryObj<typeof TextAreaField>;

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
