import type { Preview } from "@storybook/react";
import '../src/assets/styles/globals.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Atoms', 'Buttons', 'Molecules'],
      },
    },
    backgrounds: {
      default: 'dark',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};



export default preview;
