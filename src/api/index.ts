import auth from './auth';
import user from './user';
import dev from './dev';

const { NODE_ENV } = process.env;

export default async fastify => {
  fastify.register(auth, { prefix: '/auth' });
  fastify.register(user, { prefix: '/user' });

  if (NODE_ENV === 'development') fastify.register(dev, { prefix: '/dev' });
};
