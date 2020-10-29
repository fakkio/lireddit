import {ApolloServer} from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import {buildSchema} from "type-graphql";
import {createConnection} from "typeorm";
import {COOKIE_NAME} from "./constants";
import {Post} from "./entities/Post";
import {Updoot} from "./entities/Updoot";
import {User} from "./entities/User";
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import {ResolverContext} from "./types";

const TEN_YEARS_IN_MILLS = 1000 * 60 * 60 * 24 * 365 * 10;

const main = async () => {
  // const connection = await createConnection({
  const conn = await createConnection({
    username: "postgres",
    password: "postgres",
    type: "postgres",
    database: "lireddit",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });
  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: TEN_YEARS_IN_MILLS,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "iLrU6ocNYICbw3z7G0kGma2wEj3IGxS7rEbtOfqgGlURbpEM95REjWpu90HaMg4",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): ResolverContext =>
      ({req, res, redis} as ResolverContext),
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
};

main().catch((error) => {
  console.error(error);
});
