import {Request, Response} from "express";
import {Redis} from "ioredis";

export type Context = {
  req: {session: Express.Session} & Request;
  res: Response;
  redis: Redis;
};
