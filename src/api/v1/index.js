import auth from './auth';
import dev from './dev';
import link from './link';
import s3 from './s3';
import user from './user';

export default async fastify => {
  fastify.register(auth, { prefix: '/auth' });
  fastify.register(dev, { prefix: '/dev' });
  fastify.register(link, { prefix: '/link' });
  fastify.register(s3, { prefix: '/s3' });
  fastify.register(user, { prefix: '/user' });
};
