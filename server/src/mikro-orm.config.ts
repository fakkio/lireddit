import {MikroORM} from "@mikro-orm/core";
import path from "path";
import {Post} from "./entities/Post";
import {User} from "./entities/User";

export default {
  user: "postgres",
  password: "postgres",
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  debug: process.env.NODE_ENV !== "production",
} as Parameters<typeof MikroORM.init>[0];
