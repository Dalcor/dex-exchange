import type { Meta, StoryObj } from "@storybook/react";

import TextArea from "@/components/atoms/TextArea";

const meta = {
  title: "Atoms/Text Area",
  component: TextArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Placeholder",
  },
};
