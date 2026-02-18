import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import * as build from "virtual:react-router/server-build";

const app = new Hono();

// Add any additional Hono middleware here

const handler = createRequestHandler(build);
app.mount("/", (req) => handler(req));

export default app.fetch;
