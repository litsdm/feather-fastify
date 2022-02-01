import auth from './auth';
import user from './user';

export default async fastify => {
  fastify.register(auth, { prefix: '/auth' });
  fastify.register(user, { prefix: '/user' });
};
