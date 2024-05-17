import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import { CheckboxButton } from "@/components/atoms/Checkbox";

const meta = {
  title: "Atoms/Checkbox Button",
  component: CheckboxButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckboxButton>;

export default meta;
type Story = StoryObj<typeof CheckboxButton>;

export const Default: Story = {
  args: {
    checked: true,
    label: "Checkbox",
    id: "checkbox-1",
  },
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ checked: !checked });
    }

    return <CheckboxButton {...args} handleChange={onChange} checked={checked} />;
  },
};
