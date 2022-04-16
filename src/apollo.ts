import { ApolloServer } from 'apollo-server-fastify';
import {
  ApolloServerPluginDrainHttpServer,
  AuthenticationError
} from 'apollo-server-core';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { Client } from 'edgedb';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import TokenManager from './lib/tokenManager';

const getUserPayload = async (request: FastifyRequest) => {
  const { authorization } = request.headers;
  if (!authorization) throw new Error('Unauthorized: no token provided');

  const encryptedToken = authorization.slice(7);

  const payload = await TokenManager.verifyEncryptedToken(encryptedToken);
  return payload;
};

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
    context: async ({ request, reply }) => {
      try {
        await getUserPayload(request);
        return { db, request };
      } catch (exception) {
        throw new AuthenticationError(exception.message);
      }
    }
  });

  await server.start();
  app.register(server.createHandler());
};

export default registerApollo;
