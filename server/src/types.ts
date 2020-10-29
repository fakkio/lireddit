import {Request, Response} from "express";
import {Redis} from "ioredis";

export type ResolverContext = {
  req: {session: Express.Session} & Request;
  res: Response;
  redis: Redis;
};
