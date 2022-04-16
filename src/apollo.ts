import { ApolloServer } from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { FastifyInstance } from 'fastify';
import { Client } from 'edgedb';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

const fastifyAppClosePlugin = (app: FastifyInstance) => {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        }
      };
    }
  };
};

const registerApollo = async (app: FastifyInstance, db: Client) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server })
    ],
    context: ({ request }) => {
      // TODO: Make authorization middleware here
      return { db, request };
    }
  });

  await server.start();
  app.register(server.createHandler());
};

export default registerApollo;
