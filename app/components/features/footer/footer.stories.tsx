import type { Meta, StoryObj } from "@storybook/react";

import { Footer } from "./footer";

const meta: Meta<typeof Footer> = {
  title: "Features/Footer",
  component: Footer,
};

export default meta;

export const Default: StoryObj<typeof Footer> = {
  args: {
    categoriesPromise: Promise.resolve([]),
  },
};
