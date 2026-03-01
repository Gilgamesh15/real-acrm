import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
  redis = new Redis({ url, token });
}

export { redis };
