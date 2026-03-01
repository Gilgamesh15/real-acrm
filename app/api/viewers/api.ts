import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import {
  getViewerCounts,
  recordHeartbeat,
  removeViewer,
} from "~/lib/viewers.server";

const MAX_PIECE_IDS = 50;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pieceIdsParam = url.searchParams.get("pieceIds");

  if (!pieceIdsParam) {
    return Response.json(
      { counts: {} },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const pieceIds = pieceIdsParam.split(",").slice(0, MAX_PIECE_IDS);
  const counts = await getViewerCounts(pieceIds);

  return Response.json(
    { counts },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { pieceId?: string; sessionId?: string; action?: string };

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    // sendBeacon with Blob may send as text/plain
    const text = await request.text();
    try {
      body = JSON.parse(text);
    } catch {
      return Response.json({ count: 0 });
    }
  }

  const { pieceId, sessionId, action: actionType } = body;

  if (!pieceId || !sessionId) {
    return Response.json({ count: 0 });
  }

  if (actionType === "leave") {
    await removeViewer(pieceId, sessionId);
    return Response.json({ ok: true });
  }

  // Default: heartbeat
  const count = await recordHeartbeat(pieceId, sessionId);
  return Response.json({ count });
}
