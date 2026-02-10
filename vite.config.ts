/// <reference types="vitest/config" />
import { reactRouter } from "@react-router/dev/vite";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
const isStorybook = process.argv[1]?.includes("storybook");

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild ? { input: "./server/app.ts" } : undefined,
  },
  plugins: [
    tailwindcss(),
    !isStorybook && reactRouter(),
    tsconfigPaths(),
    // Add the visualizer plugin
    // This only runs during production builds, not during development
    !isStorybook &&
      !isSsrBuild &&
      visualizer({
        open: true, // Automatically opens the report in your browser
        filename: "bundle-analysis.html", // Where to save the report
        gzipSize: true, // Shows gzipped sizes, which is what users actually download
        brotliSize: true, // Shows brotli sizes too, for even better compression
      }),
  ].filter(Boolean),
  server: {
    hmr: {
      port: 24678,
    },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**"],
    },
    host: true,
    port: 5173,
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
}));
