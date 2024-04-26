import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import Popover from "@/components/atoms/Popover";
import SelectButton from "@/components/atoms/SelectButton";

const meta = {
  title: "Atoms/Popover",
  component: Popover,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 300,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    isOpened: false,
    children: "Button text",
  },
  render: function Render(args) {
    const [{ isOpened }, updateArgs] = useArgs<{ isOpened: boolean }>();

    return (
      <div className="p-4">
        <Popover
          placement="bottom-start"
          trigger={
            <SelectButton isOpen={isOpened} onClick={() => updateArgs({ isOpened: !isOpened })}>
              Trigger button
            </SelectButton>
          }
          setIsOpened={(isOpened) => updateArgs({ isOpened })}
          isOpened={isOpened}
        >
          <div
            style={{ width: 300 }}
            className="p-3 bg-primary-bg rounded-5 border border-secondary-border shadow-popup max-w-[500px]"
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium ad
            aliquid cumque dignissimos eaque eveniet, fugit impedit ipsam ipsum maiores modi
            officiis placeat quidem sint sunt unde vero voluptatum?!
          </div>
        </Popover>
      </div>
    );
  },
};
