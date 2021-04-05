import Fastify from 'fastify';

import initialize from './initialize';
import api from './api/v1';

const fastify = Fastify({ logger: true });

initialize(() => {
  fastify.register(api, { prefix: '/api' });

  (async () => {
    try {
      await fastify.listen(8080);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  })();
});
