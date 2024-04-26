import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import Checkbox from "@/components/atoms/Checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

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

    return <Checkbox {...args} handleChange={onChange} checked={checked} />;
  },
};
