import {ApolloServer} from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import {buildSchema} from "type-graphql";
import {createConnection} from "typeorm";
import {__PROD__, COOKIE_NAME} from "./constants";
import {Post} from "./entities/Post";
import {Updoot} from "./entities/Updoot";
import {User} from "./entities/User";
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
import {ResolverContext} from "./types";
import {createUpdootLoader} from "./utils/createUpdootLoader";
import {createUserLoader} from "./utils/createUserLoader";

const TEN_YEARS_IN_MILLS = 1000 * 60 * 60 * 24 * 365 * 10;

const main = async () => {
  // const connection = await createConnection({
  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });
  // await connection.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.LIREDDIT_CORS_ORIGIN,
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
        secure: __PROD__,
        sameSite: "lax",
        domain: __PROD__ ? ".lazzaroni.io" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.LIREDDIT_SESSION_SECRET,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({req, res}): ResolverContext =>
      ({
        req,
        res,
        redis,
        userLoader: createUserLoader(),
        updootLoader: createUpdootLoader(),
      } as ResolverContext),
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(parseInt(process.env.PORT, 10), () => {
    console.log("Server started on localhost:" + process.env.PORT);
  });
};

main().catch((error) => {
  console.error(error);
});
