import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "@upstash/ratelimit",
});

export async function ratelimiter(req, res, next) {
  const identifier = req.ip;
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return res
      .status(429)
      .json({ message: "Too many req please try again later" });
  }

  next();
}
