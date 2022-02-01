import 'regenerator-runtime/runtime';
import Fastify from 'fastify';

import initialize from './initialize';
import api from './api';

const fastify = Fastify({ logger: false });

const PORT = process.env.PORT || 8080;

initialize(async ({ db }) => {
  try {
    fastify.decorateRequest('db', { getter: () => db });

    fastify.register(api, { prefix: '/api' });

    await fastify.listen(PORT, '0.0.0.0');
    console.log(`📡 Listening on port ${PORT} 🚀`);
  } catch (exception) {
    fastify.log.error(exception);
    process.exit(1);
  }
});
