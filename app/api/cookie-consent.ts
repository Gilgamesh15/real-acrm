import { data } from "react-router";

import { cookieConsent } from "../cookies.server";

export async function action() {
  return data(
    { success: true },
    {
      headers: {
        "Set-Cookie": await cookieConsent.serialize("true"),
      },
    }
  );
}
