import Fastify from 'fastify';
import { ApolloServer } from 'apollo-server-fastify';
import { PubSub } from 'graphql-subscriptions';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from 'graphql-tools';

import initialize from './initialize';
import models from './db';
import resolvers from './resolvers';
import typeDefs from './schema';
import api from './api/v1';

const fastify = Fastify({ logger: true });

const PORT = 8080;

initialize(() => {
  const pubsub = new PubSub();
  const context = {
    models,
    pubsub
  };
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context
  });

  (async () => {
    try {
      fastify.register(server.createHandler());
      fastify.register(api, { prefix: '/api' });
      await fastify.listen(PORT, '0.0.0.0');

      // eslint-disable-next-line no-new
      new SubscriptionServer(
        {
          schema,
          execute,
          subscribe,
          onConnect: () => context
        },
        {
          server: fastify.server,
          path: '/graphql'
        }
      );
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  })();
});
