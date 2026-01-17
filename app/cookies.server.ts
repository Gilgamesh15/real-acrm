import { createCookie } from "react-router";

export const cookieConsent = createCookie("cookie_acknowledged", {
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: false,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax",
});
