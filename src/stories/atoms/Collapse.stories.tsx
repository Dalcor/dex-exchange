import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Collapse from "@/components/atoms/Collapse";
import SelectButton from "@/components/atoms/SelectButton";

const meta = {
  title: "Atoms/Collapse",
  component: Collapse,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },

  tags: ["autodocs"],
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof Collapse>;

export const Default: Story = {
  args: {
    open: false,
    children: (
      <div className="bg-secondary-bg rounded-b-5 p-3">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus at esse quaerat
        quisquam, reprehenderit sapiente suscipit. Animi, dignissimos dolore fugiat id officia
        provident voluptas? Aut deserunt dolore eaque nemo soluta.
      </div>
    ),
  },
  render: function Render(args) {
    const [{ isOpen }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isOpen: !isOpen });
    }

    return (
      <div className="p-3 rounded-5 bg-quaternary-bg">
        <div
          role="button"
          className="text-green duration-200 bg-secondary-bg hover:bg-green-bg rounded-t-5 p-3"
          onClick={onChange}
        >
          Toggle collapse
        </div>
        <Collapse {...args} open={isOpen} />
      </div>
    );
  },
};
