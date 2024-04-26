import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import DialogHeader from "@/components/atoms/DialogHeader";
import Switch from "@/components/atoms/Switch";

const meta = {
  title: "Atoms/Dialog Header",
  component: DialogHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof DialogHeader>;

export default meta;
type Story = StoryObj<typeof DialogHeader>;

export const Default: Story = {
  args: {
    title: "Dialog header title",
    onClose: () => null,
  },
};

export const WithBack: Story = {
  args: {
    title: "Dialog header title",
    onClose: () => null,
    onBack: () => null,
  },
};

export const WithParagraph: Story = {
  args: {
    title: "Dialog header title",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi assumenda, aut consectetur consequuntur dignissimos earum ex explicabo id impedit iure iusto, maiores maxime nam obcaecati possimus quas reprehenderit sunt vel.",
  },
};

export const WithSettings: Story = {
  args: {
    title: "Dialog header title",
  },
  render: function Render(args) {
    const [{ isActive }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isActive: !isActive });
    }

    return (
      <DialogHeader
        {...args}
        settings={
          <div className="flex items-center gap-2">
            <span className="text-12">Advanced mode</span>
            <Switch checked={isActive} handleChange={onChange} />
          </div>
        }
      />
    );
  },
};

export const WithAllProps: Story = {
  args: {
    title: "Dialog header title",
    onBack: () => null,
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores, dolorum, minima? At doloremque dolorum exercitationem hic id impedit inventore, minus molestias pariatur, placeat provident quod ratione, recusandae rem similique tenetur.",
  },
  render: function Render(args) {
    const [{ isActive }, updateArgs] = useArgs();

    function onChange() {
      updateArgs({ isActive: !isActive });
    }

    return (
      <DialogHeader
        {...args}
        settings={
          <div className="flex items-center gap-2">
            <span className="text-12">Advanced mode</span>
            <Switch checked={isActive} handleChange={onChange} />
          </div>
        }
      />
    );
  },
};
