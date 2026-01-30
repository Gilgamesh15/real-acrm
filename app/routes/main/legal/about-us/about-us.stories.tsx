import type { Meta, StoryObj } from "@storybook/react";

import AboutUsPage from "./about-us.page";

const meta: Meta<typeof AboutUsPage> = {
  parameters: {
    layout: "page",
  },
  component: AboutUsPage,
};

export default meta;

export const Default: StoryObj<typeof AboutUsPage> = {};
