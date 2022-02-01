import auth from './auth';

export default async fastify => {
  fastify.register(auth, { prefix: '/auth' });
};
