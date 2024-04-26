import { useArgs } from "@storybook/client-api";
import type { Meta, StoryObj } from "@storybook/react";

import Dialog from "@/components/atoms/Dialog";
import SelectButton from "@/components/atoms/SelectButton";

const meta = {
  title: "Atoms/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 300,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    isOpen: false,
    children: "Button text",
  },
  render: function Render(args) {
    const [{ isOpened }, updateArgs] = useArgs<{ isOpened: boolean }>();

    return (
      <div className="p-4 flex items-center justify-center">
        <SelectButton
          isOpen={isOpened}
          onClick={() => updateArgs({ isOpened: true })}
          withArrow={false}
        >
          Show dialog
        </SelectButton>
        <Dialog setIsOpen={(isOpened) => updateArgs({ isOpened })} isOpen={isOpened}>
          <div
            style={{ width: 300 }}
            className="p-3 bg-primary-bg rounded-5 border border-secondary-border shadow-popup max-w-[500px]"
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium ad
            aliquid cumque dignissimos eaque eveniet, fugit impedit ipsam ipsum maiores modi
            officiis placeat quidem sint sunt unde vero voluptatum?!
          </div>
        </Dialog>
      </div>
    );
  },
};
