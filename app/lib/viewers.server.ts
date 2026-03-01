import { redis } from "./redis.server";

const KEY_PREFIX = "viewers:";
const ACTIVE_WINDOW_SECONDS = 30;
const CLEANUP_WINDOW_SECONDS = 45;
const EXPIRE_SECONDS = 60;

function key(pieceId: string) {
  return `${KEY_PREFIX}${pieceId}`;
}

export async function recordHeartbeat(
  pieceId: string,
  sessionId: string
): Promise<number> {
  if (!redis) return 0;

  try {
    const now = Math.floor(Date.now() / 1000);
    const k = key(pieceId);

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(k, "-inf", now - CLEANUP_WINDOW_SECONDS);
    pipeline.zadd(k, { score: now, member: sessionId });
    pipeline.zcount(k, now - ACTIVE_WINDOW_SECONDS, "+inf");
    pipeline.expire(k, EXPIRE_SECONDS);

    const results = await pipeline.exec();
    return (results[2] as number) ?? 0;
  } catch {
    return 0;
  }
}

export async function getViewerCounts(
  pieceIds: string[]
): Promise<Record<string, number>> {
  if (!redis || pieceIds.length === 0) return {};

  try {
    const now = Math.floor(Date.now() / 1000);
    const pipeline = redis.pipeline();

    for (const pieceId of pieceIds) {
      pipeline.zcount(key(pieceId), now - ACTIVE_WINDOW_SECONDS, "+inf");
    }

    const results = await pipeline.exec();
    const counts: Record<string, number> = {};

    for (let i = 0; i < pieceIds.length; i++) {
      const count = results[i] as number;
      if (count > 0) {
        counts[pieceIds[i]] = count;
      }
    }

    return counts;
  } catch {
    return {};
  }
}

export async function removeViewer(
  pieceId: string,
  sessionId: string
): Promise<void> {
  if (!redis) return;

  try {
    await redis.zrem(key(pieceId), sessionId);
  } catch {
    // silent degradation
  }
}
