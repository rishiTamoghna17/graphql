import "reflect-metadata";
import express, { Express } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { TaskResolver } from "./resolvers/task";
import { PrismaClient } from "@prisma/client";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";


const main = async () => {
  const prisma = new PrismaClient();
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [TaskResolver],
        validate: false,
      }),context: () => ({ prisma }),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    });
  
    await apolloServer.start();
    const app: Express = express();
  
    apolloServer.applyMiddleware({ app });
  
    app.get("/", (_req, res) => res.send("hello world"));
  
    const PORT =  3000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  };
  
  main().catch((err) => console.error(err));