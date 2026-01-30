import type { Preview } from "@storybook/react-vite";
import React from "react";
import { withRouter } from "storybook-addon-remix-react-router";

import "../app/app.css";

const preview: Preview = {
  decorators: [
    // Our application is always in dark mode
    (Story) => {
      document.documentElement.classList.add("dark");
      return <Story />;
    },
    (Story, { parameters }) => {
      if (parameters.layout === "page") {
        return (
          <div className="min-h-svh max-w-screen overflow-x-hidden flex flex-col">
            <Story />
          </div>
        );
      } else {
        return <Story />;
      }
    },
    withRouter,
  ],
};

export default preview;
